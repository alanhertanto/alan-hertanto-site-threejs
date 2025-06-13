import * as THREE from 'three';

import { instaniateAllFilesFromFolder } from './helper.js';
import { initLighting } from './lighting.js';
import { getCameraControls, initCameraControls } from './cameraControl.js';
import { getComposer, getOutlinePass, initProcessing } from './postProcess.js';
// === 1. Setup Scene & Camera ===
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(5, 4, 5);

// === 2. Renderer ===
const renderer = new THREE.WebGLRenderer({ antialias: false });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
document.body.appendChild(renderer.domElement);

// === 3. Controls ===
initCameraControls(camera,renderer);

// === 4. Lighting ===
initLighting(scene);

// === 5. Post-processing ===
initProcessing(renderer, scene, camera);
// === 6. Raycaster ===
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
const clickableMeshes = [];

// === 7. Handle Pointer Move ===
window.addEventListener('pointermove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(clickableMeshes, true);

    if (intersects.length > 0) {
        const hoveredObject = intersects[0].object;
        getOutlinePass().selectedObjects = [hoveredObject];
    } else {
        getOutlinePass().selectedObjects = [];
    }
});

// === 8. Load all models ===
instaniateAllFilesFromFolder(scene, clickableMeshes);

// === 9. Window Resize ===
window.addEventListener('resize', () => {
    const width = window.innerWidth;
    const height = window.innerHeight;
    camera.aspect = width / height;
    camera.updateProjectionMatrix();
    renderer.setSize(width, height);
    getComposer().setSize(width, height);
});

// === 10. Optional: Camera Clamping ===
// const roomBox = new THREE.Box3().setFromCenterAndSize(
//     new THREE.Vector3(0, 2.5, 0),
//     new THREE.Vector3(10, 5, 10)
// );
// function clampCameraWithBox() {
//     const clamped = roomBox.clampPoint(camera.position, new THREE.Vector3());
//     camera.position.copy(clamped);
// }

// === 11. Animation Loop ===
function animate() {
    requestAnimationFrame(animate);
    getCameraControls().update();
    //clampCameraWithBox();
    getComposer().render();
}
animate();

// === 12. Optional: Exposure Debug ===
window.exposure = 1.2;
window.addEventListener('keydown', (e) => {
    if (e.key === '+') window.exposure += 0.1;
    if (e.key === '-') window.exposure -= 0.1;
    renderer.toneMappingExposure = window.exposure;
    console.log('Exposure:', window.exposure.toFixed(2));
});
