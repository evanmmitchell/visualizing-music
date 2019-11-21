let scene, camera, renderer, controls, directionalLight, notes, objectsInScene = [];
const directionalLightDisplacementVector = new THREE.Vector3(-3, 2, -1);  // TODO: Fix to follow camera orientation
const COLORS = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3];


initialize();
animate();


function initialize() {
  let fileInput = document.getElementById("fileInput");
  fileInput.addEventListener("change", visualizeMidi);

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

  visualizeMidi();
}

function animate() {
  requestAnimationFrame(animate);

  directionalLight.position.copy(camera.position);
  directionalLight.position.add(directionalLightDisplacementVector);

  // Use THREE.Clock for time in dynamic visualization

  renderer.render(scene, camera);
}

function visualizeMidi() {
  let midiFile;
  try {
    midiFile = this.files[0];
  } catch { }
  let formData = new FormData();
  formData.append("midiFile", midiFile)
  let xhr = new XMLHttpRequest();
  xhr.open("POST", "/process-midi", true);
  xhr.onreadystatechange = function () {
    if (xhr.readyState == 4 && xhr.status == "200") {
      let response = JSON.parse(xhr.responseText);
      let title = document.getElementById("title");
      title.textContent = response["title"];
      notes = response["notes"];
      updateMusicVisualization();
    }
  };
  xhr.send(formData);
  return;
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

  camera.near = -500;
  camera.far = 500;  // TODO: Variable near/far with maxTrack
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
    sphere.rotateY(Math.PI / 2); //Hopefully doesn't just rotate sphere
    sphere.castShadow = true;
    sphere.receiveShadow = true;
    scene.add(sphere);
    objectsInScene.push(sphere);
  }
}
