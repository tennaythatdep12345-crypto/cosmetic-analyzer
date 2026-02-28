// Express server using direct REST API calls to Gemini
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import { jsonrepair } from "jsonrepair";

dotenv.config();

/**
 * Robustly extract and parse JSON from an AI text response.
 * Tries direct parse → strip markdown → find first JSON object → jsonrepair.
 */
function extractAndParseJSON(text) {
    // 1. Direct parse
    try { return JSON.parse(text); } catch (_) { /* continue */ }

    // 2. Strip ```json ... ``` or ``` ... ``` code fences
    const fenceMatch = text.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
    if (fenceMatch) {
        try { return JSON.parse(fenceMatch[1]); } catch (_) { /* continue */ }
        try { return JSON.parse(jsonrepair(fenceMatch[1])); } catch (_) { /* continue */ }
    }

    // 3. Extract the outermost { ... } block
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start !== -1 && end !== -1 && end > start) {
        const candidate = text.slice(start, end + 1);
        try { return JSON.parse(candidate); } catch (_) { /* continue */ }
        try { return JSON.parse(jsonrepair(candidate)); } catch (_) { /* continue */ }
    }

    // 4. Last resort: repair the whole text
    try { return JSON.parse(jsonrepair(text)); } catch (_) { /* continue */ }

    throw new Error("Unable to extract valid JSON from AI response");
}

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: "15mb" }));

const PORT = process.env.PORT || 3000;
const API_KEY = process.env.GEMINI_API_KEY;

if (!API_KEY) {
    console.warn("⚠️  WARNING: GEMINI_API_KEY not set. Please set it in .env file");
}

const unavailablePattern = /data unavailable|no data available|chưa có dữ liệu|không có dữ liệu|non disponible|indisponible/i;

const riskScore = { low: 1, moderate: 2, medium: 2, high: 3 };

const t = {
    en: {
        riskSentence: (risk, mechanism, impact, context) => `${capitalize(risk)} risk due to ${mechanism} leading to ${impact}${context ? ` under ${context} conditions` : ''}.`,
        inciVerification: 'Run full INCI verification against supplier documentation and regional annex constraints.',
        oxidationTest: 'Perform oxidation stress and light-protection challenge with time-point assay.',
        phWindow: 'Define and lock pH operating window with drift acceptance criteria.',
        tempControl: 'Control processing temperature and use closed transfer to minimize volatile loss.',
        scaleUpCheck: 'Run pilot-scale hold-time and thermal history comparison before commercial transfer.',
        expertReason: 'Mechanistic risks and/or uncertainty require formulation and regulatory specialist review.'
    },
    vi: {
        riskSentence: (risk, mechanism, impact, context) => `Rủi ro ${risk} do ${mechanism}, dẫn đến ${impact}${context ? ` trong điều kiện ${context}` : ''}.`,
        inciVerification: 'Thực hiện xác minh INCI đầy đủ theo hồ sơ nhà cung cấp và yêu cầu phụ lục khu vực.',
        oxidationTest: 'Thực hiện thử thách oxy hóa và ánh sáng theo mốc thời gian định lượng.',
        phWindow: 'Thiết lập và khóa cửa sổ pH vận hành với tiêu chí chấp nhận độ trôi.',
        tempControl: 'Kiểm soát nhiệt độ gia công và dùng hệ kín để giảm thất thoát chất dễ bay hơi.',
        scaleUpCheck: 'Thực hiện đối chiếu hold-time và lịch sử nhiệt giữa pilot và scale-up thương mại.',
        expertReason: 'Rủi ro cơ chế và/hoặc bất định dữ liệu cần chuyên gia công thức & regulatory rà soát.'
    },
    fr: {
        riskSentence: (risk, mechanism, impact, context) => `Risque ${risk} dû à ${mechanism}, entraînant ${impact}${context ? ` sous conditions ${context}` : ''}.`,
        inciVerification: 'Réaliser une vérification INCI complète avec les dossiers fournisseurs et contraintes régionales.',
        oxidationTest: 'Réaliser un stress oxydatif et photo-stabilité avec points de mesure.',
        phWindow: 'Définir et verrouiller la fenêtre pH avec critères d’acceptation de dérive.',
        tempControl: 'Contrôler la température procédé et utiliser un transfert fermé pour limiter les pertes volatiles.',
        scaleUpCheck: 'Exécuter une comparaison pilote vs industriel sur hold-time et historique thermique.',
        expertReason: 'Les risques mécanistiques et/ou incertitudes nécessitent une revue experte formulation/réglementaire.'
    }
};

function capitalize(value = '') {
    return value ? value.charAt(0).toUpperCase() + value.slice(1) : value;
}

function normalizeIngredient(value = '') {
    return value.toLowerCase().replace(/\s+/g, ' ').trim();
}

function maxRisk(...levels) {
    return levels.reduce((best, current) => (riskScore[current] || 0) > (riskScore[best] || 0) ? current : best, 'low');
}

function hasMeaningfulData(value) {
    if (value === null || value === undefined) return false;
    if (typeof value === 'string') return value.trim().length > 0 && !unavailablePattern.test(value);
    if (Array.isArray(value)) return value.length > 0 && value.some(hasMeaningfulData);
    if (typeof value === 'object') return Object.values(value).some(hasMeaningfulData);
    return true;
}

function mergePreferExisting(existing, generated) {
    if (!hasMeaningfulData(existing)) return generated;
    if (!hasMeaningfulData(generated)) return existing;
    if (Array.isArray(existing) && Array.isArray(generated)) return existing.length ? existing : generated;
    if (typeof existing === 'object' && typeof generated === 'object' && !Array.isArray(existing) && !Array.isArray(generated)) {
        const merged = { ...generated, ...existing };
        for (const key of Object.keys(generated)) {
            merged[key] = mergePreferExisting(existing[key], generated[key]);
        }
        return merged;
    }
    return existing;
}

