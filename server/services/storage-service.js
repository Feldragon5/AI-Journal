const fs = require('fs').promises;
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const ENTRIES_FILE = path.join(DATA_DIR, 'entries.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

class StorageService {
  constructor() {
    this.initStorage();
  }

  async initStorage() {
    try {
      await fs.mkdir(DATA_DIR, { recursive: true });

      // Initialize entries file if it doesn't exist
      try {
        await fs.access(ENTRIES_FILE);
      } catch {
        await fs.writeFile(ENTRIES_FILE, JSON.stringify([], null, 2));
      }

      // Initialize settings file if it doesn't exist
      try {
        await fs.access(SETTINGS_FILE);
      } catch {
        const defaultSettings = {
          customInstructions: '',
          writingStyle: 'natural',
          questionFrequency: 'always',
          autoEnhance: false,
          theme: 'nebula-purple',
          darkMode: true
        };
        await fs.writeFile(SETTINGS_FILE, JSON.stringify(defaultSettings, null, 2));
      }
    } catch (error) {
      console.error('Error initializing storage:', error);
    }
  }

  async getAllEntries() {
    try {
      const data = await fs.readFile(ENTRIES_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading entries:', error);
      return [];
    }
  }

  async getEntryById(id) {
    const entries = await this.getAllEntries();
    return entries.find(entry => entry.id === id);
  }

  async getEntriesByDateRange(startDate, endDate) {
    const entries = await this.getAllEntries();
    return entries.filter(entry => {
      const entryDate = new Date(entry.date);
      return entryDate >= new Date(startDate) && entryDate <= new Date(endDate);
    });
  }

  async getEntryByDate(date) {
    const entries = await this.getAllEntries();
    return entries.find(entry => entry.date === date);
  }

  async createEntry(entry) {
    const entries = await this.getAllEntries();
    const newEntry = {
      id: this.generateId(),
      title: entry.title || '',
      content: entry.content,
      rawContent: entry.rawContent || entry.content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      date: entry.date || new Date().toISOString().split('T')[0],
      displayTitle: entry.title || this.formatDate(new Date())
    };
    entries.push(newEntry);
    await this.saveEntries(entries);
    return newEntry;
  }

  async updateEntry(id, updates) {
    const entries = await this.getAllEntries();
    const index = entries.findIndex(entry => entry.id === id);

    if (index === -1) {
      throw new Error('Entry not found');
    }

    entries[index] = {
      ...entries[index],
      ...updates,
      updatedAt: new Date().toISOString(),
      displayTitle: updates.title || entries[index].title || this.formatDate(new Date(entries[index].createdAt))
    };

    await this.saveEntries(entries);
    return entries[index];
  }

  async deleteEntry(id) {
    const entries = await this.getAllEntries();
    const filteredEntries = entries.filter(entry => entry.id !== id);

    if (entries.length === filteredEntries.length) {
      throw new Error('Entry not found');
    }

    await this.saveEntries(filteredEntries);
    return { success: true };
  }

  async saveEntries(entries) {
    // Sort entries by date (most recent first)
    entries.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    await fs.writeFile(ENTRIES_FILE, JSON.stringify(entries, null, 2));
  }

  async getSettings() {
    try {
      const data = await fs.readFile(SETTINGS_FILE, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading settings:', error);
      return {};
    }
  }

  async updateSettings(settings) {
    const currentSettings = await this.getSettings();
    const updatedSettings = { ...currentSettings, ...settings };
    await fs.writeFile(SETTINGS_FILE, JSON.stringify(updatedSettings, null, 2));
    return updatedSettings;
  }

  generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }

  formatDate(date) {
    return date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  async searchEntries(query) {
    const entries = await this.getAllEntries();
    const lowerQuery = query.toLowerCase();
    return entries.filter(entry =>
      entry.title.toLowerCase().includes(lowerQuery) ||
      entry.content.toLowerCase().includes(lowerQuery)
    );
  }
}

module.exports = new StorageService();
