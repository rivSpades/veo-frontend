/**
 * Support Tickets Data Layer
 * Handles all support ticket-related API calls
 */

import { apiFetch, APIResponse } from './api';

/**
 * Get all support tickets for the authenticated user
 */
export async function getTickets() {
  try {
    const response = await apiFetch('/support-tickets/', {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Error fetching tickets:', error);
    return APIResponse.error({ message: 'Failed to load tickets' });
  }
}

/**
 * Get a specific ticket by ID
 */
export async function getTicketById(ticketId) {
  try {
    const response = await apiFetch(`/support-tickets/${ticketId}/`, {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Error fetching ticket:', error);
    return APIResponse.error({ message: 'Failed to load ticket' });
  }
}

/**
 * Create a new support ticket
 */
export async function createTicket(ticketData) {
  try {
    // Check if ticketData is FormData (for image uploads)
    const isFormData = ticketData instanceof FormData;
    
    const response = await apiFetch('/support-tickets/', {
      method: 'POST',
      body: isFormData ? ticketData : JSON.stringify(ticketData),
      requiresInstance: true,
      headers: isFormData ? {} : undefined, // Let browser set Content-Type for FormData
    });
    return response;
  } catch (error) {
    console.error('Error creating ticket:', error);
    return APIResponse.error({ message: 'Failed to create ticket' });
  }
}

/**
 * Add a message/reply to a ticket
 */
export async function addTicketMessage(ticketId, content) {
  try {
    const response = await apiFetch(`/support-tickets/${ticketId}/add_message/`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
    return response;
  } catch (error) {
    console.error('Error adding message:', error);
    return APIResponse.error({ message: 'Failed to add message' });
  }
}

/**
 * Change ticket status
 */
export async function changeTicketStatus(ticketId, newStatus) {
  try {
    const response = await apiFetch(`/support-tickets/${ticketId}/change_status/`, {
      method: 'POST',
      body: JSON.stringify({ status: newStatus }),
    });
    return response;
  } catch (error) {
    console.error('Error changing status:', error);
    return APIResponse.error({ message: 'Failed to change status' });
  }
}

/**
 * Close a ticket
 */
export async function closeTicket(ticketId) {
  return await changeTicketStatus(ticketId, 'closed');
}

/**
 * Get ticket statistics
 */
export async function getTicketStats() {
  try {
    const response = await apiFetch('/support-tickets/stats/', {
      method: 'GET',
    });
    return response;
  } catch (error) {
    console.error('Error fetching stats:', error);
    return APIResponse.error({ message: 'Failed to load statistics' });
  }
}

