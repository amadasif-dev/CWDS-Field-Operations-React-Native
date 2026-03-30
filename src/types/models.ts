// types/models.ts

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'technician' | 'supervisor' | 'admin';
  avatar?: string;
  token: string;
  refreshToken: string;
}

export type WaterDamageCause =
  | 'Burst pipe'
  | 'Leaking roof'
  | 'Overflowing bath/shower'
  | 'Overflowing toilet'
  | 'Overflowing washing machine'
  | 'Overflowing dishwasher'
  | 'Hot water system failure'
  | 'Storm damage'
  | 'Flash flooding'
  | 'Rising damp'
  | 'Condensation'
  | 'Fire suppression (sprinklers)'
  | 'Sewage backup'
  | 'Air conditioning leak'
  | 'Refrigerator leak'
  | 'Aquarium/fish tank'
  | 'Subfloor moisture'
  | 'Unknown origin'
  | 'Other';

export type WaterCategory = 1 | 2 | 3;
export type WaterClass = 1 | 2 | 3 | 4;
export type BuildingType = 'Residential' | 'Commercial' | 'Strata';

export interface Job {
  id: string;
  title: string;
  description: string;
  status: JobStatus;
  priority: JobPriority;
  clientName: string;
  clientPhone: string;
  address: string;
  latitude?: number;
  longitude?: number;
  scheduledDate: string;
  scheduledTime: string;
  estimatedDuration: number;
  assignedTo: string;
  createdAt: string;
  updatedAt: string;
  notes?: string;
  equipment?: Equipment[];
  inspections?: Inspection[];
  attendance?: AttendanceReport;
  siteIntelligence?: SiteIntelligence;
  jsa?: JSA;
  scope?: Scope;
  waterDamageCause?: WaterDamageCause;
  waterCategory?: WaterCategory;
  waterClass?: WaterClass;
  buildingType?: BuildingType;
  affectedRooms?: string[];
  adminNotes?: string;
  floorPlans?: FloorPlanImage[];
  referenceDocuments?: ReferenceDocument[];
  attendanceHistory?: AttendanceHistoryItem[];
}

export interface JobDetail extends Job {
  siteIntelligence?: SiteIntelligence;
  jsa?: JSA;
  scope?: Scope;
  attendanceStarted?: boolean;
  attendanceCompleted?: boolean;
}

export interface FloorPlanImage {
  id: string;
  uri: string;
  label?: string;
  unitId?: string;
}

export interface ReferenceDocument {
  id: string;
  name: string;
  uri: string;
  type: 'pdf' | 'image' | 'other';
}

export interface AttendanceHistoryItem {
  id: string;
  date: string;
  technicianName: string;
  arrivalTime: string;
  departureTime: string;
  status: 'Submitted' | 'Draft';
  totalHours?: number;
}

export interface SiteIntelligence {
  constructionYear?: number;
  asbestosRisk?: boolean;
  materials?: string[];
  rooms?: Room[];
  hazards?: string[];
}

export interface JSA {
  sopName: string;
  hazards: Hazard[];
}

export interface Hazard {
  description: string;
  risk: 'Low' | 'Medium' | 'High';
  control: string;
}

export interface Scope {
  invasiveWorks: boolean;
  description?: string;
}

export type JobStatus =
  | 'pending'
  | 'assigned'
  | 'in_progress'
  | 'completed'
  | 'on_hold'
  | 'cancelled';

export type JobPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface Equipment {
  id: string;
  name: string;
  model: string;
  serialNumber: string;
  condition: 'good' | 'fair' | 'poor' | 'damaged';
  notes?: string;
}

export interface Inspection {
  id: string;
  jobId: string;
  type: string;
  status: 'pending' | 'passed' | 'failed' | 'na';
  notes?: string;
  photos?: string[];
  completedAt?: string;
}

export interface AttendanceReport {
  id: string;
  jobId: string;
  status: AttendanceStatus;
  currentStep: number;
  steps: AttendanceStep[];
  createdAt: string;
  updatedAt: string;
  submittedAt?: string;
}

export type AttendanceStatus = 'draft' | 'in_progress' | 'submitted' | 'approved';

export interface AttendanceStep {
  stepNumber: number;
  title: string;
  description: string;
  isCompleted: boolean;
  data: Record<string, unknown>;
  validationErrors?: string[];
}

// Room Inspection Types
export interface Room {
  id: string;
  name: string;
  floor: string;
  status: 'pending' | 'in_progress' | 'complete';
  data?: RoomInspectionData;
}