const ingredientKnowledgeDB = [
    {
        id: 'menthol',
        match: ['menthol'],
        riskMechanisms: [
            { type: 'volatility', risk: 'moderate', impact: 'concentration drift', rationale: 'high vapor pressure can reduce retained dose over time', context: 'elevated temperature or open mixing' }
        ],
        stabilityConcerns: [
            { type: 'volatility', risk: 'moderate', rationale: 'evaporation can change concentration over shelf-life and during processing' }
        ],
        techTransferSensitivities: [
            { area: 'mixing_order', step: 'Add menthol in cool-down under closed vessel', risk_if_wrong: 'loss by evaporation and variable assay', rationale: 'minimizes vapor loss during scale-up transfer' }
        ],
        regulatoryAttentionFlags: [{ flag: 'potential_irritant', rationale: 'cooling terpene can increase sensory irritation in sensitive matrices' }],
        processRisk: {
            moisture_sensitivity: { level: 'low', rationale: 'menthol is lipophilic and not significantly impacted by moisture exposure' },
            mixing_shear_sensitivity: { level: 'low', rationale: 'no shear-sensitive structure; main risk is vapor loss not mechanical degradation' },
            storage_stability_concern: { level: 'moderate', rationale: 'volatile at room temperature; packaging integrity is critical for assay maintenance' },
            rehydration_behavior: { relevant: false, notes: 'not a powder excipient; supplied as crystals or dissolved in carrier' },
            dry_vs_hydrated_stability: { concern: 'volatile loss in both phases', risk: 'moderate' }
        },
        scaleUpRisk: {
            mixing_time_sensitivity: { level: 'moderate', rationale: 'extended mixing time in open vessels increases cumulative evaporative loss' },
            temperature_excursion_risk: { level: 'high', rationale: 'elevated temperature directly amplifies vapor pressure and accelerates assay drift' },
            ph_gradient_risk: { level: 'low', rationale: 'pH insensitive compound; gradient risk is not applicable' },
            dispersion_uniformity_risk: { level: 'low', rationale: 'dissolves readily in lipid or hydroalcoholic phase; uniform distribution expected' },
            activity_loss_during_scaleup: { likelihood: 'moderate', rationale: 'concentration loss via evaporation is the dominant scale-up risk' }
        },
        regulatoryImpact: {
            stability_dependent_claims: { applicable: true, rationale: 'cooling/refreshing sensory claims depend on retained menthol concentration; drift invalidates labeling' },
            stability_data_required: true,
            labeling_risk: { level: 'moderate', notes: ['Sensory claim invalidation if assay drifts below effective threshold', 'Possible irritation warnings required in some markets at higher concentrations'] },
            classification_clarity: { level: 'moderate', rationale: 'classified cosmetic in most markets but pharmacopoeial grade used in some medicinal products; dual-use ambiguity possible' }
        },
        decisionUncertainty: {
            data_completeness: 'partial',
            evaluation_reliability: 'medium',
            missing_excipient_impact: 'moderate',
            safety_margin_uncertainty: 'moderate',
            scientific_confidence: 'medium',
            icq_q9_risk_rating: 'moderate',
            uncertainty_drivers: ['Actual concentration in formulation unknown from image', 'Packaging material permeability affects real storage loss rate', 'Co-solvents and carrier system influence volatility behavior']
        }
    },
    {
        id: 'ascorbic',
        match: ['ascorbic acid', 'vitamin c', 'sodium ascorbyl phosphate', 'ascorbyl glucoside'],
        riskMechanisms: [
            { type: 'oxidation', risk: 'high', impact: 'potency loss and color shift', rationale: 'oxidative degradation in presence of oxygen/light/metal ions', context: 'air exposure and light' },
            { type: 'ph_instability', risk: 'moderate', impact: 'reduced efficacy outside acidic window', rationale: 'active form stability is pH-dependent', context: 'pH drift during storage' }
        ],
        stabilityConcerns: [
            { type: 'light_sensitivity', risk: 'high', rationale: 'light accelerates oxidation pathways in vitamin C systems' },
            { type: 'oxidation', risk: 'high', rationale: 'oxygen exposure can rapidly reduce active potency' }
        ],
        techTransferSensitivities: [
            { area: 'thermal', ingredient_or_system: 'Vitamin C system', risk_level: 'moderate', rationale: 'thermal load accelerates oxidation kinetics' },
            { area: 'shear', ingredient_or_system: 'Vitamin C solution phase', risk_level: 'low', rationale: 'excessive aeration during shear can increase oxygen pickup' }
        ],
        regulatoryAttentionFlags: [{ flag: 'functional_classification', rationale: 'active claim substantiation should align with actual retained potency over shelf-life' }],
        processRisk: {
            moisture_sensitivity: { level: 'high', rationale: 'aqueous dissolves vitamin C; moisture present in mixing environment accelerates hydrolytic and oxidative pathways' },
            mixing_shear_sensitivity: { level: 'low', rationale: 'no mechanical structure sensitive to shear; risk is dissolved oxygen intake during high-speed mixing' },
            storage_stability_concern: { level: 'high', rationale: 'oxidative degradation is rapid; requires oxygen-barrier packaging and antioxidant co-formulation' },
            rehydration_behavior: { relevant: true, notes: 'powder forms (sodium ascorbyl phosphate) must dissolve fully; incomplete hydration creates local concentration hotspots' },
            dry_vs_hydrated_stability: { concern: 'more stable in dry/anhydrous phase; aqueous solutions accelerate degradation', risk: 'high' }
        },
        scaleUpRisk: {
            mixing_time_sensitivity: { level: 'moderate', rationale: 'longer mixing time increases cumulative oxygen exposure at scale' },
            temperature_excursion_risk: { level: 'high', rationale: 'temperature accelerates oxidation kinetics; even brief hot spots reduce potency' },
            ph_gradient_risk: { level: 'moderate', rationale: 'pH gradients during dissolution or neutralization can create instability zones' },
            dispersion_uniformity_risk: { level: 'moderate', rationale: 'powder forms require thorough dissolution verification; dry pockets retain different reactivity' },
            activity_loss_during_scaleup: { likelihood: 'high', rationale: 'potency loss of 10–30% during commercial batch processing reported without proper oxygen exclusion' }
        },
        regulatoryImpact: {
            stability_dependent_claims: { applicable: true, rationale: 'antioxidant and brightening claims are potency-dependent; label claims are invalid if retained concentration falls below active threshold' },
            stability_data_required: true,
            labeling_risk: { level: 'moderate', notes: ['Efficacy claim must be supported by end-of-shelf-life assay data', 'Some markets classify high-concentration vitamin C as a borderline active requiring dossier support'] },
            classification_clarity: { level: 'moderate', rationale: 'cosmetic functional ingredient but active claim positioning may trigger quasi-drug classification in some jurisdictions (e.g. Japan, Korea)' }
        },
        decisionUncertainty: {
            data_completeness: 'partial',
            evaluation_reliability: 'medium',
            missing_excipient_impact: 'high',
            safety_margin_uncertainty: 'moderate',
            scientific_confidence: 'medium',
            icq_q9_risk_rating: 'high',
            uncertainty_drivers: ['Derivative form (sodium ascorbyl phosphate vs L-ascorbic acid) dramatically changes stability profile', 'Antioxidant co-formulation (tocopherol, ferulic) substantially shifts risk', 'Headspace and packaging oxygen level unknown from label image']
        }
    },
    {
        id: 'retinoid',
        match: ['retinol', 'retinal', 'retinyl palmitate', 'tretinoin'],
        riskMechanisms: [
            { type: 'light_temperature', risk: 'high', impact: 'degradation and efficacy loss', rationale: 'retinoid structures are photolabile and heat sensitive', context: 'light and elevated temperature' },
            { type: 'oxidation', risk: 'high', impact: 'oxidative decomposition', rationale: 'unsaturated structure oxidizes without strong antioxidant/packaging controls', context: 'oxygen-rich headspace' }
        ],
        stabilityConcerns: [
            { type: 'light_sensitivity', risk: 'high', rationale: 'retinoids degrade under UV/visible exposure' },
            { type: 'temperature_sensitivity', risk: 'high', rationale: 'higher temperature accelerates retinoid decomposition' }
        ],
        techTransferSensitivities: [
            { area: 'thermal', ingredient_or_system: 'Retinoid phase', risk_level: 'high', rationale: 'avoid prolonged heat during bulk hold and transfer' }
        ],
        regulatoryAttentionFlags: [{ flag: 'restricted_use', rationale: 'retinoid-containing products often require stricter claims and usage controls' }],
        processRisk: {
            moisture_sensitivity: { level: 'moderate', rationale: 'retinoids are oil-soluble but trace water in lipid phase can catalyze hydrolysis of ester forms (retinyl palmitate)' },
            mixing_shear_sensitivity: { level: 'low', rationale: 'no direct shear damage; risk is aeration and resulting oxidation during high-speed mixing' },
            storage_stability_concern: { level: 'high', rationale: 'photolability and thermal sensitivity require opaque/UV-protective packaging and cold chain management' },
            rehydration_behavior: { relevant: false, notes: 'lipophilic; not relevant for powder rehydration scenarios' },
            dry_vs_hydrated_stability: { concern: 'more stable in anhydrous lipid carrier; aqueous exposure accelerates ester hydrolysis', risk: 'high' }
        },
        scaleUpRisk: {
            mixing_time_sensitivity: { level: 'moderate', rationale: 'prolonged mixing under light or elevated temperature degrades photolabile structures' },
            temperature_excursion_risk: { level: 'high', rationale: 'retinoids are among the most temperature-sensitive actives; even seconds of overheating at scale reduces potency' },
            ph_gradient_risk: { level: 'low', rationale: 'pH influence is indirect; formulation is typically anhydrous or emulsion without strong pH shift' },
            dispersion_uniformity_risk: { level: 'moderate', rationale: 'encapsulated or suspended retinoids at scale require verified homogeneity before packaging' },
            activity_loss_during_scaleup: { likelihood: 'high', rationale: 'thermal hold-time during transfer and fill-finish stages are critical CCP defined for retinoid CMC' }
        },
        regulatoryImpact: {
            stability_dependent_claims: { applicable: true, rationale: 'anti-aging and skin renewal claims depend entirely on retained active retinoid concentration' },
            stability_data_required: true,
            labeling_risk: { level: 'high', notes: ['Retinoids restricted or require concentration limits in EU (Regulation 2022/1179)', 'Some derivatives (tretinoin) classified as prescription-only in many markets', 'Use-by-date accuracy depends on verified shelf-life stability data'] },
            classification_clarity: { level: 'ambiguous', rationale: 'retinol is cosmetic; tretinoin is drug in most markets; retinal sits in grey zone; classification depends on form, concentration, and local regulation' }
        },
        decisionUncertainty: {
            data_completeness: 'partial',
            evaluation_reliability: 'medium',
            missing_excipient_impact: 'high',
            safety_margin_uncertainty: 'high',
            scientific_confidence: 'medium',
            icq_q9_risk_rating: 'high',
            uncertainty_drivers: ['Retinoid form (retinol vs retinal vs tretinoin) determines classification and risk profile entirely', 'Encapsulation system (liposome, microsphere) changes stability behavior', 'Antioxidant blend and oxygen barrier packaging level unknown']
        }
    },
    {
        id: 'benzoyl_peroxide',
        match: ['benzoyl peroxide'],
        riskMechanisms: [
            { type: 'oxidation', risk: 'high', impact: 'co-active degradation and instability', rationale: 'strong oxidizing behavior can degrade redox-sensitive actives', context: 'co-formulation with sensitive actives' },
            { type: 'heat_degradation', risk: 'moderate', impact: 'faster decomposition under thermal stress', rationale: 'peroxide systems are temperature sensitive', context: 'hot processing and long hold-time' }
        ],
        stabilityConcerns: [
            { type: 'oxidation_reactivity', risk: 'high', rationale: 'reactive peroxide chemistry can destabilize nearby actives' }
        ],
        techTransferSensitivities: [
            { area: 'mixing_order', step: 'Isolate oxidizing phase and avoid early contact with redox-sensitive actives', risk_if_wrong: 'premature degradation during manufacturing', rationale: 'controls reactive contact time' }
        ],
        regulatoryAttentionFlags: [{ flag: 'potential_irritant', rationale: 'known irritancy potential at higher active levels' }],
        processRisk: {
            moisture_sensitivity: { level: 'moderate', rationale: 'moisture contact can destabilize peroxide suspension and trigger premature decomposition' },
            mixing_shear_sensitivity: { level: 'high', rationale: 'high shear can cause friction and localized thermal hotspots that trigger exothermic peroxide decomposition' },
            storage_stability_concern: { level: 'high', rationale: 'peroxide systems have inherent decomposition risk under temperature stress; storage temperature control is mandatory' },
            rehydration_behavior: { relevant: true, notes: 'supplied as powder or paste; wetting with oxidizable solvents is hazardous; controlled dispersion protocol required' },
            dry_vs_hydrated_stability: { concern: 'dry form is more stable but higher explosion risk; hydrated suspension more controlled but degrades faster', risk: 'high' }
        },
        scaleUpRisk: {
            mixing_time_sensitivity: { level: 'high', rationale: 'extended contact time with redox-sensitive actives in large vessels increases cumulative degradation exposure' },
            temperature_excursion_risk: { level: 'high', rationale: 'exothermic decomposition risk increases at scale; mixing equipment hot-spots are higher risk in industrial vessels' },
            ph_gradient_risk: { level: 'moderate', rationale: 'pH affects peroxide decomposition rate; local pH variations in manufacturing environment can destabilize' },
            dispersion_uniformity_risk: { level: 'high', rationale: 'non-uniform peroxide distribution creates zones of over-oxidation and under-dose' },
            activity_loss_during_scaleup: { likelihood: 'high', rationale: 'peroxide degradation during processing is a well-documented CMC risk; in-process and release assay required' }
        },
        regulatoryImpact: {
            stability_dependent_claims: { applicable: true, rationale: 'acne-treatment efficacy is directly dependent on verified active peroxide concentration at use' },
            stability_data_required: true,
            labeling_risk: { level: 'high', notes: ['Classified as OTC drug active in the US (21 CFR 333.310)', 'Requires drug product registration and GMP in many markets', 'Concentration limits and safety warnings are market-specific'] },
            classification_clarity: { level: 'ambiguous', rationale: 'drug in US and some EU markets; cosmetic/personal-care in others; dual-track registration may be required' }
        },
        decisionUncertainty: {
            data_completeness: 'limited',
            evaluation_reliability: 'low',
            missing_excipient_impact: 'high',
            safety_margin_uncertainty: 'high',
            scientific_confidence: 'low',
            icq_q9_risk_rating: 'high',
            uncertainty_drivers: ['Active concentration unknown; regulatory classification threshold is concentration-dependent', 'Excipient oxidizability profile unknown; co-formulation risks cannot be fully modeled', 'Manufacturing equipment compatibility with oxidizing agent not determinable from ingredient list']
        }
    },
    {
        id: 'niacinamide',
        match: ['niacinamide'],
        riskMechanisms: [
            { type: 'ph_instability', risk: 'moderate', impact: 'conversion to nicotinic acid and irritation drift', rationale: 'acidic pH and heat can increase hydrolytic conversion', context: 'low pH + elevated temperature' }
        ],
        stabilityConcerns: [
            { type: 'ph_sensitivity', risk: 'moderate', rationale: 'acidic systems can increase conversion risk' }
        ],
        techTransferSensitivities: [
            { area: 'mixing_order', step: 'Adjust pH after niacinamide dispersion with controlled neutralization', risk_if_wrong: 'localized low pH pockets and conversion risk', rationale: 'pH homogeneity is critical at scale' }
        ],
        regulatoryAttentionFlags: [{ flag: 'functional_classification', rationale: 'ensure supported concentration/function claims match jurisdiction expectations' }],
        processRisk: {
            moisture_sensitivity: { level: 'low', rationale: 'water-soluble; dissolves readily; moisture-driven process risk is low unless co-formulated at acidic pH with heat' },
            mixing_shear_sensitivity: { level: 'low', rationale: 'small molecule; shear causes no structural concern; only aeration and pH uniformity matter' },
            storage_stability_concern: { level: 'moderate', rationale: 'stable under neutral-to-neutral pH; acidic or thermally stressed conditions shift risk toward nicotinic acid formation' },
            rehydration_behavior: { relevant: true, notes: 'dissolves easily in aqueous phase; complete dissolution should be confirmed before pH adjustment to avoid local acidic gradients' },
            dry_vs_hydrated_stability: { concern: 'dry state is stable; hydrated at low pH with heating is the problematic scenario', risk: 'moderate' }
        },
        scaleUpRisk: {
            mixing_time_sensitivity: { level: 'moderate', rationale: 'longer residence at low pH during scale-up neutralization increases conversion exposure window' },
            temperature_excursion_risk: { level: 'moderate', rationale: 'thermal stress combined with non-neutral pH is the critical risk; temperature alone is secondary' },
            ph_gradient_risk: { level: 'high', rationale: 'in large vessels, pH homogeneity during acid/base addition is harder to maintain; local low-pH zones can trigger conversion' },
            dispersion_uniformity_risk: { level: 'low', rationale: 'easily dissolves; dispersion uniformity is not a primary concern if dissolution is confirmed' },
            activity_loss_during_scaleup: { likelihood: 'moderate', rationale: 'nicotinic acid impurity formation is a known risk; in-process pH and temperature CPP control mitigates this' }
        },
        regulatoryImpact: {
            stability_dependent_claims: { applicable: true, rationale: 'pore-minimizing and skin-brightening claims require demonstrated niacinamide potency at point of use' },
            stability_data_required: true,
            labeling_risk: { level: 'low', notes: ['Well-established safety profile at typical use levels (2–10%)', 'Nicotinic acid impurity limit is monitored in some quality standards'] },
            classification_clarity: { level: 'clear', rationale: 'classified as cosmetic ingredient globally at standard use concentrations; no dual-use ambiguity under normal conditions' }
        },
        decisionUncertainty: {
            data_completeness: 'partial',
            evaluation_reliability: 'medium',
            missing_excipient_impact: 'moderate',
            safety_margin_uncertainty: 'low',
            scientific_confidence: 'high',
            icq_q9_risk_rating: 'moderate',
            uncertainty_drivers: ['Co-formulated acids (AHA, BHA) dramatically increase conversion risk if pH is not tightly controlled', 'Heating temperature and duration during manufacturing unknown', 'Final pH of formulation not determinable from image alone']
        }
    },
    {
        id: 'fragrance',
        match: ['parfum', 'fragrance', 'linalool', 'limonene', 'citral', 'geraniol', 'eugenol'],
        riskMechanisms: [
            { type: 'oxidation', risk: 'moderate', impact: 'sensitization potential increase over shelf-life', rationale: 'oxidized fragrance allergens can become more sensitizing', context: 'oxygen and light exposure' },
            { type: 'volatility', risk: 'moderate', impact: 'odor profile and concentration drift', rationale: 'volatile fragrance components evaporate during processing/storage', context: 'hot fill or permeable packaging' }
        ],
        stabilityConcerns: [
            { type: 'oxidation', risk: 'moderate', rationale: 'oxidized terpenes can alter odor and increase sensitization concern' },
            { type: 'volatility', risk: 'moderate', rationale: 'volatile notes can shift profile during thermal processing' }
        ],
        techTransferSensitivities: [
            { area: 'thermal', ingredient_or_system: 'Fragrance phase', risk_level: 'moderate', rationale: 'high processing temperature can strip volatile profile' }
        ],
        regulatoryAttentionFlags: [{ flag: 'allergen_labeling', rationale: 'fragrance allergens may trigger declaration requirements by market' }, { flag: 'sensitizer', rationale: 'fragrance compounds can increase sensitization risk in leave-on systems' }],
        processRisk: {
            moisture_sensitivity: { level: 'low', rationale: 'fragrance complex is typically oil-phase stable; water exposure can cause emulsion destabilization but not direct fragrance degradation' },
            mixing_shear_sensitivity: { level: 'low', rationale: 'no structural sensitivity to shear; temperature exposure during mixing is the main concern' },
            storage_stability_concern: { level: 'moderate', rationale: 'terpene oxidation over shelf-life can shift odor profile and sensitization risk; antioxidants and packaging control needed' },
            rehydration_behavior: { relevant: false, notes: 'oil-soluble fragrance complex; rehydration risk not applicable' },
            dry_vs_hydrated_stability: { concern: 'more stable in anhydrous carrier; aqueous dispersion may shift to oil-water interface behavior affecting release rate', risk: 'low' }
        },
        scaleUpRisk: {
            mixing_time_sensitivity: { level: 'low', rationale: 'fragrance complex tolerates normal mixing time; thermal history is the critical variable' },
            temperature_excursion_risk: { level: 'moderate', rationale: 'flash-point and vapor-loss risk must be managed; hot-fill processes can strip top notes and shift odor character' },
            ph_gradient_risk: { level: 'low', rationale: 'fragrance components generally not pH reactive at neutral-to-acidic cosmetic range' },
            dispersion_uniformity_risk: { level: 'moderate', rationale: 'in large emulsion batches, fragrance distribution uniformity affects sensory consistency; poor dispersion creates batch odor variation' },
            activity_loss_during_scaleup: { likelihood: 'moderate', rationale: 'top-note volatile loss during hot processing is a known quality risk; fragrance addition temperature and time must be defined as CPP' }
        },
        regulatoryImpact: {
            stability_dependent_claims: { applicable: false, rationale: 'fragrance functions as a sensory attribute rather than an active claim; no potency-linked labeling' },
            stability_data_required: false,
            labeling_risk: { level: 'high', notes: ['EU Regulation 2023/1545 mandates disclosure of 80+ allergens at 0.001–0.01% threshold in leave-on products', 'IFRA standards restrict certain allergens; compliance certificate from fragrance supplier required', 'REACH and similar regulations may require safety data sheet for fragrance blend'] },
            classification_clarity: { level: 'clear', rationale: 'cosmetic ingredient in all markets; classification ambiguity only arises if fragrance contains pharmacologically active components at effective doses' }
        },
        decisionUncertainty: {
            data_completeness: 'limited',
            evaluation_reliability: 'low',
            missing_excipient_impact: 'high',
            safety_margin_uncertainty: 'high',
            scientific_confidence: 'low',
            icq_q9_risk_rating: 'high',
            uncertainty_drivers: ['Fragrance listed as single INCI entry (parfum) conceals hundreds of potential chemical components', 'Individual allergen identity and concentration entirely unknown from product label', 'Sensitization risk cannot be quantified without full fragrance compound disclosure']
        }
    },
    {
        id: 'ethanol',
        match: ['alcohol denat', 'ethanol'],
        riskMechanisms: [
            { type: 'volatility', risk: 'high', impact: 'assay drift and viscosity shift', rationale: 'rapid evaporation modifies solvent balance', context: 'open processing and high temperature' }
        ],
        stabilityConcerns: [
            { type: 'volatility', risk: 'high', rationale: 'evaporation can shift composition and rheology' }
        ],
        techTransferSensitivities: [
            { area: 'mixing_order', step: 'Charge volatile alcohol phase under lid at lower temperature', risk_if_wrong: 'rapid solvent loss and batch variability', rationale: 'limits concentration drift in scale-up vessels' }
        ],
        regulatoryAttentionFlags: [{ flag: 'functional_classification', rationale: 'solvent function and concentration may affect warning/claim positioning by market' }],
        processRisk: {
            moisture_sensitivity: { level: 'high', rationale: 'hygroscopic; absorbs atmospheric moisture during open mixing and storage; final water content shifts solvent balance and microbial risk' },
            mixing_shear_sensitivity: { level: 'low', rationale: 'no mechanical structure to damage; risk is vapor generation and fire/explosion hazard under high shear in industrial vessels' },
            storage_stability_concern: { level: 'high', rationale: 'evaporative loss in storage shifts effective ethanol concentration, affecting antimicrobial efficacy and sensory performance' },
            rehydration_behavior: { relevant: false, notes: 'liquid solvent; rehydration scenario not applicable' },
            dry_vs_hydrated_stability: { concern: 'less relevant; stability concern is concentration maintenance in both phases', risk: 'moderate' }
        },
        scaleUpRisk: {
            mixing_time_sensitivity: { level: 'moderate', rationale: 'longer open mixing time increases evaporative losses proportionally; headspace volume-to-surface ratio changes at scale' },
            temperature_excursion_risk: { level: 'high', rationale: 'boiling point (78°C) reached in standard mixing conditions; thermal excursion rapidly depletes ethanol content' },
            ph_gradient_risk: { level: 'low', rationale: 'ethanol itself is pH-neutral; gradient risk relates to co-formulated actives not the ethanol' },
            dispersion_uniformity_risk: { level: 'low', rationale: 'miscible in all proportions with water; uniform distribution is not a technical concern' },
            activity_loss_during_scaleup: { likelihood: 'high', rationale: 'ethanol assay drift during commercial fill-finish is a documented process validation CPP; measured at IPC and release' }
        },
        regulatoryImpact: {
            stability_dependent_claims: { applicable: true, rationale: 'antimicrobial preservation function and sensory claims (dry-touch, quick-dry) depend on retained ethanol concentration' },
            stability_data_required: true,
            labeling_risk: { level: 'moderate', notes: ['Denatured alcohol (alcohol denat) requires denaturants compliant with market-specific approved lists (US, EU)', 'High ethanol content may trigger flammable goods transport classification', 'Claims implying antiseptic or disinfectant function can elevate to biocide/drug regulatory pathway'] },
            classification_clarity: { level: 'moderate', rationale: 'cosmetic solvent at standard levels; high-concentration or antimicrobial claim positioning may trigger biocide/drug classification in some jurisdictions' }
        },
        decisionUncertainty: {
            data_completeness: 'partial',
            evaluation_reliability: 'medium',
            missing_excipient_impact: 'moderate',
            safety_margin_uncertainty: 'moderate',
            scientific_confidence: 'medium',
            icq_q9_risk_rating: 'moderate',
            uncertainty_drivers: ['Actual ethanol concentration unknown; risk profile is concentration-dependent', 'Denaturant identity may affect regulatory compliance in specific markets', 'Container closure integrity and headspace oxygen level affect real evaporative loss in storage']
        }
    }
];

