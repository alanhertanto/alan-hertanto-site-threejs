// helper.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ✅ Fungsi memuat semua file di folder
export function instaniateAllFilesFromFolder(scene, clickableGroups, roomBox) {
    const files = import.meta.glob('./src/*.glb', { as: 'url' });

    for (const path in files) {
        files[path]().then(url => {
            instantiateObject(url, scene, clickableGroups, roomBox);
        });
    }
}

// ✅ Fungsi load 1 GLB & register parent group sebagai clickable
export function instantiateObject(url, scene, clickableGroups, roomBox) {
    const clickableNames = ['VR', 'Ashtray', 'Guest-book', 'Teleskop', 'Resume', 'Laptop', 'Date', 'Smartphone'];
    const filename = url.split('/').pop().split('.')[0];
    const gradientMap = new THREE.TextureLoader().load(
        'https://threejs.org/examples/textures/gradientMaps/threeTone.jpg'
    );
    gradientMap.minFilter = THREE.NearestFilter;
    gradientMap.magFilter = THREE.NearestFilter;

    const loader = new GLTFLoader();
    loader.load(
        url,
        function (gltf) {
            const parent = gltf.scene; // treat root node as group
            const root = gltf.scene.children[0];
            if (clickableNames.some(n => filename.includes(n))) {
                parent.userData.clickable = true;
                clickableGroups.push(parent);
                console.log('Room bounding box:', roomBox.min, roomBox.max);

            }

            // Optional: tetap traverse child buat setup shadow, material, dll
            parent.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });
            // If this model is the room, set the box:
            scene.add(parent);

            if (url.includes('Room')) {
                roomBox.setFromObject(parent);
            }

        },
        undefined,
        function (error) {
            console.error(error);
        }
    );
}

// ✅ Util: atur world rotation
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

// ✅ Util: atur local rotation
export function setLocalRotation(object, xDeg, yDeg, zDeg) {
    object.rotation.set(
        THREE.MathUtils.degToRad(xDeg),
        THREE.MathUtils.degToRad(yDeg),
        THREE.MathUtils.degToRad(zDeg)
    );
}
