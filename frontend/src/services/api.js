// src/services/api.js
import axios from 'axios';

const API_BASE = 'http://localhost:4000/api';

const API = axios.create({
  baseURL: API_BASE,
  timeout: 5000,
});

// ✅ Existing
export async function fetchPending() {
  return API.get('/help-requests', { params: { status: 'pending' } });
}

// ✅ New: fetch unresolved requests
export async function fetchUnresolved() {
  return API.get('/help-requests', { params: { status: 'unresolved' } });
}

// Other existing API calls
export const fetchHelpRequests = () => API.get('/help-requests');
export const fetchAllHelpRequests = () => API.get('/help-requests');
export const respondToRequest = (requestId, answer) =>
  API.post('/supervisor/respond', { requestId, answer });
export const fetchKnowledge = () => API.get('/knowledge');

export const createHelpRequest = (data) =>
  API.post('/help-requests', data);

// New: simulate AI receiving a call (AI agent endpoint)
export const aiCall = (question, customerId = 'ui-simulated') =>
  API.post('/ai/call', { question, customerId });
