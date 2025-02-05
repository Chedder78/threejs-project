// ✅ Three.js Space Scene - Stars, Nebula, Asteroids & Warp Effect 🚀

// Setup Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// ✅ Movement Controls (Snippet #3)
let moveLeft = false;
let moveRight = false;
let moveUp = false;
let moveDown = false;
const speed = 2; // Movement Speed

// ✅ Event Listeners for Arrow Buttons
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

// ✅ Lighting
const light = new THREE.PointLight(0xffffff, 1.5, 100);
light.position.set(10, 10, 10);
scene.add(light);

// ✅ Create Stars (Snippet #5)
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

// ✅ Create Nebula (Snippet #5)
const nebulaGeometry = new THREE.SphereGeometry(60, 32, 32);
const nebulaMaterial = new THREE.MeshStandardMaterial({
  color: 0x443355,
  transparent: true,
  opacity: 0.4,
});
const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
nebula.position.set(0, 0, -200);
scene.add(nebula);

// ✅ Create Floating Asteroids (Snippet #6)
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

// ✅ Warp Speed Variables (Snippet #7)
let isWarping = false;
let warpSpeed = 0;
const maxWarpSpeed = 50;
const acceleration = 0.5;

// ✅ Click to Warp Forward (Snippet #7)
window.addEventListener("click", () => {
  if (!isWarping) {
    isWarping = true;
    warpSpeed = 5; // Initial Speed
    document.body.style.transition = "filter 0.5s";
    document.body.style.filter = "blur(2px)";

    setTimeout(() => {
      document.body.style.filter = "blur(0px)";
    }, 500);
  }
});

// ✅ The Animation Loop (Snippet #11)
function animate() {
  requestAnimationFrame(animate);

  if (!renderer) {
    console.error("Renderer is not defined!");
    return;
  }

  // ✅ Warp Speed Motion
  if (isWarping) {
    warpSpeed += acceleration; 
    if (warpSpeed > maxWarpSpeed) warpSpeed = maxWarpSpeed;
    camera.position.z -= warpSpeed;
  }

  // ✅ Move Stars for Warp Effect
  if (starField) {
    starField.position.z += warpSpeed * 1.5;
    if (starField.position.z > 50) {
      starField.position.z = -1000;
    }
  }

  // ✅ Move Camera with Arrow Controls
  if (moveLeft) camera.position.x -= speed;
  if (moveRight) camera.position.x += speed;
  if (moveUp) camera.position.y += speed;
  if (moveDown) camera.position.y -= speed;

  // ✅ Screen Shake Effect (Snippet #10)
  if (warpSpeed > 10) {
    camera.rotation.x = (Math.random() - 0.5) * 0.02;
    camera.rotation.y = (Math.random() - 0.5) * 0.02;
  } else {
    camera.rotation.x = 0;
    camera.rotation.y = 0;
  }

  // ✅ Move Asteroids
  asteroids.forEach((asteroid) => {
    asteroid.position.z += warpSpeed * 2;
    asteroid.rotation.y += 0.005;
    asteroid.rotation.x += 0.003;

    if (asteroid.position.z > 50) {
      asteroid.position.z = -300;
    }
  });

  // ✅ Move Nebula Slowly
  nebula.rotation.y += 0.001;
  nebula.position.z += warpSpeed * 0.5;
  if (nebula.position.z > -50) {
    nebula.position.z = -200;
  }

  renderer.render(scene, camera);
}

// ✅ Start the Animation Loop (Now correctly placed)
animate();

// ✅ Handle Resizing
window.addEventListener("resize", () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});
