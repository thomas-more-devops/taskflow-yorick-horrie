// Main TaskFlow application class that manages task creation, editing, and persistence
class TaskFlow {
    // Initialize the TaskFlow application with all necessary setup
    constructor() {
        this.tasks = this.loadTasks(); // Load existing tasks from localStorage
        this.taskIdCounter = this.getNextTaskId(); // Get the next available task ID
        // FEATURE 4 ADDITION: Search and filter state
        this.searchQuery = '';
        this.statusFilter = 'all';
        this.sortOption = 'newest';
        this.createdFilter = 'all';
        this.lengthFilter = 'all';
        this.advancedPanelOpen = false;
        this.initializeApp(); // Set up the application
        this.bindEvents(); // Attach event listeners
        this.renderTasks(); // Display existing tasks
        this.updateStats(); // Update task statistics
    }

    // Initialize the application and show welcome message if needed
    initializeApp() {
        console.log('TaskFlow initialized successfully!');
        this.showWelcomeMessage();
    }

    // Display welcome message for new users with no tasks
    showWelcomeMessage() {
        if (this.tasks.length === 0) {
            console.log('Welcome to TaskFlow! Add your first task to get started.');
        }
    }

    // Attach event listeners to UI elements
    bindEvents() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');

        // Add task when button is clicked
        addTaskBtn.addEventListener('click', () => this.addTask());

        // Add task when Enter key is pressed in input field
        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // FEATURE 4 ADDITION: Bind search and filter events
        this.bindSearchAndFilters();

