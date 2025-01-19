// Tree.js
// Martin Turrubiates
// mturrubi@ucsc.edu
class ChristmasTree {
    constructor() {
        this.shapes = [];
        this.initShapes();
    }

    initShapes() {
        // Tree Body (3 green triangles)
        this.shapes.push(new Triangle([-0.2, 0.2, 0.2, 0.2, 0.0, 0.6], [0.0, 0.5, 0.0, 1.0])); // Top part
        this.shapes.push(new Triangle([-0.3, 0.0, 0.3, 0.0, 0.0, 0.4], [0.0, 0.5, 0.0, 1.0])); // Middle part
        this.shapes.push(new Triangle([-0.4, -0.2, 0.4, -0.2, 0.0, 0.2], [0.0, 0.5, 0.0, 1.0])); // Bottom part

        // Tree Stump (brown square, touching the floor)
        this.shapes.push(new Triangle([-0.15, -0.2, 0.15, -0.2, -0.15, -0.6], [0.55, 0.27, 0.07, 1.0])); // Left triangle of stump
        this.shapes.push(new Triangle([0.15, -0.2, 0.15, -0.6, -0.15, -0.6], [0.55, 0.27, 0.07, 1.0])); // Right triangle of stump

        // Presents (rectangles made from two triangles each)
        // Left present (red)
        this.shapes.push(new Triangle([-0.5, -0.4, -0.3, -0.4, -0.5, -0.6], [1.0, 0.0, 0.0, 1.0]));
        this.shapes.push(new Triangle([-0.3, -0.4, -0.3, -0.6, -0.5, -0.6], [1.0, 0.0, 0.0, 1.0]));

        // Right present (blue)
        this.shapes.push(new Triangle([0.3, -0.4, 0.5, -0.4, 0.3, -0.6], [0.0, 0.0, 1.0, 1.0]));
        this.shapes.push(new Triangle([0.5, -0.4, 0.5, -0.6, 0.3, -0.6], [0.0, 0.0, 1.0, 1.0]));

        // Small Stars on top of the presents
        // Left star (yellow, above red present)
        this.shapes.push(new Triangle([-0.4, -0.35, -0.38, -0.3, -0.42, -0.3], [1.0, 1.0, 0.0, 1.0])); // Top bow
        this.shapes.push(new Triangle([-0.4, -0.35, -0.38, -0.4, -0.42, -0.4], [1.0, 1.0, 0.0, 1.0])); // Bottom bow
        this.shapes.push(new Triangle([-0.43, -0.35, -0.44, -0.33, -0.42, -0.35], [1.0, 1.0, 0.0, 1.0])); // Left bow
        this.shapes.push(new Triangle([-0.37, -0.35, -0.36, -0.33, -0.38, -0.35], [1.0, 1.0, 0.0, 1.0])); // Right bow

        // Right star (yellow, above blue present)
        this.shapes.push(new Triangle([0.4, -0.35, 0.38, -0.3, 0.42, -0.3], [1.0, 1.0, 0.0, 1.0])); // Top bow
        this.shapes.push(new Triangle([0.4, -0.35, 0.38, -0.4, 0.42, -0.4], [1.0, 1.0, 0.0, 1.0])); // Bottom bow
        this.shapes.push(new Triangle([0.37, -0.35, 0.36, -0.33, 0.38, -0.35], [1.0, 1.0, 0.0, 1.0])); // Left bow
        this.shapes.push(new Triangle([0.43, -0.35, 0.44, -0.33, 0.42, -0.35], [1.0, 1.0, 0.0, 1.0])); // Right bow

        // Star on top of the tree
        this.shapes.push(new Triangle([-0.05, 0.65, 0.05, 0.65, 0.0, 0.7], [1.0, 1.0, 0.0, 1.0])); // Top
        this.shapes.push(new Triangle([-0.05, 0.65, 0.0, 0.6, 0.05, 0.65], [1.0, 1.0, 0.0, 1.0])); // Bottom

        // Floor (white rectangle at the bottom)
        this.shapes.push(new Triangle([-1.0, -0.6, 1.0, -0.6, -1.0, -0.8], [1.0, 1.0, 1.0, 1.0])); // Left triangle
        this.shapes.push(new Triangle([1.0, -0.6, 1.0, -0.8, -1.0, -0.8], [1.0, 1.0, 1.0, 1.0])); // Right triangle
    }

    render() {
        // Clear the canvas
        gl.clear(gl.COLOR_BUFFER_BIT);

        // Render all shapes
        this.shapes.forEach((shape) => {
            shape.render();
        });
    }
}


