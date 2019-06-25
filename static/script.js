let canvas, scene, camera, renderer, controls, directionalLight;
let directionalLightDisplacementVector = new THREE.Vector3(-3, 2, -1);  // TODO: Fix to follow camera orientation
let displacementVector = new THREE.Vector3(), scalingVector = new THREE.Vector3(1, 1, 1), spacingVector = new THREE.Vector3(1, 1, 1);
let fileInput, title;
let objectsOnScene = [];
let colors = [0xff0000, 0xff7f00, 0xffff00, 0x00ff00, 0x0000ff, 0x4b0082, 0x9400d3];

initialize();
animate();


function initialize() {
  title = document.getElementById("title");

  fileInput = document.getElementById("fileInput");
  fileInput.addEventListener("change", visualizeMidi);

  canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.shadowMap.enabled = true;

  scene = new THREE.Scene();

  let backgroundColor = getComputedStyle(document.body).backgroundColor;
  scene.background = new THREE.Color(backgroundColor);

  let ambientLight = new THREE.AmbientLight(0xFFFFFF);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xFFFFFF, 0.5);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  camera = new THREE.OrthographicCamera()

  // TODO: change to trackball control
  controls = new THREE.OrbitControls(camera, renderer.domElement);

  visualizeMidi();
}

function animate() {
  requestAnimationFrame(animate);

  directionalLight.position.copy(camera.position);
  directionalLight.position.add(directionalLightDisplacementVector);

  // Use THREE.Clock for time in dynamic visualization

  renderer.render(scene, camera);
}

function updateMusicVisualization(notes) {
  let maxPitch = -Infinity, minPitch = Infinity;
  let maxTrack = -Infinity, minTrack = Infinity;
  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];
    maxPitch = Math.max(maxPitch, note.pitch);
    minPitch = Math.min(minPitch, note.pitch);
    maxTrack = Math.max(maxTrack, note.track);
    minTrack = Math.min(minTrack, note.track);
  }

  // TODO: Use camera to scale/displace instead of vectors
  displacementVector.y = minPitch + (maxPitch - minPitch) / 2;
  displacementVector.z = minTrack + (maxTrack - minTrack) / 2;

  scalingVector.x = 1.5;
  scalingVector.y = 0.25;
  scalingVector.z = scalingVector.y;

  spacingVector.z = 2;

  let frustumSize = 10;
  let aspectRatio = canvas.offsetWidth / canvas.offsetHeight;
  camera.left = frustumSize * aspectRatio / -2;
  camera.right = frustumSize * aspectRatio / 2;
  camera.top = frustumSize / 2;
  camera.bottom = frustumSize / -2;
  camera.near = -50;
  camera.far = 50;
  camera.updateProjectionMatrix();
  camera.position.set(0, 0, 3);
  controls.update()

  staticVisualization(notes);
}

function staticVisualization(notes) {
  for (let i = 0; i < objectsOnScene.length; i++) {
    scene.remove(objectsOnScene[i]);
  }

  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];
    note.duration = note.end - note.start;
    let boxGeometry = new THREE.BoxGeometry(note.duration, 1, 1);
    boxGeometry.scale(scalingVector.x, scalingVector.y, scalingVector.z);
    let boxMaterial = new THREE.MeshStandardMaterial({
      color: colors[note.track % colors.length], transparent: true, opacity: 0.3 // TODO: opacity to be dynamics
    });
    let box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(note.start + note.duration / 2, note.pitch, -note.track);
    box.position.sub(displacementVector).multiply(scalingVector).multiply(spacingVector);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);
    objectsOnScene.push(box);

    let edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
    let edgesMaterial = new THREE.LineBasicMaterial({
      color: boxMaterial.color, transparent: true, opacity: 0.4
    });
    let edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    edges.position.copy(box.position);
    edges.castShadow = true;
    edges.receiveShadow = true;
    scene.add(edges);
    objectsOnScene.push(edges);
  }
}

function visualizeMidi() {
  let midiFile = fileInput.files[0];
  let formData = new FormData();
  formData.append("midiFile", midiFile)
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/process-midi", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == "200") {
      let response = JSON.parse(xhr.responseText);
      name = response[0];
      notes = response[1];
      title.textContent = name;
      updateMusicVisualization(notes);
    }
  };
  xhr.send(formData);
  return;
}
