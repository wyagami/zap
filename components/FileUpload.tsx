import React, { useCallback, useState } from 'react';
import { UploadCloud, FileText, AlertCircle } from 'lucide-react';

interface FileUploadProps {
  onDataLoaded: (text: string) => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ onDataLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const processFile = (file: File) => {
    setError(null);
    if (file.type !== "text/plain" && !file.name.endsWith('.txt')) {
      setError("Por favor, envie um arquivo de texto (.txt) exportado do WhatsApp.");
      return;
    }

    setLoading(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (text) {
        onDataLoaded(text);
      } else {
        setError("O arquivo está vazio.");
        setLoading(false);
      }
    };
    reader.onerror = () => {
      setError("Erro ao ler o arquivo.");
      setLoading(false);
    };
    reader.readAsText(file);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      processFile(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      processFile(e.target.files[0]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
      <div 
        className={`w-full max-w-xl p-10 bg-white rounded-2xl shadow-xl border-2 border-dashed transition-all duration-300 ${
          isDragging ? 'border-whatsapp-primary bg-whatsapp-chat' : 'border-gray-300'
        } ${loading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="p-4 bg-whatsapp-chat rounded-full">
            {loading ? (
               <div className="w-10 h-10 border-4 border-whatsapp-primary border-t-transparent rounded-full animate-spin"></div>
            ) : (
               <UploadCloud className="w-10 h-10 text-whatsapp-primary" />
            )}
          </div>
          
          <h2 className="text-2xl font-bold text-gray-800">
            {loading ? 'Processando conversa...' : 'Carregar conversa do WhatsApp'}
          </h2>
          
          <p className="text-gray-500">
            Exporte a conversa do seu WhatsApp (sem mídia) e arraste o arquivo 
            <code className="bg-gray-100 px-2 py-1 rounded text-sm mx-1">_chat.txt</code> 
            aqui.
          </p>

          <label className="cursor-pointer bg-whatsapp-primary hover:bg-whatsapp-secondary text-white font-medium py-2 px-6 rounded-lg transition-colors">
            Selecionar Arquivo
            <input type="file" className="hidden" accept=".txt" onChange={handleFileInput} />
          </label>

          <p className="text-xs text-gray-400 mt-4">
            Seus dados são processados localmente no seu navegador e não são enviados para nenhum servidor.
          </p>
        </div>
      </div>

      {error && (
        <div className="mt-6 flex items-center bg-red-50 text-red-700 px-4 py-3 rounded-lg border border-red-200">
          <AlertCircle className="w-5 h-5 mr-2" />
          {error}
        </div>
      )}
    </div>
  );
};