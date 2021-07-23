const pureknob = require('./pureknob')



var fat_spread = 40; //fatsynth
var env = {
    attack: 0,
    decay: 0.1,
    sustain: 0.1,
    release: 1
};
//tremolo = new Tone.Tremolo(9, 0.75).start(); //doesnt work with fx class not sure why
var flag = 0;
var frequency = 440;
var oscillators = []; //create a list that stores all the oscillators
var current_oscillator;
var times = 0;
var intervalID;
var old_model; //[null,null,null,null,null,null,null,null,null,null,null,null,null];
//null array for comparison, change old model at the end of each check_connection!


class FX extends Tone.ToneAudioNode {
    constructor(options) {
        super();
        this.effect = new options.effect(options.options); // create effectNode in constructor
        this._bypass = options.bypass;
        this._lastBypass = options.bypass;
        // audio signal is constantly passed through this node,
        // but processed by effect only, if bypass prop is set to `false`
        this.input = new Tone.Gain();
        this.output = new Tone.Gain();
        this.effect.connect(this.output);
        this.activate(!options.bypass); // initialize input node connection
    }
    get bypass() {
        return this._bypass;
    }
    set bypass(val) {
        if (this._lastBypass === val) return;
        this._bypass = Boolean(val);
        this.activate(!val);
        this._lastBypass = val;
    }
    /* obj.bypass();
   activate effect (connect input node), if bypass == false
   */
    activate(doActivate) {
        if (doActivate) {
            this.input.disconnect();
            this.input.connect(this.effect);
        } else {
            this.input.disconnect();
            this.input.connect(this.output);
        }
    }
    toggleBypass() {
        this.bypass = !this._bypass;
    }
    dispose() {
        super.dispose();
        this.effect.dispose();
        return this;
    }
}

class fx_oscillator {
    constructor() {
        this.freqEnv_flag = 0;
        this.envelope = new Tone.AmplitudeEnvelope({
            attack: 0,
            decay: 0.1,
            sustain: 0.1,
            release: 1
        });
        this.fx1 = new FX({
            effect: Tone.Distortion, // effect class
            options: { distortion: 1, wet: 1 }, // effect initial options
            bypass: false // initial bypass value
        });
        this.fx2 = new Tone.Phaser();

        this.fx3 = new FX({
            effect: Tone.Vibrato,
            options: { frequency: 5, depth: 0.3, wet: 1 },
            bypass: false
        });
        this.fx4 = new FX({
            effect: Tone.Reverb,
            options: { decay: 2 },
            bypass: false
        });
        this.fx5 = new FX({
            effect: Tone.Chorus,
            options: { frequency: 1.5, delayTime: 3.5, depth: 0.7, wet: 1 },
            bypass: false
        });
        this.fx6 = new FX({
            effect: Tone.BitCrusher,
            options: { bits: 4, wet: 1 },
            bypass: false
        });
        this.fx7 = new FX({
            effect: Tone.Chebyshev,
            options: { order: 30, wet: 1 },
            bypass: false
        });
        this.fx8 = new FX({
            effect: Tone.AutoWah,
            options: { baseFrequency: 100, octaves: 6, sensitivity: 0, wet: 1 },
            bypass: false
        });
        this.fx9 = new Tone.AutoPanner();
        this.fx9.start();

        this.fx10 = new FX({
            effect: Tone.PingPongDelay,
            options: { delaytime: "8n", feedback: 0.6 }, //wet: 0.5 },
            bypass: false
        });
        this.fx11 = new FX({
            effect: Tone.PitchShift,
            options: { pitch: 2, wet: 1 },
            bypass: false
        });
        this.fx12 = new FX({
            effect: Tone.AutoFilter,
            options: { frequency: 5, baseFrequency: 50, octaves: 1 },
            bypass: false
        });
        this.fx13 = new FX({
            effect: Tone.Filter,
            options: { frequency: 200, type: "lowpass", rolloff: -12, Q: 1 },
            bypass: false
        });
        this.fx14 = new FX({
            effect: Tone.Filter,
            options: { frequency: 200, type: "highpass", rolloff: -12, Q: 1 },
            bypass: false
        });
        this.fx15 = new FX({
            effect: Tone.Filter,
            options: { frequency: (200, 300), type: "bandpass", rolloff: -12, Q: 1 },
            bypass: false
        });
        //this.fx16 = new FX({ already at fx3
        //  effect: Tone.Vibrato,
        //  options: { frequency: 5, depth: 0.5 , wet:1},
        //  bypass: false
        //});
        this.fx17 = new FX({
            effect: Tone.FeedbackDelay,
            options: { delayTime: "8n", feedback: 0.5 },
            bypass: false
        });
        this.fx18 = new Tone.Tremolo();
        this.fx18.start();

        /*this.freqEnv = new Tone.FrequencyEnvelope({
          attack: 0.0,
          decay: 0.0,
          sustain: 0.0,
          release: 0.0,
          baseFrequency: frequency,
          octaves: 1
        });*/
        //this.freqEnv.connect(this.osc.frequency);
    }
    setOsc(osc_type) {
        switch (osc_type) {
            case "sine":
                this.osc = new Tone.Synth(); //missing start();
                this.osc.oscillator.type = "sine";
                break;
            case "square":
                this.osc = new Tone.Synth();
                this.osc.oscillator.type = "square";
                this.osc.volume.value = -14;
                break;
            case "triangle":
                this.osc = new Tone.Synth();
                this.osc.oscillator.type = "triangle";
                break;
            case "sawtooth":
                this.osc = new Tone.Synth();
                this.osc.oscillator.type = "sawtooth";
                this.osc.volume.value = -10;
                break;
            case "noise":
                this.osc = new Tone.Noise("pink").toMaster();
                this.osc.volume.value = -18;
                break;
            case "duosynth":
                this.osc = new Tone.DuoSynth();
                this.osc.volume.value = -18;
                break;
            case "fatsynth":
                this.osc = new Tone.FatOscillator(frequency, "sine", fat_spread);
                //this.osc.oscillator.type = "fat";
                //this.osc.oscillator.start();
                break;
            default:
                this.osc = new Tone.Synth();
        }
    }
    setMelody(osc_type) {
        var time_interval = 0.5;
        if (osc_type == "noise" || osc_type == "fatsynth") {
            this.loopA = new Tone.Loop((time) => { }, "16n").start(0);
            this.osc.start();
            //this.freqEnv.triggerAttackRelease();
        } else {
            //this.freqEnv.connect(this.osc.frequency);
            //this.osc.triggerAttackRelease("C4", "8n");
            //this.freqEnv.triggerAttackRelease();
            Tone.Transport.start();
            this.loopA = new Tone.Loop((time) => {
                const now = Tone.now();
                this.osc.triggerAttackRelease("D3", "16n", now);
                this.osc.triggerAttackRelease("E4", "8n", now + time_interval);
                this.osc.triggerAttackRelease("G4", "8n", now + 2 * time_interval);
                this.osc.triggerAttackRelease("E5", "8n", now + 3 * time_interval);
                this.osc.triggerAttackRelease("G5", "8n", now + 4 * time_interval);
                this.osc.triggerAttackRelease("G4", "8n", now + 5 * time_interval);
                this.osc.triggerAttackRelease("E5", "8n", now + 6 * time_interval);
                this.osc.triggerAttackRelease("F5", "8n", now + 7 * time_interval);
                this.osc.triggerAttackRelease("E5", "8n", now + 8 * time_interval);
                this.osc.triggerAttackRelease("D5", "8n", now + 9 * time_interval);
                this.osc.triggerAttackRelease("D4", "8n", now + 10 * time_interval);
                this.osc.triggerAttackRelease("D5", "8n", now + 11 * time_interval);
                this.osc.triggerAttackRelease("D4", "8n", now + 12 * time_interval);
            }, "1n").start(0);
            Tone.Transport.bpm.value = 30;
        }
    }
    //osc.triggerAttackRelease("C4", "8n");
    // audio signal is constantly passed through this node,
    // but processed by effect only, if bypass prop is set to `false`
}

