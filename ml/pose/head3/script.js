// @ts-ignore
import { Remote } from "https://unpkg.com/@clinth/remote@latest/dist/index.mjs";
import * as Dom from '../../../ixfx/dom.js';
import { Points } from '../../../ixfx/geometry.js';
import * as MoveNet from "../Poses.js";
import { getKeypoint } from "../../lib/Coco.js";
// import { X } from "../../../ixfx/Arrays-37472508.js";

const settings = Object.freeze({
  // How quickly to call update()
  updateRateMs: 100,
  remote: new Remote(),
  poses: new MoveNet.PosesTracker({ maxAgeMs: 500 }),
  canvasEl: /** @type HTMLCanvasElement */(document.querySelector(`#canvas`)),
});

/**
 * @typedef {{
 * x: number
 * y: number
 * radius: number
 * poseId: string
 * }} Head
 */

/**
 * @typedef {Readonly<{
 * bounds: { width: number, height: number, center: Points.Point }
 * scaleBy: number
 * heads: Array<Head>
 * heads2: Array<Head>
 * }>} State
 */

/** @type State */
let state = Object.freeze({
  bounds: {
    width: 0, height: 0,
    center: { x: 0, y: 0 },
  },
  scaleBy: 1,
  heads: [],
  heads2: []
});

/**
 * Runs periodically, computing something
 * new from latest pose data
 */
const update = () => {
  const { poses } = settings;

  // Compute a head size for each pose
  const heads = [];
  for (const pose of poses.getRawPoses()) {
    const head = computeHead(pose);
    heads.push(head);
  }
  const heads2 = [];
  for (const pose of poses.getRawPoses()) {
    const head2 = computeHead2(pose);
    heads2.push(head2);
  }

  saveState({ heads, heads2 });

};

// let leftWrist = {
//   x: 0,
//   y: 0
// }
// let rightWrist = {
//   x: 0,
//   y: 0
// }


/**
 * Returns a circle based on a few head keypoints
 * @param {MoveNet.Pose} pose
 * @return {Head} 
 */
const computeHead = (pose) => {
  const nose = MoveNet.Coco.getKeypoint(pose, `nose`);
  const leftEar = MoveNet.Coco.getKeypoint(pose, `left_ear`);
  const rightEar = MoveNet.Coco.getKeypoint(pose, `right_ear`);
  const earDistance = Points.distance(leftEar, rightEar);
  const radius = earDistance / 2;
  const leftWrist = MoveNet.Coco.getKeypoint(pose, `left_wrist`);
  const rightWrist = MoveNet.Coco.getKeypoint(pose, `right_wrist`);

  //console.log("HAHAHAH" + leftEar)
  return {
    x: leftWrist.x,
    y: leftWrist.y,
    radius,
    poseId: (pose.id ?? 0).toString(),
  };
};

const computeHead2 = (pose) => {
  const nose = MoveNet.Coco.getKeypoint(pose, `nose`);
  const leftEar = MoveNet.Coco.getKeypoint(pose, `left_ear`);
  const rightEar = MoveNet.Coco.getKeypoint(pose, `right_ear`);
  const earDistance = Points.distance(leftEar, rightEar);
  const radius = earDistance / 2;
  const rightWrist = MoveNet.Coco.getKeypoint(pose, `right_wrist`);

  //console.log("HAHAHAH" + leftEar)
  return {
    x: rightWrist.x,
    y: rightWrist.y,
    radius,
    poseId: (pose.id ?? 0).toString(),
  };
};

const draw = () => {
  const { width, height } = state.bounds;
  const { heads } = state;
  const context = settings.canvasEl.getContext(`2d`);
  if (!context) return;

  // Fade out the canvas
  context.fillStyle = `rgba(0,0,0,0.015)`;
  context.fillRect(0, 0, width, height);

  // Draw each head
  for (const head of heads) {
    drawHead(context, head)
  }
};


const draw2 = () => {
  const { width, height } = state.bounds;
  const { heads2 } = state;
  const context = settings.canvasEl.getContext(`2d`);
  if (!context) return;

  // Fade out the canvas
  context.fillStyle = `rgba(0,0,0,0.015)`;
  context.fillRect(0, 0, width, height);

  // Draw each head
  for (const head2 of heads2) {
    drawHead2(context, head2)
  }
};

