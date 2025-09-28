// Main TaskFlow application class that manages task creation, editing, and persistence
class TaskFlow {
    // Initialize the TaskFlow application with all necessary setup
    constructor() {
        this.tasks = this.loadTasks(); // Load existing tasks from localStorage
        this.taskIdCounter = this.getNextTaskId(); // Get the next available task ID

        // Feature 2: Categories configuration
        this.categories = {
            work: { name: 'Work', icon: '💼', color: '#3182ce' },
            personal: { name: 'Personal', icon: '🏠', color: '#805ad5' },
            shopping: { name: 'Shopping', icon: '🛒', color: '#38a169' },
            health: { name: 'Health', icon: '🏥', color: '#e53e3e' },
            study: { name: 'Study', icon: '📚', color: '#d69e2e' }
        };

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

        // Focus on input when page loads for better UX
        taskInput.focus();
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

        // Feature 1: Get priority value
        const prioritySelect = document.getElementById('prioritySelect');
        const priority = prioritySelect.value;

        // Feature 2: Get category value
        const categorySelect = document.getElementById('categorySelect');
        const category = categorySelect.value;

        // Create new task object with metadata and feature properties
        const newTask = {
            id: this.taskIdCounter++, // Unique identifier
            text: taskText, // Task description
            completed: false, // Completion status
            createdAt: new Date().toISOString(), // Creation timestamp
            completedAt: null, // Completion timestamp (null until completed)
            // Feature 1: Priority System
            priority: priority,
            // Feature 2: Category System
            category: category
            // Feature 3: Due Date System (reserved)
            dueDate: null // Default until feature 3
        };

        // Add task to array and update UI/storage
        this.tasks.push(newTask);
        this.saveTasks(); // Persist to localStorage
        this.renderTasks(); // Update task display
        this.updateStats(); // Update statistics

        // Clear input and reset form
        taskInput.value = '';
        prioritySelect.value = 'medium'; // Reset to default priority
        categorySelect.value = 'personal'; // Reset to default category
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

        // Show empty state if no tasks exist
        if (this.tasks.length === 0) {
            tasksList.style.display = 'none';
            emptyState.style.display = 'block';
            return;
        }

        // Show task list and hide empty state
        tasksList.style.display = 'flex';
        emptyState.style.display = 'none';

        // Feature 1: Sort tasks by priority, then completion, then creation date
        const sortedTasks = [...this.tasks].sort((a, b) => {
            // First sort by completion status (incomplete first)
            if (a.completed !== b.completed) {
                return a.completed - b.completed;
            }

            // Then sort by priority (high > medium > low)
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            const aPriority = priorityOrder[a.priority || 'medium'];
            const bPriority = priorityOrder[b.priority || 'medium'];

            if (aPriority !== bPriority) {
                return bPriority - aPriority; // Higher priority first
            }

            // Finally sort by creation date (newest first)
            return new Date(b.createdAt) - new Date(a.createdAt);
        });

        // Generate HTML for each task with interactive elements and priority styling
        tasksList.innerHTML = sortedTasks.map(task => {
            const priority = task.priority || 'medium';
            const priorityClass = `priority-${priority}`;

            return `
                <div class="task-item ${task.completed ? 'completed' : ''} ${priorityClass}" data-task-id="${task.id}">
                    <div class="task-content">
                        <div class="task-checkbox ${task.completed ? 'checked' : ''}"
                             onclick="taskFlow.toggleTask(${task.id})">
                        </div>
                        <div class="task-info">
                            <span class="task-text">${this.escapeHtml(task.text)}</span>
                            <div class="task-badges">
                                <span class="priority-badge ${priority}">${priority}</span>
                                <span class="category-badge ${task.category || 'personal'}">
                                    ${this.categories[task.category || 'personal']?.icon || '🏠'}
                                    ${this.categories[task.category || 'personal']?.name || 'Personal'}
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

    // Update statistics display with current task counts
    updateStats() {
        const totalTasks = this.tasks.length;
        const completedTasks = this.tasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        // Feature 1: Priority statistics
        const highPriorityTasks = this.tasks.filter(task =>
            !task.completed && (task.priority === 'high')
        ).length;

        // Feature 2: Category statistics
        const usedCategories = new Set(this.tasks.map(task => task.category || 'personal')).size;

        // Update statistics counters in the UI
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('highPriorityTasks').textContent = highPriorityTasks;
        document.getElementById('categoriesUsed').textContent = usedCategories;

        // Feature 2: Update category breakdown
        this.updateCategoryStats();

        // Update task count in header with proper singular/plural handling
        const taskCount = document.getElementById('taskCount');
        taskCount.textContent = `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`;
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
            const tasks = saved ? JSON.parse(saved) : [];

            // Feature compatibility: Add default values for missing properties
            return tasks.map(task => ({
                ...task,
                // Feature 1: Default priority if missing
                priority: task.priority || 'medium',
                // Feature 2: Default category if missing (reserved)
                category: task.category || 'personal',
                // Feature 3: Default due date if missing (reserved)
                dueDate: task.dueDate || null
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

    // Feature 2: Update category breakdown statistics
    updateCategoryStats() {
        const categoryStatsContainer = document.getElementById('categoryStats');

        // Count tasks by category
        const categoryBreakdown = {};
        Object.keys(this.categories).forEach(categoryKey => {
            categoryBreakdown[categoryKey] = this.tasks.filter(task =>
                task.category === categoryKey
            ).length;
        });

        // Generate HTML for category statistics
        const categoryStatsHTML = Object.entries(categoryBreakdown).map(([categoryKey, count]) => {
            const category = this.categories[categoryKey];
            return `
                <div class="category-stat-item">
                    <div class="category-stat-info">
                        <span class="category-stat-icon">${category.icon}</span>
                        <span class="category-stat-name">${category.name}</span>
                    </div>
                    <span class="category-stat-count">${count}</span>
                </div>
            `;
        }).join('');

        categoryStatsContainer.innerHTML = categoryStatsHTML;
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
