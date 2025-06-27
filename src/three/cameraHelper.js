import * as THREE from 'three';
import { closeSideModal } from './modalHelper.js';
import { gsap } from 'gsap';
import { openFlipBook } from './flipBookVanilla.js';

const blocker = document.createElement('div');
blocker.id = 'control-blocker';
blocker.style.position = 'fixed';
blocker.style.top = 0;
blocker.style.left = 0;
blocker.style.width = '100%';
blocker.style.height = '100%';
blocker.style.zIndex = 9999;
blocker.style.cursor = 'wait';
blocker.style.pointerEvents = 'auto'; // Ensures it captures events

export function createControlBlocker() {
    if (!document.body.contains(blocker)) {
        document.body.appendChild(blocker);
    }
}

export function removeControlBlocker() {
    if (document.body.contains(blocker)) {
        document.body.removeChild(blocker);
    }
}



export function focusCameraWithEvent(camera, controls, params, customEvent, gameObject) {
    const startTarget = controls.target.clone();
    const startPos = camera.position.clone();

    const desiredTarget = params.target instanceof THREE.Vector3 ? params.target : new THREE.Vector3().fromArray(params.target);
    const desiredPos = params.position instanceof THREE.Vector3 ? params.position : new THREE.Vector3().fromArray(params.position);

    const tweenObj = {
        camX: startPos.x,
        camY: startPos.y,
        camZ: startPos.z,
        tgtX: startTarget.x,
        tgtY: startTarget.y,
        tgtZ: startTarget.z,
        fov: camera.fov,
        zoom: camera.zoom
    };

    gsap.to(tweenObj, {
        camX: desiredPos.x,
        camY: desiredPos.y,
        camZ: desiredPos.z,
        tgtX: desiredTarget.x,
        tgtY: desiredTarget.y,
        tgtZ: desiredTarget.z,
        fov: params.fov !== undefined ? params.fov : camera.fov,
        zoom: params.zoom !== undefined ? params.zoom : camera.zoom,
        duration: params.duration || 1.5,
        ease: 'power2.inOut',
        onStart: () => {
           createControlBlocker();
        },
        onUpdate: () => {
            camera.position.set(tweenObj.camX, tweenObj.camY, tweenObj.camZ);
            camera.fov = tweenObj.fov;
            camera.zoom = tweenObj.zoom;
            camera.updateProjectionMatrix();

            controls.target.set(tweenObj.tgtX, tweenObj.tgtY, tweenObj.tgtZ);
            controls.update();
        }, onComplete: () => {
            document.getElementById('ui-buttons').style.display = 'flex';
            if (customEvent && typeof customEvent === 'function') {
                customEvent();
            }
            gameObject.userData.clickable = true; // Reset clickable state
            removeControlBlocker();

        }
    });
}

export function focusCameraWithoutComplete(camera, controls, params) {
    const startTarget = controls.target.clone();
    const startPos = camera.position.clone();

    const desiredTarget = params.target instanceof THREE.Vector3 ? params.target : new THREE.Vector3().fromArray(params.target);
    const desiredPos = params.position instanceof THREE.Vector3 ? params.position : new THREE.Vector3().fromArray(params.position);

    const tweenObj = {
        camX: startPos.x,
        camY: startPos.y,
        camZ: startPos.z,
        tgtX: startTarget.x,
        tgtY: startTarget.y,
        tgtZ: startTarget.z,
        fov: camera.fov,
        zoom: camera.zoom
    };

    gsap.to(tweenObj, {
        camX: desiredPos.x,
        camY: desiredPos.y,
        camZ: desiredPos.z,
        tgtX: desiredTarget.x,
        tgtY: desiredTarget.y,
        tgtZ: desiredTarget.z,
        fov: params.fov !== undefined ? params.fov : camera.fov,
        zoom: params.zoom !== undefined ? params.zoom : camera.zoom,
        duration: params.duration || 1.5,
        ease: 'power2.inOut',
        onStart: () => {
            closeSideModal();
            createControlBlocker();

        },
        onUpdate: () => {
            camera.position.set(tweenObj.camX, tweenObj.camY, tweenObj.camZ);
            camera.fov = tweenObj.fov;
            camera.zoom = tweenObj.zoom;
            camera.updateProjectionMatrix();

            controls.target.set(tweenObj.tgtX, tweenObj.tgtY, tweenObj.tgtZ);
            controls.update();
        }, onComplete: () => {
           removeControlBlocker();
        }
    });
}

export function focusObjectWithoutComplete(camera, controls, params, gameObject, distance = 0.001) {
    // Save the camera's current and desired target/position
    const startTarget = controls.target.clone();
    const startPosCam = camera.position.clone();

    const desiredTarget = params.target instanceof THREE.Vector3
        ? params.target
        : new THREE.Vector3().fromArray(params.target);
    const desiredCamPos = params.position instanceof THREE.Vector3
        ? params.position
        : new THREE.Vector3().fromArray(params.position);

    // We'll use desiredCamPos, not getWorldPosition() anymore
    const cameraDirection = new THREE.Vector3().subVectors(desiredTarget, desiredCamPos).normalize();
    const desiredObjPos = desiredCamPos.clone().add(cameraDirection.multiplyScalar(distance));

    const startObjPos = gameObject.position.clone();
    const worldPos = new THREE.Vector3();
    gameObject.getWorldPosition(worldPos);
    console.log(`Previous GameObject Position is ${worldPos.toArray()}`);
    const tweenObjCam = {
        camX: startPosCam.x,
        camY: startPosCam.y,
        camZ: startPosCam.z,
        tgtX: startTarget.x,
        tgtY: startTarget.y,
        tgtZ: startTarget.z,
        fov: camera.fov,
        zoom: camera.zoom
    };
    const tweenObj = {
        x: startObjPos.x,
        y: startObjPos.y,
        z: startObjPos.z
    };

    // 1) Tween the camera
    gsap.to(tweenObjCam, {
        camX: desiredCamPos.x,
        camY: desiredCamPos.y,
        camZ: desiredCamPos.z,
        tgtX: desiredTarget.x,
        tgtY: desiredTarget.y,
        tgtZ: desiredTarget.z,
        fov: params.fov ?? camera.fov,
        zoom: params.zoom ?? camera.zoom,
        duration: params.duration || 1.5,
        ease: 'power2.inOut',
        onStart: () => {
           createControlBlocker();
        },
        onUpdate: () => {
            camera.position.set(tweenObjCam.camX, tweenObjCam.camY, tweenObjCam.camZ);
            camera.fov = tweenObjCam.fov;
            camera.zoom = tweenObjCam.zoom;
            camera.updateProjectionMatrix();

            controls.target.set(tweenObjCam.tgtX, tweenObjCam.tgtY, tweenObjCam.tgtZ);
            controls.update();
        },
        onComplete: () => {
            if (gameObject.name == "Resume") {
                // Show popup
                document.getElementById('popup-book').display = 'flex';
                openFlipBook();
            }
            gameObject.userData.clickable = true; // Reset clickable state
            removeControlBlocker();

        }
    });
}

