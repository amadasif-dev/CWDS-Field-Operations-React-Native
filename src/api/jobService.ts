import apiClient from './client';
import type {
  ApiResponse,
  PaginatedResponse,
  JobListParams,
  AttendanceSubmitPayload,
} from '../types/api';
import type { Job, AttendanceReport } from '../types/models';

export const jobService = {
  getJobs: async (params?: JobListParams): Promise<PaginatedResponse<Job>> => {
    const { data } = await apiClient.get<PaginatedResponse<Job>>('/jobs', {
      params,
    });
    return data;
  },

  getJobById: async (jobId: string): Promise<ApiResponse<Job>> => {
    const { data } = await apiClient.get<ApiResponse<Job>>(`/jobs/${jobId}`);
    return data;
  },

  updateJobStatus: async (
    jobId: string,
    status: string,
  ): Promise<ApiResponse<Job>> => {
    const { data } = await apiClient.patch<ApiResponse<Job>>(
      `/jobs/${jobId}/status`,
      { status },
    );
    return data;
  },

  submitAttendance: async (
    payload: AttendanceSubmitPayload,
  ): Promise<ApiResponse<AttendanceReport>> => {
    const { data } = await apiClient.post<ApiResponse<AttendanceReport>>(
      `/jobs/${payload.jobId}/attendance`,
      payload,
    );
    return data;
  },

  saveDraft: async (
    jobId: string,
    draft: Partial<AttendanceReport>,
  ): Promise<ApiResponse<AttendanceReport>> => {
    const { data } = await apiClient.put<ApiResponse<AttendanceReport>>(
      `/jobs/${jobId}/attendance/draft`,
      draft,
    );
    return data;
  },

  uploadPhoto: async (
    jobId: string,
    formData: FormData,
  ): Promise<ApiResponse<{ url: string }>> => {
    const { data } = await apiClient.post<ApiResponse<{ url: string }>>(
      `/jobs/${jobId}/photos`,
      formData,
      { headers: { 'Content-Type': 'multipart/form-data' } },
    );
    return data;
  },
};
