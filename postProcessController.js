import * as THREE from 'three';

import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { OutlinePass } from 'three/examples/jsm/postprocessing/OutlinePass.js';

let outlinePassGet;
let composerGet;
export function initProcessing(renderer, scene, camera) {
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(
        new UnrealBloomPass(
            new THREE.Vector2(window.innerWidth, window.innerHeight),
            0.25,
            0.2,
            0.9
        )
    );
    const outlinePass = new OutlinePass(
        new THREE.Vector2(window.innerWidth, window.innerHeight),
        scene,
        camera
    );
    outlinePass.edgeStrength = 10;
    outlinePass.visibleEdgeColor.set('#ffffff');
    outlinePass.hiddenEdgeColor.set('#190a05');
    outlinePass.edgeGlow = 0.215;
    outlinePass.edgeThickness = 1.5;
    outlinePassGet = outlinePass;
    composer.addPass(outlinePass);
    composerGet = composer;
}

export function getComposer() {
    return composerGet;
}

export function getOutlinePass() {
    return outlinePassGet;
}
