import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';

// Function to load and set up the avatar
export function loadAvatar(scene) {
    const loader = new GLTFLoader();
    
    // Load base model
    loader.load('./models/BaseFemale/BaseFemale.glb', function (gltf) {
        const baseModel = gltf.scene;
        baseModel.scale.set(1, 1, 1);
        baseModel.position.set(-2, 0, 3);
        scene.add(baseModel);

        const baseMixer = new THREE.AnimationMixer(baseModel);
        gltf.animations.forEach((clip) => {
            baseMixer.clipAction(clip).play();
        });

        // Load animation
        loader.load('./models/emotes/idle.glb', function (gltf) {
            const animationClip = gltf.animations[0];
            baseMixer.clipAction(animationClip).play();
        });

        // Load wearable (e.g., Hat)
        loader.load('./models/F_lBody_ShortColoredLeggings.glb', function (gltf) {
            const wearableBottom = gltf.scene;
            wearableBottom.scale.set(1, 1, 1);
            wearableBottom.position.set(0, 0, 0); // Adjust position based on where you want it on the base model
            baseModel.add(wearableBottom);
        });
         // Load wearable (e.g., Hat)
         loader.load('./models/F_uBody_BlueBasicTShirt.glb', function (gltf) {
            const wearableTop = gltf.scene;
            wearableTop.scale.set(1, 1, 1);
            wearableTop.position.set(0, 0, 0); // Adjust position based on where you want it on the base model
            baseModel.add(wearableTop);
        });

        
    });
}
