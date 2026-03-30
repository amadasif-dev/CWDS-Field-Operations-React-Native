/**
 * Attendance Service — API layer for attendance wizard form data
 *
 * CURRENT: Returns dummy/mock responses to simulate backend API.
 * FUTURE:  Replace mock delay + dummy data with real apiClient calls.
 *          No structural changes needed — just swap the implementation inside each method.
 *
 * Matches BACKEND_API_SPEC.md endpoints:
 *   - GET  /attendance/{attendanceId}/complete     → getAttendanceFormComplete()
 *   - GET  /jobs/{jobId}/attendance/complete        → getAttendanceFormByJob()
 *   - POST /jobs/{jobId}/attendance                 → submitAttendanceForm()
 *   - PUT  /jobs/{jobId}/attendance/draft           → saveAttendanceDraft()
 *   - GET  /technicians/me/attendance               → getMyAttendanceHistory()
 */

import apiClient from './client';
import type { ApiResponse } from '../types/api';
import {
  DUMMY_ATTENDANCE_FORM_COMPLETE,
  DUMMY_ATTENDANCE_FORM_DRAFT,
} from './mockData/attendanceFormData';

// ---------------------------------------------------------------------------
// Type Definitions — matching BACKEND_API_SPEC.md response shapes
// ---------------------------------------------------------------------------

export interface AttendanceFormStep {
  stepNumber: number;
  title: string;
  status: 'completed' | 'pending' | 'in_progress' | 'skipped';
  completedAt: string | null;
  isValid: boolean;
  data: Record<string, unknown>;
}

export interface AttendanceFormResponse {
  attendanceId: string;
  jobId: string;
  jobTitle: string;
  status: string;
  isDraft: boolean;
  isComplete: boolean;
  completedSteps: number;
  totalSteps: number;
  completionPercentage: number;

  technician: {
    id: string;
    name: string;
    email: string;
    phone: string;
    role: string;
  };

  jobContext: {
    clientName: string;
    clientPhone: string;
    address: string;
    waterCategory: number;
    waterClass: number;
    buildingType: string;
    affectedRooms: string[];
    insuranceClaimNumber?: string;
  };

  formData: {
    step1: AttendanceFormStep;
    step2: AttendanceFormStep;
    step3: AttendanceFormStep;
    step4: AttendanceFormStep;
    step5: AttendanceFormStep;
    step6: AttendanceFormStep;
    step7: AttendanceFormStep;
    step8: AttendanceFormStep;
  };

  summary: {
    arrivalTime: string;
    departureTime: string;
    totalHours: number;
    billableHours: number;
    roomsInspected: number;
    totalAreaInspected: number;
    photosCount: number;
    equipmentInstalled: number;
    consumablesUsed: number;
    totalCost: number;
    hasForm2: boolean;
    form2Signed: boolean;
  };

  photosGallery: {
    totalCount: number;
    categories: {
      roomOverviews: Record<string, unknown>[];
      moistureReadings: Record<string, unknown>[];
      equipment: Record<string, unknown>[];
      signatures: Record<string, unknown>[];
    };
  };

  validation: {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    checkedAt: string;
  };

  review: {
    status: string;
    submittedForReviewAt: string | null;
    reviewedBy: string | null;
    reviewedAt: string | null;
    rating: number | null;
    notes: string | null;
  };

  metadata: {
    createdAt: string;
    submittedAt: string | null;
    updatedAt: string;
    submittedBy: string;
    schemaVersion: string;
  };

  uiConfig: {
    editable: boolean;
    viewMode: 'review' | 'edit' | 'readonly';
    canResume: boolean;
    showActions: string[];
    activeStep: number | null;
    completedSteps: number[];
    pendingSteps: number[];
    validationErrors: string[];
  };
}

export interface AttendanceHistoryItem {
  id: string;
  jobId: string;
  jobTitle: string;
  date: string;
  status: string;
  arrivalTime: string;
  departureTime: string;
  totalHours: number;
  roomsInspected: number;
  photosCount: number;
}

// ---------------------------------------------------------------------------
// Mock delay helper — simulates network latency
// ---------------------------------------------------------------------------
const MOCK_DELAY_MS = 800;

const mockDelay = (ms: number = MOCK_DELAY_MS): Promise<void> =>
  new Promise(resolve => setTimeout(resolve, ms));

// ---------------------------------------------------------------------------
// USE_MOCK flag — set to false when real backend is available
// ---------------------------------------------------------------------------
const USE_MOCK = true;

