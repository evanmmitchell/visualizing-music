let scene, camera, renderer;
let xScale, yScale, zScale;
let notes = [];

initialize();
animate();


function getMusic() {
  let title = document.getElementById("title");
  title.textContent = "Sample Music";

  let sourceNotes = [{ pitch: 1, start: 0, duration: 2 }, { pitch: 0, start: 2, duration: 1 }];
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

  let frustumSize = 10;
  let aspectRatio = canvas.offsetWidth / canvas.offsetHeight;
  camera = new THREE.OrthographicCamera(frustumSize * aspectRatio / -2, frustumSize * aspectRatio / 2, frustumSize / 2, frustumSize / -2, 1, 1000);
  camera.position.set(0, 0, 3);

  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

  // Static visualization
  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];
    let geometry = new THREE.BoxGeometry(note.duration * xScale, yScale, zScale);
    let material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true });
    let block = new THREE.Mesh(geometry, material);
    block.position.set((note.start + note.duration / 2) * xScale, note.pitch * yScale, 0);
    scene.add(block);
  }
}

function animate() {
  requestAnimationFrame(animate);

  // use THREE.Clock for time in dynamic visualization

  renderer.render(scene, camera);
}