// Change the things speed depending on the distance between two heads
// @ts-ignore
import { Remote } from "https://unpkg.com/@clinth/remote@latest/dist/index.mjs";
import * as Dom from '../../../ixfx/dom.js';
import { Points } from '../../../ixfx/geometry.js';
import * as MoveNet from "../Poses.js";

var audio = new Audio('vitas.mp3');

var bajs = document.querySelector("bajs")?.innerHTML

//const play = document.getElementById('play'); 

document.addEventListener('keydown', function (event) {
  if (event.key === 'g') {
    audio.play();
  }
});

document.addEventListener('keydown', function (event) {
  if (event.key === 'u') {
    audio.pause();
  }
});


const getKeypoint = MoveNet.Coco.getKeypoint;
const box = document.getElementById('box');

// Create a circle element
const circleElement = document.getElementById("circle-element")
/* circleElement.style.width = "100px";
circleElement.style.height = "100px";
circleElement.style.borderRadius = "50%";
circleElement.style.backgroundColor = "black";
circleElement.style.position = "absolute";
circleElement.style.transition = "all 10s ease-in-out";
circleElement.style.position = "absolute";
circleElement.style.top = "50%";
circleElement.style.left = "50%";
circleElement.style.opacity = "15%" */
document.body.appendChild(circleElement);




const circleElement1 = document.createElement("div1");
circleElement1.style.width = "50px";
circleElement1.style.height = "50px";
circleElement1.style.borderRadius = "50%";
circleElement1.style.backgroundColor = "White";
//circleElement.style.transition = "all 0.1s ease-in-out";
circleElement1.style.position = "absolute";
circleElement1.style.opacity = "0";
document.body.appendChild(circleElement1);


const circleElement2 = document.createElement("div2");
circleElement2.style.width = "50px";
circleElement2.style.height = "50px";
circleElement2.style.borderRadius = "50%";
circleElement2.style.backgroundColor = "White";
//circleElement.style.transition = "all 0.1s ease-in-out";
circleElement2.style.position = "absolute";
circleElement2.style.opacity = "0";
document.body.appendChild(circleElement2);

const background1 = document.getElementById("all")

/* const root = document.getElementById("root")
console.log(root) */


const settings = Object.freeze({
  updateRateMs: 100,
  remote: new Remote(),
  poses: new MoveNet.PosesTracker({ maxAgeMs: 500 }),
});

