// Main TaskFlow application class that manages task creation, editing, and persistence
class TaskFlow {
    // Initialize the TaskFlow application with all necessary setup
    constructor() {
        this.tasks = this.loadTasks(); // Load existing tasks from localStorage
        this.taskIdCounter = this.getNextTaskId(); // Get the next available task ID
        this.currentDateFilter = 'all'; // FEATURE 3 ADDITION: Track current date filter
        this.initializeApp(); // Set up the application
        this.bindEvents(); // Attach event listeners
        this.renderTasks(); // Display existing tasks
        this.updateStats(); // Update task statistics
    }

    // Initialize the application and show welcome message if needed
    initializeApp() {
        console.log('TaskFlow initialized successfully!');
        this.showWelcomeMessage();
        this.setDefaultDueDate(); // FEATURE 3 ADDITION: Set default due date to tomorrow
    }

    // FEATURE 3 ADDITION: Set default due date to tomorrow
    setDefaultDueDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowString = tomorrow.toISOString().split('T')[0];
        document.getElementById('dueDateInput').value = tomorrowString;
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

        // FEATURE 3 ADDITION: Bind date filter events
        this.bindDateFilters();

        // Focus on input when page loads for better UX
        taskInput.focus();
    }

    // FEATURE 3 ADDITION: Bind date filter button events
    bindDateFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.setActiveDateFilter(e.target.dataset.filter);
            });
        });
    }

    // FEATURE 3 ADDITION: Set active date filter and update UI
    setActiveDateFilter(filter) {
        this.currentDateFilter = filter;

        // Update active button styling
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-filter="${filter}"]`).classList.add('active');

        // Re-render tasks with new filter
        this.renderTasks();
        this.updateStats();
    }

    // Create a new task and add it to the task list
    addTask() {
        const taskInput = document.getElementById('taskInput');
        const dueDateInput = document.getElementById('dueDateInput'); // FEATURE 3 ADDITION
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
            dueDate: dueDateInput.value || null, // FEATURE 3 ADDITION: Due date (null if not set)
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
        this.setDefaultDueDate(); // FEATURE 3 ADDITION: Reset to tomorrow
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

    // FEATURE 3 ADDITION: Check if a task is overdue
    isOverdue(task) {
        if (!task.dueDate || task.completed) return false;
        const today = new Date();
        const dueDate = new Date(task.dueDate);
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);
        return dueDate < today;
    }

    // FEATURE 3 ADDITION: Check if a task is due today
    isDueToday(task) {
        if (!task.dueDate) return false;
        const today = new Date();
        const dueDate = new Date(task.dueDate);
        return today.toDateString() === dueDate.toDateString();
    }

    // FEATURE 3 ADDITION: Get due date badge information
    getDueDateBadge(task) {
        if (!task.dueDate) return null;

        const today = new Date();
        const dueDate = new Date(task.dueDate);
        today.setHours(0, 0, 0, 0);
        dueDate.setHours(0, 0, 0, 0);

        const diffTime = dueDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays < 0) {
            const daysPast = Math.abs(diffDays);
            return {
                text: `${daysPast} day${daysPast === 1 ? '' : 's'} overdue`,
                class: 'due-overdue'
            };
        } else if (diffDays === 0) {
            return {
                text: 'Due today',
                class: 'due-today'
            };
        } else if (diffDays === 1) {
            return {
                text: 'Due tomorrow',
                class: 'due-tomorrow'
            };
        } else if (diffDays <= 7) {
            return {
                text: `Due in ${diffDays} days`,
                class: 'due-soon'
            };
        } else {
            return {
                text: `Due ${dueDate.toLocaleDateString()}`,
                class: 'due-later'
            };
        }
    }

    // FEATURE 3 ADDITION: Filter tasks based on current date filter
    getFilteredTasks() {
        switch (this.currentDateFilter) {
            case 'due-today':
                return this.tasks.filter(task => this.isDueToday(task));
            case 'overdue':
                return this.tasks.filter(task => this.isOverdue(task));
            case 'no-due-date':
                return this.tasks.filter(task => !task.dueDate);
            default:
                return this.tasks;
        }
    }

    // Render all tasks in the UI with proper sorting and styling
    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');

        // FEATURE 3 ADDITION: Use filtered tasks instead of all tasks
        const filteredTasks = this.getFilteredTasks();

        // Show empty state if no tasks exist
        if (filteredTasks.length === 0) {
            tasksList.style.display = 'none';
            emptyState.style.display = 'block';

            // Update empty state message based on filter
            const emptyTitle = emptyState.querySelector('h3');
            const emptyText = emptyState.querySelector('p');

            switch (this.currentDateFilter) {
                case 'due-today':
                    emptyTitle.textContent = 'No tasks due today';
                    emptyText.textContent = 'Great! You\'re all caught up for today.';
                    break;
                case 'overdue':
                    emptyTitle.textContent = 'No overdue tasks';
                    emptyText.textContent = 'Excellent! You\'re staying on top of your deadlines.';
                    break;
                case 'no-due-date':
                    emptyTitle.textContent = 'No tasks without due dates';
                    emptyText.textContent = 'All your tasks have due dates assigned.';
                    break;
                default:
                    emptyTitle.textContent = 'No tasks yet';
                    emptyText.textContent = 'Add your first task above to get started!';
            }
            return;
        }

        // Show task list and hide empty state
        tasksList.style.display = 'flex';
        emptyState.style.display = 'none';

        // FEATURE 3 ADDITION: Sort tasks by completion status, then overdue status, then due date
        const sortedTasks = [...filteredTasks].sort((a, b) => {
            // First sort by completion status (incomplete first)
            if (a.completed !== b.completed) {
                return a.completed - b.completed;
            }

            // For incomplete tasks, sort by due date priority
            if (!a.completed && !b.completed) {
                const aOverdue = this.isOverdue(a);
                const bOverdue = this.isOverdue(b);

                // Overdue tasks first
                if (aOverdue !== bOverdue) {
                    return bOverdue - aOverdue;
                }

                // Then by due date (earliest first), null dates last
                if (a.dueDate && b.dueDate) {
                    return new Date(a.dueDate) - new Date(b.dueDate);
                } else if (a.dueDate && !b.dueDate) {
                    return -1;
                } else if (!a.dueDate && b.dueDate) {
                    return 1;
                }
            }

            // Finally sort by creation date (newest first)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Generate HTML for each task with interactive elements
        tasksList.innerHTML = sortedTasks.map(task => {
            const dueDateBadge = this.getDueDateBadge(task); // FEATURE 3 ADDITION
            const isOverdue = this.isOverdue(task);

            return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${isOverdue ? 'overdue' : ''}" data-task-id="${task.id}">
                <div class="task-content">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}"
                         onclick="taskFlow.toggleTask(${task.id})">
                    </div>
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                    ${dueDateBadge ? `<span class="due-date-badge ${dueDateBadge.class}">${dueDateBadge.text}</span>` : ''}
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

    // FEATURE 3 ADDITION: Update due date analytics display
    updateDueDateAnalytics() {
        const dueDateAnalytics = document.getElementById('dueDateAnalytics');

        const today = new Date();
        const dueTodayTasks = this.tasks.filter(task => this.isDueToday(task));
        const overdueTasks = this.tasks.filter(task => this.isOverdue(task));
        const upcomingTasks = this.tasks.filter(task => {
            if (!task.dueDate || task.completed) return false;
            const dueDate = new Date(task.dueDate);
            const diffTime = dueDate - today;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            return diffDays > 0 && diffDays <= 7;
        });
        const noDueDateTasks = this.tasks.filter(task => !task.dueDate);

        const analyticsHTML = `
            <div class="due-date-stat">
                <div class="due-stat-header">
                    <span class="due-stat-icon">🚨</span>
                    <span class="due-stat-name">Overdue</span>
                    <span class="due-stat-count overdue">${overdueTasks.length}</span>
                </div>
            </div>
            <div class="due-date-stat">
                <div class="due-stat-header">
                    <span class="due-stat-icon">📅</span>
                    <span class="due-stat-name">Due Today</span>
                    <span class="due-stat-count today">${dueTodayTasks.length}</span>
                </div>
            </div>
            <div class="due-date-stat">
                <div class="due-stat-header">
                    <span class="due-stat-icon">⏰</span>
                    <span class="due-stat-name">Due This Week</span>
                    <span class="due-stat-count upcoming">${upcomingTasks.length}</span>
                </div>
            </div>
            <div class="due-date-stat">
                <div class="due-stat-header">
                    <span class="due-stat-icon">📝</span>
                    <span class="due-stat-name">No Due Date</span>
                    <span class="due-stat-count neutral">${noDueDateTasks.length}</span>
                </div>
            </div>
        `;

        dueDateAnalytics.innerHTML = analyticsHTML;
    }

    // Update statistics display with current task counts
    updateStats() {
        // FEATURE 3 ADDITION: Use filtered tasks for display stats but all tasks for actual counts
        const filteredTasks = this.getFilteredTasks();
        const totalTasks = filteredTasks.length;
        const completedTasks = filteredTasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        // FEATURE 3 ADDITION: Calculate overdue tasks from all tasks
        const overdueTasks = this.tasks.filter(task => this.isOverdue(task)).length;

        // Update statistics counters in the UI
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('overdueTasks').textContent = overdueTasks; // FEATURE 3 ADDITION

        // Update task count in header with proper singular/plural handling
        const taskCount = document.getElementById('taskCount');
        taskCount.textContent = `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`;

        // FEATURE 3 ADDITION: Update due date analytics
        this.updateDueDateAnalytics();
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
            const tasks = saved ? JSON.parse(saved) : [];

            // FEATURE 3 ADDITION: Add dueDate field to existing tasks that don't have it
            return tasks.map(task => ({
                ...task,
                dueDate: task.dueDate || null // Default to null for backward compatibility
            }));
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
        const stats = {
            total: this.tasks.length,
            completed: this.tasks.filter(t => t.completed).length,
            pending: this.tasks.filter(t => !t.completed).length,
            // FEATURE 3 ADDITION: Due date-based statistics
            overdue: this.tasks.filter(t => this.isOverdue(t)).length,
            dueToday: this.tasks.filter(t => this.isDueToday(t)).length,
            noDueDate: this.tasks.filter(t => !t.dueDate).length,
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
