document.addEventListener("DOMContentLoaded", () => {
    console.log("Initializing Three.js Project...");

    // Check if Three.js is already loaded
    if (typeof THREE === "undefined") {
        const script = document.createElement("script");
        script.src = "https://cdnjs.cloudflare.com/ajax/libs/three.js/r136/three.min.js";
        script.onload = initializeThreeJS;
        document.head.appendChild(script);
    } else {
        initializeThreeJS();
    }

    function initializeThreeJS() {
        console.log("Three.js Loaded Successfully");

        // Create Scene
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

        renderer.setSize(window.innerWidth, window.innerHeight);
        document.body.appendChild(renderer.domElement);

        camera.position.z = 5;

        // Lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 1);
        scene.add(ambientLight);

        const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
        directionalLight.position.set(5, 10, 7);
        scene.add(directionalLight);

        // Create an Interactive 3D Object (A Rotating Cube)
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshStandardMaterial({ color: 0x00aaff });
        const cube = new THREE.Mesh(geometry, material);
        scene.add(cube);

        // Mouse Interaction
        document.addEventListener("mousemove", (event) => {
            const x = (event.clientX / window.innerWidth) * 2 - 1;
            const y = -(event.clientY / window.innerHeight) * 2 + 1;
            cube.rotation.x = y * 0.5;
            cube.rotation.y = x * 0.5;
        });

        // Handle Touch Events for Mobile Devices
        document.addEventListener("touchmove", (event) => {
            let touch = event.touches[0];
            const x = (touch.clientX / window.innerWidth) * 2 - 1;
            const y = -(touch.clientY / window.innerHeight) * 2 + 1;
            cube.rotation.x = y * 0.5;
            cube.rotation.y = x * 0.5;
        });

        // Animation Loop
        function animate() {
            requestAnimationFrame(animate);
            cube.rotation.y += 0.01;
            renderer.render(scene, camera);
        }
        animate();

        // Adjust on Window Resize (Mobile-Friendly)
        window.addEventListener("resize", () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });

        console.log("Three.js Scene Successfully Rendered");
    }
});
