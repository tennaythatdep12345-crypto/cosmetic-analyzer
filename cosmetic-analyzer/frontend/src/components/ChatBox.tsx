import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Message {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

const API_URL = 'http://localhost:3001';

export default function ChatBox() {
    const { t, i18n } = useTranslation();
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const [isOpen, setIsOpen] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const sessionId = useRef(`session_${Date.now()}`);

    // Scroll to bottom when new messages
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Focus input when opened
    useEffect(() => {
        if (isOpen) {
            inputRef.current?.focus();
        }
    }, [isOpen]);

    // Welcome message
    useEffect(() => {
        if (isOpen && messages.length === 0) {
            const welcomeMsg = i18n.language === 'vi'
                ? 'Xin chào! 👋 Tôi là SkinLab AI - trợ lý tư vấn mỹ phẩm của bạn. Hãy hỏi tôi về thành phần mỹ phẩm, chăm sóc da, hoặc bất kỳ vấn đề da liễu nào nhé!'
                : i18n.language === 'fr'
                    ? 'Bonjour! 👋 Je suis SkinLab AI - votre assistant cosmétique. Posez-moi des questions sur les ingrédients, les soins de la peau, ou tout problème dermatologique!'
                    : 'Hello! 👋 I\'m SkinLab AI - your cosmetic advisor. Ask me about ingredients, skincare routines, or any skin concerns!';

            setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: welcomeMsg,
                timestamp: new Date()
            }]);
        }
    }, [isOpen, i18n.language]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage: Message = {
            id: `user_${Date.now()}`,
            role: 'user',
            content: input.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMessage]);
        setInput('');
        setLoading(true);

        try {
            const response = await fetch(`${API_URL}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage.content,
                    sessionId: sessionId.current,
                    language: i18n.language
                })
            });

            const data = await response.json();

            if (data.ok) {
                setMessages(prev => [...prev, {
                    id: `assistant_${Date.now()}`,
                    role: 'assistant',
                    content: data.reply,
                    timestamp: new Date()
                }]);
            } else {
                throw new Error(data.error || 'Failed to get response');
            }
        } catch (error: any) {
            setMessages(prev => [...prev, {
                id: `error_${Date.now()}`,
                role: 'assistant',
                content: `❌ ${error.message || 'Có lỗi xảy ra. Vui lòng thử lại.'}`,
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const clearChat = async () => {
        try {
            await fetch(`${API_URL}/chat/clear`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ sessionId: sessionId.current })
            });
        } catch (e) {
            // Ignore
        }
        setMessages([]);
        sessionId.current = `session_${Date.now()}`;
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    };

    // Quick suggestions
    const suggestions = i18n.language === 'vi'
        ? ['Da dầu nên dùng gì?', 'Retinol dùng sao?', 'Niacinamide tốt không?']
        : i18n.language === 'fr'
            ? ['Peau grasse?', 'Comment utiliser le rétinol?', 'Niacinamide?']
            : ['Oily skin routine?', 'How to use retinol?', 'Is niacinamide good?'];

    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full shadow-2xl flex items-center justify-center transition-all duration-300 hover:scale-110 ${isOpen
                        ? 'bg-gray-600 dark:bg-gray-700'
                        : 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 animate-pulse-glow'
                    }`}
                aria-label="Toggle chat"
            >
                {isOpen ? (
                    <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                ) : (
                    <span className="text-3xl">💬</span>
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] h-[500px] max-h-[calc(100vh-8rem)] bg-white dark:bg-gray-800 rounded-2xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden animate-slide-up">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 p-4 text-white flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🤖</span>
                            <div>
                                <h3 className="font-bold">SkinLab AI</h3>
                                <p className="text-xs text-white/80">
                                    {i18n.language === 'vi' ? 'Tư vấn mỹ phẩm' : i18n.language === 'fr' ? 'Conseiller beauté' : 'Beauty Advisor'}
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={clearChat}
                            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                            title="Clear chat"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                        </button>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-900">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[80%] rounded-2xl px-4 py-3 ${msg.role === 'user'
                                            ? 'bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-br-md'
                                            : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 shadow-md rounded-bl-md'
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {loading && (
                            <div className="flex justify-start">
                                <div className="bg-white dark:bg-gray-700 rounded-2xl px-4 py-3 shadow-md rounded-bl-md">
                                    <div className="flex gap-1">
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></span>
                                        <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Quick suggestions */}
                    {messages.length <= 1 && (
                        <div className="px-4 py-2 flex gap-2 overflow-x-auto bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
                            {suggestions.map((s, i) => (
                                <button
                                    key={i}
                                    onClick={() => {
                                        setInput(s);
                                        inputRef.current?.focus();
                                    }}
                                    className="flex-shrink-0 px-3 py-1 text-xs bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full border border-gray-200 dark:border-gray-600 hover:bg-pink-50 dark:hover:bg-pink-900/20 hover:border-pink-300 transition-colors"
                                >
                                    {s}
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Input */}
                    <div className="p-4 bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex gap-2">
                            <input
                                ref={inputRef}
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={i18n.language === 'vi' ? 'Nhập câu hỏi...' : i18n.language === 'fr' ? 'Posez votre question...' : 'Type your question...'}
                                className="flex-1 px-4 py-2 bg-gray-100 dark:bg-gray-700 border-0 rounded-full focus:ring-2 focus:ring-pink-500 dark:text-white placeholder-gray-500"
                                disabled={loading}
                            />
                            <button
                                onClick={sendMessage}
                                disabled={!input.trim() || loading}
                                className="w-10 h-10 bg-gradient-to-r from-pink-500 to-purple-500 text-white rounded-full flex items-center justify-center hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                            >
                                <svg className="w-5 h-5 transform rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                                </svg>
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
