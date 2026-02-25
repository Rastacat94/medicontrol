'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Square, Play, Pause, Trash2, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useVoiceNoteStore, type VoiceNote } from '@/store/voice-note-store';
import { v4 as uuidv4 } from 'uuid';

interface VoiceNoteRecorderProps {
  medicationId?: string;
  medicationName?: string;
  doseTime?: string;
  doseDate?: string;
  onNoteCreated?: (note: VoiceNote) => void;
  compact?: boolean;
}

export function VoiceNoteRecorder({
  medicationId,
  medicationName,
  doseTime,
  doseDate,
  onNoteCreated,
  compact = false,
}: VoiceNoteRecorderProps) {
  const { 
    isRecording, 
    setRecording, 
    recordingTime, 
    setRecordingTime,
    addVoiceNote,
  } = useVoiceNoteStore();

  const [audioURL, setAudioURL] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [isTranscribing, setIsTranscribing] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const MAX_DURATION = 10; // 10 segundos máximo

  // Limpiar al desmontar
  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Iniciar grabación
  const startRecording = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(blob);
        setAudioURL(url);
        setAudioBlob(blob);
        
        // Detener stream
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setRecording(true);
      setRecordingTime(0);

      // Timer para contar segundos
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => {
          if (prev >= MAX_DURATION - 1) {
            stopRecording();
            return MAX_DURATION;
          }
          return prev + 1;
        });
      }, 1000);

    } catch (error) {
      console.error('Error al acceder al micrófono:', error);
      alert('No se pudo acceder al micrófono. Por favor, permite el acceso.');
    }
  }, [setRecording, setRecordingTime]);

  // Detener grabación
  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  }, [isRecording, setRecording]);

  // Reproducir audio
  const togglePlayback = () => {
    if (!audioURL) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(audioURL);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  // Guardar nota
  const saveNote = async () => {
    if (!audioBlob) return;

    setIsTranscribing(true);

    try {
      // Convertir a base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        
        // Simular transcripción (en producción, llamar API de IA)
        const transcription = await simulateTranscription();

        const note: VoiceNote = {
          id: uuidv4(),
          medicationId,
          medicationName,
          audioBase64: base64,
          durationSeconds: recordingTime,
          transcription,
          recordedAt: new Date().toISOString(),
          doseTime,
          doseDate: doseDate || new Date().toISOString().split('T')[0],
          isShared: false,
        };

        addVoiceNote(note);
        onNoteCreated?.(note);
        
        // Reset
        setAudioURL(null);
        setAudioBlob(null);
        setRecordingTime(0);
        audioRef.current = null;
      };
    } catch (error) {
      console.error('Error al guardar nota:', error);
    } finally {
      setIsTranscribing(false);
    }
  };

  // Simular transcripción (placeholder)
  const simulateTranscription = async (): Promise<string> => {
    // En producción, aquí se llamaría a un servicio de ASR
    await new Promise(resolve => setTimeout(resolve, 1000));
    return '[Nota de voz grabada - Transcripción disponible próximamente]';
  };

  // Descartar grabación
  const discardRecording = () => {
    setAudioURL(null);
    setAudioBlob(null);
    setRecordingTime(0);
    audioRef.current = null;
  };

  // Versión compacta para el Dashboard
  if (compact) {
    return (
      <div className="flex items-center gap-2">
        {!isRecording && !audioURL && (
          <Button
            variant="outline"
            size="sm"
            onClick={startRecording}
            className="gap-2"
          >
            <Mic className="h-4 w-4" />
            Nota de voz
          </Button>
        )}

        {isRecording && (
          <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg px-3 py-1.5">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
            <span className="text-sm font-medium text-red-700">{recordingTime}s</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={stopRecording}
              className="h-7 w-7 p-0 text-red-600"
            >
              <Square className="h-4 w-4" />
            </Button>
          </div>
        )}

        {audioURL && !isRecording && (
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              onClick={togglePlayback}
              className="h-8 w-8 p-0"
            >
              {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={saveNote}
              disabled={isTranscribing}
              className="h-8"
            >
              {isTranscribing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={discardRecording}
              className="h-8 w-8 p-0 text-red-500"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    );
  }

  // Versión completa
  return (
    <Card className="border-blue-200 bg-blue-50">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <Mic className="h-5 w-5 text-blue-600" />
          <span className="font-medium text-blue-800">Nota de voz para el médico</span>
        </div>

        {!isRecording && !audioURL && (
          <div className="text-center py-4">
            <p className="text-sm text-gray-600 mb-3">
              Graba cómo te sientes con el medicamento
            </p>
            <Button
              onClick={startRecording}
              size="lg"
              className="gap-2 bg-blue-600 hover:bg-blue-700"
            >
              <Mic className="h-5 w-5" />
              Iniciar grabación
            </Button>
            <p className="text-xs text-gray-500 mt-2">
              Máximo 10 segundos
            </p>
          </div>
        )}

        {isRecording && (
          <div className="text-center py-4">
            <div className="flex items-center justify-center gap-3 mb-3">
              <div className="w-4 h-4 bg-red-500 rounded-full animate-pulse" />
              <span className="text-2xl font-bold text-red-600">{recordingTime}s</span>
              <span className="text-gray-500">/ {MAX_DURATION}s</span>
            </div>
            <Progress value={(recordingTime / MAX_DURATION) * 100} className="h-2 mb-3" />
            <Button
              variant="destructive"
              onClick={stopRecording}
              size="lg"
              className="gap-2"
            >
              <Square className="h-5 w-5" />
              Detener
            </Button>
          </div>
        )}

        {audioURL && !isRecording && (
          <div className="space-y-3">
            <div className="flex items-center justify-between bg-white rounded-lg p-3">
              <div className="flex items-center gap-3">
                <Button
                  variant="outline"
                  onClick={togglePlayback}
                  className="h-10 w-10 rounded-full p-0"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5" />
                  ) : (
                    <Play className="h-5 w-5" />
                  )}
                </Button>
                <div>
                  <p className="font-medium">Grabación lista</p>
                  <p className="text-sm text-gray-500">{recordingTime} segundos</p>
                </div>
              </div>
              <Badge variant="secondary">
                {medicationName || 'Nota general'}
              </Badge>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={discardRecording}
                className="flex-1 gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Descartar
              </Button>
              <Button
                onClick={saveNote}
                disabled={isTranscribing}
                className="flex-1 gap-2 bg-green-600 hover:bg-green-700"
              >
                {isTranscribing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4" />
                    Guardar nota
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente para mostrar lista de notas de voz
export function VoiceNoteList({ 
  limit = 5, 
  medicationId,
  showTitle = true 
}: { 
  limit?: number; 
  medicationId?: string;
  showTitle?: boolean;
}) {
  const { voiceNotes } = useVoiceNoteStore();
  
  const filteredNotes = medicationId
    ? voiceNotes.filter(n => n.medicationId === medicationId)
    : voiceNotes;
  
  const displayNotes = filteredNotes.slice(0, limit);

  if (displayNotes.length === 0) {
    return null;
  }

  return (
    <div className="space-y-2">
      {showTitle && (
        <h4 className="font-medium text-gray-700 flex items-center gap-2">
          <Mic className="h-4 w-4" />
          Notas de voz ({filteredNotes.length})
        </h4>
      )}
      
      {displayNotes.map((note) => (
        <VoiceNoteCard key={note.id} note={note} />
      ))}
    </div>
  );
}

// Tarjeta individual de nota de voz
export function VoiceNoteCard({ note }: { note: VoiceNote }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const togglePlayback = () => {
    if (!note.audioBase64 && !note.audioBase64.startsWith('data:audio')) return;

    if (!audioRef.current) {
      audioRef.current = new Audio(note.audioBase64);
      audioRef.current.onended = () => setIsPlaying(false);
    }

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Card className="bg-white">
      <CardContent className="p-3">
        <div className="flex items-start gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={togglePlayback}
            className="h-8 w-8 rounded-full p-0 flex-shrink-0"
          >
            {isPlaying ? (
              <Pause className="h-4 w-4" />
            ) : (
              <Play className="h-4 w-4" />
            )}
          </Button>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              {note.medicationName && (
                <Badge variant="outline" className="text-xs">
                  {note.medicationName}
                </Badge>
              )}
              <span className="text-xs text-gray-500">
                {note.durationSeconds}s
              </span>
            </div>
            
            {note.transcription && (
              <p className="text-sm text-gray-700 italic">
                "{note.transcription}"
              </p>
            )}
            
            <p className="text-xs text-gray-400 mt-1">
              {formatDate(note.recordedAt)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default VoiceNoteRecorder;
