import { KeyDisplay } from './utils';
import { CharacterControls } from './characterControls';
import * as THREE from 'three'
import { CameraHelper } from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/examples/jsm/postprocessing/UnrealBloomPass.js';
import { loadRobot } from './robotLoader'; // adjust the path as needed
//import { KeysPanel } from './panel.js';
//import { RigidBodyDesc, World } from '@dimforge/rapier3d';
import { initializeDatGUI } from './panel.js';
import Stats from 'stats.js';
import { loadAvatar } from './avatar.js';  // adjust the path as needed


//WORLD GRAVITY - this WIP for colliders in main stage 

//const gravity = { x: 0.0, y: -9.81, z: 0.0 };
//const world = new World(gravity);

//const bodyDesc = RigidBodyDesc.newDynamic()
 //   .setTranslation(0.0, 1.0, 0.0);
//const body = world.createRigidBody(bodyDesc);



// SCENE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x99999);

const loader = new THREE.TextureLoader();
loader.load('textures/sky/nebula.jpeg', function(texture) {
    scene.background = texture;
});


// GUI 
const stats = new Stats();
document.body.appendChild(stats.dom);
stats.dom.style.cssText = 'position:absolute;bottom:0px;left:0px;';





// CAMERA
const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.y = 5;
camera.position.z = 5;
camera.position.x = 0;

// RENDERER
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
renderer.shadowMap.enabled = true
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // default THREE.PCFShadowMap



// Initialize Effect Composer
const composer = new EffectComposer(renderer);

// Add Render Pass

const renderPass = new RenderPass(scene, camera);
composer.addPass(renderPass);

//-- there is a bug between robot and bloom 

/* 
loadRobot(scene, camera, renderer)
  .then(Robot => {
      console.log("Robot model loaded:", Robot);
  })
  .catch(e => {
      console.log("Failed to load robot model:", e);
  });
*/


initializeDatGUI(handleBloomChange);


type BloomType = 'strength' | 'radius' | 'threshold';
function handleBloomChange(type: BloomType, value: number): void {
    console.log("handleBloomChange called with type:", type, "and value:", value);

    switch (type) {
      case 'strength':
        bloomPass.strength = value;
        break;
      case 'radius':
        bloomPass.radius = value;
        break;
      case 'threshold':
        bloomPass.threshold = value;
        break;
      default:
        break;
    }
}


// Existing UnrealBloomPass setup
const bloomPass = new UnrealBloomPass(
    new THREE.Vector2(window.innerWidth, window.innerHeight),
    2, // strength
    0.8, // radius
    0.85 // threshold
  );
  


  // To adjust the bloom intensity
  function setBloomIntensity(strength: number, radius: number, threshold: number) {
    bloomPass.strength = strength;
    bloomPass.radius = radius;
    bloomPass.threshold = threshold;
  }
  

  // Update the intensity
  setBloomIntensity(0.4, 0.2, 0.5);
  composer.addPass(bloomPass);


// CONTROLS
const orbitControls = new OrbitControls(camera, renderer.domElement);
orbitControls.enableDamping = true
orbitControls.minDistance = 5
orbitControls.maxDistance = 7.5  // play with those for DCL feel
orbitControls.enablePan = false
orbitControls.maxPolarAngle = Math.PI / 2 + 0.1
orbitControls.update();



// MODEL WITH ANIMATIONS

var characterControls: CharacterControls
new GLTFLoader().load('./models/Soldier1.glb', function (gltf) {
    const model = gltf.scene;
    model.traverse(function (object: any) {
        if (object.isMesh) object.castShadow = true;
    });
    model.scale.set(1.2, 1.2, 1.2);

    scene.add(model);

    const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
    const mixer = new THREE.AnimationMixer(model);
    const animationsMap: Map<string, THREE.AnimationAction> = new Map()
    gltfAnimations.filter(a => a.name != 'TPose').forEach((a: THREE.AnimationClip) => {
        animationsMap.set(a.name, mixer.clipAction(a))
    })

    characterControls = new CharacterControls(model, mixer, animationsMap, orbitControls, camera,  'Idle')
});

const avatar = loadAvatar(scene);
//const baseMixer = avatar.getMixer();


loadAvatar(scene);


