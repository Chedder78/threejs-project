export class SpaceScene {
  constructor(THREE, OrbitControls, EffectComposer, RenderPass, UnrealBloomPass) {
    // Store modules
    this.THREE = THREE;
    this.OrbitControls = OrbitControls;
    this.EffectComposer = EffectComposer;
    this.RenderPass = RenderPass;
    this.UnrealBloomPass = UnrealBloomPass;

    // Core Three.js components
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = null;
    this.controls = null;
    this.composer = null;

    // Properties
    this.asteroids = [];
    this.speed = 2;
    this.isWarping = false;
    this.warpSpeed = 0;
    this.maxWarpSpeed = 50;
    this.acceleration = 0.5;

    // Loaders
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
    this.renderer = new this.THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.outputColorSpace = this.THREE.SRGBColorSpace;
    this.renderer.toneMapping = this.THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.0;
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    document.body.appendChild(this.renderer.domElement);
  }

  setupCamera() {
    this.camera.position.z = 50;
  }

  setupControls() {
    this.controls = new this.OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = false;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.enableRotate = false;
  }

  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyW') {
        this.isWarping = true;
      }
    });
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
    this.setupDebugHUD();
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
      './background.png.jpg', // Make sure this path is correct
      (texture) => { this.scene.background = texture; },
      undefined,
      (err) => { console.error('Error loading background:', err); }
    );
  }

  setupLighting() {
    const light = new this.THREE.PointLight(0xffffff, 1.5, 100);
    light.position.set(10, 10, 10);
    this.scene.add(light);
  }

  createStarField() {
    const starGeometry = new this.THREE.BufferGeometry();
    const starPositions = [];

    for (let i = 0; i < 500; i++) {
      starPositions.push((Math.random() - 0.5) * 1000);
      starPositions.push((Math.random() - 0.5) * 1000);
      starPositions.push((Math.random() - 0.5) * 1000);
    }

    starGeometry.setAttribute('position', new this.THREE.Float32BufferAttribute(starPositions, 3));

    const starMaterial = new this.THREE.PointsMaterial({ color: 0xffffff, size: 1.5 });
    const starField = new this.THREE.Points(starGeometry, starMaterial);
    this.scene.add(starField);
  }

  createNebula() {
    const nebulaGeometry = new this.THREE.SphereGeometry(60, 32, 32);
    const nebulaMaterial = new this.THREE.MeshStandardMaterial({
      color: 0x443355, transparent: true, opacity: 0.4,
    });
    const nebula = new this.THREE.Mesh(nebulaGeometry, nebulaMaterial);
    nebula.position.set(0, 0, -200);
    this.scene.add(nebula);
  }

  createAsteroids() {
    for (let i = 0; i < 15; i++) {
      const geometry = new this.THREE.SphereGeometry(Math.random() * 2, 32, 32);
      const material = new this.THREE.MeshStandardMaterial({ color: Math.random() * 0xffffff });
      const asteroid = new this.THREE.Mesh(geometry, material);
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
    this.composer = new this.EffectComposer(this.renderer);
    this.composer.addPass(new this.RenderPass(this.scene, this.camera));

    const bloomPass = new this.UnrealBloomPass(
      new this.THREE.Vector2(window.innerWidth, window.innerHeight),
      0.8, // reduced bloom strength
      0.4,
      0.65
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
      this.debugText.innerText = `Camera Z: ${this.camera.position.z.toFixed(2)} | WarpSpeed: ${this.warpSpeed.toFixed(2)}`;
    };

    animate();
  }

  setupDebugHUD() {
    this.debugText = document.createElement('div');
    Object.assign(this.debugText.style, {
      position: 'absolute', bottom: '10px', left: '10px',
      color: 'white', fontSize: '14px', backgroundColor: 'rgba(0,0,0,0.5)',
      padding: '5px', borderRadius: '5px'
    });
    document.body.appendChild(this.debugText);
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
