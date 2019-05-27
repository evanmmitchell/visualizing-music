var scene = new THREE.Scene();
// var camera = new THREE.OrthographicCamera(window.innerWidth / - 2,
//                       window.innerWidth / 2, window.innerHeight / 2,
//                       window.innerHeight / - 2, 1, 1000);
var canvas = document.getElementById("myCanvas");
var renderer = new THREE.WebGLRenderer({canvas});
renderer.setSize(canvas.offsetWidth, canvas.offsetHeight);

var camera = new THREE.PerspectiveCamera(75,
                      canvas.offsetWidth / canvas.offsetHeight, 0.1, 1000);

var geometry = new THREE.BoxGeometry(1, 1, 1);
var material = new THREE.MeshBasicMaterial({color: 0xFFFFFF, wireframe: false});
var cube = new THREE.Mesh(geometry, material);

scene.add(cube);
camera.position.z = 3;

function update() {

}

function render() {
  renderer.render(scene, camera);
}

function GameLoop() {
  requestAnimationFrame(GameLoop);
  update();
  render();
}

GameLoop();
