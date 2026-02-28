import { useTranslation } from 'react-i18next';

interface ResultCardProps {
    data: any;
}

const labels: Record<string, any> = {
    vi: {
        overview: 'Tổng quan đánh giá công thức',
        riskCategory: 'Phân loại rủi ro',
        cautionLevel: 'Mức độ thận trọng',
        confidence: 'Độ tin cậy phân tích',
        coverage: 'Mức độ phát hiện thành phần',
        fullInci: 'Yêu cầu xác minh INCI đầy đủ',
        yes: 'Có',
        no: 'Không',
        topIngredients: 'Thành phần phát hiện nổi bật',
        compatibility: 'Đánh giá tương thích công thức',
        incompatibilities: 'Bất tương thích tiềm ẩn',
        interactionRisks: 'Rủi ro tương tác hoạt chất',
        contextSensitivity: 'Độ nhạy theo bối cảnh công thức',
        stability: 'Nhận diện rủi ro ổn định',
        process: 'Góc nhìn Tech Transfer',
        mixingOrder: 'Tầm quan trọng thứ tự phối trộn',
        heatSensitivity: 'Nhạy nhiệt',
        scaleUp: 'Rủi ro suy giảm khi scale-up',
        regulatory: 'Định hướng Regulatory / CMC',
        flags: 'Regulatory flags',
        verificationNotes: 'Ghi chú xác minh',
        uncertainty: 'Bất định dữ liệu',
        missingImpact: 'Ảnh hưởng của thiếu dữ liệu',
        partialNotes: 'Ghi chú phát hiện một phần',
        decisions: 'Lớp hỗ trợ ra quyết định',
        actions: 'Hành động khuyến nghị',
        expertReview: 'Yêu cầu expert review',
        reason: 'Lý do',
        scientific: 'Cơ sở khoa học / cơ chế rủi ro',
        ingredientsTable: 'Danh sách thành phần đã phân tích',
        ingredient: 'Thành phần',
        function: 'Vai trò công thức',
        safety: 'An toàn',
        comedogenic: 'Gây mụn',
        rationale: 'Cơ chế',
        risk: 'Rủi ro',
        impact: 'Tác động',
        notAvailable: 'Chưa có dữ liệu',
        processRiskSection: 'Phân tích rủi ro quy trình (Process Risk)',
        moistureSensitivity: 'Nhạy ẩm',
        shearSensitivity: 'Nhạy cắt / Trộn',
        storageConcern: 'Rủi ro lưu trữ',
        rehydrationBehavior: 'Tái hydrat hoá',
        overallProcessRisk: 'Rủi ro quy trình tổng thể',
        scaleUpRiskSection: 'Đánh giá rủi ro scale-up',
        mixingTimeSensitivity: 'Nhạy với thời gian trộn',
        tempExcursionRisk: 'Rủi ro dải nhiệt độ',
        phGradientRisk: 'Rủi ro gradient pH',
        dispersionRisk: 'Rủi ro phân tán không đồng đều',
        activityLoss: 'Mất hoạt tính khi scale-up',
        overallScaleUpRisk: 'Rủi ro scale-up tổng thể',
        regulatoryImpactSection: 'Phân tích tác động quy định',
        stabilityDependentClaims: 'Claims phụ thuộc ổn định',
        stabilityDataRequired: 'Cần dữ liệu ổn định',
        labelingRisk: 'Rủi ro nhãn mác',
        classificationClarity: 'Rõ ràng phân loại',
        decisionUncertaintySection: 'Đánh giá bất định (ICH Q9)',
        dataCompleteness: 'Đầy đủ dữ liệu',
        evaluationReliability: 'Độ tin cậy đánh giá',
        missingExcipientImpact: 'Ảnh hưởng tá dược thiếu',
        safetyMarginUncertainty: 'Bất định ngưỡng an toàn',
        scientificConfidenceLabel: 'Tin cậy khoa học',
        icqQ9Rating: 'Rủi ro ICH Q9',
        uncertaintyDrivers: 'Nguồn bất định',
        applicable: 'Có áp dụng',
        likelihood: 'Khả năng xảy ra'
    },
    en: {
        overview: 'Formulation assessment overview',
        riskCategory: 'Risk category',
        cautionLevel: 'Caution level',
        confidence: 'Analysis confidence',
        coverage: 'Ingredient detection coverage',
        fullInci: 'Needs full INCI verification',
        yes: 'Yes',
        no: 'No',
        topIngredients: 'Key detected ingredients',
        compatibility: 'Formulation compatibility assessment',
        incompatibilities: 'Potential incompatibilities',
        interactionRisks: 'Active interaction risks',
        contextSensitivity: 'Formulation context sensitivity',
        stability: 'Stability awareness',
        process: 'Tech Transfer perspective',
        mixingOrder: 'Mixing order importance',
        heatSensitivity: 'Heat sensitivity',
        scaleUp: 'Scale-up degradation risks',
        regulatory: 'Regulatory / CMC orientation',
        flags: 'Regulatory flags',
        verificationNotes: 'Verification notes',
        uncertainty: 'Data uncertainty',
        missingImpact: 'Missing information impact',
        partialNotes: 'Partial detection notes',
        decisions: 'Decision support layer',
        actions: 'Recommended actions',
        expertReview: 'Expert review required',
        reason: 'Reason',
        scientific: 'Scientific justification / mechanisms',
        ingredientsTable: 'Analyzed ingredients list',
        ingredient: 'Ingredient',
        function: 'Formulation role',
        safety: 'Safety',
        comedogenic: 'Comedogenicity',
        rationale: 'Rationale',
        risk: 'Risk',
        impact: 'Impact',
        notAvailable: 'No data available',
        processRiskSection: 'Process Risk Analysis',
        moistureSensitivity: 'Moisture sensitivity',
        shearSensitivity: 'Mixing / shear sensitivity',
        storageConcern: 'Storage stability concern',
        rehydrationBehavior: 'Rehydration behavior',
        overallProcessRisk: 'Overall process risk',
        scaleUpRiskSection: 'Scale-Up Risk Assessment',
        mixingTimeSensitivity: 'Mixing time sensitivity',
        tempExcursionRisk: 'Temperature excursion risk',
        phGradientRisk: 'pH gradient risk',
        dispersionRisk: 'Dispersion uniformity risk',
        activityLoss: 'Activity loss during scale-up',
        overallScaleUpRisk: 'Overall scale-up risk',
        regulatoryImpactSection: 'Regulatory Impact Analysis',
        stabilityDependentClaims: 'Stability-dependent claims',
        stabilityDataRequired: 'Stability data required',
        labelingRisk: 'Labeling risk',
        classificationClarity: 'Classification clarity',
        decisionUncertaintySection: 'Decision Uncertainty (ICH Q9)',
        dataCompleteness: 'Data completeness',
        evaluationReliability: 'Evaluation reliability',
        missingExcipientImpact: 'Missing excipient impact',
        safetyMarginUncertainty: 'Safety margin uncertainty',
        scientificConfidenceLabel: 'Scientific confidence',
        icqQ9Rating: 'ICH Q9 risk rating',
        uncertaintyDrivers: 'Uncertainty drivers',
        applicable: 'Applicable',
        likelihood: 'Likelihood'
    },
    fr: {
        overview: 'Vue d’ensemble de l’évaluation formulation',
        riskCategory: 'Catégorie de risque',
        cautionLevel: 'Niveau de prudence',
        confidence: 'Niveau de confiance',
        coverage: 'Couverture de détection des ingrédients',
        fullInci: 'Vérification INCI complète requise',
        yes: 'Oui',
        no: 'Non',
        topIngredients: 'Ingrédients détectés clés',
        compatibility: 'Évaluation de compatibilité de formulation',
        incompatibilities: 'Incompatibilités potentielles',
        interactionRisks: 'Risques d’interactions entre actifs',
        contextSensitivity: 'Sensibilité au contexte de formulation',
        stability: 'Vigilance stabilité',
        process: 'Perspective Tech Transfer',
        mixingOrder: 'Importance de l’ordre de mélange',
        heatSensitivity: 'Sensibilité à la chaleur',
        scaleUp: 'Risques de dégradation en scale-up',
        regulatory: 'Orientation réglementaire / CMC',
        flags: 'Drapeaux réglementaires',
        verificationNotes: 'Notes de vérification',
        uncertainty: 'Incertitude des données',
        missingImpact: 'Impact des données manquantes',
        partialNotes: 'Notes de détection partielle',
        decisions: 'Couche d’aide à la décision',
        actions: 'Actions recommandées',
        expertReview: 'Revue expert requise',
        reason: 'Raison',
        scientific: 'Justification scientifique / mécanismes',
        ingredientsTable: 'Liste des ingrédients analysés',
        ingredient: 'Ingrédient',
        function: 'Rôle formulation',
        safety: 'Sécurité',
        comedogenic: 'Comédogénicité',
        rationale: 'Rationale',
        risk: 'Risque',
        impact: 'Impact',
        notAvailable: 'Données indisponibles',
        processRiskSection: 'Analyse des risques procédé',
        moistureSensitivity: 'Sensibilité à l\'humidité',
        shearSensitivity: 'Sensibilité cisaillement / mélange',
        storageConcern: 'Risque de stabilité stockage',
        rehydrationBehavior: 'Comportement à la réhydratation',
        overallProcessRisk: 'Risque procédé global',
        scaleUpRiskSection: 'Évaluation du risque scale-up',
        mixingTimeSensitivity: 'Sensibilité au temps de mélange',
        tempExcursionRisk: 'Risque d\'excursion thermique',
        phGradientRisk: 'Risque gradient pH',
        dispersionRisk: 'Risque d\'homogénéité de dispersion',
        activityLoss: 'Perte d\'activité lors du scale-up',
        overallScaleUpRisk: 'Risque scale-up global',
        regulatoryImpactSection: 'Analyse d\'impact réglementaire',
        stabilityDependentClaims: 'Claims dépendants de la stabilité',
        stabilityDataRequired: 'Données de stabilité requises',
        labelingRisk: 'Risque d\'étiquetage',
        classificationClarity: 'Clarté de classification',
        decisionUncertaintySection: 'Incertitude décisionnelle (ICH Q9)',
        dataCompleteness: 'Complétude des données',
        evaluationReliability: 'Fiabilité de l\'évaluation',
        missingExcipientImpact: 'Impact des excipients manquants',
        safetyMarginUncertainty: 'Incertitude marge de sécurité',
        scientificConfidenceLabel: 'Confiance scientifique',
        icqQ9Rating: 'Niveau de risque ICH Q9',
        uncertaintyDrivers: 'Sources d\'incertitude',
        applicable: 'Applicable',
        likelihood: 'Probabilité'
    }
};