// DCL MODEL 
new GLTFLoader().load('./models/BaseFemale/BaseFemale.glb', function (gltf) {
    const modelDCL = gltf.scene;
    modelDCL.traverse(function (object: any) {
        if (object.isMesh) object.castShadow = true;
    });
    modelDCL.scale.set(1.2, 1.2, 1.2);
    modelDCL.position.set(2, 0, 3);

    scene.add(modelDCL);

    const gltfAnimations: THREE.AnimationClip[] = gltf.animations;
    const mixer = new THREE.AnimationMixer(modelDCL);
    const animationsMap: Map<string, THREE.AnimationAction> = new Map()
    gltfAnimations.filter(a => a.name != 'TPose').forEach((a: THREE.AnimationClip) => {
        animationsMap.set(a.name, mixer.clipAction(a))
    })

});



// CONTROL KEYS

const keysPressed = {  }

const keyDisplayQueue = new KeyDisplay();
document.addEventListener('keydown', (event) => {
    keyDisplayQueue.down(event.key)
    if (event.shiftKey && characterControls) {
        characterControls.switchRunToggle()
    } else {
        (keysPressed as any)[event.key.toLowerCase()] = true
    }
}, false);
document.addEventListener('keyup', (event) => {
    keyDisplayQueue.up(event.key);
    (keysPressed as any)[event.key.toLowerCase()] = false
}, false);


const clock = new THREE.Clock();

 
function light() {
    scene.add(new THREE.AmbientLight(0xffffff, 0.7))

    const dirLight = new THREE.DirectionalLight(0xffffff, 0.1)
    dirLight.position.set(- 60, 100, - 10);
    dirLight.castShadow = true;
    dirLight.shadow.camera.top = 50;
    dirLight.shadow.camera.bottom = - 50;
    dirLight.shadow.camera.left = - 50;
    dirLight.shadow.camera.right = 50;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 200;
    dirLight.shadow.mapSize.width = 4096;
    dirLight.shadow.mapSize.height = 4096;
    scene.add(dirLight);
    // scene.add( new THREE.CameraHelper(dirLight.shadow.camera))


    // Point Light
    const pointLight = new THREE.PointLight(0xffffff, 0.2);
    pointLight.position.set(50, 50, 50);
    pointLight.castShadow = true;
    scene.add(pointLight);

    // Spotlight with adjusted intensity
    const spotLight = new THREE.SpotLight(0xffffff, 0.1);  // The second parameter controls the intensity.
    spotLight.position.set(0, 50, 0);
    spotLight.castShadow = true;
    scene.add(spotLight);

}

light()

// ANIMATE

function animate() {

    stats.begin();
    requestAnimationFrame(animate);


    let mixerUpdateDelta = clock.getDelta();
    if (characterControls) {
        characterControls.update(mixerUpdateDelta, keysPressed);
    }
    orbitControls.update()
    composer.render();

    stats.end();
    requestAnimationFrame(animate);

}
document.body.appendChild(renderer.domElement);

animate();


// RESIZE HANDLER
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
    composer.setSize(window.innerWidth, window.innerHeight); // Add this line

 //   keyDisplayQueue.updatePosition()
}
window.addEventListener('resize', onWindowResize);


///ADD building 

new GLTFLoader().load('models/club.glb', function (gltf) {
    const clubModel = gltf.scene;
    clubModel.traverse(function (object: any) {
        if (object.isMesh) object.castShadow = true;
    });
    clubModel.position.set(0, -0.18, 0);

    scene.add(clubModel);
});


// Load the collider model

/*

// GENERATE 2x2 Aetheria Tile Floor 

function generateFloor() {
    const loader = new GLTFLoader();

    loader.load('models/CityTile.glb', function(gltf) {
        const tile = gltf.scene;
        tile.traverse(function(object: any) {
            if (object.isMesh) object.receiveShadow = true;
        });
        
        const tileSize = 16;  // For 16x16
        
        // Create a 2x2 grid of tiles
        for (let x = 0; x < 2; x++) {
            for (let z = 0; z < 2; z++) {
                // Clone the tile
                const tileClone = tile.clone();
                
                // Position the tile based on its size
                tileClone.position.set(x * tileSize, 0, z * tileSize);
                
                // Add the tile to the scene
                scene.add(tileClone);
            }
        }
    });
}
*/