// ---------------------------------------------------------------------------
// Service Implementation
// ---------------------------------------------------------------------------
export const attendanceService = {
  /**
   * GET /attendance/{attendanceId}/complete
   * Retrieve complete attendance form data by attendance ID.
   */
  getAttendanceFormComplete: async (
    attendanceId: string,
  ): Promise<ApiResponse<AttendanceFormResponse>> => {
    if (USE_MOCK) {
      await mockDelay();
      const isDraft = attendanceId.includes('002');
      const formData = isDraft
        ? DUMMY_ATTENDANCE_FORM_DRAFT
        : DUMMY_ATTENDANCE_FORM_COMPLETE;
      return { success: true, data: formData };
    }

    // FUTURE: Real API call
    const { data } = await apiClient.get<ApiResponse<AttendanceFormResponse>>(
      `/attendance/${attendanceId}/complete`,
    );
    return data;
  },

  /**
   * GET /jobs/{jobId}/attendance/complete?date={date}
   * Retrieve complete attendance form data by job ID and optional date.
   */
  getAttendanceFormByJob: async (
    jobId: string,
    date?: string,
  ): Promise<ApiResponse<AttendanceFormResponse>> => {
    if (USE_MOCK) {
      await mockDelay();
      const formData = {
        ...DUMMY_ATTENDANCE_FORM_COMPLETE,
        jobId,
      };
      return { success: true, data: formData };
    }

    // FUTURE: Real API call
    const { data } = await apiClient.get<ApiResponse<AttendanceFormResponse>>(
      `/jobs/${jobId}/attendance/complete`,
      { params: { date } },
    );
    return data;
  },

  /**
   * POST /jobs/{jobId}/attendance
   * Submit completed attendance wizard form.
   */
  submitAttendanceForm: async (
    jobId: string,
    payload: Record<string, unknown>,
  ): Promise<ApiResponse<{ attendanceId: string; status: string }>> => {
    if (USE_MOCK) {
      await mockDelay(1200);
      return {
        success: true,
        data: {
          attendanceId: `att_${Date.now()}`,
          status: 'submitted',
        },
        message: 'Attendance submitted successfully',
      };
    }

    // FUTURE: Real API call
    const { data } = await apiClient.post<
      ApiResponse<{ attendanceId: string; status: string }>
    >(`/jobs/${jobId}/attendance`, payload);
    return data;
  },

  /**
   * PUT /jobs/{jobId}/attendance/draft
   * Save attendance wizard progress as draft.
   */
  saveAttendanceDraft: async (
    jobId: string,
    draftPayload: Record<string, unknown>,
  ): Promise<ApiResponse<{ draftId: string; savedAt: string }>> => {
    if (USE_MOCK) {
      await mockDelay(500);
      return {
        success: true,
        data: {
          draftId: `draft_${Date.now()}`,
          savedAt: new Date().toISOString(),
        },
        message: 'Draft saved successfully',
      };
    }

    // FUTURE: Real API call
    const { data } = await apiClient.put<
      ApiResponse<{ draftId: string; savedAt: string }>
    >(`/jobs/${jobId}/attendance/draft`, draftPayload);
    return data;
  },

  /**
   * GET /technicians/me/attendance?page={page}&limit={limit}
   * Retrieve attendance history for the logged-in technician.
   */
  getMyAttendanceHistory: async (
    page: number = 1,
    limit: number = 20,
  ): Promise<ApiResponse<AttendanceHistoryItem[]>> => {
    if (USE_MOCK) {
      await mockDelay();
      const dummyHistory: AttendanceHistoryItem[] = [
        {
          id: 'att_20250330_001',
          jobId: 'JOB-20250326-001',
          jobTitle: 'Water Damage Restoration — Unit 4',
          date: '2025-03-30',
          status: 'Submitted',
          arrivalTime: '09:10 AM',
          departureTime: '02:30 PM',
          totalHours: 5.33,
          roomsInspected: 3,
          photosCount: 14,
        },
        {
          id: 'att_20250329_001',
          jobId: 'JOB-20250325-003',
          jobTitle: 'Water Extraction — Ground Floor',
          date: '2025-03-29',
          status: 'Approved',
          arrivalTime: '08:00 AM',
          departureTime: '12:45 PM',
          totalHours: 4.75,
          roomsInspected: 2,
          photosCount: 10,
        },
        {
          id: 'att_20250328_001',
          jobId: 'JOB-20250324-007',
          jobTitle: 'Mold Assessment — Bedroom',
          date: '2025-03-28',
          status: 'Approved',
          arrivalTime: '10:00 AM',
          departureTime: '01:30 PM',
          totalHours: 3.5,
          roomsInspected: 1,
          photosCount: 8,
        },
        {
          id: 'att_20250327_001',
          jobId: 'JOB-20250323-002',
          jobTitle: 'Storm Damage Cleanup — Garage',
          date: '2025-03-27',
          status: 'Submitted',
          arrivalTime: '07:30 AM',
          departureTime: '03:00 PM',
          totalHours: 7.5,
          roomsInspected: 4,
          photosCount: 22,
        },
        {
          id: 'att_20250326_001',
          jobId: 'JOB-20250322-005',
          jobTitle: 'Burst Pipe — Kitchen & Laundry',
          date: '2025-03-26',
          status: 'Approved',
          arrivalTime: '09:00 AM',
          departureTime: '02:00 PM',
          totalHours: 5.0,
          roomsInspected: 2,
          photosCount: 12,
        },
      ];
      return { success: true, data: dummyHistory };
    }

    // FUTURE: Real API call
    const { data } = await apiClient.get<ApiResponse<AttendanceHistoryItem[]>>(
      '/technicians/me/attendance',
      { params: { page, limit } },
    );
    return data;
  },
};
