let scene, camera, renderer, controls, directionalLight;
let directionalLightDisplacementVector = new THREE.Vector3(-3, 2, -1);
// TODO: Fix to follow camera orientation
let displacementVector = new THREE.Vector3(), scalingVector = new THREE.Vector3();
let notes = [];

initialize();
animate();


function getMusic() {
  let title = document.getElementById("title");
  title.textContent = "Twinkle Twinkle Little Star";

  let sourceNotes = parseJSON("notes.json");

  let maxPitch = -Infinity, minPitch = Infinity;
  let maxTrack = -Infinity, minTrack = Infinity;
  for (let i = 0; i < sourceNotes.length; i++) {
    let note = sourceNotes[i];
    maxPitch = Math.max(maxPitch, note.pitch);
    minPitch = Math.min(minPitch, note.pitch);
    maxTrack = Math.max(maxTrack, note.track);
    minTrack = Math.min(minTrack, note.track);
    notes.push(note);
  }

  displacementVector.y = minPitch + (maxPitch - minPitch) / 2;
  displacementVector.z = minTrack + (maxTrack - minTrack) / 2;

  scalingVector.x = 0.5;
  // TODO: Fix arbitrary scaling
  scalingVector.y = ((maxPitch - minPitch) === 0) ? 0.25 : 0.25;
  scalingVector.z = ((maxTrack - minTrack) === 0) ? 0.25 : 0.25;
}

function initialize() {
  getMusic();

  let canvas = document.createElement("canvas");
  document.body.appendChild(canvas);

  scene = new THREE.Scene();

  let backgroundColor = getComputedStyle(document.body).backgroundColor;
  scene.background = new THREE.Color(backgroundColor);

  let frustumSize = 10;
  let aspectRatio = canvas.offsetWidth / canvas.offsetHeight;
  camera = new THREE.OrthographicCamera(
    frustumSize * aspectRatio / -2, frustumSize * aspectRatio / 2,
    frustumSize / 2, frustumSize / -2,
    -50, 50
  );
  camera.position.set(0, 0, 3);

  let ambientLight = new THREE.AmbientLight(0xFFFFFF);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xFFFFFF);
  directionalLight.position.copy(camera.position);
  directionalLight.position.add(directionalLightDisplacementVector);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.shadowMap.enabled = true;

  controls = new THREE.OrbitControls(camera, renderer.domElement);
  // TODO: change to trackball control

  // Static visualization
  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];
    let boxGeometry = new THREE.BoxGeometry(note.duration, 1, 1);
    boxGeometry.scale(scalingVector.x, scalingVector.y, scalingVector.z);
    let boxMaterial = new THREE.MeshStandardMaterial({
      color: "blue", transparent: true, opacity: 0.3 // TODO: opacity to be dynamics
    });
    let box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(note.start + note.duration / 2, note.pitch, note.track);
    box.position.sub(displacementVector).multiply(scalingVector);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);

    let edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
    let edgesMaterial = new THREE.LineBasicMaterial({
      color: boxMaterial.color, transparent: true, opacity: 0.4
    });
    let edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    edges.position.copy(box.position);
    edges.castShadow = true;
    edges.receiveShadow = true;
    scene.add(edges);
  }
}

function animate() {
  requestAnimationFrame(animate);

  directionalLight.position.copy(camera.position);
  directionalLight.position.add(directionalLightDisplacementVector);

  // Use THREE.Clock for time in dynamic visualization

  renderer.render(scene, camera);
}

function parseJSON(path) {
  var result;
  var xobj = new XMLHttpRequest();
  xobj.overrideMimeType("application/json");
  xobj.open("GET", path, false);
  xobj.onreadystatechange = function () {
    if (xobj.readyState == 4 && xobj.status == "200") {
      result = JSON.parse(xobj.responseText);
    }
  };
  xobj.send(null);
  return result;
 }
