// Create overlay element
const overlay = document.createElement('div');
overlay.style.position = 'fixed';
overlay.style.top = '10px';
overlay.style.right = '10px';
overlay.style.zIndex = '1000';
overlay.style.padding = '10px';
overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
overlay.style.color = 'white';
overlay.style.borderRadius = '5px';
overlay.style.cursor = 'move';  // Change cursor type on hover to indicate movability
overlay.innerHTML = `
  <button id="startBtn">Start Recording</button>
  <button id="stopBtn" disabled>Stop Recording</button>
`;

document.body.appendChild(overlay);

// Add drag functionality
let isDragging = false;
let dragOffsetX = 0;
let dragOffsetY = 0;

overlay.addEventListener('mousedown', function (event) {
    // Ensure target is the overlay itself to prevent interference with button clicks
    if (event.target === overlay) {
        isDragging = true;
        dragOffsetX = event.clientX - overlay.getBoundingClientRect().left;
        dragOffsetY = event.clientY - overlay.getBoundingClientRect().top;
        overlay.style.cursor = 'grabbing';
    }
});

document.addEventListener('mousemove', function (event) {
    if (isDragging) {
        // Calculate the new position
        const newX = event.clientX - dragOffsetX;
        const newY = event.clientY - dragOffsetY;

        // Update the position of the overlay
        overlay.style.left = `${newX}px`;
        overlay.style.right = 'auto';  // Reset right to allow movement to the left
        overlay.style.top = `${newY}px`;
    }
});

document.addEventListener('mouseup', function () {
    if (isDragging) {
        isDragging = false;
        overlay.style.cursor = 'move'; // Change cursor back
    }
});

const startBtn = document.getElementById('startBtn');
const stopBtn = document.getElementById('stopBtn');

startBtn.addEventListener('click', async () => {
    startBtn.disabled = true;
    stopBtn.disabled = false;
    chrome.runtime.sendMessage({ action: "initiate-capture" });
});

stopBtn.addEventListener('click', () => {
    startBtn.disabled = false;
    stopBtn.disabled = true;
    stopRecording();
});

let recorder;
let data = [];

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "start-recording") {
        startRecording(message.streamId);
    }
});

function startRecording(streamId) {
    const constraints = {
        video: { mandatory: { chromeMediaSource: 'desktop', chromeMediaSourceId: streamId } }
    };
    navigator.mediaDevices.getUserMedia(constraints)
        .then(stream => {
            recorder = new MediaRecorder(stream);
            recorder.ondataavailable = event => data.push(event.data);
            recorder.onstop = exportRecording;
            recorder.start();
            console.log("Recording has started.");
        })
        .catch(error => {
            console.error("Failed to start recording:", error);
        });
}

function stopRecording() {
    if (recorder) {
        debugger;
        recorder.stop();
    }
}

function exportRecording() {
    const blob = new Blob(data, { type: 'video/webm' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "recording.webm";
    a.click();
    window.URL.revokeObjectURL(url);
    data = []; // Clear the recorded data after exporting
    stopRecording();
}
