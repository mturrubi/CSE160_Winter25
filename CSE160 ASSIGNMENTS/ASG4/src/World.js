// World.js
// Martin Turrubiates
// mturrubi@ucsc.edu

var VSHADER_SOURCE = `
   precision mediump float;
   attribute vec4 a_Position;
   attribute vec2 a_UV;
   attribute vec3 a_Normal;
   varying vec2 v_UV;
   varying vec3 v_Normal;
   varying vec4 v_VertPos;
   uniform mat4 u_ModelMatrix;
   uniform mat4 u_NormalMatrix;
   uniform mat4 u_GlobalRotateMatrix;
   uniform mat4 u_ViewMatrix;
   uniform mat4 u_ProjectionMatrix;
   void main() {
      gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
      v_UV = a_UV;
      v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
      v_VertPos = u_ModelMatrix * a_Position;
   }`

// Fragment shader program ========================================
var FSHADER_SOURCE = `
    precision mediump float;
    varying vec2 v_UV;
    varying vec3 v_Normal;
    uniform vec4 u_FragColor;
    uniform sampler2D u_Sampler0;
    uniform sampler2D u_Sampler1;
    uniform int u_whichTexture;
    uniform vec3 u_lightPos;
    uniform vec3 u_cameraPos;
    varying vec4 v_VertPos;
    uniform bool u_lightOn;

    void main() {
      if(u_whichTexture == -3){
         gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);
      } else if(u_whichTexture == -2){
         gl_FragColor = u_FragColor;
      } else if (u_whichTexture == -1){
         gl_FragColor = vec4(v_UV, 1.0, 1.0);
      } else if(u_whichTexture == 0){
         gl_FragColor = texture2D(u_Sampler0, v_UV);
      } else if(u_whichTexture == 1){
         gl_FragColor = texture2D(u_Sampler1, v_UV);
      } else {
         gl_FragColor = vec4(1,.2,.2,1);
      }

      vec3 lightVector = u_lightPos-vec3(v_VertPos);
      float r = length(lightVector);
      vec3 L = normalize(lightVector);
      vec3 N = normalize(v_Normal);
      float nDotL = max(dot(N,L), 0.0);

      vec3 R = reflect(-L,N);

      vec3 E = normalize(u_cameraPos-vec3(v_VertPos));

      float specular = pow(max(dot(E,R), 0.0), 10.0)* 0.5;

      vec3 diffuse = vec3(gl_FragColor) * nDotL * 0.7;
      vec3 ambient = vec3(gl_FragColor) * 0.3;
      if(u_lightOn){
            gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
      }
    }`


var gl;
var canvas;
var a_Position;
var a_UV;
var a_Normal;
var u_FragColor;
var u_Size;
var u_ModelMatrix;
var u_NormalMatrix;
var u_ProjectionMatrix;
var u_ViewMatrix;
var u_GlobalRotateMatrix;
var u_Sampler0;
var u_Sampler1;
var u_whichTexture;
var u_lightPos;
var u_cameraPos;

var g_camera;

var gAnimalGlobalRotation = 0;
var g_jointAngle = 0;
var head_animation = 0;
var g_jointAngle2 = 0;
var g_animation = true;
var g_lightAnimation = true;
var g_lightDirection = 1;
var g_normalOn = false;
var g_lightOn = true;
var g_lightPos = [0, 1, 1];

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;
var g_lastFrameTime = performance.now();
var g_fps = 0;
var g_mouseDown = false;



