import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { analyzeImage, analyzeText } from '../api';
import ResultCard from '../components/ResultCard';

const PRODUCT_TYPES = [
    'cleanser', 'moisturizer', 'serum', 'sunscreen', 'toner', 'mask', 'other'
];

export default function Analyzer() {
    const { t, i18n } = useTranslation();
    const fileRef = useRef<HTMLInputElement | null>(null);
    const [activeTab, setActiveTab] = useState<'image' | 'text'>('image');
    const [previews, setPreviews] = useState<string[]>([]);
    const [results, setResults] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
    // Text / INCI form state
    const [productType, setProductType] = useState('cleanser');
    const [inciText, setInciText] = useState('');
    const [claimsText, setClaimsText] = useState('');

    function readFileAsBase64(file: File): Promise<string> {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result as string);
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsDataURL(file);
        });
    }

    async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const files = Array.from(e.target.files || []);
        if (!files.length) return;

        const imageFiles = files.filter(f => f.type.startsWith('image/'));
        if (imageFiles.length === 0) {
            setError('Please select image files.');
            return;
        }
        const oversized = imageFiles.filter(f => f.size > 10 * 1024 * 1024);
        if (oversized.length > 0) {
            setError(`${oversized.length} file(s) exceed 10MB limit and will be skipped.`);
        }
        const validFiles = imageFiles.filter(f => f.size <= 10 * 1024 * 1024);
        if (validFiles.length === 0) return;

        setLoading(true);
        setResults([]);
        setError(null);
        setProgress({ current: 0, total: validFiles.length });

        // Read all previews first
        const bases64: string[] = [];
        for (const f of validFiles) {
            try { bases64.push(await readFileAsBase64(f)); } catch { /* skip */ }
        }
        setPreviews(bases64);

        // Analyze sequentially
        const allResults: any[] = [];
        for (let i = 0; i < bases64.length; i++) {
            setProgress({ current: i + 1, total: bases64.length });
            try {
                const res = await analyzeImage(bases64[i], i18n.language);
                if (res.ok) {
                    allResults.push({ ...(res.result || res), _imageIndex: i, _base64: bases64[i] });
                } else {
                    allResults.push({ _error: res.error || 'Analysis failed', _imageIndex: i, _base64: bases64[i] });
                }
            } catch (err: any) {
                allResults.push({ _error: err.response?.data?.error || err.message || 'Failed to analyze', _imageIndex: i, _base64: bases64[i] });
            }
            setResults([...allResults]);
        }

        setLoading(false);
        setProgress(null);
    }

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
        if (droppedFiles.length && fileRef.current) {
            const dataTransfer = new DataTransfer();
            droppedFiles.forEach(f => dataTransfer.items.add(f));
            fileRef.current.files = dataTransfer.files;
            fileRef.current.dispatchEvent(new Event('change', { bubbles: true }));
        }
    };

    async function handleTextAnalysis(e: React.FormEvent) {
        e.preventDefault();
        if (!inciText.trim()) {
            setError('Please enter an INCI ingredient list.');
            return;
        }
        setLoading(true);
        setResults([]);
        setError(null);
        try {
            const res = await analyzeText(productType, inciText.trim(), claimsText.trim(), i18n.language);
            if (res.ok) {
                setResults([res.result || res]);
            } else {
                setError(res.error || 'Analysis failed');
            }
        } catch (err: any) {
            setError(err.response?.data?.error || err.message || 'Failed to analyze. Please try again.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 py-12 px-4">
            <div className="max-w-4xl mx-auto">
                {/* Header */}
                <header className="text-center mb-10">
                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white mb-3">
                        {t('analyzer.title')}
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400 max-w-xl mx-auto">
                        {t('analyzer.subtitle')}
                    </p>
                </header>

                {/* Tab Switcher */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => { setActiveTab('image'); setResults([]); setPreviews([]); setError(null); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeTab === 'image'
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow'
                                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        Image Upload
                    </button>
                    <button
                        onClick={() => { setActiveTab('text'); setResults([]); setPreviews([]); setError(null); }}
                        className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                            activeTab === 'text'
                                ? 'bg-gray-900 dark:bg-white text-white dark:text-gray-900 shadow'
                                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
                        }`}
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Text / INCI Input
                    </button>
                </div>

                {/* Text INCI Form */}
                {activeTab === 'text' && (
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-6">
                        <form onSubmit={handleTextAnalysis} className="space-y-5">
                            {/* Product Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Product Type
                                </label>
                                <select
                                    value={productType}
                                    onChange={e => setProductType(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                                >
                                    {PRODUCT_TYPES.map(pt => (
                                        <option key={pt} value={pt}>{pt.charAt(0).toUpperCase() + pt.slice(1)}</option>
                                    ))}
                                </select>
                            </div>

                            {/* INCI List */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    INCI List <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={inciText}
                                    onChange={e => setInciText(e.target.value)}
                                    placeholder={`Water, Sodium Laureth Sulfate, Cocamidopropyl Betaine, Glycerin, Salicylic Acid, Phenoxyethanol...`}
                                    rows={6}
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2.5 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white resize-y"
                                />
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Paste INCI names separated by commas or line breaks.</p>
                            </div>

                            {/* Claims */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                    Claims <span className="text-gray-400 font-normal">(optional)</span>
                                </label>
                                <input
                                    type="text"
                                    value={claimsText}
                                    onChange={e => setClaimsText(e.target.value)}
                                    placeholder="e.g. exfoliating, anti-acne, sensitive skin"
                                    className="w-full rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 dark:focus:ring-white"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !inciText.trim()}
                                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors"
                            >
                                {loading ? (
                                    <><div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" /> Analyzing...</>
                                ) : (
                                    <><svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg> Run INCI Analysis</>
                                )}
                            </button>
                        </form>
                    </div>
                )}

                {/* Upload Card */}
                {activeTab === 'image' && <div
                    className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 mb-6"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={handleDrop}
                >
                    <div className="text-center">
                        {/* Upload Area */}
                        <div className="border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl p-8 mb-6 hover:border-gray-300 dark:hover:border-gray-600 transition-colors">
                            {previews.length > 0 ? (
                                <div className="flex flex-wrap justify-center gap-3 mb-4">
                                    {previews.map((src, idx) => (
                                        <div key={idx} className="relative">
                                            <img src={src} alt={`Preview ${idx + 1}`} className="w-28 h-28 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                                            <span className="absolute top-1 right-1 bg-black/60 text-white text-xs rounded px-1">{idx + 1}</span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <svg className="w-12 h-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            )}
                            <p className="text-gray-700 dark:text-gray-300 mb-1">
                                {t('analyzer.upload.title')}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-500">
                                {t('analyzer.upload.dragDrop')} — Có thể chọn nhiều ảnh cùng lúc
                            </p>
                        </div>

                        {/* Button */}
                        <div className="flex justify-center">
                            <label className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-lg cursor-pointer font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-colors">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                {t('analyzer.upload.button')}
                                <input
                                    ref={fileRef}
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFile}
                                    className="hidden"
                                />
                            </label>
                        </div>
                    </div>
                </div>}

                {/* Tips */}
                {activeTab === 'image' && <div className="bg-blue-50 dark:bg-blue-950/30 rounded-xl p-5 mb-6">
                    <h4 className="font-medium text-blue-900 dark:text-blue-300 mb-3 flex items-center gap-2">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        {t('analyzer.upload.tips.title')}
                    </h4>
                    <ul className="text-sm text-blue-800 dark:text-blue-400 space-y-1.5 ml-7">
                        <li className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                            {t('analyzer.upload.tips.tip1')}
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                            {t('analyzer.upload.tips.tip2')}
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                            {t('analyzer.upload.tips.tip3')}
                        </li>
                        <li className="flex items-center gap-2">
                            <span className="w-1 h-1 rounded-full bg-blue-500"></span>
                            {t('analyzer.upload.tips.tip4')}
                        </li>
                    </ul>
                </div>}

                {/* Loading State */}
                {loading && (
                    <div className="text-center py-12">
                        <div className="inline-flex items-center gap-3 bg-white dark:bg-gray-900 px-6 py-4 rounded-xl border border-gray-200 dark:border-gray-800">
                            <div className="w-5 h-5 border-2 border-gray-900 dark:border-white border-t-transparent rounded-full animate-spin"></div>
                            <span className="text-gray-700 dark:text-gray-300">
                                {progress && progress.total > 1
                                    ? `Đang phân tích ảnh ${progress.current}/${progress.total}…`
                                    : t('analyzer.analyzing')}
                            </span>
                        </div>
                    </div>
                )}

                {/* Error State */}
                {error && (
                    <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4 rounded-xl mb-6">
                        <div className="flex items-start gap-3">
                            <svg className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <div>
                                <h3 className="font-medium text-red-800 dark:text-red-300 mb-1">{t('analyzer.error.title')}</h3>
                                <p className="text-red-700 dark:text-red-400 text-sm">{error}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* Results */}
                {!loading && results.length > 0 && (
                    <div className="space-y-8">
                        {results.length > 1 && (
                            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
                                {results.length} ảnh đã phân tích
                            </p>
                        )}
                        {results.map((r, idx) => (
                            <div key={idx}>
                                {results.length > 1 && (
                                    <div className="flex items-center gap-3 mb-3">
                                        <img src={r._base64} alt={`img ${idx+1}`} className="w-12 h-12 object-cover rounded-lg border border-gray-200 dark:border-gray-700" />
                                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Ảnh {idx + 1}</span>
                                    </div>
                                )}
                                {r._error
                                    ? <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-900 p-4 rounded-xl text-red-700 dark:text-red-400 text-sm">{r._error}</div>
                                    : <ResultCard data={r} />}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
