document.addEventListener('DOMContentLoaded', () => {
    const taskInput = document.getElementById('new-task');
    const taskTimeInput = document.getElementById('task-time');
    const taskList = document.getElementById('task-list');
    const addTaskBtn = document.getElementById('add-task-btn');
    const filterBtns = document.querySelectorAll('.filter-btn');

    let tasks = JSON.parse(localStorage.getItem('tasks')) || [];

    function saveTasks() {
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    function calculateCountdown(taskTime) {
        const now = new Date();
        const taskDate = new Date(taskTime);
        const diff = taskDate - now;

        if (diff <= 0) {
            return 'Time Passed';
        }

        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${hours}h ${minutes}m`;
    }

    function renderTasks(filter = 'all') {
        taskList.innerHTML = '';
        let filteredTasks = tasks;

        if (filter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        } else if (filter === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        }

        filteredTasks.forEach((task, index) => {
            const li = document.createElement('li');
            li.classList.add(task.completed ? 'completed' : '');

            const taskText = document.createElement('span');
            taskText.textContent = task.text;

            const countdown = document.createElement('span');
            countdown.classList.add('countdown');
            countdown.textContent = calculateCountdown(task.time);

            const editBtn = document.createElement('button');
            editBtn.textContent = 'Edit';
            editBtn.classList.add('edit-btn');
            editBtn.addEventListener('click', () => editTask(index));

            const deleteBtn = document.createElement('button');
            deleteBtn.textContent = 'Delete';
            deleteBtn.addEventListener('click', () => deleteTask(index));

            const toggleBtn = document.createElement('button');
            toggleBtn.textContent = task.completed ? 'Undo' : 'Complete';
            toggleBtn.addEventListener('click', () => toggleTask(index));

            li.appendChild(taskText);
            li.appendChild(countdown);
            li.appendChild(editBtn);
            li.appendChild(deleteBtn);
            li.appendChild(toggleBtn);

            taskList.appendChild(li);
        });

        setInterval(() => renderTasks(filter), 60000); // Refresh countdown every minute
    }

    function addTask() {
        const taskText = taskInput.value.trim();
        const taskTime = taskTimeInput.value;
        console.log('Task Text:', taskText);
        console.log('Task Time:', taskTime);
        
        if (taskText && taskTime) {
            tasks.push({ text: taskText, time: taskTime, completed: false });
            console.log('Task added:', tasks);
            taskInput.value = '';
            taskTimeInput.value = '';
            saveTasks();
            renderTasks();
        } else {
            console.log('Task text or time is missing');
        }
    }
    

    function editTask(index) {
        const newText = prompt('Edit task title:', tasks[index].text);
        const newTime = prompt('Edit task time (YYYY-MM-DDTHH:MM):', tasks[index].time);
        if (newText !== null && newText.trim() !== '' && newTime) {
            tasks[index].text = newText.trim();
            tasks[index].time = newTime;
            saveTasks();
            renderTasks();
        }
    }

    function deleteTask(index) {
        tasks.splice(index, 1);
        saveTasks();
        renderTasks();
    }

    function toggleTask(index) {
        tasks[index].completed = !tasks[index].completed;
        saveTasks();
        renderTasks();
    }

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            renderTasks(btn.getAttribute('data-filter'));
        });
    });

    addTaskBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') addTask();
    });

    renderTasks();
});
