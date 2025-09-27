class TaskFlow {
    constructor() {
        this.tasks = this.loadTasks();
        this.taskIdCounter = this.getNextTaskId();
        this.currentSort = 'priority';
        this.initializeApp();
        this.bindEvents();
        this.renderTasks();
        this.updateStats();
    }

    initializeApp() {
        console.log('TaskFlow initialized with Priority System!');
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
            console.log('Welcome to TaskFlow! Add your first task with priority to get started.');
        }
    }

    bindEvents() {
        const addTaskBtn = document.getElementById('addTaskBtn');
        const taskInput = document.getElementById('taskInput');
        const sortSelect = document.getElementById('sortSelect');

        addTaskBtn.addEventListener('click', () => this.addTask());

        taskInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.addTask();
            }
        });

        sortSelect.addEventListener('change', (e) => {
            this.currentSort = e.target.value;
            this.renderTasks();
        });

        // Focus on input when page loads
        taskInput.focus();
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

        const priorityLabel = this.getPriorityLabel(priority);
        this.showNotification(`${priorityLabel} task added successfully!`, 'success');
    }

    getPriorityLabel(priority) {
        const labels = {
            high: 'High Priority',
            medium: 'Medium Priority',
            low: 'Low Priority'
        };
        return labels[priority] || 'Priority';
    }

    getPriorityValue(priority) {
        const values = {
            high: 3,
            medium: 2,
            low: 1
        };
        return values[priority] || 2;
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
                // Also allow editing priority
                const newPriority = prompt('Priority (high/medium/low):', task.priority);
                if (newPriority && ['high', 'medium', 'low'].includes(newPriority.toLowerCase())) {
                    task.priority = newPriority.toLowerCase();
                }
                task.text = newText.trim();
                this.saveTasks();
                this.renderTasks();
                this.updateStats();
                this.showNotification('Task updated successfully!', 'success');
            }
        }
    }

    sortTasks(tasks) {
        const tasksCopy = [...tasks];

        switch (this.currentSort) {
            case 'priority':
                return tasksCopy.sort((a, b) => {
                    // First sort by completion status
                    if (a.completed !== b.completed) {
                        return a.completed - b.completed;
                    }
                    // Then by priority (high to low)
                    return this.getPriorityValue(b.priority) - this.getPriorityValue(a.priority);
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

        if (this.tasks.length === 0) {
            tasksList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        tasksList.style.display = 'flex';
        emptyState.style.display = 'none';

        const sortedTasks = this.sortTasks(this.tasks);

        tasksList.innerHTML = sortedTasks.map(task => `
            <div class="task-item ${task.completed ? 'completed' : ''} priority-${task.priority}" data-task-id="${task.id}">
                <div class="task-content">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}"
                         onclick="taskFlow.toggleTask(${task.id})">
                    </div>
                    <div class="task-info">
                        <span class="task-text">${this.escapeHtml(task.text)}</span>
                        <div class="task-meta">
                            <span class="priority-badge priority-${task.priority}">
                                ${this.getPriorityIcon(task.priority)} ${this.getPriorityLabel(task.priority)}
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

    getPriorityIcon(priority) {
        const icons = {
            high: '🔥',
            medium: '⚡',
            low: '🌱'
        };
        return icons[priority] || '⚡';
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
        const highPriorityTasks = this.tasks.filter(task => task.priority === 'high' && !task.completed).length;

        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('highPriorityTasks').textContent = highPriorityTasks;

        // Update task count in header
        const taskCount = document.getElementById('taskCount');
        taskCount.textContent = `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`;
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
            high: this.tasks.filter(t => t.priority === 'high').length,
            medium: this.tasks.filter(t => t.priority === 'medium').length,
            low: this.tasks.filter(t => t.priority === 'low').length,
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
