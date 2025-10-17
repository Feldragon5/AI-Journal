// Calendar View Controller

class Calendar {
  constructor() {
    this.currentDate = new Date();
    this.entries = [];
    this.entriesByDate = {};
    this.selectedEntry = null;

    this.calendarGrid = document.getElementById('calendarGrid');
    this.calendarTitle = document.getElementById('calendarTitle');
    this.prevMonthBtn = document.getElementById('prevMonth');
    this.nextMonthBtn = document.getElementById('nextMonth');
    this.todayBtn = document.getElementById('todayBtn');
    this.previewModal = document.getElementById('entryPreviewModal');
    this.previewTitle = document.getElementById('previewTitle');
    this.previewBody = document.getElementById('previewBody');
    this.editEntryBtn = document.getElementById('editEntryBtn');
    this.closePreviewBtn = document.getElementById('closePreviewBtn');

    this.init();
  }

  async init() {
    this.setupEventListeners();
    await this.loadEntries();
    this.renderCalendar();
  }

  setupEventListeners() {
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

    this.editEntryBtn.addEventListener('click', () => {
      if (this.selectedEntry) {
        // Navigate to editor with entry loaded
        localStorage.setItem('loadEntryId', this.selectedEntry.id);
        window.location.href = '/editor';
      }
    });

    this.closePreviewBtn.addEventListener('click', () => {
      this.closePreviewModal();
    });

    this.previewModal.addEventListener('click', (e) => {
      if (e.target === this.previewModal) {
        this.closePreviewModal();
      }
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.previewModal.classList.contains('active')) {
        this.closePreviewModal();
      }
    });
  }

  async loadEntries() {
    try {
      this.entries = await API.getAllEntries();

      // Organize entries by date
      this.entriesByDate = {};
      this.entries.forEach(entry => {
        const dateKey = entry.date; // Format: YYYY-MM-DD
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
          // Navigate to editor with entry loaded
          localStorage.setItem('loadEntryId', this.entriesByDate[dateKey][0].id);
          window.location.href = '/editor';
        } else {
          // Navigate to new entry for this date
          localStorage.setItem('newEntryDate', dateKey);
          window.location.href = '/editor';
        }
      });

      this.calendarGrid.appendChild(dayEl);
    }

    // Add next month's days to fill the grid
    const totalCells = this.calendarGrid.children.length - 7; // Subtract headers
    const remainingCells = 42 - totalCells; // 6 rows * 7 days
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

  showEntryPreview(entry) {
    this.selectedEntry = entry;

    const title = entry.title || entry.displayTitle || 'Untitled Entry';
    this.previewTitle.textContent = title;
    this.previewBody.textContent = entry.content;

    this.previewModal.classList.add('active');
  }

  closePreviewModal() {
    this.previewModal.classList.remove('active');
    this.selectedEntry = null;
  }

  formatDateKey(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }
}

function closePreviewModal() {
  if (window.calendar) {
    window.calendar.closePreviewModal();
  }
}

// Initialize calendar
window.calendar = null;
document.addEventListener('DOMContentLoaded', () => {
  window.calendar = new Calendar();
});