const interactionRules = [
    {
        id: 'retinol_bpo',
        required: [['retinol', 'retinal', 'retinyl palmitate', 'tretinoin'], ['benzoyl peroxide']],
        risk: 'high',
        impact: 'efficacy_loss',
        mechanism: 'oxidative incompatibility',
        rationale: 'oxidizing peroxide environment can degrade retinoid structures',
        context: 'co-formulated or short-interval layered usage'
    },
    {
        id: 'acid_niacinamide',
        required: [['glycolic acid', 'lactic acid', 'salicylic acid', 'aha', 'bha'], ['niacinamide']],
        risk: 'moderate',
        impact: 'irritation',
        mechanism: 'pH-mediated conversion pathway',
        rationale: 'acidic environment with heat can shift niacinamide toward nicotinic acid',
        context: 'low pH and thermal stress'
    },
    {
        id: 'ascorbic_alkaline',
        required: [['ascorbic acid', 'vitamin c'], ['triethanolamine', 'aminomethyl propanol'] ],
        risk: 'moderate',
        impact: 'instability',
        mechanism: 'pH drift from acidic to neutral/alkaline',
        rationale: 'ascorbic acid loses stability as pH rises',
        context: 'neutralization drift during processing/storage'
    }
];

function hasAnyIngredient(normalizedNames, terms) {
    return normalizedNames.some(name => terms.some(term => name.includes(term)));
}