/**
 * Draws a single head
 * @param {CanvasRenderingContext2D} context 
 * @param {Head} head 
 */
const drawHead = (context, head) => {
  const { scaleBy } = state;
  const { poses } = settings;

  const headAbs = Points.multiplyScalar(head, scaleBy);
  const radius = head.radius * scaleBy;
  const tracker = poses.getByPoseId(head.poseId);
  if (tracker === undefined) return;
  const hue = tracker.hue;

  // Translate canvas so 0,0 is the center of head
  context.save();
  context.translate(headAbs.x, headAbs.y);

  // Draw a circle
  context.beginPath();
  context.fillStyle = `hsl(${hue},60%,70%)`;
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.fill();

  // Draw id of head
  context.fillStyle = `black`;
  context.fillText(head.poseId.toString(), 0, 0);

  // Undo translation
  context.restore();
};

const drawHead2 = (context, head2) => {
  const { scaleBy } = state;
  const { poses } = settings;

  const headAbs = Points.multiplyScalar(head2, scaleBy);
  const radius = head2.radius * scaleBy;
  const tracker = poses.getByPoseId(head2.poseId);
  if (tracker === undefined) return;
  const hue = tracker.hue;

  // Translate canvas so 0,0 is the center of head
  context.save();
  context.translate(headAbs.x, headAbs.y);

  // Draw a circle
  context.beginPath();
  context.fillStyle = `hsl(${hue},60%,70%)`;
  context.arc(0, 0, radius, 0, Math.PI * 2);
  context.fill();

  // Draw id of head
  context.fillStyle = `black`;
  context.fillText(head2.poseId.toString(), 0, 0);

  // Undo translation
  context.restore();
};

/**
 * Called when a new pose is detecteda
 * @param {*} event 
 */
const onPoseAdded = (event) => {
  const poseTracker = /** @type MoveNet.PoseTracker */(event.detail);
  console.log(`Pose added: ${poseTracker.guid}`);
};

const poseDistance = (event) => {
  const poseTracker = /** @type MoveNet.PoseTracker */(event.detail);
  console.log(`Pose added: ${poseTracker.guid}`);
  const nose = poseTracker.last.keypoints[0];
  console.log(nose);
  console.log(Points.distance(nose, nose));
};

/**
 * Called when a pose is no longer being tracked
 * @param {*} event 
 */
const onPoseExpired = (event) => {
  const poseTracker = /** @type MoveNet.PoseTracker */(event.detail);
  console.log(`Pose expired: ${poseTracker.guid}`);
};

/**
 * Called when we have pose data via Remote
 * @param {*} packet 
 */
const onReceivedPoses = (packet) => {
  const { _from, data } = packet;
  const poseData =/** @type MoveNet.Pose[] */(data);

  // Pass each pose over to the poses tracker
  for (const pose of poseData) {
    settings.poses.seen(_from, pose);
  }
};

/**
 * Setup and run main loop 
 */
function setup() {
  const { updateRateMs, remote, poses } = settings;

  remote.onData = onReceivedPoses;
  poses.events.addEventListener(`added`, onPoseAdded);
  poses.events.addEventListener(`expired`, onPoseExpired);

  Dom.fullSizeCanvas(`#canvas`, arguments_ => {
    // Update state with new size of canvas
    saveState({
      bounds: arguments_.bounds,
      scaleBy: Math.min(arguments_.bounds.width, arguments_.bounds.height)
    });
  });

  // Update at updateRateMs
  const updateLoop = () => {
    update();
    setTimeout(updateLoop, updateRateMs);
  };
  updateLoop();

  // Draw as fast as possible
  const animationLoop = () => {
    draw();
    draw2();
    window.requestAnimationFrame(animationLoop);
  };
  animationLoop();

};
setup();

/**
 * Update state
 * @param {Partial<state>} s 
 */
function saveState(s) {
  state = Object.freeze({
    ...state,
    ...s
  });
}
