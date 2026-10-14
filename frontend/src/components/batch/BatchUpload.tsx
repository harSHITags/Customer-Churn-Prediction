import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle, AlertTriangle, Trash2 } from 'lucide-react';
import { Spinner } from '../ui/Spinner';

interface BatchUploadProps {
  onUpload: (file: File) => void;
  isLoading: boolean;
  error: string | null;
}

export const BatchUpload: React.FC<BatchUploadProps> = ({ onUpload, isLoading, error }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      setSelectedFile(acceptedFiles[0]);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv']
    },
    maxFiles: 1
  });

  const handleClear = () => {
    setSelectedFile(null);
  };

  const handleExecute = () => {
    if (selectedFile) {
      onUpload(selectedFile);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="bg-bg-surface border border-border rounded-xl p-6 space-y-6">
      <div className="border-b border-border pb-3 flex justify-between items-center">
        <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-text-primary">
          BATCH DATA FILE UPLOADER
        </h3>
        <span className="text-[9px] font-mono text-accent bg-accent/5 px-2 py-0.5 rounded border border-accent/10">
          CSV ENGINE
        </span>
      </div>

      {error && (
        <div className="bg-danger/10 border border-danger/20 text-danger p-4 rounded-lg text-xs font-mono flex items-center gap-3">
          <AlertTriangle className="w-4 h-4 shrink-0 animate-bounce" />
          <div>
            <div className="font-bold uppercase tracking-wider">EXECUTION CRITICAL FAILURE</div>
            <div className="mt-0.5 text-text-secondary">{error}</div>
          </div>
        </div>
      )}

      {!selectedFile ? (
        <div 
          {...getRootProps()} 
          className={`border-2 border-dashed rounded-xl p-10 flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-200 select-none ${
            isDragActive 
              ? 'border-accent bg-accent/5' 
              : 'border-border hover:border-text-muted hover:bg-bg-primary/20'
          }`}
        >
          <input {...getInputProps()} />
          <div className="p-4 rounded-full bg-bg-primary/50 border border-border mb-4 text-text-secondary">
            <Upload className="w-6 h-6 animate-pulse" />
          </div>
          <p className="text-xs font-mono text-text-primary uppercase tracking-wide font-semibold">
            {isDragActive ? 'Release File to Stage' : 'Drag & Drop Customer CSV'}
          </p>
          <p className="text-[10px] font-mono text-text-muted mt-1.5 uppercase">
            LIMIT: 1 FILE, MAX 50MB (.CSV)
          </p>
        </div>
      ) : (
        <div className="border border-border rounded-xl p-5 bg-bg-primary/30 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-lg bg-accent/10 border border-accent/25 text-accent">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-mono font-bold text-text-primary truncate max-w-md">
                {selectedFile.name}
              </div>
              <div className="text-[9px] font-mono text-text-secondary uppercase mt-0.5">
                Size: {formatSize(selectedFile.size)}
              </div>
            </div>
          </div>
          
          <button 
            onClick={handleClear}
            disabled={isLoading}
            className="p-2 text-text-secondary hover:text-danger hover:bg-danger/10 border border-transparent hover:border-danger/20 rounded-lg transition-all disabled:opacity-50 cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {selectedFile && (
        <button
          onClick={handleExecute}
          disabled={isLoading}
          className="w-full bg-accent hover:bg-accent-soft text-white font-mono text-xs uppercase tracking-widest py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 border border-accent/20 disabled:bg-bg-elevated disabled:text-text-muted disabled:border-border cursor-pointer font-bold"
        >
          {isLoading ? (
            <Spinner size="sm" />
          ) : (
            <>
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Initiate Batch Classification</span>
            </>
          )}
        </button>
      )}
    </div>
  );
};
