document.addEventListener('DOMContentLoaded', (event) => {
  // Add Start Screen
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
  startScreen.innerHTML = '<h1>Space Adventure</h1><p>Click to Start</p>';
  document.body.appendChild(startScreen);

  // Remove Start Screen on Click
  startScreen.addEventListener('click', () => {
    document.body.removeChild(startScreen);
    initializeScene();
  });

  function initializeScene() {
    const tiltContainer = document.createElement('div');
    tiltContainer.id = 'tilt-container';
    document.body.appendChild(tiltContainer);

    // Setup Three.js Scene
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    tiltContainer.appendChild(renderer.domElement);

    // Add Loading Screen
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

    // Load Background Texture
    const loader = new THREE.TextureLoader();
    loader.load(
      'assets/background.jpg',
      function (texture) {
        scene.background = texture;
        document.body.removeChild(loadingScreen);
      },
      undefined,
      function (err) {
        console.error('An error happened while loading the texture.');
      }
    );

    // Set camera position
    camera.position.z = 50;

    // Movement Controls
    let moveLeft = false;
    let moveRight = false;
    let moveUp = false;
    let moveDown = false;
    let speed = 2;

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
    scene.add(starField);

    // Flickering effect
    function flickerStars() {
      const sizes = starGeometry.attributes.size.array;
      for (let i = 0; i < sizes.length; i++) {
        sizes[i] = Math.random() * 0.5 + 0.1;
      }
      starGeometry.attributes.size.needsUpdate = true;
    }

    setInterval(flickerStars, 100);

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

    // Create Floating Alien Planets
    const alienColors = [0x8A2BE2, 0x7FFF00, 0xFF4500, 0x00CED1, 0xFFD700, 0xADFF2F, 0xFF69B4, 0xCD5C5C];
    const asteroids = [];
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
        warpSound.play();

        setTimeout(() => {
          document.body.style.filter = "blur(0px)";
        }, 500);
      }
    });

    // Add Sound Effects
    const warpSound = new Audio('assets/warp-sound.mp3');
    warpSound.loop = true;

    const backgroundMusic = new Audio('assets/space-music.mp3');
    backgroundMusic.loop = true;
    backgroundMusic.volume = 0.5;
    backgroundMusic.play();

    // Add Particle System
    const particleGeometry = new THREE.BufferGeometry();
    const particleCount = 1000;
    const particlePositions = new Float32Array(particleCount * 3);

    for (let i = 0; i < particleCount; i++) {
      particlePositions[i * 3] = (Math.random() - 0.5) * 2000;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 2000;
      particlePositions[i * 3 + 2] = (Math.random() - 0.5) * 2000;
    }

    particleGeometry.setAttribute('position', new THREE.BufferAttribute(particlePositions, 3));

    const particleMaterial = new THREE.PointsMaterial({ color: 0xFFFFFF, size: 2 });
    const particleSystem = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particleSystem);

    // Add Bloom Effect
    const bloomPass = new THREE.UnrealBloomPass(new THREE.Vector2(window.innerWidth, window.innerHeight), 1.5, 0.4, 0.85);
    bloomPass.threshold = 0.1;
    bloomPass.strength = 1.5;
    bloomPass.radius = 0.5;

    const composer = new THREE.EffectComposer(renderer);
    composer.addPass(new THREE.RenderPass(scene, camera));
    composer.addPass(bloomPass);

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

      // Move Particle System
      if (isWarping) {
        particleSystem.position.z += warpSpeed * 2;
        if (particleSystem.position.z > 1000) {
          particleSystem.position.z = -1000;
        }
      }

      composer.render();
    }

    animate();

    // 3D Tilt Effect
    document.addEventListener('mousemove', (event) => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      const centerX = width / 2;
      const centerY = height / 2;
      const mouseX = event.clientX;
      const mouseY = event.clientY;
      const rotateX = (centerY - mouseY) / centerY * 15; // Adjust for desired tilt
      const rotateY = (mouseX - centerX) / centerX * 15; // Adjust for desired tilt

      tiltContainer.style.transform = `rotateX(${rotateX}deg) rotateY(${rotateY}deg)`;
    });

    // Add Settings Panel
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
    speedSlider.value = speed;
    speedSlider.oninput = (event) => {
      speed = parseFloat(event.target.value);
    };
    settingsPanel.appendChild(speedSlider);

    // Add Raycaster for Interactive Elements
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    window.addEventListener('click', (event) => {
      mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
      mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      const intersects = raycaster.intersectObjects(asteroids);

      if (intersects.length > 0) {
        const clickedAsteroid = intersects[0].object;
        alert(`You clicked on an asteroid with color: ${clickedAsteroid.material.color.getHexString()}`);
      }
    });

    // Handle Window Resize
    window.addEventListener('resize', () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      renderer.setSize(width, height);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    });
  }
});
