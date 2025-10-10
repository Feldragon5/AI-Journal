// Main App Controller

class App {
  constructor() {
    this.entries = [];
    this.entriesList = document.getElementById('entriesList');
    this.newEntryBtn = document.getElementById('newEntryBtn');
    this.searchBtn = document.getElementById('searchBtn');
    this.searchModal = document.getElementById('searchModal');
    this.searchInput = document.getElementById('searchInput');
    this.searchResults = document.getElementById('searchResults');

    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadEntries();
  }

  setupEventListeners() {
    // New entry button
    if (this.newEntryBtn) {
      this.newEntryBtn.addEventListener('click', () => {
        if (editor) {
          editor.newEntry();
        }
      });
    }

    // Search button
    if (this.searchBtn) {
      this.searchBtn.addEventListener('click', () => {
        this.openSearchModal();
      });
    }

    // Search input
    if (this.searchInput) {
      this.searchInput.addEventListener('input', (e) => {
        this.performSearch(e.target.value);
      });
    }

    // Close modal when clicking outside
    if (this.searchModal) {
      this.searchModal.addEventListener('click', (e) => {
        if (e.target === this.searchModal) {
          this.closeSearchModal();
        }
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        this.openSearchModal();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        if (editor) {
          editor.newEntry();
        }
      }
      if (e.key === 'Escape' && this.searchModal.classList.contains('active')) {
        this.closeSearchModal();
      }
    });
  }

  async loadEntries() {
    try {
      this.entries = await API.getAllEntries();
      this.renderEntries();
    } catch (error) {
      console.error('Error loading entries:', error);
      showToast('Failed to load entries', 'error');
    }
  }

  renderEntries() {
    if (!this.entriesList) return;

    if (this.entries.length === 0) {
      this.entriesList.innerHTML = `
        <div class="empty-state">
          <p>No entries yet.</p>
          <p>Start writing to begin your journey.</p>
        </div>
      `;
      return;
    }

    this.entriesList.innerHTML = '';

    this.entries.forEach(entry => {
      const entryEl = document.createElement('div');
      entryEl.className = 'entry-item';

      if (editor && editor.currentEntry && editor.currentEntry.id === entry.id) {
        entryEl.classList.add('active');
      }

      const title = entry.title || entry.displayTitle || 'Untitled';
      const preview = entry.content.substring(0, 100) + (entry.content.length > 100 ? '...' : '');
      const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });

      entryEl.innerHTML = `
        <div class="entry-item-title">${this.escapeHtml(title)}</div>
        <div class="entry-item-date">${date}</div>
        <div class="entry-item-preview">${this.escapeHtml(preview)}</div>
      `;

      entryEl.addEventListener('click', () => {
        if (editor) {
          // Check for unsaved changes
          if (editor.hasUnsavedChanges) {
            if (!confirm('You have unsaved changes. Do you want to discard them?')) {
              return;
            }
          }

          editor.loadEntry(entry);

          // Update active state
          document.querySelectorAll('.entry-item').forEach(el => el.classList.remove('active'));
          entryEl.classList.add('active');
        }
      });

      this.entriesList.appendChild(entryEl);
    });
  }

  openSearchModal() {
    if (this.searchModal) {
      this.searchModal.classList.add('active');
      if (this.searchInput) {
        this.searchInput.focus();
        this.searchInput.value = '';
      }
      this.searchResults.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Start typing to search...</p>';
    }
  }

  closeSearchModal() {
    if (this.searchModal) {
      this.searchModal.classList.remove('active');
    }
  }

  async performSearch(query) {
    if (!query || query.trim().length < 2) {
      this.searchResults.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Start typing to search...</p>';
      return;
    }

    try {
      const results = await API.searchEntries(query.trim());

      if (results.length === 0) {
        this.searchResults.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No entries found.</p>';
        return;
      }

      this.searchResults.innerHTML = '';

      results.forEach(entry => {
        const resultEl = document.createElement('div');
        resultEl.className = 'entry-item';

        const title = entry.title || entry.displayTitle || 'Untitled';
        const preview = entry.content.substring(0, 150) + (entry.content.length > 150 ? '...' : '');
        const date = new Date(entry.createdAt).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric'
        });

        resultEl.innerHTML = `
          <div class="entry-item-title">${this.escapeHtml(title)}</div>
          <div class="entry-item-date">${date}</div>
          <div class="entry-item-preview">${this.escapeHtml(preview)}</div>
        `;

        resultEl.addEventListener('click', () => {
          if (editor) {
            editor.loadEntry(entry);
            this.closeSearchModal();
            this.renderEntries(); // Update sidebar
          }
        });

        this.searchResults.appendChild(resultEl);
      });
    } catch (error) {
      console.error('Search error:', error);
      this.searchResults.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">Search failed. Please try again.</p>';
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Utility functions for UI
function showToast(message, type = 'info') {
  const toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;

  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideIn 0.3s ease reverse';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 3000);
}

function showLoading(message = 'Processing...') {
  const overlay = document.getElementById('loadingOverlay');
  const loadingText = document.getElementById('loadingText');

  if (overlay) {
    overlay.style.display = 'flex';
  }
  if (loadingText) {
    loadingText.textContent = message;
  }
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'none';
  }
}

function closeSearchModal() {
  if (window.app) {
    window.app.closeSearchModal();
  }
}

// Initialize app when DOM is ready
window.app = null;
document.addEventListener('DOMContentLoaded', () => {
  window.app = new App();
});
