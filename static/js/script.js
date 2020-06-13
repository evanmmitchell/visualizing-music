"use strict";

let renderer, scene, camera, controls, player, instrumentPromise, objectsInScene = [];


initialize();
animate();


function initialize() {
  initializeAudio();
  initializeThreeJS();

  let fileInput = document.getElementById("fileInput");
  fileInput.oninput = event => {
    let midiFile = event.target.files[0];

    if (!midiFile) {
      return;
    }

    let title = document.getElementById("title");
    title.textContent = "Loading...";

    let playerControls = document.getElementById("player");
    playerControls.style.display = "none";

    player?.stop();

    for (let object of objectsInScene) {
      object.material.dispose();
      object.geometry.dispose();
    }
    scene.remove(...objectsInScene);
    objectsInScene = [];

    loadMidi(midiFile);
  };

  loadMidi();
}

function animate() {
  requestAnimationFrame(animate);

  // TODO: Use THREE.Clock for time in dynamic visualization
  renderer.render(scene, camera);

  updatePlayTime();
}

function initializeAudio() {
  let AudioContext = window.AudioContext ?? window.webkitAudioContext;
  let audioContext = new AudioContext();
  unmute(audioContext);
  instrumentPromise = Soundfont.instrument(audioContext, "static/js/lib/soundfont-player/acoustic_grand_piano-mp3.js");

  let slider = document.getElementById("slider");
  slider.step = Number.MIN_VALUE;
  let wasPlaying = false;
  slider.oninput = () => {
    if (player?.isPlaying) {
      player.pause();
      wasPlaying = true;
    }
  };
  slider.onchange = () => {
    if (wasPlaying) {
      play();
      wasPlaying = false;
    }
  };

  let playButton = document.getElementById("play");
  let pauseButton = document.getElementById("pause");
  let stopButton = document.getElementById("stop");
  playButton.onclick = play;
  pauseButton.onclick = () => player?.pause();
  stopButton.onclick = () => player?.stop();

  const SPACE_BAR = 32;
  window.onkeydown = event => {
    if (event.which === SPACE_BAR) {
      player?.isPlaying ? player.pause() : play();
      event.preventDefault();
    }
  };

  function play() {
    if (player) {
      let playTime = slider.value / 100 * player.songTime;
      player.play(playTime);
    }
  }
}

function initializeThreeJS() {
  renderer = new THREE.WebGLRenderer({ alpha: true });
  document.body.appendChild(renderer.domElement);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  scene = new THREE.Scene();
  let ambientLight = new THREE.AmbientLight(0xFFFFFF);
  scene.add(ambientLight);
  let directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  let frustumSize = 10;
  let aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.OrthographicCamera(frustumSize * aspectRatio / -2, frustumSize * aspectRatio / 2, frustumSize / 2, frustumSize / -2);
  window.onresize = () => {
    renderer.setSize(window.innerWidth, window.innerHeight);
    aspectRatio = window.innerWidth / window.innerHeight;
    camera.left = frustumSize * aspectRatio / -2;
    camera.right = frustumSize * aspectRatio / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();
  };

  // TODO: Change to trackball control
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.onchange = () => {
    directionalLight.position.copy(camera.position);
    let directionalLightDisplacementVector = new THREE.Vector3(-3, 2, -1);  // TODO: Fix to follow camera orientation
    // directionalLight.position.add(directionalLightDisplacementVector);
  };
}

function loadMidi(midiFile) {
  let formData = new FormData();
  formData.append("midiFile", midiFile);
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/process-midi", true);

  let title = document.getElementById("title");
  xhr.onreadystatechange = () => {
    if (xhr.readyState !== 4 || xhr.status !== 200) {
      return;
    }

    let response = JSON.parse(xhr.responseText);

    let exception = response.exception;
    if (exception) {
      title.textContent = exception;
      return;
    }

    let song = response.song;
    title.textContent = song.title;
    loadAudio(song);
    loadVisualization(song);
  };

  xhr.send(formData);
}

