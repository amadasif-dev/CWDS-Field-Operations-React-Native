import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { jobService, attendanceService } from '../../api';
import type { AttendanceFormResponse } from '../../api/attendanceService';
import type { AttendanceReport, AttendanceStep, Photo, Signature, Room, RoomInspectionData, Consumables } from '../../types/models';

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
  isLoadingForm: boolean;
  fetchedForm: AttendanceFormResponse | null;
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
  isLoadingForm: false,
  fetchedForm: null,
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

/**
 * Fetch complete attendance form data from API (currently returns dummy data).
 * Use attendanceId to fetch a specific record, or jobId to fetch latest for a job.
 */
export const fetchAttendanceForm = createAsyncThunk(
  'attendance/fetchForm',
  async (
    params: { attendanceId?: string; jobId?: string; date?: string },
    { rejectWithValue },
  ) => {
    try {
      let response;
      if (params.attendanceId) {
        response = await attendanceService.getAttendanceFormComplete(params.attendanceId);
      } else if (params.jobId) {
        response = await attendanceService.getAttendanceFormByJob(params.jobId, params.date);
      } else {
        return rejectWithValue('Either attendanceId or jobId is required');
      }

      if (!response.success) {
        return rejectWithValue('Failed to fetch attendance form');
      }
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch form';
      return rejectWithValue(message);
    }
  },
);

/**
 * Fetch attendance history for the current technician.
 */
