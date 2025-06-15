import * as THREE from 'three';

export function initDebugControls(scene) {
    const axesHelper = new THREE.AxesHelper(5);
    scene.add(axesHelper);

}

export function checkCameraChanges(camera,controls) {
    const lastCameraState = {
        position: new THREE.Vector3().copy(camera.position),
        quaternion: new THREE.Quaternion().copy(camera.quaternion),
        fov: camera.fov,
        zoom: camera.zoom,
        target: new THREE.Vector3().copy(controls.target),
    };

    // Utility: compare with tolerance
    function vecEquals(a, b, tolerance = 1e-5) {
        return a.distanceTo(b) < tolerance;
    }

    function quatEquals(a, b, tolerance = 1e-5) {
        return 1 - Math.abs(a.dot(b)) < tolerance;
    }

    let changed = false;

    if (!vecEquals(camera.position, lastCameraState.position)) {
        changed = true;
        lastCameraState.position.copy(camera.position);
    }

    if (!quatEquals(camera.quaternion, lastCameraState.quaternion)) {
        changed = true;
        lastCameraState.quaternion.copy(camera.quaternion); // ✅ FIXED: use quaternion, not rotation
    }

    if (camera.fov !== lastCameraState.fov) {
        changed = true;
        lastCameraState.fov = camera.fov;
    }

    if (camera.zoom !== lastCameraState.zoom) {
        changed = true;
        lastCameraState.zoom = camera.zoom;
    }

    if (!vecEquals(controls.target, lastCameraState.target)) {
        changed = true;
        lastCameraState.target.copy(controls.target);
    }

    if (changed) {
        console.log('--------------------------------');
        console.log('Camera position:', camera.position.toArray());

        const euler = new THREE.Euler().setFromQuaternion(camera.quaternion);
        console.log('Camera rotation (deg):', [
            THREE.MathUtils.radToDeg(euler.x),
            THREE.MathUtils.radToDeg(euler.y),
            THREE.MathUtils.radToDeg(euler.z)
        ]);

        console.log('Camera FOV:', camera.fov);
        console.log('Camera zoom:', camera.zoom);
        console.log('Controls target:', controls.target.toArray());
        console.log('Controls distance:', controls.getDistance());
        console.log('--------------------------------');
    }
}