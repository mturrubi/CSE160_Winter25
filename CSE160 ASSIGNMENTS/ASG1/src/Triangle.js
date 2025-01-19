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
