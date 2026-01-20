import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

// Common ingredients data
const commonIngredients = [
    { name: 'Hyaluronic Acid', category: 'moisturizer', safety: 'safe', desc_vi: 'Dưỡng ẩm, giữ nước cho da', desc_en: 'Hydrates and retains moisture' },
    { name: 'Niacinamide', category: 'active', safety: 'safe', desc_vi: 'Làm sáng da, se khít lỗ chân lông', desc_en: 'Brightens and minimizes pores' },
    { name: 'Retinol', category: 'active', safety: 'low_risk', desc_vi: 'Chống lão hóa, tái tạo da', desc_en: 'Anti-aging, skin renewal' },
    { name: 'Salicylic Acid', category: 'exfoliant', safety: 'low_risk', desc_vi: 'Trị mụn, thông thoáng lỗ chân lông', desc_en: 'Treats acne, unclogs pores' },
    { name: 'Vitamin C', category: 'active', safety: 'safe', desc_vi: 'Chống oxy hóa, làm sáng da', desc_en: 'Antioxidant, brightening' },
    { name: 'Glycerin', category: 'moisturizer', safety: 'safe', desc_vi: 'Dưỡng ẩm, làm mềm da', desc_en: 'Hydrates and softens skin' },
    { name: 'Centella Asiatica', category: 'soothing', safety: 'safe', desc_vi: 'Làm dịu, phục hồi da', desc_en: 'Soothes and repairs skin' },
    { name: 'Ceramides', category: 'barrier', safety: 'safe', desc_vi: 'Phục hồi hàng rào da', desc_en: 'Restores skin barrier' },
    { name: 'AHA (Glycolic Acid)', category: 'exfoliant', safety: 'low_risk', desc_vi: 'Tẩy tế bào chết, làm sáng', desc_en: 'Exfoliates, brightens' },
    { name: 'BHA', category: 'exfoliant', safety: 'low_risk', desc_vi: 'Trị mụn, kiềm dầu', desc_en: 'Treats acne, controls oil' },
    { name: 'Peptides', category: 'active', safety: 'safe', desc_vi: 'Chống lão hóa, tăng collagen', desc_en: 'Anti-aging, boosts collagen' },
    { name: 'Zinc Oxide', category: 'sunscreen', safety: 'safe', desc_vi: 'Chống nắng vật lý', desc_en: 'Physical sunscreen' },
];

const faqs = [
    {
        q_vi: 'INCI là gì?',
        q_en: 'What is INCI?',
        a_vi: 'INCI (International Nomenclature of Cosmetic Ingredients) là hệ thống tên quốc tế cho các thành phần mỹ phẩm. Đây là tiêu chuẩn toàn cầu giúp người tiêu dùng nhận biết thành phần trong sản phẩm.',
        a_en: 'INCI (International Nomenclature of Cosmetic Ingredients) is the international naming system for cosmetic ingredients. It\'s a global standard that helps consumers identify ingredients in products.',
    },
    {
        q_vi: 'Thứ tự thành phần có ý nghĩa gì?',
        q_en: 'What does the ingredient order mean?',
        a_vi: 'Thành phần được liệt kê theo thứ tự nồng độ giảm dần. 5-7 thành phần đầu tiên thường chiếm phần lớn công thức. Thành phần cuối danh sách thường có nồng độ rất thấp (<1%).',
        a_en: 'Ingredients are listed in descending order of concentration. The first 5-7 ingredients usually make up most of the formula. Ingredients at the end typically have very low concentrations (<1%).',
    },
    {
        q_vi: 'Comedogenic rating là gì?',
        q_en: 'What is comedogenic rating?',
        a_vi: 'Comedogenic rating (0-5) đánh giá khả năng gây tắc nghẽn lỗ chân lông của thành phần. 0 = không gây mụn, 3-5 = có nguy cơ cao gây mụn.',
        a_en: 'Comedogenic rating (0-5) measures an ingredient\'s potential to clog pores. 0 = non-comedogenic, 3-5 = high risk of causing acne.',
    },
    {
        q_vi: 'Những thành phần nào không nên dùng chung?',
        q_en: 'Which ingredients should not be used together?',
        a_vi: 'Một số kết hợp cần tránh: Retinol + AHA/BHA (gây kích ứng), Vitamin C + Niacinamide ở nồng độ cao, Benzoyl Peroxide + Retinol (làm mất hiệu quả).',
        a_en: 'Some combinations to avoid: Retinol + AHA/BHA (can irritate), Vitamin C + high-concentration Niacinamide, Benzoyl Peroxide + Retinol (reduces effectiveness).',
    },
];

