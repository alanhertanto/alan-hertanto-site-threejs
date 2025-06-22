// helper.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { getDebugModeState } from './debugController';
import gsap from 'gsap';
import Swiper from './node_modules/swiper/swiper';
import 'swiper/swiper-bundle.css';

// ✅ Fungsi memuat semua file di folder
export function instaniateAllFilesFromFolder(scene, clickableGroups, clickableConfigs, modalConfigs) {
    const files = import.meta.glob('./src/*.glb', { as: 'url' });

    for (const path in files) {
        
        if(getDebugModeState()){
            files[path]().then(url => {
                instantiateObject(url, scene, clickableGroups, clickableConfigs, modalConfigs);
            });
        }else{
            if(path.includes("Teleskop")){
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


export async function applyModalConfig(modalConfig) {
  const myModal = document.getElementById('side-modal');

  // 1) Apply styles
  for (const [key, value] of Object.entries(modalConfig.modalConfig)) {
    const styleKey = key.replace(/-([a-z])/g, (_, char) => char.toUpperCase());
    myModal.style[styleKey] = value;
  }

  // 2) Fill the slider properly
   if(modalConfig.modalImages.length>1){
        const container = document.querySelector('#side-modal-carousel-container');
        while(container.children.length>1){
            container.removeChild(container.lastChild);
        }
        modalConfig.modalImages.forEach(element => {
            const divImg = document.createElement('div');
            const img = document.createElement('img');
            img.src = element.imageLocation;
            
            document.querySelector('#side-modal-carousel-container').appendChild(img);
        });
    }
  // 3) Static texts
  document.querySelector('.side-modal-title').textContent = modalConfig.modalHeader;
  document.querySelector('.side-modal-description').textContent = modalConfig.modalDescription;
  document.querySelector('#side-modal-label').textContent = modalConfig.modalType;

  // 4) Recreate Swiper cleanly
  if (window.mySwiper) {
    window.mySwiper.destroy(true, true);
  }

  window.mySwiper = new Swiper(".swiper-slider", {
    loop: true,
    slidesPerView: 1,
    autoplay: { delay: 3000 },
    pagination: { el: ".swiper-pagination", clickable: true },
    navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    breakpoints: {
      640: { slidesPerView: 1.25, spaceBetween: 20 },
      1024: { slidesPerView: 2, spaceBetween: 20 }
    }
  });
}

export function testSwiper(){
    if (window.mySwiper) {
    window.mySwiper.destroy(true, true);
  }

  window.mySwiper = new Swiper(".swiper-slider", {
    loop: true,
    slidesPerView: 1,
    autoplay: { delay: 3000 },
    pagination: { el: ".swiper-pagination", clickable: true },
    navigation: { nextEl: ".swiper-button-next", prevEl: ".swiper-button-prev" },
    breakpoints: {
      640: { slidesPerView: 1.25, spaceBetween: 20 },
      1024: { slidesPerView: 2, spaceBetween: 20 }
    }
  });
}

export function setTheModal() {
    loadClickloadModalConfigsableConfigs().then(modalConfigs => {
        const modalClass = `
        
    bg-${modalConfigs.bgColor} 
    border-${modalConfigs.borderWidth} 
    border-${modalConfigs.borderColor} 
    w-${modalConfigs.width}
  `;
    });

    document.createElement(modalClass);
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

export function openGalleryModal(modalSelector = "#side-modal-with-gallery") {
    gsap.to(modalSelector, {
        x: 0,
        duration: 0.5,
        ease: "power2.out",
        onStart: () => {
            document.querySelector(modalSelector).style.display = 'flex';
        }
    });

}

export function closeGalleryModal() {
    gsap.to("#side-modal-with-gallery", {
        x: '100%',
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
            document.querySelector(modalSelector).style.display = 'none';
        }

    });
}

/**
 * Slide in modal from the right
 * @param {string} modalSelector - e.g. "#side-modal"
 */
export function openSideModal(modalSelector = "#side-modal") {
    gsap.to(modalSelector, {
        x: 0,
        duration: 0.5,
        ease: "power2.out",
        onStart: () => {
            document.querySelector(modalSelector).style.display = 'flex';
        }
    });

}

/**
 * Slide out modal to the right
 * @param {string} modalSelector - e.g. "#side-modal"
 */
export function closeSideModal(modalSelector = "#side-modal") {
    gsap.to(modalSelector, {
        x: '100%',
        duration: 0.5,
        ease: "power2.in",
        onComplete: () => {
            document.querySelector(modalSelector).style.display = 'none';
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



// ✅ Util: atur local rotation
export function setLocalRotation(object, xDeg, yDeg, zDeg) {
    object.rotation.set(
        THREE.MathUtils.degToRad(xDeg),
        THREE.MathUtils.degToRad(yDeg),
        THREE.MathUtils.degToRad(zDeg)
    );
}
