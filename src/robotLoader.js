import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { GUI } from 'lil-gui';

export function loadRobot(scene, camera, renderer) {
  const gui = new GUI();
  gui.domElement.style.position = 'absolute';
  gui.domElement.style.top = '0px';
  gui.domElement.style.left = '0px';

  const api = { state: 'Idle' };

  let activeAction, previousAction;
  let actions = {};

  return new Promise((resolve, reject) => {
    const loader = new GLTFLoader();
    loader.load('models/Soldier.glb', function(gltf) {


        
      const Robot = gltf.scene;
      Robot.rotation.y = Math.PI / 0.6;
            Robot.position.set(20, 0, 3);
            Robot.scale.set(1.2, 1.2, 1.2);

      scene.add(Robot);

      const mixer = new THREE.AnimationMixer(Robot);

      gltf.animations.forEach((clip) => {
        const action = mixer.clipAction(clip);
        actions[clip.name] = action;
      });

      if(actions['Idle']) {
        activeAction = actions['Idle'];
        activeAction.play();
      } else {
        console.error("Idle action not found");
      }

      createGUI(actions, gltf.animations);

      function createGUI(animations) {
        const states = ['Idle', 'Walking', 'Running', 'Dance', 'Death', 'Sitting', 'Standing'];
        const statesFolder = gui.addFolder('States');
        const clipCtrl = statesFolder.add(api, 'state').options(states);

        clipCtrl.onChange(function() {
          fadeToAction(api.state, 0.5);
        });

        statesFolder.open();
      }

      function fadeToAction(name, duration) {
        previousAction = activeAction;
        activeAction = actions[name];
  
        if (previousAction !== activeAction) {
          previousAction.fadeOut(duration);
        }

        activeAction.reset().fadeIn(duration).play();
      }

      const clock = new THREE.Clock();
      
      function animate() {
        const dt = clock.getDelta();
        mixer.update(dt);
        requestAnimationFrame(animate);
        renderer.render(scene, camera);
      }
      animate();

      resolve(Robot);

    }, undefined, function(error) {
      console.error(error);
      reject(error);
    });
  });
}
