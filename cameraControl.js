import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
let controlsCamera;
export function initCameraControls(camera, renderer) {
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0, 0);
    controls.enableDamping = true;
    controls.dampingFactor = 0.3;
    controls.minAzimuthAngle = -Math.PI / 8;
    controls.maxAzimuthAngle = Math.PI / 2;
    controls.minPolarAngle = Math.PI / 10;
    controls.maxPolarAngle = Math.PI / 2.25;
    controls.minDistance = 1;
    controls.maxDistance = 9;
    controlsCamera = controls;
}

export function getCameraControls() {
    return controlsCamera;
}