import * as THREE from 'three';
import { getCameraControls } from './cameraController.js';
import { getOutlinePass, getComposer } from './postProcessController.js';
import { } from './helper.js';
import { focusCameraWithEvent, focusCameraWithoutComplete,focusObjectWithoutComplete } from './cameraHelper.js';
import { openSideModal, applyModalConfig, openGalleryModal } from './modalHelper.js';

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

export function addButtonListenerForCameraMovement(button, controls, camera) {
    button.addEventListener('click', () => {
        focusCameraWithoutComplete(camera, controls, {
            target: new THREE.Vector3(0, 0, 0),
            position: new THREE.Vector3(5, 4, 5),
            fov: 75,
            zoom: 1,
            duration: 1.5
        });

        console.log('Button clicked:', button.name);
        document.getElementById('ui-buttons').style.display = 'none';
    });
}

export function initAllListener(camera, scene, clickableGroups, renderer) {
    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // ✅ Helper: check if ANY modal is open
    function isAnyModalOpen() {
        const modals = [
            document.getElementById('side-modal'),
            document.getElementById('side-modal-with-gallery'),
            document.getElementById('popup')
        ];
        return modals.some(modal =>
            modal && modal.style.display !== 'none' && modal.style.display !== ''
        );
    }

    // ✅ Pointer move: outline hover
    window.addEventListener('pointermove', (event) => {
        if (isAnyModalOpen()) {
            getOutlinePass().selectedObjects = [];
            return;
        }

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

    // ✅ Click: focus camera
    window.addEventListener('click', (event) => {
        if (isAnyModalOpen()) return;

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
                const modal = group.userData.modal;
                if (config) {
                    let camPos;
                    if (config.controls_target && config.controls_distance) {
                        const target = new THREE.Vector3().fromArray(config.controls_target);
                        const dir = new THREE.Vector3().fromArray(config.position).sub(target).normalize();
                        camPos = target.clone().add(dir.multiplyScalar(config.controls_distance));
                    } else {
                        camPos = new THREE.Vector3().fromArray(config.position);
                    }

                    focusCameraWithEvent(camera, controls, {
                        position: camPos,
                        target: config.controls_target,
                        fov: config.fov,
                        zoom: config.zoom,
                        duration: 1.5
                    }, openSideModal);

                    if (modal) {
                        console.log(modal);
                        applyModalConfig(modal);

                    }

                    console.log('Clicking on:', group.name);
                }
            }
        }
    });

    // ✅ Exposure tweak
    window.exposure = 1.2;
    window.addEventListener('keydown', (e) => {
        if (e.key === '+') window.exposure += 0.1;
        if (e.key === '-') window.exposure -= 0.1;
        if (e.key=== '.') focusObjectWithoutComplete(camera, scene.getObjectByName('VR'));
        renderer.toneMappingExposure = window.exposure;
        console.log('Exposure:', window.exposure.toFixed(2));
    });

    // ✅ Resize
    window.addEventListener('resize', () => {
        const width = window.innerWidth;
        const height = window.innerHeight;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderer.setSize(width, height);
        getComposer().setSize(width, height);
    });

    // ✅ Popup
    const popup = document.getElementById("popup");
    const popupImg = document.getElementById("popup-img");
    const popupClose = document.getElementById("popup-close");

    document.querySelectorAll(".gallery-card img").forEach(img => {
        img.addEventListener("click", () => {
            popupImg.src = img.src;
            popup.classList.remove("hidden");
        });
    });

    popupClose.addEventListener("click", () => {
        popup.classList.add("hidden");
    });
    popup.addEventListener("click", (e) => {
        if (e.target === popup) {
            popup.classList.add("hidden");
        }
    });
}