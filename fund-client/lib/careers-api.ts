import api from "./api";

export type JobPostingStatus = "draft" | "published" | "closed";
export type JobApplicationStatus =
  | "new"
  | "reviewed"
  | "shortlisted"
  | "rejected"
  | "hired";
export type CareerInquiryStatus = "new" | "reviewed" | "resolved";

export interface JobPosting {
  id: string;
  slug: string;
  title: string;
  department: string;
  location: string;
  jobType: string;
  description: string;
  requirements: string[];
  status: JobPostingStatus;
  publishedAt: string | null;
  closesAt: string | null;
  posted: string;
  applicationCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface JobApplication {
  id: string;
  jobPostingId: string;
  jobTitle: string;
  fullName: string;
  email: string;
  phone: string | null;
  linkedin: string | null;
  github: string | null;
  portfolio: string | null;
  resumeUrl: string;
  coverLetter: string;
  status: JobApplicationStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CareerInquiry {
  id: string;
  fullName: string;
  email: string;
  interestedRole: string;
  message: string;
  status: CareerInquiryStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateJobPostingInput {
  title: string;
  department?: string;
  location?: string;
  jobType?: string;
  description: string;
  requirements?: string[];
  status?: JobPostingStatus;
  slug?: string;
  closesAt?: string;
}

export interface UpdateJobPostingInput extends Partial<CreateJobPostingInput> {}

export interface SubmitApplicationInput {
  fullName: string;
  email: string;
  phone?: string;
  linkedin?: string;
  github?: string;
  portfolio?: string;
  resumeUrl: string;
  coverLetter: string;
}

export interface SubmitInquiryInput {
  fullName: string;
  email: string;
  interestedRole: string;
  message: string;
}

export const careersAPI = {
  getJobs: async (params?: {
    department?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get("/careers", { params });
    return data as { jobs: JobPosting[]; total: number };
  },

  getDepartments: async () => {
    const { data } = await api.get("/careers/departments");
    return data as string[];
  },

  getBySlug: async (slug: string) => {
    const { data } = await api.get(`/careers/${slug}`);
    return data as JobPosting;
  },

  submitApplication: async (jobId: string, input: SubmitApplicationInput) => {
    const { data } = await api.post(`/careers/${jobId}/apply`, input);
    return data as { id: string; message: string };
  },

  submitInquiry: async (input: SubmitInquiryInput) => {
    const { data } = await api.post("/careers/inquiries", input);
    return data as { id: string; message: string };
  },

  // Admin endpoints
  getAllAdmin: async (params?: {
    status?: JobPostingStatus;
    search?: string;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get("/careers/admin/all", { params });
    return data as { jobs: JobPosting[]; total: number };
  },

  create: async (input: CreateJobPostingInput) => {
    const { data } = await api.post("/careers", input);
    return data as JobPosting;
  },

  update: async (id: string, input: UpdateJobPostingInput) => {
    const { data } = await api.patch(`/careers/${id}`, input);
    return data as JobPosting;
  },

  publish: async (id: string, publish = true) => {
    const { data } = await api.patch(`/careers/${id}/publish`, { publish });
    return data as JobPosting;
  },

  close: async (id: string) => {
    const { data } = await api.patch(`/careers/${id}/close`);
    return data as JobPosting;
  },

  delete: async (id: string) => {
    await api.delete(`/careers/${id}`);
  },

  getApplications: async (params?: {
    jobPostingId?: string;
    status?: JobApplicationStatus;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get("/careers/admin/applications", { params });
    return data as { applications: JobApplication[]; total: number };
  },

  updateApplicationStatus: async (
    id: string,
    status: JobApplicationStatus
  ) => {
    const { data } = await api.patch(
      `/careers/admin/applications/${id}/status`,
      { status }
    );
    return data as JobApplication;
  },

  getInquiries: async (params?: {
    status?: CareerInquiryStatus;
    page?: number;
    limit?: number;
  }) => {
    const { data } = await api.get("/careers/admin/inquiries", { params });
    return data as { inquiries: CareerInquiry[]; total: number };
  },

  updateInquiryStatus: async (id: string, status: CareerInquiryStatus) => {
    const { data } = await api.patch(
      `/careers/admin/inquiries/${id}/status`,
      { status }
    );
    return data as CareerInquiry;
  },
};