const endCont = document.getElementById("dest_cont");

keys = document.querySelectorAll(".keys");
keys.forEach((key, index) => key.classList.add("node"));

const main_out = document.getElementById("main_out");
const main_out_node = document.getElementById("main_out_node");
input_assignment(main_out);
main_out_node.classList.add("node");

nodes = document.querySelectorAll(".node");
num_nodes = nodes.length;
main_out.dataset.index = num_nodes - 1;

model = Array(num_nodes).fill(null);

buttons_eff = document.querySelectorAll(".button_effect");
buttons_eff.forEach(make_inactive);

function make_inactive(button) {
    button.classList.add("inactive");
}

keys.forEach((key, index) => click_assignment(key, index, key.parentNode));

function click_assignment(key, index, source) {
    on = key.classList.toggle("waiting");
    if (on) {
        source = key.parentNode;
        key.onclick = function () {
            teleport_in(key, index, source);
        };
    } else {
        dragElement(key);
        const x_butt = document.getElementById(key.id + "_x");
        x_butt.onclick = function () {
            teleport_out(key, index, source);
        };
    }
}

function teleport_in(key, index, source) {
    const new_key = key.cloneNode(true);
    new_key.id = key.id + "In";
    key.style.display = "none";

    const button = new_key.children[0];
    if (button.classList.contains("button_effect")) {
        button.classList.toggle("inactive");
    }
    //console.log(new_key.id);
    endCont.appendChild(new_key);
    new_key.dataset.index = index;
    new_key.classList.toggle("active");
    add_x(new_key);
    click_assignment(new_key, index, source);
    const [input, output] = in_out(new_key, index); //in_out connections
    output_assignment(output, index);
    input_assignment(input, index);
    if (key.classList.contains("key_osc")) {
        input.remove();
    }
    console.log(new_key.id);
    if (new_key.id == "noiseIn") { const knob1 = new_knob(new_key, "left"); }
    else {
        const knob1 = new_knob(new_key, "left");
        const knob2 = new_knob(new_key, "right");
        pair = new button_and_knobs(key, knob1, knob2);
        pair_array.push(pair);
    }
}

var pair_array = [];

class button_and_knobs {
    constructor(key, knob1, knob2) {
        this.knob1_of_button = knob1;
        this.knob2_of_button = knob2;
        this.key_of_button = key;
    }
}

function teleport_out(key, index, source) { //lines management
    const out_index = model.indexOf(index);
    if (out_index != -1) {
        const out_key = nodes[out_index];
        const line = document.getElementById(out_key.id + "In_line");
        remove_line(line, out_index);
    }
    const key_line = document.getElementById(key.id + "_line");
    if (key_line != null) {
        remove_line(key_line, index);
    }
    endCont.removeChild(key);
    nodes[index].style.display = "inline-block";
}

//add_x function
function add_x(button) {
    const square = document.createElement("button");
    const x = document.createElement("i");

    square.classList.add("btn_out");
    x.classList.add("fa", "fa-close");
    button.appendChild(square);
    square.appendChild(x);
    square.id = button.id + "_x";
    return square;
}

//DRAGGING FUNCTION

function dragElement(elmnt) {
    var pos1 = 0,
        pos2 = 0,
        pos3 = 0,
        pos4 = 0;
    // otherwise, move the DIV from anywhere inside the DIV:
    elmnt.onmousedown = dragMouseDown;

    function dragMouseDown(e) {
        e = e || window.event;
        e.preventDefault();
        // get the mouse cursor position at startup:
        pos3 = e.clientX;
        pos4 = e.clientY;
        document.onmouseup = closeDragElement;
        // call a function whenever the cursor moves:
        document.onmousemove = elementDrag;
    }

    function elementDrag(e) {
        e = e || window.event;
        e.preventDefault();
        // calculate the new cursor position:
        pos1 = pos3 - e.clientX;
        pos2 = pos4 - e.clientY;
        pos3 = e.clientX;
        pos4 = e.clientY;
        // set the element's new position:
        elmnt.style.top = elmnt.offsetTop - pos2 + "px";
        elmnt.style.left = elmnt.offsetLeft - pos1 + "px";
        coordinate(); //lines move with the keys!!!
    }

    function closeDragElement() {
        // stop moving when mouse button is released:
        document.onmouseup = null;
        document.onmousemove = null;
    }
}

//IN_OUT CONNECTIONS

function in_out(key, index) {
    const input = document.createElement("div");
    input.classList.add("connection", "in");
    input.id = key.id + "_in"; //coordinate function needs ids of objects
    input.dataset.index = index;
    const output = document.createElement("div");
    output.classList.add("connection", "out");
    output.id = key.id + "_out";
    output.dataset.index = index;
    key.appendChild(input);
    key.appendChild(output);
    return [input, output];
}

const outputs = document.querySelectorAll(".out");
const inputs = document.querySelectorAll(".in");
outputs.forEach(
    (output, index) =>
        function (output) {
            const ind = output.dataset.index;
            output_assignment(output, ind);
        }
);

inputs.forEach(
    (input, index) =>
        function (input) {
            const ind = input.dataset.index;
            input_assignment(input, ind);
        }
);

