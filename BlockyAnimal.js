// Vertex shader program
// we added a uniform variable, u_Size to pass the desired size to
// webgl
var VSHADER_SOURCE = `
attribute vec4 a_Position;
uniform float u_Size;
uniform mat4 u_ModelMatrix;
uniform mat4 u_GlobalRotateMatrix;
attribute vec4 a_Color;   // NEW: Color attribute
varying vec4 v_Color;     // NEW: Pass color to fragment shader
void main() {
  gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position; 
  gl_PointSize = u_Size;
  v_Color = a_Color;  
}`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  varying vec4 v_Color;  // NEW: Received color from vertex shader
  uniform bool u_UseVertexColor;

  void main() {
    if (u_UseVertexColor) {
        gl_FragColor = v_Color; // Use per-vertex color for cubes
    } else {
        gl_FragColor = u_FragColor; // Use uniform color for other objects
    }
}`


// Global variables. They're already defined later but they're beneficial to have global because there is only one
// of each in our program
let canvas;
let gl;
let a_Position;
let g_globalAngle = 0;
let g_magAngle = 0;
let g_yellowAngle = 0;
let g_yellowAnimation = false;

// Animation angle variables
let g_frontLeftLegAngle = 0;
let g_frontRightLegAngle = 0;
let g_backLeftLegAngle = 0;
let g_backRightLegAngle = 0;
let g_neckAngle = 0;
let g_earAngle = 0;
let g_tailAngle = 0;
let g_headAngle = 0;

// Animation on/off variables
let g_frontLeftLegAnimate = false;
let g_frontRightLegAnimate = false;
let g_backLeftLegAnimate = false;
let g_backRightLegAnimate = false;
let g_neckAnimate = false;
let g_headAnimate = false;
let g_earAnimate = false;

// Mouse rotation control variables
let g_mouseXRotation = 0;  // For rotating the animal around X-axis
let g_mouseYRotation = 0;  // For rotating the animal around Y-axis

let u_FragColor;
let a_Color;
let u_UseVertexColor;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
// let u_Size;

function setUpWebGL() {
  // Retrieve <canvas> element
  // We got rid of the vars because it made a new local variable
  // instead of just using the global one
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  //gl = getWebGLContext(canvas);
  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  // gl will keep track of whats in front of what
  gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }
  
  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }
  
  // Get the storage location of a_Color 
  a_Color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_Color < 0) {
      console.log('Failed to get the storage location of a_Color');
      return;
  }
  console.log("a_Color location:", a_Color);

  // Uniform to switch between vertex colors and uniform colors
  u_UseVertexColor = gl.getUniformLocation(gl.program, 'u_UseVertexColor');
  if (!u_UseVertexColor) {
    console.log('Failed to get the storage location of u_UseVertexColor');
    return;
  }
  /*
  // Get the storage location of u_Size
  // connects u_size variable to local one
  u_Size = gl.getUniformLocation(gl.program, 'u_Size')
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }
  */
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y])
}

function renderAllShapes() {

  // Pass the matrix to u_GlobalRotateMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngle, 0, 1, 0);
  // Apply mouse-based rotation (g_mouseXRotation and g_mouseYRotation)
  globalRotMat.rotate(g_mouseXRotation, 1, 0, 0);  // Rotate the animal based on mouse X
  globalRotMat.rotate(g_mouseYRotation, 0, 1, 0);  // Rotate the animal based on mouse Y
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements)

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.viewport(0, 0, canvas.width, canvas.height);

  var identityMatrix = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityMatrix.elements);
 

  /*
  // draw body cube
  var body1 = new Cube();
  body1.color = [1.0,0.0,0.0,1.0];
  // These operations happen in REVERSE order
  body1.matrix.translate(-.25, -.75, 0.0);
  body1.matrix.rotate(-5,1,0,0);
  body1.matrix.scale(.5, .3, .5);  
  body1.render();

  // draw a left arm
  var leftArm = new Cube();
  leftArm.color = [1,1,0,1];
  // These operations happen in REVERSE order btw
  leftArm.matrix.setTranslate(0, -0.5, 0.0);
  leftArm.matrix.rotate(-5,1,0,0);
  leftArm.matrix.rotate(-g_yellowAngle, 0, 0, 1);
  // We want to save the place where the left arm starts before it gets moved around
  var yellowCoordinatesMat= new Matrix4(leftArm.matrix);
  leftArm.matrix.scale(0.25, .7, .5);
  leftArm.matrix.translate(-.5,0,0);
  leftArm.render();

  // Test box
  var box = new Cube();
  box.color = [1,0,1,1];
  console.log("color i want: 1,0,1,1");
  console.log("color i got: " + box.color);
  // Makes it so that box starts where leftarm is, so that way we can start box in the same position and then
  // simply move it to where we want it to be, proportionally to where the left arm is
  box.matrix = yellowCoordinatesMat;
  box.matrix.translate(0, .65, 0);
  box.matrix.rotate(g_magAngle,0,0,1);
  box.matrix.scale(.3,.3,.3);
  // Moves the box slightly forward so that the boxes don't overlap
  box.matrix.translate(-.5, 0, -0.001);
  box.render();
*/
  console.log("a_Position:", a_Position);
  console.log("u_FragColor:", u_FragColor);

  let body = new Cylinder(0.23, .9, 30);  // Radius, height, # of slices
  body.color = [1, 0.9725, 0.9058, 1]
  body.matrix.translate(-.3,0,0);
  body.render();

  let neck = new Cylinder(.16, .5, 30);
  neck.color = [1, 0.9725, 0.9058, 1];
  neck.matrix.translate(-.3, .1, .16);
  neck.matrix.rotate(-90, 1,0,0);
  neck.matrix.translate(0,.25,0);
  neck.matrix.rotate(-g_neckAngle, 1,0,0);
  neck.matrix.translate(0,-.25,0);
  //var neckMatrix = new Matrix4(neck.matrix);
  neck.render();

  // Head area
  let head = new Cube();
  head.color = [1, 0.9725, 0.9058, 1];
  head.matrix = new Matrix4(neck.matrix);
  head.matrix.translate(0, .4, 0);
  head.matrix.rotate(90, 0, 1, 0);
  head.matrix.rotate(90, 1, 0, 0);
  head.matrix.rotate(90, 0, 0, 1);
  head.matrix.translate(-.19, .36, .13);
  // Head anitmation stuff
  head.matrix.rotate(-g_headAngle, 1,0,0);
  head.matrix.translate(0,.04,0);
  head.matrix.scale(.4,.35,.45);
  head.render();

  let face = new Cube();
  face.color = [.93, 0.94, 0.9, 1];
  face.matrix.translate(-.42, .5, -.3);
  face.matrix = new Matrix4(head.matrix);
  face.matrix.translate(.1,.1,-.37);
  face.matrix.scale(.75,.8,.5);
  face.render();

  let snout = new Cube();
  snout.color = [0,0,0,1];
  snout.matrix = new Matrix4(face.matrix);
  //snout.matrix.translate(-.32, .57, -.35);
  //snout.matrix.scale(.05,.05,.05);
  snout.matrix.translate(.4, .18, -.1);  // Adjust as needed
  snout.matrix.scale(.15, .15, .15);
  snout.render();

  let leftEar = new Cube();
  leftEar.color = [1, 0.9725, 0.9058, 1];
  leftEar.matrix = new Matrix4(head.matrix);
  leftEar.matrix.translate(0.2, 0.9, .5);
  leftEar.matrix.rotate(-g_earAngle, 1,0,0);
  leftEar.matrix.scale(.15, .3, .1);
  leftEar.render();

  let RightEar = new Cube();
  RightEar.color = [1, 0.9725, 0.9058, 1];
  RightEar.matrix = new Matrix4(head.matrix);
  RightEar.matrix.translate(0.7, 0.9, .5);
  RightEar.matrix.rotate(-g_earAngle, 1,0,0);
  RightEar.matrix.scale(.15, .3, .1);
  RightEar.render();

  // Eyes
  let leftEye = new Cylinder(.035, 0.01, 30);
  leftEye.color = [1,1,1,1];
  leftEye.matrix = new Matrix4(head.matrix);
  leftEye.matrix.translate(-.36,.7,-.301);
  leftEye.matrix.scale(2.7,2.7,1);
  leftEye.matrix.translate(.24,-.055, -.09);
  leftEye.render();

  let rightEye = new Cylinder(.035, 0.01, 30);
  rightEye.color = [1,1,1,1];
  rightEye.matrix = new Matrix4(head.matrix);
  rightEye.matrix.translate(-.24,.7,-.301);
  rightEye.matrix.scale(2.7,2.7,1);
  rightEye.matrix.translate(.33,-.055,-.09);
  rightEye.render();
  
  let leftCornea = new Cylinder(.02, .01, 30);
  leftCornea.color = [0,0,0,1];
  leftCornea.matrix = new Matrix4(head.matrix);
  leftCornea.matrix.translate(-.36, .7, -.5);
  leftCornea.matrix.scale(2.7,2.7,1);
  leftCornea.matrix.translate(.24, -.055, 0.09);
  leftCornea.render();

  let rightCornea = new Cylinder(.02, .01, 30);
  rightCornea.color = [0,0,0,1];
  rightCornea.matrix = new Matrix4(head.matrix);
  rightCornea.matrix.translate(-.24, .7, -.302);
  rightCornea.matrix.scale(2.7,2.7,1);
  rightCornea.matrix.translate(.33, -.055, -0.1);
  rightCornea.render();


  // Legs
  // Front top and bottom left leg
  let frontLTLeg = new Cube();
  frontLTLeg.color = [1, 0.9725, 0.9058, 1];
  frontLTLeg.matrix.translate(-.51, -.35, .001);
  frontLTLeg.matrix.scale(.13, .25, .13);
  frontLTLeg.render();

  let frontLBLeg = new Cube();
  frontLBLeg.color = [1, 0.9725, 0.9058, 1];
  frontLBLeg.matrix.translate(-.51, -.59+0.25, .001);
  frontLBLeg.matrix.rotate(-g_frontLeftLegAngle, 1,0,0);
  frontLBLeg.matrix.translate(0,-0.25, 0);
  frontLBLeg.matrix.scale(.13, .25, .13);
  frontLBLeg.render();

  // Front top and bottom right leg
  let frontRTLeg = new Cube();
  frontRTLeg.color = [1, 0.9725, 0.9058, 1];
  frontRTLeg.matrix.translate(-.24, -.35, .001);
  frontRTLeg.matrix.scale(.13, .25, .13);
  frontRTLeg.render();

  let frontRBLeg = new Cube();
  frontRBLeg.color = [1, 0.9725, 0.9058, 1];
  frontRBLeg.matrix.translate(-.24, -.59+0.25, .001);
  frontRBLeg.matrix.rotate(-g_frontRightLegAngle, 1,0,0);
  frontRBLeg.matrix.translate(0,-0.25, 0);
  frontRBLeg.matrix.scale(.13, .25, .13);
  frontRBLeg.render();
  
  // Back top and bottom left leg
  let backLTLeg = new Cube();
  backLTLeg.color = [1, 0.9725, 0.9058, 1];
  backLTLeg.matrix.translate(-.51, -.35, .75);
  backLTLeg.matrix.scale(.13, .25, .13);
  backLTLeg.render();

  let backLBLeg = new Cube();
  backLBLeg.color = [1, 0.9725, 0.9058, 1];
  backLBLeg.matrix.translate(-.51, -.59+0.25, .75);
  backLBLeg.matrix.rotate(-g_backLeftLegAngle, 1,0,0);
  backLBLeg.matrix.translate(0,-0.25, 0);
  backLBLeg.matrix.scale(.13, .25, .13);
  backLBLeg.render();

  // Back top and bottom right leg
  let backRTLeg = new Cube();
  backRTLeg.color = [1, 0.9725, 0.9058, 1];
  backRTLeg.matrix.translate(-.24, -.35, .75);
  backRTLeg.matrix.scale(.13, .25, .13);
  backRTLeg.render();

  let backRBLeg = new Cube();
  backRBLeg.color = [1, 0.9725, 0.9058, 1];
  backRBLeg.matrix.translate(-.24, -.59+0.25, .75);
  backRBLeg.matrix.rotate(-g_backRightLegAngle, 1,0,0);
  backRBLeg.matrix.translate(0,-0.25, 0);
  backRBLeg.matrix.scale(.13, .25, .13);
  backRBLeg.render();
  
  // Tail
  let tail = new Cylinder(.04,.2, 30);
  tail.color = [1, 0.9725, 0.9058, 1];
  tail.matrix.translate(-.3, .2, .85)
  tail.matrix.rotate(-70, 1,0,0);
  tail.render();
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global variable which is the color chosen by the user
let g_selectedColor = [1.0,1.0,1.0,1.0];
// Global variable which is the user selected point size
let g_selectedSize=5;
// global variable that's the selected shape type
let g_selectedType=POINT;

function addActionsForHtmlUI() {
  // angle slider events
  document.getElementById('angleSlide').addEventListener('mousemove', function () {g_globalAngle = this.value; renderAllShapes(); })
  document.getElementById('frontLLSlide').addEventListener('mousemove', function () {g_frontLeftLegAngle = this.value; renderAllShapes(); })
  document.getElementById('frontRLSlide').addEventListener('mousemove', function () {g_frontRightLegAngle = this.value; renderAllShapes(); })
  document.getElementById('backLLSlide').addEventListener('mousemove', function () {g_backLeftLegAngle = this.value; renderAllShapes(); })
  document.getElementById('backRLSlide').addEventListener('mousemove', function () {g_backRightLegAngle = this.value; renderAllShapes(); })
  document.getElementById('neckSlide').addEventListener('mousemove', function () {g_neckAngle = this.value; renderAllShapes(); })
  document.getElementById('headSlide').addEventListener('mousemove', function () {g_headAngle = this.value; renderAllShapes(); })
  document.getElementById('earSlide').addEventListener('mousemove', function () {g_earAngle = this.value; renderAllShapes(); })

  // animation button events
  document.getElementById('frontLLAnimateOn').onclick = function () {g_frontLeftLegAnimate = true;}
  document.getElementById('frontLLAnimateOff').onclick = function () {g_frontLeftLegAnimate = false;}
  document.getElementById('frontRLAnimateOn').onclick = function () {g_frontRightLegAnimate = true;}
  document.getElementById('frontRLAnimateOff').onclick = function () {g_frontRightLegAnimate = false;}
  document.getElementById('backLLAnimateOn').onclick = function () {g_backLeftLegAnimate = true;}
  document.getElementById('backLLAnimateOff').onclick = function () {g_backLeftLegAnimate = false;}
  document.getElementById('backRLAnimateOn').onclick = function () {g_backRightLegAnimate = true;}
  document.getElementById('backRLAnimateOff').onclick = function () {g_backRightLegAnimate = false;}
  document.getElementById('neckAnimateOn').onclick = function () {g_neckAnimate = true;}
  document.getElementById('neckAnimateOff').onclick = function () {g_neckAnimate = false;}
  document.getElementById('headAnimateOn').onclick = function () {g_headAnimate = true;}
  document.getElementById('headAnimateOff').onclick = function () {g_headAnimate = false;}
  document.getElementById('earAnimateOn').onclick = function () {g_earAnimate = true;}
  document.getElementById('earAnimateOff').onclick = function () {g_earAnimate = false;}
}

function main() {

  // Set up canvas and gl variables
  setUpWebGL();

  // Set up GLSL shader program and connect GLSL variables
  connectVariablesToGLSL();
  
  // Set up actions for the html UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  //canvas.onmousedown  = click;
  //canvas.onmousemove  = function(ev) { if(ev.buttons == 1) { click(ev) } };

  // Mouse rotation control
  canvas.onmousemove  = function(ev) {
    // Convert mouse coordinates to GL coordinates
    let [x, y] = convertCoordinatesEventToGL(ev);

    // Map mouse X to X-axis rotation and mouse Y to Y-axis rotation
    g_mouseXRotation = x * 180;  // Range [-1, 1] to [-180, 180]
    g_mouseYRotation = y * 180;  // Range [-1, 1] to [-180, 180]

    // Optional: Clamp rotation values for limits
    g_mouseXRotation = Math.max(-90, Math.min(90, g_mouseXRotation));
    g_mouseYRotation = Math.max(-90, Math.min(90, g_mouseYRotation));

    // Redraw the animal with the new rotation values
    renderAllShapes();
  };

  // Specify the color for clearing <canvas>
  gl.clearColor(0.678, 0.847, 0.9019, 1.0);

  requestAnimationFrame(tick);
}

var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;

// Variables to keep track of fps and ms
var lastFrameTime = performance.now();
var fps = 0;

function tick() {
  // Save the current time
  g_seconds = performance.now()/1000.0-g_startTime; 

  // Debugging purposes
  //console.log(g_seconds);

  let now = performance.now();
  let deltaTime = now - lastFrameTime;
  lastFrameTime = now;

  fps = 1000/deltaTime;

  // Update FPS display
  document.getElementById("fpsCounter").innerText = `FPS: ${fps.toFixed(1)} | Frame Time: ${deltaTime.toFixed(2)} ms`;

  // Update all angles
  updateAnimationAngles();

  // Draw everything
  renderAllShapes();

  // Tell browser to update again
  requestAnimationFrame(tick);
}

function updateAnimationAngles() {
  if(g_frontLeftLegAnimate) {
    g_frontLeftLegAngle = (15*Math.sin(g_seconds));
  }
  if(g_frontRightLegAnimate) {
    g_frontRightLegAngle = (15*Math.sin(g_seconds));
  }
  if(g_backLeftLegAnimate) {
    g_backLeftLegAngle = (15*Math.sin(g_seconds));
  }
  if(g_backRightLegAnimate) {
    g_backRightLegAngle = (15*Math.sin(g_seconds));
  }
  if(g_neckAnimate) {
    g_neckAngle = (15*Math.sin(g_seconds));
  }
  if(g_headAnimate) {
    g_headAngle = (15*Math.sin(g_seconds));
  }
  if(g_earAnimate) {
    g_earAngle = (15*Math.sin(g_seconds));
  }
}

// Array of Points
var g_shapesList = [];

function click(ev) {
  //convert coordinates to correct format
  let [x,y] = convertCoordinatesEventToGL(ev);

  let point;
  if (g_selectedType == POINT) {
    point = new Point();
  } else if (g_selectedType == TRIANGLE) {
    point = new Triangle();
  } else {
    point = new Circle();
  }

  point.position = [x,y];
  point.color = g_selectedColor.slice();
  point.size = g_selectedSize;
  g_shapesList.push(point);

  renderAllShapes();
}
