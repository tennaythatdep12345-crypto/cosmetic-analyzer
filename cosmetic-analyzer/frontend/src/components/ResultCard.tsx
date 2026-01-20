interface ResultCardProps {
    data: any;
}

const skinTypeLabels: Record<string, string> = {
    "normal": "Peau normale",
    "oily": "Peau grasse",
    "dry": "Peau sèche",
    "combination": "Peau mixte",
    "sensitive": "Peau sensible",
    "acne-prone": "Peau acnéique"
};

const interactionLabels: Record<string, string> = {
    "retinol": "Retinol / Tretinoin",
    "aha_bha": "AHA / BHA (Acid)",
    "vitamin_c": "Vitamin C",
    "benzoyl_peroxide": "Benzoyl Peroxide",
    "niacinamide": "Niacinamide"
};

export default function ResultCard({ data }: ResultCardProps) {
    const payload = data?.result ? data.result : data;
    const score = payload.recommendation_score ?? 0;

    const getScoreInfo = (score: number) => {
        if (score >= 80) return { color: 'from-green-500 to-emerald-600', bg: 'bg-green-500', label: 'Excellent' };
        if (score >= 60) return { color: 'from-blue-500 to-cyan-600', bg: 'bg-blue-500', label: 'Bon' };
        if (score >= 40) return { color: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-500', label: 'Moyen' };
        return { color: 'from-red-500 to-rose-600', bg: 'bg-red-500', label: 'À considérer' };
    };

    const scoreInfo = getScoreInfo(score);

    const getSafetyStyle = (level: string) => {
        switch (level?.toLowerCase()) {
            case 'safe': return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
            case 'low_risk': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400';
            case 'watch': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400';
            case 'avoid': return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
            default: return 'bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400';
        }
    };

    const getComedogenicStyle = (rating: number) => {
        if (rating >= 3) return 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400';
        if (rating >= 1) return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/40 dark:text-yellow-400';
        return 'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-400';
    };

    return (
        <div className="space-y-6">
            {/* Hero Section - Score Card */}
            <div className={`bg-gradient-to-r ${scoreInfo.color} rounded-2xl p-6 text-white shadow-lg`}>
                <div className="flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-1">{payload.product_name || "Kết quả phân tích"}</h2>
                        {payload.product_type && (
                            <p className="text-white/80 text-sm">{payload.product_type}</p>
                        )}
                    </div>
                    <div className="text-right">
                        <div className="text-5xl font-bold">{score}</div>
                        <div className="text-white/80 text-sm">{scoreInfo.label}</div>
                    </div>
                </div>

                {/* Skin Types */}
                {payload.suitable_for_skin_types?.length > 0 && (
                    <div className="mt-5 pt-5 border-t border-white/20">
                        <div className="text-xs text-white/70 uppercase tracking-wider mb-2">Convient à</div>
                        <div className="flex flex-wrap gap-2">
                            {payload.suitable_for_skin_types.map((type: string, i: number) => (
                                <span key={i} className="px-3 py-1 bg-white/20 backdrop-blur rounded-full text-sm">
                                    {skinTypeLabels[type] || type}
                                </span>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Top Ingredients */}
            {payload.top_ingredients?.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                        Ingrédients principaux
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {payload.top_ingredients.map((ing: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 rounded-lg text-sm font-medium">
                                {i + 1}. {ing}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Pros & Cons - Side by Side */}
            {(payload.pros?.length > 0 || payload.cons?.length > 0) && (
                <div className="grid md:grid-cols-2 gap-4">
                    {payload.pros?.length > 0 && (
                        <div className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 rounded-xl p-5 border border-green-200 dark:border-green-800">
                            <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                </svg>
                                Avantages
                            </h3>
                            <ul className="space-y-2">
                                {payload.pros.map((pro: string, i: number) => (
                                    <li key={i} className="text-sm text-green-800 dark:text-green-300 flex items-start gap-2">
                                        <span className="text-green-500 mt-1 flex-shrink-0">✓</span>
                                        <span>{pro}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {payload.cons?.length > 0 && (
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-900/20 dark:to-amber-900/20 rounded-xl p-5 border border-orange-200 dark:border-orange-800">
                            <h3 className="font-semibold text-orange-800 dark:text-orange-300 mb-3 flex items-center gap-2">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                Inconvénients
                            </h3>
                            <ul className="space-y-2">
                                {payload.cons.map((con: string, i: number) => (
                                    <li key={i} className="text-sm text-orange-800 dark:text-orange-300 flex items-start gap-2">
                                        <span className="text-orange-500 mt-1 flex-shrink-0">!</span>
                                        <span>{con}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Strengths & Usage Notes */}
            {payload.overall_assessment && (
                <div className="grid md:grid-cols-2 gap-4">
                    {payload.overall_assessment.strengths?.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border-l-4 border-emerald-500 shadow-sm">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">💪 Points forts</h3>
                            <ul className="space-y-2">
                                {payload.overall_assessment.strengths.map((item: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                        <span className="text-emerald-500 mt-0.5">✓</span>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {payload.overall_assessment.usage_notes?.length > 0 && (
                        <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border-l-4 border-blue-500 shadow-sm">
                            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">📋 Conseils d’utilisation</h3>
                            <ul className="space-y-2">
                                {payload.overall_assessment.usage_notes.map((note: string, i: number) => (
                                    <li key={i} className="text-sm text-gray-600 dark:text-gray-400 flex items-start gap-2">
                                        <span className="text-blue-500">→</span>
                                        {note}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            )}

            {/* Interactions Grid */}
            {payload.ingredient_interactions && typeof payload.ingredient_interactions === 'object' && (
                <div className="bg-white dark:bg-gray-900 rounded-xl p-5 border border-gray-200 dark:border-gray-800">
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                        Interactions avec les actifs
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                        {Object.entries(payload.ingredient_interactions).map(([key, value]: [string, any]) => {
                            const isOk = value?.includes('Peut être utilisé(e)');
                            const isAvoid = value?.includes('À ne pas utiliser');
                            return (
                                <div key={key} className={`rounded-lg p-3 text-center ${isOk ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' :
                                        isAvoid ? 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800' :
                                            'bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700'
                                    }`}>
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">{interactionLabels[key] || key}</div>
                                    <div className={`text-sm font-semibold ${isOk ? 'text-green-600 dark:text-green-400' :
                                            isAvoid ? 'text-red-600 dark:text-red-400' :
                                                'text-gray-400'
                                        }`}>
                                        {isOk ? '✓ Compatible' : isAvoid ? '✗ À éviter' : 'Sans interaction'}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Warnings */}
            {payload.warnings?.length > 0 && (
                <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-5 border border-red-200 dark:border-red-800">
                    <h3 className="font-semibold text-red-800 dark:text-red-300 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                        </svg>
                        Avertissements importants
                    </h3>
                    <ul className="space-y-2">
                        {payload.warnings.map((warning: string, i: number) => (
                            <li key={i} className="text-sm text-red-700 dark:text-red-400 flex items-start gap-2">
                                <span className="text-red-500 mt-0.5">•</span>
                                {warning}
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Notable Ingredients */}
            {payload.notable_ingredients?.length > 0 && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-5 border border-purple-200 dark:border-purple-800">
                    <h3 className="text-sm font-semibold text-purple-800 dark:text-purple-300 mb-3 flex items-center gap-2">
                        ⭐ Ingrédients clés
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {payload.notable_ingredients.map((ing: string, i: number) => (
                            <span key={i} className="px-3 py-1.5 bg-white dark:bg-gray-800 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium shadow-sm">
                                {ing}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Ingredients Table */}
            {payload.ingredients_analyzed?.length > 0 && (
                <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    <details className="group">
                        <summary className="px-5 py-4 flex items-center justify-between cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50">
                            <span className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                                <span className="w-2 h-2 rounded-full bg-gray-400"></span>
                                Liste des ingrédients ({payload.ingredients_analyzed.length})
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
                                        <th className="pb-3 pr-4">Ingrédients</th>
                                        <th className="pb-3 pr-4">Propriétés</th>
                                        <th className="pb-3 pr-4">Sécurité</th>
                                        <th className="pb-3">Comédogénicité</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {payload.ingredients_analyzed.map((ing: any, i: number) => (
                                        <tr key={i} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                                            <td className="py-3 pr-4 text-gray-400">{i + 1}</td>
                                            <td className="py-3 pr-4 font-medium text-gray-900 dark:text-white">
                                                {ing.name}
                                                {ing.uncertain && <span className="ml-1 text-orange-500 text-xs">?</span>}
                                            </td>
                                            <td className="py-3 pr-4 text-gray-600 dark:text-gray-400">{ing.function_vi || ing.function || '—'}</td>
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
