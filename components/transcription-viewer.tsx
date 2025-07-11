'use client';

import { useState } from 'react';
import { Copy, Download, FileText, Loader2, Clock, Globe, Award } from 'lucide-react';

interface TranscriptionViewerProps {
  transcription: string;
  fileName: string;
  isProcessing: boolean;
  confidence?: number;
  language?: string;
  duration?: number;
}

export function TranscriptionViewer({ 
  transcription, 
  fileName, 
  isProcessing, 
  confidence, 
  language, 
  duration 
}: TranscriptionViewerProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(transcription);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleDownload = () => {
    const blob = new Blob([transcription], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${fileName || 'transcription'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isProcessing) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <Loader2 className="w-8 h-8 text-blue-600 animate-spin mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Converting Audio to Text
        </h3>
        <p className="text-gray-600 dark:text-gray-300">
          Please wait while our AI processes your audio file...
        </p>
        <div className="mt-4 w-full max-w-xs">
          <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!transcription) {
    return (
      <div className="flex flex-col items-center justify-center h-64 text-center">
        <div className="bg-gray-100 dark:bg-gray-700 p-4 rounded-full mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          No Transcription Yet
        </h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Upload an audio file or record your voice to see the transcription here
        </p>
        <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1 max-w-md">
          <p className="font-medium text-blue-600 dark:text-blue-400">💡 Tips for better results:</p>
          <p>• Record for at least 3-5 seconds with clear speech</p>
          <p>• Minimize background noise</p>
          <p>• Use MP3, WAV, or M4A format when uploading</p>
          <p>• If you get empty results, try recording longer</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* File info and actions */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <div className="flex items-center">
          <FileText className="w-5 h-5 text-gray-600 dark:text-gray-400 mr-2" />
          <span className="text-sm font-medium text-gray-900 dark:text-white">
            {fileName || 'Transcription'}
          </span>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={handleCopy}
            className="flex items-center px-3 py-1.5 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            <Copy className="w-4 h-4 mr-1" />
            {copied ? 'Copied!' : 'Copy'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center px-3 py-1.5 text-sm bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
          >
            <Download className="w-4 h-4 mr-1" />
            Download
          </button>
        </div>
      </div>

      {/* Metadata */}
      {(confidence || language || duration) && (
        <div className="flex flex-wrap gap-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg text-sm">
          {confidence && (
            <div className="flex items-center text-blue-700 dark:text-blue-300">
              <Award className="w-4 h-4 mr-1" />
              <span>Confidence: {Math.round(confidence * 100)}%</span>
            </div>
          )}
          {language && (
            <div className="flex items-center text-blue-700 dark:text-blue-300">
              <Globe className="w-4 h-4 mr-1" />
              <span>Language: {language.toUpperCase()}</span>
            </div>
          )}
          {duration && (
            <div className="flex items-center text-blue-700 dark:text-blue-300">
              <Clock className="w-4 h-4 mr-1" />
              <span>Duration: {duration}s</span>
            </div>
          )}
        </div>
      )}

      {/* Transcription content */}
      <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6 max-h-96 overflow-y-auto">
        <div className="prose prose-gray dark:prose-invert max-w-none">
          <p className="text-gray-900 dark:text-white leading-relaxed whitespace-pre-wrap">
            {transcription}
          </p>
        </div>
      </div>

      {/* Word count */}
      <div className="text-right">
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {transcription.split(/\s+/).filter(Boolean).length} words
        </span>
      </div>
    </div>
  );
}
