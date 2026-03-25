import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type {
  JobInspection,
  FloorInspection,
  UnitInspection,
  RoomInspection,
  RoomInspectionStep,
  SurfaceInspection,
  InspectionPhoto,
  RoomEquipmentEntry,
  MapAnnotation,
} from '../../types/inspection';

// ─── Helpers ────────────────────────────────────────────────────
const DRAFT_KEY = (jobId: string) => `inspection_draft_${jobId}`;

const createEmptyRoom = (id: string, name: string): RoomInspection => ({
  id,
  name,
  currentStep: 1,
  isComplete: false,
  overviewPhotos: [],
  dimensions: null,
  surfaces: [],
  equipment: [],
  equipmentPhoto: null,
  moistureMapAnnotations: [],
  moistureMapBasePhotoId: null,
});

// ─── Locate helpers ─────────────────────────────────────────────
interface RoomPath {
  floorId: string;
  unitId: string;
  roomId: string;
}

const findRoom = (
  inspection: JobInspection | null,
  path: RoomPath,
): RoomInspection | undefined => {
  const floor = inspection?.floors.find((f) => f.id === path.floorId);
  const unit = floor?.units.find((u) => u.id === path.unitId);
  return unit?.rooms.find((r) => r.id === path.roomId);
};

const mutateRoom = (
  inspection: JobInspection,
  path: RoomPath,
  mutator: (room: RoomInspection) => void,
) => {
  const floor = inspection.floors.find((f) => f.id === path.floorId);
  const unit = floor?.units.find((u) => u.id === path.unitId);
  const room = unit?.rooms.find((r) => r.id === path.roomId);
  if (room) {
    mutator(room);
  }
};

// ─── State ──────────────────────────────────────────────────────
interface InspectionState {
  current: JobInspection | null;
  activeRoom: RoomPath | null;
  isSaving: boolean;
  isSubmitting: boolean;
  error: string | null;
}

const initialState: InspectionState = {
  current: null,
  activeRoom: null,
  isSaving: false,
  isSubmitting: false,
  error: null,
};

// ─── Async actions ──────────────────────────────────────────────
export const loadInspectionDraft = createAsyncThunk(
  'inspection/loadDraft',
  async (jobId: string) => {
    const json = await AsyncStorage.getItem(DRAFT_KEY(jobId));
    return json ? (JSON.parse(json) as JobInspection) : null;
  },
);

export const saveInspectionDraft = createAsyncThunk(
  'inspection/saveDraft',
  async (_: void, { getState }) => {
    const state = getState() as { inspection: InspectionState };
    const inspection = state.inspection.current;
    if (inspection) {
      await AsyncStorage.setItem(
        DRAFT_KEY(inspection.jobId),
        JSON.stringify(inspection),
      );
    }
    return true;
  },
);