function updatePlayTime() {
  if (!player) {
    return;
  }

  let slider = document.getElementById("slider");

  if (player.isPlaying) {
    let playPercent = player.playTime / player.songTime * 100;
    slider.value = playPercent;
  }

  let songTimeMinutes = String(Math.floor(player.songTime / 60));
  let currentTime = Math.round(slider.value / 100 * player.songTime);
  let currentMinutes = String(Math.floor(currentTime / 60));
  let currentSeconds = String(currentTime % 60);
  let playTime = document.getElementById("playTime");
  playTime.textContent = currentMinutes.padStart(songTimeMinutes.length, "0") + ":" + currentSeconds.padStart(2, "0");
}

async function loadAudio(song) {
  let instrument = await instrumentPromise;
  player = new Player(instrument, song);

  let minutes = Math.floor(player.songTime / 60);
  let seconds = Math.round(player.songTime % 60);
  let endTime = document.getElementById("endTime");
  endTime.textContent = minutes + ":" + seconds;

  let slider = document.getElementById("slider");
  slider.value = 0;

  let playButton = document.getElementById("play");
  let pauseButton = document.getElementById("pause");
  player.on("play", () => {
    playButton.style.display = "none";
    pauseButton.style.display = "initial";
  });
  player.on("stop", () => {
    slider.value = 0;
  });
  player.on("stopPlaying", () => {
    playButton.style.display = "initial";
    pauseButton.style.display = "none";
  });

  let playerControls = document.getElementById("player");
  playerControls.style.display = "flex";
}

function loadVisualization(song) {
  staticRectangularVisualization(song);
  // staticSphericalVisualization(song);

  // TODO: Set camera's z position using song.minTrack
  // TODO: Set camera's near/far using song.maxTrack
  camera.near = -500;
  camera.far = 500;
  camera.updateProjectionMatrix();
  camera.position.set(0, 0, 3);
  controls.update();
}

function staticRectangularVisualization(song) {
  let colors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];

  let pitchDisplacement = song.minPitch + (song.maxPitch - song.minPitch) / 2;
  let xScaleFactor = 1.5;
  let yScaleFactor = 0.25;
  let zScaleFactor = 0.25;
  let zSpacing = 2;

  for (let note of song.notes) {
    let boxGeometry = new THREE.BoxGeometry(note.duration * xScaleFactor, yScaleFactor, zScaleFactor);
    let boxMaterial = new THREE.MeshStandardMaterial({
      color: colors[note.track % colors.length], transparent: true, opacity: note.velocity * 0.5
    });
    let box = new THREE.Mesh(boxGeometry, boxMaterial);
    let xPosition = (note.time + note.duration / 2 - song.startTime) * xScaleFactor;
    let yPosition = (note.pitch - pitchDisplacement) * yScaleFactor;
    let zPosition = -(note.track - song.minTrack) * zScaleFactor * zSpacing;
    box.position.set(xPosition, yPosition, zPosition);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);
    objectsInScene.push(box);

    let edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
    let edgesMaterial = new THREE.LineBasicMaterial({
      color: boxMaterial.color, transparent: boxMaterial.transparent, opacity: boxMaterial.opacity + 0.1
    });
    let edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    edges.position.copy(box.position);
    edges.castShadow = box.castShadow;
    edges.receiveShadow = box.receiveShadow;
    scene.add(edges);
    objectsInScene.push(edges);
  }
}

function staticSphericalVisualization(song) {
  let colors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];

  let durationScaleFactor = 1.5;
  let radiusScaleFactor = 100 / (song.maxPitch - song.minPitch);
  let thetaScaleFactor = 2 * Math.PI / (song.endTime - song.startTime);

  for (let note of song.notes) {
    let sphereGeometry = new THREE.SphereGeometry(note.duration * durationScaleFactor);
    let sphereMaterial = new THREE.MeshStandardMaterial({
      color: colors[note.track % colors.length], transparent: true, opacity: note.velocity * 0.5
    });
    let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    let radius = (note.pitch - song.minPitch) * radiusScaleFactor;
    let theta = (note.time - song.startTime) * thetaScaleFactor;
    let depth = -note.track + song.minTrack;
    sphere.position.setFromCylindricalCoords(radius, theta, depth);
    sphere.rotateY(Math.PI / 2); //Hopefully doesn't just rotate sphere
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);
    objectsInScene.push(sphere);
  }
}
