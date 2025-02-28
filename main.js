// main.js
import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.module.js';
import { EffectComposer } from './EffectComposer.module.js';
import { RenderPass } from './RenderPass.module.js';
import { UnrealBloomPass } from './UnrealBloomPass.module.js';
import { CopyShader } from './CopyShader.module.js';
import { ShaderPass } from './ShaderPass.module.js';
import { LuminosityHighPassShader } from './LuminosityHighPassShader.module.js';

// When the DOM is ready, initialize the scene.
document.addEventListener('DOMContentLoaded', () => {
  if (!WebGL.isWebGLAvailable()) {
    alert('WebGL not supported on this device.');
  } else {
    new SpaceScene();
  }
});

// ... rest of your SpaceScene class code ...



class SpaceScene {
  constructor() {
    // Set up scene, camera, renderer, etc.
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.controls = null;
    this.manager = new THREE.LoadingManager();
    this.textureLoader = new THREE.TextureLoader(this.manager);
    this.asteroids = [];
    this.isWarping = false;
    this.warpSpeed = 0;
    this.maxWarpSpeed = 50;
    this.acceleration = 0.5;
    this.moveLeft = false;
    this.moveRight = false;
    this.moveUp = false;
    this.moveDown = false;
    this.speed = 2;
    this.init();
  }

  init() {
    this.setupRenderer();
    this.setupCamera();
    this.setupControls();
    this.setupEventListeners();
    this.setupLoadingManager();
    this.createStartScreen();
  }

  setupRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    // Initially append the canvas to the body or a container if preferred.
    document.body.appendChild(this.renderer.domElement);
  }

  setupCamera() {
    this.camera.position.z = 50;
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
    this.controls.screenSpacePanning = false;
  }

  setupLoadingManager() {
    // Example: combine logging and loading screen removal if needed.
    this.manager.onStart = () => console.log("Loading started");
    // You can combine multiple actions in onLoad if desired.
    // This will be overwritten in createLoadingScreen if you want a loading overlay.
  }

  createStartScreen() {
    const startScreen = document.createElement('div');
    startScreen.style.position = 'absolute';
    startScreen.style.top = '0';
    startScreen.style.left = '0';
    startScreen.style.width = '100%';
    startScreen.style.height = '100%';
    startScreen.style.backgroundColor = 'black';
    startScreen.style.color = 'white';
    startScreen.style.display = 'flex';
    startScreen.style.justifyContent = 'center';
    startScreen.style.alignItems = 'center';
    startScreen.style.flexDirection = 'column';
    startScreen.innerHTML = '<button id="start-button" style="padding: 10px 20px; font-size: 20px;">Start</button>';
    document.body.appendChild(startScreen);

    const startButton = document.getElementById('start-button');
    startButton.addEventListener('click', () => {
      // Optionally add an animation here.
      document.body.removeChild(startScreen);
      this.initializeScene();
    });
  }

  initializeScene() {
    this.createLoadingScreen();
    this.loadBackgroundTexture();
    this.setupLighting();
    this.createStarField();
    this.createNebula();
    this.createAsteroids();
    this.setupBloomEffect();
    this.setupAnimationLoop();
    this.setupTiltEffect();
    this.setupSettingsPanel();
    this.setupRaycaster();
  }

  createLoadingScreen() {
    const loadingScreen = document.createElement('div');
    loadingScreen.style.position = 'absolute';
    loadingScreen.style.top = '0';
    loadingScreen.style.left = '0';
    loadingScreen.style.width = '100%';
    loadingScreen.style.height = '100%';
    loadingScreen.style.backgroundColor = 'black';
    loadingScreen.style.color = 'white';
    loadingScreen.style.display = 'flex';
    loadingScreen.style.justifyContent = 'center';
    loadingScreen.style.alignItems = 'center';
    loadingScreen.innerHTML = 'Loading...';
    document.body.appendChild(loadingScreen);

    this.manager.onLoad = () => {
      console.log("All assets loaded");
      document.body.removeChild(loadingScreen);
    };
  }

  loadBackgroundTexture() {
    this.textureLoader.load(
      'background.png.jpg',
      (texture) => { this.scene.background = texture; },
      undefined,
      (err) => { console.error('An error happened while loading the texture.', err); }
    );
  }

  setupLighting() {
    const light = new THREE.PointLight(0xffffff, 1.5, 100);
    light.position.set(10, 10, 10);
    this.scene.add(light);
  }

  createStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starPositions = [];
    const starSizes = [];
    const starColors = [];

    for (let i = 0; i < 500; i++) {
      starPositions.push((Math.random() - 0.5) * 1000);
      starPositions.push((Math.random() - 0.5) * 1000);
      starPositions.push((Math.random() - 0.5) * 1000);

      starSizes.push(Math.random() * 0.5 + 0.1);

      const color = new THREE.Color();
      if (Math.random() > 0.5) {
        color.setRGB(0.5, 0.5, 1); // Faint blue
      } else {
        color.setRGB(1, 0.5, 0.5); // Faint red
      }
      starColors.push(color.r, color.g, color.b);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
    starGeometry.setAttribute('size', new THREE.Float32BufferAttribute(starSizes, 1));
    starGeometry.setAttribute('color', new THREE.Float32BufferAttribute(starColors, 3));

    const starMaterial = new THREE.PointsMaterial({ vertexColors: true, sizeAttenuation: true });
    const starField = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(starField);

    setInterval(() => this.flickerStars(starGeometry), 100);
  }

  flickerStars(starGeometry) {
    const sizes = starGeometry.attributes.size.array;
    for (let i = 0; i < sizes.length; i++) {
      sizes[i] = Math.random() * 0.5 + 0.1;
    }
    starGeometry.attributes.size.needsUpdate = true;
  }

  createNebula() {
    const nebulaGeometry = new THREE.SphereGeometry(60, 32, 32);
    const nebulaMaterial = new THREE.MeshStandardMaterial({
      color: 0x443355,
      transparent: true,
      opacity: 0.4,
    });
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    nebula.position.set(0, 0, -200);
    this.scene.add(nebula);
  }

  createAsteroids() {
    const alienColors = [
      0x8A2BE2, 0x7FFF00, 0xFF4500,
      0x00CED1, 0xFFD700, 0xADFF2F,
      0xFF69B4, 0xCD5C5C,
    ];
    for (let i = 0; i < 15; i++) {
      const geometry = new THREE.SphereGeometry(Math.random() * 2, 32, 32);
      const color = alienColors[Math.floor(Math.random() * alienColors.length)];
      const material = new THREE.MeshStandardMaterial({ color: color });
      const asteroid = new THREE.Mesh(geometry, material);
      asteroid.position.set(
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 300,
        (Math.random() - 0.5) * 300
      );
      this.scene.add(asteroid);
      this.asteroids.push(asteroid);
    }
  }

