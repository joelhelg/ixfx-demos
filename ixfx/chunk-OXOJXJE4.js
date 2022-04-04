import {
  StateMachine_exports
} from "./chunk-AFAPKTUW.js";
import {
  continuously,
  debounce,
  delay,
  frequencyTimer,
  frequencyTimerSource,
  interval,
  msElapsedTimer,
  relativeTimer,
  retry,
  sleep,
  throttle,
  ticksElapsedTimer,
  timeout,
  updateOutdated,
  waitFor
} from "./chunk-KH5PN7CR.js";
import {
  number
} from "./chunk-CGW7LPMF.js";
import {
  __export
} from "./chunk-YDTVC7MM.js";

// src/flow/index.ts
var flow_exports = {};
__export(flow_exports, {
  StateMachine: () => StateMachine_exports,
  continuously: () => continuously,
  debounce: () => debounce,
  delay: () => delay,
  frequencyTimer: () => frequencyTimer,
  frequencyTimerSource: () => frequencyTimerSource,
  interval: () => interval,
  msElapsedTimer: () => msElapsedTimer,
  relativeTimer: () => relativeTimer,
  repeat: () => repeat,
  retry: () => retry,
  sleep: () => sleep,
  throttle: () => throttle,
  ticksElapsedTimer: () => ticksElapsedTimer,
  timeout: () => timeout,
  updateOutdated: () => updateOutdated,
  waitFor: () => waitFor
});
var repeat = (countOrPredicate, fn) => {
  let repeats, valuesProduced;
  repeats = valuesProduced = 0;
  const ret = [];
  if (typeof countOrPredicate === `number`) {
    number(countOrPredicate, `positive`, `countOrPredicate`);
    while (countOrPredicate-- > 0) {
      repeats++;
      const v = fn();
      if (v === void 0)
        continue;
      ret.push(v);
      valuesProduced++;
    }
  } else {
    while (countOrPredicate(repeats, valuesProduced)) {
      repeats++;
      const v = fn();
      if (v === void 0)
        continue;
      ret.push(v);
      valuesProduced++;
    }
  }
  return ret;
};

export {
  repeat,
  flow_exports
};