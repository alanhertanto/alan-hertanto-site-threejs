import React, { useEffect } from 'react'
import * as THREE from 'three';

import { instantiateAllFilesFromFolder, loadJSONConfig } from './three/helper.js';
import { initLighting } from './three/lightingController.js';
import { getCameraControls, initCameraControls } from './three/cameraController.js';
import { getComposer, initProcessing } from './three/postProcessController.js';
import { initRendererControls, getRendererControls } from './three/rendererController.js';
import { initAllListener, addButtonListenerForCameraMovement } from './three/eventListenerController.js';
import { initDebugControls, checkCameraChanges, createCameraState } from './three/debugController.js';

export default function App() {
    useEffect(()=>{
        async function init(){
            const scene = new THREE.Scene();
            scene.background = new THREE.Color(0x87CEEB);
            const camera = new THREE.PerspectiveCamera(
                75,
                window.innerWidth / window.innerHeight,
                0.1,
                1000
            );
            camera.position.set(5, 4, 5);
            initRendererControls();
            initCameraControls(camera, getRendererControls());
            initLighting(scene);
            const clickableConfigs = await loadJSONConfig('allObjectsConfig.json');
            const modalConfigs = await loadJSONConfig('allObjectsModalConfig.json');
            initProcessing(getRendererControls(), scene, camera);
            let clickableGroups = [];
            instantiateAllFilesFromFolder(scene, clickableGroups, clickableConfigs, modalConfigs);
            const lastCameraState = createCameraState(camera, getCameraControls());
            initDebugControls(scene);
            initAllListener(camera, getCameraControls(), clickableGroups, getRendererControls());
            const button1 = document.getElementById('btn1');
            addButtonListenerForCameraMovement(button1, getCameraControls(), camera);
            function animate() {
                requestAnimationFrame(animate);
                checkCameraChanges(camera, getCameraControls(), lastCameraState);
                getCameraControls().update();
                getComposer().render();
            }
            animate();
        }
        init();
    });
    return(
        <>
            <canvas id="webgl-canvas"></canvas>    
        </>
    )
}