export interface RoomInspectionData {
  overviewPhotos?: Photo[];
  dimensions?: RoomDimensions;
  surfaces?: SurfaceInspections;
  equipment?: EquipmentItem[];
  moistureMap?: MoistureMap;
  confirmationPhoto?: string;
}

export interface RoomDimensions {
  length: string;
  width: string;
  height: string;
}

export interface SurfaceInspections {
  ceiling: SurfaceData | null;
  walls: SurfaceData | null;
  flooring: SurfaceData | null;
}

export interface SurfaceData {
  material: string;
  affected: boolean;
  moisturePhoto?: string;
  peakMoisture?: string;
  dryStandard?: string;
  restorable?: boolean;
  nonRestorableReason?: string;
  nonRestorablePhoto?: string;
}

export interface EquipmentItem {
  id: string;
  name: string;
  quantity: number;
}

export interface MoistureMap {
  paths: any[];
  savedImage: string;
  timestamp: string;
}

// Consumables Types
export interface Consumables {
  [key: string]: number;
}

export interface ConsumableItem {
  id: string;
  name: string;
  unit: string;
  quantity: number;
}

// JSA (Job Safety Analysis)
export interface JSA {
  sopName: string;
  hazards: Hazard[];
}

export interface Hazard {
  description: string;
  risk: 'Low' | 'Medium' | 'High';
  control: string;
}

// Scope for invasive works
export interface Scope {
  invasiveWorks: boolean;
  description?: string;
}

// Site Intelligence
export interface SiteIntelligence {
  constructionYear?: number;
  asbestosRisk?: boolean;
  materials?: string[];
  rooms?: Room[];
  hazards?: string[];
}

// Photo Types
export interface Photo {
  id: string;
  uri: string;
  timestamp: string;
  caption?: string;
  type: 'before' | 'during' | 'after' | 'issue' | 'overview' | 'moisture' | 'equipment' | 'non_restorable';
  roomId?: string;
  surface?: string;
}

// Signature Types
export interface Signature {
  base64: string;
  timestamp: string;
  signerName: string;
  signerRole?: string;
}

// Notification Types
export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'job_assigned' | 'job_updated' | 'reminder' | 'alert';
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}

// Step Data Types
export interface StepData {
  [stepNumber: number]: Record<string, unknown>;
}

// OH&S Declaration Step Data
export interface OHSDeclarationData {
  checkedItems: Record<string, boolean>;
  asbestosAcknowledged?: boolean;
  confirmed: boolean;
  arrivalTime?: string;
}

// Site Assessment Step Data
export interface SiteAssessmentData {
  siteCondition: string;
  accessNotes: string;
  hazards?: string;
}

// Equipment Check Step Data
export interface EquipmentCheckData {
  checkedItems: Record<string, boolean>;
  equipmentNotes?: string;
  equipmentVerified: boolean;
}

// Safety Checklist Step Data
export interface SafetyChecklistData {
  checkedItems: Record<string, boolean>;
  safetyCompleted: boolean;
}

// Work Documentation Step Data
export interface WorkDocumentationData {
  workDescription: string;
  materialsUsed?: string;
  issuesFound?: string;
  recommendations?: string;
}

// Photo Evidence Step Data
export interface PhotoEvidenceData {
  hasPhotos: boolean;
  photoCount: number;
}

// Client Signature Step Data
export interface ClientSignatureData {
  hasSignature: boolean;
  signerName: string;
  signerRole?: string;
}

// Departure Time Step Data
export interface DepartureTimeData {
  departureTime: string;
  confirmed: boolean;
  hasIssues: boolean;
  issuesNotes?: string;
  siteClean: boolean;
  totalHours: number;
  arrivalTime?: string;
}

// JSA Step Data
export interface JSAStepData {
  sopName: string;
  hazards: Hazard[];
  technicianSignature: Signature | null;
  signatureTimestamp?: string;
  scrolledToBottom: boolean;
}

// Arrival Check-in Step Data
export interface ArrivalCheckInData {
  arrivalTime: string;
  confirmed: boolean;
  siteAccessible: boolean;
  hasHazards: boolean;
  hazardNotes?: string;
  clientOnSite: boolean;
  clientName?: string;
}

// Form 2 Signing Step Data
export interface Form2SigningData {
  clientName: string;
  clientSignature: Signature | null;
  technicianSignature: Signature | null;
  form2Scrolled: boolean;
  signedAt?: string;
  isInvasive: boolean;
  skipped?: boolean;
}
export interface SummaryData {
  allComplete: boolean;
  submittedAt?: string;
}

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
  errors?: string[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}