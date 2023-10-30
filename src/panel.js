import * as dat from 'dat.gui';


const W = 'W';
const A = 'A';
const S = 'S';
const D = 'D';
const DIRECTIONS = [W, A, S, D];

/*
module.exports = {
  W,
  A,
  S,
  D,
  DIRECTIONS
};

*/
export class KeysPanel {
  constructor(gui) {
    if (!gui) {
      console.error('GUI is not initialized');
      return;
    }
    this.gui = gui;
    this.actions = {
      W: false,
      A: false,
      S: false,
      D: false,
      SHIFT: false,
    };
    this.initKeys();
  }

  initKeys() {
    const keysFolder = this.gui.addFolder('Keys');
    Object.keys(this.actions).forEach((key) => {
      keysFolder.add(this.actions, key).name(key).listen();
    });
    keysFolder.open();

    window.addEventListener('keydown', (e) => {
      const key = e.key.toUpperCase();
      if (this.actions.hasOwnProperty(key)) {
        this.actions[key] = true;
      }
    });

    window.addEventListener('keyup', (e) => {
      const key = e.key.toUpperCase();
      if (this.actions.hasOwnProperty(key)) {
        this.actions[key] = false;
      }
    });
  }
}

export function initializeDatGUI(onBloomChange) {
  const gui = new dat.GUI();
  const settings = {
    'Bloom Strength': 1.5,
    'Bloom Radius': 0.4,
    'Bloom Threshold': 0.85,
  };

  gui.add(settings, 'Bloom Strength', 0, 3).onChange((value) => {
    onBloomChange('strength', value);
  });

  gui.add(settings, 'Bloom Radius', 0, 1).onChange((value) => {
    onBloomChange('radius', value);
  });

  gui.add(settings, 'Bloom Threshold', 0, 1).onChange((value) => {
    onBloomChange('threshold', value);
  });

 //  const keyspanel = new KeysPanel(gui);
}
