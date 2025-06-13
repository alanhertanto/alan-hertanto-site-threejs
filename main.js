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
initCameraControls(camera, renderer);

// === 4. Lighting ===
initLighting(scene);

// === 5. Post-processing ===
initProcessing(renderer, scene, camera);
// === 6. Raycaster ===
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// === 7. Handle Pointer Move ===
window.addEventListener('pointermove', (event) => {
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(scene.children, true); // true = recursive

    if (intersects.length > 0) {
        const hitObject = intersects[0].object;
        // Naik ke parent yang clickable
        let group = hitObject;
        while (group && !group.userData.clickable) {
            group = group.parent;
        }

        if (group && group.userData.clickable) {
            // apply outline ke group
            clickableGroups = group;
            getOutlinePass().selectedObjects = [clickableGroups];
        } else {
            getOutlinePass().selectedObjects = [];
        }

    } else {
        getOutlinePass().selectedObjects = [];
    }
});

let clickableGroups = [];

const roomBox = new THREE.Box3();

// === 8. Load all models ===
instaniateAllFilesFromFolder(scene, clickableGroups,roomBox);

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


function clampCameraWithBox() {
    const clamped = roomBox.clampPoint(camera.position, new THREE.Vector3());
    camera.position.copy(clamped);
}

// === 11. Animation Loop ===
function animate() {
    requestAnimationFrame(animate);
    getCameraControls().update();
    clampCameraWithBox();
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
