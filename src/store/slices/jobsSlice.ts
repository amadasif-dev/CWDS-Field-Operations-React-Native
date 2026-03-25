import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { jobService } from '../../api';
import type { Job } from '../../types/models';
import type { JobListParams } from '../../types/api';

interface JobsState {
  jobs: Job[];
  selectedJob: Job | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filter: {
    status: string;
    search: string;
  };
}

const initialState: JobsState = {
  jobs: [],
  selectedJob: null,
  isLoading: false,
  isRefreshing: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  filter: {
    status: 'all',
    search: '',
  },
};

export const fetchJobs = createAsyncThunk(
  'jobs/fetchJobs',
  async (params: JobListParams | undefined, { rejectWithValue }) => {
    try {
      const response = await jobService.getJobs(params);
      return response;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch jobs';
      return rejectWithValue(message);
    }
  },
);

export const fetchJobById = createAsyncThunk(
  'jobs/fetchJobById',
  async (jobId: string, { rejectWithValue }) => {
    try {
      const response = await jobService.getJobById(jobId);
      return response.data;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to fetch job';
      return rejectWithValue(message);
    }
  },
);

export const updateJobStatus = createAsyncThunk(
  'jobs/updateJobStatus',
  async (
    { jobId, status }: { jobId: string; status: string },
    { rejectWithValue },
  ) => {
    try {
      const response = await jobService.updateJobStatus(jobId, status);
      return response.data;
    } catch (error: unknown) {
      const message =
        error instanceof Error ? error.message : 'Failed to update status';
      return rejectWithValue(message);
    }
  },
);

const jobsSlice = createSlice({
  name: 'jobs',
  initialState,
  reducers: {
    setFilter: (
      state,
      action: PayloadAction<Partial<JobsState['filter']>>,
    ) => {
      state.filter = { ...state.filter, ...action.payload };
    },
    clearSelectedJob: (state) => {
      state.selectedJob = null;
    },
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch jobs
      .addCase(fetchJobs.pending, (state, action) => {
        const isRefresh = action.meta.arg?.page === 1;
        if (isRefresh) {
          state.isRefreshing = true;
        } else {
          state.isLoading = true;
        }
        state.error = null;
      })
      .addCase(fetchJobs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        const isFirstPage = action.payload.pagination.page === 1;
        state.jobs = isFirstPage
          ? action.payload.data
          : [...state.jobs, ...action.payload.data];
        state.pagination = action.payload.pagination;
      })
      .addCase(fetchJobs.rejected, (state, action) => {
        state.isLoading = false;
        state.isRefreshing = false;
        state.error = action.payload as string;
      })
      // Fetch job by ID
      .addCase(fetchJobById.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchJobById.fulfilled, (state, action) => {
        state.isLoading = false;
        state.selectedJob = action.payload;
      })
      .addCase(fetchJobById.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Update job status
      .addCase(updateJobStatus.fulfilled, (state, action) => {
        const index = state.jobs.findIndex(
          (j) => j.id === action.payload.id,
        );
        if (index >= 0) {
          state.jobs[index] = action.payload;
        }
        if (state.selectedJob?.id === action.payload.id) {
          state.selectedJob = action.payload;
        }
      });
  },
});

export const { setFilter, clearSelectedJob, clearError } = jobsSlice.actions;
export default jobsSlice.reducer;
