// Setup Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set camera position
camera.position.z = 50;

// Movement Controls
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
const speed = 2;

// Event Listeners for Arrow Keys
document.addEventListener("keydown", (event) => {
  switch (event.key) {
    case "ArrowLeft": moveLeft = true; break;
    case "ArrowRight": moveRight = true; break;
    case "ArrowUp": moveUp = true; break;
    case "ArrowDown": moveDown = true; break;
  }
});

document.addEventListener("keyup", (event) => {
  switch (event.key) {
    case "ArrowLeft": moveLeft = false; break;
    case "ArrowRight": moveRight = false; break;
    case "ArrowUp": moveUp = false; break;
    case "ArrowDown": moveDown = false; break;
  }
});

// Lighting
const light = new THREE.PointLight(0xffffff, 1.5, 100);
light.position.set(10, 10, 10);
scene.add(light);

// Create Stars
const starGeometry = new THREE.BufferGeometry();
const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 0.2 });

const starPositions = [];
for (let i = 0; i < 500; i++) {
  starPositions.push((Math.random() - 0.5) * 1000);
  starPositions.push((Math.random() - 0.5) * 1000);
  starPositions.push((Math.random() - 0.5) * 1000);
}
starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
const starField = new THREE.Points(starGeometry, starMaterial);
scene.add(starField);

// Create Nebula
const nebulaGeometry = new THREE.SphereGeometry(60, 32, 32);
const nebulaMaterial = new THREE.MeshStandardMaterial({
  color: 0x443355,
  transparent: true,
  opacity: 0.4,
});
const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
nebula.position.set(0, 0, -200);
scene.add(nebula);

// Create Floating Asteroids
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

// Warp Speed Variables
let isWarping = false;
let warpSpeed = 0;
const maxWarpSpeed = 50;
const acceleration = 0.5;

// Click to Warp Forward
window.addEventListener("click", () => {
  if (!isWarping) {
    isWarping = true;
    warpSpeed = 5;
    document.body.style.transition = "filter 0.5s";
    document.body.style.filter = "blur(2px)";

    setTimeout(() => {
      document.body.style.filter = "blur(0px)";
    }, 500);
  }
});

// Animation Loop
function animate() {
  requestAnimationFrame(animate);

  // Warp Speed Motion
  if (isWarping) {
    warpSpeed += acceleration;
    if (warpSpeed > maxWarpSpeed) warpSpeed = maxWarpSpeed;
    camera.position.z -= warpSpeed;

    // Reset warp effect when camera goes too far
    if (camera.position.z < -1000) {
      isWarping = false;
      warpSpeed = 0;
      camera.position.z = 50;
    }
  }

  // Move Stars for Warp Effect
  if (starField) {
    starField.position.z += warpSpeed * 1.5;
    if (starField.position.z > 50) {
      starField.position.z = -1000;
    }
  }

  // Move Camera with Arrow Controls
  if (moveLeft) camera.position.x -= speed;
  if (moveRight) camera.position.x += speed;
  if (moveUp) camera.position.y += speed;
  if (moveDown) camera.position.y -= speed;

  // Screen Shake Effect
  if (warpSpeed > 10) {
    camera.rotation.x = (Math.random() - 0.5) * 0.02;
    camera.rotation.y = (Math.random() - 0.5) * 0.02;
  } else {
    camera.rotation.x = 0;
    camera.rotation.y = 0;
  }

  // Move Asteroids
  asteroids.forEach((asteroid) => {
    asteroid.position.z += warpSpeed * 2;
    asteroid.rotation.y += 0.005;
    asteroid.rotation.x += 0.003;

    if (asteroid.position.z > 50) {
      asteroid.position.z = -300;
    }
  });

  // Move Nebula Slowly
  nebula.rotation.y += 0.001;
  nebula.position.z += warpSpeed * 0.5;
  if (nebula.position.z > -50) {
    nebula.position.z = -200;
  }

  renderer.render(scene, camera);
}

// Start the Animation Loop
animate();

// Handle Resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
