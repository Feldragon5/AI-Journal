// API Client for communicating with the backend

const API_BASE_URL = 'http://localhost:3000/api';

const API = {
  // Entry endpoints
  async getAllEntries() {
    const response = await fetch(`${API_BASE_URL}/entries`);
    if (!response.ok) throw new Error('Failed to fetch entries');
    return response.json();
  },

  async getEntry(id) {
    const response = await fetch(`${API_BASE_URL}/entries/${id}`);
    if (!response.ok) throw new Error('Failed to fetch entry');
    return response.json();
  },

  async getEntryByDate(date) {
    const response = await fetch(`${API_BASE_URL}/entries/date/${date}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error('Failed to fetch entry');
    }
    return response.json();
  },

  async getEntriesByDateRange(startDate, endDate) {
    const response = await fetch(`${API_BASE_URL}/entries/range/${startDate}/${endDate}`);
    if (!response.ok) throw new Error('Failed to fetch entries');
    return response.json();
  },

  async createEntry(entry) {
    const response = await fetch(`${API_BASE_URL}/entries`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
    if (!response.ok) throw new Error('Failed to create entry');
    return response.json();
  },

  async updateEntry(id, updates) {
    const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
    if (!response.ok) throw new Error('Failed to update entry');
    return response.json();
  },

  async deleteEntry(id) {
    const response = await fetch(`${API_BASE_URL}/entries/${id}`, {
      method: 'DELETE'
    });
    if (!response.ok) throw new Error('Failed to delete entry');
    return response.json();
  },

  async searchEntries(query) {
    const response = await fetch(`${API_BASE_URL}/entries/search/${encodeURIComponent(query)}`);
    if (!response.ok) throw new Error('Failed to search entries');
    return response.json();
  },

  // AI endpoints
  async generateQuestions(excerpt) {
    const response = await fetch(`${API_BASE_URL}/ai/questions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ excerpt })
    });
    if (!response.ok) throw new Error('Failed to generate questions');
    return response.json();
  },

  async enhanceEntry(content) {
    const response = await fetch(`${API_BASE_URL}/ai/enhance`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    if (!response.ok) throw new Error('Failed to enhance entry');
    return response.json();
  },

  // Settings endpoints
  async getSettings() {
    const response = await fetch(`${API_BASE_URL}/ai/settings`);
    if (!response.ok) throw new Error('Failed to fetch settings');
    return response.json();
  },

  async updateSettings(settings) {
    const response = await fetch(`${API_BASE_URL}/ai/settings`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(settings)
    });
    if (!response.ok) throw new Error('Failed to update settings');
    return response.json();
  }
};
