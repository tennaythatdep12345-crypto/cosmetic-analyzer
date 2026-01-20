import { ReactNode } from 'react';
import Header from './Header';
import Footer from './Footer';
import ChatBox from './ChatBox';

interface LayoutProps {
    children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Header />
            <main className="flex-grow">
                {children}
            </main>
            <Footer />
            <ChatBox />
        </div>
    );
}
