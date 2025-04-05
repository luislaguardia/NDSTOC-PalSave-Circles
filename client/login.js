let streamStarted = false;

function showScreen(id) {
  // Hide all screens
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.add('hidden');
    screen.classList.remove('active');
  });

  // Show the selected screen
  const target = document.getElementById(id);
  if (target) {
    target.classList.remove('hidden');
    target.classList.add('active');
  }

  // If going to verify screen, start the camera
  if (id === 'verify-screen') {
    startCamera();
  }
}

function handleLogin() {
  const email = document.getElementById('login-email').value.trim();
  const password = document.getElementById('login-password').value.trim();

  if (email === 'user@circles.com' && password === '1234') {
    alert('Login successful!');
    window.location.href = 'dashboard.html'; // Redirect to your app
  } else {
    alert('Invalid email or password');
  }
}

function finishRegister() {
  alert('🎉 Registration complete!');
  window.location.href = 'dashboard.html'; // Redirect after register
}

function showModal() {
  document.getElementById('id-modal').classList.remove('hidden');
}

function hideModal() {
  document.getElementById('id-modal').classList.add('hidden');
}

// CAMERA SUPPORT BELOW

function startCamera() {
  const video = document.getElementById("camera-preview");

  if (streamStarted || !video) return;

  navigator.mediaDevices.getUserMedia({ video: true })
    .then(stream => {
      video.srcObject = stream;
      streamStarted = true;
    })
    .catch(err => {
      alert("Camera access denied or not available.");
      console.error(err);
    });
}

function captureID() {
  const video = document.getElementById("camera-preview");
  const canvas = document.getElementById("captured-id");
  const status = document.getElementById("camera-status");

  if (!video || !canvas || !status) return;

  const ctx = canvas.getContext("2d");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

  canvas.classList.remove("hidden");
  status.innerText = "ID captured successfully! You may now register.";
}