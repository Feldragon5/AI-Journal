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
    this.modifiedDisplay = document.getElementById('modifiedDate');
    this.wordCountDisplay = document.getElementById('wordCount');
    this.saveBtn = document.getElementById('saveBtn');
    this.enhanceBtn = document.getElementById('enhanceBtn');
    this.deleteBtn = document.getElementById('deleteBtn');
    this.autoSaveIndicator = document.getElementById('autoSaveIndicator');
    this.questionsSidebar = document.getElementById('questionsSidebar');
    this.sidebarTitle = document.getElementById('sidebarTitle');
    this.sidebarContent = document.getElementById('sidebarContent');
    this.closeSidebarBtn = document.getElementById('closeSidebar');

    this.currentQuestionIndex = 0;
    this.questions = [];
    this.isEnhancing = false;

    this.init();
  }

  init() {
    this.setupEventListeners();
    this.updateDate();
    this.startAutoSave();
    this.checkForLoadEntry();
  }

  setupEventListeners() {
    // Content change listeners
    this.contentTextarea.addEventListener('input', () => {
      this.hasUnsavedChanges = true;
      this.updateWordCount();
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

    // Close sidebar
    if (this.closeSidebarBtn) {
      this.closeSidebarBtn.addEventListener('click', () => {
        this.closeSidebar();
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

  async enhanceWithAI() {
    const content = this.contentTextarea.value.trim();

    if (content.length < 10) {
      showToast('Please write more before enhancing', 'info');
      return;
    }

    if (this.isEnhancing) {
      return;
    }

    this.isEnhancing = true;

    try {
      // Show sidebar with loading state
      this.showSidebar();
      this.sidebarTitle.textContent = '✨ Enhancing...';
      this.sidebarContent.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Processing your entry...</p>
        </div>
      `;

      // Store original content
      if (!this.currentEntry || !this.currentEntry.rawContent) {
        if (this.currentEntry) {
          this.currentEntry.rawContent = content;
        }
      }

      // Enhance the entry
      const enhanceResult = await API.enhanceEntry(content);

      if (enhanceResult.enhancedContent) {
        this.contentTextarea.value = enhanceResult.enhancedContent;
        this.hasUnsavedChanges = true;
        this.updateWordCount();
      }

      // Generate questions
      this.sidebarTitle.textContent = '💭 Reflection Questions';
      this.sidebarContent.innerHTML = `
        <div class="loading-state">
          <div class="spinner"></div>
          <p>Generating questions...</p>
        </div>
      `;

      const questionsResult = await API.generateQuestions(enhanceResult.enhancedContent || content);

      if (questionsResult.questions && questionsResult.questions.length > 0) {
        this.questions = questionsResult.questions;
        this.currentQuestionIndex = 0;
        this.showNextQuestion();
      } else {
        this.sidebarContent.innerHTML = '<p class="loading-state">No questions generated. You can save your entry now.</p>';
        this.isEnhancing = false;
      }

    } catch (error) {
      console.error('Error enhancing entry:', error);
      this.sidebarContent.innerHTML = '<p class="loading-state" style="color: var(--text-secondary);">Enhancement failed. Please try again.</p>';
      showToast('Failed to enhance entry. Please try again.', 'error');
      this.isEnhancing = false;
    }
  }

  showSidebar() {
    if (this.questionsSidebar) {
      this.questionsSidebar.style.display = 'flex';
      setTimeout(() => {
        this.questionsSidebar.classList.add('active');
      }, 10);
    }
  }

  closeSidebar() {
    if (this.questionsSidebar) {
      this.questionsSidebar.classList.remove('active');
      setTimeout(() => {
        this.questionsSidebar.style.display = 'none';
      }, 300);
    }
    this.isEnhancing = false;
    this.questions = [];
    this.currentQuestionIndex = 0;
  }

  showNextQuestion() {
    if (this.currentQuestionIndex >= this.questions.length) {
      // All questions answered
      this.sidebarContent.innerHTML = '<p class="loading-state" style="color: var(--accent-color);">✅ All questions answered! Your entry has been enriched.</p>';
      this.isEnhancing = false;
      setTimeout(() => {
        this.closeSidebar();
      }, 2000);
      return;
    }

    const question = this.questions[this.currentQuestionIndex];

    this.sidebarContent.innerHTML = `
      <div class="question-card" id="currentQuestion">
        <div class="question-text">${this.escapeHtml(question)}</div>
        <textarea
          class="answer-input"
          id="answerInput"
          placeholder="Type your answer and press Enter..."
          rows="3"
        ></textarea>
      </div>
    `;

    const answerInput = document.getElementById('answerInput');
    answerInput.focus();

    answerInput.addEventListener('keydown', async (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        const answer = answerInput.value.trim();
        if (answer) {
          await this.processAnswer(question, answer);
        }
      }
    });
  }

  async processAnswer(question, answer) {
    const questionCard = document.getElementById('currentQuestion');
    if (!questionCard) return;

    // Disable input
    const answerInput = document.getElementById('answerInput');
    if (answerInput) {
      answerInput.disabled = true;
    }

    // Show processing state
    questionCard.innerHTML += '<p style="margin-top: 8px; color: var(--text-secondary); font-size: 0.9rem;">✨ Integrating your answer...</p>';

    try {
      // Call AI to integrate the answer
      const currentContent = this.contentTextarea.value;
      const prompt = `The user was asked: "${question}"\nThey answered: "${answer}"\n\nIntegrate this answer naturally into the journal entry below. Maintain the flow and voice of the entry:\n\n${currentContent}`;

      const result = await API.enhanceEntry(prompt);

      if (result.enhancedContent) {
        this.contentTextarea.value = result.enhancedContent;
        this.hasUnsavedChanges = true;
        this.updateWordCount();
      }

      // Animate out the question
      questionCard.classList.add('answered');

      setTimeout(() => {
        this.currentQuestionIndex++;
        this.showNextQuestion();
      }, 400);

    } catch (error) {
      console.error('Error processing answer:', error);
      showToast('Failed to process answer. Moving to next question.', 'error');
      setTimeout(() => {
        this.currentQuestionIndex++;
        this.showNextQuestion();
      }, 400);
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
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
        rawContent: this.currentEntry?.rawContent || content,
        date: this.currentEntryDate || new Date().toISOString().split('T')[0]
      };

      let savedEntry;
      if (this.currentEntry && this.currentEntry.id) {
        // Update existing entry
        savedEntry = await API.updateEntry(this.currentEntry.id, entryData);
        showToast('Entry updated successfully!', 'success');
      } else {
        // Create new entry (check if one exists for this date first)
        const entries = await API.getAllEntries();
        const existingEntry = entries.find(e => e.date === entryData.date);

        if (existingEntry) {
          // Update the existing entry for this date
          savedEntry = await API.updateEntry(existingEntry.id, entryData);
          showToast('Entry updated successfully!', 'success');
        } else {
          // Create new entry
          savedEntry = await API.createEntry(entryData);
          showToast('Entry saved successfully!', 'success');
        }
      }

      this.currentEntry = savedEntry;
      this.hasUnsavedChanges = false;

      // Close sidebar if open
      this.closeSidebar();

      // Redirect to calendar after a short delay
      setTimeout(() => {
        window.location.href = '/';
      }, 500);

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

      // Redirect to calendar
      setTimeout(() => {
        window.location.href = '/';
      }, 500);
    } catch (error) {
      console.error('Error deleting entry:', error);
      showToast('Failed to delete entry. Please try again.', 'error');
    }
  }

  async loadEntry(entry) {
    this.currentEntry = entry;
    this.currentEntryDate = entry.date;
    this.titleInput.value = entry.title || '';
    this.contentTextarea.value = entry.content || '';
    this.updateWordCount();
    this.updateDate(new Date(entry.createdAt));

    // Show modified date if different from created date
    if (entry.updatedAt && entry.updatedAt !== entry.createdAt) {
      const modifiedDate = new Date(entry.updatedAt);
      const formatted = modifiedDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      this.modifiedDisplay.textContent = `Modified: ${formatted}`;
      this.modifiedDisplay.style.display = 'inline';
    } else {
      this.modifiedDisplay.style.display = 'none';
    }

    this.hasUnsavedChanges = false;
    this.deleteBtn.style.display = 'inline-block';
  }

  newEntry() {
    this.currentEntry = null;
    this.currentEntryDate = null;
    this.titleInput.value = '';
    this.contentTextarea.value = '';
    this.updateWordCount();
    this.updateDate();
    this.hasUnsavedChanges = false;
    this.deleteBtn.style.display = 'none';
    this.closeSidebar();

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

  async checkForLoadEntry() {
    // Check if we should load an entry from localStorage
    const loadEntryId = localStorage.getItem('loadEntryId');
    const newEntryDate = localStorage.getItem('newEntryDate');

    if (loadEntryId) {
      localStorage.removeItem('loadEntryId');
      try {
        const entry = await API.getEntry(loadEntryId);
        if (entry) {
          this.loadEntry(entry);
        }
      } catch (error) {
        console.error('Error loading entry:', error);
        showToast('Failed to load entry', 'error');
      }
    } else if (newEntryDate) {
      localStorage.removeItem('newEntryDate');
      // Check if an entry already exists for this date
      try {
        const entries = await API.getAllEntries();
        const existingEntry = entries.find(e => e.date === newEntryDate);
        if (existingEntry) {
          this.loadEntry(existingEntry);
        } else {
          // Set the date for the new entry
          this.currentEntryDate = newEntryDate;
          this.updateDate(new Date(newEntryDate + 'T00:00:00'));
        }
      } catch (error) {
        console.error('Error checking entries:', error);
      }
    }
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