// ─── Slice ──────────────────────────────────────────────────────
const inspectionSlice = createSlice({
  name: 'inspection',
  initialState,
  reducers: {
    // ── Inspection lifecycle ───────────────────────────────────
    initInspection: (state, action: PayloadAction<{ jobId: string }>) => {
      state.current = {
        id: `insp_${Date.now()}`,
        jobId: action.payload.jobId,
        status: 'draft',
        floors: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.activeRoom = null;
      state.error = null;
    },

    clearInspection: () => initialState,

    // ── Floor CRUD ─────────────────────────────────────────────
    addFloor: (state, action: PayloadAction<{ id: string; name: string }>) => {
      if (!state.current) return;
      state.current.floors.push({
        id: action.payload.id,
        name: action.payload.name,
        units: [],
      });
      state.current.updatedAt = new Date().toISOString();
    },

    removeFloor: (state, action: PayloadAction<string>) => {
      if (!state.current) return;
      state.current.floors = state.current.floors.filter(
        (f) => f.id !== action.payload,
      );
    },

    // ── Unit CRUD ──────────────────────────────────────────────
    addUnit: (
      state,
      action: PayloadAction<{ floorId: string; id: string; name: string }>,
    ) => {
      if (!state.current) return;
      const floor = state.current.floors.find(
        (f) => f.id === action.payload.floorId,
      );
      if (floor) {
        floor.units.push({
          id: action.payload.id,
          name: action.payload.name,
          rooms: [],
        });
        state.current.updatedAt = new Date().toISOString();
      }
    },

    removeUnit: (
      state,
      action: PayloadAction<{ floorId: string; unitId: string }>,
    ) => {
      if (!state.current) return;
      const floor = state.current.floors.find(
        (f) => f.id === action.payload.floorId,
      );
      if (floor) {
        floor.units = floor.units.filter(
          (u) => u.id !== action.payload.unitId,
        );
      }
    },

    // ── Room CRUD ──────────────────────────────────────────────
    addRoom: (
      state,
      action: PayloadAction<{
        floorId: string;
        unitId: string;
        id: string;
        name: string;
      }>,
    ) => {
      if (!state.current) return;
      const floor = state.current.floors.find(
        (f) => f.id === action.payload.floorId,
      );
      const unit = floor?.units.find((u) => u.id === action.payload.unitId);
      if (unit) {
        unit.rooms.push(
          createEmptyRoom(action.payload.id, action.payload.name),
        );
        state.current.updatedAt = new Date().toISOString();
      }
    },

    setActiveRoom: (state, action: PayloadAction<RoomPath | null>) => {
      state.activeRoom = action.payload;
    },

    // ── Step 1: Room Overview ──────────────────────────────────
    addOverviewPhoto: (
      state,
      action: PayloadAction<{ path: RoomPath; photo: InspectionPhoto }>,
    ) => {
      if (!state.current) return;
      mutateRoom(state.current, action.payload.path, (room) => {
        room.overviewPhotos.push(action.payload.photo);
      });
    },

    removeOverviewPhoto: (
      state,
      action: PayloadAction<{ path: RoomPath; photoId: string }>,
    ) => {
      if (!state.current) return;
      mutateRoom(state.current, action.payload.path, (room) => {
        room.overviewPhotos = room.overviewPhotos.filter(
          (p) => p.id !== action.payload.photoId,
        );
      });
    },

    setRoomDimensions: (
      state,
      action: PayloadAction<{
        path: RoomPath;
        dimensions: { length: number; width: number; height: number };
      }>,
    ) => {
      if (!state.current) return;
      mutateRoom(state.current, action.payload.path, (room) => {
        room.dimensions = action.payload.dimensions;
      });
    },

    // ── Step 2: Surface Inspection ─────────────────────────────
    setSurfaces: (
      state,
      action: PayloadAction<{
        path: RoomPath;
        surfaces: SurfaceInspection[];
      }>,
    ) => {
      if (!state.current) return;
      mutateRoom(state.current, action.payload.path, (room) => {
        room.surfaces = action.payload.surfaces;
      });
    },

    updateSurface: (
      state,
      action: PayloadAction<{
        path: RoomPath;
        surfaceId: string;
        data: Partial<SurfaceInspection>;
      }>,
    ) => {
      if (!state.current) return;
      mutateRoom(state.current, action.payload.path, (room) => {
        const idx = room.surfaces.findIndex(
          (s) => s.id === action.payload.surfaceId,
        );
        if (idx >= 0) {
          room.surfaces[idx] = { ...room.surfaces[idx], ...action.payload.data };
        }
      });
    },

    // ── Step 4: Equipment ──────────────────────────────────────
    setEquipment: (
      state,
      action: PayloadAction<{
        path: RoomPath;
        equipment: RoomEquipmentEntry[];
        photo: InspectionPhoto | null;
      }>,
    ) => {
      if (!state.current) return;
      mutateRoom(state.current, action.payload.path, (room) => {
        room.equipment = action.payload.equipment;
        room.equipmentPhoto = action.payload.photo;
      });
    },

    // ── Step 5: Moisture Map ───────────────────────────────────
    setMoistureMap: (
      state,
      action: PayloadAction<{
        path: RoomPath;
        basePhotoId: string | null;
        annotations: MapAnnotation[];
      }>,
    ) => {
      if (!state.current) return;
      mutateRoom(state.current, action.payload.path, (room) => {
        room.moistureMapBasePhotoId = action.payload.basePhotoId;
        room.moistureMapAnnotations = action.payload.annotations;
      });
    },

    // ── Step advancement (locked linear) ───────────────────────
    advanceRoomStep: (state, action: PayloadAction<RoomPath>) => {
      if (!state.current) return;
      mutateRoom(state.current, action.payload, (room) => {
        if (room.currentStep < 5) {
          room.currentStep = (room.currentStep + 1) as RoomInspectionStep;
        } else {
          room.isComplete = true;
        }
      });
      state.current.updatedAt = new Date().toISOString();
    },

    goBackRoomStep: (state, action: PayloadAction<RoomPath>) => {
      if (!state.current) return;
      mutateRoom(state.current, action.payload, (room) => {
        if (room.currentStep > 1) {
          room.currentStep = (room.currentStep - 1) as RoomInspectionStep;
        }
      });
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loadInspectionDraft.fulfilled, (state, action) => {
        if (action.payload) {
          state.current = action.payload;
        }
      })
      .addCase(saveInspectionDraft.pending, (state) => {
        state.isSaving = true;
      })
      .addCase(saveInspectionDraft.fulfilled, (state) => {
        state.isSaving = false;
      })
      .addCase(saveInspectionDraft.rejected, (state) => {
        state.isSaving = false;
      });
  },
});

export const {
  initInspection,
  clearInspection,
  addFloor,
  removeFloor,
  addUnit,
  removeUnit,
  addRoom,
  setActiveRoom,
  addOverviewPhoto,
  removeOverviewPhoto,
  setRoomDimensions,
  setSurfaces,
  updateSurface,
  setEquipment,
  setMoistureMap,
  advanceRoomStep,
  goBackRoomStep,
} = inspectionSlice.actions;

export default inspectionSlice.reducer;
