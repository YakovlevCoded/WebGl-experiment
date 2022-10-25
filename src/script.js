import "./style.css";
import * as THREE from "three";
import * as dat from "lil-gui";
import { RGBELoader } from "three/examples/jsm/loaders/RGBELoader.js";

/**
 * Debug
 */
const gui = new dat.GUI();

const parameters = {
  materialColor: "#488ba8",
};

gui.addColor(parameters, "materialColor");

/**
 * Base
 */
// Canvas
const canvas = document.querySelector("canvas.webgl");

// Scene
const scene = new THREE.Scene();

/**
 * Test cube
 */
const path = "https://threejs.org/examples/textures/cube/pisa/";
const format = ".png";
const urls = [
  path + "px" + format,
  path + "nx" + format,
  path + "py" + format,
  path + "ny" + format,
  path + "pz" + format,
  path + "nz" + format,
];

const textureCube = new THREE.CubeTextureLoader().load(urls);

scene.background = textureCube;
scene.environment = textureCube;

const material = new THREE.MeshBasicMaterial({
  envMap: textureCube,
});

const mesh3 = new THREE.Mesh(new THREE.BoxGeometry(2, 2, 2), material);
const mesh2 = new THREE.Mesh(
  new THREE.TorusGeometry(1, 0.3, 100, 50),
  material
);
const mesh1 = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), material);

// postition
const objectDistance = 4;

mesh1.position.y = -objectDistance * 0;
mesh2.position.y = -objectDistance * 1;
mesh3.position.y = -objectDistance * 1.8;

mesh1.position.x = -objectDistance * 2;
mesh2.position.x = -objectDistance * -2;
mesh3.position.x = -objectDistance * 2;

// const cube = new THREE.Mesh(new THREE.BoxGeometry(1, 1, 1), material);
scene.add(mesh1, mesh2, mesh3);

const sectionMeshes = [mesh1, mesh2, mesh3];

// particles
const particlesCount = 30;

for (let i = 0; i < particlesCount; i++) {
  const geo1 = new THREE.SphereGeometry(0.1, 32, 32);

  const mesh = new THREE.Mesh(geo1, material);
  mesh.position.x = (Math.random() - 0.5) * 20;
  mesh.position.y = objectDistance * 0.5 - Math.random() * objectDistance * 4;
  mesh.position.z = (Math.random() - 0.5) * 20;
  scene.add(mesh);
}

// directional light
const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(10, 10, 10);
scene.add(directionalLight);

/**
 * Sizes
 */
const sizes = {
  width: window.innerWidth,
  height: window.innerHeight,
};

window.addEventListener("resize", () => {
  // Update sizes
  sizes.width = window.innerWidth;
  sizes.height = window.innerHeight;

  // Update camera
  camera.aspect = sizes.width / sizes.height;
  camera.updateProjectionMatrix();

  // Update renderer
  renderer.setSize(sizes.width, sizes.height);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

/**
 * Camera
 */

// camera group
const cameraGroup = new THREE.Group();
scene.add(cameraGroup);
// Base camera
const camera = new THREE.PerspectiveCamera(
  35,
  sizes.width / sizes.height,
  0.1,
  100
);
camera.position.z = 12;
cameraGroup.add(camera);

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
  canvas: canvas,
  alpha: true,
});
renderer.setSize(sizes.width, sizes.height);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

/**
 * Animate
 */
const clock = new THREE.Clock();
let previousTime = 0;

// mouse position
let mousePosition = { x: 0, y: 0 };

window.addEventListener(
  "mousemove",
  (event) => {
    mousePosition.x = event.clientX / sizes.width - 0.5;
    mousePosition.y = event.clientY / sizes.height - 0.5;
  },
  false
);

const tick = () => {
  const elapsedTime = clock.getElapsedTime();
  const deltaTime = elapsedTime - previousTime;
  previousTime = elapsedTime;

  // Animate objects
  let scroll = window.scrollY;

  // change camera position
  camera.position.y =
    (-scroll / sizes.height) * objectDistance + mousePosition.y * 0.5;

  const paralaxX = mousePosition.x * 0.5;

  const paralaxY = -mousePosition.y * 0.5;

  camera.position.z = objectDistance + scroll * 0.009;
  cameraGroup.position.x += (paralaxX - cameraGroup.position.x) * 2 * deltaTime;
  cameraGroup.position.y += (paralaxX - cameraGroup.position.y) * 2 * deltaTime;

  // change mesh position
  sectionMeshes.forEach((mesh, index) => {
    const prefix = index % 2 === 0 ? 2 : -2;
    mesh.rotation.y =
      (paralaxX - cameraGroup.position.y + elapsedTime / 80) * 5;
    mesh.position.x = prefix * Math.sin(scroll * 0.002) * 2;
  });

  // Render
  renderer.render(scene, camera);

  // Call tick again on the next frame
  window.requestAnimationFrame(tick);
};

tick();

function randomIntFromInterval(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}
