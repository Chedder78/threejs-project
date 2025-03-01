import * as THREE from './three.module.js';
import { OrbitControls } from './OrbitControls.module.js';
import { EffectComposer } from './EffectComposer.module.js';
import { RenderPass } from './RenderPass.module.js';
import { UnrealBloomPass } from './UnrealBloomPass.module.js';

// Ensure WebGL is available before initializing the scene
document.addEventListener('DOMContentLoaded', () => {
  try {
    const testRenderer = new THREE.WebGLRenderer();
    new SpaceScene();
  } catch (error) {
    alert('WebGL not supported on this device.');
  }
});

class SpaceScene {
  constructor() {
    // Core Three.js Components
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    // Other properties
    this.controls = null;
    this.asteroids = [];
    this.speed = 2;
    this.isWarping = false;
    this.warpSpeed = 0;
    this.maxWarpSpeed = 50;
    this.acceleration = 0.5;

    // Loading Manager
    this.manager = new THREE.LoadingManager();
    this.textureLoader = new THREE.TextureLoader(this.manager);

    this.init();
  }

  init() {
    this.setupRenderer();
    this.setupCamera();
    this.setupControls();
    this.setupEventListeners();
    this.createStartScreen();
  }

  setupRenderer() {
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(this.renderer.domElement);
  }

  setupCamera() {
    this.camera.position.z = 50;
  }

  setupControls() {
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.enablePan = false;
  }

  createStartScreen() {
    const startScreen = document.createElement('div');
    Object.assign(startScreen.style, {
      position: 'absolute',
      top: '0', left: '0', width: '100%', height: '100%',
      backgroundColor: 'black', color: 'white',
      display: 'flex', justifyContent: 'center',
      alignItems: 'center', flexDirection: 'column'
    });

    startScreen.innerHTML = '<button id="start-button" style="padding: 10px 20px; font-size: 20px;">Start</button>';
    document.body.appendChild(startScreen);

    document.getElementById('start-button').addEventListener('click', () => {
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
    this.setupSettingsPanel();
  }

  createLoadingScreen() {
    const loadingScreen = document.createElement('div');
    Object.assign(loadingScreen.style, {
      position: 'absolute', top: '0', left: '0', width: '100%', height: '100%',
      backgroundColor: 'black', color: 'white',
      display: 'flex', justifyContent: 'center', alignItems: 'center'
    });
    loadingScreen.innerHTML = 'Loading...';
    document.body.appendChild(loadingScreen);

    this.manager.onLoad = () => {
      document.body.removeChild(loadingScreen);
    };
  }

  loadBackgroundTexture() {
    this.textureLoader.load(
      'background.jpg',  // Ensure correct filename
      (texture) => { this.scene.background = texture; },
      undefined,
      (err) => { console.error('Error loading background:', err); }
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

    for (let i = 0; i < 500; i++) {
      starPositions.push((Math.random() - 0.5) * 1000);
      starPositions.push((Math.random() - 0.5) * 1000);
      starPositions.push((Math.random() - 0.5) * 1000);
    }

    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));

    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff, size: 1.5 });
    const starField = new THREE.Points(starGeometry, starMaterial);
    this.scene.add(starField);
  }

  createNebula() {
    const nebulaGeometry = new THREE.SphereGeometry(60, 32, 32);
    const nebulaMaterial = new THREE.MeshStandardMaterial({
      color: 0x443355, transparent: true, opacity: 0.4,
    });
    const nebula = new THREE.Mesh(nebulaGeometry, nebulaMaterial);
    nebula.position.set(0, 0, -200);
    this.scene.add(nebula);
  }

  createAsteroids() {
    for (let i = 0; i < 15; i++) {
      const geometry = new THREE.SphereGeometry(Math.random() * 2, 32, 32);
      const material = new THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
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
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      1.5, 0.4, 0.85
    );

    this.composer.addPass(bloomPass);
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

      this.controls.update();
      this.composer.render();
    };

    animate();
  }

  setupSettingsPanel() {
    const settingsPanel = document.createElement('div');
    Object.assign(settingsPanel.style, {
      position: 'absolute', top: '10px', left: '10px',
      backgroundColor: 'rgba(0, 0, 0, 0.7)', color: 'white',
      padding: '10px', borderRadius: '5px'
    });

    settingsPanel.innerHTML = `<label>Speed: </label>
      <input type="range" min="1" max="10" value="${this.speed}" 
      oninput="this.nextElementSibling.value = this.value">
      <output>${this.speed}</output>`;

    document.body.appendChild(settingsPanel);
  }
}
