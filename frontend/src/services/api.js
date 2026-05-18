import axios from 'axios';

const API_BASE_URL = 'https://meetmind-backend-3wdx.onrender.com';

const api = axios.create({
  baseURL: API_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

export const login = (email, password) => {
  const params = new URLSearchParams();
  params.append('username', email);
  params.append('password', password);
  return api.post('/auth/login', params, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
  });
};

export const register = (name, email, password) =>
  api.post('/auth/register?name=' + name + '&email=' + email + '&password=' + password);

export const getMe = () => api.get('/auth/me');

export const getMeetings = () => api.get('/meetings/');
export const createMeeting = (title) => api.post('/meetings/?title=' + title);
export const startMeeting = (id) => api.post('/meetings/' + id + '/start');
export const endMeeting = (id) => api.post('/meetings/' + id + '/end');
export const sendSummary = (id, emails) => api.post('/meetings/' + id + '/send-summary?emails=' + emails);

export const uploadAudio = (meetingId, file) => {
  const formData = new FormData();
  formData.append('file', file);
  return api.post('/transcripts/' + meetingId + '/upload', formData);
};
export const analyzeTranscript = (meetingId) => api.post('/insights/' + meetingId + '/extract');
export const getTranscript = (meetingId) => api.get('/transcripts/' + meetingId);
export const getInsights = (meetingId) => api.get('/insights/' + meetingId);

export const getAllActionItems = () => api.get('/action-items/');
export const getMeetingActionItems = (meetingId) => api.get('/action-items/' + meetingId);
export const completeActionItem = (id) => api.patch('/action-items/' + id + '/complete');
export const setDueDate = (id, date) => api.patch('/action-items/' + id + '/due-date?due_date=' + date);
export const deleteActionItem = (id) => api.delete('/action-items/' + id);
export const deleteMeeting = (id) => api.delete('/meetings/' + id);
export const sendReminder = (meetingId, email, task) => api.post(`/meetings/${meetingId}/remind?email=${email}&task=${encodeURIComponent(task)}`);

export default api;
