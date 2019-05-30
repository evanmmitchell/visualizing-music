let scene, camera, renderer;
let notes = [];
// let blocks = [];
// let i = 0;

getNotes();
init();
animate();


function getNotes() {
  let sourceNotes = [{ pitch: 1, start: 0, duration: 2 }, { pitch: 0, start: 2, duration: 1 }];
  for (let i = 0; i < sourceNotes.length; i++) {
    let note = sourceNotes[i];
    notes.push(note);
  }
}

function init() {
  let canvas = document.getElementById("myCanvas");

  scene = new THREE.Scene();

  let frustumSize = 10;
  let aspect = canvas.offsetWidth / canvas.offsetHeight;
  camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 1000);
  camera.position.set(0, 0, 3);

  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

  // For static visualization
  for (let i = 0; i < notes.length; i++) {
    let note = notes[i];
    let geometry = new THREE.BoxGeometry(note.duration, 1, 1);
    let material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true });
    let block = new THREE.Mesh(geometry, material);
    block.position.set(note.start + (note.duration) / 2, note.pitch, 0);
    scene.add(block);
  }
}

function render() {
  // For dynamic visualization
  // if (i < notes.length) {
  //   block.geometry = new THREE.BoxGeometry(i * 0.1, 1, 1);
  //   block.position.x = i * 0.05;
  //
  //   i++;
  // }

  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}
