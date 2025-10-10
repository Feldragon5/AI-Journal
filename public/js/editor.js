// Editor functionality with AI integration

class Editor {
  constructor() {
    this.currentEntry = null;
    this.typingTimer = null;
    this.autoSaveTimer = null;
    this.questionTimer = null;
    this.typingDelay = 2500; // Wait 2.5 seconds after typing stops
    this.autoSaveDelay = 30000; // Auto-save every 30 seconds
    this.hasUnsavedChanges = false;
    this.lastQuestionExcerpt = '';

    this.titleInput = document.getElementById('entryTitle');
    this.contentTextarea = document.getElementById('entryContent');
    this.dateDisplay = document.getElementById('entryDate');
    this.wordCountDisplay = document.getElementById('wordCount');
    this.saveBtn = document.getElementById('saveBtn');
    this.enhanceBtn = document.getElementById('enhanceBtn');
    this.deleteBtn = document.getElementById('deleteBtn');
    this.autoSaveIndicator = document.getElementById('autoSaveIndicator');
    this.questionsPanel = document.getElementById('questionsPanel');
    this.questionsList = document.getElementById('questionsList');
    this.questionsLoading = document.getElementById('questionsLoading');

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateDate();
    this.startAutoSave();
  }

  setupEventListeners() {
    // Content change listeners
    this.contentTextarea.addEventListener('input', () => {
      this.hasUnsavedChanges = true;
      this.updateWordCount();
      this.onTyping();
    });

    this.titleInput.addEventListener('input', () => {
      this.hasUnsavedChanges = true;
    });

    // Button listeners
    this.saveBtn.addEventListener('click', () => this.saveEntry());
    this.enhanceBtn.addEventListener('click', () => this.enhanceWithAI());

    if (this.deleteBtn) {
      this.deleteBtn.addEventListener('click', () => this.deleteEntry());
    }

    // Close questions panel
    const closeQuestionsBtn = document.getElementById('closeQuestions');
    if (closeQuestionsBtn) {
      closeQuestionsBtn.addEventListener('click', () => {
        this.questionsPanel.style.display = 'none';
      });
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        this.saveEntry();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        this.enhanceWithAI();
      }
    });
  }

  onTyping() {
    // Clear previous timer
    clearTimeout(this.typingTimer);
    clearTimeout(this.questionTimer);

    // Set new timer for question generation
    this.questionTimer = setTimeout(() => {
      this.generateQuestions();
    }, this.typingDelay);
  }

  async generateQuestions() {
    const content = this.contentTextarea.value.trim();

    // Don't generate if content is too short
    if (content.length < 50) {
      return;
    }

    // Get last 300 characters as excerpt
    const excerpt = content.slice(-300);

    // Don't generate if excerpt hasn't changed much
    if (excerpt === this.lastQuestionExcerpt) {
      return;
    }

    this.lastQuestionExcerpt = excerpt;

    try {
      // Show loading
      this.questionsLoading.style.display = 'block';
      this.questionsList.innerHTML = '';

      // Call AI
      const result = await API.generateQuestions(excerpt);

      // Hide loading
      this.questionsLoading.style.display = 'none';

      // Display questions
      if (result.questions && result.questions.length > 0) {
        this.displayQuestions(result.questions);
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      this.questionsLoading.style.display = 'none';
      this.questionsList.innerHTML = '<p class="questions-hint">Unable to generate questions at the moment.</p>';
    }
  }

  displayQuestions(questions) {
    this.questionsList.innerHTML = '';

    questions.forEach(question => {
      const questionEl = document.createElement('div');
      questionEl.className = 'question-item';
      questionEl.textContent = question;

      questionEl.addEventListener('click', () => {
        // Insert question into content
        const currentContent = this.contentTextarea.value;
        const newContent = currentContent + '\n\n' + question + '\n';
        this.contentTextarea.value = newContent;
        this.contentTextarea.focus();
        this.hasUnsavedChanges = true;
        this.updateWordCount();

        // Show toast
        showToast('Question added to your entry', 'success');
      });

      this.questionsList.appendChild(questionEl);
    });
  }

  async enhanceWithAI() {
    const content = this.contentTextarea.value.trim();

    if (content.length < 10) {
      showToast('Please write more before enhancing', 'info');
      return;
    }

    try {
      showLoading('Enhancing your entry with AI...');

      const result = await API.enhanceEntry(content);

      hideLoading();

      if (result.enhancedContent) {
        // Store original content if not already stored
        if (!this.currentEntry || !this.currentEntry.rawContent) {
          if (this.currentEntry) {
            this.currentEntry.rawContent = content;
          }
        }

        // Update content
        this.contentTextarea.value = result.enhancedContent;
        this.hasUnsavedChanges = true;
        this.updateWordCount();

        showToast('Entry enhanced successfully!', 'success');
      }
    } catch (error) {
      hideLoading();
      console.error('Error enhancing entry:', error);
      showToast('Failed to enhance entry. Please try again.', 'error');
    }
  }

  async saveEntry() {
    const title = this.titleInput.value.trim();
    const content = this.contentTextarea.value.trim();

    if (!content) {
      showToast('Please write something before saving', 'info');
      return;
    }

    try {
      const entryData = {
        title,
        content,
        rawContent: this.currentEntry?.rawContent || content
      };

      let savedEntry;
      if (this.currentEntry && this.currentEntry.id) {
        // Update existing entry
        savedEntry = await API.updateEntry(this.currentEntry.id, entryData);
        showToast('Entry updated successfully!', 'success');
      } else {
        // Create new entry
        savedEntry = await API.createEntry(entryData);
        showToast('Entry saved successfully!', 'success');
      }

      this.currentEntry = savedEntry;
      this.hasUnsavedChanges = false;
      this.deleteBtn.style.display = 'inline-block';

      // Trigger refresh of entries list
      if (window.app) {
        window.app.loadEntries();
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      showToast('Failed to save entry. Please try again.', 'error');
    }
  }

  async deleteEntry() {
    if (!this.currentEntry || !this.currentEntry.id) {
      return;
    }

    if (!confirm('Are you sure you want to delete this entry? This cannot be undone.')) {
      return;
    }

    try {
      await API.deleteEntry(this.currentEntry.id);
      showToast('Entry deleted successfully', 'success');

      // Clear editor
      this.newEntry();

      // Refresh entries list
      if (window.app) {
        window.app.loadEntries();
      }
    } catch (error) {
      console.error('Error deleting entry:', error);
      showToast('Failed to delete entry. Please try again.', 'error');
    }
  }

  async loadEntry(entry) {
    this.currentEntry = entry;
    this.titleInput.value = entry.title || '';
    this.contentTextarea.value = entry.content || '';
    this.updateWordCount();
    this.updateDate(new Date(entry.createdAt));
    this.hasUnsavedChanges = false;
    this.deleteBtn.style.display = 'inline-block';

    // Clear questions
    this.questionsList.innerHTML = '<p class="questions-hint">Keep writing... AI will suggest questions to help you reflect.</p>';
  }

  newEntry() {
    this.currentEntry = null;
    this.titleInput.value = '';
    this.contentTextarea.value = '';
    this.updateWordCount();
    this.updateDate();
    this.hasUnsavedChanges = false;
    this.deleteBtn.style.display = 'none';
    this.lastQuestionExcerpt = '';

    // Clear questions
    this.questionsList.innerHTML = '<p class="questions-hint">Keep writing... AI will suggest questions to help you reflect.</p>';

    // Focus on content
    this.contentTextarea.focus();
  }

  updateWordCount() {
    const content = this.contentTextarea.value.trim();
    const words = content ? content.split(/\s+/).length : 0;
    this.wordCountDisplay.textContent = `${words} word${words !== 1 ? 's' : ''}`;
  }

  updateDate(date = new Date()) {
    const formatted = date.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
    this.dateDisplay.textContent = formatted;
  }

  startAutoSave() {
    this.autoSaveTimer = setInterval(() => {
      if (this.hasUnsavedChanges && this.contentTextarea.value.trim()) {
        this.autoSave();
      }
    }, this.autoSaveDelay);
  }

  async autoSave() {
    if (!this.currentEntry || !this.currentEntry.id) {
      // Don't auto-save new entries
      return;
    }

    try {
      this.autoSaveIndicator.textContent = 'Saving...';

      const entryData = {
        title: this.titleInput.value.trim(),
        content: this.contentTextarea.value.trim(),
        rawContent: this.currentEntry.rawContent || this.contentTextarea.value.trim()
      };

      await API.updateEntry(this.currentEntry.id, entryData);

      this.hasUnsavedChanges = false;
      this.autoSaveIndicator.textContent = 'Saved';

      setTimeout(() => {
        this.autoSaveIndicator.textContent = '';
      }, 2000);
    } catch (error) {
      console.error('Auto-save failed:', error);
      this.autoSaveIndicator.textContent = 'Auto-save failed';
    }
  }
}

// Initialize editor when DOM is ready
let editor;
document.addEventListener('DOMContentLoaded', () => {
  editor = new Editor();
});