function output_assignment(output, index) {
    const key_out = output.parentNode;
    output.onclick = function () {
        const ready = output.classList.toggle("connected");
        if (ready) {
            output.classList.toggle("wait_conn", true);
        } else {
            output.classList.toggle("wait_conn", false);
            const line = document.getElementById(key_out.id + "_line");
            if (line != null) {
                remove_line(line, index);
            }
        }
    };
}

function input_assignment(input, index) {
    input.onclick = function () {
        const ready_outputs = document.getElementsByClassName("wait_conn");
        if (ready_outputs.length != 0) {
            if (input != main_out) {
                input.classList.toggle("connected");
            }
            const output = ready_outputs[0];
            output.classList.toggle("wait_conn");
            create_line(output, input);
        }
    };
}

function create_line(output, input) {
    const id1 = output.id;
    const id2 = input.id;
    const line = document.createElement("div");
    line.classList.add("line");
    line.dataset.connectout = "#" + id1;
    line.dataset.connectin = "#" + id2;
    const out_key = output.parentNode;
    out_key.appendChild(line);
    line.id = out_key.id + "_line";
    coordinate();

    const index1 = Number(output.dataset.index);
    const index2 = Number(input.dataset.index);
    //console.log("model:",model);
    //console.log("old model:",old_model);
    old_model = model;
    model[index1] = index2;
    //old_model = [null,null,null,null,null,null,null,null,null,null,null,null,null];//null array for comparison, change old model at the end of each check_connection! this used to work for three buttons? its wrong tho
    console.log(
        "Connection between " + nodes[index1].id + " and " + nodes[index2].id
    );
    check_connection(index1);
    //console.log(old_model);
    //old_model = model;
    //console.log(old_model);
}

function check_connection(i) {
    index = model[i]; //temp variable for connections
    //console.log(index);
    is_oscillator = check_if_oscillator(i); //check if the difference is an "oscillator to something else" connection.
    //if (is_oscillator) {//if an oscillator was chosen time to connect stuff until the end of chain or master
    // current_oscillator.setMelody();
    //}
    a = choose_fx(i); //gives the current oscillators fx object, the sender
    b = choose_fx(model[i]); //gives the current oscillators fx object, the receiver
    console.log(a);
    a.connect(b); //connection made

    stop_flag = 0;
    while (stop_flag == 0) {
        is_null = check_if_null(model[index]); //check if the connection is also connected to something
        if (is_null) {
            //console.log(is_null);
            stop_flag = 1; //if there is no connection dont do anything else
        } else { //it's not null
            //console.log(is_null);
            a = choose_fx(model[index]); //gives the current oscillators fx object, the sender
            b = choose_fx(model[model[index]]); //gives the current oscillators fx object, the receiver
            a.connect(b);
            stop_flag = 0;
            index = model[index]; //it starts from 0 so do we subtract 1? prob not!
        }
    }
}
//const p = new fx_oscillator("sine");
//p.fx1.effect.distortion = 0.8;
//current_oscillator = p;
//oscillators.push(p);

function check_if_oscillator(i) {
    console.log(i);
    switch (i) {
        case 0:
            const s = new fx_oscillator();
            current_oscillator = s;
            oscillators.push(s); //define an object for the oscillator and start connecting stuff
            current_oscillator.setOsc('sine');
            current_oscillator.setMelody('sine');
            console.log(current_oscillator.osc.envelope.attack);
            current_oscillator.osc.envelope.attack = 0.2;
            console.log(current_oscillator.osc.envelope.attack);
            return true;
        case 1:
            const sq = new fx_oscillator();
            current_oscillator = sq;
            oscillators.push(sq); //define an object for the oscillator and start connecting stuff
            current_oscillator.setOsc('square');
            current_oscillator.setMelody('square');
            return true;
        case 2:
            const tr = new fx_oscillator();
            current_oscillator = tr;
            oscillators.push(tr); //define an object for the oscillator and start connecting stuff
            current_oscillator.setOsc('triangle');
            current_oscillator.setMelody('triangle');
            return true;
        case 3:
            const saw = new fx_oscillator();
            current_oscillator = saw;
            oscillators.push(saw); //define an object for the oscillator and start connecting stuff
            current_oscillator.setOsc('sawtooth');
            current_oscillator.setMelody('sawtooth');
            return true;
        case 21:
            const duo = new fx_oscillator();
            current_oscillator = duo;
            oscillators.push(duo); //define an object for the oscillator and start connecting stuff
            current_oscillator.setOsc('duosynth');
            current_oscillator.setMelody('duosynth');
            return true;
        case 22:
            const fat = new fx_oscillator();
            current_oscillator = fat;
            oscillators.push(fat); //define an object for the oscillator and start connecting stuff
            current_oscillator.setOsc('fatsynth');
            current_oscillator.setMelody('fatsynth');
            return true;
        case 23:
            const noise = new fx_oscillator();
            current_oscillator = noise;
            oscillators.push(noise); //define an object for the oscillator and start connecting stuff
            current_oscillator.setOsc('noise');
            current_oscillator.setMelody('noise');
            return true;
        default:
            // other buttons are not oscillators
            return false;
    }
}

function check_if_null(num) {
    if (model[num] == null) {
        return true;
    } else {
        return false;
    }
}
var masterflag = 0;

function choose_fx(i) {

    //console.log(nodes[i]);
    switch (i) {
        case 0:
            return current_oscillator.osc;
        case 1:
            return current_oscillator.osc;
        case 2:
            return current_oscillator.osc;
        case 3:
            return current_oscillator.osc;
        case 4:
            return current_oscillator.fx13;
        case 5:
            return current_oscillator.fx14;
        case 6:
            return current_oscillator.fx15;
        case 7:
            return current_oscillator.fx1;
        case 8:
            return current_oscillator.fx2; //what is this icon?
        case 9:
            //return tremolo;
            return current_oscillator.fx18;//doesnt work with fx?
        case 10:
            return current_oscillator.fx4;
        case 11:
            return current_oscillator.fx5;
        case 12:
            return current_oscillator.fx17;
        case 13:
            return current_oscillator.fx6;
        case 14:
            return current_oscillator.fx7;
        case 15:
            return current_oscillator.fx8;
        case 16:
            return current_oscillator.fx9;
        case 17:
            return current_oscillator.fx10;
        case 18:
            return current_oscillator.fx11;
        case 19:
            return current_oscillator.fx12;
        case 20:
            return current_oscillator.fx3;
        case 21:
            return current_oscillator.osc;
        case 22:
            return current_oscillator.osc;
        case 23:
            return current_oscillator.osc;
        case 24:
            return current_oscillator.freqEnv;
        case 25:
            return Tone.Master;
        default:
            throw "what button is this??";
        //return null;
    }
}

