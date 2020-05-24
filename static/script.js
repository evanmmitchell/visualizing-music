"use strict";

let renderer, scene, camera, controls, player, playerPromise, objectsInScene = [];


initialize();
animate();


function initialize() {
  let fileInput = document.getElementById("fileInput");
  let title = document.getElementById("title");
  let playerControls = document.getElementById("player");
  fileInput.onchange = event => {
    title.textContent = "Loading...";
    playerControls.style.display = "none";

    if (player) {
      player.stop();
    }

    for (let object of objectsInScene) {
      object.material.dispose();
      object.geometry.dispose();
    }
    scene.remove(...objectsInScene);
    objectsInScene = [];

    let midiFile = event.target.files[0];
    loadMidi(midiFile);
  };

  playerPromise = initializeAudio();
  initializeThreeJS();

  loadMidi();
}

function animate() {
  requestAnimationFrame(animate);
  // TODO: Use THREE.Clock for time in dynamic visualization
  renderer.render(scene, camera);
}

async function initializeAudio() {
  let AudioContext = window.AudioContext ?? window.webkitAudioContext;
  let audioContext = new AudioContext();
  unmute(audioContext);
  let instrument = await Soundfont.instrument(audioContext, "/static/libs/soundfont-player/acoustic_grand_piano-mp3.js");

  player = new MidiPlayer.Player(function (event) {
    if (event.name == "Note on") {
      instrument.play(event.noteName, audioContext.currentTime, { gain: event.velocity / 100 });
    }
  });
  player.on("fileLoaded", function () {
    let songTime = player.getSongTime();
    let minutes = Math.floor(songTime / 60);
    let seconds = Math.round(songTime % 60);
    let endTime = document.getElementById("endTime");
    endTime.textContent = minutes + ":" + seconds;
    updatePlayTime();

    let playerControls = document.getElementById("player");
    playerControls.style.display = "block";
  });
  player.on("playing", updatePlayTime);
  player.on("stop", updatePlayTime);

  let playButton = document.getElementById("play");
  let pauseButton = document.getElementById("pause");
  let stopButton = document.getElementById("stop");
  playButton.onclick = () => player.play();
  pauseButton.onclick = () => player.pause();
  stopButton.onclick = () => player.stop();

  player.on("play", () => {
    playButton.style.display = "none";
    pauseButton.style.display = "inline-block";
  });
  player.on("pause", () => {
    playButton.style.display = "inline-block";
    pauseButton.style.display = "none";
  });
  player.on("stop", () => {
    playButton.style.display = "inline-block";
    pauseButton.style.display = "none";
  });

  player.sampleRate = 0;

  let slider = document.getElementById("slider");
  slider.step = Number.MIN_VALUE;
  let wasPlaying = false;
  slider.oninput = () => {
    if (player.isPlaying()) {
      player.pause();
      wasPlaying = true;
    }
    player.skipToPercent(slider.value);
    updatePlayTime();
  };
  slider.onchange = () => {
    if (wasPlaying) {
      player.play();
      wasPlaying = false;
    }
  };

  const SPACE = 32;
  window.onkeydown = event => {
    if (event.which === SPACE && player) {
      player.isPlaying() ? player.pause() : player.play();
      event.preventDefault();
    }
  };
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

  const frustumSize = 10;
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
    if (xhr.readyState === 4 && xhr.status === 200) {
      let response = JSON.parse(xhr.responseText);
      title.textContent = response.title;
      loadAudio(response.contents);
      loadVisualization(response.notes);
    }
  };

  xhr.send(formData);
}

async function loadAudio(midiFileContents) {
  let arrayBuffer = base64DecToArr(midiFileContents).buffer;

  await playerPromise;
  player.loadArrayBuffer(arrayBuffer);
}

function loadVisualization(notes) {
  let minPitch = Infinity, maxPitch = -Infinity;
  let minTrack = Infinity, maxTrack = -Infinity;
  let startTime = Infinity, endTime = -Infinity;
  for (let note of notes) {
    minPitch = Math.min(minPitch, note.pitch);
    maxPitch = Math.max(maxPitch, note.pitch);
    minTrack = Math.min(minTrack, note.track);
    maxTrack = Math.max(maxTrack, note.track);
    startTime = Math.min(startTime, note.start);
    endTime = Math.max(endTime, note.end);
  }

  let colors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];
  // TODO: Set camera's z position instead of passing minTrack
  staticRectangularVisualization(notes, minPitch, maxPitch, minTrack, startTime, colors);
  // staticSphericalVisualization(notes, minPitch, maxPitch, minTrack, startTime, endTime, colors);

  camera.near = -500;
  camera.far = 500;  // TODO: Variable near/far with maxTrack
  camera.updateProjectionMatrix();
  camera.position.set(0, 0, 3);
  controls.update();
}

function staticRectangularVisualization(notes, minPitch, maxPitch, minTrack, startTime, colors) {
  let pitchDisplacement = minPitch + (maxPitch - minPitch) / 2;
  let xScaleFactor = 1.5;
  let yScaleFactor = 0.25;
  let zScaleFactor = 0.25;
  let zSpacing = 2;

  for (let note of notes) {
    let boxGeometry = new THREE.BoxGeometry(note.duration * xScaleFactor, yScaleFactor, zScaleFactor);
    let boxMaterial = new THREE.MeshStandardMaterial({
      color: colors[note.track % colors.length], transparent: true, opacity: note.velocity * 0.5
    });
    let box = new THREE.Mesh(boxGeometry, boxMaterial);
    let xPosition = (note.start + note.duration / 2 - startTime) * xScaleFactor;
    let yPosition = (note.pitch - pitchDisplacement) * yScaleFactor;
    let zPosition = -(note.track - minTrack) * zScaleFactor * zSpacing;
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

function staticSphericalVisualization(notes, minPitch, maxPitch, minTrack, startTime, endTime, colors) {
  let durationScaleFactor = 1.5;
  let radiusScaleFactor = 100 / (maxPitch - minPitch);
  let thetaScaleFactor = 2 * Math.PI / (endTime - startTime);

  for (let note of notes) {
    let sphereGeometry = new THREE.SphereGeometry(note.duration * durationScaleFactor);
    let sphereMaterial = new THREE.MeshStandardMaterial({
      color: colors[note.track % colors.length], transparent: true, opacity: note.velocity * 0.5
    });
    let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    let radius = (note.pitch - minPitch) * radiusScaleFactor;
    let theta = (note.start - startTime) * thetaScaleFactor;
    let depth = -note.track + minTrack;
    sphere.position.setFromCylindricalCoords(radius, theta, depth);
    sphere.rotateY(Math.PI / 2); //Hopefully doesn't just rotate sphere
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);
    objectsInScene.push(sphere);
  }
}

function updatePlayTime() {
  let currentTime = Math.round(player.getSongTime() - player.getSongTimeRemaining());
  let minutes = Math.floor(currentTime / 60);
  let seconds = currentTime % 60;
  let playTime = document.getElementById("playTime");
  playTime.textContent = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;

  let slider = document.getElementById("slider");
  slider.value = 100 - player.getSongPercentRemaining();
}
