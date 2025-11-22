/**
 * Centralized API service for VEOmenu frontend
 * Handles all communication with the Django backend
 */

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://127.0.0.1:8000/api';

/**
 * API Response wrapper class
 */
class APIResponse {
  constructor(success, data, error = null) {
    this.success = success;
    this.data = data;
    this.error = error;
  }

  static success(data) {
    return new APIResponse(true, data);
  }

  static error(error) {
    return new APIResponse(false, null, error);
  }
}

/**
 * Get authentication token from localStorage
 */
const getAuthToken = () => {
  return localStorage.getItem('access_token');
};

/**
 * Get instance ID from localStorage
 */
const getInstanceId = () => {
  return localStorage.getItem('instance_id');
};

/**
 * Base fetch wrapper with error handling
 */
const apiFetch = async (endpoint, options = {}) => {
  const token = getAuthToken();
  const instanceId = getInstanceId();

  // Check if body is FormData (for file uploads)
  const isFormData = options.body instanceof FormData;

  const headers = {
    // Only set Content-Type for non-FormData requests
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...options.headers,
  };

  // Add authentication token if available
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Add instance ID header if available (for multi-tenant requests)
  if (instanceId && options.requiresInstance) {
    headers['X-Instance-ID'] = instanceId;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    // Handle 401 Unauthorized - token expired
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
      return APIResponse.error({ message: 'Session expired. Please log in again.' });
    }

    // Handle 204 No Content (successful delete, no body)
    if (response.status === 204) {
      return APIResponse.success(null);
    }

    const data = await response.json();

    if (!response.ok) {
      return APIResponse.error({
        status: response.status,
        message: data.detail || data.error || 'An error occurred',
        data: data,
      });
    }

    return APIResponse.success(data);
  } catch (error) {
    console.error('API Error:', error);
    return APIResponse.error({
      message: error.message || 'Network error occurred',
      originalError: error,
    });
  }
};

/**
 * Authentication API
 */
