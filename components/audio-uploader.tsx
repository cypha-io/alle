'use client';

import { useState, useRef, useEffect } from 'react';
import { Upload, FileAudio, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { APIHealthCheck } from '@/lib/api-health';

interface AudioUploaderProps {
  onTranscriptionComplete: (result: {
    transcription: string;
    fileName: string;
    confidence?: number;
    language?: string;
    duration?: number;
  }) => void;
  onProcessingStart: () => void;
  isProcessing: boolean;
}

export function AudioUploader({ onTranscriptionComplete, onProcessingStart, isProcessing }: AudioUploaderProps) {
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string>('');
  const [apiStatus, setApiStatus] = useState<{ connected: boolean; configured: boolean; checking: boolean }>({
    connected: false,
    configured: false,
    checking: true
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Check API health on component mount
  useEffect(() => {
    const checkAPI = async () => {
      try {
        const status = await APIHealthCheck.checkAlleAIConnection();
        setApiStatus({
          connected: status.connected,
          configured: status.configured,
          checking: false
        });
        
        if (!status.configured || !status.connected) {
          setError(status.error || 'API connection issue');
        }
      } catch {
        setApiStatus({ connected: false, configured: false, checking: false });
        setError('Failed to check API status');
      }
    };
    
    checkAPI();
  }, []);

  const handleFiles = async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    // Check API status before processing
    if (!apiStatus.configured || !apiStatus.connected) {
      setError('Alle AI API is not properly configured. Please check your environment variables.');
      return;
    }

    // Validate file type
    const allowedExtensions = ['mp3', 'wav', 'm4a', 'mp4', 'webm'];
    const fileExtension = file.name.split('.').pop()?.toLowerCase();
    const allowedMimeTypes = ['audio/mp3', 'audio/wav', 'audio/m4a', 'audio/mp4', 'audio/mpeg', 'audio/webm'];
    
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      if (!allowedMimeTypes.includes(file.type)) {
        setError('Please upload a valid audio file (MP3, WAV, M4A, MP4, WebM)');
        return;
      }
    }

    // Validate file size (50MB max)
    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('File size must be less than 50MB');
      return;
    }

    setError('');
    onProcessingStart();

    try {
      const formData = new FormData();
      formData.append('audio', file);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.details || errorData.error || `Server error: ${response.status}`);
      }

      const result = await response.json();
      onTranscriptionComplete({
        transcription: result.transcription,
        fileName: file.name,
        confidence: result.confidence,
        language: result.language,
        duration: result.duration
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to transcribe audio';
      setError(errorMessage);
      console.error('Transcription error:', err);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFiles(e.target.files);
    }
  };

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="space-y-4">
      {/* API Status Indicator */}
      <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Alle AI Status:</span>
        <div className="flex items-center">
          {apiStatus.checking ? (
            <div className="flex items-center text-yellow-600 dark:text-yellow-400">
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              <span className="text-sm">Checking...</span>
            </div>
          ) : apiStatus.connected && apiStatus.configured ? (
            <div className="flex items-center text-green-600 dark:text-green-400">
              <CheckCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">Connected</span>
            </div>
          ) : (
            <div className="flex items-center text-red-600 dark:text-red-400">
              <XCircle className="w-4 h-4 mr-2" />
              <span className="text-sm">Disconnected</span>
            </div>
          )}
        </div>
      </div>
      <div
        className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          dragActive
            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
            : 'border-gray-300 dark:border-gray-600 hover:border-gray-400 dark:hover:border-gray-500'
        } ${isProcessing ? 'pointer-events-none opacity-50' : 'cursor-pointer'}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={openFileDialog}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="audio/*"
          onChange={handleChange}
          className="hidden"
          disabled={isProcessing}
          aria-label="Upload audio file"
        />

        {isProcessing ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              Processing Audio...
            </h3>
            <p className="text-gray-600 dark:text-gray-300">
              Our AI is converting your audio to text. This may take a few moments.
            </p>
          </div>
        ) : (
          <div className="flex flex-col items-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-4 rounded-full mb-4">
              {dragActive ? (
                <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              ) : (
                <FileAudio className="w-8 h-8 text-blue-600 dark:text-blue-400" />
              )}
            </div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
              {dragActive ? 'Drop your audio file here' : 'Upload Audio File'}
            </h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Drag and drop your audio file or click to browse
            </p>
            <div className="flex flex-wrap gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">MP3</span>
              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">WAV</span>
              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">M4A</span>
              <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">Max 50MB</span>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="flex items-center p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <AlertCircle className="w-5 h-5 text-red-600 dark:text-red-400 mr-3 flex-shrink-0" />
          <p className="text-red-700 dark:text-red-300">{error}</p>
        </div>
      )}

      <div className="text-center">
        <button
          onClick={openFileDialog}
          disabled={isProcessing}
          className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Upload className="w-5 h-5 mr-2" />
          Choose Audio File
        </button>
      </div>
    </div>
  );
}
