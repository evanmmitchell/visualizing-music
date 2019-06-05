let scene, camera, renderer, controls, directionalLight;
let directionalLightDisplacementVector = new THREE.Vector3(-3, 2, -1);  //TODO: Fix!
let displacementVector = new THREE.Vector3(), scalingVector = new THREE.Vector3();
let notes = [];

initialize();
animate();


function getMusic() {
  let title = document.getElementById("title");
  title.textContent = "Twinkle Twinkle Little Star";

  let sourceNotes = [
    { track: 0, pitch: 0, start: 0, duration: 1 },
    { track: 0, pitch: 0, start: 1, duration: 1 },
    { track: 0, pitch: 7, start: 2, duration: 1 },
    { track: 0, pitch: 7, start: 3, duration: 1 },
    { track: 0, pitch: 9, start: 4, duration: 1 },
    { track: 0, pitch: 9, start: 5, duration: 1 },
    { track: 0, pitch: 7, start: 6, duration: 2 },
    { track: 0, pitch: 5, start: 8, duration: 1 },
    { track: 0, pitch: 5, start: 9, duration: 1 },
    { track: 0, pitch: 4, start: 10, duration: 1 },
    { track: 0, pitch: 4, start: 11, duration: 1 },
    { track: 0, pitch: 2, start: 12, duration: 1 },
    { track: 0, pitch: 2, start: 13, duration: 1 },
    { track: 0, pitch: 0, start: 14, duration: 2 },
    { track: 0, pitch: 7, start: 16, duration: 1 },
    { track: 0, pitch: 7, start: 17, duration: 1 },
    { track: 0, pitch: 5, start: 18, duration: 1 },
    { track: 0, pitch: 5, start: 19, duration: 1 },
    { track: 0, pitch: 4, start: 20, duration: 1 },
    { track: 0, pitch: 4, start: 21, duration: 1 },
    { track: 0, pitch: 2, start: 22, duration: 2 },
    { track: 0, pitch: 7, start: 24, duration: 1 },
    { track: 0, pitch: 7, start: 25, duration: 1 },
    { track: 0, pitch: 5, start: 26, duration: 1 },
    { track: 0, pitch: 5, start: 27, duration: 1 },
    { track: 0, pitch: 4, start: 28, duration: 1 },
    { track: 0, pitch: 4, start: 29, duration: 1 },
    { track: 0, pitch: 2, start: 30, duration: 2 },
    { track: 0, pitch: 0, start: 32, duration: 1 },
    { track: 0, pitch: 0, start: 33, duration: 1 },
    { track: 0, pitch: 7, start: 34, duration: 1 },
    { track: 0, pitch: 7, start: 35, duration: 1 },
    { track: 0, pitch: 9, start: 36, duration: 1 },
    { track: 0, pitch: 9, start: 37, duration: 1 },
    { track: 0, pitch: 7, start: 38, duration: 2 },
    { track: 0, pitch: 5, start: 40, duration: 1 },
    { track: 0, pitch: 5, start: 41, duration: 1 },
    { track: 0, pitch: 4, start: 42, duration: 1 },
    { track: 0, pitch: 4, start: 43, duration: 1 },
    { track: 0, pitch: 2, start: 44, duration: 1 },
    { track: 0, pitch: 2, start: 45, duration: 1 },
    { track: 0, pitch: 0, start: 46, duration: 2 }
  ];
  
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

  displacementVector.y = (maxPitch - minPitch) / 2;
  displacementVector.z = (maxTrack - minTrack) / 2;
  
  scalingVector.x = 0.5;
  scalingVector.y = ((maxPitch - minPitch) === 0) ? 0.25 : 0.25;  //TODO: Fix!
  scalingVector.z = ((maxTrack - minTrack) === 0) ? 0.25 : 0.25;  //TODO: Fix!
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
  camera = new THREE.OrthographicCamera(frustumSize * aspectRatio / -2, frustumSize * aspectRatio / 2, frustumSize / 2, frustumSize / -2, -50, 50);
  camera.position.set(0, 0, 3);

  let ambientLight = new THREE.AmbientLight(0xFFFFFF);
  scene.add(ambientLight);

  directionalLight = new THREE.DirectionalLight(0xFFFFFF);
  directionalLight.position.copy(camera.position).add(directionalLightDisplacementVector);
  directionalLight.castShadow = true;
  scene.add(directionalLight);

  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);
  renderer.shadowMap.enabled = true;
  
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  

  // Static visualization
  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];
    let boxGeometry = new THREE.BoxGeometry(note.duration, 1, 1);
    boxGeometry.scale(scalingVector.x, scalingVector.y, scalingVector.z);
    let boxMaterial = new THREE.MeshStandardMaterial({ color: "red", transparent: true, opacity: 0.3 });
    let box = new THREE.Mesh(boxGeometry, boxMaterial);
    box.position.set(note.start + note.duration / 2, note.pitch, note.track).sub(displacementVector).multiply(scalingVector);
    box.castShadow = true;
    box.receiveShadow = true;
    scene.add(box);

    let edgesGeometry = new THREE.EdgesGeometry(boxGeometry);
    let edgesMaterial = new THREE.LineBasicMaterial({ color: boxMaterial.color, transparent: true, opacity: 0.4 });
    let edges = new THREE.LineSegments(edgesGeometry, edgesMaterial);
    edges.position.copy(box.position);
    edges.castShadow = true;
    edges.receiveShadow = true;
    scene.add(edges);
  }
}

function animate() {
  requestAnimationFrame(animate);
  
  directionalLight.position.copy(camera.position).add(directionalLightDisplacementVector);

  // use THREE.Clock for time in dynamic visualization

  renderer.render(scene, camera);
}