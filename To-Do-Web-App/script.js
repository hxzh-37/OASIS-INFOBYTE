// Task Management System
class TodoApp {
    constructor() {
        this.tasks = [];
        this.currentEditId = null;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadTasks();
        this.render();
    }

    // Event Binding
    bindEvents() {
        // Add task events
        document.getElementById('addTaskBtn').addEventListener('click', () => this.addTask());
        document.getElementById('taskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.addTask();
        });

        // Modal events
        document.getElementById('closeModal').addEventListener('click', () => this.closeModal());
        document.getElementById('cancelEdit').addEventListener('click', () => this.closeModal());
        document.getElementById('saveEdit').addEventListener('click', () => this.saveEdit());
        
        // Close modal when clicking outside
        document.getElementById('editModal').addEventListener('click', (e) => {
            if (e.target.id === 'editModal') this.closeModal();
        });

        // Edit input enter key
        document.getElementById('editTaskInput').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.saveEdit();
        });
    }

    // Generate unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substr(2);
    }

    // Format date and time
    formatDateTime(date) {
        const options = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
            hour12: true
        };
        return new Date(date).toLocaleDateString('en-US', options);
    }

    // Add new task
    addTask() {
        const input = document.getElementById('taskInput');
        const taskText = input.value.trim();

        if (!taskText) {
            this.showNotification('Please enter a task!', 'error');
            return;
        }

        const newTask = {
            id: this.generateId(),
            text: taskText,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.push(newTask);
        input.value = '';
        this.saveTasks();
        this.render();
        this.showNotification('Task added successfully!', 'success');
    }

    // Toggle task completion
    toggleTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveTasks();
            this.render();
            
            const message = task.completed ? 'Task marked as complete!' : 'Task moved to pending!';
            this.showNotification(message, 'success');
        }
    }

    // Delete task
    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(t => t.id !== id);
            this.saveTasks();
            this.render();
            this.showNotification('Task deleted successfully!', 'success');
        }
    }

    // Open edit modal
    editTask(id) {
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            this.currentEditId = id;
            document.getElementById('editTaskInput').value = task.text;
            document.getElementById('editModal').style.display = 'block';
            document.getElementById('editTaskInput').focus();
        }
    }

    // Save edited task
    saveEdit() {
        const newText = document.getElementById('editTaskInput').value.trim();
        
        if (!newText) {
            this.showNotification('Please enter a task!', 'error');
            return;
        }

        const task = this.tasks.find(t => t.id === this.currentEditId);
        if (task) {
            task.text = newText;
            this.saveTasks();
            this.render();
            this.closeModal();
            this.showNotification('Task updated successfully!', 'success');
        }
    }

    // Close modal
    closeModal() {
        document.getElementById('editModal').style.display = 'none';
        this.currentEditId = null;
    }

    // Create task HTML element
    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = 'task-item';
        li.setAttribute('data-id', task.id);

        const createdDate = this.formatDateTime(task.createdAt);
        const completedDate = task.completedAt ? this.formatDateTime(task.completedAt) : null;

        li.innerHTML = `
            <div class="task-content">
                <div class="task-checkbox ${task.completed ? 'checked' : ''}" 
                     onclick="todoApp.toggleTask('${task.id}')"></div>
                <span class="task-text ${task.completed ? 'completed' : ''}">${this.escapeHtml(task.text)}</span>
            </div>
            <div class="task-meta">
                <span class="task-date">
                    Created: ${createdDate}
                    ${completedDate ? `<br>Completed: ${completedDate}` : ''}
                </span>
            </div>
            <div class="task-actions">
                <button class="task-btn edit-btn" onclick="todoApp.editTask('${task.id}')">
                    Edit
                </button>
                <button class="task-btn delete-btn" onclick="todoApp.deleteTask('${task.id}')">
                    Delete
                </button>
            </div>
        `;

        return li;
    }

    // Escape HTML to prevent XSS
    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Render tasks
    render() {
        const pendingTasks = this.tasks.filter(task => !task.completed);
        const completedTasks = this.tasks.filter(task => task.completed);

        // Render pending tasks
        const pendingList = document.getElementById('pendingTasks');
        const pendingEmpty = document.getElementById('pendingEmpty');
        
        pendingList.innerHTML = '';
        
        if (pendingTasks.length === 0) {
            pendingEmpty.classList.remove('hidden');
        } else {
            pendingEmpty.classList.add('hidden');
            pendingTasks.forEach(task => {
                pendingList.appendChild(this.createTaskElement(task));
            });
        }

        // Render completed tasks
        const completedList = document.getElementById('completedTasks');
        const completedEmpty = document.getElementById('completedEmpty');
        
        completedList.innerHTML = '';
        
        if (completedTasks.length === 0) {
            completedEmpty.classList.remove('hidden');
        } else {
            completedEmpty.classList.add('hidden');
            completedTasks.forEach(task => {
                completedList.appendChild(this.createTaskElement(task));
            });
        }

        // Update statistics
        this.updateStats();
    }

    // Update statistics
    updateStats() {
        const pendingCount = this.tasks.filter(task => !task.completed).length;
        const completedCount = this.tasks.filter(task => task.completed).length;
        const totalCount = this.tasks.length;

        document.getElementById('pendingCount').textContent = pendingCount;
        document.getElementById('completedCount').textContent = completedCount;
        document.getElementById('totalCount').textContent = totalCount;
    }

    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // Add notification styles
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 15px 20px;
            border-radius: 8px;
            color: white;
            font-weight: 500;
            z-index: 1001;
            animation: slideInRight 0.3s ease;
            max-width: 300px;
            word-wrap: break-word;
        `;

        // Set background color based on type
        switch (type) {
            case 'success':
                notification.style.background = 'linear-gradient(135deg, #48bb78, #38a169)';
                break;
            case 'error':
                notification.style.background = 'linear-gradient(135deg, #f56565, #e53e3e)';
                break;
            default:
                notification.style.background = 'linear-gradient(135deg, #4299e1, #3182ce)';
        }

        // Add animation keyframes if not already added
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // Add to document
        document.body.appendChild(notification);

        // Auto remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }, 3000);
    }

    // Save tasks to localStorage
    saveTasks() {
        try {
            // Note: In Claude.ai artifacts, localStorage is not available
            // This would work in a normal browser environment
            // localStorage.setItem('todoTasks', JSON.stringify(this.tasks));
        } catch (error) {
            console.log('Storage not available in this environment');
        }
    }

    // Load tasks from localStorage
    loadTasks() {
        try {
            // Note: In Claude.ai artifacts, localStorage is not available
            // This would work in a normal browser environment
            // const saved = localStorage.getItem('todoTasks');
            // if (saved) {
            //     this.tasks = JSON.parse(saved);
            // }
        } catch (error) {
            console.log('Storage not available in this environment');
            this.tasks = [];
        }
    }

    // Export tasks as JSON
    exportTasks() {
        const dataStr = JSON.stringify(this.tasks, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `todo-tasks-${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        URL.revokeObjectURL(url);
        this.showNotification('Tasks exported successfully!', 'success');
    }

    // Import tasks from JSON
    importTasks(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const importedTasks = JSON.parse(e.target.result);
                if (Array.isArray(importedTasks)) {
                    this.tasks = importedTasks;
                    this.saveTasks();
                    this.render();
                    this.showNotification('Tasks imported successfully!', 'success');
                } else {
                    this.showNotification('Invalid file format!', 'error');
                }
            } catch (error) {
                this.showNotification('Error reading file!', 'error');
            }
        };
        reader.readAsText(file);
    }

    // Clear all tasks
    clearAllTasks() {
        if (confirm('Are you sure you want to delete all tasks? This action cannot be undone.')) {
            this.tasks = [];
            this.saveTasks();
            this.render();
            this.showNotification('All tasks cleared!', 'success');
        }
    }

    // Clear completed tasks only
    clearCompletedTasks() {
        const completedCount = this.tasks.filter(task => task.completed).length;
        
        if (completedCount === 0) {
            this.showNotification('No completed tasks to clear!', 'info');
            return;
        }

        if (confirm(`Are you sure you want to delete ${completedCount} completed task(s)?`)) {
            this.tasks = this.tasks.filter(task => !task.completed);
            this.saveTasks();
            this.render();
            this.showNotification('Completed tasks cleared!', 'success');
        }
    }
}

// Initialize the app when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.todoApp = new TodoApp();
});

// Add some sample tasks for demonstration (optional)
// Uncomment the following lines if you want to start with sample data
/*
setTimeout(() => {
    if (todoApp.tasks.length === 0) {
        todoApp.tasks = [
            {
                id: 'sample1',
                text: 'Complete the project proposal',
                completed: false,
                createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
                completedAt: null
            },
            {
                id: 'sample2',
                text: 'Review team feedback',
                completed: true,
                createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
                completedAt: new Date(Date.now() - 86400000).toISOString() // 1 day ago
            },
            {
                id: 'sample3',
                text: 'Schedule team meeting for next week',
                completed: false,
                createdAt: new Date(Date.now() - 43200000).toISOString(), // 12 hours ago
                completedAt: null
            }
        ];
        todoApp.render();
    }
}, 1000);
*/