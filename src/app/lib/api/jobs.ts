import { JobStatusResponse } from '../../types/api';
import { apiRequest } from './client';

export async function getJobStatus(jobId: string): Promise<JobStatusResponse> {
  return apiRequest<JobStatusResponse>(`/api/jobs/${jobId}`);
}