function runReasoningEngine(parsed, language = 'en') {
    const locale = t[language] || t.en;
    const ingredientList = [
        ...(parsed.ingredients_analyzed || []).map(item => item?.name || ''),
        ...(parsed.ingredients_raw || [])
    ].filter(Boolean);

    const normalized = ingredientList.map(normalizeIngredient);
    const mechanismEvents = [];
    const regulatoryFlags = [];
    const mixingOrder = [];
    const heatSensitivity = [];
    const scaleUpRisks = [];
    const contextSensitivityNotes = [];

    // Collectors for the 4 new CMC/MSAT dimensions
    const processRiskEntries = [];
    const scaleUpRiskEntries = [];
    const regulatoryImpactEntries = [];
    const decisionUncertaintyEntries = [];

    ingredientKnowledgeDB.forEach(profile => {
        const hit = hasAnyIngredient(normalized, profile.match);
        if (!hit) return;

        (profile.riskMechanisms || []).forEach(m => {
            mechanismEvents.push({
                ingredient: profile.id,
                mechanism: m.type,
                risk_level: m.risk,
                impact: m.impact,
                rationale: m.rationale,
                context: m.context
            });
        });

        (profile.regulatoryAttentionFlags || []).forEach(flag => {
            regulatoryFlags.push({
                flag: flag.flag,
                ingredient: profile.id,
                rationale: flag.rationale
            });
        });

        (profile.techTransferSensitivities || []).forEach(note => {
            if (note.area === 'mixing' || note.area === 'mixing_order') {
                mixingOrder.push({
                    step: note.step,
                    risk_if_wrong: note.risk_if_wrong,
                    rationale: note.rationale || note.risk_if_wrong
                });
            }
            if (note.area === 'thermal') {
                heatSensitivity.push({
                    ingredient_or_system: note.ingredient_or_system,
                    risk_level: note.risk_level,
                    rationale: note.rationale
                });
            }
            if (note.area === 'shear') {
                scaleUpRisks.push({
                    risk: `Shear sensitivity in ${note.ingredient_or_system || profile.id}`,
                    rationale: note.rationale,
                    mitigation_hint: 'Match impeller tip speed and energy density during scale-up.'
                });
            }
        });

        (profile.stabilityConcerns || []).forEach(stabilityItem => {
            mechanismEvents.push({
                ingredient: profile.id,
                mechanism: stabilityItem.type,
                risk_level: stabilityItem.risk,
                impact: 'stability_shift',
                rationale: stabilityItem.rationale,
                context: 'storage and process conditions'
            });
        });

        // Collect new 4-dimension entries
        if (profile.processRisk) processRiskEntries.push({ ingredient: profile.id, ...profile.processRisk });
        if (profile.scaleUpRisk) scaleUpRiskEntries.push({ ingredient: profile.id, ...profile.scaleUpRisk });
        if (profile.regulatoryImpact) regulatoryImpactEntries.push({ ingredient: profile.id, ...profile.regulatoryImpact });
        if (profile.decisionUncertainty) decisionUncertaintyEntries.push({ ingredient: profile.id, ...profile.decisionUncertainty });
    });

    const interactionRisks = [];
    const potentialIncompatibilities = [];
    interactionRules.forEach(rule => {
        const matched = rule.required.every(group => hasAnyIngredient(normalized, group));
        if (!matched) return;
        interactionRisks.push({
            combination: rule.required.map(group => group[0]).join(' + '),
            risk_level: rule.risk,
            impact: rule.impact,
            rationale: rule.rationale
        });
        potentialIncompatibilities.push({
            pair: rule.required.map(group => group[0]).join(' + '),
            risk_level: rule.risk,
            rationale: rule.rationale,
            context_sensitivity: rule.context
        });
        contextSensitivityNotes.push(`${rule.mechanism}: ${rule.context}`);
    });

    const byMechanism = (type) => mechanismEvents.filter(e => e.mechanism === type);
    const aggregateMechanism = (types) => {
        const events = mechanismEvents.filter(e => types.includes(e.mechanism));
        if (!events.length) return { risk_level: 'low', rationale: 'No dominant mechanism detected from visible ingredients.' };
        return {
            risk_level: events.reduce((acc, e) => maxRisk(acc, e.risk_level), 'low'),
            rationale: events.slice(0, 2).map(e => e.rationale).join('; ')
        };
    };

    if (byMechanism('heat_degradation').length || byMechanism('light_temperature').length) {
        scaleUpRisks.push({
            risk: 'Thermal history mismatch during scale-up',
            rationale: 'Temperature and hold-time deviations can accelerate thermally sensitive degradation pathways.',
            mitigation_hint: 'Set CPP limits for heating/cooling ramps and maximum hold-time.'
        });
    }

    if (byMechanism('volatility').length) {
        scaleUpRisks.push({
            risk: 'Volatile loss across open transfer steps',
            rationale: 'Volatile actives/solvents may evaporate and shift concentration profile.',
            mitigation_hint: 'Use closed transfer and verify assay before/after transfer.'
        });
        contextSensitivityNotes.push('Humidity/temperature excursions can amplify evaporation-driven concentration drift.');
    }

    const uncertainCount = (parsed.ingredients_analyzed || []).filter(item => item?.uncertain).length;
    const totalAnalyzed = (parsed.ingredients_analyzed || []).length;
    const coverage = totalAnalyzed > 0 ? Math.max(0.3, Math.min(1, 1 - uncertainCount / totalAnalyzed)) : 0.3;
    const confidence = coverage >= 0.8 ? 'high' : coverage >= 0.55 ? 'medium' : 'low';
    const missingImpact = coverage >= 0.8 ? 'low' : coverage >= 0.55 ? 'moderate' : 'high';

    const overallRisk = [
        mechanismEvents.reduce((acc, e) => maxRisk(acc, e.risk_level), 'low'),
        interactionRisks.reduce((acc, e) => maxRisk(acc, e.risk_level), 'low'),
        regulatoryFlags.length ? 'moderate' : 'low',
        confidence === 'low' ? 'moderate' : 'low'
    ].reduce((acc, current) => maxRisk(acc, current), 'low');

    const recommendedActions = [locale.inciVerification];
    if (byMechanism('oxidation').length) recommendedActions.push(locale.oxidationTest);
    if (byMechanism('ph_instability').length || byMechanism('hydrolysis').length) recommendedActions.push(locale.phWindow);
    if (byMechanism('volatility').length) recommendedActions.push(locale.tempControl);
    if (scaleUpRisks.length) recommendedActions.push(locale.scaleUpCheck);

    const scientificJustification = mechanismEvents.slice(0, 10).map(e => ({
        claim: locale.riskSentence(e.risk_level, e.mechanism.replace('_', ' '), e.impact, e.context),
        mechanism: e.rationale,
        confidence
    }));

    const cautionLevel = overallRisk;
    const expertReviewRequired = overallRisk === 'high' || confidence === 'low' || regulatoryFlags.length > 0;

    // ─── NEW DIMENSION 1: Process Risk ──────────────────────────────────
    const aggregateLevel = (entries, field) => {
        const levels = entries.map(e => e[field]?.level).filter(Boolean);
        return levels.length ? levels.reduce((best, curr) => maxRisk(best, curr), 'low') : 'low';
    };
    const collectRationales = (entries, field) =>
        entries.filter(e => e[field]?.rationale).map(e => `[${e.ingredient}] ${e[field].rationale}`);

    const processRiskOutput = {
        moisture_sensitivity: {
            level: aggregateLevel(processRiskEntries, 'moisture_sensitivity'),
            rationale: collectRationales(processRiskEntries, 'moisture_sensitivity').join('; ') || 'No significant moisture sensitivity identified from detected ingredients.'
        },
        mixing_shear_sensitivity: {
            level: aggregateLevel(processRiskEntries, 'mixing_shear_sensitivity'),
            rationale: collectRationales(processRiskEntries, 'mixing_shear_sensitivity').join('; ') || 'No direct shear sensitivity identified; standard mixing conditions apply.'
        },
        storage_stability_concern: {
            level: aggregateLevel(processRiskEntries, 'storage_stability_concern'),
            rationale: collectRationales(processRiskEntries, 'storage_stability_concern').join('; ') || 'Monitor standard storage conditions for known stability pathways.'
        },
        rehydration_behavior: processRiskEntries.some(e => e.rehydration_behavior?.relevant)
            ? {
                relevant: true,
                notes: processRiskEntries.filter(e => e.rehydration_behavior?.relevant).map(e => e.rehydration_behavior.notes).join('; ')
            }
            : { relevant: false, notes: 'No powder rehydration concerns identified from detected ingredients.' },
        overall_process_risk: [
            aggregateLevel(processRiskEntries, 'moisture_sensitivity'),
            aggregateLevel(processRiskEntries, 'storage_stability_concern')
        ].reduce((a, b) => maxRisk(a, b), 'low')
    };

    // ─── NEW DIMENSION 2: Scale-Up Risk ─────────────────────────────────
    const scaleUpRiskOutput = {
        mixing_time_sensitivity: {
            level: aggregateLevel(scaleUpRiskEntries, 'mixing_time_sensitivity'),
            rationale: collectRationales(scaleUpRiskEntries, 'mixing_time_sensitivity').join('; ') || 'Standard mixing cycle time applicable; monitor for volatile and oxidation-sensitive actives.'
        },
        temperature_excursion_risk: {
            level: aggregateLevel(scaleUpRiskEntries, 'temperature_excursion_risk'),
            rationale: collectRationales(scaleUpRiskEntries, 'temperature_excursion_risk').join('; ') || 'No critical thermal excursion risk identified.'
        },
        ph_gradient_risk: {
            level: aggregateLevel(scaleUpRiskEntries, 'ph_gradient_risk'),
            rationale: collectRationales(scaleUpRiskEntries, 'ph_gradient_risk').join('; ') || 'Standard pH control protocols apply; no critical gradient risk identified.'
        },
        dispersion_uniformity_risk: {
            level: aggregateLevel(scaleUpRiskEntries, 'dispersion_uniformity_risk'),
            rationale: collectRationales(scaleUpRiskEntries, 'dispersion_uniformity_risk').join('; ') || 'No critical dispersion uniformity concern identified.'
        },
        activity_loss_during_scaleup: {
            likelihood: (() => {
                const likelihoods = scaleUpRiskEntries.map(e => e.activity_loss_during_scaleup?.likelihood).filter(Boolean);
                return likelihoods.reduce((a, b) => maxRisk(a, b), 'low');
            })(),
            rationale: scaleUpRiskEntries.filter(e => e.activity_loss_during_scaleup?.rationale).map(e => `[${e.ingredient}] ${e.activity_loss_during_scaleup.rationale}`).join('; ') || 'No specific activity loss risk identified from current ingredient set.'
        },
        overall_scaleup_risk: [
            aggregateLevel(scaleUpRiskEntries, 'temperature_excursion_risk'),
            aggregateLevel(scaleUpRiskEntries, 'ph_gradient_risk'),
            aggregateLevel(scaleUpRiskEntries, 'dispersion_uniformity_risk')
        ].reduce((a, b) => maxRisk(a, b), 'low')
    };

    // ─── NEW DIMENSION 3: Regulatory Impact ─────────────────────────────
    const stabilityClaimsApplicable = regulatoryImpactEntries.some(e => e.stability_dependent_claims?.applicable);
    const labelingRiskLevel = regulatoryImpactEntries.length
        ? regulatoryImpactEntries.map(e => e.labeling_risk?.level || 'low').reduce((a, b) => maxRisk(a, b), 'low')
        : 'low';
    const classificationLevels = regulatoryImpactEntries.map(e => e.classification_clarity?.level).filter(Boolean);
    const classificationClarity = classificationLevels.includes('ambiguous') ? 'ambiguous'
        : classificationLevels.includes('moderate') ? 'moderate' : 'clear';

    const regulatoryImpactOutput = {
        stability_dependent_claims: {
            applicable: stabilityClaimsApplicable,
            rationale: regulatoryImpactEntries
                .filter(e => e.stability_dependent_claims?.applicable)
                .map(e => `[${e.ingredient}] ${e.stability_dependent_claims.rationale}`)
                .join('; ') || 'No stability-dependent claim dependency identified from detected ingredients.'
        },
        stability_data_required: regulatoryImpactEntries.some(e => e.stability_data_required),
        labeling_risk: {
            level: labelingRiskLevel,
            notes: regulatoryImpactEntries.flatMap(e => (e.labeling_risk?.notes || []).map(n => `[${e.ingredient}] ${n}`))
        },
        classification_clarity: {
            level: classificationClarity,
            rationale: regulatoryImpactEntries
                .filter(e => e.classification_clarity)
                .map(e => `[${e.ingredient}] ${e.classification_clarity.rationale}`)
                .join('; ') || 'No market classification ambiguity identified.'
        }
    };

    // ─── NEW DIMENSION 4: Decision Uncertainty (ICH Q9 aligned) ─────────
    const completenessLevels = { full: 3, partial: 2, limited: 1 };
    const reliabilityLevels = { high: 3, medium: 2, low: 1 };
    const worstCompleteness = decisionUncertaintyEntries.length
        ? decisionUncertaintyEntries.reduce((worst, e) => (completenessLevels[e.data_completeness] || 2) < (completenessLevels[worst] || 2) ? e.data_completeness : worst, 'full')
        : (confidence === 'low' ? 'limited' : 'partial');
    const worstReliability = decisionUncertaintyEntries.length
        ? decisionUncertaintyEntries.reduce((worst, e) => (reliabilityLevels[e.evaluation_reliability] || 2) < (reliabilityLevels[worst] || 2) ? e.evaluation_reliability : worst, 'high')
        : confidence;
    const allUncertaintyDrivers = [
        ...decisionUncertaintyEntries.flatMap(e => (e.uncertainty_drivers || []).map(d => `[${e.ingredient}] ${d}`)),
        `Image-based screening only; actual formulation percentages and excipient grades are unknown.`,
        `Interactions between non-KB ingredients cannot be evaluated by the rule engine.`
    ];
    const icqRating = [
        decisionUncertaintyEntries.reduce((a, e) => maxRisk(a, e.icq_q9_risk_rating || 'low'), 'low'),
        overallRisk
    ].reduce((a, b) => maxRisk(a, b), 'low');

    const decisionUncertaintyOutput = {
        data_completeness: worstCompleteness,
        evaluation_reliability: worstReliability,
        missing_excipient_impact: missingImpact,
        safety_margin_uncertainty: decisionUncertaintyEntries.length
            ? decisionUncertaintyEntries.map(e => e.safety_margin_uncertainty || 'low').reduce((a, b) => maxRisk(a, b), 'low')
            : missingImpact,
        scientific_confidence: decisionUncertaintyEntries.length
            ? decisionUncertaintyEntries.map(e => e.scientific_confidence || 'low').reduce((a, b) => maxRisk(a, b), 'low')
            : confidence,
        icq_q9_risk_rating: icqRating,
        uncertainty_drivers: allUncertaintyDrivers.slice(0, 8)
    };

    return {
        formulation_compatibility: {
            potential_incompatibilities: potentialIncompatibilities,
            interaction_risks: interactionRisks,
            context_sensitivity_notes: contextSensitivityNotes.length ? contextSensitivityNotes : ['Monitor environmental and process conditions to prevent concentration drift and instability.']
        },
        stability_awareness: {
            ph_sensitivity: aggregateMechanism(['ph_instability', 'ph_sensitivity', 'hydrolysis']),
            oxidation_risk: aggregateMechanism(['oxidation']),
            volatility_concerns: aggregateMechanism(['volatility']),
            light_temperature_sensitivity: aggregateMechanism(['light_temperature', 'heat_degradation', 'light_sensitivity', 'temperature_sensitivity'])
        },
        process_relevant_insights: {
            mixing_order_importance: mixingOrder.length ? mixingOrder : [{ step: 'Sequence pH-sensitive and volatile ingredients in cool-down stage.', risk_if_wrong: 'Localized pH shock or evaporative loss may shift composition.', rationale: 'Order controls exposure to heat, shear, and pH gradients.' }],
            heat_sensitivity: heatSensitivity.length ? heatSensitivity : [{ ingredient_or_system: 'Formula system', risk_level: overallRisk, rationale: 'Thermal exposure should be controlled for sensitive actives and volatiles.' }],
            scale_up_degradation_risks: scaleUpRisks.length ? scaleUpRisks : [{ risk: 'Process transfer variability', rationale: 'Scale-up can change shear/thermal history and impact stability pathways.', mitigation_hint: 'Define CPP/CQA linkage before transfer.' }]
        },
        regulatory_assessment: {
            risk_category: capitalize(overallRisk),
            regulatory_flags: regulatoryFlags,
            needs_full_inci_verification: true,
            verification_notes: ['Assessment is screening-level and not a legal determination.', 'Confirm jurisdiction-specific restrictions, allergens, and claim substantiation.']
        },
        data_uncertainty: {
            confidence_level: confidence,
            detected_ingredient_coverage: Number(coverage.toFixed(2)),
            missing_information_impact: missingImpact,
            partial_detection_notes: [
                `Coverage estimated from detected vs uncertain ingredients: ${(coverage * 100).toFixed(0)}%.`,
                'Undetected excipients, fragrance components, and trace impurities may change final risk.'
            ]
        },
        decision_support: {
            caution_level: cautionLevel,
            recommended_actions: Array.from(new Set(recommendedActions)),
            expert_review_required: expertReviewRequired,
            expert_review_reason: expertReviewRequired ? locale.expertReason : 'Screening output appears actionable with routine verification controls.'
        },
        scientific_justification: scientificJustification,
        // ── 4 new CMC/MSAT dimensions ───────────────────────────────────────
        process_risk: processRiskOutput,
        scale_up_risk: scaleUpRiskOutput,
        regulatory_impact: regulatoryImpactOutput,
        decision_uncertainty: decisionUncertaintyOutput
    };
}

