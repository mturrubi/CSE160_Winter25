// Vertex shader program
var VSHADER_SOURCE = `
    attribute vec4 a_Position;
    uniform float u_PointSize;
    void main() {
        gl_Position = a_Position;
        gl_PointSize = u_PointSize;
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
let u_PointSize;
let shapesList = []; // Array to store all shapes
let currentColor = [1.0, 1.0, 1.0, 1.0]; // Default color is white
let currentSize = 10.0; // Default size

// Point Class
class Point {
    constructor(position, color, size) {
        this.position = position; // [x, y]
        this.color = color;       // [r, g, b, a]
        this.size = size;         // float
    }

    render() {
        // Pass the position, color, and size to the shaders
        gl.vertexAttrib3f(a_Position, this.position[0], this.position[1], 0.0);
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniform1f(u_PointSize, this.size);

        // Draw the point
        gl.drawArrays(gl.POINTS, 0, 1);
    }
}

function setupWebGL() {
    canvas = document.getElementById('webgl');
    gl = canvas.getContext('webgl', { preserveDrawingBuffer: true }) || canvas.getContext('experimental-webgl', { preserveDrawingBuffer: true });
    if (!gl) {
        console.log('Failed to get the rendering context for WebGL');
        return;
    }
}

function setupMouseEvents() {
    canvas.onmousedown = click;
    canvas.onmousemove = (ev) => {
        if (ev.buttons === 1) {
            click(ev);
        }
    };
}

function connectVariablesToGLSL() {
    if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
        console.log('Failed to initialize shaders.');
        return;
    }

    a_Position = gl.getAttribLocation(gl.program, 'a_Position');
    if (a_Position < 0) {
        console.log('Failed to get the storage location of a_Position');
        return;
    }

    u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
    if (!u_FragColor) {
        console.log('Failed to get the storage location of u_FragColor');
        return;
    }

    u_PointSize = gl.getUniformLocation(gl.program, 'u_PointSize');
    if (!u_PointSize) {
        console.log('Failed to get the storage location of u_PointSize');
        return;
    }
}

function setupColorSliders() {
    const redSlider = document.getElementById('red');
    const greenSlider = document.getElementById('green');
    const blueSlider = document.getElementById('blue');
    const redValue = document.getElementById('red-value');
    const greenValue = document.getElementById('green-value');
    const blueValue = document.getElementById('blue-value');

    function updateColor() {
        redValue.textContent = redSlider.value;
        greenValue.textContent = greenSlider.value;
        blueValue.textContent = blueSlider.value;

        currentColor[0] = parseInt(redSlider.value) / 255.0;
        currentColor[1] = parseInt(greenSlider.value) / 255.0;
        currentColor[2] = parseInt(blueSlider.value) / 255.0;
    }

    redSlider.addEventListener('input', updateColor);
    greenSlider.addEventListener('input', updateColor);
    blueSlider.addEventListener('input', updateColor);

    updateColor();
}

function setupSizeSlider() {
    const sizeSlider = document.getElementById('size');
    const sizeValue = document.getElementById('size-value');

    function updateSize() {
        sizeValue.textContent = sizeSlider.value;
        currentSize = parseFloat(sizeSlider.value);
    }

    sizeSlider.addEventListener('input', updateSize);

    updateSize();
}

function click(ev) {
    let [x, y] = convertCoordinatesEventToGL(ev);

    console.log(`Mouse clicked at (${x}, ${y})`); // Debugging log

    // Create a new Point object and add it to shapesList
    const point = new Point([x, y], [...currentColor], currentSize);
    shapesList.push(point);

    measurePerformance(renderAllShapes, "Rendering");
}

// Utility function to measure performance
function measurePerformance(fn, label) {
    const start = performance.now();
    fn();
    const end = performance.now();
    console.log(`${label} took ${end - start} ms`);
}

function convertCoordinatesEventToGL(ev) {
    let x = ev.clientX; // x coordinate of a mouse pointer
    let y = ev.clientY; // y coordinate of a mouse pointer
    let rect = ev.target.getBoundingClientRect();

    x = ((x - rect.left) - canvas.width / 2) / (canvas.width / 2);
    y = (canvas.height / 2 - (y - rect.top)) / (canvas.height / 2);

    return [x, y];
}

function renderAllShapes() {
    gl.clear(gl.COLOR_BUFFER_BIT);
    for (let shape of shapesList) {
        shape.render();
    }
}

function setupClearButton() {
    const clearButton = document.getElementById('clear-canvas');

    clearButton.addEventListener('click', () => {
        // Clear the shapes list
        shapesList = [];

        // Re-render the canvas (empty now)
        renderAllShapes();
    });
}

function main() {
    setupWebGL();
    connectVariablesToGLSL();
    setupColorSliders();
    setupSizeSlider();
    setupClearButton();
    setupMouseEvents();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    measurePerformance(renderAllShapes, "Rendering");
}