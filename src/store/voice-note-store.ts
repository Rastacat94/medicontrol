import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface VoiceNote {
  id: string;
  medicationId?: string;
  medicationName?: string;
  audioBase64: string;
  durationSeconds: number;
  transcription?: string;
  recordedAt: string;
  doseTime?: string;
  doseDate: string;
  isShared: boolean;
}

interface VoiceNoteStore {
  voiceNotes: VoiceNote[];
  isRecording: boolean;
  currentRecording: string | null;
  recordingTime: number;
  
  // Actions
  addVoiceNote: (note: VoiceNote) => void;
  deleteVoiceNote: (id: string) => void;
  setRecording: (isRecording: boolean) => void;
  setCurrentRecording: (audio: string | null) => void;
  setRecordingTime: (time: number) => void;
  getNotesByDateRange: (startDate: string, endDate: string) => VoiceNote[];
  getNotesForMedication: (medicationId: string) => VoiceNote[];
  markAsShared: (id: string) => void;
  clearNotes: () => void;
}

// Datos demo para testing
const DEMO_NOTES: VoiceNote[] = [
  {
    id: 'demo-1',
    medicationId: 'med-1',
    medicationName: 'Metformina 850mg',
    audioBase64: '',
    durationSeconds: 8,
    transcription: 'Me dio un poco de mareo después de tomarla en la mañana, pero se me pasó rápido.',
    recordedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    doseTime: '08:00',
    doseDate: new Date().toISOString().split('T')[0],
    isShared: false,
  },
  {
    id: 'demo-2',
    medicationId: 'med-2',
    medicationName: 'Losartán 50mg',
    audioBase64: '',
    durationSeconds: 10,
    transcription: 'Hoy me sentí muy bien, sin dolores de cabeza. Creo que el medicamento está funcionando.',
    recordedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    doseTime: '21:00',
    doseDate: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    isShared: true,
  },
];

export const useVoiceNoteStore = create<VoiceNoteStore>()(
  persist(
    (set, get) => ({
      voiceNotes: [],
      isRecording: false,
      currentRecording: null,
      recordingTime: 0,

      addVoiceNote: (note) => {
        set(state => ({
          voiceNotes: [note, ...state.voiceNotes].slice(0, 100), // Max 100 notas
        }));
      },

      deleteVoiceNote: (id) => {
        set(state => ({
          voiceNotes: state.voiceNotes.filter(n => n.id !== id),
        }));
      },

      setRecording: (isRecording) => set({ isRecording }),

      setCurrentRecording: (audio) => set({ currentRecording: audio }),

      setRecordingTime: (time) => set({ recordingTime: time }),

      getNotesByDateRange: (startDate, endDate) => {
        const { voiceNotes } = get();
        return voiceNotes.filter(note => 
          note.doseDate >= startDate && note.doseDate <= endDate
        );
      },

      getNotesForMedication: (medicationId) => {
        const { voiceNotes } = get();
        return voiceNotes.filter(note => note.medicationId === medicationId);
      },

      markAsShared: (id) => {
        set(state => ({
          voiceNotes: state.voiceNotes.map(n =>
            n.id === id ? { ...n, isShared: true } : n
          ),
        }));
      },

      clearNotes: () => set({ voiceNotes: [] }),
    }),
    {
      name: 'medicontrol-voice-notes',
      partialize: (state) => ({
        voiceNotes: state.voiceNotes,
      }),
    }
  )
);

// Cargar notas demo si no hay datos
export const loadDemoVoiceNotes = () => {
  const { voiceNotes, addVoiceNote } = useVoiceNoteStore.getState();
  if (voiceNotes.length === 0) {
    DEMO_NOTES.forEach(note => addVoiceNote(note));
  }
};