const skincareTips = [
    {
        type: 'oily',
        title_vi: 'Da dầu',
        title_en: 'Oily Skin',
        tips_vi: ['Dùng sản phẩm không dầu (oil-free)', 'Sử dụng BHA/Salicylic Acid', 'Không bỏ qua bước dưỡng ẩm', 'Dùng kem chống nắng dạng gel'],
        tips_en: ['Use oil-free products', 'Use BHA/Salicylic Acid', 'Don\'t skip moisturizer', 'Use gel-type sunscreen'],
    },
    {
        type: 'dry',
        title_vi: 'Da khô',
        title_en: 'Dry Skin',
        tips_vi: ['Dùng sữa rửa mặt dịu nhẹ', 'Sử dụng Hyaluronic Acid', 'Thêm dầu dưỡng vào routine', 'Dùng kem dưỡng dạng kem đặc'],
        tips_en: ['Use gentle cleansers', 'Use Hyaluronic Acid', 'Add facial oils to routine', 'Use rich cream moisturizers'],
    },
    {
        type: 'sensitive',
        title_vi: 'Da nhạy cảm',
        title_en: 'Sensitive Skin',
        tips_vi: ['Tránh hương liệu và cồn', 'Dùng Centella Asiatica', 'Patch test sản phẩm mới', 'Giữ routine đơn giản'],
        tips_en: ['Avoid fragrance and alcohol', 'Use Centella Asiatica', 'Patch test new products', 'Keep routine simple'],
    },
    {
        type: 'combination',
        title_vi: 'Da hỗn hợp',
        title_en: 'Combination Skin',
        tips_vi: ['Dùng sản phẩm khác nhau cho từng vùng', 'Niacinamide cân bằng da', 'Dùng toner không cồn', 'Layer sản phẩm từ loãng đến đặc'],
        tips_en: ['Use different products for different zones', 'Niacinamide balances skin', 'Use alcohol-free toner', 'Layer products thin to thick'],
    },
];

