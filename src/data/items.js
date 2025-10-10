/**
 * Menu Items Data Layer
 * Handles all menu item-related API calls
 */

import { apiFetch, APIResponse } from './api';

/**
 * Get all items for a section
 */
export async function getItems(sectionId) {
  try {
    const response = await apiFetch(`/menu-items/?section=${sectionId}`, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Error fetching items:', error);
    return APIResponse.error({ message: 'Failed to load items' });
  }
}

/**
 * Get a specific item by ID
 */
export async function getItemById(itemId) {
  try {
    const response = await apiFetch(`/menu-items/${itemId}/`, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Error fetching item:', error);
    return APIResponse.error({ message: 'Failed to load item' });
  }
}

/**
 * Create a new menu item
 */
export async function createItem(itemData) {
  try {
    const response = await apiFetch('/menu-items/', {
      method: 'POST',
      body: JSON.stringify(itemData),
    });
    return response;
  } catch (error) {
    console.error('Error creating item:', error);
    return APIResponse.error({ message: 'Failed to create item' });
  }
}

/**
 * Update an existing menu item
 */
export async function updateItem(itemId, itemData) {
  try {
    console.log('updateItem called with:', itemId, itemData);
    const response = await apiFetch(`/menu-items/${itemId}/`, {
      method: 'PATCH',
      body: JSON.stringify(itemData),
      requiresInstance: true,
    });
    console.log('updateItem response:', response);
    return response;
  } catch (error) {
    console.error('Error updating item:', error);
    return APIResponse.error({ message: 'Failed to update item' });
  }
}

/**
 * Delete a menu item
 */
export async function deleteItem(itemId) {
  try {
    const response = await apiFetch(`/menu-items/${itemId}/`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error deleting item:', error);
    return APIResponse.error({ message: 'Failed to delete item' });
  }
}

/**
 * Upload image for menu item
 */
export async function uploadItemImage(itemId, imageFile) {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const response = await apiFetch(`/menu-items/${itemId}/upload-image/`, {
      method: 'POST',
      body: formData,
      headers: {}, // Let browser set Content-Type with boundary
    });
    return response;
  } catch (error) {
    console.error('Error uploading image:', error);
    return APIResponse.error({ message: 'Failed to upload image' });
  }
}

/**
 * Duplicate a menu item
 */
export async function duplicateItem(itemId) {
  try {
    const response = await apiFetch(`/menu-items/${itemId}/duplicate/`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Error duplicating item:', error);
    return APIResponse.error({ message: 'Failed to duplicate item' });
  }
}

/**
 * Toggle item availability
 */
export async function toggleItemAvailability(itemId, isAvailable) {
  try {
    const response = await apiFetch(`/menu-items/${itemId}/toggle-availability/`, {
      method: 'POST',
      body: JSON.stringify({ is_available: isAvailable }),
    });
    return response;
  } catch (error) {
    console.error('Error toggling item availability:', error);
    return APIResponse.error({ message: 'Failed to update item availability' });
  }
}