export const authAPI = {
  /**
   * Register a new user
   */
  async register(userData) {
    return await apiFetch('/auth/register/', {
      method: 'POST',
      body: JSON.stringify(userData),
    });
  },

  /**
   * Login with email and password
   */
  async login(email, password) {
    const response = await apiFetch('/auth/login/', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    // Store tokens if successful
    if (response.success) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  },

  /**
   * Request a magic link for login
   */
  async requestMagicLink(email) {
    return await apiFetch('/auth/request-magic-link/', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Verify magic link token and get JWT tokens
   */
  async verifyMagicLink(token) {
    const response = await apiFetch('/auth/verify-magic-link/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });

    // Store tokens if successful
    if (response.success) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('refresh_token', response.data.refresh);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }

    return response;
  },

  /**
   * Logout current user
   */
  async logout() {
    console.log('Logging out - calling backend...');
    
    try {
      const response = await apiFetch('/auth/logout/', {
        method: 'POST',
      });
      
      console.log('Logout response from backend:', response);
    } catch (error) {
      console.error('Logout backend error:', error);
    }

    // Clear local storage regardless of backend response
    console.log('Clearing localStorage...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    localStorage.removeItem('instance_id');
    
    console.log('Logout complete');
    return { success: true };
  },

  /**
   * Get current user profile
   */
  async getCurrentUser() {
    return await apiFetch('/users/me/');
  },

  /**
   * Update user profile
   */
  async updateProfile(profileData) {
    return await apiFetch('/users/update-profile/', {
      method: 'PATCH',
      body: JSON.stringify(profileData),
    });
  },

  /**
   * Get active sessions
   */
  async getSessions() {
    return await apiFetch('/users/sessions/');
  },

  /**
   * Revoke a specific session
   */
  async revokeSession(sessionId) {
    return await apiFetch('/users/revoke-session/', {
      method: 'POST',
      body: JSON.stringify({ session_id: sessionId }),
    });
  },
};

/**
 * Instances API
 */
export const instancesAPI = {
  /**
   * Get all instances for current user
   */
  async getInstances() {
    return await apiFetch('/instances/');
  },

  /**
   * Get instance details
   */
  async getInstance(id) {
    return await apiFetch(`/instances/${id}/`);
  },

  /**
   * Create a new instance
   */
  async createInstance(instanceData) {
    const response = await apiFetch('/instances/', {
      method: 'POST',
      body: JSON.stringify(instanceData),
    });

    // Store instance ID if successful
    if (response.success && response.data.instance) {
      localStorage.setItem('instance_id', response.data.instance.id);
    }

    return response;
  },

  /**
   * Create a new instance with logo (FormData)
   */
  async createInstanceWithLogo(instanceData, logoFile) {
    const formData = new FormData();
    
    // Add all instance data fields to FormData
    Object.keys(instanceData).forEach(key => {
      if (instanceData[key] !== null && instanceData[key] !== undefined) {
        formData.append(key, instanceData[key]);
      }
    });
    
    // Add logo file
    if (logoFile) {
      formData.append('logo', logoFile, 'logo.jpg');
    }

    const response = await apiFetch('/instances/', {
      method: 'POST',
      body: formData,
    });

    // Store instance ID if successful
    if (response.success && response.data?.instance) {
      localStorage.setItem('instance_id', response.data.instance.id);
    } else if (response.success && response.data?.id) {
      localStorage.setItem('instance_id', response.data.id);
    }

    return response;
  },

  /**
   * Update instance
   */
  async updateInstance(id, instanceData) {
    // Check if instanceData is FormData (for file uploads like logo)
    const isFormData = instanceData instanceof FormData;
    
    return await apiFetch(`/instances/${id}/`, {
      method: 'PATCH',
      body: isFormData ? instanceData : JSON.stringify(instanceData),
      requiresInstance: true,
    });
  },

  /**
   * Get instance members
   */
  async getMembers(instanceId) {
    return await apiFetch(`/instances/${instanceId}/members/`);
  },

  /**
   * Invite member to instance
   */
  async inviteMember(instanceId, memberData) {
    return await apiFetch(`/instances/${instanceId}/invite-member/`, {
      method: 'POST',
      body: JSON.stringify(memberData),
    });
  },

  /**
   * Remove member from instance
   */
  async removeMember(instanceId, userId) {
    return await apiFetch(`/instances/${instanceId}/remove-member/`, {
      method: 'DELETE',
      body: JSON.stringify({ user_id: userId }),
    });
  },

  /**
   * Get business hours
   */
  async getBusinessHours(instanceId) {
    return await apiFetch(`/instances/${instanceId}/business-hours/`);
  },

  /**
   * Update business hours
   */
  async updateBusinessHours(instanceId, hoursData) {
    return await apiFetch(`/instances/${instanceId}/business-hours/`, {
      method: 'PUT',
      body: JSON.stringify(hoursData),
    });
  },

  /**
   * Get demo instance (public endpoint, no auth required)
   */
  async getDemoInstance() {
    return await apiFetch('/instances/demo/', {
      method: 'GET',
      requiresInstance: false,
    });
  },
};

/**
 * Menus API
 */
export const menusAPI = {
  /**
   * Create a new menu
   */
  async createMenu(menuData) {
    return await apiFetch('/menus/', {
      method: 'POST',
      body: JSON.stringify(menuData),
      requiresInstance: true,
    });
  },
  /**
   * Get all menus
   */
  async getMenus() {
    return await apiFetch('/menus/', {
      requiresInstance: true,
    });
  },

  /**
   * Get menu details
   */
  async getMenu(id) {
    return await apiFetch(`/menus/${id}/`, {
      requiresInstance: true,
    });
  },

  /**
   * Get public menu (no auth required)
   */
  async getPublicMenu(id, language = 'en') {
    return await apiFetch(`/menus/${id}/public/?language=${language}`);
  },

  /**
   * Create a new menu
   */
  async createMenu(menuData) {
    return await apiFetch('/menus/', {
      method: 'POST',
      body: JSON.stringify(menuData),
      requiresInstance: true,
    });
  },

  /**
   * Update menu
   */
  async updateMenu(id, menuData) {
    return await apiFetch(`/menus/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(menuData),
      requiresInstance: true,
    });
  },

  /**
   * Delete menu
   */
  async deleteMenu(id) {
    return await apiFetch(`/menus/${id}/`, {
      method: 'DELETE',
      requiresInstance: true,
    });
  },

  /**
   * Get menu analytics
   */
  async getMenuAnalytics(id, days = 7) {
    return await apiFetch(`/menus/${id}/analytics/?days=${days}`, {
      requiresInstance: true,
    });
  },

  /**
   * Get detailed analytics for a specific menu or all menus
   * @param {string} menuId - Menu ID or 'all' for all menus
   * @param {number} days - Number of days to fetch (or 'all' for all time)
   * @param {string} type - 'views' or 'scans'
   */
  async getDetailedAnalytics(menuId = 'all', days = 30, type = 'views') {
    try {
      let menus = [];
      
      if (menuId === 'all') {
        const menusResponse = await this.getMenus();
        if (menusResponse.success && menusResponse.data) {
          menus = Array.isArray(menusResponse.data) 
            ? menusResponse.data 
            : menusResponse.data.results || [];
        }
      } else {
        const menuResponse = await this.getMenu(menuId);
        if (menuResponse.success && menuResponse.data) {
          menus = [menuResponse.data];
        }
      }

      if (menus.length === 0) {
        return APIResponse.success({
          total_views: 0,
          views_by_day: {},
          hasData: false,
        });
      }

      // Fetch analytics for all menus
      const daysParam = days === 'all' || days > 365 ? 365 : days;
      const analyticsPromises = menus.map(menu => this.getMenuAnalytics(menu.id, daysParam));
      const analyticsResults = await Promise.allSettled(analyticsPromises);

      // Aggregate views by day
      const viewsByDay = {};
      let totalViews = 0;

      analyticsResults.forEach((result) => {
        if (result.status === 'fulfilled' && result.value.success && result.value.data) {
          const analytics = result.value.data;
          totalViews += analytics.total_views || 0;

          if (analytics.views_by_day) {
            Object.entries(analytics.views_by_day).forEach(([date, count]) => {
              viewsByDay[date] = (viewsByDay[date] || 0) + count;
            });
          }
        }
      });

      return APIResponse.success({
        total_views: totalViews,
        views_by_day: viewsByDay,
        hasData: totalViews > 0,
      });
    } catch (error) {
      console.error('Error fetching detailed analytics:', error);
      return APIResponse.error({ message: 'Failed to fetch detailed analytics' });
    }
  },

  /**
   * Get dashboard statistics - aggregates analytics from all menus
   */
  async getDashboardStats(days = 7) {
    try {
      // Get all menus first
      const menusResponse = await this.getMenus();
      if (!menusResponse.success || !menusResponse.data || menusResponse.data.length === 0) {
        return APIResponse.success({
          totalViews: 0,
          totalMenus: 0,
          languages: [],
          weeklyScans: [],
          popularLanguages: [],
          hasData: false,
        });
      }

      const menus = Array.isArray(menusResponse.data) ? menusResponse.data : menusResponse.data.results || [];
      
      // Fetch analytics for all menus in parallel
      const analyticsPromises = menus.map(menu => this.getMenuAnalytics(menu.id, days));
      const analyticsResults = await Promise.allSettled(analyticsPromises);

      // Aggregate data
      let totalViews = 0;
      const languageBreakdown = {};
      const viewsByDay = {};

      analyticsResults.forEach((result, index) => {
        if (result.status === 'fulfilled' && result.value.success && result.value.data) {
          const analytics = result.value.data;
          totalViews += analytics.total_views || 0;

          // Aggregate language breakdown
          if (analytics.language_breakdown) {
            Object.entries(analytics.language_breakdown).forEach(([lang, count]) => {
              languageBreakdown[lang] = (languageBreakdown[lang] || 0) + count;
            });
          }

          // Aggregate views by day
          if (analytics.views_by_day) {
            Object.entries(analytics.views_by_day).forEach(([day, count]) => {
              viewsByDay[day] = (viewsByDay[day] || 0) + count;
            });
          }
        }
      });

      // Calculate popular languages
      const popularLanguages = Object.entries(languageBreakdown)
        .map(([code, count]) => ({
          code: code.toUpperCase(),
          count,
          percentage: totalViews > 0 ? Math.round((count / totalViews) * 100) : 0,
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      // Format weekly scans from views by day
      const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
      const weeklyScans = dayNames.map(day => ({
        day,
        scans: viewsByDay[day] || 0,
      }));

      // Get unique languages from menus
      const allLanguages = new Set();
      menus.forEach(menu => {
        if (menu.available_languages && Array.isArray(menu.available_languages)) {
          menu.available_languages.forEach(lang => allLanguages.add(lang));
        }
      });

      return APIResponse.success({
        totalViews,
        totalMenus: menus.length,
        languages: Array.from(allLanguages),
        weeklyScans,
        popularLanguages,
        hasData: totalViews > 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return APIResponse.error({ message: 'Failed to fetch dashboard statistics' });
    }
  },

  /**
   * Get menu sections
   */
  async getSections() {
    return await apiFetch('/menu-sections/', {
      requiresInstance: true,
    });
  },

  /**
   * Create menu section
   */
  async createSection(sectionData) {
    return await apiFetch('/menu-sections/', {
      method: 'POST',
      body: JSON.stringify(sectionData),
      requiresInstance: true,
    });
  },

  /**
   * Update menu section
   */
  async updateSection(id, sectionData) {
    return await apiFetch(`/menu-sections/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(sectionData),
      requiresInstance: true,
    });
  },

  /**
   * Delete menu section
   */
  async deleteSection(id) {
    return await apiFetch(`/menu-sections/${id}/`, {
      method: 'DELETE',
      requiresInstance: true,
    });
  },

  /**
   * Get menu items
   */
  async getItems() {
    return await apiFetch('/menu-items/', {
      requiresInstance: true,
    });
  },

  /**
   * Create menu item
   */
  async createItem(itemData) {
    return await apiFetch('/menu-items/', {
      method: 'POST',
      body: JSON.stringify(itemData),
      requiresInstance: true,
    });
  },

  /**
   * Update menu item
   */
  async updateItem(id, itemData) {
    return await apiFetch(`/menu-items/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(itemData),
      requiresInstance: true,
    });
  },

  /**
   * Delete menu item
   */
  async deleteItem(id) {
    return await apiFetch(`/menu-items/${id}/`, {
      method: 'DELETE',
      requiresInstance: true,
    });
  },

  /**
   * Toggle item availability
   */
  async toggleItemAvailability(id) {
    return await apiFetch(`/menu-items/${id}/toggle-availability/`, {
      method: 'PATCH',
      requiresInstance: true,
    });
  },
};

/**
 * QR Codes API
 */
export const qrCodesAPI = {
  /**
   * Get all QR codes
   */
  async getQRCodes() {
    return await apiFetch('/qrcodes/', {
      requiresInstance: true,
    });
  },

  /**
   * Get QR code details
   */
  async getQRCode(id) {
    return await apiFetch(`/qrcodes/${id}/`, {
      requiresInstance: true,
    });
  },

  /**
   * Scan QR code (public endpoint)
   */
  async scanQRCode(id) {
    return await apiFetch(`/qrcodes/${id}/scan/`, {
      method: 'POST',
    });
  },
};

// Export all APIs
export default {
  authAPI,
  instancesAPI,
  menusAPI,
  qrCodesAPI,
};

// Export utility functions needed by other data layer files
export { apiFetch, APIResponse };