function remove_line(line, index) {
    const output = document.getElementById(
        line.dataset.connectout.split("#").pop()
    );
    const input = document.getElementById(
        line.dataset.connectin.split("#").pop()
    );
    if (input != main_out) {
        input.classList.remove("connected");
    }
    output.classList.remove("connected");

    const index2 = model[index];
    console.log(
        "Removing connection between " +
        nodes[index].id +
        " and " +
        nodes[index2].id
    );
    line.remove(); //removing the drawing
    ss = model[index];
    //console.log(ss);
    remove_check_connection(index, ss); //removing the sound connection
    model[index] = null; //making the element null
}

function remove_check_connection(index, what) {
    a = choose_fx(index); //gives the current oscillators fx object, the sender
    b = choose_fx(what); //gives the current oscillators fx object, the receiver
    a.disconnect(b);
    //remove_check_if_oscillator(index);  //have to think
}

//have to think
function remove_check_if_oscillator(i) {
    console.log(i);
    switch (i) {
        case 0:
            oscillators.pop(); //define an object for the oscillator and start connecting stuff
            current_oscillator = oscillators[oscillators.length - 1];
        case 1:
            const sq = new fx_oscillator();
            //sq.fx1.effect.distortion = 0.8;
            current_oscillator = sq;
            oscillators.push(sq); //define an object for the oscillator and start connecting stuff
            current_oscillator.setOsc('square');
            current_oscillator.setMelody('square');
        case 2:
            const tr = new fx_oscillator();
            //tr.fx1.effect.distortion = 0.8;
            current_oscillator = tr;
            oscillators.push(tr); //define an object for the oscillator and start connecting stuff
            current_oscillator.setOsc('triangle');
            current_oscillator.setMelody('triangle');
        case 3:
            const saw = new fx_oscillator();
            //saw.fx1.effect.distortion = 0.8;
            current_oscillator = saw;
            oscillators.push(saw); //define an object for the oscillator and start connecting stuff
            current_oscillator.setOsc('sawtooth');
            current_oscillator.setMelody('sawtooth');
        case 21:
            const duo = new fx_oscillator();
            current_oscillator = duo;
            oscillators.push(duo); //define an object for the oscillator and start connecting stuff
            current_oscillator.setOsc('duosynth');
            current_oscillator.setMelody('duosynth');
        case 22:
            const fat = new fx_oscillator();
            current_oscillator = fat;
            oscillators.push(fat); //define an object for the oscillator and start connecting stuff
            current_oscillator.setOsc('fatsynth');
            current_oscillator.setMelody('fatsynth');
        case 23:
            const noise = new fx_oscillator();
            current_oscillator = noise;
            oscillators.push(noise); //define an object for the oscillator and start connecting stuff
            current_oscillator.setOsc('noise');
            current_oscillator.setMelody('noise');
        default:
        // other buttons are not oscillators
    }
}

// CONNECTING LINES

const coordinate = function () {
    $(".line").each(function () {
        const box1 = $(this).data("connectout");
        const box2 = $(this).data("connectin");
        const $b1 = $(box1);
        const $b2 = $(box2);

        const x1 = $b1.offset().left + $b1.width() / 2;
        const y1 = $b1.offset().top + $b1.height() / 2;

        const x2 = $b2.offset().left + $b2.width() / 2;
        const y2 = $b2.offset().top + $b2.height() / 2;

        moveLine(x1, y1, x2, y2, $(this));
    });
};

function moveLine(x1, y1, x2, y2, $line) {
    var length = Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    var angle = (Math.atan2(y2 - y1, x2 - x1) * 180) / Math.PI;
    var transform = "rotate(" + angle + "deg)";

    var offsetX = x1 > x2 ? x2 : x1;
    var offsetY = y1 > y2 ? y2 : y1;

    $line
        .css({
            position: "absolute",
            "-webkit-transform": transform,
            "-moz-transform": transform,
            transform: transform
        })
        .width(length)
        .offset({
            left: offsetX,
            top: offsetY
        });
}

