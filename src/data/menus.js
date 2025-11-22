/**
 * Menus Data Layer
 * Handles all menu-related API calls
 */

import { apiFetch, APIResponse } from './api';

/**
 * Get all menus for the authenticated user's instance
 */
export async function getMenus(instanceId = null) {
  try {
    const params = instanceId ? `?instance=${instanceId}` : '';
    const response = await apiFetch(`/menus/${params}`, {
      method: 'GET',
      requiresInstance: false, // We can filter by instance or get all
    });
    return response;
  } catch (error) {
    console.error('Error fetching menus:', error);
    return APIResponse.error({ message: 'Failed to load menus' });
  }
}

/**
 * Get a specific menu by ID
 */
export async function getMenuById(menuId) {
  try {
    const response = await apiFetch(`/menus/${menuId}/`, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Error fetching menu:', error);
    return APIResponse.error({ message: 'Failed to load menu' });
  }
}

/**
 * Create a new menu
 */
export async function createMenu(menuData) {
  try {
    const response = await apiFetch('/menus/', {
      method: 'POST',
      body: JSON.stringify(menuData),
      requiresInstance: true,
    });
    return response;
  } catch (error) {
    console.error('Error creating menu:', error);
    return APIResponse.error({ message: 'Failed to create menu' });
  }
}

/**
 * Update an existing menu
 */
export async function updateMenu(menuId, menuData) {
  try {
    const response = await apiFetch(`/menus/${menuId}/`, {
      method: 'PATCH',
      body: JSON.stringify(menuData),
    });
    return response;
  } catch (error) {
    console.error('Error updating menu:', error);
    return APIResponse.error({ message: 'Failed to update menu' });
  }
}

/**
 * Delete a menu
 */
export async function deleteMenu(menuId) {
  try {
    const response = await apiFetch(`/menus/${menuId}/`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error deleting menu:', error);
    return APIResponse.error({ message: 'Failed to delete menu' });
  }
}

/**
 * Duplicate a menu
 */
export async function duplicateMenu(menuId) {
  try {
    const response = await apiFetch(`/menus/${menuId}/duplicate/`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Error duplicating menu:', error);
    return APIResponse.error({ message: 'Failed to duplicate menu' });
  }
}

/**
 * Toggle menu active status
 */
export async function toggleMenuStatus(menuId, isActive) {
  try {
    const response = await apiFetch(`/menus/${menuId}/`, {
      method: 'PATCH',
      body: JSON.stringify({ is_active: isActive }),
    });
    return response;
  } catch (error) {
    console.error('Error toggling menu status:', error);
    return APIResponse.error({ message: 'Failed to update menu status' });
  }
}

/**
 * Get menu with all sections and items (complete menu)
 */
export async function getCompleteMenu(menuId) {
  try {
    const response = await apiFetch(`/menus/${menuId}/complete/`, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Error fetching complete menu:', error);
    return APIResponse.error({ message: 'Failed to load complete menu' });
  }
}

/**
 * Reorder menu sections
 */
export async function reorderSections(menuId, sectionOrders) {
  try {
    const response = await apiFetch(`/menus/${menuId}/reorder-sections/`, {
      method: 'POST',
      body: JSON.stringify({ sections: sectionOrders }),
    });
    return response;
  } catch (error) {
    console.error('Error reordering sections:', error);
    return APIResponse.error({ message: 'Failed to reorder sections' });
  }
}

/**
 * Get demo menu (public endpoint, no auth required)
 */
export async function getDemoMenu() {
  try {
    const response = await apiFetch('/menus/demo/', {
      method: 'GET',
      requiresInstance: false,
    });
    return response;
  } catch (error) {
    console.error('Error fetching demo menu:', error);
    return APIResponse.error({ message: 'Failed to load demo menu' });
  }
}