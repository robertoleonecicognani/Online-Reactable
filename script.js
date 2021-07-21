//js script

const endCont = document.getElementById("dest_cont");


keys = document.querySelectorAll('.keys');
keys.forEach((key, index) => key.classList.add('node'));


const main_out = document.getElementById("main_out");
const main_out_node = document.getElementById('main_out_node');
input_assignment(main_out);
main_out_node.classList.add('node');

nodes = document.querySelectorAll('.node');
num_nodes = nodes.length;
main_out.dataset.index = num_nodes - 1;


model = Array(num_nodes).fill(null);

buttons_eff = document.querySelectorAll('.button_effect');
buttons_eff.forEach(make_inactive);

function make_inactive(button) {
    button.classList.add('inactive');
  }

keys.forEach((key, index) => click_assignment(key, index, key.parentNode));
  

function click_assignment(key, index, source) {
  on = key.classList.toggle("waiting");
  if (on) {
    source = key.parentNode;
    key.onclick = function() {
      teleport_in(key, index, source);
    }
  }
  else {
    dragElement(key);
    const x_butt = document.getElementById(key.id+'_x');
    x_butt.onclick = function() {
      teleport_out(key, index, source);
    }
  }
}

function teleport_in(key, index, source) {  
  const new_key = key.cloneNode(true);
  new_key.id = key.id+'In';
  key.style.display = 'none';
  
  const button = new_key.children[0];
  if (button.classList.contains('button_effect')) {button.classList.toggle('inactive')};
  
  endCont.appendChild(new_key);
  new_key.dataset.index = index;
  new_key.classList.toggle("active");
  add_x(new_key);
  click_assignment(new_key, index, source);
  const [input, output] = in_out(new_key, index); //in_out connections
  output_assignment(output, index);
  input_assignment(input, index);
  if (key.classList.contains('key_osc')) {input.remove()};
  
  const knob1 = new_knob(new_key, 'left');
  const knob2 = new_knob(new_key, 'right');
}

function teleport_out (key, index, source) {
 
  //lines management
  const out_index = model.indexOf(index);
  if (out_index != -1) {
    const out_key = nodes[out_index];
    const line = document.getElementById(out_key.id+"In_line");
    remove_line(line, out_index);
  }
  
  const key_line = document.getElementById(key.id+"_line");
  if (key_line != null) {
    remove_line(key_line, index);
  }
  
  endCont.removeChild(key);
  
  nodes[index].style.display = 'inline-block';
}

//add_x function
function add_x (button) {
  const square = document.createElement("button");
  const x = document.createElement("i");
  
  square.classList.add("btn_out");
  x.classList.add("fa", "fa-close");
  button.appendChild(square);
  square.appendChild(x);
  square.id = button.id+'_x';
  return square;
}


//DRAGGING FUNCTION

function dragElement(elmnt) {
  
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
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
    elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
    elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
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
  input.id = key.id+"_in"; //coordinate function needs ids of objects
  input.dataset.index = index;
  const output = document.createElement("div");
  output.classList.add("connection", "out");
  output.id = key.id+"_out";
  output.dataset.index = index;
  key.appendChild(input);
  key.appendChild(output);
  return [input, output];
}

const outputs = document.querySelectorAll('.out');
const inputs = document.querySelectorAll('.in');
outputs.forEach((output, index) => function(output) {
  const ind = output.dataset.index;
  output_assignment(output, ind);
});

inputs.forEach((input, index) => function(input) {
  const ind = input.dataset.index;
  input_assignment(input, ind);
});



function output_assignment(output, index) {
  const key_out = output.parentNode;
  output.onclick = function() {
    const ready = output.classList.toggle("connected");
    if (ready) {
      output.classList.toggle("wait_conn", true);
    }
    else {
      output.classList.toggle("wait_conn", false);
      const line = document.getElementById(key_out.id+"_line");
      if (line != null) {remove_line(line, index)};
      
    }
  }
}