//KNOBS
function scale(number, inMin, inMax, outMin, outMax) { //mapping function
    return (number - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
}

//for wetness
wet_inMin = 0;
wet_inMax = 1;
wet_outMin = 0;
wet_outMax = 100;

function knob_initialize(knob, elem, side) {
    console.log(side);
    if (side == "left") { //wetness stuff
        //console.log(knob._properties.key_id_id);
        switch (knob._properties.key_id_id) {
            case "sinIn":
                knob.setProperty("valMin", -12); //volume
                knob.setProperty("valMax", 0);
                knob.setValue(0);
                break;
            case "squareIn":
                knob.setProperty("valMin", -12);//volume
                knob.setProperty("valMax", 0);
                knob.setValue(0);
                break;
            case "sawIn":
                knob.setProperty("valMin", -12);//volume
                knob.setProperty("valMax", 0);
                knob.setValue(0);
                break;
            case "triangIn":
                knob.setProperty("valMin", -12);//volume
                knob.setProperty("valMax", 0);
                knob.setValue(0);
                break;
            case "lpfIn":
                knob.setProperty("valMin", 0);//attenuation volume
                knob.setProperty("valMax", 100);
                knob.setValue(1);
                break;
            case "hpfIn":
                knob.setProperty("valMin", 0);//attenuation volume
                knob.setProperty("valMax", 100);
                knob.setValue(1);
                break;
            case "bpfIn":
                knob.setProperty("valMin", 0);//attenuation volume
                knob.setProperty("valMax", 100);
                knob.setValue(1);
                break;
            case "distortIn":
                knob.setProperty("valMin", scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax)); //wetness
                knob.setProperty("valMax", scale(1, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                knob.setValue(scale(100, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                break;
            case "skullIn":
                knob.setProperty("valMin", scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax)); //wetness
                knob.setProperty("valMax", scale(1, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                knob.setValue(scale(100, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                break;
            case "tremoloIn":
                knob.setProperty("valMin", scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax)); //wetness
                knob.setProperty("valMax", scale(1, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                knob.setValue(scale(100, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                break;
            case "flangerIn":
                knob.setProperty("valMin", scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax)); //flanger level
                knob.setProperty("valMax", scale(1, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                knob.setValue(scale(100, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                break;
            case "vibratoIn":
                knob.setProperty("valMin", scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax)); //wetness
                knob.setProperty("valMax", scale(1, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                knob.setValue(scale(100, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                break;
            case "phaserIn":
                knob.setProperty("valMin", scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax)); //wetness
                knob.setProperty("valMax", scale(1, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                knob.setValue(scale(100, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                break;
            case "reverbIn":
                knob.setProperty("valMin", scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax)); //wetness
                knob.setProperty("valMax", scale(1, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                knob.setValue(scale(100, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                break;
            case "chorusIn":
                knob.setProperty("valMin", scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax)); //wetness
                knob.setProperty("valMax", scale(1, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                knob.setValue(scale(100, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                break;
            case "bitcrusherIn":
                knob.setProperty("valMin", scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax)); //wetness
                knob.setProperty("valMax", scale(1, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                knob.setValue(scale(100, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                break;
            case "chebIn":
                knob.setProperty("valMin", scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax)); //wetness
                knob.setProperty("valMax", scale(1, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                knob.setValue(scale(100, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                break;
            case "wahIn":
                knob.setProperty("valMin", scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax)); //wetness
                knob.setProperty("valMax", scale(1, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                knob.setValue(scale(100, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                break;
            case "pannerIn":
                knob.setProperty("valMin", scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax)); //wetness
                knob.setProperty("valMax", scale(1, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                knob.setValue(scale(100, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                break;
            case "pingpongdelayIn":
                knob.setProperty("valMin", scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax)); //wetness
                knob.setProperty("valMax", scale(1, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                knob.setValue(scale(100, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                break;
            case "pitchshiftIn":
                knob.setProperty("valMin", scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax)); //wetness
                knob.setProperty("valMax", scale(1, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                knob.setValue(scale(100, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                break;
            case "auto-filterIn":
                knob.setProperty("valMin", scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax)); //wetness
                knob.setProperty("valMax", scale(1, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                knob.setValue(scale(100, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                break;
            case "duosynthIn":
                knob.setProperty("valMin", 100); //freq
                knob.setProperty("valMax", 1500);
                knob.setValue(440);
                break;
            case "fatsynthIn":
                knob.setProperty("valMin", 100); //freq
                knob.setProperty("valMax", 1500);
                knob.setValue(440);
                break;
            case "noiseIn":
                knob.setProperty("valMin", -24); //wetness
                knob.setProperty("valMax", 0);
                knob.setValue(-6);
                break;
            case "freqenvIn":
                knob.setProperty("valMin", scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax)); //wetness
                knob.setProperty("valMax", scale(1, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                knob.setValue(scale(100, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                break;
            default:
                throw "what button is this?? Knob error";
        }
    }
    else if (side == "right") {
        switch (knob._properties.key_id_id) {
            case "sinIn":
                knob.setProperty("valMin", 0); //partial
                knob.setProperty("valMax", 6);
                knob.setValue(0);
                break;
            case "squareIn":
                knob.setProperty("valMin", 0);//partial
                knob.setProperty("valMax", 6);
                knob.setValue(0);
                break;
            case "sawIn":
                knob.setProperty("valMin", 0);//partial
                knob.setProperty("valMax", 6);
                knob.setValue(0);
                break;
            case "triangIn":
                knob.setProperty("valMin", 0);//partial
                knob.setProperty("valMax", 6);
                knob.setValue(0);
                break;
            case "lpfIn":
                knob.setProperty("valMin", 100);//center freq
                knob.setProperty("valMax", 2000);
                knob.setValue(600);
                break;
            case "hpfIn":
                knob.setProperty("valMin", 100);//center freq
                knob.setProperty("valMax", 2000);
                knob.setValue(600);
                break;
            case "bpfIn":
                knob.setProperty("valMin", 100);//center freq
                knob.setProperty("valMax", 2000);
                knob.setValue(600);
                break;
            case "distortIn": //has to change all these
                knob.setProperty("valMin", scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax)); //distort level
                knob.setProperty("valMax", scale(1, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                knob.setValue(scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                break;
            case "skullIn":
                knob.setProperty("valMin", scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax)); //delay time
                knob.setProperty("valMax", scale(1, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                knob.setValue(scale(0, wet_inMin, wet_inMax, wet_outMin, wet_outMax));
                break;
            case "tremoloIn":
                knob.setProperty("valMin", 1); //tremolo frequency
                knob.setProperty("valMax", 30);
                knob.setValue(9);
                break;
            case "flangerIn":
                knob.setProperty("valMin", scale(0.01, 0.01, 1.2, 0, 100)); //flanger level
                knob.setProperty("valMax", scale(2, 0.01, 1.2, 0, 100));//goes between 0.01 and 1.2 represented by 0 to 100
                knob.setValue(scale(0.25, 0.01, 1.2, 0, 100));
                break;
            case "vibratoIn":
                knob.setProperty("valMin", 1); //?
                knob.setProperty("valMax", 20);
                knob.setValue(5);
                break;
            case "phaserIn":
                knob.setProperty("valMin", 1); //?
                knob.setProperty("valMax", 15);
                knob.setValue(1);
                break;
            case "reverbIn":
                knob.setProperty("valMin", 1); //?
                knob.setProperty("valMax", 40);
                knob.setValue(2);
                break;
            case "chorusIn":
                knob.setProperty("valMin", 1); //?
                knob.setProperty("valMax", 30);
                knob.setValue(2);
                break;
            case "bitcrusherIn":
                knob.setProperty("valMin", 1); //?
                knob.setProperty("valMax", 8);
                knob.setValue(4);
                break;
            case "chebIn":
                knob.setProperty("valMin", 1); //?
                knob.setProperty("valMax", 100);
                knob.setValue(30);
                break;
            case "wahIn":
                knob.setProperty("valMin", 100);
                knob.setProperty("valMax", 1000);
                knob.setValue(100);
                break;
            case "pannerIn":
                knob.setProperty("valMin", 1);
                knob.setProperty("valMax", 90);
                knob.setValue(2);
                break;
            case "pingpongdelayIn":
                knob.setProperty("valMin", 1);
                knob.setProperty("valMax", 100);
                knob.setValue(10);
                break;
            case "pitchshiftIn":
                knob.setProperty("valMin", -12);
                knob.setProperty("valMax", 12);
                knob.setValue(2);
                break;
            case "auto-filterIn":
                knob.setProperty("valMin", 50);
                knob.setProperty("valMax", 200);
                knob.setValue(50);
                break;
            case "duosynthIn":
                knob.setProperty("valMin", 1);
                knob.setProperty("valMax", 20);
                knob.setValue(5);
                break;
            case "fatsynthIn":
                knob.setProperty("valMin", 10);
                knob.setProperty("valMax", 100);
                knob.setValue(20);
                break;
            case "noiseIn":
                break;
            case "freqenvIn":
                break;
            default:
                throw "what button is this?? Knob error";
        }
    }
    else { throw "what side is this?? Knob creation side error"; }
}

function new_knob(elem, side) {
    //new_key_id = new_key_knob.id;
    var knob = pureknob.createKnob(40, 40);

    // Set properties.
    //knob.setProperty("colorBG", "#FF0000"); //color of the rest
    //knob.setProperty("colorMarkers", "#FF0000");
    knob.setProperty("colorFG", "#FF0000"); //color of the knob,
    knob.setProperty("angleStart", -0.75 * Math.PI);
    knob.setProperty("angleEnd", 0.75 * Math.PI);
    knob.setProperty("trackWidth", 0.4);
    knob.setProperty("key_id_id", elem.id);
    //console.log(knob._properties.key_id_id);
    knob_initialize(knob, elem, side);
    // Set initial value.
    var listener = function (knob, value) {
        //console.log(knob._properties.key_id_id);
        //if(current osc exists) //define this or it will throw an error without a button
        if (side == "left") { //WETNESS LEVELS //its on the right for some reason
            switch (knob._properties.key_id_id) {
                case "sinIn":
                    current_oscillator.osc.volume.value = value;
                    break;
                case "squareIn":
                    current_oscillator.osc.volume.value = value;
                    break;
                case "sawIn":
                    current_oscillator.osc.volume.value = value;
                    break;
                case "triangIn":
                    current_oscillator.osc.volume.value = value;
                    break;
                case "lpfIn":
                    current_oscillator.fx13.effect.Q.value = value; //quality of the filter, sounds cool and buggy when its high
                    break;
                case "hpfIn":
                    current_oscillator.fx14.effect.Q.value = value;
                    break;
                case "bpfIn":
                    current_oscillator.fx15.effect.Q.value = value;
                    break;
                case "distortIn":
                    current_oscillator.fx1.effect.wet.value = scale(value, wet_outMin, wet_outMax, wet_inMin, wet_inMax);
                    break;//wetness
                case "skullIn":
                    //current_oscillator.fx1.effect.wet.value = scale(value, wet_outMin, wet_outMax, wet_inMin, wet_inMax);
                    break;//wetness
                case "tremoloIn":
                    current_oscillator.fx18.wet.value = scale(value, wet_outMin, wet_outMax, wet_inMin, wet_inMax);//wetness
                    //tremolo.wet.value = scale(value, wet_outMin, wet_outMax, wet_inMin, wet_inMax);//wetness
                    //console.log(tremolo.wet.value);
                    break;//wetness
                case "flangerIn"://delay effect 
                    current_oscillator.fx17.effect.feedback.value = scale(value, wet_outMin, wet_outMax, wet_inMin, wet_inMax);
                    break;
                case "vibratoIn":
                    current_oscillator.fx3.effect.wet.value = scale(value, wet_outMin, wet_outMax, wet_inMin, wet_inMax);
                    break;
                case "phaserIn":
                    current_oscillator.fx2.wet.value = scale(value, wet_outMin, wet_outMax, wet_inMin, wet_inMax);
                    break;
                case "reverbIn":
                    current_oscillator.fx4.effect.wet.value = scale(value, wet_outMin, wet_outMax, wet_inMin, wet_inMax);
                    break;
                case "chorusIn":
                    current_oscillator.fx5.effect.wet.value = scale(value, wet_outMin, wet_outMax, wet_inMin, wet_inMax);
                    break;
                case "bitcrusherIn":
                    current_oscillator.fx6.effect.wet.value = scale(value, wet_outMin, wet_outMax, wet_inMin, wet_inMax);
                    break;
                case "chebIn":
                    current_oscillator.fx7.effect.wet.value = scale(value, wet_outMin, wet_outMax, wet_inMin, wet_inMax);
                    break;
                case "wahIn":
                    current_oscillator.fx8.effect.wet.value = scale(value, wet_outMin, wet_outMax, wet_inMin, wet_inMax);
                    break;
                case "pannerIn":
                    current_oscillator.fx9.wet.value = scale(value, wet_outMin, wet_outMax, wet_inMin, wet_inMax);
                    break;
                case "pingpongdelayIn":
                    current_oscillator.fx10.effect.wet.value = scale(value, wet_outMin, wet_outMax, wet_inMin, wet_inMax);
                    break;
                case "pitchshiftIn":
                    current_oscillator.fx11.effect.wet.value = scale(value, wet_outMin, wet_outMax, wet_inMin, wet_inMax);
                    break;
                case "auto-filterIn":
                    current_oscillator.fx12.effect.wet.value = scale(value, wet_outMin, wet_outMax, wet_inMin, wet_inMax);
                    break;
                case "duosynthIn":
                    current_oscillator.osc.frequency.value = value;
                    break;
                case "fatsynthIn":
                    current_oscillator.osc.frequency.value = value;
                    break;
                case "noiseIn":
                    current_oscillator.osc.volume.value = value;
                    break;
                case "freqenvIn":
                    //current_oscillator.fx3.effect.wet.value = scale(value, wet_outMin, wet_outMax, wet_inMin, wet_inMax);
                    break;
                default:
                    console.log(knob._properties.key_id_id);
                    throw "what button is this?? Knob error";
            }
        }
        else if (side == "right") { //EFFECT ALTER STUFF. on the left for some reason
            switch (knob._properties.key_id_id) {
                case "sinIn":
                    current_oscillator.osc.oscillator.partialCount = value;
                    break;
                case "squareIn":
                    current_oscillator.osc.oscillator.partialCount = value;
                    break;
                case "sawIn":
                    current_oscillator.osc.oscillator.partialCount = value;
                    break;
                case "triangIn":
                    current_oscillator.osc.oscillator.partialCount = value;
                    break;
                case "lpfIn":
                    current_oscillator.fx13.effect.frequency.value = value;
                    break;
                case "hpfIn":
                    current_oscillator.fx14.effect.frequency.value = value;
                    break;
                case "bpfIn":
                    current_oscillator.fx15.effect.frequency.value = value;
                    break;
                case "distortIn": //same mapping with wetness bc coincidence
                    current_oscillator.fx1.effect.distortion = scale(value, wet_outMin, wet_outMax, wet_inMin, wet_inMax);
                    break;
                case "skullIn":
                    break;
                case "tremoloIn":
                    current_oscillator.fx18.frequency.value = value;
                    //tremolo.frequency.value = value;
                    //console.log(tremolo.frequency.value)
                    break;
                case "flangerIn"://delay effect 
                    current_oscillator.fx17.effect.delayTime.value = scale(value, 100, 0, 0.01, 1.2);
                    console.log(current_oscillator.fx17.effect.delayTime.value);
                    break;
                case "vibratoIn":
                    current_oscillator.fx3.effect.frequency.value = value;
                    console.log(current_oscillator.fx3.effect.frequency.value);
                    break;
                case "phaserIn":
                    current_oscillator.fx2.frequency.value = value;
                    break;
                case "reverbIn":
                    current_oscillator.fx4.effect.decay = value;
                    break;
                case "chorusIn":
                    current_oscillator.fx5.effect.frequency.value = value;
                    console.log(current_oscillator.fx5.effect.frequency.value);
                    break;
                case "bitcrusherIn":
                    current_oscillator.fx6.effect.bits.value = value;
                    break;
                case "chebIn":
                    current_oscillator.fx7.effect.order = value;
                    break;
                case "wahIn":
                    current_oscillator.fx8.effect.order = value;
                    break;
                case "pannerIn":
                    current_oscillator.fx9.frequency.value = value;
                    break;
                case "pingpongdelayIn":
                    current_oscillator.fx10.effect.feedback.value = value / 100; //since it goes from 0.1 to 1 in actuality
                    break;
                case "pitchshiftIn":
                    current_oscillator.fx11.effect.pitch = value;
                    break;
                case "auto-filterIn":
                    current_oscillator.fx12.effect.baseFrequency = value;
                    break;
                case "duosynthIn":
                    current_oscillator.osc.vibratoRate.value = value;
                    break;
                case "fatsynthIn":
                    current_oscillator.osc.spread = value;
                    break;
                case "noiseIn":
                    break;
                case "freqenvIn":
                    break;
                default:
                    throw "what button is this?? Knob error";
            }
        }
        else { throw "what side button is this?? Knob error"; }

    };
    knob.addListener(listener);

    // Create element node.
    var node = knob.node();
    node.style.position = "absolute";

    node.style.top = "80px"; //we set the position of the knob
    if (side == "right") {
        node.style.left = "0px";
        node.id = elem.id + "_knob1";
    }
    if (side == "left") {
        node.style.left = "45px";
        node.id = elem.id + "_knob2";
    }

    // Add it to the DOM.
    elem.appendChild(node);
    return knob;
}

//END OF CLAUDIO THING







//START OF LEONE ENV THING
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var env = {
    attack: 1.0,
    decay: 1.0,
    sustain: 0.5,
    release: 1.5
};

var total;
var current;
//console.log(env.attack/total)

function drawAxis() {
    ctx.save();
    ctx.beginPath();
    ctx.lineWidth = 3;
    ctx.moveTo(60, 25);
    ctx.lineTo(60, 250);
    ctx.lineTo(480, 250);
    //total height = 200px
    //total width = 400px
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.closePath();
    drawArrowhead(490, 250, Math.PI / 2, 7);
    drawArrowhead(60, 15, 0, 7);

    // Max Amplitude Dotted Line
    ctx.beginPath();
    ctx.moveTo(48, 44);
    ctx.lineTo(480, 44);
    ctx.setLineDash([2, 2]);
    ctx.lineWidth = 2;
    ctx.strokeStyle = "white";
    ctx.stroke();
    ctx.closePath();
    ctx.restore();

    // Amp max
    ctx.font = "italic 18px serif";
    ctx.fillStyle = "white";
    ctx.fillText("Amp", 25, 48);
    ctx.font = "italic 12px serif";
    ctx.fillText("max", 46, 56);

    // Amplitude
    ctx.save();
    ctx.translate(50, 145);
    ctx.rotate(-Math.PI / 2);
    ctx.font = "bold 22px serif";
    ctx.fillText("Amplitude", 0, 0);
    ctx.restore();

    // 0
    ctx.font = "italic bold 30px serif";
    ctx.fillStyle = "white";
    ctx.fillText("0", 32, 274);

    // t
    ctx.font = "italic bold 30px serif";
    ctx.fillText("t", 484, 273);

    // key pressed
    ctx.beginPath();
    ctx.moveTo(60, 268);
    ctx.lineTo(60, 260);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "white";
    ctx.stroke();
    drawArrowhead(60, 252, 0, 5);
    ctx.font = "italic 12px serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("key", 59, 278);
    ctx.fillText("pressed", 59, 290);
    ctx.closePath();
}

function drawArrowhead(x, y, radians, size) {
    ctx.save();
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.rotate(radians);
    ctx.moveTo(0, 0);
    ctx.lineTo(size, size * 1.7);
    ctx.lineTo(-size, size * 1.7);
    ctx.fillStyle = "white";
    ctx.fill();
    ctx.closePath();
    ctx.restore();
}

function draw() {
    // reset variables
    total = env.attack + env.decay + env.release;
    current = 60;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Attack
    ctx.beginPath();
    ctx.moveTo(60, 250);
    ctx.lineTo(env.attack / total * 300 + current, 50);
    current += env.attack / total * 300;

    // Decay
    ctx.lineTo(env.decay / total * 300 + current, 250 - env.sustain * 200);
    current += env.decay / total * 300;

    // Sustain
    ctx.lineTo(current + 100, 250 - env.sustain * 200);
    current += 100;

    // Release
    ctx.lineTo(env.release / total * 300 + current, 250);
    current += env.release / total * 300;

    // stroke
    ctx.lineWidth = 6;
    ctx.strokeStyle = "lightgrey";
    ctx.stroke();
    ctx.closePath();

    // RELEASE LINES
    if (env.release != 0) {
        // vertical release
        ctx.beginPath();
        ctx.moveTo(current, 250);
        ctx.lineTo(current, 25);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "purple";
        if (env.release / total > .1) {
            // horizontal release
            ctx.moveTo(current - 10, 30);
            current -= env.release / total * 300;
            ctx.lineTo(current + 10, 30);
            ctx.stroke();
            ctx.closePath();
            // arrowhead
            drawArrowhead(current + env.release / total * 300 - 4, 30, Math.PI / 2, 9);
            if (env.release / total > .16) {
                // R
                ctx.font = "italic 20px serif";
                ctx.fillStyle = "purple";
                ctx.textAlign = "center";
                ctx.fillText("R", current + env.release / total * 150 - 2, 26);
            }
        } else {
            ctx.stroke();
            ctx.closePath();
            current -= env.release / total * 300;
        }
    }

    // key released
    ctx.beginPath();
    ctx.moveTo(current, 268);
    ctx.lineTo(current, 260);
    ctx.lineWidth = 3;
    ctx.strokeStyle = "white";
    ctx.stroke();
    drawArrowhead(current, 252, 0, 5);
    ctx.font = "italic 12px serif";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("key", current, 278);
    ctx.fillText("released", current, 290);
    ctx.closePath();

    // SUSTAIN LINES
    // vertical sustain black
    ctx.beginPath();
    ctx.moveTo(current, 250);
    ctx.lineTo(current, 25);
    ctx.stroke();
    ctx.closePath();
    if (env.sustain != 0) {
        ctx.beginPath();
        if (env.sustain > 0.1) {
            // vertical sustain blue
            ctx.moveTo(current - 50, 250);
            ctx.lineTo(current - 50, 260 - env.sustain * 200);
        }
        // horizontal sustain
        ctx.moveTo(current - 10, 250 - env.sustain * 200);
        current -= 100;
        ctx.lineTo(current + 10, 250 - env.sustain * 200);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "blue";
        ctx.stroke();
        ctx.closePath();
        if (env.sustain > 0.1) {
            // arrowhead
            drawArrowhead(current + 50, 254 - env.sustain * 200, 0, 9);
            // S
            ctx.font = "italic 20px serif";
            ctx.fillStyle = "blue";
            ctx.textAlign = "center";
            ctx.fillText("S", current + 40, 264 - env.sustain * 100);
        }
    } else {
        current -= 100;
    }

    // DECAY LINES
    if (env.decay != 0) {
        // vertical decay
        ctx.beginPath();
        ctx.moveTo(current, 250);
        ctx.lineTo(current, 25);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "#f60";
        if (env.decay / total > .1) {
            // horizontal decay
            ctx.moveTo(current - 10, 30);
            current -= env.decay / total * 300;
            ctx.lineTo(current + 10, 30);
            ctx.stroke();
            ctx.closePath();
            // arrowhead
            drawArrowhead(current + env.decay / total * 300 - 4, 30, Math.PI / 2, 9);
            if (env.decay / total > .16) {
                // D
                ctx.font = "italic 20px serif";
                ctx.fillStyle = "#f60";
                ctx.textAlign = "center";
                ctx.fillText("D", current + env.decay / total * 150 - 2, 26);
            }
        } else {
            ctx.stroke();
            ctx.closePath();
            current -= env.decay / total * 300;
        }
    }

    // ATTACK LINES
    if (env.attack != 0) {
        // vertical attack
        ctx.beginPath();
        ctx.moveTo(current, 250);
        ctx.lineTo(current, 25);
        ctx.lineWidth = 4;
        ctx.strokeStyle = "green";
        if (env.attack / total > .1) {
            // horizontal attack
            ctx.moveTo(current - 10, 30);
            current -= env.attack / total * 300;
            ctx.lineTo(current + 10, 30);
            ctx.stroke();
            ctx.closePath();
            // arrowhead
            drawArrowhead(current + env.attack / total * 300 - 4, 30, Math.PI / 2, 9);
            if (env.attack / total > .16) {
                // A
                ctx.font = "italic 20px serif";
                ctx.fillStyle = "green";
                ctx.textAlign = "center";
                ctx.fillText("A", current + env.attack / total * 150 - 2, 26);
            }
        } else {
            ctx.stroke();
            ctx.closePath();
            current -= env.attack / total * 300;
        }
    }

    drawAxis();
}
draw();

var attacking = false;
var envelope;
var osc;

function createEnvelope() {
    envelope = new Tone.AmplitudeEnvelope({
        attack: env.attack,
        decay: env.decay,
        sustain: env.sustain,
        release: env.release
    }).toMaster();

    osc = new Tone.Oscillator({
        partials: [3, 2, 1],
        type: "custom",
        frequency: "C4",
        volume: -8
    })
    //.connect(envelope)
    //.start();
}
createEnvelope();


$("#attackRange").on("change", function () {
    current_oscillator.osc.envelope.attack = Number($("#attackRange").val());
    env.attack = Number($("#attackRange").val());
    createEnvelope();
    draw();
    $("#attack").html($(this).val());

});

$("#decayRange").on("change", function () {
    current_oscillator.osc.envelope.decay = Number($("#decayRange").val());
    env.decay = Number($("#decayRange").val());
    createEnvelope();
    draw();
    $("#decay").html($(this).val());
});

$("#sustainRange").on("change", function () {
    current_oscillator.osc.envelope.sustain = Number($("#sustainRange").val());
    env.sustain = Number($("#sustainRange").val());
    createEnvelope();
    draw();
    $("#sustain").html($(this).val());
});

$("#releaseRange").on("change", function () {
    current_oscillator.osc.envelope.release = Number($("#releaseRange").val());
    env.release = Number($("#releaseRange").val());
    createEnvelope();
    draw();
    $("#release").html($(this).val());
});

$("#attackRange").on("mousemove", function () {
    current_oscillator.osc.envelope.attack = Number($("#attackRange").val());
    env.attack = Number($("#attackRange").val());
    draw();
    $("#attack").html($(this).val());
});

$("#decayRange").on("mousemove", function () {
    current_oscillator.osc.envelope.decay = Number($("#decayRange").val());
    env.decay = Number($("#decayRange").val());
    draw();
    $("#decay").html($(this).val());
});

$("#sustainRange").on("mousemove", function () {
    current_oscillator.osc.envelope.sustain = Number($("#sustainRange").val());
    env.sustain = Number($("#sustainRange").val());
    draw();
    $("#sustain").html($(this).val());
});

$("#releaseRange").on("mousemove", function () {
    current_oscillator.osc.envelope.release = Number($("#releaseRange").val());
    env.release = Number($("#releaseRange").val());
    draw();
    $("#release").html($(this).val());
});

document.getElementById("attackRange").style.backgroundColor = 'green';
document.getElementById("decayRange").style.backgroundColor = '#FF6600';
document.getElementById("sustainRange").style.backgroundColor = 'blue';
document.getElementById("releaseRange").style.backgroundColor = 'purple';

/*
          case "phaserIn":
          break;
          case "reverbIn":
          break;
          case "chorusIn":
          break;
          case "bitcrusherIn":
          break;
          case "chebIn":
          break;
          case "wahIn":
          break;
          case "pannerIn":
          break;
          case "pingpongdelayIn":
          break;
          case "pitchshiftIn":
          break;
          case "auto-filterIn":
          break;
          case "vibratoIn":
          break;
          case "duosynthIn":
          break;
          case "fatsynthIn":
          break;
          case "noiseIn":
          break;
          case "freqenvIn":
          break;*/