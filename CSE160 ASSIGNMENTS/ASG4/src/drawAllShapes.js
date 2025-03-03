// drawAllShapes.js
// Martin Turrubiates
// mturrubi@ucsc.edu
var g_map = []
var placedBlocks = [];

function drawMap() {
    for (let { cube } of placedBlocks) {
        cube.renderfast();
    }
}

function drawSheep() {

    let wool = [0.2, 0.6, 1.0, 1.0];
    let skin = [1, .91, .65, 1.0];
    let white = [1, 1, 1, 1];
    let black = [0, 0, 0, 1];
    let mouthColor = [1, .79, .69, 1];
    let tongueColor = [.89, .69, .64, 1];

    let cube = new Cube();
    cube.textureNum = g_normalOn ? -3 : -2;

    function setTransform(scale, translate) {
        cube.matrix.setIdentity();
        cube.matrix.rotate(170, 0, 1, 0);
        cube.matrix.rotate(-head_animation, 1, 0, 0);
        cube.matrix.scale(...scale);
        cube.matrix.translate(...translate);
    }

    cube.color = wool;
    setTransform([.25, 0.25, 0.35], [-.5, 0, -0.25]);
    cube.renderfast();

    setTransform([0.35, 0.35, 0.35], [-.5, 0.25, -1.25]);
    cube.renderfast();

    cube.color = skin;
    setTransform([0.30, 0.30, 0.03], [-.5, 0.35, -15.5]);
    cube.renderfast();

    cube.color = wool;
    setTransform([0.32, 0.071, 0.04], [-.5, 4.85, -11.95]);
    cube.renderfast();

    setTransform([0.05, 0.071, 0.04], [-3.01, 1.5, -11.95]);
    cube.renderfast();

    setTransform([0.05, 0.071, 0.04], [2.01, 1.5, -11.95]);
    cube.renderfast();

    cube.color = white;
    setTransform([0.1, 0.061, 0.04], [-1.5, 3.5, -11.95]);
    cube.renderfast();

    cube.color = black;
    setTransform([0.05, 0.061, 0.04], [-3.001, 3.5, -12]);
    cube.renderfast();

    cube.color = white;
    setTransform([0.1, 0.061, 0.04], [0.5, 3.5, -11.95]);
    cube.renderfast();

    cube.color = black;
    setTransform([0.05, 0.061, 0.04], [2.001, 3.5, -12.05]);
    cube.renderfast();

    cube.color = mouthColor;
    setTransform([0.1, 0.071, 0.04], [-0.47, 1.5, -11.95]);
    cube.renderfast();

    cube.color = tongueColor;
    setTransform([0.1, 0.035, 0.04], [-0.4701, 3, -12]);
    cube.renderfast();

    let legPositions = [
        [-1.15, -.25, -0.75], // Front Left
        [0.2, -.25, -0.75],   // Front Right
        [-1.15, -.25, 1.5],   // Back Left
        [0.2, -.25, 1.5]      // Back Right
    ];

    cube.color = wool;
    for (let pos of legPositions) {
        setTransform([.10, -0.10, 0.10], pos);
        cube.renderfast();
    }

    cube.color = skin;
    let lowerLegPositions = [
        [-1.25, -1.75, -.8], // Front Left
        [0.37, -1.75, -.8],  // Front Right
        [-1.25, -1.75, 2],   // Back Left
        [0.37, -1.75, 2]     // Back Right
    ];

    for (let pos of lowerLegPositions) {
        setTransform([0.08, 0.08, 0.08], pos);
        cube.renderfast();
    }

}


function drawAllShapes() {

    gl.uniform3fv(u_lightPos, g_lightPos);
    gl.uniform3fv(u_cameraPos, g_camera.eye.elements);
    gl.uniform1i(u_lightOn, g_lightOn);

    drawSheep();

    var sphere = new Sphere(10);  // Ensure we pass the number of subdivisions
    sphere.matrix.scale(0.5, 0.5, 0.5);
    sphere.matrix.translate(3, 0.75, -1.25);
    sphere.render();

    var light = new Cube();
    light.color = [2, 2, 0, 1];
    light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
    light.matrix.scale(-.1, -.1, -.1);
    light.matrix.translate(-.5, -.5, -.5);
    light.renderfast();

    var sky = new Cube();
    sky.color = [.6, .9, .95, 1];
    sky.textureNum = g_normalOn ? -3 : 0;
    sky.matrix.scale(-10, -10, -10);
    sky.matrix.translate(-.5, -.5, -.5);
    sky.render();

    var floor = new Cube();
    floor.color = [.2, .9, .4, 1];
    floor.textureNum = 1;
    floor.matrix.translate(0, -.25, 0);
    floor.matrix.scale(10, 0, 10);
    floor.matrix.translate(-.5, 0, -.5);
    floor.render();

}
