class TaskFlow {
    constructor() {
        this.tasks = this.loadTasks();
        this.taskIdCounter = this.getNextTaskId();
        this.currentFilter = 'all';
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
        console.log('TaskFlow initialized with Category Management!');
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
            console.log('Welcome to TaskFlow! Organize your tasks by categories.');
        }
    }

    bindEvents() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');
        const filterButtons = document.querySelectorAll('.filter-btn');

        addTaskBtn.addEventListener('click', () => this.addTask());

        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        // Category filter buttons
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const category = e.currentTarget.dataset.category;
                this.setFilter(category);
            });
        });

        // Focus on input when page loads
        taskInput.focus();
    }

    setFilter(category) {
        this.currentFilter = category;

        // Update button states
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

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

        const categoryName = this.categories[category].name;
        this.showNotification(`Task added to ${categoryName} category!`, 'success');
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
                // Also allow editing category
                const categoryOptions = Object.keys(this.categories).join('/');
                const newCategory = prompt(`Category (${categoryOptions}):`, task.category);
                if (newCategory && this.categories[newCategory.toLowerCase()]) {
                    task.category = newCategory.toLowerCase();
                }
                task.text = newText.trim();
                this.saveTasks();
                this.renderTasks();
                this.updateStats();
                this.showNotification('Task updated successfully!', 'success');
            }
        }
    }

    getFilteredTasks() {
        if (this.currentFilter === 'all') {
            return this.tasks;
        }
        return this.tasks.filter(task => task.category === this.currentFilter);
    }

    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');
        const filteredTasks = this.getFilteredTasks();

        if (filteredTasks.length === 0) {
            tasksList.style.display = 'none';
            emptyState.style.display = 'block';

            if (this.currentFilter === 'all') {
                emptyState.innerHTML = `
                    <div class="empty-icon">✨</div>
                    <h3>No tasks yet</h3>
                    <p>Add your first task above to get started!</p>
                `;
            } else {
                const categoryName = this.categories[this.currentFilter].name;
                emptyState.innerHTML = `
                    <div class="empty-icon">${this.categories[this.currentFilter].icon}</div>
                    <h3>No ${categoryName} tasks</h3>
                    <p>Add a ${categoryName.toLowerCase()} task or select a different category.</p>
                `;
            }
            return;
        }

        tasksList.style.display = 'flex';
        emptyState.style.display = 'none';

        // Sort tasks: incomplete first, then by creation date
        const sortedTasks = [...filteredTasks].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed - b.completed;
            }
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        tasksList.innerHTML = sortedTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''} category-${task.category}" data-task-id="${task.id}">
                <div class="task-content">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}"
                         onclick="taskFlow.toggleTask(${task.id})">
                    </div>
                    <div class="task-info">
                        <span class="task-text">${this.escapeHtml(task.text)}</span>
                        <div class="task-meta">
                            <span class="category-badge category-${task.category}">
                                ${this.categories[task.category].icon} ${this.categories[task.category].name}
                            </span>
                            <span class="task-date">${this.formatDate(task.createdAt)}</span>
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
        `).join('');
    }

    formatDate(dateString) {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric'
        });
    }

    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        // Count unique categories used
        const usedCategories = new Set(this.tasks.map(task => task.category));
        const categoriesUsed = usedCategories.size;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('categoriesUsed').textContent = categoriesUsed;

        // Update task count in header (filtered)
        const filteredTasks = this.getFilteredTasks();
        const taskCount = document.getElementById('taskCount');

        if (this.currentFilter === 'all') {
            taskCount.textContent = `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`;
        } else {
            const categoryName = this.categories[this.currentFilter].name;
            taskCount.textContent = `${filteredTasks.length} ${categoryName} ${filteredTasks.length === 1 ? 'task' : 'tasks'}`;
        }

        this.updateCategoryBreakdown();
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

        categoryStats.innerHTML = statsHTML || '<p class="no-categories">No tasks yet. Add some tasks to see category breakdown!</p>';
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
            categories: {},
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

        // Category breakdown
        Object.keys(this.categories).forEach(cat => {
            const categoryTasks = this.tasks.filter(t => t.category === cat);
            stats.categories[cat] = {
                total: categoryTasks.length,
                completed: categoryTasks.filter(t => t.completed).length,
                pending: categoryTasks.filter(t => !t.completed).length
            };
        });

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
