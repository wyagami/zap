import React, { useState, useMemo } from 'react';
import { FileUpload } from './components/FileUpload';
import { Sidebar } from './components/Sidebar';
import { AnalysisChart } from './components/AnalysisChart';
import { parseChat } from './utils/parser';
import { runAnalysis } from './utils/analytics';
import { Message, AnalysisType } from './types';
import { RefreshCw, ArrowLeft } from 'lucide-react';

const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [currentAnalysis, setCurrentAnalysis] = useState<AnalysisType>(AnalysisType.QUESTIONS);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleDataLoaded = (text: string) => {
    // Small delay to allow UI to update to loading state
    setIsProcessing(true);
    setTimeout(() => {
        const parsed = parseChat(text);
        setMessages(parsed);
        setIsProcessing(false);
    }, 100);
  };

  const handleReset = () => {
    setMessages(null);
    setCurrentAnalysis(AnalysisType.QUESTIONS);
  };

  const result = useMemo(() => {
    if (!messages) return null;
    return runAnalysis(messages, currentAnalysis);
  }, [messages, currentAnalysis]);

  if (!messages) {
    return (
      <div className="min-h-screen bg-whatsapp-background flex flex-col">
        <header className="bg-whatsapp-secondary text-white py-4 px-6 shadow-md">
            <h1 className="text-xl font-bold flex items-center">
                ZapAnalytics Pro
            </h1>
        </header>
        <main className="flex-1">
            <FileUpload onDataLoaded={handleDataLoaded} />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Sidebar for Desktop */}
      <div className="hidden md:flex h-full">
         <Sidebar 
            currentAnalysis={currentAnalysis} 
            onSelect={setCurrentAnalysis} 
            messageCount={messages.length} 
         />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Mobile Header */}
        <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between">
             <h1 className="font-bold text-whatsapp-primary">ZapAnalytics</h1>
             <span className="text-xs text-gray-500">{messages.length} msgs</span>
        </div>

        {/* Mobile Nav (simple dropdown or horizontal scroll could go here, keeping it simple for now) */}
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
            <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Header Actions */}
                <div className="flex justify-between items-start">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">{result?.title}</h2>
                        <p className="text-gray-500 mt-1">{result?.description}</p>
                    </div>
                    <button 
                        onClick={handleReset}
                        className="text-sm flex items-center text-gray-500 hover:text-red-500 transition-colors border border-gray-200 hover:border-red-200 bg-white px-3 py-1.5 rounded-lg shadow-sm"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Novo Arquivo
                    </button>
                </div>

                {/* Chart Card */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    {result && <AnalysisChart result={result} />}
                </div>

                {/* Mobile Menu (Visible only on small screens) */}
                <div className="md:hidden mt-8">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Outras Análises</h3>
                    <div className="grid grid-cols-1 gap-2">
                        {/* Re-using logic from sidebar for mobile buttons */}
                        <Sidebar 
                             currentAnalysis={currentAnalysis} 
                             onSelect={setCurrentAnalysis} 
                             messageCount={messages.length} 
                        />
                    </div>
                </div>
            </div>
        </main>
      </div>
    </div>
  );
};

export default App;