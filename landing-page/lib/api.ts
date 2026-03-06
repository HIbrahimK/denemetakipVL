import { API_URL } from "./auth";

/**
 * Centralized API client for the landing page.
 * Uses cookie-based auth for super admin endpoints.
 */

interface FetchOptions extends RequestInit {
  params?: Record<string, string | undefined>;
}

class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.data = data;
  }
}

async function request<T = any>(
  endpoint: string,
  options: FetchOptions = {}
): Promise<T> {
  const { params, ...fetchOptions } = options;

  // Build URL with query params
  let url = `${API_URL}${endpoint}`;
  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.append(key, value);
      }
    });
    const queryString = searchParams.toString();
    if (queryString) {
      url += `?${queryString}`;
    }
  }

  const response = await fetch(url, {
    ...fetchOptions,
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    },
  });

  // Handle non-JSON responses
  const contentType = response.headers.get("content-type");
  const isJson = contentType?.includes("application/json");

  if (!response.ok) {
    const data = isJson ? await response.json() : null;
    throw new ApiError(
      data?.message || `API error: ${response.status}`,
      response.status,
      data
    );
  }

  if (isJson) {
    return response.json();
  }

  return null as T;
}

// ==========================================
// Public API
// ==========================================

export const api = {
  // Contact
  submitContactForm: (data: {
    firstName: string;
    lastName: string;
    email: string;
    subject: string;
    message: string;
  }) =>
    request<{ success: boolean; message: string; id: string }>("/contact", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  // Demo Requests
  submitDemoRequest: (data: {
    schoolName: string;
    contactName: string;
    email: string;
    phone: string;
    studentCount?: string;
    city?: string;
    notes?: string;
  }) =>
    request<{ success: boolean; message: string; id: string }>(
      "/demo-requests",
      {
        method: "POST",
        body: JSON.stringify(data),
      }
    ),

  // Schools (public)
  resolveSchool: (host: string) =>
    request(`/schools/resolve`, { params: { host } }),

  // Blog (public)
  getBlogPosts: (params?: { page?: string; limit?: string; category?: string }) =>
    request<{
      data: Array<{
        id: string;
        title: string;
        slug: string;
        excerpt: string;
        category: string;
        tags: string[];
        author: string;
        views: number;
        publishedAt: string;
        createdAt: string;
      }>;
      meta: { total: number; page: number; limit: number; totalPages: number };
    }>("/blog", { params }),

  getBlogBySlug: (slug: string) =>
    request<{
      id: string;
      title: string;
      slug: string;
      excerpt: string;
      content: string;
      category: string;
      tags: string[];
      author: string;
      views: number;
      publishedAt: string;
      createdAt: string;
    }>(`/blog/${slug}`),

  getBlogCategories: () =>
    request<string[]>("/blog/categories"),
};

// ==========================================
// Super Admin API
// ==========================================

export const adminApi = {
  // Schools
  getSchools: (params?: {
    page?: string;
    limit?: string;
    search?: string;
    status?: string;
  }) => request("/schools/all", { params }),

  createSchool: (data: any) =>
    request("/schools", { method: "POST", body: JSON.stringify(data) }),

  uploadLogo: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_URL}/schools/upload-logo`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new ApiError(
        data?.message || `Upload failed: ${response.status}`,
        response.status,
        data
      );
    }
    return response.json();
  },

  getSchool: (id: string) => request(`/schools/${id}`),

  getSchoolStats: (id: string) => request(`/schools/${id}/stats`),

  updateSchool: (id: string, data: any) =>
    request(`/schools/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  deleteSchool: (id: string) =>
    request(`/schools/${id}`, { method: "DELETE" }),

  updateSchoolLicense: (id: string, data: any) =>
    request(`/schools/${id}/license`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),

  // Contact Messages
  getContactMessages: (params?: {
    page?: string;
    limit?: string;
    status?: string;
  }) => request("/admin/contact", { params }),

  updateContactStatus: (id: string, status: string) =>
    request(`/admin/contact/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteContactMessage: (id: string) =>
    request(`/admin/contact/${id}`, { method: "DELETE" }),

  // Demo Requests
  getDemoRequests: (params?: {
    page?: string;
    limit?: string;
    status?: string;
  }) => request("/admin/demo-requests", { params }),

  updateDemoRequestStatus: (id: string, status: string) =>
    request(`/admin/demo-requests/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),

  deleteDemoRequest: (id: string) =>
    request(`/admin/demo-requests/${id}`, { method: "DELETE" }),

  // Stats
  getContactStats: () => request("/admin/contact-stats"),

  // License Plans
  getLicensePlans: () => request("/schools/resolve", { params: { host: "" } }),

  // ── Blog ──────────────────────────────────

  getBlogPosts: (params?: {
    page?: string;
    limit?: string;
    status?: string;
    category?: string;
    search?: string;
  }) => request("/blog/admin/all", { params }),

  getBlogPost: (id: string) => request(`/blog/admin/${id}`),

  createBlogPost: (data: {
    title: string;
    content: string;
    excerpt?: string;
    category?: string;
    tags?: string[];
    status?: string;
    featuredImage?: string;
    author: string;
  }) => request("/blog/admin", { method: "POST", body: JSON.stringify(data) }),

  updateBlogPost: (id: string, data: any) =>
    request(`/blog/admin/${id}`, { method: "PATCH", body: JSON.stringify(data) }),

  deleteBlogPost: (id: string) =>
    request(`/blog/admin/${id}`, { method: "DELETE" }),

  uploadBlogImage: async (file: File): Promise<{ url: string; filename: string }> => {
    const formData = new FormData();
    formData.append("file", file);
    const response = await fetch(`${API_URL}/blog/admin/upload-image`, {
      method: "POST",
      credentials: "include",
      body: formData,
    });
    if (!response.ok) {
      const data = await response.json().catch(() => null);
      throw new ApiError(
        data?.message || `Upload failed: ${response.status}`,
        response.status,
        data
      );
    }
    return response.json();
  },

  // ── Users ─────────────────────────────────

  getUsers: (params?: { role?: string; search?: string }) =>
    request("/users", { params }),

  createUser: (data: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    role: string;
    schoolId?: string;
  }) => {
    // Remove empty schoolId so backend can use actor's school
    const body = { ...data };
    if (!body.schoolId) delete body.schoolId;
    return request("/auth/register", { method: "POST", body: JSON.stringify(body) });
  },

  updateUser: (id: string, data: any) =>
    request(`/users/${id}`, { method: "PUT", body: JSON.stringify(data) }),

  deleteUser: (id: string) =>
    request(`/users/${id}`, { method: "DELETE" }),

  changeUserPassword: (id: string, newPassword: string) =>
    request(`/users/${id}/change-password`, {
      method: "POST",
      body: JSON.stringify({ newPassword }),
    }),

  // ── Backups ─────────────────────────────────

  getAllBackups: (params?: { type?: string }) =>
    request("/schools/admin/backups", { params }),

  getSchoolBackups: (schoolId: string, params?: { type?: string }) =>
    request(`/schools/${schoolId}/backups`, { params }),

  createSchoolBackup: (schoolId: string, note?: string) =>
    request(`/schools/${schoolId}/backup`, { method: "POST", body: JSON.stringify({ note }) }),

  downloadBackup: (schoolId: string, backupId: string) =>
    request(`/schools/${schoolId}/backups/${backupId}/download`),

  restoreBackup: (schoolId: string, backupId: string) =>
    request(`/schools/${schoolId}/restore`, { method: "POST", body: JSON.stringify({ backupId }) }),

  deleteBackup: (schoolId: string, backupId: string) =>
    request(`/schools/${schoolId}/backups/${backupId}`, { method: "DELETE" }),
};

export { ApiError };
