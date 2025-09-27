class TaskFlow {
    constructor() {
        this.tasks = this.loadTasks();
        this.taskIdCounter = this.getNextTaskId();
        this.currentFilter = 'all';
        this.currentSort = 'due-date';
        this.initializeApp();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
    }

    initializeApp() {
        console.log('TaskFlow initialized with Due Date System!');
        this.showWelcomeMessage();
        this.setDefaultDate();
    }

    showWelcomeMessage() {
        if (this.tasks.length === 0) {
            console.log('Welcome to TaskFlow! Track your tasks with due dates.');
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
        const filterButtons = document.querySelectorAll('.filter-btn');
        const sortSelect = document.getElementById('sortSelect');

        addTaskBtn.addEventListener('click', () => this.addTask());

        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Date filter buttons
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

        taskInput.value = '';
        prioritySelect.value = 'medium';
        categorySelect.value = 'personal';
        this.setDefaultDate();
        taskInput.focus();

        const dueDateMsg = dueDate ? `due ${this.formatDate(dueDate)}` : 'with no due date';
        this.showNotification(`Task added ${dueDateMsg}!`, 'success');
    }

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== taskId);
            this.saveTasks();
            this.renderTasks();
            this.updateStats();
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

            const message = task.completed ? 'Task completed! 🎉' : 'Task marked as pending';
            this.showNotification(message, 'success');
        }
    }

    editTask(taskId) {
        const task = this.tasks.find(task => task.id === taskId);
        if (task) {
            const newText = prompt('Edit task:', task.text);
            if (newText !== null && newText.trim() !== '') {
                // Also allow editing due date
                const currentDate = task.dueDate || '';
                const newDueDate = prompt('Due date (YYYY-MM-DD) or leave empty:', currentDate);

                // Validate date format or allow empty
                if (newDueDate === '' || this.isValidDate(newDueDate)) {
                    task.dueDate = newDueDate || null;
                }

                task.text = newText.trim();
                this.saveTasks();
                this.renderTasks();
                this.updateStats();
                this.showNotification('Task updated successfully!', 'success');
            }
        }
    }

    isValidDate(dateString) {
        const regex = /^\d{4}-\d{2}-\d{2}$/;
        return regex.test(dateString) && !isNaN(Date.parse(dateString));
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

    isDueTomorrow(task) {
        if (!task.dueDate) return false;
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);
        const dueDate = new Date(task.dueDate);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate.getTime() === tomorrow.getTime();
    }

    isDueThisWeek(task) {
        if (!task.dueDate) return false;
        const today = new Date();
        const weekEnd = new Date();
        weekEnd.setDate(today.getDate() + 7);
        const dueDate = new Date(task.dueDate);

        today.setHours(0, 0, 0, 0);
        weekEnd.setHours(23, 59, 59, 999);
        dueDate.setHours(0, 0, 0, 0);

        return dueDate >= today && dueDate <= weekEnd;
    }

    getFilteredTasks() {
        switch (this.currentFilter) {
            case 'all':
                return this.tasks;
            case 'today':
                return this.tasks.filter(task => this.isDueToday(task));
            case 'tomorrow':
                return this.tasks.filter(task => this.isDueTomorrow(task));
            case 'this-week':
                return this.tasks.filter(task => this.isDueThisWeek(task));
            case 'overdue':
                return this.tasks.filter(task => this.isOverdue(task));
            case 'no-date':
                return this.tasks.filter(task => !task.dueDate);
            default:
                return this.tasks;
        }
    }

    sortTasks(tasks) {
        const tasksCopy = [...tasks];

        switch (this.currentSort) {
            case 'due-date':
                return tasksCopy.sort((a, b) => {
                    // First sort by completion status
                    if (a.completed !== b.completed) {
                        return a.completed - b.completed;
                    }

                    // Handle tasks without due dates (put at end)
                    if (!a.dueDate && !b.dueDate) return 0;
                    if (!a.dueDate) return 1;
                    if (!b.dueDate) return -1;

                    // Sort by due date
                    return new Date(a.dueDate) - new Date(b.dueDate);
                });

            case 'created':
                return tasksCopy.sort((a, b) => {
                    // First sort by completion status
                    if (a.completed !== b.completed) {
                        return a.completed - b.completed;
                    }
                    // Then by creation date (newest first)
                    return new Date(b.createdAt) - new Date(a.createdAt);
                });

            case 'alphabetical':
                return tasksCopy.sort((a, b) => {
                    // First sort by completion status
                    if (a.completed !== b.completed) {
                        return a.completed - b.completed;
                    }
                    // Then alphabetically
                    return a.text.toLowerCase().localeCompare(b.text.toLowerCase());
                });

            default:
                return tasksCopy;
        }
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            tasksList.style.display = 'none';
            emptyState.style.display = 'block';

            // Update empty state message based on filter
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
                <div class="task-item ${task.completed ? 'completed' : ''} ${dueDateClass}" data-task-id="${task.id}">
                    <div class="task-content">
                        <div class="task-checkbox ${task.completed ? 'checked' : ''}"
                             onclick="taskFlow.toggleTask(${task.id})">
                        </div>
                        <div class="task-info">
                            <span class="task-text">${this.escapeHtml(task.text)}</span>
                            <div class="task-meta">
                                <span class="due-date-badge ${dueDateClass}">
                                    ${this.getDueDateDisplay(task)}
                                </span>
                                <span class="task-date">Created: ${this.formatDate(task.createdAt)}</span>
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
        const filterMessages = {
            all: {
                icon: '✨',
                title: 'No tasks yet',
                message: 'Add your first task above to get started!'
            },
            today: {
                icon: '🔥',
                title: 'No tasks due today',
                message: 'Great job! No urgent tasks for today.'
            },
            tomorrow: {
                icon: '⏰',
                title: 'No tasks due tomorrow',
                message: 'Your tomorrow is looking free!'
            },
            'this-week': {
                icon: '📆',
                title: 'No tasks due this week',
                message: 'You\'re all caught up for this week!'
            },
            overdue: {
                icon: '🎉',
                title: 'No overdue tasks',
                message: 'Excellent! You\'re staying on top of your deadlines.'
            },
            'no-date': {
                icon: '❓',
                title: 'No tasks without due dates',
                message: 'All your tasks have due dates assigned!'
            }
        };

        const config = filterMessages[this.currentFilter];
        emptyState.innerHTML = `
            <div class="empty-icon">${config.icon}</div>
            <h3>${config.title}</h3>
            <p>${config.message}</p>
        `;
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
        } else if (this.isDueTomorrow(task)) {
            return '⏰ Due tomorrow';
        } else if (diffDays <= 7) {
            return `📅 Due in ${diffDays} day${diffDays === 1 ? '' : 's'}`;
        } else {
            return `📅 Due ${this.formatDate(task.dueDate)}`;
        }
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        const overdueTasks = this.tasks.filter(task => this.isOverdue(task)).length;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('overdueTasks').textContent = overdueTasks;

        // Update task count in header (filtered)
        const filteredTasks = this.getFilteredTasks();
        const taskCount = document.getElementById('taskCount');

        if (this.currentFilter === 'all') {
            taskCount.textContent = `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`;
        } else {
            const filterNames = {
                today: 'today',
                tomorrow: 'tomorrow',
                'this-week': 'this week',
                overdue: 'overdue',
                'no-date': 'without due dates'
            };
            const filterName = filterNames[this.currentFilter] || this.currentFilter;
            taskCount.textContent = `${filteredTasks.length} ${filteredTasks.length === 1 ? 'task' : 'tasks'} ${filterName}`;
        }

        this.updateDueDateBreakdown();
    }

    updateDueDateBreakdown() {
        const dueDateStats = document.getElementById('dueDateStats');

        const today = this.tasks.filter(t => this.isDueToday(t) && !t.completed).length;
        const tomorrow = this.tasks.filter(t => this.isDueTomorrow(t) && !t.completed).length;
        const thisWeek = this.tasks.filter(t => this.isDueThisWeek(t) && !t.completed && !this.isDueToday(t) && !this.isDueTomorrow(t)).length;
        const overdue = this.tasks.filter(t => this.isOverdue(t)).length;
        const noDate = this.tasks.filter(t => !t.dueDate && !t.completed).length;

        const stats = [
            { label: 'Due Today', count: today, icon: '🔥', class: 'due-today' },
            { label: 'Due Tomorrow', count: tomorrow, icon: '⏰', class: 'due-tomorrow' },
            { label: 'Due This Week', count: thisWeek, icon: '📆', class: 'due-week' },
            { label: 'Overdue', count: overdue, icon: '⚠️', class: 'overdue' },
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

        dueDateStats.innerHTML = statsHTML || '<p class="no-stats">All tasks are completed or have optimal due dates!</p>';
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
            this.showNotification('All tasks cleared!', 'success');
        }
    }

    getTaskStats() {
        const now = new Date();
        const stats = {
            total: this.tasks.length,
            completed: this.tasks.filter(t => t.completed).length,
            pending: this.tasks.filter(t => !t.completed).length,
            dueToday: this.tasks.filter(t => this.isDueToday(t)).length,
            dueTomorrow: this.tasks.filter(t => this.isDueTomorrow(t)).length,
            dueThisWeek: this.tasks.filter(t => this.isDueThisWeek(t)).length,
            overdue: this.tasks.filter(t => this.isOverdue(t)).length,
            noDueDate: this.tasks.filter(t => !t.dueDate).length,
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