        // Focus on input when page loads for better UX
        taskInput.focus();
    }

    // FEATURE 4 ADDITION: Bind all search and filter event listeners
    bindSearchAndFilters() {
        // Search input
        const searchInput = document.getElementById('searchInput');
        searchInput.addEventListener('input', (e) => {
            this.searchQuery = e.target.value;
            this.applyFiltersAndRender();
        });

        // Filter controls
        document.getElementById('statusFilter').addEventListener('change', (e) => {
            this.statusFilter = e.target.value;
            this.applyFiltersAndRender();
        });

        document.getElementById('sortOption').addEventListener('change', (e) => {
            this.sortOption = e.target.value;
            this.applyFiltersAndRender();
        });

        document.getElementById('createdFilter').addEventListener('change', (e) => {
            this.createdFilter = e.target.value;
            this.applyFiltersAndRender();
        });

        document.getElementById('lengthFilter').addEventListener('change', (e) => {
            this.lengthFilter = e.target.value;
            this.applyFiltersAndRender();
        });

        // Clear filters button
        document.getElementById('clearFiltersBtn').addEventListener('click', () => {
            this.clearAllFilters();
        });

        // Advanced panel toggle
        document.getElementById('advancedToggle').addEventListener('click', () => {
            this.toggleAdvancedPanel();
        });
    }

    // FEATURE 4 ADDITION: Apply all filters and re-render tasks
    applyFiltersAndRender() {
        this.renderTasks();
        this.updateStats();
        this.updateSearchResults();
    }

    // FEATURE 4 ADDITION: Clear all search and filter options
    clearAllFilters() {
        this.searchQuery = '';
        this.statusFilter = 'all';
        this.sortOption = 'newest';
        this.createdFilter = 'all';
        this.lengthFilter = 'all';

        // Reset UI elements
        document.getElementById('searchInput').value = '';
        document.getElementById('statusFilter').value = 'all';
        document.getElementById('sortOption').value = 'newest';
        document.getElementById('createdFilter').value = 'all';
        document.getElementById('lengthFilter').value = 'all';

        this.applyFiltersAndRender();
        this.showNotification('Filters cleared', 'info');
    }

    // FEATURE 4 ADDITION: Toggle advanced filters panel
    toggleAdvancedPanel() {
        this.advancedPanelOpen = !this.advancedPanelOpen;
        const panel = document.getElementById('advancedPanel');
        const toggleIcon = document.querySelector('.toggle-icon');

        if (this.advancedPanelOpen) {
            panel.classList.add('open');
            toggleIcon.textContent = '▲';
        } else {
            panel.classList.remove('open');
            toggleIcon.textContent = '▼';
        }
    }

    // FEATURE 4 ADDITION: Check if task matches search query
    matchesSearch(task) {
        if (!this.searchQuery) return true;
        const query = this.searchQuery.toLowerCase();
        return task.text.toLowerCase().includes(query);
    }

    // FEATURE 4 ADDITION: Check if task matches status filter
    matchesStatusFilter(task) {
        switch (this.statusFilter) {
            case 'completed':
                return task.completed;
            case 'pending':
                return !task.completed;
            default:
                return true;
        }
    }

    // FEATURE 4 ADDITION: Check if task matches created date filter
    matchesCreatedFilter(task) {
        if (this.createdFilter === 'all') return true;

        const taskDate = new Date(task.createdAt);
        const now = new Date();

        switch (this.createdFilter) {
            case 'today':
                return taskDate.toDateString() === now.toDateString();
            case 'yesterday':
                const yesterday = new Date(now);
                yesterday.setDate(yesterday.getDate() - 1);
                return taskDate.toDateString() === yesterday.toDateString();
            case 'this-week':
                const weekStart = new Date(now);
                weekStart.setDate(now.getDate() - now.getDay());
                weekStart.setHours(0, 0, 0, 0);
                return taskDate >= weekStart;
            case 'this-month':
                return taskDate.getMonth() === now.getMonth() &&
                       taskDate.getFullYear() === now.getFullYear();
            default:
                return true;
        }
    }

    // FEATURE 4 ADDITION: Check if task matches length filter
    matchesLengthFilter(task) {
        const length = task.text.length;
        switch (this.lengthFilter) {
            case 'short':
                return length < 20;
            case 'medium':
                return length >= 20 && length <= 50;
            case 'long':
                return length > 50;
            default:
                return true;
        }
    }

    // FEATURE 4 ADDITION: Get filtered and sorted tasks
    getFilteredTasks() {
        return this.tasks
            .filter(task =>
                this.matchesSearch(task) &&
                this.matchesStatusFilter(task) &&
                this.matchesCreatedFilter(task) &&
                this.matchesLengthFilter(task)
            )
            .sort((a, b) => this.sortTasks(a, b));
    }

    // FEATURE 4 ADDITION: Sort tasks based on current sort option
    sortTasks(a, b) {
        switch (this.sortOption) {
            case 'oldest':
                return new Date(a.createdAt) - new Date(b.createdAt);
            case 'alphabetical':
                return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
            case 'reverse-alphabetical':
                return b.text.toLowerCase().localeCompare(a.text.toLowerCase());
            default: // 'newest'
                return new Date(b.createdAt) - new Date(a.createdAt);
        }
    }

    // FEATURE 4 ADDITION: Highlight search terms in text
    highlightSearchTerm(text) {
        if (!this.searchQuery) return this.escapeHtml(text);

        const escapedText = this.escapeHtml(text);
        const escapedQuery = this.escapeHtml(this.searchQuery);
        const regex = new RegExp(`(${escapedQuery})`, 'gi');
        return escapedText.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    // FEATURE 4 ADDITION: Update search results summary
    updateSearchResults() {
        const searchResults = document.getElementById('searchResults');
        const filteredTasks = this.getFilteredTasks();
        const totalTasks = this.tasks.length;

        if (this.hasActiveFilters()) {
            searchResults.textContent = `${filteredTasks.length} of ${totalTasks} tasks shown`;
            searchResults.style.display = 'inline';
        } else {
            searchResults.style.display = 'none';
        }
    }

    // FEATURE 4 ADDITION: Check if any filters are active
    hasActiveFilters() {
        return this.searchQuery !== '' ||
               this.statusFilter !== 'all' ||
               this.sortOption !== 'newest' ||
               this.createdFilter !== 'all' ||
               this.lengthFilter !== 'all';
    }

    // Create a new task and add it to the task list
    addTask() {
        const taskInput = document.getElementById('taskInput');
        const taskText = taskInput.value.trim();

        // Validate input - don't allow empty tasks
        if (taskText === '') {
            this.showNotification('Please enter a task description', 'warning');
            taskInput.focus();
            return;
        }

        // Create new task object with metadata
        const newTask = {
            id: this.taskIdCounter++, // Unique identifier
            text: taskText, // Task description
            completed: false, // Completion status
            createdAt: new Date().toISOString(), // Creation timestamp
            completedAt: null // Completion timestamp (null until completed)
        };

        // Add task to array and update UI/storage
        this.tasks.push(newTask);
        this.saveTasks(); // Persist to localStorage
        this.renderTasks(); // Update task display
        this.updateStats(); // Update statistics

        // Clear input and refocus for next task
        taskInput.value = '';
        taskInput.focus();

        this.showNotification('Task added successfully!', 'success');
    }

    // Delete a task after user confirmation
    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            // Remove task from array by filtering out the target ID
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks(); // Update localStorage
            this.renderTasks(); // Refresh task display
            this.updateStats(); // Update statistics
            this.showNotification('Task deleted successfully!', 'success');
        }
    }

    // Toggle task completion status between completed and pending
    toggleTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            // Toggle completion status
            task.completed = !task.completed;
            // Set completion timestamp or clear it
            task.completedAt = task.completed ? new Date().toISOString() : null;

            this.saveTasks(); // Persist changes
            this.renderTasks(); // Update UI
            this.updateStats(); // Update statistics

            // Show appropriate feedback message
            const message = task.completed ? 'Task completed! 🎉' : 'Task marked as pending';
            this.showNotification(message, 'success');
        }
    }

    // Edit an existing task's text content
    editTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            // Prompt user for new task text with current text as default
            const newText = prompt('Edit task:', task.text);

            // Only update if user provided valid text
            if (newText !== null && newText.trim() !== '') {
                task.text = newText.trim();
                this.saveTasks(); // Persist changes
                this.renderTasks(); // Update display
                this.showNotification('Task updated successfully!', 'success');
            }
        }
    }

    // Render all tasks in the UI with proper sorting and styling
    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        const noResultsState = document.getElementById('noResultsState'); // FEATURE 4 ADDITION

        // FEATURE 4 ADDITION: Use filtered tasks
        const filteredTasks = this.getFilteredTasks();

        // Show appropriate state based on tasks and filters
        if (this.tasks.length === 0) {
            // No tasks at all
            tasksList.style.display = 'none';
            emptyState.style.display = 'block';
            noResultsState.style.display = 'none'; // FEATURE 4 ADDITION
            return;
        } else if (filteredTasks.length === 0) {
            // FEATURE 4 ADDITION: No tasks match filters
            tasksList.style.display = 'none';
            emptyState.style.display = 'none';
            noResultsState.style.display = 'block';
            return;
        }

        // Show task list and hide empty states
        tasksList.style.display = 'flex';
        emptyState.style.display = 'none';
        noResultsState.style.display = 'none'; // FEATURE 4 ADDITION

        // Generate HTML for each task with interactive elements
        tasksList.innerHTML = filteredTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''}" data-task-id="${task.id}">
                <div class="task-content">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}"
                         onclick="taskFlow.toggleTask(${task.id})">
                    </div>
                    <span class="task-text">${this.highlightSearchTerm(task.text)}</span>
                </div>
                <div class="task-actions">
                    <button class="task-btn edit-btn" onclick="taskFlow.editTask(${task.id})" title="Edit task">
                        ✏️
                    </button>
                    <button class="task-btn delete-btn" onclick="taskFlow.deleteTask(${task.id})" title="Delete task">
                        🗑️
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Update statistics display with current task counts
    updateStats() {
        // FEATURE 4 ADDITION: Use filtered tasks for display
        const filteredTasks = this.getFilteredTasks();
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        const filteredCount = filteredTasks.length; // FEATURE 4 ADDITION

        // Update statistics counters in the UI
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('filteredTasks').textContent = filteredCount; // FEATURE 4 ADDITION

        // Update task count in header with proper singular/plural handling
        const taskCount = document.getElementById('taskCount');
        taskCount.textContent = `${filteredCount} ${filteredCount === 1 ? 'task' : 'tasks'}`;

        // FEATURE 4 ADDITION: Update search results
        this.updateSearchResults();
    }

    // Save tasks and counter to localStorage with error handling
    saveTasks() {
        try {
            // Persist tasks array and ID counter to browser storage
            localStorage.setItem('taskflow_tasks', JSON.stringify(this.tasks));
            localStorage.setItem('taskflow_counter', this.taskIdCounter.toString());
        } catch (error) {
            console.error('Failed to save tasks:', error);
            this.showNotification('Failed to save tasks. Please check your browser storage.', 'error');
        }
    }

    // Load tasks from localStorage with error handling
    loadTasks() {
        try {
            const saved = localStorage.getItem('taskflow_tasks');
            // Parse saved tasks or return empty array if none exist
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Failed to load tasks:', error);
            return []; // Return empty array on error to prevent app crash
        }
    }

    // Get the next available task ID from localStorage
    getNextTaskId() {
        try {
            const saved = localStorage.getItem('taskflow_counter');
            // Parse saved counter or start from 1 if none exists
            return saved ? parseInt(saved) : 1;
        } catch (error) {
            console.error('Failed to load task counter:', error);
            return 1; // Default to 1 on error
        }
    }

    // Escape HTML characters to prevent XSS attacks
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")   // Must be first to avoid double-escaping
            .replace(/</g, "&lt;")    // Less than
            .replace(/>/g, "&gt;")    // Greater than
            .replace(/"/g, "&quot;")  // Double quotes
            .replace(/'/g, "&#039;"); // Single quotes
    }

    // Display toast notifications to provide user feedback
    showNotification(message, type = 'info') {
        // Log to console for debugging
        console.log(`[${type.toUpperCase()}] ${message}`);

        // Create notification element with inline styles
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            opacity: 0;
            transform: translateY(-20px);
            transition: all 0.3s ease;
            max-width: 300px;
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        `;

        // Color scheme for different notification types
        const colors = {
            success: '#48bb78',  // Green for success
            error: '#e53e3e',    // Red for errors
            warning: '#ed8936',  // Orange for warnings
            info: '#3182ce'      // Blue for info
        };

        // Apply color and content
        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in with delay for smooth transition
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);

        // Auto-remove after 3 seconds with fade out animation
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Export all tasks to a JSON file for backup purposes
    exportTasks() {
        // Convert tasks to formatted JSON string
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);

        // Create temporary download link and trigger download
        const link = document.createElement('a');
        link.href = url;
        link.download = 'taskflow_backup.json';
        link.click();

        // Clean up object URL to prevent memory leaks
        URL.revokeObjectURL(url);
        this.showNotification('Tasks exported successfully!', 'success');
    }

    // Clear all tasks after user confirmation (destructive action)
    clearAllTasks() {
        if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone.')) {
            this.tasks = []; // Empty the tasks array
            this.saveTasks(); // Persist the empty state
            this.renderTasks(); // Update UI to show empty state
            this.updateStats(); // Reset statistics
            this.showNotification('All tasks cleared!', 'success');
        }
    }

    // Calculate detailed statistics about tasks for analytics
    getTaskStats() {
        const now = new Date();
        const filteredTasks = this.getFilteredTasks(); // FEATURE 4 ADDITION

        const stats = {
            total: this.tasks.length,
            completed: this.tasks.filter(t => t.completed).length,
            pending: this.tasks.filter(t => !t.completed).length,
            // FEATURE 4 ADDITION: Filtered results stats
            filtered: filteredTasks.length,
            searchQuery: this.searchQuery,
            activeFilters: this.hasActiveFilters(),
            // Tasks created today
            createdToday: this.tasks.filter(t => {
                const taskDate = new Date(t.createdAt);
                return taskDate.toDateString() === now.toDateString();
            }).length,
            // Tasks completed today
            completedToday: this.tasks.filter(t => {
                if (!t.completedAt) return false;
                const completedDate = new Date(t.completedAt);
                return completedDate.toDateString() === now.toDateString();
            }).length
        };
        return stats;
    }
}

// Initialize the TaskFlow application when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    // Create global instance for access from inline event handlers
    window.taskFlow = new TaskFlow();
});

// Export TaskFlow class for Node.js testing environments
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskFlow;
}
