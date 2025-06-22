import * as THREE from 'three';

import { instantiateAllFilesFromFolder, loadJSONConfig } from './helper.js';
import { initLighting } from './lightingController.js';
import { getCameraControls, initCameraControls } from './cameraController.js';
import { getComposer, initProcessing } from './postProcessController.js';
import { initRendererControls, getRendererControls } from './rendererController.js';
import { initAllListener, addButtonListenerForCameraMovement } from './eventListenerController.js';
import { initDebugControls, checkCameraChanges, createCameraState } from './debugController.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x87CEEB);

const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);
camera.position.set(5, 4, 5);
// Create once:
initRendererControls();
initCameraControls(camera, getRendererControls());
initLighting(scene);
const clickableConfigs = await loadJSONConfig('allObjectsConfig.json');
const modalConfigs = await loadJSONConfig('allObjectsModalConfig.json');


initProcessing(getRendererControls(), scene, camera);
let clickableGroups = [];
instantiateAllFilesFromFolder(scene, clickableGroups, clickableConfigs, modalConfigs);
const lastCameraState = createCameraState(camera, getCameraControls());

initDebugControls(scene);
initAllListener(camera, getCameraControls(), clickableGroups, getRendererControls());
//testing the button later be refactored.
const button1 = document.getElementById('btn1');
addButtonListenerForCameraMovement(button1, getCameraControls(), camera);
// === 11. Animation Loop ===
function animate() {
    requestAnimationFrame(animate);

    checkCameraChanges(camera, getCameraControls(), lastCameraState);

    getCameraControls().update();
    getComposer().render();
}
animate();