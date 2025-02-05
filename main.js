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

// Snippet #4 - Apply Movement to Camera
const speed = 2;

if (moveLeft) camera.position.x -= speed;
if (moveRight) camera.position.x += speed;
if (moveUp) camera.position.y += speed;
if (moveDown) camera.position.y -= speed;

  // Snippet #10 - Screen Shake Effect
if (warpSpeed > 10) {
  camera.rotation.x = (Math.random() - 0.5) * 0.02; // Slight shake
  camera.rotation.y = (Math.random() - 0.5) * 0.02;
} else {
  camera.rotation.x = 0; // Reset shake when not at high speed
  camera.rotation.y = 0;
}


  // 🌠 Move Stars
  starField.position.z += warpSpeed;
  if (starField.position.z > 50) {
    starField.position.z = -500;
  }

  // Snippet #5 - Create Multiple Nebulas 🌫️
const nebulas = [];
for (let i = 0; i < 3; i++) {
  const nebulaGeometry = new THREE.SphereGeometry(80, 32, 32);
  const nebulaMaterial = new THREE.MeshStandardMaterial({
    color: 0x442266,
    transparent: true,
    opacity: 0.3,
  });

  const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
  nebula.position.set(
    (Math.random() - 0.5) * 1000,
    (Math.random() - 0.5) * 1000,
    (Math.random() - 0.5) * 1000
  );

  scene.add(nebula);
  nebulas.push(nebula);
}

// Snippet #6 - Create Galaxies 🌌
const galaxies = [];
for (let i = 0; i < 5; i++) {
  const galaxyGeometry = new THREE.SphereGeometry(150, 32, 32);
  const galaxyMaterial = new THREE.MeshBasicMaterial({ 
    color: 0x111166,
    wireframe: true,
    transparent: true,
    opacity: 0.2
  });

  const galaxy = new THREE.Mesh(galaxyGeometry, galaxyMaterial);
  galaxy.position.set(
    (Math.random() - 0.5) * 2000,
    (Math.random() - 0.5) * 2000,
    (Math.random() - 0.5) * 2000
  );

  scene.add(galaxy);
  galaxies.push(galaxy);
}
// Snippet #8 - Apply Warp Speed to Camera
if (isWarping) {
  warpSpeed += acceleration; // Gradually increase speed
  if (warpSpeed > maxWarpSpeed) warpSpeed = maxWarpSpeed; // Cap at max speed
  camera.position.z -= warpSpeed;

  // Stretch the stars slightly to simulate motion blur
  starField.scale.y = 1 + warpSpeed / 20;
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

// Snippet #7 - Warp Speed & Effects (Fixed Version)
if (typeof isWarping === "undefined") { 
  var isWarping = false; 
}

let warpSpeed = 0;
const maxWarpSpeed = 50;
const acceleration = 0.5;

// ✅ Click to Start Warp - Ensures `isWarping` is Not Redeclared
window.addEventListener("click", () => {
  if (!isWarping) {
    isWarping = true;
    warpSpeed = 5; // Initial Speed
    document.body.style.transition = "filter 0.5s"; // Start Blur Effect
    document.body.style.filter = "blur(2px)";

    // Remove Blur After Warp Starts
    setTimeout(() => {
      document.body.style.filter = "blur(0px)";
    }, 500);
  }
});
