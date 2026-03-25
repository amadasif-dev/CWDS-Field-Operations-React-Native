import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jobService } from '../../api';
import type { AttendanceReport, AttendanceStep, Photo, Signature } from '../../types/models';

const ATTENDANCE_STEPS: Omit<AttendanceStep, 'isCompleted' | 'data' | 'validationErrors'>[] = [
  { stepNumber: 1, title: 'Job Confirmation', description: 'Confirm job details and arrival' },
  { stepNumber: 2, title: 'Site Assessment', description: 'Assess site conditions' },
  { stepNumber: 3, title: 'Equipment Check', description: 'Verify equipment status' },
  { stepNumber: 4, title: 'Safety Checklist', description: 'Complete safety requirements' },
  { stepNumber: 5, title: 'Work Documentation', description: 'Document work performed' },
  { stepNumber: 6, title: 'Photo Evidence', description: 'Capture required photos' },
  { stepNumber: 7, title: 'Client Signature', description: 'Obtain client sign-off' },
  { stepNumber: 8, title: 'Summary & Submit', description: 'Review and submit report' },
];

interface AttendanceState {
  currentReport: AttendanceReport | null;
  currentStep: number;
  stepData: Record<number, Record<string, unknown>>;
  photos: Photo[];
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
      const { stepData, photos, signature } = state.attendance;
      const response = await jobService.submitAttendance({
        jobId,
        steps: Object.values(stepData),
        photos: photos.map((p) => p.uri),
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
    setSignature: (state, action: PayloadAction<Signature>) => {
      state.signature = action.payload;
      state.isDraft = true;
    },
    clearSignature: (state) => {
      state.signature = null;
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
          state.isDraft = true;
        }
      })
      .addCase(saveDraftLocal.pending, (state) => {
        state.isSavingDraft = true;
      })
      .addCase(saveDraftLocal.fulfilled, (state) => {
        state.isSavingDraft = false;
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
  setSignature,
  clearSignature,
  setValidationErrors,
  clearAttendance,
} = attendanceSlice.actions;

export default attendanceSlice.reducer;
