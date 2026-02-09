// Time Tracker App - Main JavaScript

class TimeTracker {
    constructor() {
        this.entries = this.loadEntries();
        this.currentFilter = {
            startDate: null,
            endDate: null,
            project: null
        };
        this.init();
    }

    init() {
        // Set today's date as default
        document.getElementById('date').valueAsDate = new Date();

        // Event listeners
        document.getElementById('timeEntryForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addEntry();
        });

        document.getElementById('applyFilter').addEventListener('click', () => {
            this.applyFilter();
        });

        document.getElementById('clearFilter').addEventListener('click', () => {
            this.clearFilter();
        });

        document.getElementById('filterCurrentMonth').addEventListener('click', () => {
            this.filterCurrentMonth();
        });

        // Tab switching
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.switchTab(e.target.dataset.tab);
            });
        });

        // Initial render
        this.updateProjectsDatalist();
        this.updateFilterProjectDropdown();
        
        // Set current month as default filter
        this.filterCurrentMonth();

        // Register Service Worker for PWA
        this.registerServiceWorker();
    }

    // Load entries from localStorage
    loadEntries() {
        const stored = localStorage.getItem('timeTrackerEntries');
        return stored ? JSON.parse(stored) : [];
    }

    // Save entries to localStorage
    saveEntries() {
        localStorage.setItem('timeTrackerEntries', JSON.stringify(this.entries));
    }

    // Switch between tabs
    switchTab(tabId) {
        // Update tab buttons
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tab === tabId) {
                btn.classList.add('active');
            }
        });

        // Update tab panels
        document.querySelectorAll('.tab-panel').forEach(panel => {
            panel.classList.remove('active');
            if (panel.id === tabId) {
                panel.classList.add('active');
            }
        });
    }

    // Add new time entry
    addEntry() {
        const date = document.getElementById('date').value;
        const startTime = document.getElementById('startTime').value;
        const endTime = document.getElementById('endTime').value;
        const project = document.getElementById('project').value.trim();
        const description = document.getElementById('description').value.trim();

        // Validate end time is after start time
        if (!this.isValidTimeRange(startTime, endTime)) {
            alert('End time must be after start time!');
            return;
        }

        const entry = {
            id: Date.now(),
            date,
            startTime,
            endTime,
            project,
            description,
            duration: this.calculateDuration(startTime, endTime)
        };

        this.entries.unshift(entry); // Add to beginning
        this.saveEntries();

        // Reset form
        document.getElementById('timeEntryForm').reset();
        document.getElementById('date').valueAsDate = new Date();

        // Update UI
        this.updateProjectsDatalist();
        this.updateFilterProjectDropdown();
        this.renderEntries();
        this.updateSummary();

        // Switch to view tab to show the new entry
        this.switchTab('view-summary');
    }

    // Validate time range
    isValidTimeRange(startTime, endTime) {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        return end > start;
    }

    // Calculate duration in minutes
    calculateDuration(startTime, endTime) {
        const start = new Date(`2000-01-01T${startTime}`);
        const end = new Date(`2000-01-01T${endTime}`);
        return (end - start) / (1000 * 60); // Duration in minutes
    }

    // Format duration from minutes to hours and minutes
    formatDuration(minutes) {
        const hours = Math.floor(minutes / 60);
        const mins = Math.round(minutes % 60);
        return `${hours}h ${mins}m`;
    }

    // Delete entry
    deleteEntry(id) {
        if (confirm('Are you sure you want to delete this entry?')) {
            this.entries = this.entries.filter(entry => entry.id !== id);
            this.saveEntries();
            this.updateProjectsDatalist();
            this.updateFilterProjectDropdown();
            this.renderEntries();
            this.updateSummary();
        }
    }

    // Apply filter
    applyFilter() {
        const startDate = document.getElementById('filterStartDate').value;
        const endDate = document.getElementById('filterEndDate').value;
        const project = document.getElementById('filterProject').value;

        this.currentFilter = {
            startDate: startDate || null,
            endDate: endDate || null,
            project: project || null
        };

        this.updateFilterStatus();
        this.renderEntries();
        this.updateSummary();
    }

    // Clear filter
    clearFilter() {
        document.getElementById('filterStartDate').value = '';
        document.getElementById('filterEndDate').value = '';
        document.getElementById('filterProject').value = '';

        this.currentFilter = {
            startDate: null,
            endDate: null,
            project: null
        };

        this.updateFilterStatus();
        this.renderEntries();
        this.updateSummary();
    }

    // Filter by current month
    filterCurrentMonth() {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        
        // First day of current month
        const firstDay = new Date(year, month, 1);
        const startDate = firstDay.toISOString().split('T')[0];
        
        // Last day of current month
        const lastDay = new Date(year, month + 1, 0);
        const endDate = lastDay.toISOString().split('T')[0];
        
        // Set the filter inputs
        document.getElementById('filterStartDate').value = startDate;
        document.getElementById('filterEndDate').value = endDate;
        
        // Apply the filter
        this.applyFilter();
    }

    // Update filter status display
    updateFilterStatus() {
        const statusDiv = document.getElementById('filterStatus');
        const filters = [];

        if (this.currentFilter.startDate || this.currentFilter.endDate) {
            let dateRange = '';
            if (this.currentFilter.startDate && this.currentFilter.endDate) {
                dateRange = `${this.formatDate(this.currentFilter.startDate)} - ${this.formatDate(this.currentFilter.endDate)}`;
            } else if (this.currentFilter.startDate) {
                dateRange = `From ${this.formatDate(this.currentFilter.startDate)}`;
            } else if (this.currentFilter.endDate) {
                dateRange = `Until ${this.formatDate(this.currentFilter.endDate)}`;
            }
            filters.push(`📅 ${dateRange}`);
        }

        if (this.currentFilter.project) {
            filters.push(`📂 Project: ${this.escapeHtml(this.currentFilter.project)}`);
        }

        if (filters.length > 0) {
            statusDiv.innerHTML = `<strong>Active Filters:</strong> ${filters.join(' • ')}`;
            statusDiv.style.display = 'block';
        } else {
            statusDiv.style.display = 'none';
        }
    }

    // Get filtered entries
    getFilteredEntries() {
        return this.entries.filter(entry => {
            // Filter by date range
            if (this.currentFilter.startDate && entry.date < this.currentFilter.startDate) {
                return false;
            }
            if (this.currentFilter.endDate && entry.date > this.currentFilter.endDate) {
                return false;
            }

            // Filter by project
            if (this.currentFilter.project && entry.project !== this.currentFilter.project) {
                return false;
            }

            return true;
        });
    }

    // Update projects datalist for autocomplete
    updateProjectsDatalist() {
        const projects = [...new Set(this.entries.map(entry => entry.project))];
        const datalist = document.getElementById('projectsList');
        datalist.innerHTML = projects.map(project => 
            `<option value="${project}">`
        ).join('');
    }

    // Update filter project dropdown
    updateFilterProjectDropdown() {
        const projects = [...new Set(this.entries.map(entry => entry.project))].sort();
        const select = document.getElementById('filterProject');
        const currentValue = select.value;
        
        select.innerHTML = '<option value="">All Projects</option>' + 
            projects.map(project => 
                `<option value="${project}">${project}</option>`
            ).join('');
        
        // Restore previous selection if it still exists
        if (currentValue && projects.includes(currentValue)) {
            select.value = currentValue;
        }
    }

    // Render entries list
    renderEntries() {
        const entriesList = document.getElementById('entriesList');
        const filteredEntries = this.getFilteredEntries();

        if (filteredEntries.length === 0) {
            entriesList.innerHTML = `
                <div class="empty-state">
                    <p>No time entries found</p>
                    <small>Add your first time entry above!</small>
                </div>
            `;
            return;
        }

        entriesList.innerHTML = filteredEntries.map(entry => `
            <div class="entry-item">
                <div class="entry-header">
                    <div class="entry-project">${this.escapeHtml(entry.project)}</div>
                    <button class="btn btn-danger" onclick="tracker.deleteEntry(${entry.id})">Delete</button>
                </div>
                <div class="entry-date-time">
                    <span>📅 ${this.formatDate(entry.date)}</span>
                    <span>🕐 ${entry.startTime} - ${entry.endTime}</span>
                    <span class="entry-duration">⏱️ ${this.formatDuration(entry.duration)}</span>
                </div>
                <div class="entry-description">${this.escapeHtml(entry.description)}</div>
            </div>
        `).join('');
    }

    // Update summary section
    updateSummary() {
        const filteredEntries = this.getFilteredEntries();
        const summaryByProject = {};
        let totalMinutes = 0;

        // Calculate totals by project
        filteredEntries.forEach(entry => {
            if (!summaryByProject[entry.project]) {
                summaryByProject[entry.project] = 0;
            }
            summaryByProject[entry.project] += entry.duration;
            totalMinutes += entry.duration;
        });

        // Render project summaries
        const summaryContainer = document.getElementById('summaryByProject');
        const projects = Object.keys(summaryByProject).sort();

        if (projects.length === 0) {
            summaryContainer.innerHTML = '<p style="text-align: center; color: var(--text-secondary);">No data to summarize</p>';
        } else {
            summaryContainer.innerHTML = projects.map(project => `
                <div class="project-summary">
                    <span class="project-name">${this.escapeHtml(project)}</span>
                    <span class="project-time">${this.formatDuration(summaryByProject[project])}</span>
                </div>
            `).join('');
        }

        // Update total time
        document.getElementById('totalTime').textContent = this.formatDuration(totalMinutes);
    }

    // Format date for display
    formatDate(dateString) {
        const date = new Date(dateString + 'T00:00:00');
        return date.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short', 
            day: 'numeric' 
        });
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Register Service Worker for PWA functionality
    async registerServiceWorker() {
        if ('serviceWorker' in navigator) {
            try {
                const registration = await navigator.serviceWorker.register('./service-worker.js');
                console.log('Service Worker registered successfully:', registration);
            } catch (error) {
                console.log('Service Worker registration failed:', error);
            }
        }
    }
}

// Initialize the app
const tracker = new TimeTracker();

// PWA Install Prompt
let deferredPrompt;

window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredPrompt = e;
    // You can show a custom install button here if desired
    console.log('PWA can be installed');
});

window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
});
