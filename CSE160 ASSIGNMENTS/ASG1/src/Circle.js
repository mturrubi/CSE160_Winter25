// Circle.js
// Martin Turrubiates
// mturrubi@ucsc.edu
class Circle {
    constructor() {
        this.type = 'circle';
        this.position = [0.0, 0.0, 0.0];
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.size = 5.0;
        this.segments = 10; // Default segments
    }

    render() {
        const xy = this.position;
        const rgba = this.color;
        const size = this.size;

        // Pass the color to the fragment shader
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);

        // Precompute triangle vertices
        const radius = size / 200.0;
        const vertices = [];
        const angleStep = (2 * Math.PI) / this.segments;

        for (let i = 0; i < this.segments; i++) {
            const angle1 = i * angleStep;
            const angle2 = (i + 1) * angleStep;

            vertices.push(
                xy[0], xy[1], // Center
                xy[0] + Math.cos(angle1) * radius, xy[1] + Math.sin(angle1) * radius, // Point 1
                xy[0] + Math.cos(angle2) * radius, xy[1] + Math.sin(angle2) * radius // Point 2
            );
        }

        // Draw triangles using the precomputed vertices
        for (let i = 0; i < vertices.length; i += 6) {
            drawTriangle([
                vertices[i], vertices[i + 1], // Center
                vertices[i + 2], vertices[i + 3], // Point 1
                vertices[i + 4], vertices[i + 5]  // Point 2
            ]);
        }
    }
}

