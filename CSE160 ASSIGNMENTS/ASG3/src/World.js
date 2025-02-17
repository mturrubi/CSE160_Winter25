// World.js
// Martin Turrubiates
// mturrubi@ucsc.edu
// Notes: I used gpt to try to handle a naming error and a couple of small things that the tuto didnt show somewhere a long the lines i got lsot on the tuto too
// even moving through it i decided to try to consult the internet then someone helped me who did take this class before i got very lost and a lot of my stuff is a bit broken
// i decided to just turn in what i have as the due date was approaching im not really sure where i went wrong im not sure how i can optimize this it runs 10+ fps on my computer
// but quickly drops once you move at all so i doubt that counts either way i hope the grading isnt too harsh
var VSHADER_SOURCE =`
   precision mediump float;
   attribute vec4 a_Position;
   attribute vec2 a_UV;
   varying vec2 v_UV;
   uniform mat4 u_ModelMatrix;
   uniform mat4 u_GlobalRotateMatrix;
   uniform mat4 u_ViewMatrix;
   uniform mat4 u_ProjectionMatrix;
   uniform bool u_Clicked; // Mouse is pressed
   void main() {
      if(u_Clicked){
         vec4(1,1,1,1);
      }
      gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
      v_UV = a_UV;
   }`

var FSHADER_SOURCE =`
    precision mediump float;
    varying vec2 v_UV;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform int u_whichTexture;
    void main() {
      if(u_whichTexture == -2){
         gl_FragColor = u_FragColor;                  // Use color
      } else if (u_whichTexture == -1){
         gl_FragColor = vec4(v_UV, 1.0, 1.0);         // Use UV debug color
      } else if(u_whichTexture == 0){
         gl_FragColor = texture2D(u_Sampler0, v_UV);  // Use texture0
      } else if(u_whichTexture == 1){
         gl_FragColor = texture2D(u_Sampler1, v_UV);  // Use texture1
      } else {
         gl_FragColor = vec4(1,.2,.2,1);              // Error, Red
      }
    }`


var gl;
var canvas;
var a_Position;
var a_UV;
var u_FragColor;
var u_Size;
var u_ModelMatrix;
var u_ProjectionMatrix;
var u_ViewMatrix;
var u_GlobalRotateMatrix;
var u_Sampler0;
var u_Sampler1;
var u_whichTexture;
var u_Clicked;

var g_camera;

var gAnimalGlobalRotation = 0;
var g_jointAngle = 0;
var head_animation = 0;
var g_jointAngle2 = 0;
var g_Animation = false;

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
var g_lastFrameTime = performance.now();
var g_fps = 0;
var g_mouseDown = false;



function addActionsForHtmlUI(){
   document.getElementById('camera').addEventListener('mousemove', function() { gAnimalGlobalRotation = this.value; renderScene();});
   document.getElementById('joint').addEventListener('mousemove', function() { g_jointAngle = this.value; renderScene();});
   document.getElementById('joint2').addEventListener('mousemove', function() { g_jointAngle2 = this.value; renderScene();});
   document.getElementById('animate_on').onclick = function() {g_Animation = true;};
   document.getElementById('animate_off').onclick = function() {g_Animation = false;};

}

