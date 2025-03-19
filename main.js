class SpaceScene {
  constructor() {
    // === Three.js Essentials ===
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(
      75,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    );
    this.renderer = new THREE.WebGLRenderer({ antialias: true });

    // === Properties ===
    this.controls = null;
    this.asteroids = [];
    this.speed = 2;
    this.isWarping = false;
    this.warpSpeed = 0;
    this.maxWarpSpeed = 50;
    this.acceleration = 0.5;

    // === Loaders ===
    this.manager = new THREE.LoadingManager();
    this.textureLoader = new THREE.TextureLoader(this.manager);

    // === Init call ===
    this.init();
  }

  init() {
    this.setupRenderer(); // Renderer setup
    this.setupCamera(); // Camera setup
    this.setupControls(); // Controls setup
    this.setupEventListeners(); // Warp key listener
    this.createStartScreen(); // Overlay start button
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

    // === Disable these temporarily to avoid clashing with warp movement ===
    this.controls.enableDamping = false;
    this.controls.enablePan = false;
    this.controls.enableZoom = false;
    this.controls.enableRotate = false;
  }

  // === Warp key listener (adds keydown event to trigger warp) ===
  setupEventListeners() {
    window.addEventListener('keydown', (e) => {
      if (e.code === 'KeyW') { // Press 'W' key to trigger warp
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
    this.setupAnimationLoop(); // Your game/render loop
    this.setupSettingsPanel();
    this.setupDebugHUD(); // <-- ADD debug HUD here
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
    // If background.jpg fails, console will show error but scene will still work
    this.textureLoader.load(
      'background.jpg',
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

  // === TEMPORARY bloom tweak ===
  setupBloomEffect() {
    this.composer = new EffectComposer(this.renderer);
    this.composer.addPass(new RenderPass(this.scene, this.camera));

    const bloomPass = new UnrealBloomPass(
      new THREE.Vector2(window.innerWidth, window.innerHeight),
      0.8, // reduced strength to avoid washing out scene
      0.4,
      0.65
    );

    this.composer.addPass(bloomPass);
  }

  // === Main animation loop + warp logic ===
  setupAnimationLoop() {
    const animate = () => {
      requestAnimationFrame(animate);

      // Warp effect
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

      // OrbitControls still updates position/rotation
      this.controls.update();
      this.composer.render();
      
      // === Debug text updates here ===
      this.debugText.innerText = `Camera Z: ${this.camera.position.z.toFixed(2)} | WarpSpeed: ${this.warpSpeed.toFixed(2)}`;
    };

    animate();
  }

  // === Debug HUD for camera and warp speed ===
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
