import { Easings } from '../ixfx/modulation.js';

const easing = Easings.time(`bell`, 5000);

// #region Settings & state
const settings = Object.freeze({});

let state = Object.freeze({
  value: 0
});
// #endregion

const use = () => {
  let { value } = state;
  const hue = value * 360
  console.log(hue)
};

const update = () => {
  const value = easing.compute();
  saveState(s: { value });
  use();
}

function setup() {
  // Call every half a second
  setInterval(use, 500);
};

// #region Toolbox
/**
 * Save state
 * @param {Partial<state>} s 
 */
function saveState(s) {
  state = Object.freeze({
    ...state,
    ...s
  });
}
setup();
// #endregion


