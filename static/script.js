let scene, camera, renderer, controls, directionalLight, objectsInScene = [];
const directionalLightDisplacementVector = new THREE.Vector3(-3, 2, -1);  // TODO: Fix to follow camera orientation
const COLORS = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];
let player;

initialize();
animate();

function initialize() {
  let slider = document.getElementById("slider");
  slider.addEventListener("input", function (event) {
    let wasPlaying = player.isPlaying();
    player.skipToPercent(this.value);
    setCurrentTime();
    if (wasPlaying) {
      player.play();
    }
  });

  let fileInput = document.getElementById("fileInput");
  fileInput.addEventListener("change", function (event) {
    let midiFile = event.target.files[0];
    loadMidi(midiFile);
  });

  let playButton = document.getElementById("play");
  playButton.addEventListener("click", togglePausePlay);

  let pauseButton = document.getElementById("pause");
  pauseButton.addEventListener("click", togglePausePlay);

  let stopButton = document.getElementById("stop");
  stopButton.addEventListener("click", stopPlayer);

  renderer = new THREE.WebGLRenderer({ alpha: true });
  let canvas = renderer.domElement;
  document.body.appendChild(canvas);
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;

  scene = new THREE.Scene();

  let ambientLight = new THREE.AmbientLight(0xFFFFFF);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  let frustumSize = 10;
  let aspectRatio = window.innerWidth / window.innerHeight;
  camera = new THREE.OrthographicCamera(frustumSize * aspectRatio / -2, frustumSize * aspectRatio / 2, frustumSize / 2, frustumSize / -2);

  // TODO: change to trackball control
  controls = new THREE.OrbitControls(camera, canvas);

  window.addEventListener("resize", function () {
    renderer.setSize(window.innerWidth, window.innerHeight);
    aspectRatio = window.innerWidth / window.innerHeight;
    camera.left = frustumSize * aspectRatio / -2;
    camera.right = frustumSize * aspectRatio / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();
  });

  loadMidi();
}

function animate() {
  requestAnimationFrame(animate);
  if (player) {
    setCurrentTime();
  }

  directionalLight.position.copy(camera.position);
  directionalLight.position.add(directionalLightDisplacementVector);

  // Use THREE.Clock for time in dynamic visualization

  renderer.render(scene, camera);
}

function loadMidi(midiFile) {
  let formData = new FormData();
  formData.append("midiFile", midiFile)
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/process-midi", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == "200") {
      let response = JSON.parse(xhr.responseText);

      let title = document.getElementById("title");
      title.textContent = response["title"];

      let notes = response["notes"];
      loadVisualization(notes);

      let midiFileContents = response["contents"];
      loadPlayer(midiFileContents);
    }
  };
  xhr.send(formData);
}

function loadPlayer(midiFileContents) {
  let AudioContext = window.AudioContext || window.webkitAudioContext || false;
  let ac = new AudioContext || new webkitAudioContext;
  Soundfont.instrument(ac, 'https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/MusyngKite/acoustic_grand_piano-mp3.js').then(function (instrument) {
    if (player) {
      stopPlayer();
    }
    player = new MidiPlayer.Player(function (event) {
      if (event.name == 'Note on') {
        instrument.play(event.noteName, ac.currentTime, {gain:event.velocity/100});
      }
    });
    let arrayBuffer = base64DecToArr(midiFileContents).buffer;
    player.loadArrayBuffer(arrayBuffer);

    let endTime = document.getElementById("endTime");
    let songTime = player.getSongTime();
    let minutes = Math.floor(songTime / 60);
    let seconds = Math.round(songTime % 60);
    endTime.textContent = minutes + ":" + seconds;
  });
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

  while (objectsInScene.length > 0) {
    let object = objectsInScene.pop();
    scene.remove(object);
  }

  // TODO: Set camera's z position instead of passing minTrack
  staticRectangularVisualization(notes, minPitch, maxPitch, minTrack, startTime);
  // staticSphericalVisualization(notes, minPitch, maxPitch, minTrack, startTime, endTime);

  camera.near = -500;
  camera.far = 500;  // TODO: Variable near/far with maxTrack
  camera.updateProjectionMatrix();
  camera.position.set(0, 0, 3);
  controls.update()
}

function setCurrentTime() {
  let startTime = document.getElementById("startTime");
  let currentTime = Math.round(player.getSongTime()) - player.getSongTimeRemaining();
  let minutes = Math.floor(currentTime / 60);
  let seconds = currentTime % 60;
  startTime.textContent = minutes + ":" + (seconds < 10 ? "0" : "" ) + seconds;
  let slider = document.getElementById("slider");
  slider.value = 100 - player.getSongPercentRemaining();
}

function staticRectangularVisualization(notes, minPitch, maxPitch, minTrack, startTime) {
  let pitchDisplacement = minPitch + (maxPitch - minPitch) / 2;
  let xScaleFactor = 1.5;
  let yScaleFactor = 0.25;
  let zScaleFactor = 0.25;
  let zSpacing = 2;

  for (let note of notes) {
    let boxGeometry = new THREE.BoxGeometry(note.duration * xScaleFactor, yScaleFactor, zScaleFactor);
    let boxMaterial = new THREE.MeshStandardMaterial({
      color: COLORS[note.track % COLORS.length], transparent: true, opacity: 0.3 // TODO: opacity to be dynamics
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
      color: boxMaterial.color, transparent: boxMaterial.transparent, opacity: 0.4
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
    let sphereGeometry = new THREE.SphereGeometry(note.duration * durationScaleFactor);
    let sphereMaterial = new THREE.MeshStandardMaterial({
      color: COLORS[note.track % COLORS.length], transparent: true, opacity: 0.3 // TODO: opacity to be dynamics
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

function togglePausePlay() {
  let playButton = document.getElementById("play");
  let pauseButton = document.getElementById("pause");

  if (player.isPlaying()) {
    playButton.style.display = "inline-block";
    pauseButton.style.display = "none";
    player.pause();
  } else {
    pauseButton.style.display = "inline-block";
    playButton.style.display = "none";
    player.play();
  }
}

function stopPlayer() {
  let playButton = document.getElementById("play");
  let pauseButton = document.getElementById("pause");

  player.stop();
  playButton.style.display = "inline-block";
  pauseButton.style.display = "none";
}