setupBloomEffect() {
  const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    1.5, 0.4, 0.85
  );
  bloomPass.threshold = 0.1;
  bloomPass.strength = 1.5;
  bloomPass.radius = 0.5;

  const composer = new EffectComposer(this.renderer);
  composer.addPass(new RenderPass(this.scene, this.camera));
  composer.addPass(bloomPass);

  this.composer = composer;
}

setupAnimationLoop() {
  const animate = () => {
    requestAnimationFrame(animate);

    if (this.isWarping) {
      this.warpSpeed += this.acceleration;
      if (this.warpSpeed > this.maxWarpSpeed) this.warpSpeed = this.maxWarpSpeed;
      this.camera.position.z -= this.warpSpeed;

      if (this.camera.position.z < -1000) {
        this.isWarping = false;
        this.warpSpeed = 0;
        this.camera.position.z = 50;
      }
    }

    if (this.moveLeft) this.camera.position.x -= this.speed;
    if (this.moveRight) this.camera.position.x += this.speed;
    if (this.moveUp) this.camera.position.y += this.speed;
    if (this.moveDown) this.camera.position.y -= this.speed;

    this.controls.update();
    this.composer.render(); // Use the composer instead of the renderer
  };

  animate();
}

  setupTiltEffect() {
  const tiltContainer = document.createElement('div');
  tiltContainer.id = 'tilt-container';
  tiltContainer.style.position = 'absolute';
  tiltContainer.style.top = '0';
  tiltContainer.style.left = '0';
  tiltContainer.style.width = '100%';
  tiltContainer.style.height = '100%';
  tiltContainer.style.perspective = '1000px';
  document.body.appendChild(tiltContainer);

  // Move the renderer's canvas into the tilt container
  tiltContainer.appendChild(this.renderer.domElement);

  document.addEventListener('mousemove', (event) => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const centerX = width / 2;
    const centerY = height / 2;
    const mouseX = event.clientX;
    const mouseY = event.clientY;
    const rotateX = ((centerY - mouseY) / centerY) * 15;
    const rotateY = ((mouseX - centerX) / centerX) * 15;

    tiltContainer.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
  });
}

  setupSettingsPanel() {
    const settingsPanel = document.createElement('div');
    settingsPanel.style.position = 'absolute';
    settingsPanel.style.top = '10px';
    settingsPanel.style.left = '10px';
    settingsPanel.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
    settingsPanel.style.color = 'white';
    settingsPanel.style.padding = '10px';
    settingsPanel.style.borderRadius = '5px';
    document.body.appendChild(settingsPanel);

    const speedSlider = document.createElement('input');
    speedSlider.type = 'range';
    speedSlider.min = '1';
    speedSlider.max = '10';
    speedSlider.value = this.speed;
    speedSlider.oninput = (event) => {
      this.speed = parseFloat(event.target.value);
    };
    settingsPanel.appendChild(speedSlider);
  }

 setupRaycaster() {
  const raycaster = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  window.addEventListener('click', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, this.camera);

    const intersects = raycaster.intersectObjects(this.asteroids);

    if (intersects.length > 0) {
      const clickedAsteroid = intersects[0].object;
      alert(`You clicked on an asteroid with color: ${clickedAsteroid.material.color.getHexString()}`);
    }
  });
}
  setupEventListeners() {
    window.addEventListener('resize', () => this.resizeCanvas());

    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          this.moveLeft = true;
          break;
        case 'ArrowRight':
          this.moveRight = true;
          break;
        case 'ArrowUp':
          this.moveUp = true;
          break;
        case 'ArrowDown':
          this.moveDown = true;
          break;
      }
    });

    document.addEventListener('keyup', (event) => {
      switch (event.key) {
        case 'ArrowLeft':
          this.moveLeft = false;
          break;
        case 'ArrowRight':
          this.moveRight = false;
          break;
        case 'ArrowUp':
          this.moveUp = false;
          break;
        case 'ArrowDown':
          this.moveDown = false;
          break;
      }
    });

    // This click event triggers warp, but note that it will fire alongside the raycaster click event.
    window.addEventListener('click', () => {
      if (!this.isWarping) {
        this.isWarping = true;
        this.warpSpeed = 5;
        document.body.style.transition = 'filter 0.5s';
        document.body.style.filter = 'blur(2px)';

        setTimeout(() => {
          document.body.style.filter = 'blur(0px)';
        }, 500);
      }
    });
  }

  resizeCanvas() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
  }
}
