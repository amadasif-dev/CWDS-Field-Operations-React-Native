import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jobService } from '../../api';
import type { AttendanceReport, AttendanceStep, Photo, Signature, Room, Consumables } from '../../types/models';

const ATTENDANCE_STEPS: Omit<AttendanceStep, 'isCompleted' | 'data' | 'validationErrors'>[] = [
  { stepNumber: 1, title: 'OH&S Declaration', description: 'Complete safety declaration and hazard acknowledgment' },
  { stepNumber: 2, title: 'JSA Review', description: 'Review Job Safety Analysis and sign' },
  { stepNumber: 3, title: 'Arrival Check-in', description: 'Record arrival time and site readiness' },
  { stepNumber: 4, title: 'Room Inspection', description: 'Inspect all affected rooms' },
  { stepNumber: 5, title: 'Consumables', description: 'Log consumables used' },
  { stepNumber: 6, title: 'Form 2 Signing', description: 'Digital signing for invasive works' },
  { stepNumber: 7, title: 'Departure Time', description: 'Record departure and finalize hours' },
  { stepNumber: 8, title: 'Review & Submit', description: 'Review and submit attendance report' },
];

interface AttendanceState {
  currentReport: AttendanceReport | null;
  currentStep: number;
  stepData: Record<number, Record<string, unknown>>;
  photos: Photo[];
  rooms: Room[];
  consumables: Consumables;
  signature: Signature | null;
  isDraft: boolean;
  isSubmitting: boolean;
  isSavingDraft: boolean;
  error: string | null;
  validationErrors: Record<number, string[]>;
}

const initialState: AttendanceState = {
  currentReport: null,
  currentStep: 1,
  stepData: {},
  photos: [],
  rooms: [],
  consumables: {},
  signature: null,
  isDraft: false,
  isSubmitting: false,
  isSavingDraft: false,
  error: null,
  validationErrors: {},
};

const DRAFT_KEY = (jobId: string) => `attendance_draft_${jobId}`;

export const loadDraft = createAsyncThunk(
  'attendance/loadDraft',
  async (jobId: string) => {
    const draftJson = await AsyncStorage.getItem(DRAFT_KEY(jobId));
    if (draftJson) {
      return JSON.parse(draftJson) as {
        currentStep: number;
        stepData: Record<number, Record<string, unknown>>;
        photos: Photo[];
        rooms: Room[];
        consumables: Consumables;
        signature: Signature | null;
      };
    }
    return null;
  },
);

export const saveDraftLocal = createAsyncThunk(
  'attendance/saveDraftLocal',
  async (jobId: string, { getState }) => {
    const state = getState() as { attendance: AttendanceState };
    const draft = {
      currentStep: state.attendance.currentStep,
      stepData: state.attendance.stepData,
      photos: state.attendance.photos,
      rooms: state.attendance.rooms,
      consumables: state.attendance.consumables,
      signature: state.attendance.signature,
    };
    await AsyncStorage.setItem(DRAFT_KEY(jobId), JSON.stringify(draft));
    return true;
  },
);

export const submitAttendance = createAsyncThunk(
  'attendance/submit',
  async (jobId: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { attendance: AttendanceState };
      const { stepData, photos, rooms, consumables, signature } = state.attendance;
      const response = await jobService.submitAttendance({
        jobId,
        steps: Object.values(stepData),
        photos: photos.map((p: Photo) => p.uri),
        rooms,
        consumables,
        signature: signature?.base64,
        notes: stepData[5]?.notes as string | undefined,
        submittedAt: new Date().toISOString(),
      });
      await AsyncStorage.removeItem(DRAFT_KEY(jobId));
      return response.data;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to submit';
      return rejectWithValue(message);
    }
  },
);

