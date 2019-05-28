var scene, camera, renderer;
var cube;

init();
animate();


function init() {
  var canvas = document.getElementById("myCanvas");

  scene = new THREE.Scene();

  var frustumSize = 3;
  var aspect = canvas.offsetWidth / canvas.offsetHeight;
  camera = new THREE.OrthographicCamera(frustumSize * aspect / -2, frustumSize * aspect / 2, frustumSize / 2, frustumSize / -2, 1, 1000);
  // camera = new THREE.PerspectiveCamera(75, canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);
  camera.position.set(0, 0, 3);

  renderer = new THREE.WebGLRenderer({ canvas });
  renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

  var geometry = new THREE.BoxGeometry(1, 1, 1);
  var material = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, wireframe: true });
  cube = new THREE.Mesh(geometry, material);
  scene.add(cube);
}

function render() {
  cube.rotation.x += 0.002;
  cube.rotation.y += 0.001;

  renderer.render(scene, camera);
}

function animate() {
  requestAnimationFrame(animate);
  render();
}
