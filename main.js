import * as THREE from 'three';

import { instaniateAllFilesFromFolder, focusCamera } from './helper.js';
import { initLighting } from './lightingController.js';
import { getCameraControls, initCameraControls } from './cameraController.js';
import { getComposer, initProcessing } from './postProcessController.js';
import { initRendererControls,getRendererControls } from './rendererController.js';
import { initAllListener } from './eventListenerController.js';
import { initDebugControls,checkCameraChanges } from './debugController.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(5, 4, 5);

initRendererControls();
initCameraControls(camera, getRendererControls());
initLighting(scene);
initProcessing(getRendererControls(), scene, camera);
let clickableGroups = [];
instaniateAllFilesFromFolder(scene, clickableGroups);
initDebugControls(camera, scene,getCameraControls());
initAllListener(camera,scene, getCameraControls(), clickableGroups,getRendererControls());

// === 11. Animation Loop ===
function animate() {
    requestAnimationFrame(animate);
    getCameraControls().update();
    getComposer().render();
    checkCameraChanges(camera,getCameraControls());
}
animate();