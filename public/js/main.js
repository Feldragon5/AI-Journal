// Main app controller for single-page view switching
class JournalApp {
  constructor() {
    this.currentView = 'calendar';
    this.currentDate = new Date();
    this.entries = [];
    this.entriesByDate = {};
    this.currentEntry = null;
    this.currentEntryDate = null;
    this.hasUnsavedChanges = false;
    this.currentQuestionIndex = 0;
    this.questions = [];
    this.isEnhancing = false;
    this.autoSaveTimer = null;

    // Get DOM elements
    this.calendarView = document.getElementById('calendarView');
    this.editorView = document.getElementById('editorView');
    this.homeLink = document.getElementById('homeLink');

    // Calendar elements
    this.calendarGrid = document.getElementById('calendarGrid');
    this.calendarTitle = document.getElementById('calendarTitle');
    this.prevMonthBtn = document.getElementById('prevMonth');
    this.nextMonthBtn = document.getElementById('nextMonth');
    this.todayBtn = document.getElementById('todayBtn');

    // Editor elements
    this.titleInput = document.getElementById('entryTitle');
    this.contentTextarea = document.getElementById('entryContent');
    this.dateDisplay = document.getElementById('entryDate');
    this.modifiedDisplay = document.getElementById('modifiedDate');
    this.wordCountDisplay = document.getElementById('wordCount');
    this.saveBtn = document.getElementById('saveBtn');
    this.enhanceBtn = document.getElementById('enhanceBtn');
    this.deleteBtn = document.getElementById('deleteBtn');
    this.autoSaveIndicator = document.getElementById('autoSaveIndicator');

    // Sidebar elements
    this.questionsSidebar = document.getElementById('questionsSidebar');
    this.sidebarTitle = document.getElementById('sidebarTitle');
    this.sidebarContent = document.getElementById('sidebarContent');
    this.closeSidebarBtn = document.getElementById('closeSidebar');

    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadEntries();
    this.showCalendarView();
  }

