// Triangle.js
// Martin Turrubiates
// mturrubi@ucsc.edu
class Triangle {
    constructor(vertices, color) {
        this.type = 'triangle';
        this.vertices = vertices; // Custom vertices for the triangle
        this.color = color; // Color of the triangle
    }

    render() {
        const rgba = this.color;

        // Pass the color of the triangle to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Draw the triangle using its vertices
        drawTriangle(this.vertices);
    }
}

function drawTriangle(vertices) {
    const n = 3; // Number of vertices

    // Create a buffer object
    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to the a_Position variable
    gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawTriangle3D(vertices) {
    const n = 3; // Number of vertices

    // Create a buffer object
    const vertexBuffer = gl.createBuffer();
    if (!vertexBuffer) {
        console.log('Failed to create the buffer object');
        return -1;
    }

    // Bind the buffer object to target
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

    // Write data into the buffer object
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.DYNAMIC_DRAW);

    // Assign the buffer object to the a_Position variable
    gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);

    // Enable the assignment to a_Position variable
    gl.enableVertexAttribArray(a_Position);

    // Draw the triangle
    gl.drawArrays(gl.TRIANGLES, 0, n);
}

function drawPyramid3D(baseColor) {
    const darker = baseColor.map((c, i) => (i < 3 ? c * 0.8 : c));  // 80% brightness
    const medium = baseColor.map((c, i) => (i < 3 ? c * 0.9 : c));  // 90% brightness

    const faces = [
        { color: baseColor, vertices: [-0.5, 0, -0.5, 0.5, 0, -0.5, 0.5, 0, 0.5] },
        { color: baseColor, vertices: [-0.5, 0, -0.5, 0.5, 0, 0.5, -0.5, 0, 0.5] },
        { color: darker, vertices: [-0.5, 0, -0.5, 0.5, 0, -0.5, 0, 0.5, 0] },
        { color: medium, vertices: [0.5, 0, -0.5, 0.5, 0, 0.5, 0, 0.5, 0] },
        { color: darker, vertices: [0.5, 0, 0.5, -0.5, 0, 0.5, 0, 0.5, 0] },
        { color: medium, vertices: [-0.5, 0, 0.5, -0.5, 0, -0.5, 0, 0.5, 0] }
    ];

    faces.forEach(face => {
        gl.uniform4fv(u_FragColor, face.color);

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(face.vertices), gl.STATIC_DRAW);

        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.drawArrays(gl.TRIANGLES, 0, face.vertices.length / 3);
    });
}


