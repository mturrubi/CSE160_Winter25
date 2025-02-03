// BlockyAnimals.js
// Martin Turrubiates
// mturrubi@ucsc.edu
// Notes: I used gpt to try to handle a naming error and a couple of small things i didnt see when i was following tuto
// for example i had varbody not var body and i was going insane for a solid 20 minutes also i asked it help me make a color dropper
// i wanted to add a way to change color without using a slider so it doesnt require color codes
// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform mat4 u_ModelMatrix;
    uniform mat4 u_GlobalRotateMatrix;
    void main() {
        gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    }`

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }`

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", {perserveDrawingBuffer: true})
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }

    // gl.enable(gl.DEPTH_TEST);
}

function connectVariablesToGLSL() {
    // Initialize shaders
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    // Get the storage location of a_Position
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

    u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
    if (!u_GlobalRotateMatrix) {
        console.log('Failed to get the storage location of u_GlobalRotateMatrix');
        return;
    }

    var identityM = new Matrix4();
    gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

let g_selectedSegments = 10;
let g_globalAngle = 0;
let g_yellowAngle = 0;
let g_magentaAngle = 0;
let g_handAngle = 0;
let g_yellowAnimation = false;
let g_magentaAnimation = false;
let g_handAnimation = false;
let g_mouseDown = false;
let g_globalAngleX = 0;
let g_globalAngleY = 0;
let g_lastMouseX = 0;
let g_lastMouseY = 0;
let g_yellowColor = [1.0, 1.0, 1.0, 1.0];
let g_magentaColor = [1.0, 1.0, 1.0, 1.0];
let g_bodyColor = [1.0, 1.0, 1.0, 1.0];
let g_handColor = [1.0, 1.0, 1.0, 1.0];


function addActionsForHtmlUI() {
    document.getElementById('animationYellowOnButton').addEventListener('click', function () {
        g_yellowAnimation = true;
    });
    document.getElementById('animationYellowOffButton').addEventListener('click', function () {
        g_yellowAnimation = false;
    });
    document.getElementById('animationMagentaOnButton').addEventListener('click', function () {
        g_magentaAnimation = true;
    });
    document.getElementById('animationMagentaOffButton').addEventListener('click', function () {
        g_magentaAnimation = false;
    });
    document.getElementById('animationHandOnButton').addEventListener('click', function () {
        g_handAnimation = true;
    });

    document.getElementById('animationHandOffButton').addEventListener('click', function () {
        g_handAnimation = false;
    });

    document.getElementById('bodyColor').addEventListener('input', function () {
        g_bodyColor = hexToRgbArray(this.value);
        renderAllShapes();
    });

    document.getElementById('yellowColor').addEventListener('input', function () {
        g_yellowColor = hexToRgbArray(this.value);
        renderAllShapes();
    });

    document.getElementById('magentaColor').addEventListener('input', function () {
        g_magentaColor = hexToRgbArray(this.value);
        renderAllShapes();
    });

    document.getElementById('handColor').addEventListener('input', function () {
        g_handColor = hexToRgbArray(this.value);
        renderAllShapes();
    });


    document.getElementById('yellowSlide').addEventListener('mousemove', function () {
        g_yellowAngle = this.value;
        document.getElementById('yellowValue').textContent = g_yellowAngle + "*";
        renderAllShapes();
    });

    document.getElementById('magentaSlide').addEventListener('mousemove', function () {
        g_magentaAngle = this.value;
        document.getElementById('magentaValue').textContent = g_magentaAngle + "*";
        renderAllShapes();
    });

}

function hexToRgbArray(hex) {
    let bigint = parseInt(hex.substring(1), 16);
    return [
        ((bigint >> 16) & 255) / 255,
        ((bigint >> 8) & 255) / 255,
        (bigint & 255) / 255,
        1.0
    ];
}
function main() {
    // Set up canvas and gl variables
    setupWebGL();

    // Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    addActionsForHtmlUI();

    addMouseControl(); 

    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    requestAnimationFrame(tick);
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {

    g_seconds = performance.now() / 1000.0 - g_startTime;

    updateAnimationAngles();

    renderAllShapes();

    requestAnimationFrame(tick);
}

function addMouseControl() {
    if (!canvas) {
        console.error("Canvas is undefined in addMouseControl()");
        return;
    }

    canvas.addEventListener("mousedown", function (event) {
        g_mouseDown = true;
        g_lastMouseX = event.clientX;
        g_lastMouseY = event.clientY;
    });

    canvas.addEventListener("mouseup", function () {
        g_mouseDown = false;
    });

    canvas.addEventListener("mousemove", function (event) {
        if (!g_mouseDown) return;

        let deltaX = event.clientX - g_lastMouseX;
        let deltaY = event.clientY - g_lastMouseY;

        g_globalAngleX += deltaY * 0.5;
        g_globalAngleY += deltaX * 0.5;

        g_lastMouseX = event.clientX;
        g_lastMouseY = event.clientY;

        renderAllShapes();
    });
}

function updateAnimationAngles() {
    if (g_yellowAnimation) {
        g_yellowAngle = (360 * Math.sin(g_seconds));
    }

    if (g_magentaAnimation) {
        g_magentaAngle = 360 * Math.sin(3 * g_seconds);
    }
    if (g_handAnimation) {
        g_handAngle = 360 * Math.sin(2 * g_seconds);
    }

}
function renderAllShapes() {
    // Check the time at the start of this function
    var startTime = performance.now();

    // Draw each shape in the list

    var globalRotMat = new Matrix4()
        .rotate(g_globalAngleX, 1, 0, 0)  // Rotate around X (up/down)
        .rotate(g_globalAngleY, 0, 1, 0); // Rotate around Y (left/right)
    gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    var body = new Cube(g_bodyColor);
    body.matrix.translate(-.25, -.75, 0.0);
    body.matrix.rotate(-5, 1, 0, 0);
    body.matrix.scale(0.5, .3, .5);
    body.render();

    var yellow = new Cube(g_yellowColor);
    yellow.matrix.setTranslate(0, -.5, 0.0);
    yellow.matrix.rotate(-5, 1, 0, 0);
    yellow.matrix.rotate(g_yellowAngle, 0, 0, 1);
    var yellowCoordinatesMat = new Matrix4(yellow.matrix);
    yellow.matrix.scale(0.25, .7, .5);
    yellow.matrix.translate(-.5, 0, 0);
    yellow.render();

    var magenta = new Cube(g_magentaColor);
    magenta.matrix = yellowCoordinatesMat;
    magenta.matrix.translate(0, 0.65, 0);
    magenta.matrix.rotate(g_magentaAngle, 0, 0, 1);
    magenta.matrix.scale(.3, .3, .3);
    magenta.matrix.translate(-.5, 0, -0.001);
    magenta.render();

    var handMatrix = new Matrix4(yellowCoordinatesMat);
    handMatrix.translate(0, 0.75, 0);
    handMatrix.rotate(g_handAngle, 0, 0, 1);
    handMatrix.scale(2.0, 2.0, 2.0);

    gl.uniformMatrix4fv(u_ModelMatrix, false, handMatrix.elements);
    drawPyramid3D(g_handColor)


    // Check the time at the end of the function, and show on the web page
    var duration = performance.now() - startTime;
    sendTextToHTML(
        " ms: " + Math.floor(duration) +
        " fps: " + Math.floor(1000 / duration),
        "stats"
    );
}

// Set the text of an HTML element
function sendTextToHTML(text, htmlID) {
    var htmlElem = document.getElementById(htmlID);
    if (!htmlElem) {
        console.log("Failed to get " + htmlID + " from HTML");
        return;
    }
    htmlElem.innerHTML = text;
}