  setupEventListeners() {
    // Home link - autosave before leaving
    this.homeLink.addEventListener('click', async (e) => {
      e.preventDefault();
      if (this.currentView === 'editor' && this.hasUnsavedChanges) {
        await this.autoSave();
      }
      this.showCalendarView();
    });

    // Calendar navigation
    this.prevMonthBtn.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() - 1);
      this.renderCalendar();
    });

    this.nextMonthBtn.addEventListener('click', () => {
      this.currentDate.setMonth(this.currentDate.getMonth() + 1);
      this.renderCalendar();
    });

    this.todayBtn.addEventListener('click', () => {
      this.currentDate = new Date();
      this.renderCalendar();
    });

    // Editor buttons
    this.saveBtn.addEventListener('click', () => this.doneEditing());
    this.enhanceBtn.addEventListener('click', () => this.enhanceWithAI());
    this.deleteBtn.addEventListener('click', () => this.deleteEntry());

    // Editor content changes - start autosave timer
    this.contentTextarea.addEventListener('input', () => {
      this.hasUnsavedChanges = true;
      this.updateWordCount();
      this.startAutoSaveTimer();
    });

    this.titleInput.addEventListener('input', () => {
      this.hasUnsavedChanges = true;
      this.startAutoSaveTimer();
    });

    // Sidebar close
    this.closeSidebarBtn.addEventListener('click', () => {
      this.closeSidebar();
    });

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        if (this.currentView === 'editor') {
          this.doneEditing();
        }
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (this.currentView === 'editor') {
          this.enhanceWithAI();
        }
      }
    });
  }

  // VIEW SWITCHING
  showCalendarView() {
    this.currentView = 'calendar';
    this.calendarView.classList.add('active');
    this.editorView.classList.remove('active');
    this.closeSidebar();
    this.stopAutoSaveTimer();
    this.renderCalendar();
  }

  showEditorView(entry = null, date = null) {
    this.currentView = 'editor';
    this.calendarView.classList.remove('active');
    this.editorView.classList.add('active');

    if (entry) {
      this.loadEntry(entry);
    } else if (date) {
      this.newEntryForDate(date);
    } else {
      this.newEntry();
    }
  }

  // CALENDAR METHODS
  async loadEntries() {
    try {
      this.entries = await API.getAllEntries();

      // Organize entries by date
      this.entriesByDate = {};
      this.entries.forEach(entry => {
        const dateKey = entry.date;
        if (!this.entriesByDate[dateKey]) {
          this.entriesByDate[dateKey] = [];
        }
        this.entriesByDate[dateKey].push(entry);
      });
    } catch (error) {
      console.error('Error loading entries:', error);
      showToast('Failed to load entries', 'error');
    }
  }

  renderCalendar() {
    const year = this.currentDate.getFullYear();
    const month = this.currentDate.getMonth();

    // Update title
    this.calendarTitle.textContent = this.currentDate.toLocaleDateString('en-US', {
      month: 'long',
      year: 'numeric'
    });

    // Clear grid
    this.calendarGrid.innerHTML = '';

    // Add day headers
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    dayNames.forEach(day => {
      const dayHeader = document.createElement('div');
      dayHeader.className = 'calendar-day-header';
      dayHeader.textContent = day;
      this.calendarGrid.appendChild(dayHeader);
    });

    // Get first day of month and number of days
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    // Add previous month's days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    for (let i = startingDayOfWeek - 1; i >= 0; i--) {
      const dayNum = prevMonthLastDay - i;
      const dayEl = this.createDayElement(dayNum, true);
      this.calendarGrid.appendChild(dayEl);
    }

    // Add current month's days
    const today = new Date();
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day);
      const dateKey = this.formatDateKey(date);
      const hasEntry = this.entriesByDate[dateKey] && this.entriesByDate[dateKey].length > 0;
      const isToday = date.toDateString() === today.toDateString();

      const dayEl = this.createDayElement(day, false, hasEntry, isToday);

      dayEl.addEventListener('click', () => {
        if (hasEntry) {
          // Open editor with existing entry
          this.showEditorView(this.entriesByDate[dateKey][0]);
        } else {
          // Open editor for new entry on this date
          this.showEditorView(null, dateKey);
        }
      });

      this.calendarGrid.appendChild(dayEl);
    }

    // Add next month's days to fill the grid
    const totalCells = this.calendarGrid.children.length - 7;
    const remainingCells = 42 - totalCells;
    for (let day = 1; day <= remainingCells; day++) {
      const dayEl = this.createDayElement(day, true);
      this.calendarGrid.appendChild(dayEl);
    }
  }

  createDayElement(dayNum, isOtherMonth, hasEntry = false, isToday = false) {
    const dayEl = document.createElement('div');
    dayEl.className = 'calendar-day';

    if (isOtherMonth) {
      dayEl.classList.add('other-month');
    }
    if (hasEntry) {
      dayEl.classList.add('has-entry');
    }
    if (isToday) {
      dayEl.classList.add('today');
    }

    const dayNumber = document.createElement('div');
    dayNumber.className = 'calendar-day-number';
    dayNumber.textContent = dayNum;

    dayEl.appendChild(dayNumber);

    return dayEl;
  }

  formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  // EDITOR METHODS
  loadEntry(entry) {
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
    this.contentTextarea.focus();
  }

  newEntryForDate(dateKey) {
    this.currentEntry = null;
    this.currentEntryDate = dateKey;
    this.titleInput.value = '';
    this.contentTextarea.value = '';
    this.updateWordCount();
    this.updateDate(new Date(dateKey + 'T00:00:00'));
    this.modifiedDisplay.style.display = 'none';
    this.hasUnsavedChanges = false;
    this.deleteBtn.style.display = 'none';
    this.contentTextarea.focus();
  }

  newEntry() {
    this.currentEntry = null;
    this.currentEntryDate = null;
    this.titleInput.value = '';
    this.contentTextarea.value = '';
    this.updateWordCount();
    this.updateDate();
    this.modifiedDisplay.style.display = 'none';
    this.hasUnsavedChanges = false;
    this.deleteBtn.style.display = 'none';
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
      day: 'numeric'
    });
    this.dateDisplay.textContent = formatted;
  }

  startAutoSaveTimer() {
    this.stopAutoSaveTimer();
    this.autoSaveTimer = setTimeout(() => {
      this.autoSave();
    }, 10000); // 10 seconds
  }

  stopAutoSaveTimer() {
    if (this.autoSaveTimer) {
      clearTimeout(this.autoSaveTimer);
      this.autoSaveTimer = null;
    }
  }

  async autoSave() {
    const content = this.contentTextarea.value.trim();
    if (!content) return;

    try {
      await this.saveEntryInternal(false); // silent save
    } catch (error) {
      console.error('Autosave failed:', error);
    }
  }

  async doneEditing() {
    if (this.hasUnsavedChanges) {
      await this.saveEntryInternal(true);
    }
    setTimeout(() => {
      this.showCalendarView();
    }, 500);
  }

  async saveEntryInternal(showToastMessage = true) {
    const title = this.titleInput.value.trim();
    const content = this.contentTextarea.value.trim();

    if (!content) {
      if (showToastMessage) {
        showToast('Please write something before saving', 'info');
      }
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
        savedEntry = await API.updateEntry(this.currentEntry.id, entryData);
        if (showToastMessage) showToast('Entry saved!', 'success');
      } else {
        const existingEntry = this.entriesByDate[entryData.date]?.[0];
        if (existingEntry) {
          savedEntry = await API.updateEntry(existingEntry.id, entryData);
          if (showToastMessage) showToast('Entry saved!', 'success');
        } else {
          savedEntry = await API.createEntry(entryData);
          if (showToastMessage) showToast('Entry saved!', 'success');
        }
      }

      this.currentEntry = savedEntry;
      this.hasUnsavedChanges = false;
      await this.loadEntries();

    } catch (error) {
      console.error('Error saving entry:', error);
      if (showToastMessage) {
        showToast('Failed to save entry. Please try again.', 'error');
      }
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

      await this.loadEntries();
      setTimeout(() => {
        this.showCalendarView();
      }, 500);
    } catch (error) {
      console.error('Error deleting entry:', error);
      showToast('Failed to delete entry. Please try again.', 'error');
    }
  }

  // AI ENHANCEMENT
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
}

// Initialize when DOM is ready
let journalApp;
document.addEventListener('DOMContentLoaded', () => {
  journalApp = new JournalApp();
});
