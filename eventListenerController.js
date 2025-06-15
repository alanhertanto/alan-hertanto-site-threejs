import * as THREE from 'three';
import { getCameraControls } from './cameraController.js';
import { getOutlinePass } from './postProcessController.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// === 7. Handle Pointer Move ===
export function initAllListener(camera, scene, clickableGroups, renderer) {
    window.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(scene.children, true);

        if (intersects.length > 0) {
            let group = intersects[0].object;
            while (group && !group.userData.clickable) {
                group = group.parent;
            }

            if (group && group.userData.clickable) {
                const controls = getCameraControls();
                const config = group.userData.cameraConfig;

                if (config) {
                    // 1) Set controls target jika ada
                    if (config.controls_target) {
                        controls.target.fromArray(config.controls_target);
                    }

                    // 2) Hitung posisi kamera
                    if (config.controls_target && config.controls_distance) {
                        const target = new THREE.Vector3().fromArray(config.controls_target);
                        const dir = new THREE.Vector3().fromArray(config.position).sub(target).normalize();
                        const newPos = target.clone().add(dir.multiplyScalar(config.controls_distance));
                        camera.position.copy(newPos);
                    } else if (config.position) {
                        camera.position.fromArray(config.position);
                    }

                    // 3) Atur FOV & Zoom jika ada
                    if (config.fov !== undefined) camera.fov = config.fov;
                    if (config.zoom !== undefined) camera.zoom = config.zoom;
                    camera.updateProjectionMatrix();

                    controls.update();
                }

                console.log('Clicking on:', group.name);
            }
        }
    });



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

    window.exposure = 1.2;
    window.addEventListener('keydown', (e) => {
        if (e.key === '+') window.exposure += 0.1;
        if (e.key === '-') window.exposure -= 0.1;
        renderer.toneMappingExposure = window.exposure;
        console.log('Exposure:', window.exposure.toFixed(2));
    });
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        getComposer().setSize(width, height);
    });
}