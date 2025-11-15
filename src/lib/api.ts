// API Client for WallsPie Backend

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
  errors?: string[];
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

class ApiClient {
  private baseURL: string;
  private token: string | null = null;
  private onUnauthorized: (() => void) | null = null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  setToken(token: string | null) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('accessToken', token);
      } else {
        localStorage.removeItem('accessToken');
      }
    }
  }

  getToken(): string | null {
    return this.token;
  }

  setOnUnauthorized(callback: () => void) {
    this.onUnauthorized = callback;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // Handle token expiration (401 Unauthorized)
      if (response.status === 401 && this.onUnauthorized) {
        this.onUnauthorized();
      }
      throw new Error(data.error || 'An error occurred');
    }

    return data;
  }

  // Authentication
  async register(data: { email: string; password: string; name: string }) {
    return this.request<{ user: any; accessToken: string; refreshToken: string }>(
      '/auth/register',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async login(data: { email: string; password: string }) {
    return this.request<{ user: any; accessToken: string; refreshToken: string }>(
      '/auth/login',
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  async createGuest() {
    return this.request<{ user: any; accessToken: string; refreshToken: string }>(
      '/auth/guest',
      { method: 'POST' }
    );
  }

  async getProfile() {
    return this.request<any>('/auth/profile');
  }

  async logout() {
    return this.request('/auth/logout', { method: 'POST' });
  }

  // Categories
  async getCategories(stats: boolean = false) {
    return this.request<any[]>(`/categories${stats ? '?stats=true' : ''}`);
  }

  async getCategoryBySlug(slug: string) {
    return this.request<any>(`/categories/${slug}`);
  }

  async createCategory(data: any) {
    return this.request<any>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: number, data: any) {
    return this.request<any>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: number) {
    return this.request(`/categories/${id}`, { method: 'DELETE' });
  }

  // Wallpapers
  async getWallpapers(params: {
    page?: number;
    limit?: number;
    category?: number;
    featured?: boolean;
    search?: string;
  } = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.category) queryParams.append('category', params.category.toString());
    if (params.featured) queryParams.append('featured', 'true');
    if (params.search) queryParams.append('search', params.search);

    return this.request<any[]>(`/wallpapers?${queryParams.toString()}`);
  }

  async getWallpaperBySlug(slug: string) {
    return this.request<any>(`/wallpapers/${slug}`);
  }

  async getFeaturedWallpapers(limit: number = 10) {
    return this.request<any[]>(`/wallpapers/featured?limit=${limit}`);
  }

  async getTrendingWallpapers(limit: number = 10) {
    return this.request<any[]>(`/wallpapers/trending?limit=${limit}`);
  }

  async searchWallpapers(query: string, page: number = 1, limit: number = 20) {
    return this.request<any[]>(
      `/wallpapers/search?q=${encodeURIComponent(query)}&page=${page}&limit=${limit}`
    );
  }

  async uploadWallpaper(formData: FormData) {
    const headers: Record<string, string> = {};
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }

    const response = await fetch(`${this.baseURL}/wallpapers`, {
      method: 'POST',
      headers,
      body: formData,
    });

    return response.json();
  }

  async updateWallpaper(id: number, data: any) {
    return this.request<any>(`/wallpapers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWallpaper(id: number) {
    return this.request(`/wallpapers/${id}`, { method: 'DELETE' });
  }

  // Downloads
  async trackDownload(wallpaperId: number, resolutionId: number) {
    return this.request<{ downloadId: number; downloadUrl: string }>('/downloads', {
      method: 'POST',
      body: JSON.stringify({ wallpaperId, resolutionId }),
    });
  }

  async getDownloadHistory(page: number = 1, limit: number = 20) {
    return this.request<any[]>(`/downloads/history?page=${page}&limit=${limit}`);
  }

  // Favorites
  async addFavorite(wallpaperId: number) {
    return this.request<{ favoriteId: number }>('/favorites', {
      method: 'POST',
      body: JSON.stringify({ wallpaperId }),
    });
  }

  async removeFavorite(wallpaperId: number) {
    return this.request(`/favorites/${wallpaperId}`, { method: 'DELETE' });
  }

  async getFavorites(page: number = 1, limit: number = 20) {
    return this.request<any[]>(`/favorites?page=${page}&limit=${limit}`);
  }

  async checkFavorite(wallpaperId: number) {
    return this.request<{ isFavorited: boolean }>(`/favorites/check/${wallpaperId}`);
  }

  // Wallpaper Categories/Resolutions
  async getWallpapersByCategory(categoryId: number, params: { page?: number; limit?: number } = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    return this.request<any[]>(`/categories/${categoryId}/wallpapers?${queryParams.toString()}`);
  }

  async getWallpaperResolutions(wallpaperId: number) {
    return this.request<any>(`/wallpapers/${wallpaperId}/resolutions`);
  }

  // Analytics (Admin)
  async getOverallStats() {
    return this.request<any>('/admin/analytics/overall');
  }

  async getDownloadTrend(period: 'daily' | 'weekly' | 'monthly' = 'daily', days: number = 30) {
    return this.request<any[]>(`/admin/analytics/trends?period=${period}&days=${days}`);
  }

  async getPopularWallpapers(limit: number = 10) {
    return this.request<any[]>(`/admin/analytics/popular?limit=${limit}`);
  }

  async getRecentDownloads(params: { limit?: number } = {}) {
    return this.request<any[]>(`/admin/analytics/downloads/recent?limit=${params.limit || 10}`);
  }

  async getCategoryStats() {
    return this.request<any[]>('/admin/analytics/categories');
  }

  async getDeviceStats() {
    return this.request<any[]>('/admin/analytics/devices');
  }

  async getResolutionStats(wallpaperId?: number) {
    const query = wallpaperId ? `?wallpaper=${wallpaperId}` : '';
    return this.request<any[]>(`/admin/analytics/resolutions${query}`);
  }

  // Users (Admin)
  async getUsers(params: { page?: number; limit?: number; userType?: number } = {}) {
    const queryParams = new URLSearchParams();
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.userType) queryParams.append('userType', params.userType.toString());

    return this.request<any[]>(`/admin/users?${queryParams.toString()}`);
  }

  async getUserById(id: number) {
    return this.request<any>(`/admin/users/${id}`);
  }

  async createUser(data: { name: string; email: string; password?: string; user_type?: number }) {
    return this.request<any>('/admin/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: number, data: { name?: string; email?: string; password?: string; user_type?: number; is_active?: number }) {
    return this.request<any>(`/admin/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: number) {
    return this.request(`/admin/users/${id}`, { method: 'DELETE' });
  }

  async getUserStats() {
    return this.request<any>('/admin/users/stats');
  }
}

export const api = new ApiClient(API_BASE_URL);
export type { ApiResponse };
