// API Client Service for College Lab Equipment System

const API_BASE = '/api';

export async function apiRequest(endpoint, method = 'GET', data = null) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json'
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers
  };

  if (data && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
    config.body = JSON.stringify(data);
  }

  let response;
  try {
    response = await fetch(`${API_BASE}${endpoint}`, config);
  } catch (netErr) {
    throw new Error(
      'Cannot connect to backend API server. Please verify the Express server is running on port 5000 (run: npm start).'
    );
  }

  const text = await response.text();
  let result = {};

  try {
    result = text ? JSON.parse(text) : {};
  } catch (parseErr) {
    if (!response.ok) {
      throw new Error(
        `Backend server error (${response.status}). Please ensure Express server is running on port 5000.`
      );
    }
    throw new Error('Unexpected non-JSON response from server.');
  }

  if (!response.ok) {
    throw new Error(result.error || result.message || `Request failed with status ${response.status}`);
  }

  return result;
}

export const api = {
  // Auth
  login: (credentials) => apiRequest('/auth/login', 'POST', credentials),
  getProfile: () => apiRequest('/auth/me'),

  // Dashboards
  getAdminDashboard: () => apiRequest('/dashboard/admin'),
  getUserDashboard: () => apiRequest('/dashboard/user'),

  // Equipment
  getEquipment: (params = '') => apiRequest(`/equipment${params}`),
  getCategories: () => apiRequest('/equipment/categories'),
  getEquipmentById: (id) => apiRequest(`/equipment/${id}`),
  addEquipment: (data) => apiRequest('/equipment', 'POST', data),
  updateEquipment: (id, data) => apiRequest(`/equipment/${id}`, 'PUT', data),
  deleteEquipment: (id) => apiRequest(`/equipment/${id}`, 'DELETE'),
  updateStatus: (id, status) => apiRequest(`/equipment/${id}/status`, 'PATCH', { status }),

  // Users
  getUsers: (params = '') => apiRequest(`/users${params}`),
  addUser: (data) => apiRequest('/users', 'POST', data),
  deleteUser: (id) => apiRequest(`/users/${id}`, 'DELETE'),

  // Requisitions
  submitRequest: (data) => apiRequest('/requests', 'POST', data),
  getRequests: (params = '') => apiRequest(`/requests${params}`),
  getMyRequests: () => apiRequest('/requests/my'),
  approveRequest: (id) => apiRequest(`/requests/${id}/approve`, 'PATCH'),
  rejectRequest: (id) => apiRequest(`/requests/${id}/reject`, 'PATCH'),

  // Issue & Return Desk
  getIssueReturnDesk: () => apiRequest('/issuereturn'),
  issueEquipment: (id, return_date) => apiRequest(`/issuereturn/issue/${id}`, 'POST', { return_date }),
  directIssue: (data) => apiRequest('/issuereturn/direct', 'POST', data),
  returnEquipment: (id, condition) => apiRequest(`/issuereturn/return/${id}`, 'POST', { condition })
};
