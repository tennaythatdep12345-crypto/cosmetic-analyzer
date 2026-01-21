
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Analyzer from './pages/Analyzer';
import Knowledge from './pages/Knowledge';
import About from './pages/About';
import './i18n';
import './index.css';

export default function App() {
    return (
        <ThemeProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/analyze" element={<Analyzer />} />
                        <Route path="/knowledge" element={<Knowledge />} />
                        <Route path="/about" element={<About />} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </ThemeProvider>
    );
}
