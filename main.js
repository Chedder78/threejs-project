// ✅ Three.js Space Scene - Stars, Nebula, Asteroids & Warp Effect 🚀

// Setup Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Snippet #3 - Arrow Button Controls
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;

// ✅ Event Listeners for Movement
document.getElementById("left").addEventListener("mousedown", () => moveLeft = true);
document.getElementById("right").addEventListener("mousedown", () => moveRight = true);
document.getElementById("up").addEventListener("mousedown", () => moveUp = true);
document.getElementById("down").addEventListener("mousedown", () => moveDown = true);

document.addEventListener("mouseup", () => {
  moveLeft = false;
  moveRight = false;
  moveUp = false;
  moveDown = false;
});

// ✅ Add Lighting
const light = new THREE.PointLight(0xffffff, 1.5, 100);
light.position.set(10, 10, 10);
scene.add(light);

// ✅ Create Stars 🌟
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 });

const starPositions = [];
for (let i = 0; i < 500; i++) { // More stars for better effect
  starPositions.push((Math.random() - 0.5) * 1000);
  starPositions.push((Math.random() - 0.5) * 1000);
  starPositions.push((Math.random() - 0.5) * 1000);
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));

const starField = new THREE.Points(starGeometry, starMaterial);
scene.add(starField);

// ✅ Create a Nebula Cloud 🌫️
const nebulaGeometry = new THREE.SphereGeometry(60, 32, 32);
const nebulaMaterial = new THREE.MeshStandardMaterial({
  color: 0x443355,
  transparent: true,
  opacity: 0.4,
});
const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
nebula.position.set(0, 0, -200);
scene.add(nebula);

// ✅ Create Floating Asteroids 🪨
const asteroids = [];
for (let i = 0; i < 15; i++) {
  const geometry = new THREE.SphereGeometry(Math.random() * 2, 32, 32);
  const material = new THREE.MeshStandardMaterial({ color: 0x888888 });

  const asteroid = new THREE.Mesh(geometry, material);
  asteroid.position.set(
    (Math.random() - 0.5) * 300,
    (Math.random() - 0.5) * 300,
    (Math.random() - 0.5) * 300
  );
  scene.add(asteroid);
  asteroids.push(asteroid);
}

// ✅ Set Initial Camera Position
camera.position.z = 50;
let warpSpeed = 0;
let isWarping = false;

// ✅ Click to Warp Forward 🚀
window.addEventListener("click", () => {
  if (!isWarping) {
    isWarping = true;
    warpSpeed = 0.5;
  }
});

// ✅ Animation Loop - Moving Stars & Asteroids
function animate() {
  requestAnimationFrame(animate);

  // 🚀 Warp Effect - Move Camera Forward
  if (isWarping) {
    camera.position.z -= warpSpeed;
    warpSpeed += 0.02; // Acceleration effect
  }

  // 🌠 Move Stars
  starField.position.z += warpSpeed;
  if (starField.position.z > 50) {
    starField.position.z = -500;
  }

  // 🪨 Move Asteroids
  asteroids.forEach((asteroid) => {
    asteroid.position.z += warpSpeed * 2;
    asteroid.rotation.y += 0.005;
    asteroid.rotation.x += 0.003;

    if (asteroid.position.z > 50) {
      asteroid.position.z = -300;
    }
  });

  // 🌫️ Move Nebula Slowly
  nebula.rotation.y += 0.001;
  nebula.position.z += warpSpeed * 0.5;
  if (nebula.position.z > -50) {
    nebula.position.z = -200;
  }

  renderer.render(scene, camera);
}
animate();

// ✅ Handle Resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
