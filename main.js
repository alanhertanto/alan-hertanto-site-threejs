import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { setWorldRotation, setLocalRotation } from './helper.js';
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

//resume
const loaderResume = new GLTFLoader();
loaderResume.load('./paper_tablet.glb', function (gltf) {
    const resume = gltf.scene.children[0];
    resume.position.set(-0.23, 0.75, 0.34); // Set the position here
    resume.scale.set(0.8, 0.8, 0.8); // Scale down the model
    setWorldRotation(resume, 0, -78, 180); // Set the world rotation to 0, 0, 0
    const materialResume = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        roughness: 0.5,
        metalness: 0.5,
        map: new THREE.TextureLoader().load('./paper_tablet.png')
    });
    const paperTablet = resume.children[0].children[0].children[1].children[0];
    console.log(resume);
    paperTablet.material = materialResume;
    scene.add(gltf.scene);
}, undefined, function (error) {
    console.error(error);
}, function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
});

//desk
const loaderDesk = new GLTFLoader();
var deskObj = new THREE.Object3D();
loaderDesk.load('./vasagle_l_desk.glb', function (gltf) {
    const desk = gltf.scene.children[0];
    desk.position.set(0, 0, 0); // Set the position here
    const materialDesk = new THREE.MeshStandardMaterial({
        color: 0x8B4513, // Brown color for the desk
        roughness: 0.5,
        metalness: 0.1
    });
    desk.material = materialDesk;
    deskObj = gltf.scene;
    scene.add(gltf.scene);
}, undefined, function (error) {
    console.error(error);
}, function (xhr) {
    console.log((xhr.loaded / xhr.total * 100) + '% loaded');
});
//PC
const loaderPC = new GLTFLoader();
loaderPC.load('laptop.glb', function (gltf) {
    const pc = gltf.scene.children[0];
    pc.position.set(0.45, 0.75, -0.55); // Set the position here
    pc.scale.set(0.075, 0.075, 0.075); // Scale down the model
    setWorldRotation(pc, -90, 0, 0); // Set the world rotation to 0, 0, 0
    const materialPC = new THREE.MeshStandardMaterial({
        color: 0xFFFFFF,
        roughness: 0.5,
        metalness: 0.5,
    });
    pc.material = materialPC;
    scene.add(gltf.scene);
});




const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(2, 2, 2); // X, Y, Z
controls.target.set(0, 0, 0); // Set the target to the center of the desk
controls.update();

// controls.target.set(0.7, 1.2, 1.4);
const color = 0xFFFFFF;
const intensity = 1;
const light = new THREE.AmbientLight(color, intensity);
scene.background = new THREE.Color(0x87CEEB); // Sky blue background
scene.add(light);
function animate() {
    renderer.render(scene, camera);
}
renderer.setAnimationLoop(animate);