function addActionsForHtmlUI() {
    document.getElementById('lightx').addEventListener('mousemove', function () { g_lightPos[0] = this.value / 100; renderScene(); });
    document.getElementById('lighty').addEventListener('mousemove', function () { g_lightPos[1] = this.value / 100; renderScene(); });
    document.getElementById('lightz').addEventListener('mousemove', function () { g_lightPos[2] = this.value / 100; renderScene(); });
    document.getElementById('animate_on').onclick = function () {
        g_Animation = true;
        g_lightAnimation = true;  // Light animation turns on too
    };

    document.getElementById('animate_off').onclick = function () {
        g_Animation = false;
        g_lightAnimation = false;  // Light animation turns off too
    };

    document.getElementById('normal_on').onclick = function () { g_normalOn = true; };
    document.getElementById('normal_off').onclick = function () { g_normalOn = false; };
    document.getElementById('light_on').onclick = function () { g_lightOn = true; };
    document.getElementById('light_off').onclick = function () { g_lightOn = false; };
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

function connectVariablesToGLSL() {
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

    a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
    if (a_Normal < 0) {
        console.log('Failed to get the storage location of a_Normal');
        return;
    }

    u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
    if (!u_whichTexture) {
        console.log('Failed to get u_whichTexture');
        return;
    }

    u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
    if (!u_lightOn) {
        console.log('Failed to get u_lightOn');
        return;
    }

    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get u_FragColor');
        return;
    }

    u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
    if (!u_lightPos) {
        console.log('Failed to get u_lightPos');
        return;
    }

    u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
    if (!u_cameraPos) {
        console.log('Failed to get u_cameraPos');
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

    u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
    if (!u_NormalMatrix) {
        console.log('Failed to get u_NormalMatrix');
        return;
    }

    u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
    if (!u_ProjectionMatrix) {
        console.log('Failed to get u_ProjectionMatrix');
        return;
    }

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

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
  gl.activeTexture(gl.TEXTURE0);
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);

  if (isPowerOf2(image.width) && isPowerOf2(image.height)) {
     gl.generateMipmap(gl.TEXTURE_2D);
  } else {

     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
     gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  }

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

    canvas.addEventListener("mouseup", function (ev) {
        if (ev.button === 2) {
            g_mouseDown = false;
        }
    });

    canvas.addEventListener("mousemove", function (ev) {
        if (g_mouseDown) {
            mouseCam(ev);
        }
    });

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
    let deltaTime = (now - g_lastFrameTime) / 1000; // Convert to seconds
    g_lastFrameTime = now;

    g_fps = Math.round(1 / deltaTime);
    document.getElementById('stats').innerText = `FPS: ${g_fps}`;

    g_seconds = now / 1000.0 - g_startTime;
    updateAnimationAngles();

    renderScene();

    setTimeout(() => {
        requestAnimationFrame(tick);
    }, 1000 / 60); // Limit to 60 FPS
}

function renderScene() {
    // Clear the screen
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Update Projection and View Matrices
    gl.uniformMatrix4fv(u_ProjectionMatrix, false, g_camera.projMat.elements);
    gl.uniformMatrix4fv(u_ViewMatrix, false, g_camera.viewMat.elements);

    // Global Rotation Matrix (Precomputed once per frame)
    var globalRotMat = new Matrix4().rotate(gAnimalGlobalRotation, 0, 1, 0);
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Normal Matrix Optimization (Compute Once)
    if (g_lightOn) {
        var normalMatrix = new Matrix4();
        normalMatrix.setInverseOf(g_camera.viewMat);
        normalMatrix.transpose();
        gl.uniformMatrix4fv(u_NormalMatrix, false, normalMatrix.elements);
    }

    // Lighting Data
    gl.uniform3fv(u_lightPos, g_lightPos);
    gl.uniform1i(u_lightOn, g_lightOn);
    gl.uniform3fv(u_cameraPos, g_camera.eye.elements);

    // Optimized draw call
    drawAllShapes();
}

function updateAnimationAngles() {
    if (g_animation) {
        head_animation = (head_animation + 2) % 360;

        if (g_lightAnimation) {
            g_lightPos[0] += 0.05 * g_lightDirection;
            if (g_lightPos[0] > 2 || g_lightPos[0] < -2) {
                g_lightDirection *= -1;
            }
        }
    }
}

