class TaskFlow {
    constructor() {
        this.tasks = this.loadTasks();
        this.taskIdCounter = this.getNextTaskId();
        this.currentFilter = 'all';
        this.currentSort = 'created-desc';
        this.currentSearch = '';
        this.currentLengthFilter = 'all';
        this.initializeApp();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
    }

    initializeApp() {
        console.log('TaskFlow initialized with Search & Filter System!');
        this.showWelcomeMessage();
        this.setDefaultDate();
    }

    setDefaultDate() {
        // Set default due date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('dueDateInput').value = tomorrow.toISOString().split('T')[0];
    }

    showWelcomeMessage() {
        if (this.tasks.length === 0) {
            console.log('Welcome to TaskFlow! Search and filter your tasks efficiently.');
        }
    }

    bindEvents() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');
        const searchInput = document.getElementById('searchInput');
        const clearSearch = document.getElementById('clearSearch');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const sortSelect = document.getElementById('sortSelect');
        const lengthButtons = document.querySelectorAll('.length-btn');
        const toggleAdvanced = document.getElementById('toggleAdvanced');
        const clearAllFilters = document.getElementById('clearAllFilters');

        addTaskBtn.addEventListener('click', () => this.addTask());

        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Search functionality
        searchInput.addEventListener('input', (e) => {
            this.currentSearch = e.target.value.toLowerCase();
            clearSearch.style.display = this.currentSearch ? 'block' : 'none';
            this.renderTasks();
            this.updateSearchResults();
        });

        clearSearch.addEventListener('click', () => {
            searchInput.value = '';
            this.currentSearch = '';
            clearSearch.style.display = 'none';
            this.renderTasks();
            this.updateSearchResults();
        });

