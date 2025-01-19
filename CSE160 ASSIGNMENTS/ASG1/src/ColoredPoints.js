// ColoredPoints.js
// Martin Turrubiates
// mturrubi@ucsc.edu
// Notes: I used gpt to try to handle some file location errors towards the end as for some reason the git could not locate
// any of my files for the life of it
// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_Size;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = u_Size;
    }`;

// Fragment shader program
var FSHADER_SOURCE = `
    precision mediump float;
    uniform vec4 u_FragColor;
    void main() {
        gl_FragColor = u_FragColor;
    }`;

let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;

function setupWebGL() {
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", {perserveDrawingBuffer: true})
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
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
    // Get the storage location of u_Size
    u_Size = gl.getUniformLocation(gl.program, 'u_Size');
    if (!u_Size) {
        console.log('Failed to get the storage location of u_Size');
        return;
    }
}

const POINT = 0;
const TRIANGLE = 1; 
const CIRCLE = 2;

let g_selectedColor = [
    document.getElementById('redSlide').value / 255,
    document.getElementById('greenSlide').value / 255,
    document.getElementById('blueSlide').value / 255,
    1.0
];

let g_selectedSize = 5;
let g_selectedType = POINT;
let g_selectedSegments = 10;


function addActionsForHtmlUI() {
    document.getElementById('pointButton').onclick = function () {
        g_selectedType = POINT;
    };
    document.getElementById('triButton').onclick = function () {
        g_selectedType = TRIANGLE;
    };
    document.getElementById('circleButton').onclick = function () {
        g_selectedType = CIRCLE;
    };
    document.getElementById('ClearButton').onclick = function () {
        g_shapesList = [];
        renderAllShapes();
    };
    document.getElementById('drawTreeButton').onclick = function () {
        const tree = new ChristmasTree();
        tree.render();
    };
    const sizeSlider = document.getElementById('sizeSlide');
    const sizeValue = document.getElementById('sizeValue');
    sizeSlider.addEventListener('input', function () {
        sizeValue.textContent = this.value; // Update label
        g_selectedSize = this.value;
    });

    // Segments slider
    const segmentsSlider = document.getElementById('segmentsSlide');
    const segmentsValue = document.getElementById('segmentsValue');
    segmentsSlider.addEventListener('input', function () {
        segmentsValue.textContent = this.value;
        g_selectedSegments = this.value;
    });

    // Red slider
    const redSlider = document.getElementById('redSlide');
    const redValue = document.getElementById('redValue');
    redSlider.addEventListener('input', function () {
        redValue.textContent = this.value;
        g_selectedColor[0] = this.value / 255;
    });

    // Green slider
    const greenSlider = document.getElementById('greenSlide');
    const greenValue = document.getElementById('greenValue');
    greenSlider.addEventListener('input', function () {
        greenValue.textContent = this.value;
        g_selectedColor[1] = this.value / 255;
    });

    // Blue slider
    const blueSlider = document.getElementById('blueSlide');
    const blueValue = document.getElementById('blueValue');
    blueSlider.addEventListener('input', function () {
        blueValue.textContent = this.value;
        g_selectedColor[2] = this.value / 255;
    });
}

function main() {
    // Set up canvas and gl variables
    setupWebGL();

    // Set up GLSL shader programs and connect GLSL variables
    connectVariablesToGLSL();

    addActionsForHtmlUI();

    // Register function (event handler) to be called on a mouse press
    canvas.onmousedown = click;

    canvas.onmousemove = function (ev) {
        if (ev.buttons == 1) {
            click(ev)
        }
    }
    // Specify the color for clearing <canvas>
    gl.clearColor(0.0, 0.0, 0.0, 1.0);

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

function click(ev) {
    // Extract the event click and return it in WebGL coordinates
    let [x, y] = convertCoordinatesEventToGL(ev);

    let shape;
    if (g_selectedType === POINT) {
        shape = new Point();
    } else if (g_selectedType === TRIANGLE) {
        // Create a triangle with a default size and dynamic color
        const size = g_selectedSize / 100; // Scale size down for triangle dimensions
        shape = new Triangle(
            [x - size, y - size, x + size, y - size, x, y + size], // Default triangle vertices
            g_selectedColor.slice() // Current color
        );
    } else if (g_selectedType === CIRCLE) {
        shape = new Circle();
        shape.segments = g_selectedSegments;
    }

    shape.position = [x, y];
    shape.color = g_selectedColor.slice();
    shape.size = g_selectedSize;
    g_shapesList.push(shape);

    // Draw every shape that is supposed to be in the canvas
    renderAllShapes();
}

// Extract the event click and return it in WebGL coordinates
function convertCoordinatesEventToGL(ev) {
    var x = ev.clientX; // x coordinate of a mouse pointer
    var y = ev.clientY; // y coordinate of a mouse pointer
    var rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return [x, y];
}

// Draw every shape that is supposed to be in the canvas
// Draw every shape that is supposed to be in the canvas
function renderAllShapes() {
    // Check the time at the start of this function
    var startTime = performance.now();

    // Clear <canvas>
    gl.clear(gl.COLOR_BUFFER_BIT);

    // Draw each shape in the list
    var len = g_shapesList.length;
    for (var i = 0; i < len; i++) {
        g_shapesList[i].render();
    }

    // Check the time at the end of the function, and show on the web page
    var duration = performance.now() - startTime;
    sendTextToHTML(
        "numdot: " + len + " ms: " + Math.floor(duration) +
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
