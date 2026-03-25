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

export interface Photo {
  id: string;
  uri: string;
  timestamp: string;
  caption?: string;
  type: 'before' | 'during' | 'after' | 'issue';
}

export interface Signature {
  base64: string;
  timestamp: string;
  signerName: string;
  signerRole: string;
}

export interface Notification {
  id: string;
  title: string;
  body: string;
  type: 'job_assigned' | 'job_updated' | 'reminder' | 'alert';
  data?: Record<string, unknown>;
  read: boolean;
  createdAt: string;
}
