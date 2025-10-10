/**
 * Menu Sections Data Layer
 * Handles all section-related API calls
 */

import { apiFetch, APIResponse } from './api';

/**
 * Get all sections for a menu
 */
export async function getSections(menuId) {
  try {
    const response = await apiFetch(`/menu-sections/?menu=${menuId}`, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Error fetching sections:', error);
    return APIResponse.error({ message: 'Failed to load sections' });
  }
}

/**
 * Get a specific section by ID
 */
export async function getSectionById(sectionId) {
  try {
    const response = await apiFetch(`/menu-sections/${sectionId}/`, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Error fetching section:', error);
    return APIResponse.error({ message: 'Failed to load section' });
  }
}

/**
 * Create a new section
 */
export async function createSection(sectionData) {
  try {
    const response = await apiFetch('/menu-sections/', {
      method: 'POST',
      body: JSON.stringify(sectionData),
    });
    return response;
  } catch (error) {
    console.error('Error creating section:', error);
    return APIResponse.error({ message: 'Failed to create section' });
  }
}

/**
 * Update an existing section
 */
export async function updateSection(sectionId, sectionData) {
  try {
    const response = await apiFetch(`/menu-sections/${sectionId}/`, {
      method: 'PATCH',
      body: JSON.stringify(sectionData),
    });
    return response;
  } catch (error) {
    console.error('Error updating section:', error);
    return APIResponse.error({ message: 'Failed to update section' });
  }
}

/**
 * Delete a section
 */
export async function deleteSection(sectionId) {
  try {
    const response = await apiFetch(`/menu-sections/${sectionId}/`, {
      method: 'DELETE',
    });
    return response;
  } catch (error) {
    console.error('Error deleting section:', error);
    return APIResponse.error({ message: 'Failed to delete section' });
  }
}

/**
 * Reorder items within a section
 */
export async function reorderItems(sectionId, itemOrders) {
  try {
    const response = await apiFetch(`/menu-sections/${sectionId}/reorder-items/`, {
      method: 'POST',
      body: JSON.stringify({ items: itemOrders }),
    });
    return response;
  } catch (error) {
    console.error('Error reordering items:', error);
    return APIResponse.error({ message: 'Failed to reorder items' });
  }
}

/**
 * Duplicate a section
 */
export async function duplicateSection(sectionId) {
  try {
    const response = await apiFetch(`/menu-sections/${sectionId}/duplicate/`, {
      method: 'POST',
    });
    return response;
  } catch (error) {
    console.error('Error duplicating section:', error);
    return APIResponse.error({ message: 'Failed to duplicate section' });
  }
}
