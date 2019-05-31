let scene, camera, renderer;
let xScale, yScale, zScale;
let notes = [];

initialize();
animate();


function getMusic() {
  let title = document.getElementById("title");
  title.textContent = "Twinkle Twinkle Little Star";

  let sourceNotes = [
    { pitch: 0, start: 0, duration: 1 },
    { pitch: 0, start: 1, duration: 1 },
    { pitch: 7, start: 2, duration: 1 },
    { pitch: 7, start: 3, duration: 1 },
    { pitch: 9, start: 4, duration: 1 },
    { pitch: 9, start: 5, duration: 1 },
    { pitch: 7, start: 6, duration: 2 },
    { pitch: 5, start: 8, duration: 1 },
    { pitch: 5, start: 9, duration: 1 },
    { pitch: 4, start: 10, duration: 1 },
    { pitch: 4, start: 11, duration: 1 },
    { pitch: 2, start: 12, duration: 1 },
    { pitch: 2, start: 13, duration: 1 },
    { pitch: 0, start: 14, duration: 2 }
  ];
  for (let i = 0; i < sourceNotes.length; i++) {
    let note = sourceNotes[i];
    notes.push(note);
  }

  xScale = 1;
  yScale = 0.25;
  zScale = 0.25;
}

function initialize() {
  getMusic();

  let canvas = document.getElementById("myCanvas");

  scene = new THREE.Scene();

  let backgroundColor = getComputedStyle(document.body).backgroundColor;
  scene.background = new THREE.Color(backgroundColor);

  let frustumSize = 10;
  let aspectRatio = canvas.offsetWidth / canvas.offsetHeight;
  camera = new THREE.OrthographicCamera(frustumSize * aspectRatio / -2, frustumSize * aspectRatio / 2, frustumSize / 2, frustumSize / -2, 1, 1000);
  camera.position.set(8, 1, 3);

  let ambientLight = new THREE.AmbientLight(0xFFFFFF, 10);
  scene.add(ambientLight);

  let spotLight = new THREE.SpotLight(0xFFFFFF);
  spotLight.position.set(-40, 60, -10);
  scene.add(spotLight);

  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

  // Static visualization
  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];
    let geometry = new THREE.BoxGeometry(note.duration * xScale, yScale, zScale);
    let material = new THREE.MeshStandardMaterial({ color: "red", transparent: true, opacity: 0.3 });
    let block = new THREE.Mesh(geometry, material);
    block.position.set((note.start + note.duration / 2) * xScale, note.pitch * yScale, 0);
    scene.add(block);

    let edgeGeometry = new THREE.EdgesGeometry(geometry);
    let edgeMaterial = new THREE.LineBasicMaterial({ color: material.color, transparent: true, opacity: 0.4 });
    let edges = new THREE.LineSegments(edgeGeometry, edgeMaterial);
    edges.position.copy(block.position);
    scene.add(edges);
  }
}

function animate() {
  requestAnimationFrame(animate);

  // use THREE.Clock for time in dynamic visualization

  renderer.render(scene, camera);
}