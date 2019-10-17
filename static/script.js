let scene, camera, renderer, controls, directionalLight, notes, objectsInScene = [];
const directionalLightDisplacementVector = new THREE.Vector3(-3, 2, -1);  // TODO: Fix to follow camera orientation
const COLORS = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];
let Player;

initialize();
animate();

function initialize() {
  let fileInput = document.getElementById("fileInput");
  fileInput.addEventListener("change", function (event) {
    let midiFile = event.target.files[0];
    if (Player) {
      stopPlayer();
    }
    visualizeMidi(midiFile);
    loadPlayer(midiFile);
  });

  playButton = document.getElementById("player-play");
  playButton.addEventListener("click", function() {
    // if first time, initialize
    togglePausePlay();
  });

  pauseButton = document.getElementById("player-pause");
  pauseButton.addEventListener("click", togglePausePlay);

  stopButton = document.getElementById("player-stop");
  stopButton.addEventListener("click", stopPlayer);

  renderer = new THREE.WebGLRenderer({ alpha: true });
  let canvas = renderer.domElement;
  document.body.appendChild(canvas);
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.shadowMap.enabled = true;

  scene = new THREE.Scene();

  let ambientLight = new THREE.AmbientLight(0xFFFFFF);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  camera = new THREE.OrthographicCamera()

  // TODO: change to trackball control
  controls = new THREE.OrbitControls(camera, canvas);

  visualizeMidi();
}

function animate() {
  requestAnimationFrame(animate);

  directionalLight.position.copy(camera.position);
  directionalLight.position.add(directionalLightDisplacementVector);

  // Use THREE.Clock for time in dynamic visualization

  renderer.render(scene, camera);
}

function visualizeMidi(midiFile) {
  let formData = new FormData();
  formData.append("midiFile", midiFile)
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/process-midi", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == "200") {
      let response = JSON.parse(xhr.responseText);
      let title = document.getElementById("title");
      title.textContent = response[0];
      notes = response[1];
      updateMusicVisualization();
    }
  };
  xhr.send(formData);
  return;
}

function loadPlayer(midiFile) {
  let AudioContext = window.AudioContext || window.webkitAudioContext || false;
  let ac = new AudioContext || new webkitAudioContext;
  Soundfont.instrument(ac, 'https://raw.githubusercontent.com/gleitz/midi-js-soundfonts/gh-pages/MusyngKite/acoustic_guitar_nylon-mp3.js').then(function(instrument) {
    Player = new MidiPlayer.Player(function(event) {
      if (event.name == 'Note on') {
        instrument.play(event.noteName, ac.currentTime, {gain:event.velocity/100});
      }
    });

  	if (midiFile) {
      let reader  = new FileReader();
      reader.readAsArrayBuffer(midiFile);
      reader.addEventListener("load", function () {
        Player.loadArrayBuffer(reader.result);
      }, false);
    } else {
      // doesn't work for default file
      Player.loadFile("sample-midi/happy-birthday-simplified.mid");
    }
  });
}

function updateMusicVisualization() {
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
  staticRectangularVisualization(minPitch, maxPitch, minTrack, startTime);
  // staticSphericalVisualization(minPitch, maxPitch, minTrack, startTime, endTime);

  let frustumSize = 10;
  let canvas = renderer.domElement;
  let aspectRatio = canvas.offsetWidth / canvas.offsetHeight;
  camera.left = frustumSize * aspectRatio / -2;
  camera.right = frustumSize * aspectRatio / 2;
  camera.top = frustumSize / 2;
  camera.bottom = frustumSize / -2;
  camera.near = -50;
  camera.far = 50;  // TODO: Variable near/far with maxTrack
  camera.updateProjectionMatrix();
  camera.position.set(0, 0, 3);
  controls.update()
}

function staticRectangularVisualization(minPitch, maxPitch, minTrack, startTime) {
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

function staticSphericalVisualization(minPitch, maxPitch, minTrack, startTime, endTime) {
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
    sphere.rotateY(Math.PI / 2); //Hopefully doesnt just rotate sphere
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);
    objectsInScene.push(sphere);
  }
}

function stopPlayer() {
  Player.stop();
  playButton.style.display = "inline-block";
  pauseButton.style.display = "none";
}

function togglePausePlay() {
  if (Player.isPlaying()) {
    playButton.style.display = "inline-block";
    pauseButton.style.display = "none";
    Player.pause();
  } else {
    pauseButton.style.display = "inline-block";
    playButton.style.display = "none";
    Player.play();
  }
}
