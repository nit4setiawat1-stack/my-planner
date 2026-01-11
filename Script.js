const clockElement = document.getElementById('clock');
const dateElement = document.getElementById('date');
const inputTask = document.getElementById('todoInput');
const inputDate = document.getElementById('dateInput');
const addBtn = document.getElementById('addBtn');
const list = document.getElementById('todoList');

// 1. Minta Izin Notifikasi saat halaman dimuat
document.addEventListener('DOMContentLoaded', () => {
    if (Notification.permission !== "granted") {
        Notification.requestPermission();
    }
    renderList();
});

// 2. Update Jam & Cek Jadwal
function updateTime() {
    const now = new Date();
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    clockElement.textContent = now.toLocaleTimeString('id-ID');
    dateElement.textContent = now.toLocaleDateString('id-ID', options);
    
    checkSchedule(now);
}
setInterval(updateTime, 1000);

// 3. Cek apakah ada jadwal yang tepat waktu sekarang
function checkSchedule(now) {
    let todos = localStorage.getItem('myAdvancedSchedule') ? JSON.parse(localStorage.getItem('myAdvancedSchedule')) : [];
    const nowTime = now.getTime();
    let updated = false;

    todos.forEach((todo, index) => {
        const todoTime = new Date(todo.time).getTime();

        // Jika waktu sekarang sudah melewati atau pas dengan waktu jadwal
        if (nowTime >= todoTime) {
            // Kirim Notifikasi
            sendNotification(todo.task);
            
            // Hapus dari daftar karena sudah selesai/lewat
            todos.splice(index, 1);
            updated = true;
        }
    });

    if (updated) {
        localStorage.setItem('myAdvancedSchedule', JSON.stringify(todos));
        renderList();
    }
}

// 4. Fungsi Mengirim Notifikasi
function sendNotification(taskName) {
    if (Notification.permission === "granted") {
        new Notification("Waktunya Kegiatan!", {
            body: `Sekarang: ${taskName}`,
            icon: "https://cdn-icons-png.flaticon.com/512/3112/3112946.png" // Ikon lonceng
        });
        
        // Opsional: Bunyi Beep (Suara)
        const audio = new Audio('https://actions.google.com/sounds/v1/alarms/beep_short.ogg');
        audio.play();
    }
}

// 5. Logika Tambah & Render (Sama seperti sebelumnya)
addBtn.addEventListener('click', addTodo);

function addTodo() {
    const taskValue = inputTask.value;
    const dateValue = inputDate.value;

    if (taskValue === '' || dateValue === '') {
        alert("Isi nama kegiatan dan waktunya!");
        return;
    }

    const todoObject = { id: Date.now(), task: taskValue, time: dateValue };
    let todos = localStorage.getItem('myAdvancedSchedule') ? JSON.parse(localStorage.getItem('myAdvancedSchedule')) : [];
    todos.push(todoObject);
    todos.sort((a, b) => new Date(a.time) - new Date(b.time));
    localStorage.setItem('myAdvancedSchedule', JSON.stringify(todos));
    
    renderList();
    inputTask.value = '';
    inputDate.value = '';
}

function renderList() {
    list.innerHTML = '';
    let todos = localStorage.getItem('myAdvancedSchedule') ? JSON.parse(localStorage.getItem('myAdvancedSchedule')) : [];
    
    todos.forEach(todo => {
        const dateObj = new Date(todo.time);
        const formattedTime = dateObj.toLocaleString('id-ID', {
            day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
        });

        const li = document.createElement('li');
        li.innerHTML = `
            <div class="todo-info">
                <strong>${todo.task}</strong>
                <span class="todo-time">📅 ${formattedTime}</span>
            </div>
            <button class="delete-btn" onclick="manualRemove(${todo.id})">Hapus</button>
        `;
        list.appendChild(li);
    });
}

function manualRemove(id) {
    let todos = JSON.parse(localStorage.getItem('myAdvancedSchedule'));
    const filteredTodos = todos.filter(todo => todo.id !== id);
    localStorage.setItem('myAdvancedSchedule', JSON.stringify(filteredTodos));
    renderList();
}