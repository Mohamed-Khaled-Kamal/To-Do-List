
let input = document.querySelector(".input");
let fileInput = document.querySelector(".file-input");
let submit = document.querySelector(".add");
let taskDiv = document.querySelector(".tasks");
let recordBtn = document.querySelector(".record-btn");

let mediaRecorder;
let audioChunks = [];
let isRecording = false;
let recordedAudio = null; // تخزين التسجيل المؤقت قبل إضافته للمهمة

let ArryOfTasks = [];

if (localStorage.getItem("task")) {
    ArryOfTasks = JSON.parse(localStorage.getItem("task"));
}

getLocalStorage();

submit.onclick = function () {
    let textValue = input.value.trim();
    let file = fileInput.files[0];
    let fileData = null;

    if (textValue !== "" || file || recordedAudio) {
        if (file) {
            let reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = function () {
                fileData = reader.result;
                AddTaskToArry(textValue, fileData, recordedAudio);
                resetInputs();
            };
        } else {
            AddTaskToArry(textValue, null, recordedAudio);
            resetInputs();
        }
    }
};

// ⏺️ بدء وإيقاف التسجيل عند الضغط على الزر
recordBtn.onclick = function () {
    if (!isRecording) {
        startRecording();
    } else {
        stopRecording();
    }
};

// ⏺️ بدء التسجيل
function startRecording() {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
        mediaRecorder = new MediaRecorder(stream);
        mediaRecorder.start();
        isRecording = true;
        recordedAudio = null; // إعادة تعيين التسجيل السابق
        recordBtn.textContent = "⏹️ ";

        mediaRecorder.ondataavailable = (event) => {
            audioChunks.push(event.data);
        };

        mediaRecorder.onstop = () => {
            let audioBlob = new Blob(audioChunks, { type: "audio/webm" });
            let reader = new FileReader();
            reader.readAsDataURL(audioBlob);
            reader.onload = function () {
                recordedAudio = reader.result; // حفظ التسجيل لاستخدامه لاحقًا
                audioChunks = [];
            };
            isRecording = false;
            recordBtn.textContent = "";
        };
    });
}

// ⏹️ إيقاف التسجيل
function stopRecording() {
    mediaRecorder.stop();
}

// 🔄 إعادة تعيين الحقول بعد الإضافة
function resetInputs() {
    input.value = "";
    fileInput.value = "";
    recordedAudio = null; // إعادة تعيين التسجيل بعد الإضافة
}

taskDiv.addEventListener("click", (e) => {
    if (e.target.classList.contains("del")) {
        deleteTaskWith(e.target.parentElement.getAttribute("data-id"));
        e.target.parentElement.remove();
    }
    if (e.target.classList.contains("task")) {
        toggleStatusTaskWith(e.target.getAttribute("data-id"));
        e.target.classList.toggle("done");
    }
});

function AddTaskToArry(Tasktext, fileData, audioData) {
    const task = {
        id: Date.now(),
        title: Tasktext || "", // إذا لم يكن هناك نص، يصبح نصًا فارغًا
        completed: false,
        file: fileData,
        audio: audioData,
        createdAt: new Date().toLocaleString() // تسجيل الوقت والتاريخ الحالي
    };
    ArryOfTasks.push(task);
    addElementToPageFrom(ArryOfTasks);
    addToLocalStorage(ArryOfTasks);
}

function addElementToPageFrom(ArryOfTasks) {
    taskDiv.innerHTML = "";
    ArryOfTasks.forEach((task) => {
        let Div = document.createElement("div");
        Div.className = "task";
        if (task.completed) {
            Div.className = "task done";
        }
        Div.setAttribute("data-id", task.id);

        if (task.title) {
            let taskText = document.createElement("p");
            taskText.textContent = task.title;
            Div.appendChild(taskText);
        }

        // عرض التاريخ والوقت في الأسفل يمين
        if (task.createdAt) {
            let taskDate = document.createElement("span");
            taskDate.className = "task-date";
            taskDate.textContent = `Created At: ${task.createdAt}`;
            taskDate.style.fontSize = "12px"; // تحديد حجم الخط ليكون صغيرًا
            taskDate.style.position = "absolute"; // تحديد الموقع
            taskDate.style.bottom = "5px"; // تحديد الموقع في الأسفل
            taskDate.style.right = "5px"; // تحديد الموقع على اليمين
            taskDate.style.color = "#888"; // تغيير اللون ليكون فاتحًا ليتناسب مع الخلفية
            taskDate.style.backgroundColor = "transparent"; // إزالة الخلفية
            taskDate.style.padding = "0"; // إزالة الحواف إذا كانت موجودة
            Div.style.position = "relative"; // لتحديد أن العناصر داخل الـ Div يتم تحديد مكانها بشكل نسبي
            Div.appendChild(taskDate);
        }

        if (task.file) {
            let filePreview;
            if (task.file.startsWith("data:image")) {
                filePreview = document.createElement("img");
                filePreview.src = task.file;
                filePreview.className = "task-image";
            } else {
                filePreview = document.createElement("a");
                filePreview.href = task.file;
                filePreview.textContent = "📂 View File";
                filePreview.target = "_blank";
                filePreview.download = "file";
            }
            Div.appendChild(filePreview);
        }

        if (task.audio) {
            let audioPlayer = document.createElement("audio");
            audioPlayer.src = task.audio;
            audioPlayer.controls = true;
            Div.appendChild(audioPlayer);
        }

        let span = document.createElement("span");
        span.className = "del cbtn";
        span.innerHTML = `<i class="fas fa-trash-alt"></i>`;
        Div.appendChild(span);

        taskDiv.appendChild(Div);
    });
}

function addToLocalStorage(ArryOfTasks) {
    window.localStorage.setItem("task", JSON.stringify(ArryOfTasks));
}

function getLocalStorage() {
    let data = window.localStorage.getItem("task");
    if (data) {
        ArryOfTasks = JSON.parse(data);
        addElementToPageFrom(ArryOfTasks);
    }
}

function deleteTaskWith(taskID) {
    ArryOfTasks = ArryOfTasks.filter((task) => task.id != taskID);
    addToLocalStorage(ArryOfTasks);
}

function toggleStatusTaskWith(taskID) {
    for (let i = 0; i < ArryOfTasks.length; i++) {
        if (ArryOfTasks[i].id == taskID) {
            ArryOfTasks[i].completed = !ArryOfTasks[i].completed;
        }
    }
    addToLocalStorage(ArryOfTasks);
}
