import * as THREE from 'three';
let renderer;
export function initRendererControls() {
    renderer = new THREE.WebGLRenderer({  canvas: document.getElementById('webgl-canvas') ,antialias: false });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    document.body.appendChild(renderer.domElement);
}
export function getRendererControls() {
    return renderer;
}