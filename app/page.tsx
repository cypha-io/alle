'use client';

import { useState } from 'react';
import { AudioUploader } from '@/components/audio-uploader';
import AudioRecorder from '@/components/audio-recorder';
import { TranscriptionViewer } from '@/components/transcription-viewer';
import { Mic, FileText, Brain, Trash2, Download, Upload } from 'lucide-react';

export default function Home() {
  const [transcription, setTranscription] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [fileName, setFileName] = useState<string>('');
  const [inputMode, setInputMode] = useState<'upload' | 'record'>('upload');
  const [metadata, setMetadata] = useState<{
    confidence?: number;
    language?: string;
    duration?: number;
  }>({});

  const handleTranscriptionComplete = (result: {
    transcription: string;
    fileName: string;
    confidence?: number;
    language?: string;
    duration?: number;
  }) => {
    setTranscription(result.transcription);
    setFileName(result.fileName);
    setMetadata({
      confidence: result.confidence,
      language: result.language,
      duration: result.duration
    });
    setIsProcessing(false);
  };

  const handleRecordingComplete = async (audioBlob: Blob, filename: string) => {
    setIsProcessing(true);
    setTranscription('');
    setFileName(filename);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, filename);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      handleTranscriptionComplete({
        transcription: result.transcription,
        fileName: filename,
        confidence: result.confidence,
        language: result.language,
        duration: result.duration,
      });
    } catch (error) {
      console.error('Recording transcription error:', error);
      setIsProcessing(false);
      // You might want to show an error message to the user here
    }
  };

  const handleProcessingStart = () => {
    setIsProcessing(true);
    setTranscription('');
  };

  const clearTranscription = () => {
    setTranscription('');
    setFileName('');
    setMetadata({});
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-blue-600 p-3 rounded-full mr-4">
              <Mic className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white">
              AI Notetaker
            </h1>
          </div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Transform your audio recordings into clean, readable text using advanced AI technology
          </p>
        </div>

        {/* How it works */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Mic className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">Record or Upload</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Record live or select your audio file</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Download className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">File Received</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">App saves file temporarily</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="bg-purple-100 dark:bg-purple-900 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">AI Processing</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Alle AI converts speech to text</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <Trash2 className="w-6 h-6 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">File Cleanup</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Temporary file is deleted</p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm text-center">
            <div className="bg-indigo-100 dark:bg-indigo-900 p-3 rounded-full w-12 h-12 mx-auto mb-4 flex items-center justify-center">
              <FileText className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-2">View Notes</h3>
            <p className="text-sm text-gray-600 dark:text-gray-300">Get your clean transcription</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Audio Input Section */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            {/* Mode Selector */}
            <div className="flex bg-gray-100 dark:bg-gray-700 rounded-lg p-1 mb-6">
              <button
                onClick={() => setInputMode('upload')}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
                  inputMode === 'upload'
                    ? 'bg-white dark:bg-gray-600 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload File
              </button>
              <button
                onClick={() => setInputMode('record')}
                className={`flex-1 flex items-center justify-center py-2 px-4 rounded-md transition-colors ${
                  inputMode === 'record'
                    ? 'bg-white dark:bg-gray-600 text-red-600 dark:text-red-400 shadow-sm'
                    : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Mic className="w-4 h-4 mr-2" />
                Record Audio
              </button>
            </div>

            {/* Input Component */}
            {inputMode === 'upload' ? (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Upload className="w-5 h-5 mr-2" />
                  Upload Audio File
                </h2>
                <AudioUploader
                  onTranscriptionComplete={handleTranscriptionComplete}
                  onProcessingStart={handleProcessingStart}
                  isProcessing={isProcessing}
                />
              </div>
            ) : (
              <div>
                <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
                  <Mic className="w-5 h-5 mr-2" />
                  Record Audio
                </h2>
                <AudioRecorder
                  onRecordingComplete={handleRecordingComplete}
                  isProcessing={isProcessing}
                />
              </div>
            )}
          </div>

          {/* Transcription Results */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center">
                <FileText className="w-6 h-6 mr-2" />
                Transcription
              </h2>
              {transcription && (
                <button
                  onClick={clearTranscription}
                  className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                  title="Clear transcription"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              )}
            </div>
            <TranscriptionViewer
              transcription={transcription}
              fileName={fileName}
              isProcessing={isProcessing}
              confidence={metadata.confidence}
              language={metadata.language}
              duration={metadata.duration}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