function setupWebGL(){
   // Retrieve <canvas> element
   canvas = document.getElementById('webgl');
   if (!canvas) {
       console.log('Failed to retrieve the <canvas> element');
       return;
   }

   // Rendering context for WebGL
   gl = getWebGLContext(canvas);
   if(!gl){
       console.log('Failed to get the rendering context for WebGL');
       return;
   }

   gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL(){
   if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
       console.log('Failed to intialize shaders.');
       return;
   }

   a_Position = gl.getAttribLocation(gl.program, 'a_Position');
   if (a_Position < 0) {
       console.log('Failed to get the storage location of a_Position');
       return;
   }

   a_UV = gl.getAttribLocation(gl.program, 'a_UV');
   if (a_UV < 0) {
       console.log('Failed to get the storage location of a_UV');
       return;
   }

   u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
   if (!u_whichTexture) {
       console.log('Failed to get u_whichTexture');
       return;
   }

   u_Clicked = gl.getUniformLocation(gl.program, 'u_Clicked');
   if (!u_Clicked) {
       console.log('Failed to get u_Clicked');
       return;
   }

   u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
   if (!u_FragColor) {
       console.log('Failed to get u_FragColor');
       return;
   }

   u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
   if (!u_ModelMatrix) {
       console.log('Failed to get u_ModelMatrix');
       return;
   }

   u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
   if (!u_GlobalRotateMatrix) {
       console.log('Failed to get u_GlobalRotateMatrix');
       return;
   }

   u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
   if (!u_ViewMatrix) {
       console.log('Failed to get u_ViewMatrix');
       return;
   }

   u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
   if (!u_ProjectionMatrix) {
       console.log('Failed to get u_ProjectionMatrix');
       return;
   }

   // Get the storage location of u_Sampler0
   u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
   if (!u_Sampler0) {
     console.log('Failed to get the storage location of u_Sampler0');
     return false;
   }

   u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
   if (!u_Sampler1) {
     console.log('Failed to get the storage location of u_Sampler1');
     return false;
   }

   var identityM = new Matrix4();
   gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

function initTextures() {
   var image = new Image();
   var image1 = new Image();
   if (!image) {
      console.log('Failed to create the image object');
      return false;
   }
   if (!image1) {
      console.log('Failed to create the image1 object');
      return false;
   }
   image.onload = function(){ sendTextureToTEXTURE0(image); };
   image1.onload = function(){ sendTextureToTEXTURE1(image1); };

   image.src = 'grass.png';
   image1.src = 'sky.jpg';

   return true;
}

function isPowerOf2(value) {
  return (value & (value - 1)) == 0;
}

function sendTextureToTEXTURE0(image) {
   var texture = gl.createTexture();
   if(!texture){
      console.log('Failed to create the texture object');
      return false;
   }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
     gl.generateMipmap(gl.TEXTURE_2D);
  } else {
     // Set the texture parameters
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);


  console.log("Finished loadTexture");
}

function sendTextureToTEXTURE1(image) {
   var texture = gl.createTexture();
   if(!texture){
      console.log('Failed to create the texture object');
      return false;
   }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
     gl.generateMipmap(gl.TEXTURE_2D);
  } else {
     // Set the texture parameters
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler1, 1);


  console.log("Finished loadTexture1");
}

function main() {
    setupWebGL();
    if (!gl) {
        console.error("WebGL failed to initialize.");
        return;
    }

    connectVariablesToGLSL();
    addActionsForHtmlUI();

    g_camera = new Camera();
    document.onkeydown = keydown;

    // Listen for mouse clicks to place/remove blocks
    canvas.addEventListener("mousedown", function (ev) {
        if (ev.button === 0) { // Left Click
            if (!g_mouseDown) { // Only place blocks if not dragging
                placeBlock(ev.clientX, ev.clientY);
            }
        } else if (ev.button === 2) { // Right Click
            g_mouseDown = true; // Enable dragging for camera movement
        }
    });

    // Stop camera movement when releasing right-click
    canvas.addEventListener("mouseup", function (ev) {
        if (ev.button === 2) {
            g_mouseDown = false;
        }
    });

    // Allow camera movement when dragging right-click
    canvas.addEventListener("mousemove", function (ev) {
        if (g_mouseDown) {
            mouseCam(ev);
        }
    });

    // Prevent right-click menu from appearing
    canvas.addEventListener("contextmenu", (ev) => ev.preventDefault());

    initTextures();
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    requestAnimationFrame(tick);
}