export default function Knowledge() {
    const { t, i18n } = useTranslation();
    const [activeTab, setActiveTab] = useState('dictionary');
    const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
    const isVi = i18n.language === 'vi';

    const getSafetyColor = (safety: string) => {
        switch (safety) {
            case 'safe': return 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400';
            case 'low_risk': return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400';
            case 'watch': return 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400';
            default: return 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400';
        }
    };

    const tabs = [
        {
            id: 'dictionary',
            label: t('knowledge.dictionary.title'),
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            )
        },
        {
            id: 'guide',
            label: t('knowledge.guide.title'),
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
            )
        },
        {
            id: 'tips',
            label: t('knowledge.tips.title'),
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
            )
        },
        {
            id: 'faq',
            label: t('knowledge.faq.title'),
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
            )
        },
    ];

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <header className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white mb-3">
                        {t('knowledge.title')}
                    </h1>
                    <p className="text-lg text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                        {t('knowledge.subtitle')}
                    </p>
                </header>

                {/* Tabs */}
                <div className="flex flex-wrap justify-center gap-2 mb-8">
                    {tabs.map(tab => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            className={`flex items-center gap-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 ${activeTab === tab.id
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow-lg'
                                : 'bg-white dark:bg-gray-900 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-800'
                                }`}
                        >
                            <span>{tab.icon}</span>
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-800 p-8">
                    {/* Dictionary Tab */}
                    {activeTab === 'dictionary' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('knowledge.dictionary.title')}</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('knowledge.dictionary.desc')}</p>

                            <div className="grid gap-4">
                                {commonIngredients.map((ing, index) => (
                                    <div
                                        key={index}
                                        className="flex flex-col sm:flex-row sm:items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-800 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex-1">
                                            <h3 className="font-semibold text-gray-900 dark:text-white text-lg">{ing.name}</h3>
                                            <p className="text-gray-600 dark:text-gray-400 mt-1">{isVi ? ing.desc_vi : ing.desc_en}</p>
                                        </div>
                                        <div className="flex gap-2 mt-3 sm:mt-0">
                                            <span className="px-3 py-1 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 rounded-lg text-sm font-medium border border-purple-100 dark:border-purple-800">
                                                {ing.category}
                                            </span>
                                            <span className={`px-3 py-1 rounded-lg text-sm font-medium border border-opacity-20 ${getSafetyColor(ing.safety)}`}>
                                                {ing.safety}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Guide Tab */}
                    {activeTab === 'guide' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('knowledge.guide.title')}</h2>

                            <div className="grid gap-6">
                                <div className="bg-blue-50 dark:bg-blue-900/10 rounded-xl p-6 border border-blue-100 dark:border-blue-900/30">
                                    <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-300 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-800 flex items-center justify-center text-sm">1</span>
                                        {isVi ? 'INCI là gì?' : 'What is INCI?'}
                                    </h3>
                                    <p className="text-blue-800 dark:text-blue-400 leading-relaxed ml-10">
                                        {isVi
                                            ? 'INCI (International Nomenclature of Cosmetic Ingredients) là hệ thống đặt tên quốc tế cho các thành phần mỹ phẩm. Đây là tiêu chuẩn được sử dụng trên toàn thế giới để ghi nhãn sản phẩm.'
                                            : 'INCI (International Nomenclature of Cosmetic Ingredients) is the international naming system for cosmetic ingredients. It is the standard used worldwide for product labeling.'}
                                    </p>
                                </div>

                                <div className="bg-purple-50 dark:bg-purple-900/10 rounded-xl p-6 border border-purple-100 dark:border-purple-900/30">
                                    <h3 className="text-xl font-semibold text-purple-900 dark:text-purple-300 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-purple-100 dark:bg-purple-800 flex items-center justify-center text-sm">2</span>
                                        {isVi ? 'Cách đọc thứ tự thành phần' : 'How to read ingredient order'}
                                    </h3>
                                    <ul className="text-purple-800 dark:text-purple-400 space-y-2 ml-10">
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                            {isVi ? 'Thành phần được liệt kê theo thứ tự nồng độ giảm dần' : 'Ingredients are listed in descending order of concentration'}
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                            {isVi ? '5-7 thành phần đầu tiên chiếm phần lớn công thức' : 'First 5-7 ingredients make up most of the formula'}
                                        </li>
                                        <li className="flex items-start gap-2">
                                            <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400"></span>
                                            {isVi ? 'Thành phần dưới 1% có thể được liệt kê theo bất kỳ thứ tự nào' : 'Ingredients under 1% can be listed in any order'}
                                        </li>
                                    </ul>
                                </div>

                                <div className="bg-pink-50 dark:bg-pink-900/10 rounded-xl p-6 border border-pink-100 dark:border-pink-900/30">
                                    <h3 className="text-xl font-semibold text-pink-900 dark:text-pink-300 mb-4 flex items-center gap-2">
                                        <span className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-800 flex items-center justify-center text-sm">3</span>
                                        {isVi ? 'Các thành phần cần lưu ý' : 'Ingredients to watch out for'}
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 ml-10">
                                        <div>
                                            <h4 className="font-medium text-pink-900 dark:text-pink-300 mb-2 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                </svg>
                                                {isVi ? 'Có thể gây kích ứng:' : 'May cause irritation:'}
                                            </h4>
                                            <ul className="text-sm space-y-1 text-pink-800 dark:text-pink-400">
                                                <li>• Fragrance / Parfum</li>
                                                <li>• Alcohol Denat</li>
                                                <li>• Essential Oils</li>
                                            </ul>
                                        </div>
                                        <div>
                                            <h4 className="font-medium text-pink-900 dark:text-pink-300 mb-2 flex items-center gap-2">
                                                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                </svg>
                                                {isVi ? 'Thường an toàn:' : 'Generally safe:'}
                                            </h4>
                                            <ul className="text-sm space-y-1 text-pink-800 dark:text-pink-400">
                                                <li>• Glycerin</li>
                                                <li>• Hyaluronic Acid</li>
                                                <li>• Ceramides</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Tips Tab */}
                    {activeTab === 'tips' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('knowledge.tips.title')}</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('knowledge.tips.desc')}</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {skincareTips.map((tip, index) => (
                                    <div key={index} className="bg-gray-50 dark:bg-gray-800/50 rounded-xl p-6 border border-gray-200 dark:border-gray-700">
                                        <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-3">
                                            <span className="w-10 h-10 rounded-full bg-white dark:bg-gray-700 flex items-center justify-center text-xl shadow-sm">
                                                {tip.type === 'oily' ? '💧' : tip.type === 'dry' ? '🏜️' : tip.type === 'sensitive' ? '🌸' : '⚖️'}
                                            </span>
                                            {isVi ? tip.title_vi : tip.title_en}
                                        </h3>
                                        <ul className="space-y-3">
                                            {(isVi ? tip.tips_vi : tip.tips_en).map((tipText, i) => (
                                                <li key={i} className="flex items-start gap-3 text-gray-700 dark:text-gray-300 text-sm">
                                                    <svg className="w-5 h-5 text-green-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                    <span>{tipText}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* FAQ Tab */}
                    {activeTab === 'faq' && (
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">{t('knowledge.faq.title')}</h2>
                            <p className="text-gray-600 dark:text-gray-400 mb-6">{t('knowledge.faq.desc')}</p>

                            <div className="space-y-4">
                                {faqs.map((faq, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-200 dark:border-gray-700 rounded-xl overflow-hidden"
                                    >
                                        <button
                                            onClick={() => setExpandedFaq(expandedFaq === index ? null : index)}
                                            className="w-full flex items-center justify-between p-5 bg-gray-50 dark:bg-gray-800/50 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-left"
                                        >
                                            <span className="font-medium text-gray-900 dark:text-white">
                                                {isVi ? faq.q_vi : faq.q_en}
                                            </span>
                                            <svg
                                                className={`w-5 h-5 text-gray-500 transform transition-transform ${expandedFaq === index ? 'rotate-180' : ''}`}
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                            </svg>
                                        </button>
                                        {expandedFaq === index && (
                                            <div className="p-5 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 text-gray-600 dark:text-gray-400 leading-relaxed">
                                                {isVi ? faq.a_vi : faq.a_en}
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