        // Quick filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const filter = e.currentTarget.dataset.filter;
                this.setFilter(filter);
            });
        });

        // Sort selection
        sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderTasks();
        });

        // Length filter buttons
        lengthButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const length = e.currentTarget.dataset.length;
                this.setLengthFilter(length);
            });
        });

        // Advanced filters toggle
        toggleAdvanced.addEventListener('click', () => {
            this.toggleAdvancedFilters();
        });

        // Clear all filters
        clearAllFilters.addEventListener('click', () => {
            this.clearAllFilters();
        });

        // Focus on input when page loads
        taskInput.focus();
    }

    setFilter(filter) {
        this.currentFilter = filter;

        // Update button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        this.renderTasks();
        this.updateSearchResults();
    }

    setLengthFilter(length) {
        this.currentLengthFilter = length;

        // Update button states
        document.querySelectorAll('.length-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-length="${length}"]`).classList.add('active');

        this.renderTasks();
        this.updateSearchResults();
    }

    toggleAdvancedFilters() {
        const panel = document.getElementById('advancedPanel');
        const toggleIcon = document.querySelector('.toggle-icon');

        if (panel.style.display === 'none' || !panel.style.display) {
            panel.style.display = 'block';
            toggleIcon.textContent = '▲';
        } else {
            panel.style.display = 'none';
            toggleIcon.textContent = '▼';
        }
    }

    clearAllFilters() {
        // Reset all filters
        this.currentFilter = 'all';
        this.currentSearch = '';
        this.currentLengthFilter = 'all';
        this.currentSort = 'created-desc';

        // Reset UI
        document.getElementById('searchInput').value = '';
        document.getElementById('clearSearch').style.display = 'none';
        document.getElementById('sortSelect').value = 'created-desc';

        // Reset button states
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-filter="all"]').classList.add('active');

        document.querySelectorAll('.length-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-length="all"]').classList.add('active');

        this.renderTasks();
        this.updateSearchResults();
        this.showNotification('All filters cleared!', 'info');
    }

    addTask() {
        const taskInput = document.getElementById('taskInput');
        const prioritySelect = document.getElementById('prioritySelect');
        const categorySelect = document.getElementById('categorySelect');
        const dueDateInput = document.getElementById('dueDateInput');
        const taskText = taskInput.value.trim();
        const priority = prioritySelect.value;
        const category = categorySelect.value;
        const dueDate = dueDateInput.value;

        if (taskText === '') {
            this.showNotification('Please enter a task description', 'warning');
            taskInput.focus();
            return;
        }

        const newTask = {
            id: this.taskIdCounter++,
            text: taskText,
            priority: priority,
            category: category,
            dueDate: dueDate || null,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.push(newTask);
        this.saveTasks();
        this.renderTasks();
        this.updateStats();
        this.updateSearchResults();

        taskInput.value = '';
        prioritySelect.value = 'medium';
        categorySelect.value = 'personal';
        this.setDefaultDate();
        taskInput.focus();

        this.showNotification('Task added successfully!', 'success');
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.updateSearchResults();
            this.showNotification('Task deleted successfully!', 'success');
        }
    }

    toggleTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.updateSearchResults();

            const message = task.completed ? 'Task completed! 🎉' : 'Task marked as pending';
            this.showNotification(message, 'success');
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            const newText = prompt('Edit task:', task.text);
            if (newText !== null && newText.trim() !== '') {
                task.text = newText.trim();
                this.saveTasks();
                this.renderTasks();
                this.updateStats();
                this.updateSearchResults();
                this.showNotification('Task updated successfully!', 'success');
            }
        }
    }

    getTaskLength(task) {
        const length = task.text.length;
        if (length <= 20) return 'short';
        if (length <= 50) return 'medium';
        return 'long';
    }

    matchesSearch(task) {
        if (!this.currentSearch) return true;
        return task.text.toLowerCase().includes(this.currentSearch);
    }

    matchesFilter(task) {
        switch (this.currentFilter) {
            case 'all':
                return true;
            case 'completed':
                return task.completed;
            case 'pending':
                return !task.completed;
            case 'recent':
                const oneDayAgo = new Date();
                oneDayAgo.setDate(oneDayAgo.getDate() - 1);
                return new Date(task.createdAt) > oneDayAgo;
            default:
                return true;
        }
    }

    matchesLengthFilter(task) {
        if (this.currentLengthFilter === 'all') return true;
        return this.getTaskLength(task) === this.currentLengthFilter;
    }

    getFilteredTasks() {
        return this.tasks.filter(task =>
            this.matchesSearch(task) &&
            this.matchesFilter(task) &&
            this.matchesLengthFilter(task)
        );
    }

    sortTasks(tasks) {
        const tasksCopy = [...tasks];

        switch (this.currentSort) {
            case 'created-desc':
                return tasksCopy.sort((a, b) => {
                    if (a.completed !== b.completed) {
                        return a.completed - b.completed;
                    }
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

            case 'created-asc':
                return tasksCopy.sort((a, b) => {
                    if (a.completed !== b.completed) {
                        return a.completed - b.completed;
                    }
                    return new Date(a.createdAt) - new Date(b.createdAt);
                });

            case 'alphabetical':
                return tasksCopy.sort((a, b) => {
                    if (a.completed !== b.completed) {
                        return a.completed - b.completed;
                    }
                    return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
                });

            case 'length':
                return tasksCopy.sort((a, b) => {
                    if (a.completed !== b.completed) {
                        return a.completed - b.completed;
                    }
                    return a.text.length - b.text.length;
                });

            default:
                return tasksCopy;
        }
    }

    highlightSearchTerm(text) {
        if (!this.currentSearch) return this.escapeHtml(text);

        const escapedText = this.escapeHtml(text);
        const searchTerm = this.escapeHtml(this.currentSearch);
        const regex = new RegExp(`(${searchTerm})`, 'gi');

        return escapedText.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            tasksList.style.display = 'none';
            emptyState.style.display = 'block';

            this.updateEmptyStateMessage();
            return;
        }

        tasksList.style.display = 'flex';
        emptyState.style.display = 'none';

        const sortedTasks = this.sortTasks(filteredTasks);

        tasksList.innerHTML = sortedTasks.map(task => {
            const lengthClass = this.getTaskLength(task);

            return `
                <div class="task-item ${task.completed ? 'completed' : ''} length-${lengthClass}" data-task-id="${task.id}">
                    <div class="task-content">
                        <div class="task-checkbox ${task.completed ? 'checked' : ''}"
                             onclick="taskFlow.toggleTask(${task.id})">
                        </div>
                        <div class="task-info">
                            <span class="task-text">${this.highlightSearchTerm(task.text)}</span>
                            <div class="task-meta">
                                <span class="length-badge length-${lengthClass}">
                                    ${this.getLengthIcon(lengthClass)} ${this.getLengthLabel(lengthClass)}
                                </span>
                                <span class="task-date">${this.formatDate(task.createdAt)}</span>
                                <span class="task-length">${task.text.length} chars</span>
                            </div>
                        </div>
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
            `;
        }).join('');
    }

    getLengthIcon(length) {
        const icons = {
            short: '📝',
            medium: '📄',
            long: '📋'
        };
        return icons[length] || '📝';
    }

    getLengthLabel(length) {
        const labels = {
            short: 'Short',
            medium: 'Medium',
            long: 'Long'
        };
        return labels[length] || 'Short';
    }

    updateEmptyStateMessage() {
        const emptyState = document.getElementById('emptyState');

        if (this.tasks.length === 0) {
            emptyState.innerHTML = `
                <div class="empty-icon">✨</div>
                <h3>No tasks yet</h3>
                <p>Add your first task above to get started!</p>
            `;
        } else if (this.currentSearch) {
            emptyState.innerHTML = `
                <div class="empty-icon">🔍</div>
                <h3>No tasks found</h3>
                <p>No tasks match your search for "${this.currentSearch}".</p>
            `;
        } else {
            emptyState.innerHTML = `
                <div class="empty-icon">🎯</div>
                <h3>No tasks match your filters</h3>
                <p>Try adjusting your filters or search terms.</p>
            `;
        }
    }

    updateSearchResults() {
        const searchResults = document.getElementById('searchResults');
        const filteredTasks = this.getFilteredTasks();

        let resultText = '';

        if (this.currentSearch) {
            resultText = `Found ${filteredTasks.length} result${filteredTasks.length === 1 ? '' : 's'} for "${this.currentSearch}"`;
        } else if (this.hasActiveFilters()) {
            resultText = `${filteredTasks.length} task${filteredTasks.length === 1 ? '' : 's'} match your filters`;
        }

        searchResults.textContent = resultText;
        searchResults.style.display = resultText ? 'inline' : 'none';
    }

    hasActiveFilters() {
        return this.currentFilter !== 'all' ||
               this.currentLengthFilter !== 'all' ||
               this.currentSort !== 'created-desc';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        const filteredTasks = this.getFilteredTasks().length;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('filteredTasks').textContent = filteredTasks;

        // Update task count in header
        const taskCount = document.getElementById('taskCount');
        taskCount.textContent = `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`;

        this.updateAnalytics();
    }

    updateAnalytics() {
        const analytics = document.getElementById('taskAnalytics');

        const shortTasks = this.tasks.filter(t => this.getTaskLength(t) === 'short').length;
        const mediumTasks = this.tasks.filter(t => this.getTaskLength(t) === 'medium').length;
        const longTasks = this.tasks.filter(t => this.getTaskLength(t) === 'long').length;

        const recentTasks = this.tasks.filter(t => {
            const oneDayAgo = new Date();
            oneDayAgo.setDate(oneDayAgo.getDate() - 1);
            return new Date(t.createdAt) > oneDayAgo;
        }).length;

        const avgLength = this.tasks.length > 0
            ? Math.round(this.tasks.reduce((sum, t) => sum + t.text.length, 0) / this.tasks.length)
            : 0;

        const analyticsData = [
            { label: 'Short Tasks', value: shortTasks, icon: '📝' },
            { label: 'Medium Tasks', value: mediumTasks, icon: '📄' },
            { label: 'Long Tasks', value: longTasks, icon: '📋' },
            { label: 'Recent Tasks', value: recentTasks, icon: '🆕' },
            { label: 'Avg. Length', value: `${avgLength} chars`, icon: '📏' }
        ];

        const analyticsHTML = analyticsData
            .filter(item => typeof item.value === 'number' ? item.value > 0 : true)
            .map(item => `
                <div class="analytics-item">
                    <span class="analytics-icon">${item.icon}</span>
                    <span class="analytics-label">${item.label}</span>
                    <span class="analytics-value">${item.value}</span>
                </div>
            `).join('');

        analytics.innerHTML = analyticsHTML || '<p class="no-analytics">Add some tasks to see analytics!</p>';
    }

    saveTasks() {
        try {
            localStorage.setItem('taskflow_tasks', JSON.stringify(this.tasks));
            localStorage.setItem('taskflow_counter', this.taskIdCounter.toString());
        } catch (error) {
            console.error('Failed to save tasks:', error);
            this.showNotification('Failed to save tasks. Please check your browser storage.', 'error');
        }
    }

    loadTasks() {
        try {
            const saved = localStorage.getItem('taskflow_tasks');
            const tasks = saved ? JSON.parse(saved) : [];
            // Ensure all tasks have required properties (for backward compatibility)
            return tasks.map(task => ({
                ...task,
                priority: task.priority || 'medium',
                category: task.category || 'personal',
                dueDate: task.dueDate || null
            }));
        } catch (error) {
            console.error('Failed to load tasks:', error);
            return [];
        }
    }

    getNextTaskId() {
        try {
            const saved = localStorage.getItem('taskflow_counter');
            return saved ? parseInt(saved) : 1;
        } catch (error) {
            console.error('Failed to load task counter:', error);
            return 1;
        }
    }

    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showNotification(message, type = 'info') {
        // Simple notification system
        console.log(`[${type.toUpperCase()}] ${message}`);

        // Create notification element
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

        // Set color based on type
        const colors = {
            success: '#48bb78',
            error: '#e53e3e',
            warning: '#ed8936',
            info: '#3182ce'
        };

        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        // Animate in
        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);

        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 3000);
    }

    // Utility methods for potential future features
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        const url = URL.createObjectURL(dataBlob);

        const link = document.createElement('a');
        link.href = url;
        link.download = 'taskflow_backup.json';
        link.click();

        URL.revokeObjectURL(url);
        this.showNotification('Tasks exported successfully!', 'success');
    }

    clearAllTasks() {
        if (confirm('Are you sure you want to delete ALL tasks? This cannot be undone.')) {
            this.tasks = [];
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
            this.updateSearchResults();
            this.showNotification('All tasks cleared!', 'success');
        }
    }

    getTaskStats() {
        const now = new Date();
        const stats = {
            total: this.tasks.length,
            completed: this.tasks.filter(t => t.completed).length,
            pending: this.tasks.filter(t => !t.completed).length,
            short: this.tasks.filter(t => this.getTaskLength(t) === 'short').length,
            medium: this.tasks.filter(t => this.getTaskLength(t) === 'medium').length,
            long: this.tasks.filter(t => this.getTaskLength(t) === 'long').length,
            averageLength: this.tasks.length > 0
                ? this.tasks.reduce((sum, t) => sum + t.text.length, 0) / this.tasks.length
                : 0,
            createdToday: this.tasks.filter(t => {
                const taskDate = new Date(t.createdAt);
                return taskDate.toDateString() === now.toDateString();
            }).length,
            completedToday: this.tasks.filter(t => {
                if (!t.completedAt) return false;
                const completedDate = new Date(t.completedAt);
                return completedDate.toDateString() === now.toDateString();
            }).length
        };
        return stats;
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskFlow = new TaskFlow();
});

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskFlow;
}