function applyReasoningLayer(parsed, language = 'en') {
    const generated = runReasoningEngine(parsed, language);
    return {
        ...parsed,
        formulation_compatibility: mergePreferExisting(parsed.formulation_compatibility, generated.formulation_compatibility),
        stability_awareness: mergePreferExisting(parsed.stability_awareness, generated.stability_awareness),
        process_relevant_insights: mergePreferExisting(parsed.process_relevant_insights, generated.process_relevant_insights),
        regulatory_assessment: mergePreferExisting(parsed.regulatory_assessment, generated.regulatory_assessment),
        data_uncertainty: mergePreferExisting(parsed.data_uncertainty, generated.data_uncertainty),
        decision_support: mergePreferExisting(parsed.decision_support, generated.decision_support),
        scientific_justification: mergePreferExisting(parsed.scientific_justification, generated.scientific_justification),
        // 4 new CMC/MSAT dimensions — always generated by rule engine; merge with any AI output if present
        process_risk: mergePreferExisting(parsed.process_risk, generated.process_risk),
        scale_up_risk: mergePreferExisting(parsed.scale_up_risk, generated.scale_up_risk),
        regulatory_impact: mergePreferExisting(parsed.regulatory_impact, generated.regulatory_impact),
        decision_uncertainty: mergePreferExisting(parsed.decision_uncertainty, generated.decision_uncertainty)
    };
}

