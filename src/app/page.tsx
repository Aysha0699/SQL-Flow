'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import GeneratorWorkspace from '@/components/GeneratorWorkspace';
import ExamplesSection from '@/components/ExamplesSection';
import FeaturesSection from '@/components/FeaturesSection';
import HowItWorksSection from '@/components/HowItWorksSection';
import HistoryDrawer from '@/components/HistoryDrawer';
import DocumentationModal from '@/components/DocumentationModal';
import SettingsModal from '@/components/SettingsModal';
import Footer from '@/components/Footer';
import CursorTrail from '@/components/CursorTrail';
import { HistoryItem, SQLDialect } from '@/types/sqlflow';
import { History as HistoryIcon } from 'lucide-react';

export default function Home() {
  // Modals state
  const [isDocsOpen, setIsDocsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);

  // Active prompt & dialect in workspace
  const [activePrompt, setActivePrompt] = useState('');
  const [activeDialect, setActiveDialect] = useState<SQLDialect>('postgresql');

  // API settings state
  const [apiKey, setApiKey] = useState('');
  const [provider, setProvider] = useState<'gemini' | 'openai' | 'auto'>('auto');

  // Query history
  const [history, setHistory] = useState<HistoryItem[]>([]);

  // Load history & settings from localStorage on client mount
  useEffect(() => {
    try {
      const storedHistory = localStorage.getItem('sqlflow_history');
      if (storedHistory) {
        setHistory(JSON.parse(storedHistory));
      }
      const storedApiKey = localStorage.getItem('sqlflow_user_api_key');
      if (storedApiKey) {
        setApiKey(storedApiKey);
      }
      const storedProvider = localStorage.getItem('sqlflow_provider');
      if (storedProvider && ['gemini', 'openai', 'auto'].includes(storedProvider)) {
        setProvider(storedProvider as any);
      }
    } catch (e) {
      console.warn('Could not read localStorage:', e);
    }
  }, []);

  // Save to history
  const handleSaveToHistory = (item: HistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev].slice(0, 30); // keep last 30
      try {
        localStorage.setItem('sqlflow_history', JSON.stringify(updated));
      } catch (e) {
        console.warn('Failed to save history to localStorage:', e);
      }
      return updated;
    });
  };

  // Clear history
  const handleClearHistory = () => {
    setHistory([]);
    try {
      localStorage.removeItem('sqlflow_history');
    } catch (e) {
      console.warn(e);
    }
  };

  // Delete single history item
  const handleDeleteHistoryItem = (id: string) => {
    setHistory((prev) => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem('sqlflow_history', JSON.stringify(updated));
      } catch (e) {
        console.warn(e);
      }
      return updated;
    });
  };

  // Restore history item
  const handleRestoreFromHistory = (item: HistoryItem) => {
    setActivePrompt(item.prompt);
    setActiveDialect(item.dialect);
    setIsHistoryOpen(false);
    scrollToGenerator();
  };

  // Save API Key
  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    try {
      if (key) {
        localStorage.setItem('sqlflow_user_api_key', key);
      } else {
        localStorage.removeItem('sqlflow_user_api_key');
      }
    } catch (e) {
      console.warn(e);
    }
  };

  // Save Provider
  const handleSaveProvider = (prov: 'gemini' | 'openai' | 'auto') => {
    setProvider(prov);
    try {
      localStorage.setItem('sqlflow_provider', prov);
    } catch (e) {
      console.warn(e);
    }
  };

  // Navigation handlers
  const scrollToGenerator = () => {
    const el = document.getElementById('generator');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const scrollToExamples = () => {
    const el = document.getElementById('examples');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSelectPrompt = (prompt: string, dialect: SQLDialect, schemaId?: string) => {
    setActivePrompt(prompt);
    setActiveDialect(dialect);
    scrollToGenerator();
  };

  return (
    <div className="min-h-screen bg-[#050505] text-[#F5F7FA] relative selection:bg-[#0047AB] selection:text-white">
      {/* Animated Glowing Cursor Trail Effect */}
      <CursorTrail />

      {/* Navigation Bar */}
      <Navbar
        onOpenDocs={() => setIsDocsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onScrollToGenerator={scrollToGenerator}
        engineMode={apiKey ? (provider === 'openai' ? 'openai' : 'gemini') : 'heuristic-engine'}
      />

      {/* Hero Section */}
      <HeroSection
        onStartGenerating={scrollToGenerator}
        onExploreExamples={scrollToExamples}
        onTrySamplePrompt={(prompt, dialect) => {
          setActivePrompt(prompt);
          setActiveDialect(dialect);
          scrollToGenerator();
        }}
      />

      {/* Main SQL Generator Workspace (The Centerpiece) */}
      <GeneratorWorkspace
        initialPrompt={activePrompt}
        initialDialect={activeDialect}
        onSaveToHistory={handleSaveToHistory}
        apiKey={apiKey}
        provider={provider}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      {/* Interactive Example Prompts */}
      <ExamplesSection onSelectPrompt={handleSelectPrompt} />

      {/* How It Works Section */}
      <HowItWorksSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Footer */}
      <Footer
        onOpenDocs={() => setIsDocsOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onScrollToTop={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      />

      {/* Floating Query History Trigger Button */}
      <div className="fixed bottom-6 right-6 z-30">
        <button
          onClick={() => setIsHistoryOpen(true)}
          className="flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#111318] hover:bg-[#161920] text-gray-300 hover:text-white border border-[#22252B] hover:border-[#0047AB] shadow-2xl transition-all group"
          title="Open query history"
        >
          <HistoryIcon className="w-4 h-4 text-blue-400 group-hover:rotate-[-20deg] transition-transform" />
          <span className="text-xs font-medium hidden sm:inline">Query History</span>
          {history.length > 0 && (
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#0047AB] text-[10px] font-bold text-white">
              {history.length}
            </span>
          )}
        </button>
      </div>

      {/* History Drawer */}
      <HistoryDrawer
        isOpen={isHistoryOpen}
        onClose={() => setIsHistoryOpen(false)}
        history={history}
        onRestore={handleRestoreFromHistory}
        onClearHistory={handleClearHistory}
        onDeleteHistoryItem={handleDeleteHistoryItem}
      />

      {/* Documentation Modal */}
      <DocumentationModal
        isOpen={isDocsOpen}
        onClose={() => setIsDocsOpen(false)}
      />

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        provider={provider}
        onSaveProvider={handleSaveProvider}
      />
    </div>
  );
}