function input_assignment(input, index) {
  input.onclick = function () {
    const ready_outputs = document.getElementsByClassName("wait_conn");
    if(ready_outputs.length != 0) {
      if(input != main_out) {input.classList.toggle("connected")};
      const output = ready_outputs[0];
      output.classList.toggle("wait_conn");
      create_line(output, input);
    }
  }
}



function create_line(output, input) {
  const id1 = output.id;
  const id2 = input.id;
  const line = document.createElement("div");
  line.classList.add("line");
  line.dataset.connectout = "#"+id1;
  line.dataset.connectin = "#"+id2;
  const out_key = output.parentNode;
  out_key.appendChild(line);
  line.id = out_key.id+"_line";
  coordinate();
  
  const index1 = Number(output.dataset.index);
  const index2 = Number(input.dataset.index);
  
  model[index1] = index2;
  
  console.log('Connection between '+nodes[index1].id+' and '+nodes[index2].id);
}

function remove_line(line, index) {
  const output = document.getElementById(line.dataset.connectout.split("#").pop());
  const input = document.getElementById(line.dataset.connectin.split("#").pop());
  if (input!= main_out) {input.classList.remove("connected")};
  output.classList.remove("connected");
  
  const index2 = model[index];
  console.log('Removing connection between '+nodes[index].id+' and '+nodes[index2].id);
  line.remove();
  model[index] = null;
}


// CONNECTING LINES

const coordinate = function() {

  $(".line").each(function() {
    const box1= $(this).data("connectout");
    const box2 = $(this).data("connectin");
    const $b1 = $(box1);
    const $b2 = $(box2);
    
    const x1 = $b1.offset().left + $b1.width()/2;
    const y1 = $b1.offset().top + $b1.height()/2;
  
    const x2 = $b2.offset().left + $b2.width()/2;
    const y2 = $b2.offset().top + $b2.height()/2;

    moveLine(x1, y1, x2, y2, $(this)); 
  });

   
}


function moveLine(x1, y1, x2, y2, $line) {
    var length = Math.sqrt(((x1 - x2) * (x1 - x2)) + ((y1 - y2) * (y1 - y2)));
    var angle = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
    var transform = 'rotate(' + angle + 'deg)';

    var offsetX = (x1 > x2) ? x2 : x1;
    var offsetY = (y1 > y2) ? y2 : y1;
    
    $line.css({
        'position': 'absolute',
        '-webkit-transform': transform,
        '-moz-transform': transform,
        'transform': transform
      })
      .width(length)
      .offset({
        left: offsetX,
        top: offsetY
      });
}


//KNOBS

function new_knob(elem, side) {
  var knob = pureknob.createKnob(40, 40);

  // Set properties.
  //knob.setProperty("colorBG", "#FF0000"); //color of the rest
  //knob.setProperty("colorMarkers", "#FF0000");
  knob.setProperty("colorFG", "#FF0000"); //color of the knob,
  knob.setProperty("angleStart", -0.75 * Math.PI);
  knob.setProperty("angleEnd", 0.75 * Math.PI);

  knob.setProperty("trackWidth", 0.4);
  knob.setProperty("valMin", 0);
  knob.setProperty("valMax", 100);

  // Set initial value.
  knob.setValue(50);

  // Set properties.
  knob.setProperty("angleStart", -0.75 * Math.PI);
  knob.setProperty("angleEnd", 0.75 * Math.PI);

  knob.setProperty("trackWidth", 0.4);
  knob.setProperty("valMin", 0);
  knob.setProperty("valMax", 100);

  // Set initial value.
  knob.setValue(50);
  var listener = function (knob, value) {
    console.log(value);
  };

  knob.addListener(listener);

  // Create element node.
  var node = knob.node();
  node.style.position = 'absolute';
  
  node.style.top = '80px'; //we set the position of the knob
  if (side == 'right') {
    node.style.left = '0px';
    node.id = elem.id+'_knob1';
  };
  if (side == 'left') {
    node.style.left = '45px';
    node.id = elem.id+'_knob2';
  };
  

  // Add it to the DOM.
  elem.appendChild(node);
  return knob;
}