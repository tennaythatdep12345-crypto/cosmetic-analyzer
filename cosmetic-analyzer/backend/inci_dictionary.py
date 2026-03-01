"""
INCI Dictionary for Cosmetic Ingredient Fuzzy Matching.

Contains canonical INCI names grouped by functional category.
Extend this list as needed — the stabilizer uses ALL entries as
the reference corpus for fuzzy matching.
"""

# fmt: off
INCI_DICTIONARY: list[str] = [
    # ── Water / Solvents ──────────────────────────────────────────────────
    "Water", "Aqua", "Butylene Glycol", "Propylene Glycol", "Dipropylene Glycol",
    "Glycerin", "Glycerol", "Ethanol", "Alcohol Denat", "Pentylene Glycol",
    "Hexylene Glycol", "Caprylyl Glycol", "Ethoxydiglycol", "Propanediol",

    # ── Humectants ────────────────────────────────────────────────────────
    "Hyaluronic Acid", "Sodium Hyaluronate", "Betaine", "Trehalose",
    "Sodium PCA", "PCA", "Urea", "Sorbitol", "Xylitol", "Inositol",
    "Panthenol", "Polyglutamic Acid",

    # ── Emollients / Oils ─────────────────────────────────────────────────
    "Squalane", "Squalene", "Dimethicone", "Cyclopentasiloxane",
    "Cyclomethicone", "Cetyl Alcohol", "Cetearyl Alcohol", "Stearyl Alcohol",
    "Behenyl Alcohol", "Isopropyl Myristate", "Isopropyl Palmitate",
    "Caprylic/Capric Triglyceride", "Jojoba Oil", "Simmondsia Chinensis Seed Oil",
    "Argan Oil", "Argania Spinosa Kernel Oil", "Rosehip Oil",
    "Rosa Canina Fruit Oil", "Marula Oil", "Sclerocarya Birrea Seed Oil",
    "Shea Butter", "Butyrospermum Parkii Butter", "Cocoa Butter",
    "Theobroma Cacao Seed Butter", "Sweet Almond Oil", "Prunus Amygdalus Dulcis Oil",
    "Sunflower Seed Oil", "Helianthus Annuus Seed Oil",
    "Coconut Oil", "Cocos Nucifera Oil",
    "C12-15 Alkyl Benzoate", "Ethylhexyl Palmitate", "Ethylhexyl Stearate",
    "Meadowfoam Seed Oil", "Limnanthes Alba Seed Oil",
    "Emu Oil", "Mineral Oil", "Paraffinum Liquidum",
    "Bis-PEG/PPG-14/14 Dimethicone", "Phenyl Trimethicone",

    # ── Ceramides / Lipid Barrier ─────────────────────────────────────────
    "Ceramide NP", "Ceramide AP", "Ceramide EOP", "Ceramide NS", "Ceramide AS",
    "Ceramide 1", "Ceramide 2", "Ceramide 3", "Ceramide 6 II",
    "Ceramides", "Phytosphingosine", "Sphingosine", "Cholesterol",
    "Fatty Acids", "Linoleic Acid", "Linolenic Acid",

    # ── Emulsifiers / Surfactants ─────────────────────────────────────────
    "Ceteareth-20", "Ceteareth-12", "Steareth-2", "Steareth-20",
    "Polysorbate 20", "Polysorbate 60", "Polysorbate 80",
    "Sorbitan Stearate", "Sorbitan Oleate",
    "PEG-40 Hydrogenated Castor Oil", "PEG-60 Hydrogenated Castor Oil",
    "Glyceryl Stearate", "Glyceryl Stearate SE", "Glyceryl Oleate",
    "Lecithin", "Hydrogenated Lecithin", "Sodium Cocoamphoacetate",
    "Cocamidopropyl Betaine", "Cocamidopropyl Hydroxysultaine",
    "Sodium Lauryl Sulfate", "Sodium Laureth Sulfate", "Ammonium Lauryl Sulfate",
    "Ammonium Laureth Sulfate", "Sodium Cocoyl Isethionate",
    "Sodium Lauroyl Sarcosinate", "Disodium Laureth Sulfosuccinate",
    "Sodium Lauroyl Glutamate", "Sodium Cocoyl Glutamate",
    "Decyl Glucoside", "Lauryl Glucoside", "Caprylyl/Capryl Glucoside",
    "Coco-Glucoside", "Polyglyceryl-4 Laurate",

    # ── Thickeners / Polymers / Gels ──────────────────────────────────────
    "Carbomer", "Acrylates Copolymer", "Acrylates/C10-30 Alkyl Acrylate Crosspolymer",
    "Carbopol", "Xanthan Gum", "Guar Gum", "Locust Bean Gum",
    "Hydroxyethylcellulose", "Hydroxypropyl Methylcellulose",
    "Hydroxypropyl Guar", "Cellulose Gum", "Sodium Carboxymethylcellulose",
    "Carrageenan", "Agar", "Gelatin", "Pectin",
    "Polyacrylate Crosspolymer-6", "Sodium Polyacrylate",

    # ── pH Adjusters / Buffers ────────────────────────────────────────────
    "Triethanolamine", "TEA", "Sodium Hydroxide", "Potassium Hydroxide",
    "Citric Acid", "Lactic Acid", "Sodium Citrate", "Sodium Lactate",
    "Trisodium EDTA", "Disodium EDTA", "Tetrasodium EDTA",
    "Aminomethyl Propanol", "Arginine",

    # ── Actives / AHA / BHA ───────────────────────────────────────────────
    "Salicylic Acid", "Glycolic Acid", "Lactic Acid", "Mandelic Acid",
    "Malic Acid", "Tartaric Acid", "Azelaic Acid", "Pyruvic Acid",
    "Benzoyl Peroxide", "Resorcinol",

    # ── Actives / Vitamins ────────────────────────────────────────────────
    "Ascorbic Acid", "Vitamin C", "Sodium Ascorbyl Phosphate",
    "Ascorbyl Glucoside", "Magnesium Ascorbyl Phosphate",
    "Ascorbyl Tetraisopalmitate", "3-O-Ethyl Ascorbic Acid",
    "Niacinamide", "Nicotinamide", "Tocopherol", "Vitamin E",
    "Tocopheryl Acetate", "Retinol", "Retinal", "Retinaldehyde",
    "Retinyl Palmitate", "Retinyl Acetate", "Hydroxypinacolone Retinoate",
    "Bakuchiol", "Rosehip Seed Oil",

    # ── Actives / Brightening ─────────────────────────────────────────────
    "Kojic Acid", "Arbutin", "Alpha-Arbutin", "Beta-Arbutin",
    "Tranexamic Acid", "Phytic Acid", "Licorice Root Extract",
    "Glycyrrhiza Glabra Root Extract", "Resveratrol",
    "Ferulic Acid", "Gallic Acid", "Ellagic Acid",

    # ── Actives / Peptides ────────────────────────────────────────────────
    "Palmitoyl Pentapeptide-4", "Matrixyl", "Palmitoyl Tripeptide-1",
    "Palmitoyl Tetrapeptide-7", "Acetyl Hexapeptide-3", "Argireline",
    "Copper Tripeptide-1", "Leuphasyl", "Syn-Ake",

    # ── Actives / Peptide Complexes ───────────────────────────────────────
    "Tripeptide-1", "Hexapeptide-11", "Dipeptide-2", "Tripeptide-10 Citrulline",
    "Oligopeptide-1", "Oligopeptide-68",

    # ── Anti-Acne / Anti-Bacterial ────────────────────────────────────────
    "Zinc PCA", "Zinc Gluconate", "Niacinamide", "Tea Tree Oil",
    "Melaleuca Alternifolia Leaf Oil", "Sulfur",

    # ── Preservatives ─────────────────────────────────────────────────────
    "Phenoxyethanol", "Ethylhexylglycerin", "Benzyl Alcohol",
    "Dehydroacetic Acid", "Benzoic Acid", "Sorbic Acid",
    "Sodium Benzoate", "Potassium Sorbate",
    "Chlorphenesin", "Caprylyl Glycol",
    "Methylparaben", "Ethylparaben", "Propylparaben", "Butylparaben",
    "Isobutylparaben", "Methylisothiazolinone", "Methylchloroisothiazolinone",
    "Formaldehyde", "DMDM Hydantoin", "Imidazolidinyl Urea",
    "Diazolidinyl Urea", "Sodium Hydroxymethylglycinate",
    "Chlorhexidine Digluconate", "Triclosan",

    # ── Antioxidants ──────────────────────────────────────────────────────
    "BHT", "BHA", "Tocopherol", "Tocopheryl Acetate",
    "Ascorbyl Palmitate", "Propyl Gallate", "Erythorbic Acid",
    "Ethylhexyl Methoxycinnamate",

    # ── Sunscreen Filters ─────────────────────────────────────────────────
    "Zinc Oxide", "Titanium Dioxide", "Octinoxate", "Avobenzone",
    "Octocrylene", "Oxybenzone", "Homosalate", "Octisalate",
    "Tinosorb S", "Tinosorb M", "Uvinul A Plus", "Uvinul T 150",
    "Mexoryl SX", "Mexoryl XL", "Ecamsule",
    "Bis-Ethylhexyloxyphenol Methoxyphenyl Triazine",

    # ── Fragrance / Allergens ─────────────────────────────────────────────
    "Parfum", "Fragrance", "Linalool", "Limonene", "Citronellol",
    "Geraniol", "Eugenol", "Benzyl Alcohol", "Benzyl Salicylate",
    "Alpha-Isomethyl Ionone", "Hydroxycitronellal", "Coumarin",
    "Isoeugenol", "Cinnamyl Alcohol", "Cinnamal",
    "Amyl Cinnamal", "Amylcinnamyl Alcohol",
    "Anise Alcohol", "Benzyl Benzoate", "Benzyl Cinnamate",
    "Farnesol", "Hexyl Cinnamal", "Methyl 2-Octynoate",

    # ── Botanical Extracts ────────────────────────────────────────────────
    "Aloe Vera", "Aloe Barbadensis Leaf Juice", "Green Tea Extract",
    "Camellia Sinensis Leaf Extract", "Centella Asiatica Extract",
    "Asiaticoside", "Madecassoside", "Asiatic Acid", "Madecassic Acid",
    "Chamomile Extract", "Matricaria Chamomilla Flower Extract",
    "Calendula Extract", "Calendula Officinalis Flower Extract",
    "Lavender Extract", "Lavandula Angustifolia Extract",
    "Turmeric Extract", "Curcuma Longa Root Extract",
    "Rosemary Extract", "Rosmarinus Officinalis Leaf Extract",
    "Oat Extract", "Avena Sativa Kernel Extract",
    "Mushroom Extract", "Tremella Fuciformis Sporocarp Extract",
    "Snail Secretion Filtrate", "Gardenia Florida Fruit Extract",
    "Saccharomyces Ferment Filtrate", "Bifida Ferment Lysate",
    "Lactobacillus Ferment",

    # ── Film Formers / Occlusive ──────────────────────────────────────────
    "Petrolatum", "Lanolin", "Lanolin Alcohol", "Beeswax", "Cera Alba",
    "Carnauba Wax", "Copernicia Cerifera Cera", "Candelilla Wax",
    "Euphorbia Cerifera Cera", "Ozokerite", "Ceresin",

    # ── Chelating Agents ──────────────────────────────────────────────────
    "EDTA", "Disodium EDTA", "Tetrasodium EDTA", "Phytic Acid",
    "Sodium Gluconate", "Sodium Metabisulfite",

    # ── Colorants / Pigments ──────────────────────────────────────────────
    "Iron Oxide", "Mica", "CI 77891", "CI 77499", "CI 77492", "CI 77491",
    "Ultramarines", "CI 77007",
]

# Deduplicate while preserving order
seen: set[str] = set()
_deduped: list[str] = []
for _name in INCI_DICTIONARY:
    _key = _name.lower()
    if _key not in seen:
        seen.add(_key)
        _deduped.append(_name)
INCI_DICTIONARY = _deduped
del seen, _deduped, _key, _name
# fmt: on
