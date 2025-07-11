import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Play, Pause, Trash2, Upload } from 'lucide-react';

interface AudioRecorderProps {
  onRecordingComplete: (audioBlob: Blob, filename: string) => void;
  isProcessing: boolean;
}

interface RecordingState {
  isRecording: boolean;
  isPaused: boolean;
  duration: number;
  audioBlob: Blob | null;
  audioUrl: string | null;
}

export default function AudioRecorder({ onRecordingComplete, isProcessing }: AudioRecorderProps) {
  const [recordingState, setRecordingState] = useState<RecordingState>({
    isRecording: false,
    isPaused: false,
    duration: 0,
    audioBlob: null,
    audioUrl: null,
  });
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [permission, setPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Check microphone permission on component mount
  useEffect(() => {
    const handleCleanup = () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      if (recordingState.audioUrl) {
        URL.revokeObjectURL(recordingState.audioUrl);
      }
    };

    checkMicrophonePermission();
    return handleCleanup;
  }, [recordingState.audioUrl]);

  const checkMicrophonePermission = async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      setPermission(permission.state);
      
      permission.onchange = () => {
        setPermission(permission.state);
      };
    } catch (error) {
      console.error('Error checking microphone permission:', error);
    }
  };

  const startTimer = () => {
    timerRef.current = setInterval(() => {
      setRecordingState(prev => ({
        ...prev,
        duration: prev.duration + 1
      }));
    }, 1000);
  };

  const stopTimer = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const requestMicrophoneAccess = async (): Promise<MediaStream | null> => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        } 
      });
      setPermission('granted');
      setError(null);
      return stream;
    } catch (error) {
      console.error('Error accessing microphone:', error);
      setPermission('denied');
      setError('Microphone access denied. Please allow microphone access to record audio.');
      return null;
    }
  };

  const startRecording = async () => {
    setError(null);
    
    const stream = await requestMicrophoneAccess();
    if (!stream) return;

    try {
      streamRef.current = stream;
      chunksRef.current = [];

      // Try different audio formats in order of preference
      let mimeType = 'audio/webm;codecs=opus';
      if (MediaRecorder.isTypeSupported('audio/mp4')) {
        mimeType = 'audio/mp4';
      } else if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) {
        mimeType = 'audio/webm;codecs=opus';
      } else if (MediaRecorder.isTypeSupported('audio/webm')) {
        mimeType = 'audio/webm';
      }

      console.log('🎙️ Recording with format:', mimeType);

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType
      });
      
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(chunksRef.current, { type: mimeType });
        const audioUrl = URL.createObjectURL(audioBlob);
        
        console.log('🎵 Recording complete:', {
          size: audioBlob.size,
          type: audioBlob.type,
          duration: recordingState.duration
        });
        
        setRecordingState(prev => ({
          ...prev,
          isRecording: false,
          isPaused: false,
          audioBlob,
          audioUrl,
        }));

        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      };

      mediaRecorder.start(1000); // Collect data every second
      
      setRecordingState(prev => ({
        ...prev,
        isRecording: true,
        isPaused: false,
        duration: 0,
        audioBlob: null,
        audioUrl: null,
      }));

      startTimer();
    } catch (error) {
      console.error('Error starting recording:', error);
      setError('Failed to start recording. Please try again.');
      stream.getTracks().forEach(track => track.stop());
    }
  };

  const pauseRecording = () => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      if (recordingState.isPaused) {
        mediaRecorderRef.current.resume();
        startTimer();
        setRecordingState(prev => ({ ...prev, isPaused: false }));
      } else {
        mediaRecorderRef.current.pause();
        stopTimer();
        setRecordingState(prev => ({ ...prev, isPaused: true }));
      }
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState.isRecording) {
      mediaRecorderRef.current.stop();
      stopTimer();
    }
  };

  const playRecording = () => {
    if (recordingState.audioUrl && audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else {
        audioRef.current.play();
        setIsPlaying(true);
      }
    }
  };

  const deleteRecording = () => {
    if (recordingState.audioUrl) {
      URL.revokeObjectURL(recordingState.audioUrl);
    }
    
    setRecordingState({
      isRecording: false,
      isPaused: false,
      duration: 0,
      audioBlob: null,
      audioUrl: null,
    });
    setIsPlaying(false);
  };

  const uploadRecording = () => {
    if (recordingState.audioBlob) {
      // Check minimum duration (at least 1 second)
      if (recordingState.duration < 1) {
        setError('Recording too short. Please record for at least 1 second.');
        return;
      }

      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileExtension = recordingState.audioBlob.type.includes('mp4') ? 'mp4' : 
                           recordingState.audioBlob.type.includes('webm') ? 'webm' : 'audio';
      const filename = `recording_${timestamp}.${fileExtension}`;
      
      console.log('🎤 Uploading recording:', {
        filename,
        size: recordingState.audioBlob.size,
        duration: recordingState.duration,
        type: recordingState.audioBlob.type
      });
      
      onRecordingComplete(recordingState.audioBlob, filename);
      deleteRecording(); // Clear after upload
    }
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  const RecordingControls = () => (
    <div className="flex items-center justify-center space-x-4">
      {!recordingState.isRecording ? (
        <button
          onClick={startRecording}
          disabled={isProcessing || permission === 'denied'}
          className="flex items-center justify-center w-16 h-16 bg-red-500 hover:bg-red-600 disabled:bg-gray-400 text-white rounded-full transition-colors duration-200 shadow-lg"
          aria-label="Start recording"
          title="Start recording"
        >
          <Mic className="w-6 h-6" />
        </button>
      ) : (
        <>
          <button
            onClick={pauseRecording}
            className="flex items-center justify-center w-12 h-12 bg-yellow-500 hover:bg-yellow-600 text-white rounded-full transition-colors duration-200"
            aria-label={recordingState.isPaused ? "Resume recording" : "Pause recording"}
            title={recordingState.isPaused ? "Resume recording" : "Pause recording"}
          >
            {recordingState.isPaused ? <Play className="w-5 h-5" /> : <Pause className="w-5 h-5" />}
          </button>
          
          <button
            onClick={stopRecording}
            className="flex items-center justify-center w-12 h-12 bg-gray-600 hover:bg-gray-700 text-white rounded-full transition-colors duration-200"
            aria-label="Stop recording"
            title="Stop recording"
          >
            <Square className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );

  const PlaybackControls = () => (
    recordingState.audioUrl && (
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <span className="text-sm font-medium text-gray-600">
            Recording Complete ({formatDuration(recordingState.duration)})
          </span>
          <div className="flex space-x-2">
            <button
              onClick={playRecording}
              className="flex items-center justify-center w-10 h-10 bg-blue-500 hover:bg-blue-600 text-white rounded-full transition-colors duration-200"
              aria-label={isPlaying ? "Pause playback" : "Play recording"}
              title={isPlaying ? "Pause playback" : "Play recording"}
            >
              {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            </button>
            
            <button
              onClick={deleteRecording}
              className="flex items-center justify-center w-10 h-10 bg-red-500 hover:bg-red-600 text-white rounded-full transition-colors duration-200"
              aria-label="Delete recording"
              title="Delete recording"
            >
              <Trash2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={uploadRecording}
              disabled={isProcessing}
              className="flex items-center justify-center w-10 h-10 bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white rounded-full transition-colors duration-200"
              aria-label="Upload recording for transcription"
              title="Upload recording for transcription"
            >
              <Upload className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        <audio
          ref={audioRef}
          src={recordingState.audioUrl}
          onEnded={handleAudioEnded}
          className="w-full"
          controls
        />
      </div>
    )
  );

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-lg border border-gray-200">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-800 mb-2">Record Audio</h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}
        
        {permission === 'denied' && (
          <div className="mb-4 p-3 bg-yellow-100 border border-yellow-300 text-yellow-700 rounded-lg text-sm">
            Microphone access is required for recording. Please enable it in your browser settings.
          </div>
        )}
        
        {recordingState.isRecording && (
          <div className="mb-4">
            <div className="text-2xl font-mono text-red-600 mb-2">
              {formatDuration(recordingState.duration)}
            </div>
            <div className="flex items-center justify-center space-x-2">
              <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-gray-600">
                {recordingState.isPaused ? 'Paused' : 'Recording...'}
              </span>
            </div>
          </div>
        )}
        
        <RecordingControls />
        <PlaybackControls />
        
        <div className="mt-4 text-xs text-gray-500 text-center">
          Click the microphone to start recording
        </div>
      </div>
    </div>
  );
}
