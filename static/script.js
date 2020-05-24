"use strict";

let COLORS = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];
let directionalLightDisplacementVector = new THREE.Vector3(-3, 2, -1);  // TODO: Fix to follow camera orientation
let renderer, scene, camera, controls, player, playerPromise, objectsInScene = [];


initialize();
animate();


function initialize() {
  playerPromise = initializePlayer();
  initializeThreeJS();

  let fileInput = document.getElementById("fileInput");
  let title = document.getElementById("title");
  let playerControls = document.getElementById("player");
  fileInput.addEventListener("change", function (event) {
    title.textContent = "Loading...";
    playerControls.style.display = "none";

    for (let object of objectsInScene) {
      object.material.dispose();
      object.geometry.dispose();
    }
    scene.remove(...objectsInScene);
    objectsInScene = [];

    let midiFile = event.target.files[0];
    loadMidi(midiFile);
  });

  let wasPlaying = false;
  let slider = document.getElementById("slider");
  slider.addEventListener("input", function () {
    if (player.isPlaying()) {
      wasPlaying = true;
      player.pause();
    }
    player.skipToPercent(this.value);
    setCurrentTime();
  });
  slider.addEventListener("change", function () {
    if (wasPlaying) {
      player.play();
      wasPlaying = false;
    }
  });

  let playButton = document.getElementById("play");
  let pauseButton = document.getElementById("pause");
  let stopButton = document.getElementById("stop");
  playButton.addEventListener("click", function () { player.play(); });
  pauseButton.addEventListener("click", function () { player.pause(); });
  stopButton.addEventListener("click", function () { player.stop(); });

  loadMidi();
}

function animate() {
  requestAnimationFrame(animate);
  // TODO: Use THREE.Clock for time in dynamic visualization
  renderer.render(scene, camera);
}

async function initializePlayer() {
  let AudioContext = window.AudioContext || window.webkitAudioContext || false;
  let ac = new AudioContext || new webkitAudioContext;
  unmute(ac);
  let instrument = await Soundfont.instrument(ac, "/static/libs/soundfont-player/acoustic_grand_piano-mp3.js");
  player = new MidiPlayer.Player(function (event) {
    if (event.name == "Note on") {
      instrument.play(event.noteName, ac.currentTime, { gain: event.velocity / 100 });
    } else if (event.name == "Note off") {
      instrument.play(event.noteName, ac.currentTime, { gain: 0 });
    }
  });
  player.on("fileLoaded", function () {
    let songTime = player.getSongTime();
    let minutes = Math.floor(songTime / 60);
    let seconds = Math.round(songTime % 60);
    let endTime = document.getElementById("endTime");
    endTime.textContent = minutes + ":" + seconds;
    setCurrentTime();

    let playerControls = document.getElementById("player");
    playerControls.style.display = "block";
  });
  player.on("playing", setCurrentTime);
  player.on("stop", setCurrentTime);

  let playButton = document.getElementById("play");
  let pauseButton = document.getElementById("pause");
  player.on("play", function () {
    playButton.style.display = "none";
    pauseButton.style.display = "inline-block";
  });
  player.on("pause", function () {
    playButton.style.display = "inline-block";
    pauseButton.style.display = "none";
  });
  player.on("stop", function () {
    playButton.style.display = "inline-block";
    pauseButton.style.display = "none";
  });

  player.sampleRate = 0;
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
  window.addEventListener("resize", function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    aspectRatio = window.innerWidth / window.innerHeight;
    camera.left = frustumSize * aspectRatio / -2;
    camera.right = frustumSize * aspectRatio / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();
  });

  // TODO: Change to trackball control
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.addEventListener("change", function () {
    directionalLight.position.copy(camera.position);
    // directionalLight.position.add(directionalLightDisplacementVector);
  });
}

function loadMidi(midiFile) {
  let formData = new FormData();
  formData.append("midiFile", midiFile);
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/process-midi", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == "200") {
      let response = JSON.parse(xhr.responseText);
      let title = document.getElementById("title");
      title.textContent = response.title;
      loadVisualization(response.notes);
      loadAudio(response.contents);
    }
  };
  xhr.send(formData);
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

  // TODO: Set camera's z position instead of passing minTrack
  staticRectangularVisualization(notes, minPitch, maxPitch, minTrack, startTime);
  // staticSphericalVisualization(notes, minPitch, maxPitch, minTrack, startTime, endTime);

  camera.near = -500;
  camera.far = 500;  // TODO: Variable near/far with maxTrack
  camera.updateProjectionMatrix();
  camera.position.set(0, 0, 3);
  controls.update();
}

async function loadAudio(midiFileContents) {
  let arrayBuffer = base64DecToArr(midiFileContents).buffer;

  await playerPromise;
  player.stop();
  player.loadArrayBuffer(arrayBuffer);
}

function staticRectangularVisualization(notes, minPitch, maxPitch, minTrack, startTime) {
  let pitchDisplacement = minPitch + (maxPitch - minPitch) / 2;
  let xScaleFactor = 1.5;
  let yScaleFactor = 0.25;
  let zScaleFactor = 0.25;
  let zSpacing = 2;

  for (let note of notes) {
    note.duration = note.end - note.start;
    let boxGeometry = new THREE.BoxGeometry(note.duration * xScaleFactor, yScaleFactor, zScaleFactor);
    let boxMaterial = new THREE.MeshStandardMaterial({
      color: COLORS[note.track % COLORS.length], transparent: true, opacity: note.velocity * 0.5
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

function staticSphericalVisualization(notes, minPitch, maxPitch, minTrack, startTime, endTime) {
  let durationScaleFactor = 1.5;
  let radiusScaleFactor = 100 / (maxPitch - minPitch);
  let thetaScaleFactor = 2 * Math.PI / (endTime - startTime);

  for (let note of notes) {
    note.duration = note.end - note.start;
    let sphereGeometry = new THREE.SphereGeometry(note.duration * durationScaleFactor);
    let sphereMaterial = new THREE.MeshStandardMaterial({
      color: COLORS[note.track % COLORS.length], transparent: true, opacity: note.velocity * 0.5
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

function setCurrentTime() {
  let currentTime = Math.round(player.getSongTime() - player.getSongTimeRemaining());
  let minutes = Math.floor(currentTime / 60);
  let seconds = currentTime % 60;
  let playTime = document.getElementById("playTime");
  playTime.textContent = minutes + ":" + (seconds < 10 ? "0" : "") + seconds;

  let slider = document.getElementById("slider");
  slider.value = 100 - player.getSongPercentRemaining();
}
