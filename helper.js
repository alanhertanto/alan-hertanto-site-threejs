// helper.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import gsap from 'gsap';

// ✅ Fungsi memuat semua file di folder
export function instaniateAllFilesFromFolder(scene, clickableGroups) {
    const files = import.meta.glob('./src/*.glb', { as: 'url' });

    for (const path in files) {
        files[path]().then(url => {
            instantiateObject(url, scene, clickableGroups);
        });
    }
}

// ✅ Fungsi load 1 GLB & register parent group sebagai clickable
export function instantiateObject(url, scene, clickableGroups) {
    const clickableConfigs = [
        {"name":"VR","cameraConfig":{"position":[-1.698722635000418,1.52377096077736,-1.0719717414612822],"rotation_deg":[-169.1602750035278,54.49768229762808,171.13995719817308],"fov":75,"zoom":1,"controls_target":[-1.7063014194676944,1.5227542287353033,-1.0666618495726377],"controls_distance":0.009309493537022645}},
        {"name":"Ashtray","cameraConfig":{"position":[-0.4104379169437894,1.5898192822257387,-2.0061998345866012],"rotation_deg":[-38.35224822943694,4.070404404101515,3.214557457357443],"fov":75,"zoom":1,"controls_target":[-0.5014232339728489,0.7964730234257511,-3.008869225063762],"controls_distance":1.2818044003929214}},
//        {"name":"Guest-book","cameraConfig":{"position":[-2.0946808357107156,1.8897503667066542,-1.2677464592320078],"rotation_deg":[-88.83835982541991, 18.353089509143107, 86.31533724144384],"fov":75,"zoom":1,"controls_target":[-2.0946809994592197,1.725160096356585,-1.2677464761082613],"controls_distance":0.16459027035015156}},
        {"name":"Teleskop","cameraConfig":{"position":[0.89259806590445,1.4403955791613754,1.4637375489009885],"rotation_deg":[-164.7838589696123,41.23518900086789,169.83560668077632],"fov":75,"zoom":1,"controls_target":[-0.14385760561419633,1.1300439034073608,2.6047509572483403],"controls_distance":1.5724090179386958}},
        {"name":"Resume","cameraConfig":{"position":[0.8273519169390134, 0.771416109783687, 1.4613802347531253],"rotation_deg":[-90.00003084065828,0.000048305381176163596,122.55627000552902],"fov":75,"zoom":1,"controls_target":[0.5645715903472349, -0.03733857526136294, 1.4613802347531253],"controls_distance":0.8503752281367984}},
        {"name":"Laptop","cameraConfig":{"position":[-1.3717774030034005,1.6705958724322367,-1.5940319351186352],"rotation_deg":[-5.121114083055174,0.11958116243403365,0.010716745869692162],"fov":75,"zoom":1,"controls_target":[-1.3758098878029026,1.4981330922629619,-3.5184299536271957],"controls_distance":1.93211474946936}},
        {"name":"Date","cameraConfig":{"position":[-2.335364152550972, 1.616005006475338, -1.6160717238533844],"rotation_deg":[-108.49140640035064,55.064544469001056,112.19252967892848],"fov":75,"zoom":1,"controls_target":[-3.411664190481382, 0.9198730064753402, -1.6160717238533844],"controls_distance":1.2818044003928868}},
        {"name":"Smartphone","cameraConfig":{"position":[-2.008945662216272,1.5737214162856124,-2.22427569967523],"rotation_deg":[-89.99995787570052,0.000038850617932471226,42.6848874569122],"fov":75,"zoom":1,"controls_target":[-2.0089467293101673,0.0000018771265001193556,-2.2242768566859867],"controls_distance":1.5737195391598995}},
        {"name":"1st Monitor","cameraConfig":{"position":[-1.9760001306964567,1.7025396969986462,-2.016083532611384],"rotation_deg":[-5.81696761220701,52.18467515805431,4.601289085009952],"fov":75,"zoom":1,"controls_target":[-3.2192244826428427,1.604748592269204,-2.9759914961668006],"controls_distance":1.5737195391599557}},
        {"name":"Lights","forward":"x"}
    ];

    const filename = url.split('/').pop().split('.')[0];
    console.log('Loading:', filename);

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

            // Cari config yang match dengan nama file
            const config = clickableConfigs.find(item => filename.includes(item.name));
            if (config) {
                parent.userData.clickable = true;
                parent.userData.focusPosition = root.position.clone();
                parent.userData.cameraConfig = config.cameraConfig || null; // simpan config ke userData
                parent.name = filename;
                clickableGroups.push(parent);
                console.log('Marking parent clickable with config:', filename);
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


// Smoothly animate camera focus using a predefined Vector3
// Proper GSAP + OrbitControls camera focus
// helper.js
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
        }
    });
}






// ✅ Util: atur local rotation
export function setLocalRotation(object, xDeg, yDeg, zDeg) {
    object.rotation.set(
        THREE.MathUtils.degToRad(xDeg),
        THREE.MathUtils.degToRad(yDeg),
        THREE.MathUtils.degToRad(zDeg)
    );
}
