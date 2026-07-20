document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task');
    const taskTimeInput = document.getElementById('task-time');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const addTaskBtn = document.getElementById('add-task-btn');

    // Prefer the form by id, but fall back to the closest <form> around the
    // inputs (or the button) so a mismatched HTML file doesn't crash the script.
    const taskForm = document.getElementById('task-form')
        || (taskInput && taskInput.closest('form'))
        || (addTaskBtn && addTaskBtn.closest('form'));

    if (!taskInput || !taskTimeInput || !taskList) {
        console.error('Task app: required elements (#new-task, #task-time, #task-list) not found in the page. Check that index.html matches script.js.');
        return;
    }

    let tasks = loadTasks();
    let currentFilter = 'all';

    function loadTasks() {
        try {
            return JSON.parse(localStorage.getItem('tasks')) || [];
        } catch (err) {
            console.error('Could not read saved tasks, starting fresh.', err);
            return [];
        }
    }

    function saveTasks() {
        try {
            localStorage.setItem('tasks', JSON.stringify(tasks));
        } catch (err) {
            console.error('Could not save tasks.', err);
        }
    }

    function calculateCountdown(taskTime) {
        const now = new Date();
        const taskDate = new Date(taskTime);
        const diff = taskDate - now;

        if (Number.isNaN(diff)) {
            return '';
        }
        if (diff <= 0) {
            return 'Time Passed';
        }

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return days > 0 ? `${days}d ${hours}h ${minutes}m` : `${hours}h ${minutes}m`;
    }

    function renderTasks(filter = 'all') {
        taskList.innerHTML = '';
        let filteredTasks = tasks;

        if (filter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        } else if (filter === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        }

        if (filteredTasks.length === 0) {
            const empty = document.createElement('li');
            empty.classList.add('empty-state');
            empty.textContent = 'No tasks here yet.';
            taskList.appendChild(empty);
            return;
        }

        filteredTasks.forEach((task) => {
            const li = document.createElement('li');
            if (task.completed) li.classList.add('completed');

            const taskText = document.createElement('span');
            taskText.classList.add('task-text');
            taskText.textContent = task.text;

            const countdown = document.createElement('span');
            countdown.classList.add('countdown');
            countdown.textContent = task.completed ? '' : calculateCountdown(task.time);

            const actions = document.createElement('span');
            actions.classList.add('task-actions');

            const toggleBtn = document.createElement('button');
            toggleBtn.type = 'button';
            toggleBtn.textContent = task.completed ? 'Undo' : 'Complete';
            toggleBtn.addEventListener('click', () => toggleTask(task));

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.textContent = 'Edit';
            editBtn.classList.add('edit-btn');
            editBtn.addEventListener('click', () => editTask(task));

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => deleteTask(task));

            actions.appendChild(toggleBtn);
            actions.appendChild(editBtn);
            actions.appendChild(deleteBtn);

            li.appendChild(taskText);
            li.appendChild(countdown);
            li.appendChild(actions);

            taskList.appendChild(li);
        });
    }

    function addTask(e) {
        if (e) e.preventDefault();

        const taskText = taskInput.value.trim();
        const taskTime = taskTimeInput.value;

        if (!taskText || !taskTime) {
            return;
        }

        tasks.push({ text: taskText, time: taskTime, completed: false });
        taskInput.value = '';
        taskTimeInput.value = '';
        saveTasks();
        renderTasks(currentFilter);
        taskInput.focus();
    }

    function editTask(task) {
        const newText = prompt('Edit task title:', task.text);
        if (newText === null || newText.trim() === '') return;

        const newTime = prompt('Edit task time (YYYY-MM-DDTHH:MM):', task.time);
        if (newTime === null || newTime.trim() === '') return;

        task.text = newText.trim();
        task.time = newTime.trim();
        saveTasks();
        renderTasks(currentFilter);
    }

    function deleteTask(task) {
        const index = tasks.indexOf(task);
        if (index > -1) {
            tasks.splice(index, 1);
            saveTasks();
            renderTasks(currentFilter);
        }
    }

    function toggleTask(task) {
        task.completed = !task.completed;
        saveTasks();
        renderTasks(currentFilter);
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-filter');
            renderTasks(currentFilter);
        });
    });

    // A single 'submit' listener handles the button click, pressing Enter,
    // and mobile keyboard "Go"/"Enter" actions consistently.
    if (taskForm) {
        taskForm.addEventListener('submit', addTask);
    } else if (addTaskBtn) {
        // No <form> found at all — fall back to a direct click handler.
        console.warn('Task app: no <form> found around the task inputs, using button click fallback.');
        addTaskBtn.addEventListener('click', addTask);
    } else {
        console.error('Task app: could not find a form or an #add-task-btn to attach the add-task action to.');
    }

    renderTasks();
    setInterval(() => renderTasks(currentFilter), 60000); // Refresh countdown every minute
});