function check(ev) {
    var x = ev.clientX, y = ev.clientY;
    var rect = ev.target.getBoundingClientRect();
    var x_in_canvas = x - rect.left, y_in_canvas = rect.bottom - y;

    gl.uniform1i(u_Clicked, 1); // Enable click detection in shaders
    var pixels = new Uint8Array(4);
    gl.readPixels(x_in_canvas, y_in_canvas, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
    gl.uniform1i(u_Clicked, 0); // Reset click detection

    if (pixels[0] == 255) {
        removeBlock(x_in_canvas, y_in_canvas); // Break block if it exists
    } else {
        placeBlock(x_in_canvas, y_in_canvas); // Place block at clicked location
    }
}

function placeBlock(mouseX, mouseY) {
    var rect = canvas.getBoundingClientRect();

    // Convert mouse position to WebGL coordinates (-1 to 1)
    var x = ((mouseX - rect.left) / canvas.width) * 2 - 1;
    var y = 1 - ((mouseY - rect.top) / canvas.height) * 2;

    // Convert to grid coordinates (centered at 0)
    var gridX = Math.round(x * 16);
    var gridY = Math.round(y * 16);

    // Prevent placing duplicate blocks
    for (let block of placedBlocks) {
        if (block.x === gridX && block.y === gridY) return;
    }

    let newBlock = new Cube();
    newBlock.color = [0.9, 0.6, 0.3, 1.0]; // Color for placed blocks
    newBlock.textureNum = -2;
    newBlock.matrix.scale(0.1, 0.1, 0.1); // Smaller than fence
    newBlock.matrix.translate(gridX, -0.15, gridY);

    placedBlocks.push({ cube: newBlock, x: gridX, y: gridY });
    renderScene();
}



function removeBlock(mouseX, mouseY) {
    var rect = canvas.getBoundingClientRect();
    var x = ((mouseX - rect.left) / canvas.width) * 2 - 1;
    var y = 1 - ((mouseY - rect.top) / canvas.height) * 2;

    var gridX = Math.round(x * 16);
    var gridY = Math.round(y * 16);

    // Remove block from placedBlocks list
    placedBlocks = placedBlocks.filter(block => !(block.x === gridX && block.y === gridY));
    renderScene();
}






function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return [x, y];
}


function mouseCam(ev) {
    if (!g_mouseDown) return; 

    let coord = convertCoordinatesEventToGL(ev);
    if (coord[0] < 0.5) {
        g_camera.panMLeft(coord[0] * -10);
    } else {
        g_camera.panMRight(coord[0] * -10);
    }

    renderScene(); 
}


function keydown(ev){
   if(ev.keyCode==39 || ev.keyCode == 68){ // D
      g_camera.right();
   } else if (ev.keyCode==37 || ev.keyCode == 65){ // A
      g_camera.left();
   } else if (ev.keyCode==38 || ev.keyCode == 87){ // W
      g_camera.forward();
   } else if (ev.keyCode==40 || ev.keyCode == 83){ // S
      g_camera.back();
   } else if (ev.keyCode==81){ // Q
      g_camera.panLeft();
   } else if (ev.keyCode==69){ // E
      g_camera.panRight();
   }
   renderScene();
}

function tick() {
    let now = performance.now();
    let deltaTime = (now - g_lastFrameTime) / 1000; // Seconds
    g_lastFrameTime = now;

    g_fps = Math.round(1 / deltaTime);

    document.getElementById('stats').innerText = `FPS: ${g_fps}`;

    g_seconds = now / 1000.0 - g_startTime;
    updateAnimationAngles();
    renderScene();
    requestAnimationFrame(tick);
}


function renderScene(){
   var projMat = g_camera.projMat;
   gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

   // Pass the view matrix
   var viewMat = g_camera.viewMat;
   gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

   // Pass the matrix to u_ModelMatrix attribute
   var globalRotMat = new Matrix4().rotate(gAnimalGlobalRotation, 0,1,0);
   gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

   // Clear <canvas>
   gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
   gl.clear(gl.COLOR_BUFFER_BIT);

   drawAllShapes();
}

function updateAnimationAngles(){
   if(g_Animation){
      g_jointAngle = 10*Math.sin(g_seconds);
      head_animation = 15*Math.sin(g_seconds);
   }
}
