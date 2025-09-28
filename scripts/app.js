// Main TaskFlow application class that manages task creation, editing, and persistence
class TaskFlow {
    // Initialize the TaskFlow application with all necessary setup
    constructor() {
        this.tasks = this.loadTasks(); // Load existing tasks from localStorage
        this.taskIdCounter = this.getNextTaskId(); // Get the next available task ID
        this.currentCategoryFilter = 'all'; // FEATURE 2 ADDITION: Track current category filter
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

        // FEATURE 2 ADDITION: Bind category filter events
        this.bindCategoryFilters();

        // Focus on input when page loads for better UX
        taskInput.focus();
    }

    // FEATURE 2 ADDITION: Bind category filter button events
    bindCategoryFilters() {
        const filterButtons = document.querySelectorAll('.filter-btn');
        filterButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                this.setActiveCategoryFilter(e.target.dataset.category);
            });
        });
    }

    // FEATURE 2 ADDITION: Set active category filter and update UI
    setActiveCategoryFilter(category) {
        this.currentCategoryFilter = category;

        // Update active button styling
        document.querySelectorAll('.filter-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-category="${category}"]`).classList.add('active');

        // Re-render tasks with new filter
        this.renderTasks();
        this.updateStats();
    }

    // Create a new task and add it to the task list
    addTask() {
        const taskInput = document.getElementById('taskInput');
        const categorySelect = document.getElementById('categorySelect'); // FEATURE 2 ADDITION
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
            category: categorySelect.value, // FEATURE 2 ADDITION: Task category
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
        categorySelect.value = 'personal'; // FEATURE 2 ADDITION: Reset category to default
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

    // FEATURE 2 ADDITION: Get category display info with icon and color
    getCategoryInfo(category) {
        const categoryMap = {
            personal: { label: 'Personal', icon: '👤', class: 'category-personal' },
            work: { label: 'Work', icon: '💼', class: 'category-work' },
            shopping: { label: 'Shopping', icon: '🛒', class: 'category-shopping' },
            health: { label: 'Health', icon: '🏥', class: 'category-health' },
            study: { label: 'Study', icon: '📚', class: 'category-study' }
        };
        return categoryMap[category] || categoryMap.personal;
    }

    // FEATURE 2 ADDITION: Filter tasks based on current category filter
    getFilteredTasks() {
        if (this.currentCategoryFilter === 'all') {
            return this.tasks;
        }
        return this.tasks.filter(task => task.category === this.currentCategoryFilter);
    }

    // Render all tasks in the UI with proper sorting and styling
    renderTasks() {
        const tasksList = document.getElementById('tasksList');
        const emptyState = document.getElementById('emptyState');

        // FEATURE 2 ADDITION: Use filtered tasks instead of all tasks
        const filteredTasks = this.getFilteredTasks();

        // Show empty state if no tasks exist
        if (filteredTasks.length === 0) {
            tasksList.style.display = 'none';
            emptyState.style.display = 'block';

            // Update empty state message based on filter
            const emptyTitle = emptyState.querySelector('h3');
            const emptyText = emptyState.querySelector('p');

            if (this.currentCategoryFilter === 'all') {
                emptyTitle.textContent = 'No tasks yet';
                emptyText.textContent = 'Add your first task above to get started!';
            } else {
                const categoryInfo = this.getCategoryInfo(this.currentCategoryFilter);
                emptyTitle.textContent = `No ${categoryInfo.label.toLowerCase()} tasks`;
                emptyText.textContent = `Add a ${categoryInfo.label.toLowerCase()} task to get started!`;
            }
            return;
        }

        // Show task list and hide empty state
        tasksList.style.display = 'flex';
        emptyState.style.display = 'none';

        // Sort tasks: incomplete first, then by creation date (newest first)
        const sortedTasks = [...filteredTasks].sort((a, b) => {
            if (a.completed !== b.completed) {
                return a.completed - b.completed; // Incomplete tasks first
            }
            return new Date(b.createdAt) - new Date(a.createdAt); // Newest first within same completion status
        });

        // Generate HTML for each task with interactive elements
        tasksList.innerHTML = sortedTasks.map(task => {
            const categoryInfo = this.getCategoryInfo(task.category); // FEATURE 2 ADDITION
            return `
            <div class="task-item ${task.completed ? 'completed' : ''} ${categoryInfo.class}" data-task-id="${task.id}">
                <div class="task-content">
                    <div class="task-checkbox ${task.completed ? 'checked' : ''}"
                         onclick="taskFlow.toggleTask(${task.id})">
                    </div>
                    <span class="task-text">${this.escapeHtml(task.text)}</span>
                    <span class="category-badge ${categoryInfo.class}">${categoryInfo.icon} ${categoryInfo.label}</span>
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

    // FEATURE 2 ADDITION: Update category analytics display
    updateCategoryAnalytics() {
        const categoryAnalytics = document.getElementById('categoryAnalytics');
        const categories = ['personal', 'work', 'shopping', 'health', 'study'];

        const analyticsHTML = categories.map(category => {
            const categoryInfo = this.getCategoryInfo(category);
            const categoryTasks = this.tasks.filter(task => task.category === category);
            const completedTasks = categoryTasks.filter(task => task.completed).length;
            const totalTasks = categoryTasks.length;
            const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

            return `
                <div class="category-stat ${categoryInfo.class}">
                    <div class="category-header">
                        <span class="category-icon">${categoryInfo.icon}</span>
                        <span class="category-name">${categoryInfo.label}</span>
                        <span class="category-count">${totalTasks}</span>
                    </div>
                    <div class="category-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: ${progress}%"></div>
                        </div>
                        <span class="progress-text">${completedTasks}/${totalTasks} (${progress}%)</span>
                    </div>
                </div>
            `;
        }).join('');

        categoryAnalytics.innerHTML = analyticsHTML;
    }

    // Update statistics display with current task counts
    updateStats() {
        // FEATURE 2 ADDITION: Use filtered tasks for display stats but all tasks for actual counts
        const filteredTasks = this.getFilteredTasks();
        const totalTasks = filteredTasks.length;
        const completedTasks = filteredTasks.filter(task => task.completed).length;
        const pendingTasks = totalTasks - completedTasks;

        // FEATURE 2 ADDITION: Calculate categories used from all tasks
        const categoriesUsed = new Set(this.tasks.map(task => task.category)).size;

        // Update statistics counters in the UI
        document.getElementById('totalTasks').textContent = totalTasks;
        document.getElementById('completedTasks').textContent = completedTasks;
        document.getElementById('pendingTasks').textContent = pendingTasks;
        document.getElementById('categoriesUsed').textContent = categoriesUsed; // FEATURE 2 ADDITION

        // Update task count in header with proper singular/plural handling
        const taskCount = document.getElementById('taskCount');
        taskCount.textContent = `${totalTasks} ${totalTasks === 1 ? 'task' : 'tasks'}`;

        // FEATURE 2 ADDITION: Update category analytics
        this.updateCategoryAnalytics();
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

            // FEATURE 2 ADDITION: Add category field to existing tasks that don't have it
            return tasks.map(task => ({
                ...task,
                category: task.category || 'personal' // Default to personal category for backward compatibility
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
            // FEATURE 2 ADDITION: Category-based statistics
            byCategory: {
                personal: this.tasks.filter(t => t.category === 'personal').length,
                work: this.tasks.filter(t => t.category === 'work').length,
                shopping: this.tasks.filter(t => t.category === 'shopping').length,
                health: this.tasks.filter(t => t.category === 'health').length,
                study: this.tasks.filter(t => t.category === 'study').length
            },
            categoriesUsed: new Set(this.tasks.map(t => t.category)).size,
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