// Function to generate analysis prompt based on language
const getAnalysisPrompt = (language = 'vi') => {
        const languageMap = {
                vi: 'VIETNAMESE',
                en: 'ENGLISH',
                fr: 'FRENCH'
        };

        const outputLanguage = languageMap[language] || languageMap.vi;

        return `You are an industrial formulation & regulatory risk assessor specialized in:
- Cosmetic formulation science
- Tech transfer & scale-up
- Regulatory CMC mindset (ICH Q8–Q10 logic)

════════════════════════════════════════
CORE PRINCIPLE — DECISION UNCERTAINTY MODEL
════════════════════════════════════════
Your goal is NOT to guess risks. Your goals are:
1. Evaluate decision uncertainty
2. Separate UNKNOWN vs REAL RISK
3. Think like an industry CMC consultant

When INCI is missing or partially visible:
- Do NOT escalate risk automatically.
- Classify uncertainty type: Scientific | Regulatory | Process
- Distinguish: Known risk | Potential risk | Unknown risk | Regulatory uncertainty
- NEVER label UNKNOWN data as HIGH risk. Risk ≠ missing data.

RISK CLASSIFICATION HIERARCHY:
- Missing data → UNKNOWN (not HIGH)
- Possible interaction → POTENTIAL
- Mechanism known → MODERATE
- Evidence-based failure mode → HIGH

════════════════════════════════════════
PRIORITY RULE: INCI-BASED EVALUATION
════════════════════════════════════════
IF an INCI ingredient list IS visible in the image:
→ DO NOT fall back to generic product-type assumptions.
→ Base ALL conclusions strictly on the detected formulation composition.
→ Generic defaults are FORBIDDEN when INCI data is present.

STEP 1 — DETECT FUNCTIONAL INGREDIENT CATEGORIES:
Identify and classify each detected ingredient into one or more:
  - Surfactant (anionic / amphoteric / nonionic / cationic)
  - Active (acid, enzyme, anti-acne, AHA/BHA, vitamin, etc.)
  - Humectant
  - Emollient / occlusive
  - Polymer / rheology modifier
  - Preservative (and preservation system completeness)
  - Chelating agent
  - pH adjuster / buffer component
  - Lipid barrier component
  - Fragrance / allergen

STEP 2 — CLASSIFY FORMULATION SYSTEM (mandatory before risk evaluation):
Before assigning any risk, identify which primary system(s) the formulation belongs to:

  [A] SURFACTANT-BASED AQUEOUS SYSTEM
      Indicator: anionic surfactants (SLS, SLES, sodium cocoyl isethionate),
                 amphoteric (cocamidopropyl betaine), nonionic (decyl glucoside)
      → Focus risk analysis on:
          - Micelle stability and surfactant phase balance
          - pH compatibility of the surfactant blend (anionic: pH 5–7)
          - Viscosity robustness (salt curve, polymer thickener sensitivity)
          - Anionic/cationic conflict detection
          - Do NOT apply gel or emulsion stability logic here

  [B] POLYMER RHEOLOGY SYSTEM
      Indicator: carbomer (acrylates copolymer), xanthan gum, hydroxyethylcellulose,
                 carbopol, polyacrylate crosspolymer
      → Focus risk analysis on:
          - Polymer hydration completeness (cold process vs hot)
          - Neutralization agent presence (TEA, NaOH, aminomethyl propanol)
          - Risk if unneutralized: viscosity failure, gelation collapse
          - Shear sensitivity during scale-up mixing
          - Electrolyte sensitivity (salt can destroy carbomer viscosity)

  [C] LIPID DELIVERY SYSTEM
      Indicator: ceramides, squalane, fatty alcohols, plant oils, wax esters,
                 lecithin, cholesterol, lamellar-forming lipids
      → Focus risk analysis on:
          - Dispersion stability and lamellar structure integrity
          - Emulsifier HLB adequacy for O/W or W/O system
          - Oxidative stability of unsaturated lipids
          - Temperature of phase combination during manufacturing
          - Rancidification and peroxide formation risk over shelf-life

  [D] ACTIVE / API-DRIVEN SYSTEM
      Indicator: salicylic acid, glycolic acid, lactic acid, enzymes (papain, bromelain),
                 retinol, retinal, ascorbic acid, benzoyl peroxide, bakuchiol
      → Focus risk analysis on:
          - For weak-acid actives (BHA/AHA): ionisation state and pH window
            * Salicylic Acid: pKa 2.97 → must remain at pH ≤ 3.5–4.0 for efficacy
            * At pH > 4.5: >90% ionised → essentially inactive
            * Crystallisation risk if pH drifts above supersaturation threshold
          - For oxidation-sensitive actives (vitamin C, retinoids): oxygen exclusion critical
          - For enzymes: temperature and pH denaturation risk
          - Buffer system presence is MANDATORY for acid actives

  → Assign one or more system codes: [A], [B], [C], [D]
  → All subsequent risk evaluation MUST reference the assigned system type(s)
  → Do NOT apply generic gel or cream logic if system is [A] surfactant-based

STEP 3 — EVALUATE FORMULATION-SPECIFIC RISKS (system-adapted):
  Surfactant [A]: micelle stability, pH-surfactant compatibility, viscosity failure modes, ionic conflicts
  Polymer [B]:    neutralization status, shear sensitivity, electrolyte disruption, hydration completeness
  Lipid [C]:      lamellar integrity, emulsifier adequacy, oxidative/thermal degradation, rancidity
  Active [D]:     ionisation state at target pH, crystallisation, oxidative potency loss, buffer adequacy
  All systems:    preservative system robustness, pH range compatibility, packaging interactions

STEP 4 — INTERACTION RISK ANALYSIS (chemistry-based):
  - Active vs excipient incompatibilities
  - Precipitation risk (ionic conflicts, salt-out effects)
  - Hydrolysis sensitivity (esters at extreme pH)
  - Oxidation sensitivity (retinoids, vitamin C, unsaturated lipids)
  - Surfactant-polymer electrolyte quench (e.g. high-salt kills carbomer viscosity)
  - Stability risks derived from ingredient chemistry — not product category or generic assumption

STEP 5 — UPDATE RISK LEVEL BASED ON SYSTEM-SPECIFIC LOGIC:
  - Surfactant system, pH-compatible blend, no ionic conflict → risk LOW
  - Polymer system, neutralizer present, no electrolyte overload → risk LOW
  - Weak-acid active [D] without buffer → risk MODERATE to HIGH (pH drift = efficacy loss + crystallisation)
  - Lipid system with no antioxidant support → risk MODERATE (oxidative degradation pathway)
  - Known incompatible pair (anionic + cationic, retinol + BPO) → risk HIGH
  - Never assign HIGH risk from INCI absence or product type alone

STEP 6 — CONFIDENCE CALIBRATION:
Confidence MUST increase when:
  - Functional systems are identifiable from INCI
  - pH-relevant buffering or adjusters are present
  - Preservation system appears complete
  - No major incompatibilities detected
Confidence LOW only when: INCI absent or truncated beyond interpretation.

STEP 7 — REGULATORY ASSESSMENT FROM INCI:
  - Flag restricted substances with concentration context (e.g. Salicylic Acid in rinse-off ≤ 3%)
  - Identify allergen labeling requirements (EU Annex III fragrance allergens)
  - Confirm preservative compliance (EU Annex V, ASEAN, FDA)
  - Note labeling implications from detected actives

STEP 8 — PROVIDE:
  - Scientific justification per claim (mechanism + confidence)
  - Formulation-based stability reasoning (not generic)
  - Process and scale-up risks relevant to detected system
  - Labeling considerations derived from actual ingredient profile

════════════════════════════════════════
SCALE-UP THINKING (system-specific industrial priorities)
════════════════════════════════════════
Surfactant system [A]: viscosity control (salt curve), surfactant phase balance, foam/viscosity spec, pH hold.
Polymer system [B]:    polymer hydration sequence, neutralization homogeneity, shear rate at scale, electrolyte control.
Lipid system [C]:      emulsifier temperature window, homogenization energy, oxygen exclusion during hot phase.
Active system [D]:     pH lock during manufacturing, mixing order to avoid local high-pH zones, oxygen exclusion for oxidation-sensitive actives.
Avoid overestimating thermal degradation / oxidation / volatility for systems [A] and [B] where these are not relevant mechanisms.

════════════════════════════════════════
OUTPUT FRAMING
════════════════════════════════════════
Use language: 'Formulation consistent with low risk profile', 'INCI supports moderate confidence assessment',
'Preservation system appears complete', 'pH-dependent active identified — buffer system absent — risk elevated'
Do NOT use: hazard exaggeration, worst-case speculation, generic product-type assumptions when INCI is present.

Input: image of an ingredient list (INCI). Perform OCR-style extraction and formulation-based risk screening. Return JSON only using this structure:
{
    "product_name": "...",
    "product_type": "cleanser|moisturizer|serum|sunscreen|toner|mask|other",
    "ingredients_raw": ["..."],
    "ingredients_analyzed": [
        {
            "name": "",
            "function": "",
            "function_local": "Short explanation in output language",
            "safety_level": "safe|low_risk|watch|avoid",
            "comedogenic_rating": 0,
            "comedogenic_warning": false,
            "uncertain": false
        }
    ],
    "top_ingredients": ["..."],
    "notable_ingredients": ["..."],
    "formulation_compatibility": {
        "potential_incompatibilities": [
            {
                "pair": "Ingredient A + Ingredient B",
                "risk_level": "low|moderate|high",
                "rationale": "Short scientific mechanism",
                "context_sensitivity": "pH / solvent / concentration / packaging / other"
            }
        ],
        "interaction_risks": [
            {
                "combination": "...",
                "risk_level": "low|moderate|high",
                "impact": "efficacy_loss|instability|irritation|other",
                "rationale": "..."
            }
        ],
        "context_sensitivity_notes": ["..."]
    },
    "stability_awareness": {
        "ph_sensitivity": { "risk_level": "low|moderate|high", "rationale": "..." },
        "oxidation_risk": { "risk_level": "low|moderate|high", "rationale": "..." },
        "volatility_concerns": { "risk_level": "low|moderate|high", "rationale": "..." },
        "light_temperature_sensitivity": { "risk_level": "low|moderate|high", "rationale": "..." }
    },
    "process_relevant_insights": {
        "mixing_order_importance": [
            { "step": "...", "risk_if_wrong": "...", "rationale": "..." }
        ],
        "heat_sensitivity": [
            { "ingredient_or_system": "...", "risk_level": "low|moderate|high", "rationale": "..." }
        ],
        "scale_up_degradation_risks": [
            { "risk": "...", "rationale": "...", "mitigation_hint": "..." }
        ]
    },
    "regulatory_assessment": {
        "risk_category": "Low|Moderate|High",
        "regulatory_flags": [
            { "flag": "sensitizer|potential_irritant|restricted_use|allergen_labeling|other", "ingredient": "...", "rationale": "..." }
        ],
        "needs_full_inci_verification": true,
        "verification_notes": ["..."]
    },
    "data_uncertainty": {
        "confidence_level": "low|medium|high",
        "detected_ingredient_coverage": 0,
        "missing_information_impact": "low|moderate|high",
        "partial_detection_notes": ["..."]
    },
    "decision_support": {
        "caution_level": "low|moderate|high",
        "recommended_actions": ["..."],
        "expert_review_required": true,
        "expert_review_reason": "..."
    },
    "scientific_justification": [
        { "claim": "...", "mechanism": "...", "confidence": "low|medium|high" }
    ],
    "process_risk": {
        "moisture_sensitivity": { "level": "low|moderate|high", "rationale": "..." },
        "mixing_shear_sensitivity": { "level": "low|moderate|high", "rationale": "..." },
        "storage_stability_concern": { "level": "low|moderate|high", "rationale": "..." },
        "rehydration_behavior": { "relevant": true, "notes": "..." },
        "overall_process_risk": "low|moderate|high"
    },
    "scale_up_risk": {
        "mixing_time_sensitivity": { "level": "low|moderate|high", "rationale": "..." },
        "temperature_excursion_risk": { "level": "low|moderate|high", "rationale": "..." },
        "ph_gradient_risk": { "level": "low|moderate|high", "rationale": "..." },
        "dispersion_uniformity_risk": { "level": "low|moderate|high", "rationale": "..." },
        "activity_loss_during_scaleup": { "likelihood": "low|moderate|high", "rationale": "..." },
        "overall_scaleup_risk": "low|moderate|high"
    },
    "regulatory_impact": {
        "stability_dependent_claims": { "applicable": true, "rationale": "..." },
        "stability_data_required": true,
        "labeling_risk": { "level": "low|moderate|high", "notes": ["..."] },
        "classification_clarity": { "level": "clear|moderate|ambiguous", "rationale": "..." }
    },
    "decision_uncertainty": {
        "data_completeness": "full|partial|limited",
        "evaluation_reliability": "high|medium|low",
        "missing_excipient_impact": "low|moderate|high",
        "safety_margin_uncertainty": "low|moderate|high",
        "scientific_confidence": "high|medium|low",
        "icq_q9_risk_rating": "low|moderate|high",
        "uncertainty_drivers": ["..."]
    },
    "formulation_system": {
        "surfactant_system": {
            "type": "anionic-dominant|amphoteric-balanced|mild-nonionic|mixed|not_detected",
            "components": ["..."],
            "compatibility_note": "..."
        },
        "buffer_ph_system": {
            "present": true,
            "components": ["..."],
            "estimated_ph_range": "...",
            "adequacy": "sufficient|partial|absent"
        },
        "physical_form": "aqueous-gel|emulsion-OW|emulsion-WO|micellar|surfactant-solution|suspension|other",
        "preservation_system": {
            "completeness": "complete|partial|single-agent|absent",
            "components": ["..."],
            "ph_compatibility_note": "..."
        },
        "polymer_system": {
            "detected": true,
            "neutralization_agent_present": true,
            "risk_if_unneutralized": "..."
        },
        "lipid_barrier_system": {
            "present": true,
            "components": ["..."],
            "function_note": "..."
        },
        "actives_detected": [
            {
                "name": "...",
                "category": "AHA|BHA|vitamin|enzyme|anti-acne|antioxidant|other",
                "optimal_ph_range": "...",
                "stability_concern": "low|moderate|high",
                "regulatory_restricted": true,
                "restriction_note": "..."
            }
        ]
    },
    "inci_evaluation": {
        "evaluation_basis": "inci_detected|generic_fallback",
        "functional_coverage": "full|partial|limited",
        "formulation_logic_applied": true,
        "ph_dependent_risk": {
            "identified": true,
            "active": "...",
            "optimal_ph": "...",
            "buffer_present": true,
            "risk_level": "low|moderate|high",
            "rationale": "..."
        },
        "surfactant_compatibility": {
            "risk_level": "low|moderate|high",
            "conflict_pairs": ["..."],
            "rationale": "..."
        },
        "precipitation_risk": {
            "risk_level": "low|moderate|high",
            "ionic_conflicts": ["..."],
            "rationale": "..."
        },
        "hydrolysis_risk": {
            "risk_level": "low|moderate|high",
            "sensitive_ingredients": ["..."],
            "rationale": "..."
        },
        "oxidation_risk_inci": {
            "risk_level": "low|moderate|high",
            "sensitive_ingredients": ["..."],
            "rationale": "..."
        },
        "allergen_labeling": {
            "required": true,
            "detected_allergens": ["..."],
            "regulation_reference": "EU Annex III|ASEAN|other"
        },
        "preservative_compliance": {
            "status": "compliant|needs_verification|non_compliant|insufficient_data",
            "regulation": "EU Annex V|ASEAN|FDA|other",
            "notes": ["..."]
        },
        "restricted_substances": [
            {
                "ingredient": "...",
                "restriction": "...",
                "product_type_limit": "...",
                "compliance_status": "likely_compliant|needs_verification|flag"
            }
        ],
        "labeling_considerations": ["..."],
        "overall_formulation_risk": "low|moderate|high",
        "confidence_basis": "..."
    }
}

Rules:
- Output valid JSON only, no markdown and no extra prose.
- Write ALL narrative text fields in ${outputLanguage}.
- Keep rationales concise, technical, and mechanism-based (not beauty advice).
- If information is not visible in the image, mark uncertainty explicitly instead of guessing.
- Set comedogenic_warning to true if comedogenic_rating >= 3.
- Keep ingredients in detected order.
- Avoid dermatology diagnosis; focus on formulation, process, and regulatory screening.
- CRITICAL: When INCI is detected, set inci_evaluation.evaluation_basis to "inci_detected" and apply formulation-based logic (Steps 1–8). Set evaluation_basis to "generic_fallback" ONLY when no INCI is readable.
- CRITICAL: Risk levels in inci_evaluation and regulatory_assessment must be derived from ingredient chemistry, not product type assumptions.`;
};

