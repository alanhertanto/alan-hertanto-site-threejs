// helper.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export function setWorldRotation(object, xDeg, yDeg, zDeg) {
    const worldEuler = new THREE.Euler(
        THREE.MathUtils.degToRad(xDeg),
        THREE.MathUtils.degToRad(yDeg),
        THREE.MathUtils.degToRad(zDeg),
        'XYZ'
    );

    const worldQuat = new THREE.Quaternion().setFromEuler(worldEuler);

    const parentQuat = object.parent
        ? object.parent.getWorldQuaternion(new THREE.Quaternion())
        : new THREE.Quaternion();

    const localQuat = parentQuat.invert().multiply(worldQuat);
    object.setRotationFromQuaternion(localQuat);
}

export function setLocalRotation(object, xDeg, yDeg, zDeg) {
    object.rotation.set(
        THREE.MathUtils.degToRad(xDeg),
        THREE.MathUtils.degToRad(yDeg),
        THREE.MathUtils.degToRad(zDeg)
    );
}

export function instantiateObject(name, scene) {
    const loader = new GLTFLoader();
    loader.load(name, function (gltf) {
        const objek = gltf.scene.children[0];
        const materialObjek = new THREE.MeshStandardMaterial({
            color: 0x8B4513, // Brown color for the desk
            roughness: 0.5,
            metalness: 0.1
        });
        objek.material = materialObjek;
        scene.add(gltf.scene);
    }, undefined, function (error) {
        console.error(error);
    }, function (xhr) {
        console.log((xhr.loaded / xhr.total * 100) + '% loaded');
    });

}