// helper.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getDebugModeState } from './debugController';
// ✅ Fungsi memuat semua file di folder
export function instantiateAllFilesFromFolder(scene, clickableGroups, clickableConfigs, modalConfigs) {
    const files = import.meta.glob('./src/*.glb', { as: 'url' });

    for (const path in files) {

        if (!getDebugModeState()) {
            files[path]().then(url => {
                instantiateObject(url, scene, clickableGroups, clickableConfigs, modalConfigs);
            });
        } else {
            if (path.includes("Teleskop")) {
                files[path]().then(url => {
                    instantiateObject(url, scene, clickableGroups, clickableConfigs, modalConfigs);
                });
            }
        }

    }
}

export async function loadJSONConfig(path) {
    const response = await fetch(path);
    if (!response.ok) {
        throw new Error(`Failed to load ${path}: ${response.status}`);
    }
    const json = await response.json();
    console.log(`Loaded ${path}:`, json);
    return json;
}


// ✅ Fungsi load 1 GLB & register parent group sebagai clickable
export async function instantiateObject(url, scene, clickableGroups, clickableConfigs, modalConfigs) {

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
            const parent = gltf.scene;
            const root = gltf.scene.children[0];

            const config = clickableConfigs.find(item => filename.includes(item.name));
            if (config) {
                parent.userData.clickable = true;
                parent.userData.focusPosition = root.position.clone();
                parent.userData.cameraConfig = config.cameraConfig || null;
                parent.name = filename;
                clickableGroups.push(parent);
                console.log('Marking parent clickable with config:', filename);
            }

            const modal = modalConfigs.find(item => filename.includes(item.name));

            if (modal) {
                parent.userData.modalConfig = modal.modalConfig || null;
                parent.userData.modal = modal || null;
            }

            parent.traverse(child => {
                if (child.isMesh) {
                    child.castShadow = true;
                    child.receiveShadow = true;
                }
            });

            scene.add(parent);
        },
        undefined,
        function (error) {
            console.error(error);
        }
    );

}