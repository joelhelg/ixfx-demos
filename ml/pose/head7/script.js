// this code calculate the middle point and visulize with blue ball

// @ts-ignore
// @ts-ignore
import { Remote } from "https://unpkg.com/@clinth/remote@latest/dist/index.mjs";
import * as Dom from '../../../ixfx/dom.js';
import { Points } from '../../../ixfx/geometry.js';
import * as MoveNet from "../Poses.js";
import { frequencyTimer } from '../../../ixfx/flow.js';
import { Oscillators } from '../../../ixfx/modulation.js';


let distance = 0;

const getKeypoint = MoveNet.Coco.getKeypoint;

// Create a circle element
const circleElement = document.createElement("div");
circleElement.style.width = "50px";
circleElement.style.height = "50px";
circleElement.style.borderRadius = "50%";
circleElement.style.backgroundColor = "blue";
circleElement.style.position = "absolute";
circleElement.style.transition = "1s ease-in-out";
circleElement.style.left = "50%";
circleElement.style.top = "50%";
circleElement.style.alignItems = "center";
circleElement.style.transition = "all 1s ease-in-out";
document.body.appendChild(circleElement);


const circleElement1 = document.createElement("div1");
circleElement1.style.width = "50px";
circleElement1.style.height = "50px";
circleElement1.style.borderRadius = "50%";
circleElement1.style.backgroundColor = "white";
circleElement.style.transition = "all 0.1s ease-in-out";
circleElement1.style.position = "absolute";
document.body.appendChild(circleElement1);


const circleElement2 = document.createElement("div2");
circleElement2.style.width = "50px";
circleElement2.style.height = "50px";
circleElement2.style.borderRadius = "50%";
circleElement2.style.backgroundColor = "white";
circleElement.style.transition = "all 0.1s ease-in-out";
circleElement2.style.position = "absolute";
document.body.appendChild(circleElement2);


const settings = Object.freeze({
  updateRateMs: 100,
  remote: new Remote(),
  poses: new MoveNet.PosesTracker({ maxAgeMs: 500 }),


});

let state = Object.freeze({
  /** @type {number} */
  oscValue: 0,
  //
  bounds: {
    width: 0, height: 0,
    center: { x: 0, y: 0 },
  },
  scaleBy: 1,
  heads: [],
  osc: Oscillators.sine(frequencyTimer(0.1)),
});

const computeHead = (pose) => {
  const nose = getKeypoint(pose, `nose`);
  const leftEar = getKeypoint(pose, `left_ear`);
  const rightEar = getKeypoint(pose, `right_ear`);
  const leftWrist = getKeypoint(pose, `left_wrist`);
  const earDistance = Points.distance(leftEar, rightEar);
  const radius = earDistance / 2;

  return {
    x: nose.x,
    y: nose.y,
    radius,
    poseId: (pose.id ?? 0).toString(),
  };
};

let previousDistance = 0; // Stores the previous distance between two heads  

const update = () => {
  const { poses } = settings;
  const { osc } = state;


  let oscVal = osc.next().value;
  const heads = [];
  for (const pose of poses.getRawPoses()) {
    const head = computeHead(pose);
    heads.push(head);
  }
  // Update the ball's position to be in the center between two heads
  if (heads.length >= 2) {
    const xCenter = (heads[0].x + heads[1].x) / 2;
    const yCenter = (heads[0].y + heads[1].y) / 2;

    /*     const ax = heads[0].x
        const ay = heads[0].y
        const bx = heads[1].x
        const by = heads[1].y */

    const a = { x: heads[0].x, y: heads[0].y };
    const b = { x: heads[1].x, y: heads[1].y };
    
    //update the ocilator frequency
    // osc.frequency = (a.x * 100);
    // Calculates distance between point a and b
    distance = Points.distance(a, b); // Returns a numbers
    // calculate the speec between two heads
    const speed = Math.abs(((distance - previousDistance) * 100) * 5);

    previousDistance = distance; // Update the previous distance for the next frame

    //calculate the speed of the a and b points
    const aSpeed = Math.abs(((a.x - previousDistance) * 100) * 5);
    const bSpeed = Math.abs(((b.x - previousDistance) * 100) * 5);

    // Update the previous distance for the next frame
    previousDistance = distance;
    const Value = ((oscVal) * distance);

    console.log(Value);
    circleElement.style.left = `${xCenter * 100}vw`;
    circleElement.style.top = `${yCenter * 100}vh`;
    // make the circle element follow the oscilator
    //circleElement.style.left = `${Value}vw`;
    //circleElement.style.transition = ".5s ease-in-out";


    circleElement1.style.left = `${a.x * 100}vw`;
    circleElement1.style.top = `${a.y * 100}vh`;

    circleElement2.style.left = `${b.x * 100}vw`;
    circleElement2.style.top = `${b.y * 100}vh`;
  }

  saveState({ heads });
};



const onPoseAdded = (event) => {
  const poseTracker = event.detail;
  console.log(`Pose added: ${poseTracker.guid}`);
};

const onPoseExpired = (event) => {
  const poseTracker = event.detail;
  console.log(`Pose expired: ${poseTracker.guid}`);
};

const onReceivedPoses = (packet) => {
  const { _from, data } = packet;
  const poseData = data;

  for (const pose of poseData) {
    settings.poses.seen(_from, pose);
  }
};

function setup() {
  const { updateRateMs, remote, poses } = settings;

  remote.onData = onReceivedPoses;
  poses.events.addEventListener(`added`, onPoseAdded);
  poses.events.addEventListener(`expired`, onPoseExpired);

  const updateLoop = () => {
    update();
    setTimeout(updateLoop, updateRateMs);
  };
  updateLoop();
};
setup();

function saveState(s) {
  state = Object.freeze({
    ...state,
    ...s
  });
}