let state = Object.freeze({
  bounds: {
    width: 0, height: 0,
    center: { x: 0, y: 0 },
  },
  scaleBy: 1,
  heads: []
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

let previousDistanceX = 0; // Stores the previous distance between two heads  
let previousDistanceY = 0; // Stores the previous distance between two heads
let speed = Math.abs(1);
let speedX = Math.abs(1);
let wobbleSpeed = Math.abs(0);
let actualSpeed = Math.abs(1);
let actualSpeedY = Math.abs(1);

let spedometer = 0



const update = () => {
  const { poses } = settings;

  const heads = [];
  for (const pose of poses.getRawPoses()) {
    const head = computeHead(pose);
    heads.push(head);
  }

  // Update the ball's position to be in the center between two heads
  if (heads.length >= 2) {
    const xCenter = (heads[0].x + heads[1].x) / 2;
    const yCenter = (heads[0].y + heads[1].y) / 2;

    // calculate the height distance between two heads
    const yDistance = heads[0].y - heads[1].y;
    const xDistance = heads[0].x - heads[1].x;




    /*  const ax = heads[0].x
        const ay = heads[0].y
        const bx = heads[1].x
        const by = heads[1].y */

    const a = { x: heads[0].x, y: heads[0].y };
    const b = { x: heads[1].x, y: heads[1].y };




    // Calculates distance between point a and b
    const distance = Points.distance(a, b); // Returns a number
    speed += Math.abs(yDistance - previousDistanceY);
    speedX += Math.abs(xDistance - previousDistanceX);
    actualSpeed = Math.abs(xDistance - previousDistanceX);
    actualSpeedY = Math.abs(yDistance - previousDistanceY);

    if (actualSpeed > 0.03 && actualSpeedY > 0.03) {
      if (spedometer < 1) {
        spedometer += 0.03
        wobbleSpeed = spedometer
      }

      //wobbleSpeed = Math.abs(1 - ((actualSpeed + actualSpeedY) * 10)) / 50;
      //wobbleSpeed = actualSpeed;
    } else {
      if (spedometer > 0.009) {
        spedometer -= 0.009
        wobbleSpeed = spedometer
      }
    }
    console.log(wobbleSpeed)


    previousDistanceY = yDistance; // Update the previous distance for the next frame
    previousDistanceX = xDistance; // Update the previous distance for the next frame

    //console.log(bajs)

    if (document.getElementById("bajs") == null || document.getElementById("bajs") == undefined) {
      console.log("undefined")
    } else {
      document.getElementById("bajs").innerHTML = `
*,
*:before,
*:after,
html,
body {
    box-sizing: border-box;
}

:root {
    --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol";
    --bg: rgb(255, 255, 255);
    --fg: white;
}

body {
    background-color: hsl(212, 100%, 91%);
    color: var(--fg);
    font-family: var(--font);
}

:root {
    --size: 50vmin;
    --speed: 35s;
}

#circle-element {
    width: var(--size);
    height: var(--size);
    background: hsl(212, 100%, 71%);
    border: calc(var(--size) * 0.09) solid hsl(212, 100%, 81%);
    position: absolute;
    top: calc(50% - (var(--size) * 0.49));
    left: calc(50% - (var(--size) * 0.49));
    overflow: visible;
    border-radius: ${50 - (wobbleSpeed * 2)}% ${50 - (wobbleSpeed * 10)}% ${50 + (wobbleSpeed * 12)}% ${50 - (wobbleSpeed * 13)}% / ${50 + (wobbleSpeed * 11)}% ${50 - (wobbleSpeed * 1)}% ${50 + (wobbleSpeed * 14)}% ${50 - (wobbleSpeed * 7)}%;
    animation: rotate var(--speed) infinite linear;
    z-index: 1;
    scale: 1 1;
}

@keyframes rotate {
    0% {
        transform: rotate(1turn);
    }
}

#circle-element:before {
    content: '';
    position: absolute;
    top: calc(var(--size) * 0.1);
    left: calc(var(--size) * 0.1);
    width: calc(100% - (var(--size) * 0.3));
    height: calc(100% - (var(--size) * 0.3));
    background: hsl(212, 100%, 51%);
    border: calc(var(--size) * 0.065) solid hsl(212, 100%, 61%);
    border-radius: ${50 - (wobbleSpeed * 9)}% ${50 - (wobbleSpeed * 10)}% ${50 + (wobbleSpeed * 0)}% ${50 + (wobbleSpeed * 5)}% / ${50 - (wobbleSpeed * 1)}% ${50 + (wobbleSpeed * 2)}% ${50 + (wobbleSpeed * 1)}% ${50 - (wobbleSpeed * 7)}%;
    z-index: -2;
    animation: rotateBefore var(--speed) infinite linear;
}

@keyframes rotateBefore {
    0% {
        transform: rotate(-2turn);
    }
}

#circle-element:after {
    content: '';
    position: absolute;
    top: calc(var(--size) * 0.2);
    left: calc(var(--size) * 0.2);
    width: calc(100% - (var(--size) * 0.5));
    height: calc(100% - (var(--size) * 0.5));
    background: hsl(212, 100%, 31%);
    border: calc(var(--size) * 0.05) solid hsl(212, 100%, 41%);
    border-radius: ${50 - (wobbleSpeed * 8)}% ${50 + (wobbleSpeed * 13)}% ${50 + (wobbleSpeed * 1)}% ${50 + (wobbleSpeed * 10)}% / ${50 - (wobbleSpeed * 3)}% ${50 + (wobbleSpeed * 12)}% ${50 - (wobbleSpeed * 8)}% ${50 + (wobbleSpeed * 2)}%;
    animation: rotateAfter var(--speed) infinite linear;
}

@keyframes rotateAfter {
    0% {
        transform: rotate(2turn);
    }
}

    `
    }
    //audio.playbackRate = (distance * 1) + 0.5;



    // Update the previous distance for the next frame

    //circleElement.style.left = `${speed * 10}vw`;
    //circleElement.style.top = `${speedX * 10}vh`;
    //circleElement.style.scale = `${speedX * 2} ${speed * 2} `;
    //circleElement.style.height = `${speedX * 100} vh`;


    circleElement1.style.left = `${a.x * 100} vw`;
    circleElement1.style.top = `${a.y * 100} vh`;

    circleElement1.style.width = "100px";
    circleElement1.style.height = "100px";

    circleElement2.style.left = `${b.x * 100} vw`;
    circleElement2.style.top = `${b.y * 100} vh`;



    //background1.style.backgroundColor = `rgb(${255 - (speed * (Math.random() * 70))} ${255 - (speedX * (Math.random() * 70))} ${255 - (speedX * (Math.random() * 70))})`
    //circleElement.style.backgroundColor = `rgb(${255 - (speedX * (Math.random() * 70))} ${255 - (speedX * (Math.random() * 70))} ${255 - (speed * (Math.random() * 70))})`
    //console.log(speedX)



  }

  saveState({ heads });
};



const onPoseAdded = (event) => {
  const poseTracker = event.detail;
  console.log(`Pose added: ${poseTracker.guid} `);
};

const onPoseExpired = (event) => {
  const poseTracker = event.detail;
  console.log(`Pose expired: ${poseTracker.guid} `);
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
    if (speed > 0.01) {
      //console.log(speed);
      speed = speed - 0.03

    }
    if (speedX > 0.01) {
      speedX = speedX - 0.03
    }

    if (speedX && speed > 0.0) {
      document.documentElement.style.setProperty('--speed', `10s`);
    } else {
      document.documentElement.style.setProperty('--speed', `1000s`);
      //document.documentElement.style.('--speed', `10000s`);

    }

    if (actualSpeed > 0.005) {
      audio.play()
    }
    if (actualSpeed <= 0.005) {
      audio.pause()
    }

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

