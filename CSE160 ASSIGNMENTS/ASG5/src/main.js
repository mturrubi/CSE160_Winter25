// main.js
// Martin Turrubiates
// mturrubi@ucsc.edu

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(1200, 800);
renderer.domElement.style.display = 'block';
renderer.domElement.style.margin = 'auto';
renderer.domElement.style.position = 'absolute';
renderer.domElement.style.top = '50%';
renderer.domElement.style.left = '50%';
renderer.domElement.style.transform = 'translate(-50%, -50%)';
// UI Container
const uiContainer = document.createElement('div');
uiContainer.style.position = 'absolute';
uiContainer.style.top = '10px';
uiContainer.style.left = '10px';
uiContainer.style.padding = '10px';
uiContainer.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
uiContainer.style.color = 'white';
uiContainer.style.fontFamily = 'monospace';
uiContainer.style.borderRadius = '5px';

document.body.appendChild(uiContainer);

// Instructions
const instructions = document.createElement('p');
instructions.innerHTML = 'Controls:<br>WASD - Move<br>Mouse - Look<br>Fly back to see fog<br>Click refresh to generate new shapes';
uiContainer.appendChild(instructions);

// Refresh Button
const refreshButton = document.createElement('button');
refreshButton.textContent = 'Generate New Shapes';
refreshButton.style.marginTop = '10px';
refreshButton.onclick = function () {
    scene.children = scene.children.filter(obj => !obj.isMesh || obj === plane || obj === cube || obj === sphere || obj === cylinder);
    createRandomShapes(30);
};
uiContainer.appendChild(refreshButton);

document.body.appendChild(renderer.domElement);

scene.add(new THREE.AmbientLight(0x404040));
const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 10, 5);
scene.add(dirLight);
const pointLight = new THREE.PointLight(0xff0000, 1, 10);
pointLight.position.set(0, 5, 0);
scene.add(pointLight);

// Ground Plane (Textured Grass)

const textureLoader = new THREE.TextureLoader();
const grassTexture = textureLoader.load('/assets/textures/grass.png');
const planeGeometry = new THREE.PlaneGeometry(50, 50);
const planeMaterial = new THREE.MeshStandardMaterial({ map: grassTexture });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
scene.add(plane);

// Textured Cube

const brickTexture = textureLoader.load('/assets/textures/brick.jpg');
const cubeGeometry = new THREE.BoxGeometry();
const cubeMaterial = new THREE.MeshStandardMaterial({ map: brickTexture });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.position.set(-2, 1, 0);
scene.add(cube);

// Other Shapes

const sphere = new THREE.Mesh(new THREE.SphereGeometry(1, 32, 32), new THREE.MeshStandardMaterial({ color: 0x0000ff }));
sphere.position.set(2, 1, 0);
scene.add(sphere);

const cylinder = new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 2, 32), new THREE.MeshStandardMaterial({ color: 0xffcc00 }));
cylinder.position.set(0, 1, 2);
scene.add(cylinder);

const objLoader = new THREE.OBJLoader();
objLoader.load('/assets/models/Tree1.obj', function (object) {
    object.rotation.x = -Math.PI / 2;
    object.position.set(0, 0, -3);
    object.scale.set(1, 1, 1);
    scene.add(object);
}, undefined, function (error) {
    console.error('Error loading the model:', error);
});

// Function to Generate Random Shapes
function createRandomShapes(count) {
    const shapeTypes = ['box', 'sphere', 'cylinder'];
    for (let i = 0; i < count; i++) {
        let geometry, material;
        const shapeType = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        const color = Math.random() * 0xffffff;

        switch (shapeType) {
            case 'box':
                geometry = new THREE.BoxGeometry(Math.random() * 2 + 0.5, Math.random() * 2 + 0.5, Math.random() * 2 + 0.5);
                break;
            case 'sphere':
                geometry = new THREE.SphereGeometry(Math.random() * 1 + 0.5, 16, 16);
                break;
            case 'cylinder':
                geometry = new THREE.CylinderGeometry(Math.random() * 1 + 0.5, Math.random() * 1 + 0.5, Math.random() * 2 + 0.5, 16);
                break;
        }

        material = new THREE.MeshStandardMaterial({ color: color });
        const shape = new THREE.Mesh(geometry, material);

        shape.position.set(
            (Math.random() - 0.5) * 40,
            Math.random() * 3 + 1,
            (Math.random() - 0.5) * 40
        );

        shape.castShadow = true;
        shape.receiveShadow = true;
        scene.add(shape);
    }
}

// Generate at least 30 random shapes
createRandomShapes(30);

// Enable Shadows
renderer.shadowMap.enabled = true;
dirLight.castShadow = true;
pointLight.castShadow = true;
plane.receiveShadow = true;
cube.castShadow = true;
sphere.castShadow = true;
cylinder.castShadow = true;

// Add Fog Effect
scene.fog = new THREE.Fog(0xaaaaaa, 10, 50);

// Skybox
const skyboxTexture = textureLoader.load('/assets/textures/sky.jpg');
scene.background = skyboxTexture;

const moveSpeed = 0.1;
const lookSpeed = 0.002;
let yaw = 0, pitch = 0;
const keys = { w: false, a: false, s: false, d: false };

let isMouseActive = false;

renderer.domElement.addEventListener('click', () => {
    isMouseActive = !isMouseActive;
    renderer.domElement.requestPointerLock();
});

document.addEventListener('mousemove', (event) => {
    if (!isMouseActive) return;
    yaw -= event.movementX * lookSpeed;
    pitch -= event.movementY * lookSpeed;
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
    camera.rotation.set(pitch, yaw, 0);
});


document.addEventListener('keydown', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = true;
    }
});

document.addEventListener('keyup', (event) => {
    if (keys.hasOwnProperty(event.key)) {
        keys[event.key] = false;
    }
});

function updateCameraPosition() {
    const forward = new THREE.Vector3();
    camera.getWorldDirection(forward);
    forward.y = 0;
    forward.normalize();

    if (keys.w) camera.position.addScaledVector(forward, moveSpeed);
    if (keys.s) camera.position.addScaledVector(forward, -moveSpeed);
    const right = new THREE.Vector3();
    right.crossVectors(forward, camera.up).normalize();
    if (keys.a) camera.position.addScaledVector(right, -moveSpeed);
    if (keys.d) camera.position.addScaledVector(right, moveSpeed);
}

// Custom FPS Tracker
let lastFrameTime = performance.now();
let frameCount = 0;
let fpsDisplay = document.createElement('div');
fpsDisplay.style.position = 'fixed';
fpsDisplay.style.top = '10px';
fpsDisplay.style.left = '10px';
fpsDisplay.style.color = 'white';
fpsDisplay.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
fpsDisplay.style.padding = '5px';
fpsDisplay.style.fontFamily = 'monospace';
document.body.appendChild(fpsDisplay);

function updateFPS() {
    frameCount++;
    let now = performance.now();
    if (now - lastFrameTime >= 1000) {
        let fps = frameCount;
        fpsDisplay.textContent = `FPS: ${fps}`;
        frameCount = 0;
        lastFrameTime = now;
    }
}

function animate() {

    requestAnimationFrame(animate);
    cube.rotation.y += 0.01;
    updateCameraPosition();

    updateFPS();
    renderer.render(scene, camera);
}

camera.position.set(0, 3, 5);
animate();