app.post("/analyze", async (req, res) => {
    try {
        const { imageBase64, language = 'vi' } = req.body;
        if (!imageBase64) {
            return res.status(400).json({ error: "imageBase64 required" });
        }

        console.log("📸 Analyzing image with Gemini AI...");

        // Prepare image data (remove data URL prefix if present)
        const base64Data = imageBase64.replace(/^data:image\/\w+;base64,/, "");

        // Detect mime type
        let mimeType = "image/png";
        if (imageBase64.includes("data:image/jpeg") || imageBase64.includes("data:image/jpg")) {
            mimeType = "image/jpeg";
        } else if (imageBase64.includes("data:image/webp")) {
            mimeType = "image/webp";
        }

        // Use v1beta API with gemini-2.5-flash (available in your project)
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

        const ANALYSIS_PROMPT = getAnalysisPrompt(language);
        
        const requestBody = {
            contents: [{
                parts: [
                    { text: ANALYSIS_PROMPT },
                    {
                        inline_data: {
                            mime_type: mimeType,
                            data: base64Data
                        }
                    }
                ]
            }]
        };

        // Helper function for retrying fetch
        const fetchWithRetry = async (url, options, retries = 3, backoff = 1000) => {
            try {
                const response = await fetch(url, options);
                if (response.status === 429 && retries > 0) {
                    console.warn(`⚠️ API Rate Limit (429). Retrying in ${backoff}ms... (${retries} left)`);
                    await new Promise(r => setTimeout(r, backoff));
                    return fetchWithRetry(url, options, retries - 1, backoff * 2);
                }
                return response;
            } catch (err) {
                if (retries > 0) {
                    console.warn(`⚠️ Network error. Retrying in ${backoff}ms... (${retries} left)`);
                    await new Promise(r => setTimeout(r, backoff));
                    return fetchWithRetry(url, options, retries - 1, backoff * 2);
                }
                throw err;
            }
        };

        const response = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("API Error:", errorData);
            throw new Error(`API returned ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        console.log("✅ Received response from Gemini");

        // Extract text from response
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";

        if (!text) {
            throw new Error("No text in response");
        }

        // Parse JSON from response
        let parsed;
        try {
            parsed = extractAndParseJSON(text);
        } catch (e) {
            console.error("Failed to parse JSON from response:", text.slice(0, 500));
            return res.status(500).json({ ok: false, error: "Failed to parse AI response: " + e.message, raw: text.slice(0, 1000) });
        }

        const enriched = applyReasoningLayer(parsed, language);
        res.json({ ok: true, result: enriched });
    } catch (err) {
        console.error("❌ Error:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

app.post("/analyze-from-ingredients", (req, res) => {
    try {
        const { ingredients, language = 'en', product_name = 'Ingredient Screening', product_type = 'other' } = req.body || {};

        if (!ingredients || (Array.isArray(ingredients) && ingredients.length === 0)) {
            return res.status(400).json({
                ok: false,
                error: "ingredients is required (array of strings or comma-separated string)"
            });
        }

        const ingredientsRaw = Array.isArray(ingredients)
            ? ingredients.map(item => String(item).trim()).filter(Boolean)
            : String(ingredients).split(',').map(item => item.trim()).filter(Boolean);

        if (!ingredientsRaw.length) {
            return res.status(400).json({ ok: false, error: "No valid ingredients provided" });
        }

        const parsed = {
            product_name,
            product_type,
            ingredients_raw: ingredientsRaw,
            ingredients_analyzed: ingredientsRaw.map((name) => ({
                name,
                function: '',
                function_local: '',
                safety_level: 'watch',
                comedogenic_rating: 0,
                comedogenic_warning: false,
                uncertain: false
            })),
            top_ingredients: ingredientsRaw.slice(0, 7),
            notable_ingredients: ingredientsRaw.slice(0, 5)
        };

        const enriched = applyReasoningLayer(parsed, language);
        res.json({ ok: true, mode: 'ingredient-screening', result: enriched });
    } catch (err) {
        console.error("❌ analyze-from-ingredients Error:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// ============= AI TEXT / INCI ANALYSIS ENDPOINT =============
const getTextAnalysisPrompt = (language = 'vi') => {
    const languageMap = { vi: 'VIETNAMESE', en: 'ENGLISH', fr: 'FRENCH' };
    const outputLanguage = languageMap[language] || 'VIETNAMESE';
    // Reuse image prompt but replace the final instruction line
    const base = getAnalysisPrompt(language);
    return base.replace(
        'Input: image of an ingredient list (INCI). Perform OCR-style extraction and formulation-based risk screening. Return JSON only using this structure:',
        'Input: a structured text submission with product type, INCI list, and optional claims provided directly. Perform formulation-based risk screening. No OCR needed — apply full INCI-based evaluation logic (Steps 1–8). Return JSON only using this structure:'
    );
};

app.post("/analyze-text", async (req, res) => {
    try {
        const { product_type = 'other', inci_list, claims = '', language = 'vi' } = req.body;

        if (!inci_list || (typeof inci_list === 'string' && !inci_list.trim()) || (Array.isArray(inci_list) && !inci_list.length)) {
            return res.status(400).json({ ok: false, error: 'inci_list is required' });
        }

        const inciString = Array.isArray(inci_list)
            ? inci_list.join(', ')
            : String(inci_list).trim();

        console.log(`📝 Text INCI analysis — type: ${product_type}, ingredients: ${inciString.substring(0, 60)}...`);

        const PROMPT = getTextAnalysisPrompt(language);
        const userInput = [
            `Product Type: ${product_type}`,
            `INCI List: ${inciString}`,
            claims ? `Claims: ${claims}` : ''
        ].filter(Boolean).join('\n');

        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;
        const requestBody = {
            contents: [{ parts: [{ text: PROMPT + '\n\n' + userInput }] }],
            generationConfig: { temperature: 0.3, maxOutputTokens: 8192 }
        };

        const fetchWithRetry = async (url, options, retries = 3, backoff = 1000) => {
            try {
                const response = await fetch(url, options);
                if (response.status === 429 && retries > 0) {
                    console.warn(`⚠️ Rate Limit. Retrying in ${backoff}ms...`);
                    await new Promise(r => setTimeout(r, backoff));
                    return fetchWithRetry(url, options, retries - 1, backoff * 2);
                }
                return response;
            } catch (err) {
                if (retries > 0) {
                    await new Promise(r => setTimeout(r, backoff));
                    return fetchWithRetry(url, options, retries - 1, backoff * 2);
                }
                throw err;
            }
        };

        const response = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errData = await response.text();
            throw new Error(`API returned ${response.status}: ${errData}`);
        }

        const data = await response.json();
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        if (!text) throw new Error('No text in response');

        let parsed;
        try {
            parsed = extractAndParseJSON(text);
        } catch (e) {
            console.error('Failed to parse JSON from analyze-text response:', text.slice(0, 500));
            return res.status(500).json({ ok: false, error: 'Failed to parse AI response: ' + e.message, raw: text.slice(0, 1000) });
        }

        // Inject provided product_type if AI left it blank
        if (!parsed.product_type || parsed.product_type === 'other') parsed.product_type = product_type;

        const enriched = applyReasoningLayer(parsed, language);
        res.json({ ok: true, mode: 'inci-text-analysis', result: enriched });
    } catch (err) {
        console.error('❌ analyze-text Error:', err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Health check endpoint
app.get("/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// ============= AI CHAT ENDPOINT =============
const CHAT_SYSTEM_PROMPT = `You are Formulation Risk Copilot — an industrial formulation & regulatory risk assessor for CMC, Tech Transfer, and Regulatory Affairs in cosmetic development.

ROLE:
- Assess formulation compatibility, stability risks, process-transfer concerns, and regulatory readiness.
- Evaluate decision uncertainty: separate UNKNOWN vs REAL RISK. Think like an industry CMC consultant.
- When a user provides an INCI list, apply formulation-based evaluation — NOT generic product-type assumptions.

CORE REASONING MODEL:
1. UNCERTAINTY CLASSIFICATION (when data is missing):
   - Scientific uncertainty: mechanism not determinable
   - Regulatory uncertainty: compliance not verifiable
   - Process uncertainty: scale-up behavior unknown
   - NEVER label UNKNOWN as HIGH risk. Risk ≠ missing data.

2. RISK HIERARCHY:
   - Missing data → UNKNOWN (not HIGH)
   - Possible interaction → POTENTIAL
   - Mechanism known → MODERATE
   - Evidence-based failure mode → HIGH

3. INCI-BASED EVALUATION (when INCI is provided):
   FIRST — classify the formulation system:
   [A] SURFACTANT-BASED AQUEOUS SYSTEM — SLS/SLES/betaines/glucosides detected
       → Risk focus: micelle stability, pH-surfactant compatibility, viscosity robustness, ionic conflicts
       → Do NOT apply gel or emulsion stability logic
   [B] POLYMER RHEOLOGY SYSTEM — carbomer/xanthan/HEC/polyacrylate detected
       → Risk focus: polymer hydration, neutralizer presence, shear sensitivity, electrolyte disruption
   [C] LIPID DELIVERY SYSTEM — ceramides/oils/fatty alcohols/wax esters/lecithin detected
       → Risk focus: lamellar integrity, emulsifier HLB, oxidative stability, rancidity risk
   [D] ACTIVE / API-DRIVEN SYSTEM — AHA/BHA/retinoids/enzymes/vitamin C/BPO detected
       → Risk focus: ionisation state at pH (e.g. Salicylic Acid pKa 2.97 — must be pH ≤ 4.0 for efficacy),
         crystallisation risk, buffer adequacy, oxidative potency loss

   THEN evaluate:
   - For weak-acid actives [D]: ionisation state and pH window are PRIMARY risk driver
   - For polymer system [B]: neutralization status is PRIMARY risk driver
   - For lipid system [C]: dispersion stability and oxidation are PRIMARY risk drivers
   - Confidence INCREASES when functional systems are clearly identifiable and no major conflicts found
   - NEVER apply generic product-type risk when INCI system is identifiable

4. REGULATORY (INCI-based):
   - Flag restricted substances with context (Salicylic Acid rinse-off ≤ 3%)
   - Allergen labeling: EU Annex III fragrance allergens
   - Preservative compliance: EU Annex V, ASEAN, FDA

5. SCALE-UP PRIORITIES (realistic):
   - Surfactant/cleanser: viscosity control, phase balance, polymer hydration, salt curve sensitivity
   - Avoid overestimating thermal degradation / oxidation unless INCI clearly warrants it

FRAME OUTPUTS AS:
- 'Formulation consistent with low risk profile', 'INCI supports moderate confidence assessment'
- 'Preservation system appears complete', 'pH-dependent active identified — buffer system absent — risk elevated'
- NOT: hazard exaggeration, worst-case speculation, generic assumptions when INCI is present

DO:
1. Stay technical, concise, mechanism-based.
2. Clearly distinguish observed data vs assumptions.
3. Suggest practical steps: INCI check, stability challenge, compatibility test, regulatory verification.
4. Low confidence → flag uncertainty, not risk escalation.

DO NOT:
- Provide dermatology diagnosis or consumer skincare advice.
- Recommend brands/products for personal use.
- Escalate risk because data is absent.
- Apply generic product-type risk when INCI data is present.

FORMAT:
- No markdown titles. Short paragraphs or bullet points.
- Keep responses concise and actionable.
`;



// Store conversation history per session (in-memory, resets on server restart)
const conversations = new Map();

app.post("/chat", async (req, res) => {
    try {
        const { message, sessionId = 'default' } = req.body;

        if (!message) {
            return res.status(400).json({ ok: false, error: "Message is required" });
        }

        console.log(`💬 Chat message from session ${sessionId}: ${message.substring(0, 50)}...`);

        // Get or create conversation history
        if (!conversations.has(sessionId)) {
            conversations.set(sessionId, []);
        }
        const history = conversations.get(sessionId);

        // Build conversation context
        const conversationContext = history.map(msg =>
            `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`
        ).join('\n');

        const fullPrompt = conversationContext
            ? `${conversationContext}\n\nUser: ${message}\n\nAssistant:`
            : `User: ${message}\n\nAssistant:`;

        // Call Gemini API
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${API_KEY}`;

        const requestBody = {
            contents: [{
                parts: [{ text: CHAT_SYSTEM_PROMPT + '\n\n' + fullPrompt }]
            }],
            generationConfig: {
                temperature: 0.7,
                maxOutputTokens: 1024,
            }
        };

        // Helper function for retrying fetch
        const fetchWithRetry = async (url, options, retries = 3, backoff = 1000) => {
            try {
                const response = await fetch(url, options);
                if (response.status === 429 && retries > 0) {
                    console.warn(`⚠️ API Rate Limit (429). Retrying in ${backoff}ms... (${retries} left)`);
                    await new Promise(r => setTimeout(r, backoff));
                    return fetchWithRetry(url, options, retries - 1, backoff * 2);
                }
                return response;
            } catch (err) {
                if (retries > 0) {
                    console.warn(`⚠️ Network error. Retrying in ${backoff}ms... (${retries} left)`);
                    await new Promise(r => setTimeout(r, backoff));
                    return fetchWithRetry(url, options, retries - 1, backoff * 2);
                }
                throw err;
            }
        };

        const response = await fetchWithRetry(apiUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error("Chat API Error:", errorData);
            throw new Error(`API returned ${response.status}: ${errorData}`);
        }

        const data = await response.json();
        const reply = data.candidates?.[0]?.content?.parts?.[0]?.text || "Xin lỗi, tôi không thể trả lời câu hỏi này.";

        // Update conversation history (keep last 10 exchanges)
        history.push({ role: 'user', content: message });
        history.push({ role: 'assistant', content: reply });
        if (history.length > 20) {
            history.splice(0, 2); // Remove oldest exchange
        }

        console.log("✅ Chat response sent");
        res.json({ ok: true, reply });

    } catch (err) {
        console.error("❌ Chat Error:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});

// Clear chat history endpoint
app.post("/chat/clear", (req, res) => {
    const { sessionId = 'default' } = req.body;
    conversations.delete(sessionId);
    res.json({ ok: true, message: "Conversation cleared" });
});
app.get("/", (req, res) => {
  res.send("Cosmetic Analyzer API is running ✅");
});
app.listen(PORT, () => {
    console.log(`🚀 Server listening on http://localhost:${PORT}`);
    console.log(`📡 API endpoints:`);
    console.log(`   - POST /analyze (image analysis)`);
    console.log(`   - POST /chat (AI chat)`);
    console.log(`🤖 Using model: gemini-2.5-flash`);
});

