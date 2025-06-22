import * as THREE from 'three';
import { closeSideModal } from './modalHelper.js';
import { gsap } from 'gsap';

export function focusCamera(camera, controls, params) {
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
        onUpdate: () => {
            camera.position.set(tweenObj.camX, tweenObj.camY, tweenObj.camZ);
            camera.fov = tweenObj.fov;
            camera.zoom = tweenObj.zoom;
            camera.updateProjectionMatrix();

            controls.target.set(tweenObj.tgtX, tweenObj.tgtY, tweenObj.tgtZ);
            controls.update();
        }, onComplete: () => {
            document.getElementById('ui-buttons').style.display = 'flex';

        }
    });
}
export function focusCameraWithEvent(camera, controls, params, customEvent) {
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
        onUpdate: () => {
            camera.position.set(tweenObj.camX, tweenObj.camY, tweenObj.camZ);
            camera.fov = tweenObj.fov;
            camera.zoom = tweenObj.zoom;
            camera.updateProjectionMatrix();

            controls.target.set(tweenObj.tgtX, tweenObj.tgtY, tweenObj.tgtZ);
            controls.update();
        }, onComplete: () => {
            closeSideModal();
        }
    });
}

export function focusObjectWithoutComplete(camera, controls, params, gameObject, distance = 5) {
    const startTarget = controls.target.clone();
    const startPosCam = camera.position.clone();

    const desiredTarget = params.target instanceof THREE.Vector3 ? params.target : new THREE.Vector3().fromArray(params.target);
    const desiredPos = params.position instanceof THREE.Vector3 ? params.position : new THREE.Vector3().fromArray(params.position);
    // 1) Get camera world position
    const cameraPosition = new THREE.Vector3();
    camera.getWorldPosition(cameraPosition);

    // 2) Get camera forward vector
    const cameraDirection = new THREE.Vector3();
    camera.getWorldDirection(cameraDirection); // this is normalized

    // 3) Desired position = camera position + forward * distance
    const desiredPosition = cameraPosition.clone().add(cameraDirection.multiplyScalar(distance));

    // 4) Animate object to this position
    const startPos = gameObject.position.clone();

    const tweenObj = {
        x: startPos.x,
        y: startPos.y,
        z: startPos.z
    };
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

    gsap.to(tweenObjCam, {
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
        onUpdate: () => {
            camera.position.set(tweenObj.camX, tweenObj.camY, tweenObj.camZ);
            camera.fov = tweenObj.fov;
            camera.zoom = tweenObj.zoom;
            camera.updateProjectionMatrix();

            controls.target.set(tweenObj.tgtX, tweenObj.tgtY, tweenObj.tgtZ);
            controls.update();
        }, onComplete: () => {
            gsap.to(tweenObj, {
                x: desiredPosition.x,
                y: desiredPosition.y,
                z: desiredPosition.z,
                duration: 1.5,
                ease: 'power2.inOut',
                onUpdate: () => {
                    gameObject.position.set(tweenObj.x, tweenObj.y, tweenObj.z);
                    gameObject.lookAt(camera.position);
                },
                onComplete: () => {
                    console.log(`Object now in front of camera at: ${gameObject.position.toArray()}`);
                }
            });
        }
    });




}