export const fetchAttendanceHistory = createAsyncThunk(
  'attendance/fetchHistory',
  async (
    params: { page?: number; limit?: number } = {},
    { rejectWithValue },
  ) => {
    try {
      const response = await attendanceService.getMyAttendanceHistory(
        params.page ?? 1,
        params.limit ?? 20,
      );
      if (!response.success) {
        return rejectWithValue('Failed to fetch attendance history');
      }
      return response.data;
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : 'Failed to fetch history';
      return rejectWithValue(message);
    }
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
      })
      // Fetch attendance form
      .addCase(fetchAttendanceForm.pending, (state) => {
        state.isLoadingForm = true;
        state.error = null;
      })
      .addCase(fetchAttendanceForm.fulfilled, (state, action) => {
        state.isLoadingForm = false;
        state.fetchedForm = action.payload;

        if (!action.payload?.formData) return;
        const fd = action.payload.formData;

        // ── Step 1: OH&S Declaration ──
        if (fd.step1?.status === 'completed' && fd.step1.data) {
          const d = fd.step1.data as Record<string, unknown>;
          const checkedLabels = (d.checkedItems as string[]) || [];
          const CHECKLIST_IDS = [
            'hazards_identified', 'ppe_appropriate', 'asbestos_aware',
            'emergency_exits', 'jsa_reviewed', 'fit_to_work',
          ];
          const checkedItems: Record<string, boolean> = {};
          CHECKLIST_IDS.forEach((id, idx) => {
            checkedItems[id] = idx < checkedLabels.length;
          });
          state.stepData[1] = {
            checkedItems,
            asbestosAcknowledged: d.asbestosAcknowledged as boolean ?? false,
            allChecked: d.allChecked as boolean ?? false,
            completedAt: fd.step1.completedAt ?? new Date().toISOString(),
          };
        }

        // ── Step 2: JSA Review ──
        if (fd.step2?.status === 'completed' && fd.step2.data) {
          const d = fd.step2.data as Record<string, unknown>;
          const sig = d.technicianSignature as Record<string, unknown> | undefined;
          const hazards = ((d.hazardsReviewed as Array<Record<string, unknown>>) || []).map(h => ({
            description: (h.name as string) || '',
            risk: (h.riskLevel as string) || 'Medium',
            control: (h.controlMeasure as string) || '',
          }));
          state.stepData[2] = {
            sopName: d.sopName as string ?? 'Water Extraction — Category 2',
            hazards,
            scrolledToBottom: true,
            technicianSignature: sig ? {
              base64: sig.base64 as string || sig.url as string || '',
              timestamp: sig.signedAt as string || new Date().toISOString(),
              signerName: '',
              signerRole: 'Technician',
            } : null,
            signatureTimestamp: sig?.signedAt as string || null,
            completedAt: fd.step2.completedAt ?? new Date().toISOString(),
          };
          if (state.stepData[2].technicianSignature) {
            state.signature = state.stepData[2].technicianSignature as Signature;
          }
        }

        // ── Step 3: Arrival Check-in ──
        if (fd.step3?.status === 'completed' && fd.step3.data) {
          const d = fd.step3.data as Record<string, unknown>;
          state.stepData[3] = {
            arrivalTime: d.arrivalTime as string,
            confirmed: true,
            siteAccessible: d.siteAccessible as boolean ?? true,
            hasHazards: d.immediateHazards as boolean ?? false,
            hazardNotes: d.hazardNotes as string ?? '',
            clientOnSite: d.clientPresent as boolean ?? false,
            clientName: d.clientName as string ?? '',
            completedAt: fd.step3.completedAt ?? new Date().toISOString(),
          };
        }

        // ── Step 4: Room Inspection ──
        if (fd.step4?.status === 'completed' && fd.step4.data) {
          const d = fd.step4.data as Record<string, unknown>;
          const apiRooms = (d.rooms as Array<Record<string, unknown>>) || [];
          const mappedRooms: Room[] = apiRooms.map(r => ({
            id: r.id as string,
            name: r.name as string,
            floor: r.floor as string || 'Ground',
            status: 'complete' as const,
            data: {
              overviewPhotos: r.overviewPhotos as RoomInspectionData['overviewPhotos'],
              surfaces: r.surfaces as RoomInspectionData['surfaces'],
              equipment: r.equipment as RoomInspectionData['equipment'],
              confirmationPhoto: r.confirmationPhoto as RoomInspectionData['confirmationPhoto'],
              moistureMap: r.moistureMap as RoomInspectionData['moistureMap'],
              dimensions: r.dimensions as RoomInspectionData['dimensions'],
            } as RoomInspectionData,
          }));
          state.rooms = mappedRooms;
          state.stepData[4] = {
            rooms: mappedRooms,
            allRoomsComplete: true,
            completedCount: mappedRooms.length,
          };
        }

        // ── Step 5: Consumables → writes to stepData[7] per existing component convention ──
        // NOTE: StepConsumablesChecklist reads from stepData[7] (existing code convention)
        if (fd.step5?.status === 'completed' && fd.step5.data) {
          const d = fd.step5.data as Record<string, unknown>;
          const items = (d.items as Array<Record<string, unknown>>) || [];
          const consumablesMap: Record<string, number> = {};
          items.forEach(item => {
            consumablesMap[item.id as string] = item.quantity as number;
          });
          state.consumables = consumablesMap;
          // Only set if step 7 data not already present (departure also uses stepData[7])
          if (!state.stepData[7]) {
            state.stepData[7] = {
              consumables: consumablesMap,
              otherName: '',
              hasConsumables: true,
            };
          }
        }

        // ── Step 6: Form 2 Signing ──
        if (fd.step6?.status === 'completed' && fd.step6.data) {
          const d = fd.step6.data as Record<string, unknown>;
          const client = d.client as Record<string, unknown> | undefined;
          const techWitness = d.technicianWitness as Record<string, unknown> | undefined;
          const clientSig = client?.signature as Record<string, unknown> | undefined;
          const techSig = techWitness?.signature as Record<string, unknown> | undefined;
          state.stepData[6] = {
            clientName: client?.name as string ?? '',
            clientSignature: clientSig ? {
              base64: clientSig.base64 as string || clientSig.url as string || '',
              timestamp: clientSig.signedAt as string || new Date().toISOString(),
              signerName: client?.name as string || '',
              signerRole: 'Client/Owner',
            } : null,
            technicianSignature: techSig ? {
              base64: techSig.base64 as string || techSig.url as string || '',
              timestamp: techSig.signedAt as string || new Date().toISOString(),
              signerName: techWitness?.name as string || '',
              signerRole: 'Technician',
            } : null,
            form2Scrolled: true,
            isInvasive: d.invasiveWorks as boolean ?? true,
            skipped: d.skipped as boolean ?? false,
            signedAt: fd.step6.completedAt ?? new Date().toISOString(),
          };
        }

        // ── Step 7: Departure ──
        if (fd.step7?.status === 'completed' && fd.step7.data) {
          const d = fd.step7.data as Record<string, unknown>;
          state.stepData[7] = {
            ...state.stepData[7],
            departureTime: d.departureTime as string,
            confirmed: true,
            hasIssues: d.issuesOnDeparture as boolean ?? false,
            issuesNotes: d.issueNotes as string ?? '',
            siteClean: d.siteClean as boolean ?? true,
            totalHours: d.totalHours as number ?? 0,
            arrivalTime: d.arrivalTime as string ?? state.stepData[3]?.arrivalTime,
          };
        }

        // ── Step 8: Review & Submit — no local state to pre-populate ──

        // If resuming a draft, set current step to active step from uiConfig
        if (action.payload.uiConfig?.canResume && action.payload.uiConfig.activeStep) {
          state.currentStep = action.payload.uiConfig.activeStep;
          state.isDraft = true;
        }
      })
      .addCase(fetchAttendanceForm.rejected, (state, action) => {
        state.isLoadingForm = false;
        state.error = action.payload as string;
      })
      // Fetch attendance history
      .addCase(fetchAttendanceHistory.pending, (state) => {
        state.isLoadingForm = true;
        state.error = null;
      })
      .addCase(fetchAttendanceHistory.fulfilled, (state) => {
        state.isLoadingForm = false;
      })
      .addCase(fetchAttendanceHistory.rejected, (state, action) => {
        state.isLoadingForm = false;
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