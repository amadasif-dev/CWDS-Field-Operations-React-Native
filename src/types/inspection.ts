// ─── Hierarchical Data Model ────────────────────────────────────
// Floor → Unit → Room → Surface → Reading → Photo
// Every data point is structured at the moment of capture.

export type SurfaceType = 'ceiling' | 'walls' | 'flooring';

export type MaterialType =
  | 'drywall'
  | 'plaster'
  | 'concrete'
  | 'timber'
  | 'tile'
  | 'carpet'
  | 'vinyl'
  | 'laminate'
  | 'hardwood'
  | 'metal'
  | 'fibro'
  | 'brick'
  | 'other';

export type EquipmentType =
  | 'dehumidifier'
  | 'blower'
  | 'air_scrubber'
  | 'drymatic'
  | 'heat_mat'
  | 'injection_system'
  | 'moisture_meter'
  | 'thermal_camera'
  | 'other';

export type NonRestorableReason =
  | 'mould_contamination'
  | 'structural_damage'
  | 'delamination'
  | 'swelling'
  | 'staining_permanent'
  | 'asbestos_suspected'
  | 'odour_retention'
  | 'other';

export type AnnotationColor = 'blue' | 'green';

// ─── Photo (leaf node) ──────────────────────────────────────────
export interface InspectionPhoto {
  id: string;
  uri: string;
  timestamp: string;
  tags: Record<string, string>;
  type:
    | 'room_overview'
    | 'moisture_evidence'
    | 'non_restorable_evidence'
    | 'equipment_confirmation'
    | 'moisture_map';
}

// ─── Reading ────────────────────────────────────────────────────
export interface MoistureReading {
  id: string;
  peakMoisturePercent: number;
  dryStandardPercent: number;
  isRestorable: boolean;
  nonRestorableReason?: NonRestorableReason;
  nonRestorableNotes?: string;
  photos: InspectionPhoto[];
}

// ─── Surface ────────────────────────────────────────────────────
export interface SurfaceInspection {
  id: string;
  surfaceType: SurfaceType;
  materialType: MaterialType;
  isAffected: boolean;
  reading?: MoistureReading;
  nonRestorableEvidence?: {
    reason: NonRestorableReason;
    notes?: string;
    photos: InspectionPhoto[];
    confirmed: boolean;
  };
}

// ─── Equipment Entry ────────────────────────────────────────────
export interface RoomEquipmentEntry {
  id: string;
  equipmentType: EquipmentType;
  quantity: number;
  notes?: string;
}

// ─── Moisture Map Annotation ────────────────────────────────────
export interface MapAnnotation {
  id: string;
  color: AnnotationColor;
  points: { x: number; y: number }[];
}

// ─── Room ───────────────────────────────────────────────────────
export interface RoomInspection {
  id: string;
  name: string;
  currentStep: RoomInspectionStep;
  isComplete: boolean;

  // Step 1 — Room Overview
  overviewPhotos: InspectionPhoto[];
  dimensions: {
    length: number;
    width: number;
    height: number;
  } | null;

  // Step 2 — Surface inspections (ceiling, walls, flooring)
  surfaces: SurfaceInspection[];

  // Step 3 — captured via surfaces[].nonRestorableEvidence (conditional)

  // Step 4 — Equipment
  equipment: RoomEquipmentEntry[];
  equipmentPhoto: InspectionPhoto | null;

  // Step 5 — Moisture Map
  moistureMapAnnotations: MapAnnotation[];
  moistureMapBasePhotoId: string | null;
}

export type RoomInspectionStep = 1 | 2 | 3 | 4 | 5;

// ─── Unit ───────────────────────────────────────────────────────
export interface UnitInspection {
  id: string;
  name: string;
  rooms: RoomInspection[];
}

// ─── Floor ──────────────────────────────────────────────────────
export interface FloorInspection {
  id: string;
  name: string;
  units: UnitInspection[];
}

// ─── Full Job Inspection ────────────────────────────────────────
export interface JobInspection {
  id: string;
  jobId: string;
  status: 'draft' | 'in_progress' | 'submitted' | 'approved';
  floors: FloorInspection[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

// ─── Constants ──────────────────────────────────────────────────
export const SURFACE_TYPES: { key: SurfaceType; label: string }[] = [
  { key: 'ceiling', label: 'Ceiling' },
  { key: 'walls', label: 'Walls' },
  { key: 'flooring', label: 'Flooring' },
];

export const MATERIAL_OPTIONS: { key: MaterialType; label: string }[] = [
  { key: 'drywall', label: 'Drywall' },
  { key: 'plaster', label: 'Plaster' },
  { key: 'concrete', label: 'Concrete' },
  { key: 'timber', label: 'Timber' },
  { key: 'tile', label: 'Tile' },
  { key: 'carpet', label: 'Carpet' },
  { key: 'vinyl', label: 'Vinyl' },
  { key: 'laminate', label: 'Laminate' },
  { key: 'hardwood', label: 'Hardwood' },
  { key: 'metal', label: 'Metal' },
  { key: 'fibro', label: 'Fibro' },
  { key: 'brick', label: 'Brick' },
  { key: 'other', label: 'Other' },
];

export const EQUIPMENT_OPTIONS: { key: EquipmentType; label: string }[] = [
  { key: 'dehumidifier', label: 'Dehumidifier' },
  { key: 'blower', label: 'Blower' },
  { key: 'air_scrubber', label: 'Air Scrubber' },
  { key: 'drymatic', label: 'Drymatic' },
  { key: 'heat_mat', label: 'Heat Mat' },
  { key: 'injection_system', label: 'Injection System' },
  { key: 'moisture_meter', label: 'Moisture Meter' },
  { key: 'thermal_camera', label: 'Thermal Camera' },
  { key: 'other', label: 'Other' },
];

export const NON_RESTORABLE_REASONS: { key: NonRestorableReason; label: string }[] = [
  { key: 'mould_contamination', label: 'Mould Contamination' },
  { key: 'structural_damage', label: 'Structural Damage' },
  { key: 'delamination', label: 'Delamination' },
  { key: 'swelling', label: 'Swelling' },
  { key: 'staining_permanent', label: 'Permanent Staining' },
  { key: 'asbestos_suspected', label: 'Asbestos Suspected' },
  { key: 'odour_retention', label: 'Odour Retention' },
  { key: 'other', label: 'Other' },
];

export const ROOM_INSPECTION_STEPS: { step: RoomInspectionStep; title: string }[] = [
  { step: 1, title: 'Room Overview Photos' },
  { step: 2, title: 'Surface Inspection' },
  { step: 3, title: 'Non-Restorable Evidence' },
  { step: 4, title: 'Equipment Logged' },
  { step: 5, title: 'Moisture Map' },
];