const riskToneClass: Record<string, string> = {
    low: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
    moderate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
    medium: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
    high: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
};

const heroToneClass: Record<string, string> = {
    low: 'from-green-600 to-emerald-700',
    moderate: 'from-yellow-600 to-orange-600',
    medium: 'from-yellow-600 to-orange-600',
    high: 'from-red-600 to-rose-700'
};

export default function ResultCard({ data }: ResultCardProps) {
    const { i18n } = useTranslation();
    const lang = (i18n.language || 'en').split('-')[0];
    const l = labels[lang] || labels.en;
    const payload = data?.result ? data.result : data;

    const ingredients = payload.ingredients_analyzed || [];

    const fallbackRisk = (() => {
        const score = payload.recommendation_score;
        if (typeof score !== 'number') return 'moderate';
        if (score >= 80) return 'low';
        if (score >= 50) return 'moderate';
        return 'high';
    })();

    const riskCategory = (payload.regulatory_assessment?.risk_category || fallbackRisk || 'moderate').toString().toLowerCase();
    const cautionLevel = (payload.decision_support?.caution_level || riskCategory).toString().toLowerCase();

    const uncertainCount = ingredients.filter((ing: any) => ing?.uncertain).length;
    const inferredCoverage = ingredients.length
        ? Math.max(0.35, Math.min(1, 1 - uncertainCount / ingredients.length))
        : 0;
    const detectedCoverage = payload.data_uncertainty?.detected_ingredient_coverage;
    const coverage = typeof detectedCoverage === 'number' ? detectedCoverage : inferredCoverage;

    const confidence = payload.data_uncertainty?.confidence_level || (
        coverage >= 0.8 ? 'high' : coverage >= 0.55 ? 'medium' : 'low'
    );

    const toPercent = (value: number) => `${Math.round(Math.max(0, Math.min(1, value)) * 100)}%`;

    const getTone = (value?: string) => {
        const key = (value || 'moderate').toLowerCase();
        return riskToneClass[key] || riskToneClass.moderate;
    };

    const getHeroTone = (value?: string) => {
        const key = (value || 'moderate').toLowerCase();
        return heroToneClass[key] || heroToneClass.moderate;
    };

    const getSafetyStyle = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'safe':
                return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
            case 'low_risk':
                return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
            case 'watch':
                return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400';
            case 'avoid':
                return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
            default:
                return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
        }
    };

    const getComedogenicStyle = (rating: number) => {
        if (rating >= 3) return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
        if (rating >= 1) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400';
        return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
    };

    const incompatibilities = payload.formulation_compatibility?.potential_incompatibilities || [];
    const interactionRisks = payload.formulation_compatibility?.interaction_risks || [];
    const contextNotes = payload.formulation_compatibility?.context_sensitivity_notes || [];

    const stability = payload.stability_awareness || {};
    const process = payload.process_relevant_insights || {};
    const regulatory = payload.regulatory_assessment || {};
    const uncertainty = payload.data_uncertainty || {};
    const decision = payload.decision_support || {};
    const scientific = payload.scientific_justification || [];

    // 4 new CMC/MSAT dimensions
    const processRisk = payload.process_risk || {};
    const scaleUpRisk = payload.scale_up_risk || {};
    const regulatoryImpact = payload.regulatory_impact || {};
    const decisionUncert = payload.decision_uncertainty || {};

    const completenessStyle: Record<string, string> = {
        full: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
        partial: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
        limited: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
    };
    const clarityStyle: Record<string, string> = {
        clear: 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400',
        moderate: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400',
        ambiguous: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400'
    };
    const getCompleteness = (v?: string) => completenessStyle[(v || '').toLowerCase()] || completenessStyle.partial;
    const getClarity = (v?: string) => clarityStyle[(v || '').toLowerCase()] || clarityStyle.moderate;

    const compactRiskCard = (title: string, node: any) => {
        if (!node) return null;
        return (
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
                <div className="flex items-center justify-between gap-2 mb-1">
                    <div className="text-sm font-semibold text-gray-900 dark:text-white">{title}</div>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTone(node.risk_level)}`}>
                        {node.risk_level || 'moderate'}
                    </span>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">{node.rationale || l.notAvailable}</div>
            </div>
        );
    };

    return (
        <div className="space-y-6">
            <div className={`bg-gradient-to-r ${getHeroTone(riskCategory)} rounded-2xl p-6 text-white shadow-lg`}>
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">{payload.product_name || l.overview}</h2>
                        <p className="text-white/80 text-sm">{payload.product_type || '—'}</p>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm">
                        <div className="bg-white/15 rounded-lg px-3 py-2">
                            <div className="text-white/70">{l.riskCategory}</div>
                            <div className="font-semibold capitalize">{riskCategory}</div>
                        </div>
                        <div className="bg-white/15 rounded-lg px-3 py-2">
                            <div className="text-white/70">{l.cautionLevel}</div>
                            <div className="font-semibold capitalize">{cautionLevel}</div>
                        </div>
                        <div className="bg-white/15 rounded-lg px-3 py-2">
                            <div className="text-white/70">{l.confidence}</div>
                            <div className="font-semibold capitalize">{confidence}</div>
                        </div>
                    </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 text-xs">
                    <span className="px-2.5 py-1 rounded bg-white/15">{l.coverage}: {toPercent(coverage)}</span>
                    <span className="px-2.5 py-1 rounded bg-white/15">
                        {l.fullInci}: {regulatory.needs_full_inci_verification ? l.yes : l.no}
                    </span>
                </div>
            </div>

            {payload.top_ingredients?.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{l.topIngredients}</h3>
                    <div className="flex flex-wrap gap-2">
                        {payload.top_ingredients.map((ing: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium">
                                {i + 1}. {ing}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{l.compatibility}</h3>
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{l.incompatibilities}</h4>
                        <ul className="space-y-2">
                            {incompatibilities.length > 0 ? incompatibilities.map((item: any, i: number) => (
                                <li key={i} className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="font-medium text-gray-900 dark:text-white">{item.pair || item.combination || '—'}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTone(item.risk_level)}`}>
                                            {item.risk_level || 'moderate'}
                                        </span>
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-400">{item.rationale || l.notAvailable}</div>
                                </li>
                            )) : <li className="text-sm text-gray-500 dark:text-gray-400">{l.notAvailable}</li>}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{l.interactionRisks}</h4>
                        <ul className="space-y-2">
                            {interactionRisks.length > 0 ? interactionRisks.map((item: any, i: number) => (
                                <li key={i} className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                                    <div className="flex items-center justify-between gap-2 mb-1">
                                        <span className="font-medium text-gray-900 dark:text-white">{item.combination || '—'}</span>
                                        <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTone(item.risk_level)}`}>
                                            {item.risk_level || 'moderate'}
                                        </span>
                                    </div>
                                    <div className="text-gray-600 dark:text-gray-400">{item.rationale || l.notAvailable}</div>
                                    {item.impact && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{l.impact}: {item.impact}</div>}
                                </li>
                            )) : <li className="text-sm text-gray-500 dark:text-gray-400">{l.notAvailable}</li>}
                        </ul>
                    </div>
                </div>
                {contextNotes.length > 0 && (
                    <div className="mt-4">
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{l.contextSensitivity}</h4>
                        <ul className="space-y-1">
                            {contextNotes.map((note: string, i: number) => (
                                <li key={i} className="text-sm text-gray-600 dark:text-gray-400">• {note}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{l.stability}</h3>
                    {compactRiskCard('pH', stability.ph_sensitivity)}
                    {compactRiskCard('Oxidation', stability.oxidation_risk)}
                    {compactRiskCard('Volatility', stability.volatility_concerns)}
                    {compactRiskCard('Light/Temperature', stability.light_temperature_sensitivity)}
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{l.process}</h3>
                    <div>
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{l.mixingOrder}</h4>
                        <ul className="space-y-1">
                            {(process.mixing_order_importance || []).length > 0 ? (process.mixing_order_importance || []).map((item: any, i: number) => (
                                <li key={i} className="text-sm text-gray-600 dark:text-gray-400">• {item.step || item.risk_if_wrong || '—'} {item.rationale ? `— ${item.rationale}` : ''}</li>
                            )) : <li className="text-sm text-gray-500 dark:text-gray-400">{l.notAvailable}</li>}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{l.heatSensitivity}</h4>
                        <ul className="space-y-1">
                            {(process.heat_sensitivity || []).length > 0 ? (process.heat_sensitivity || []).map((item: any, i: number) => (
                                <li key={i} className="text-sm text-gray-600 dark:text-gray-400">• {item.ingredient_or_system || '—'} ({item.risk_level || 'moderate'}) — {item.rationale || l.notAvailable}</li>
                            )) : <li className="text-sm text-gray-500 dark:text-gray-400">{l.notAvailable}</li>}
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{l.scaleUp}</h4>
                        <ul className="space-y-1">
                            {(process.scale_up_degradation_risks || []).length > 0 ? (process.scale_up_degradation_risks || []).map((item: any, i: number) => (
                                <li key={i} className="text-sm text-gray-600 dark:text-gray-400">• {item.risk || '—'} — {item.rationale || l.notAvailable}</li>
                            )) : <li className="text-sm text-gray-500 dark:text-gray-400">{l.notAvailable}</li>}
                        </ul>
                    </div>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{l.regulatory}</h3>
                    <div className="mb-3">
                        <span className={`px-2.5 py-1 rounded text-xs font-medium ${getTone(riskCategory)}`}>
                            {l.riskCategory}: {riskCategory}
                        </span>
                    </div>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{l.flags}</h4>
                    <ul className="space-y-2 mb-3">
                        {(regulatory.regulatory_flags || []).length > 0 ? (regulatory.regulatory_flags || []).map((flag: any, i: number) => (
                            <li key={i} className="text-sm text-gray-600 dark:text-gray-400 rounded-lg border border-gray-200 dark:border-gray-700 p-2">
                                <span className="font-medium text-gray-900 dark:text-white">{flag.flag || 'flag'}</span>
                                {flag.ingredient ? `: ${flag.ingredient}` : ''}
                                {flag.rationale ? ` — ${flag.rationale}` : ''}
                            </li>
                        )) : <li className="text-sm text-gray-500 dark:text-gray-400">{l.notAvailable}</li>}
                    </ul>
                    {(regulatory.verification_notes || []).length > 0 && (
                        <>
                            <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{l.verificationNotes}</h4>
                            <ul className="space-y-1">
                                {(regulatory.verification_notes || []).map((note: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400">• {note}</li>
                                ))}
                            </ul>
                        </>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{l.uncertainty}</h3>
                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400 mb-3">
                        <div>{l.confidence}: <span className="font-medium capitalize text-gray-900 dark:text-white">{confidence}</span></div>
                        <div>{l.coverage}: <span className="font-medium text-gray-900 dark:text-white">{toPercent(coverage)}</span></div>
                        <div>{l.missingImpact}: <span className="font-medium capitalize text-gray-900 dark:text-white">{uncertainty.missing_information_impact || 'moderate'}</span></div>
                    </div>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{l.partialNotes}</h4>
                    <ul className="space-y-1">
                        {(uncertainty.partial_detection_notes || []).length > 0 ? (uncertainty.partial_detection_notes || []).map((note: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 dark:text-gray-400">• {note}</li>
                        )) : <li className="text-sm text-gray-500 dark:text-gray-400">{l.notAvailable}</li>}
                    </ul>
                </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{l.decisions}</h3>
                    <div className="mb-3">
                        <span className={`px-2.5 py-1 rounded text-xs font-medium ${getTone(cautionLevel)}`}>
                            {l.cautionLevel}: {cautionLevel}
                        </span>
                    </div>
                    <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{l.actions}</h4>
                    <ul className="space-y-1 mb-3">
                        {(decision.recommended_actions || []).length > 0 ? (decision.recommended_actions || []).map((action: string, i: number) => (
                            <li key={i} className="text-sm text-gray-600 dark:text-gray-400">• {action}</li>
                        )) : <li className="text-sm text-gray-500 dark:text-gray-400">{l.notAvailable}</li>}
                    </ul>
                    <div className="text-sm text-gray-600 dark:text-gray-400">
                        {l.expertReview}: <span className="font-medium text-gray-900 dark:text-white">{decision.expert_review_required ? l.yes : l.no}</span>
                    </div>
                    {decision.expert_review_reason && (
                        <div className="text-sm text-gray-600 dark:text-gray-400 mt-1">{l.reason}: {decision.expert_review_reason}</div>
                    )}
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3">{l.scientific}</h3>
                    <ul className="space-y-2">
                        {scientific.length > 0 ? scientific.map((item: any, i: number) => (
                            <li key={i} className="text-sm rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                                <div className="font-medium text-gray-900 dark:text-white mb-1">{item.claim || '—'}</div>
                                <div className="text-gray-600 dark:text-gray-400">{item.mechanism || l.notAvailable}</div>
                                {item.confidence && <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">{l.confidence}: {item.confidence}</div>}
                            </li>
                        )) : <li className="text-sm text-gray-500 dark:text-gray-400">{l.notAvailable}</li>}
                    </ul>
                </div>
            </div>

            {/* ── Process Risk ──────────────────────────────────────────── */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{l.processRiskSection}</h3>
                        {processRisk.overall_process_risk && (
                            <span className={`px-2.5 py-1 rounded text-xs font-medium ${getTone(processRisk.overall_process_risk)}`}>
                                {l.overallProcessRisk}: {processRisk.overall_process_risk}
                            </span>
                        )}
                    </div>
                    {processRisk.moisture_sensitivity && compactRiskCard(l.moistureSensitivity, processRisk.moisture_sensitivity)}
                    {processRisk.mixing_shear_sensitivity && compactRiskCard(l.shearSensitivity, processRisk.mixing_shear_sensitivity)}
                    {processRisk.storage_stability_concern && compactRiskCard(l.storageConcern, processRisk.storage_stability_concern)}
                    {processRisk.rehydration_behavior?.relevant && (
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
                            <div className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{l.rehydrationBehavior}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{processRisk.rehydration_behavior.notes || l.notAvailable}</div>
                        </div>
                    )}
                    {!processRisk.overall_process_risk && <p className="text-sm text-gray-500 dark:text-gray-400">{l.notAvailable}</p>}
                </div>

                {/* ── Scale-Up Risk ────────────────────────────────────── */}
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{l.scaleUpRiskSection}</h3>
                        {scaleUpRisk.overall_scaleup_risk && (
                            <span className={`px-2.5 py-1 rounded text-xs font-medium ${getTone(scaleUpRisk.overall_scaleup_risk)}`}>
                                {l.overallScaleUpRisk}: {scaleUpRisk.overall_scaleup_risk}
                            </span>
                        )}
                    </div>
                    {scaleUpRisk.temperature_excursion_risk && compactRiskCard(l.tempExcursionRisk, scaleUpRisk.temperature_excursion_risk)}
                    {scaleUpRisk.ph_gradient_risk && compactRiskCard(l.phGradientRisk, scaleUpRisk.ph_gradient_risk)}
                    {scaleUpRisk.dispersion_uniformity_risk && compactRiskCard(l.dispersionRisk, scaleUpRisk.dispersion_uniformity_risk)}
                    {scaleUpRisk.mixing_time_sensitivity && compactRiskCard(l.mixingTimeSensitivity, scaleUpRisk.mixing_time_sensitivity)}
                    {scaleUpRisk.activity_loss_during_scaleup && (
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3 bg-gray-50 dark:bg-gray-800/50">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">{l.activityLoss}</div>
                                {scaleUpRisk.activity_loss_during_scaleup.likelihood && (
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTone(scaleUpRisk.activity_loss_during_scaleup.likelihood)}`}>
                                        {l.likelihood}: {scaleUpRisk.activity_loss_during_scaleup.likelihood}
                                    </span>
                                )}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">{scaleUpRisk.activity_loss_during_scaleup.rationale || l.notAvailable}</div>
                        </div>
                    )}
                    {!scaleUpRisk.overall_scaleup_risk && <p className="text-sm text-gray-500 dark:text-gray-400">{l.notAvailable}</p>}
                </div>
            </div>

            {/* ── Regulatory Impact + Decision Uncertainty ───────────────── */}
            <div className="grid md:grid-cols-2 gap-4">
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 space-y-3">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{l.regulatoryImpactSection}</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-2.5">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{l.stabilityDependentClaims}</div>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${regulatoryImpact.stability_dependent_claims?.applicable ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'}`}>
                                {regulatoryImpact.stability_dependent_claims?.applicable ? l.yes : l.no}
                            </span>
                            {regulatoryImpact.stability_dependent_claims?.rationale && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 line-clamp-2">{regulatoryImpact.stability_dependent_claims.rationale}</div>
                            )}
                        </div>
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-2.5">
                            <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{l.stabilityDataRequired}</div>
                            <span className={`px-2 py-0.5 rounded text-xs font-medium ${regulatoryImpact.stability_data_required ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400' : 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400'}`}>
                                {regulatoryImpact.stability_data_required ? l.yes : l.no}
                            </span>
                        </div>
                    </div>
                    {regulatoryImpact.labeling_risk && (
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                            <div className="flex items-center justify-between gap-2 mb-2">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">{l.labelingRisk}</div>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTone(regulatoryImpact.labeling_risk.level)}`}>
                                    {regulatoryImpact.labeling_risk.level || 'moderate'}
                                </span>
                            </div>
                            {(regulatoryImpact.labeling_risk.notes || []).length > 0 && (
                                <ul className="space-y-1">
                                    {regulatoryImpact.labeling_risk.notes.map((n: string, i: number) => (
                                        <li key={i} className="text-xs text-gray-600 dark:text-gray-400">• {n}</li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    )}
                    {regulatoryImpact.classification_clarity && (
                        <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-3">
                            <div className="flex items-center justify-between gap-2 mb-1">
                                <div className="text-sm font-semibold text-gray-900 dark:text-white">{l.classificationClarity}</div>
                                <span className={`px-2 py-0.5 rounded text-xs font-medium ${getClarity(regulatoryImpact.classification_clarity.level)}`}>
                                    {regulatoryImpact.classification_clarity.level || 'moderate'}
                                </span>
                            </div>
                            <div className="text-xs text-gray-600 dark:text-gray-400">{regulatoryImpact.classification_clarity.rationale || l.notAvailable}</div>
                        </div>
                    )}
                    {!regulatoryImpact.labeling_risk && <p className="text-sm text-gray-500 dark:text-gray-400">{l.notAvailable}</p>}
                </div>

                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800 space-y-3">
                    <div className="flex items-center justify-between">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{l.decisionUncertaintySection}</h3>
                        {decisionUncert.icq_q9_risk_rating && (
                            <span className={`px-2.5 py-1 rounded text-xs font-medium ${getTone(decisionUncert.icq_q9_risk_rating)}`}>
                                {l.icqQ9Rating}: {decisionUncert.icq_q9_risk_rating}
                            </span>
                        )}
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                        {[
                            { label: l.dataCompleteness, value: decisionUncert.data_completeness, styleFunc: getCompleteness },
                            { label: l.evaluationReliability, value: decisionUncert.evaluation_reliability, styleFunc: getTone },
                            { label: l.missingExcipientImpact, value: decisionUncert.missing_excipient_impact, styleFunc: getTone },
                            { label: l.safetyMarginUncertainty, value: decisionUncert.safety_margin_uncertainty, styleFunc: getTone },
                            { label: l.scientificConfidenceLabel, value: decisionUncert.scientific_confidence, styleFunc: getTone },
                        ].filter(x => x.value).map((item, i) => (
                            <div key={i} className="rounded-lg border border-gray-200 dark:border-gray-700 p-2.5">
                                <div className="text-gray-500 dark:text-gray-400 mb-1">{item.label}</div>
                                <span className={`px-1.5 py-0.5 rounded font-medium ${item.styleFunc(item.value)}`}>
                                    {item.value}
                                </span>
                            </div>
                        ))}
                    </div>
                    {(decisionUncert.uncertainty_drivers || []).length > 0 && (
                        <div>
                            <h4 className="text-xs uppercase tracking-wider text-gray-500 dark:text-gray-400 mb-2">{l.uncertaintyDrivers}</h4>
                            <ul className="space-y-1">
                                {decisionUncert.uncertainty_drivers.map((d: string, i: number) => (
                                    <li key={i} className="text-xs text-gray-600 dark:text-gray-400">• {d}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {!decisionUncert.icq_q9_risk_rating && <p className="text-sm text-gray-500 dark:text-gray-400">{l.notAvailable}</p>}
                </div>
            </div>

            {ingredients.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <details className="group" open>
                        <summary className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <span className="font-semibold text-gray-900 dark:text-white">
                                {l.ingredientsTable} ({ingredients.length})
                            </span>
                            <svg className="w-5 h-5 text-gray-400 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                        </summary>
                        <div className="px-5 pb-5 overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="text-left text-xs text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-200 dark:border-gray-700">
                                        <th className="pb-3 pr-4">#</th>
                                        <th className="pb-3 pr-4">{l.ingredient}</th>
                                        <th className="pb-3 pr-4">{l.function}</th>
                                        <th className="pb-3 pr-4">{l.safety}</th>
                                        <th className="pb-3">{l.comedogenic}</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {ingredients.map((ing: any, i: number) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="py-3 pr-4 text-gray-400">{i + 1}</td>
                                            <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                                                {ing.name}
                                                {ing.uncertain && <span className="ml-1 text-orange-500 text-xs">?</span>}
                                            </td>
                                            <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{ing.function_local || ing.function_vi || ing.function || '—'}</td>
                                            <td className="py-3 pr-4">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getSafetyStyle(ing.safety_level)}`}>
                                                    {ing.safety_level || '—'}
                                                </span>
                                            </td>
                                            <td className="py-3">
                                                <span className={`px-2 py-1 rounded text-xs font-medium ${getComedogenicStyle(ing.comedogenic_rating ?? 0)}`}>
                                                    {ing.comedogenic_rating ?? '—'}/5
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </details>
                </div>
            )}
        </div>
    );
}
