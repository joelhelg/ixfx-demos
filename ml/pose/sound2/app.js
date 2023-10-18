// @ts-ignore
window.AudioContext = window.AudioContext || window.webkitAudioContext;
let audioCtx
const start = document.getElementById("play");
start.addEventListener("click", () => {
    audioCtx = new AudioContext;
    console.log(audioCtx);
})

let avoidNotes = [2, 5, 7, 10, 12];
//console.log("declared and defined",avoidNotes)
const expandNotes = (array) => {
    let counter = 0;
    for (let note of array) {
        if (counter > 200) {
            break;
        } else {
            counter++
            array.push(note + 12)
            //console.log("adding elements",avoidNotes);
        }
    }
}
expandNotes(avoidNotes);
//console.log("after expandNotes func", avoidNotes)
const convertToScale = (value, array) => {
    if (!value) {
        //console.log(array);
        //console.log("this is a hail mary", (array[Math.floor(Math.random()*128)])+1);
        return (array[Math.floor(Math.random() * 128)]) + 1;
    }

    //console.log(note);
    if (array.includes(value)) {
        if (Math.random() > 0.5) { return (value + 1); } else { return (value - 1) }
    } else {
        return value;
    }
}

for (let i = 0; i < 200; i++) {
    console.log(convertToScale(i, avoidNotes));
}
console.log(avoidNotes)
const oscillators = {

};

let attack = 1;
let decay = 10;
let release = 1;



function midiToFreq(number) {
    const a = 440;
    return (a / 32) * (2 ** ((number - 9) / 12));
}

if (navigator.requestMIDIAccess) {
    navigator.requestMIDIAccess().then(success, failure);
}

function success(MIDIAccess) {
    //console.log(MIDIAccess);
    // midiAccess.onstatechange = updateDevices;
    MIDIAccess.addEventListener("statechange", updateDevices);

    const inputs = MIDIAccess.inputs;
    //console.log(inputs);

    inputs.forEach((input) => {
        //console.log(input);
        //input.onmidimessage = handleInput
        input.addEventListener("midimessage", handleInput);
    });
}

function handleInput(input) {
    //console.log(event);
    if (input.data[0] === 248) {
        return;
    }
    const command = input.data[0];
    const note = input.data[1];
    const velocity = input.data[2];
    //console.log(command, note, velocity);

    switch (command) {
        case 144: //noteOn
            if (velocity > 0) {
                //note is on
                noteOn(note, velocity);

            } else {
                //note is off
                noteOff(note);
            }
            break;
        case 128: //noteOff
            //note is off
            noteOff(note);
            break;
    }
}

let particleState = 0;

function noteOn(note, velocity) {
    console.log(`on: ${note}, ${velocity}`)

    let coordinates = {
        x: 0 + (note - 36) * (window.innerWidth - 0) / (84 - 36),           //(note - 30) + (window.innerWidth / 2) *,
        y: 0 + (velocity - 0) * (window.innerHeight - 0) / (127 - 1),
    }

    this.coordinates = coordinates;
    particleState = 1;

    const osc = audioCtx.createOscillator();

    const oscGain = audioCtx.createGain();
    oscGain.gain.value = (velocity / 127) * 0.3;
    //console.log(osc);
    osc.type = "sine";
    console.log(convertToScale(note, avoidNotes));
    osc.frequency.value = midiToFreq(convertToScale(note, avoidNotes));

    //connections
    osc.connect(oscGain);
    oscGain.connect(audioCtx.destination);

    osc.gain = oscGain;
    //put into oscillators object
    oscillators[note.toString()] = osc;
    osc.start();
    //decay
    oscGain.gain.setValueAtTime(oscGain.gain.value, audioCtx.currentTime);
    oscGain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + decay);



}

function noteOff(note) {

    particleState = 0;

    console.log(`off: ${note}`)
    const osc = oscillators[note.toString()];
    const oscGain = osc?.gain;
    //release
    oscGain?.gain.setValueAtTime(oscGain.gain.value, audioCtx.currentTime);
    oscGain?.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + release);

    setTimeout(() => {
        osc?.stop();
    }, (release * 1000));

    delete oscillators[note?.toString()];
}



function updateDevices(event) {
    console.log(event);
}

function failure() {
    console.log("could not connect MIDI device");
}