const attendanceSlice = createSlice({
  name: 'attendance',
  initialState,
  reducers: {
    initAttendance: (state, action: PayloadAction<string>) => {
      state.currentStep = 1;
      state.stepData = {};
      state.photos = [];
      state.rooms = [];
      state.consumables = {};
      state.signature = null;
      state.isDraft = false;
      state.error = null;
      state.validationErrors = {};
      state.currentReport = {
        id: `att_${Date.now()}`,
        jobId: action.payload,
        status: 'in_progress',
        currentStep: 1,
        steps: ATTENDANCE_STEPS.map((s) => ({
          ...s,
          isCompleted: false,
          data: {},
        })),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    },
    setStepData: (
      state,
      action: PayloadAction<{ step: number; data: Record<string, unknown> }>,
    ) => {
      state.stepData[action.payload.step] = {
        ...state.stepData[action.payload.step],
        ...action.payload.data,
      };
      state.isDraft = true;
    },
    nextStep: (state) => {
      if (state.currentStep < 8) {
        state.currentStep += 1;
        if (state.currentReport) {
          state.currentReport.currentStep = state.currentStep;
          const completedStep = state.currentReport.steps[state.currentStep - 2];
          if (completedStep) {
            completedStep.isCompleted = true;
          }
        }
      }
    },
    prevStep: (state) => {
      if (state.currentStep > 1) {
        state.currentStep -= 1;
        if (state.currentReport) {
          state.currentReport.currentStep = state.currentStep;
        }
      }
    },
    goToStep: (state, action: PayloadAction<number>) => {
      const step = action.payload;
      if (step >= 1 && step <= 8 && step <= state.currentStep) {
        state.currentStep = step;
      }
    },
    addPhoto: (state, action: PayloadAction<Photo>) => {
      state.photos.push(action.payload);
      state.isDraft = true;
    },
    removePhoto: (state, action: PayloadAction<string>) => {
      state.photos = state.photos.filter((p) => p.id !== action.payload);
      state.isDraft = true;
    },
    clearPhotos: (state) => {
      state.photos = [];
      state.isDraft = true;
    },
    // Room management actions
    setRooms: (state, action: PayloadAction<Room[]>) => {
      state.rooms = [...action.payload]; // Fix typo
      state.isDraft = true;
    },
    updateRoom: (state, action: PayloadAction<{ roomId: string; updates: Partial<Room> }>) => {
      const { roomId, updates } = action.payload;
      const index = state.rooms.findIndex(r => r.id === roomId);
      if (index !== -1) {
        state.rooms[index] = { ...state.rooms[index], ...updates };
        state.isDraft = true;
      }
    },
    addRoom: (state, action: PayloadAction<Room>) => {
      state.rooms.push(action.payload);
      state.isDraft = true;
    },
    removeRoom: (state, action: PayloadAction<string>) => {
      state.rooms = state.rooms.filter(r => r.id !== action.payload);
      state.isDraft = true;
    },
    // Consumables management
    setConsumables: (state, action: PayloadAction<Consumables>) => {
      state.consumables = action.payload;
      state.isDraft = true;
    },
    updateConsumable: (state, action: PayloadAction<{ id: string; quantity: number }>) => {
      const { id, quantity } = action.payload;
      state.consumables[id] = quantity;
      state.isDraft = true;
    },
    setSignature: (state, action: PayloadAction<Signature>) => {
      state.signature = action.payload;
      state.isDraft = true;
    },
    clearSignature: (state) => {
      state.signature = null;
      state.isDraft = true;
    },
    setValidationErrors: (
      state,
      action: PayloadAction<{ step: number; errors: string[] }>,
    ) => {
      state.validationErrors[action.payload.step] = action.payload.errors;
    },
    clearAttendance: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      .addCase(loadDraft.fulfilled, (state, action) => {
        if (action.payload) {
          state.currentStep = action.payload.currentStep;
          state.stepData = action.payload.stepData;
          state.photos = action.payload.photos;
          state.rooms = action.payload.rooms || [];
          state.consumables = action.payload.consumables || {};
          state.signature = action.payload.signature || null;
          state.isDraft = true;
        }
      })
      .addCase(saveDraftLocal.pending, (state) => {
        state.isSavingDraft = true;
      })
      .addCase(saveDraftLocal.fulfilled, (state) => {
        state.isSavingDraft = false;
        state.isDraft = false;
      })
      .addCase(submitAttendance.pending, (state) => {
        state.isSubmitting = true;
        state.error = null;
      })
      .addCase(submitAttendance.fulfilled, (state, action) => {
        state.isSubmitting = false;
        state.currentReport = action.payload;
        state.isDraft = false;
      })
      .addCase(submitAttendance.rejected, (state, action) => {
        state.isSubmitting = false;
        state.error = action.payload as string;
      });
  },
});

export const {
  initAttendance,
  setStepData,
  nextStep,
  prevStep,
  goToStep,
  addPhoto,
  removePhoto,
  clearPhotos,
  setRooms,
  updateRoom,
  addRoom,
  removeRoom,
  setConsumables,
  updateConsumable,
  setSignature,
  clearSignature,
  setValidationErrors,
  clearAttendance,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;