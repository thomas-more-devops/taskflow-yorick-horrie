class TaskFlow {
    constructor() {
        this.tasks = this.loadTasks();
        this.taskIdCounter = this.getNextTaskId();

        // Filter and search state
        this.currentFilter = 'all';
        this.currentCategoryFilter = 'all';
        this.currentSort = 'priority';
        this.currentSearch = '';

        // Categories configuration
        this.categories = {
            work: { name: 'Work', icon: '💼', color: '#3182ce' },
            personal: { name: 'Personal', icon: '🏠', color: '#805ad5' },
            shopping: { name: 'Shopping', icon: '🛒', color: '#38a169' },
            health: { name: 'Health', icon: '🏥', color: '#e53e3e' },
            study: { name: 'Study', icon: '📚', color: '#d69e2e' }
        };

        this.initializeApp();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
    }

    initializeApp() {
        console.log('TaskFlow Complete System initialized!');
        this.showWelcomeMessage();
        this.setDefaultDate();
    }

    showWelcomeMessage() {
        if (this.tasks.length === 0) {
            console.log('Welcome to TaskFlow! Complete task management with priorities, categories, due dates, and search.');
        }
    }

    setDefaultDate() {
        // Set default due date to tomorrow
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        document.getElementById('dueDateInput').value = tomorrow.toISOString().split('T')[0];
    }

    bindEvents() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');
        const searchInput = document.getElementById('searchInput');
        const clearSearch = document.getElementById('clearSearch');
        const filterButtons = document.querySelectorAll('.filter-btn');
        const categoryFilterButtons = document.querySelectorAll('.category-filter-btn');
        const sortSelect = document.getElementById('sortSelect');
        const toggleAdvanced = document.getElementById('toggleAdvanced');
        const clearAllFilters = document.getElementById('clearAllFilters');

        // Task input events
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

        // Category filter buttons
        categoryFilterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.setCategoryFilter(category);
            });
        });

        // Sort selection
        sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderTasks();
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

    // Task Management Methods
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

        // Reset form
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

    // Filtering Methods
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

    setCategoryFilter(category) {
        this.currentCategoryFilter = category;

        // Update button states
        document.querySelectorAll('.category-filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

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
        this.currentCategoryFilter = 'all';
        this.currentSearch = '';
        this.currentSort = 'priority';

        // Reset UI
        document.getElementById('searchInput').value = '';
        document.getElementById('clearSearch').style.display = 'none';
        document.getElementById('sortSelect').value = 'priority';

        // Reset button states
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-filter="all"]').classList.add('active');

        document.querySelectorAll('.category-filter-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelector('[data-category="all"]').classList.add('active');

        this.renderTasks();
        this.updateSearchResults();
        this.showNotification('All filters cleared!', 'info');
    }

    // Utility Methods for Task Analysis
    getPriorityValue(priority) {
        const values = { high: 3, medium: 2, low: 1 };
        return values[priority] || 2;
    }

    isOverdue(task) {
        if (!task.dueDate || task.completed) return false;
        const today = new Date();
        const dueDate = new Date(task.dueDate);
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    }

    isDueToday(task) {
        if (!task.dueDate) return false;
        const today = new Date();
        const dueDate = new Date(task.dueDate);
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === today.getTime();
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
            case 'high-priority':
                return task.priority === 'high' && !task.completed;
            case 'due-today':
                return this.isDueToday(task) && !task.completed;
            case 'overdue':
                return this.isOverdue(task);
            default:
                return true;
        }
    }

    matchesCategoryFilter(task) {
        if (this.currentCategoryFilter === 'all') return true;
        return task.category === this.currentCategoryFilter;
    }

    getFilteredTasks() {
        return this.tasks.filter(task =>
            this.matchesSearch(task) &&
            this.matchesFilter(task) &&
            this.matchesCategoryFilter(task)
        );
    }

    sortTasks(tasks) {
        const tasksCopy = [...tasks];

        switch (this.currentSort) {
            case 'priority':
                return tasksCopy.sort((a, b) => {
                    if (a.completed !== b.completed) {
                        return a.completed - b.completed;
                    }
                    return this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority);
                });

            case 'due-date':
                return tasksCopy.sort((a, b) => {
                    if (a.completed !== b.completed) {
                        return a.completed - b.completed;
                    }
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });

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

            default:
                return tasksCopy;
        }
    }

    // Rendering Methods
    highlightSearchTerm(text) {
        if (!this.currentSearch) return this.escapeHtml(text);

        const escapedText = this.escapeHtml(text);
        const searchTerm = this.escapeHtml(this.currentSearch);
        const regex = new RegExp(`(${searchTerm})`, 'gi');

        return escapedText.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    getDueDateDisplay(task) {
        if (!task.dueDate) {
            return '📋 No due date';
        }

        const today = new Date();
        const dueDate = new Date(task.dueDate);
        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (this.isOverdue(task)) {
            const overdueDays = Math.abs(diffDays);
            return `⚠️ ${overdueDays} day${overdueDays === 1 ? '' : 's'} overdue`;
        } else if (this.isDueToday(task)) {
            return '🔥 Due today';
        } else if (diffDays === 1) {
            return '⏰ Due tomorrow';
        } else if (diffDays <= 7) {
            return `📅 Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
        } else {
            return `📅 Due ${this.formatDate(task.dueDate)}`;
        }
    }

    getPriorityIcon(priority) {
        const icons = { high: '🔥', medium: '⚡', low: '🌱' };
        return icons[priority] || '⚡';
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
            const isOverdue = this.isOverdue(task);
            const isDueToday = this.isDueToday(task);
            const dueDateClass = isOverdue ? 'overdue' : isDueToday ? 'due-today' : '';

            return `
                <div class="task-item ${task.completed ? 'completed' : ''} priority-${task.priority} category-${task.category} ${dueDateClass}" data-task-id="${task.id}">
                    <div class="task-content">
                        <div class="task-checkbox ${task.completed ? 'checked' : ''}"
                             onclick="taskFlow.toggleTask(${task.id})">
                        </div>
                        <div class="task-info">
                            <span class="task-text">${this.highlightSearchTerm(task.text)}</span>
                            <div class="task-meta">
                                <span class="priority-badge priority-${task.priority}">
                                    ${this.getPriorityIcon(task.priority)} ${task.priority}
                                </span>
                                <span class="category-badge category-${task.category}">
                                    ${this.categories[task.category].icon} ${this.categories[task.category].name}
                                </span>
                                <span class="due-date-badge ${dueDateClass}">
                                    ${this.getDueDateDisplay(task)}
                                </span>
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
               this.currentCategoryFilter !== 'all' ||
               this.currentSort !== 'priority';
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    }

    // Statistics Methods
    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        const highPriorityTasks = this.tasks.filter(task => task.priority === 'high' && !task.completed).length;
        const overdueTasks = this.tasks.filter(task => this.isOverdue(task)).length;
        const usedCategories = new Set(this.tasks.map(task => task.category));

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('highPriorityTasks').textContent = highPriorityTasks;
        document.getElementById('overdueTasks').textContent = overdueTasks;
        document.getElementById('categoriesUsed').textContent = usedCategories.size;

        // Update task count in header
        const filteredTasks = this.getFilteredTasks();
        const taskCount = document.getElementById('taskCount');
        taskCount.textContent = `${filteredTasks.length} of ${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`;

        this.updateCategoryBreakdown();
        this.updateDueDateBreakdown();
    }

    updateCategoryBreakdown() {
        const categoryStats = document.getElementById('categoryStats');
        const categoryBreakdown = {};

        // Initialize all categories
        Object.keys(this.categories).forEach(cat => {
            categoryBreakdown[cat] = { total: 0, completed: 0 };
        });

        // Count tasks by category
        this.tasks.forEach(task => {
            if (categoryBreakdown[task.category]) {
                categoryBreakdown[task.category].total++;
                if (task.completed) {
                    categoryBreakdown[task.category].completed++;
                }
            }
        });

        const statsHTML = Object.keys(this.categories)
            .filter(cat => categoryBreakdown[cat].total > 0)
            .map(cat => {
                const stats = categoryBreakdown[cat];
                const percentage = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0;

                return `
                    <div class="category-stat-item category-${cat}">
                        <div class="category-info">
                            <span class="category-icon">${this.categories[cat].icon}</span>
                            <span class="category-name">${this.categories[cat].name}</span>
                        </div>
                        <div class="category-numbers">
                            <span class="category-count">${stats.completed}/${stats.total}</span>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${percentage}%"></div>
                            </div>
                            <span class="category-percentage">${percentage}%</span>
                        </div>
                    </div>
                `;
            }).join('');

        categoryStats.innerHTML = statsHTML || '<p class="no-stats">No tasks yet. Add some tasks to see category breakdown!</p>';
    }

    updateDueDateBreakdown() {
        const dueDateStats = document.getElementById('dueDateStats');

        const today = this.tasks.filter(t => this.isDueToday(t) && !t.completed).length;
        const overdue = this.tasks.filter(t => this.isOverdue(t)).length;
        const upcoming = this.tasks.filter(t => {
            if (!t.dueDate || t.completed) return false;
            const dueDate = new Date(t.dueDate);
            const todayDate = new Date();
            const weekFromNow = new Date();
            weekFromNow.setDate(todayDate.getDate() + 7);
            return dueDate > todayDate && dueDate <= weekFromNow;
        }).length;
        const noDate = this.tasks.filter(t => !t.dueDate && !t.completed).length;

        const stats = [
            { label: 'Due Today', count: today, icon: '🔥', class: 'due-today' },
            { label: 'Overdue', count: overdue, icon: '⚠️', class: 'overdue' },
            { label: 'Due This Week', count: upcoming, icon: '📅', class: 'upcoming' },
            { label: 'No Due Date', count: noDate, icon: '📋', class: 'no-date' }
        ];

        const statsHTML = stats
            .filter(stat => stat.count > 0)
            .map(stat => `
                <div class="due-date-stat-item ${stat.class}">
                    <div class="stat-info">
                        <span class="stat-icon">${stat.icon}</span>
                        <span class="stat-name">${stat.label}</span>
                    </div>
                    <div class="stat-count">${stat.count}</div>
                </div>
            `).join('');

        dueDateStats.innerHTML = statsHTML || '<p class="no-stats">All tasks have optimal due dates!</p>';
    }

    // Storage Methods
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
            // Ensure all tasks have all required properties (for backward compatibility)
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

    // Utility Methods
    escapeHtml(unsafe) {
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    showNotification(message, type = 'info') {
        console.log(`[${type.toUpperCase()}] ${message}`);

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

        const colors = {
            success: '#48bb78',
            error: '#e53e3e',
            warning: '#ed8936',
            info: '#3182ce'
        };

        notification.style.background = colors[type] || colors.info;
        notification.textContent = message;

        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.opacity = '1';
            notification.style.transform = 'translateY(0)';
        }, 100);

        setTimeout(() => {
            notification.style.opacity = '0';
            notification.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }, 3000);
    }

    // Export/Import Methods (bonus features)
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
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.taskFlow = new TaskFlow();
});

// Export for potential testing
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TaskFlow;
}