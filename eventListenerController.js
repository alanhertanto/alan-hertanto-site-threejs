import * as THREE from 'three';
import { getCameraControls } from './cameraController.js';
import { getOutlinePass } from './postProcessController.js';
import { focusCamera } from './helper.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// === 7. Handle Pointer Move ===
export function initAllListener(camera, scene, clickableGroups, renderer) {
    window.addEventListener('click', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(clickableGroups, true);

        if (intersects.length > 0) {
            let group = intersects[0].object;
            while (group && !group.userData.clickable) {
                group = group.parent;
            }

            if (group && group.userData.clickable) {
                const controls = getCameraControls();
                const config = group.userData.cameraConfig;

                if (config) {
                    const controls = getCameraControls();

                    // Compute new camera position from target + distance if needed
                    let camPos;
                    if (config.controls_target && config.controls_distance) {
                        const target = new THREE.Vector3().fromArray(config.controls_target);
                        const dir = new THREE.Vector3().fromArray(config.position).sub(target).normalize();
                        camPos = target.clone().add(dir.multiplyScalar(config.controls_distance));
                    } else {
                        camPos = new THREE.Vector3().fromArray(config.position);
                    }

                    focusCamera(camera, controls,
                        {
                            position: camPos,
                            target: config.controls_target,
                            fov: config.fov,
                            zoom: config.zoom,
                            duration: 1.5
                        }
                    );

                    console.log('Clicking on:', group.name);
                }
            }
        }
    });



    window.addEventListener('pointermove', (event) => {
        mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
        mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(clickableGroups, true);

        if (intersects.length > 0) {
            let group = intersects[0].object;
            while (group && !group.userData.clickable) {
                group = group.parent;
            }
            if (group && group.userData.clickable) {
                getOutlinePass().selectedObjects = [group];
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