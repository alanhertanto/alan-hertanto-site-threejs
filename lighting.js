import * as THREE from 'three';

export function initLighting(scene){
    const dirLight = new THREE.DirectionalLight(0xffffff, 1);
    dirLight.position.set(5, 10, 5);
    dirLight.castShadow = true;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);
    
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
    scene.add(ambientLight);
    
    const fillLight = new THREE.DirectionalLight(0xfff8f0, 0.6);
    fillLight.position.set(-5, 5, 5);
    scene.add(fillLight);
    
    const rimLight = new THREE.DirectionalLight(0xffffff, 0.4);
    rimLight.position.set(0, 10, -5);
    scene.add(rimLight);
}