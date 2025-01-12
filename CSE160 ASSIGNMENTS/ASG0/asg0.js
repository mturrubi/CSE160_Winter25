// DrawRectangle.js
function main() {
    // Retrieve <canvas> element                              <- (1)
    var canvas = document.getElementById('example');
    if (!canvas) {
        console.log('Failed to retrieve the <canvas> element');
        return;
    }

    // Get the rendering context for 2D graphics             <- (2)
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

}
function handleDrawEvent() {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var x1 = parseFloat(document.getElementById('xCoord').value);
    var y1 = parseFloat(document.getElementById('yCoord').value);

    var v1 = new Vector3([x1, y1, 0]);

    // Draw vector v1 in red
    ctx.save();
    ctx.translate(200, 200);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(v1.elements[0] * 20, -v1.elements[1] * 20);
    ctx.strokeStyle = "red";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    var x2 = parseFloat(document.getElementById('xCoord2').value);
    var y2 = parseFloat(document.getElementById('yCoord2').value);

    var v2 = new Vector3([x2, y2, 0]);

    // Draw vector v2 in blue
    ctx.save();
    ctx.translate(200, 200);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(v2.elements[0] * 20, -v2.elements[1] * 20);
    ctx.strokeStyle = "blue";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}

function handleDrawOperationEvent() {
    var canvas = document.getElementById('example');
    var ctx = canvas.getContext('2d');

    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    var x1 = parseFloat(document.getElementById('xCoord').value);
    var y1 = parseFloat(document.getElementById('yCoord').value);
    var x2 = parseFloat(document.getElementById('xCoord2').value);
    var y2 = parseFloat(document.getElementById('yCoord2').value);

    var v1 = new Vector3([x1, y1, 0]);
    var v2 = new Vector3([x2, y2, 0]);

    ctx.save();
    ctx.translate(200, 200);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(v1.elements[0] * 20, -v1.elements[1] * 20);
    ctx.strokeStyle = "rgb(255, 0, 0)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    ctx.save();
    ctx.translate(200, 200);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(v2.elements[0] * 20, -v2.elements[1] * 20);
    ctx.strokeStyle = "rgb(0, 0, 255)";
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();

    var operation = document.getElementById('operation').value;
    var scalar = parseFloat(document.getElementById('scalar').value);

    if (operation === "angle") {
        const angle = angleBetween(v1, v2);
        if (angle !== null) {
            console.log(`Angle between v1 and v2: ${angle.toFixed(2)} degrees`);
        }
    }
    if (operation === "area") {
        const area = areaTriangle(v1, v2);
        console.log(`Area of the triangle formed by v1 and v2: ${area.toFixed(2)}`);
    }
    // Draw the green vectors for the operation

    if (operation === "magnitude") {
        console.log("Magnitude of v1: " + v1.magnitude());
        console.log("Magnitude of v2: " + v2.magnitude());
    } else if (operation === "normalize") {
        try {
            var normV1 = new Vector3(v1.elements).normalize();
            var normV2 = new Vector3(v2.elements).normalize();
            drawVector(ctx, normV1, "rgba(0, 255, 0, 0.5)");
            drawVector(ctx, normV2, "rgba(0, 255, 0, 0.5)");
        } catch (error) {
            console.log(error.message);
        }
    } else if (operation === "add") {
        var v3 = new Vector3(v1.elements).add(v2);
        drawVector(ctx, v3, "rgba(0, 255, 0, 0.5)");
    } else if (operation === "sub") {
        var v3 = new Vector3(v1.elements).sub(v2);
        drawVector(ctx, v3, "rgba(0, 255, 0, 0.5)");
    } else if (operation === "mul") {
        var scalar = parseFloat(document.getElementById('scalar').value);
        var v3 = new Vector3(v1.elements).mul(scalar);
        var v4 = new Vector3(v2.elements).mul(scalar);
        drawVector(ctx, v3, "rgba(0, 255, 0, 0.5)");
        drawVector(ctx, v4, "rgba(0, 255, 0, 0.5)");
    } else if (operation === "div") {
        var scalar = parseFloat(document.getElementById('scalar').value);
        if (scalar === 0) {
            console.log("Division by zero is not allowed");
            return;
        }
        var v3 = new Vector3(v1.elements).div(scalar);
        var v4 = new Vector3(v2.elements).div(scalar);
        drawVector(ctx, v3, "rgba(0, 255, 0, 0.5)");
        drawVector(ctx, v4, "rgba(0, 255, 0, 0.5)");
    }
}

function angleBetween(v1, v2) {
    const dotProduct = Vector3.dot(v1, v2);
    const magV1 = v1.magnitude();
    const magV2 = v2.magnitude();

    const cosTheta = dotProduct / (magV1 * magV2);
    const angleRadians = Math.acos(cosTheta);
    const angleDegrees = angleRadians * (180 / Math.PI);

    return angleDegrees;
}
function areaTriangle(v1, v2) {
    let crossProduct = Vector3.cross(v1, v2);
    let area = crossProduct.magnitude() / 2;
    return area;
}
function drawVector(ctx, v, color) {
    ctx.save();
    ctx.translate(200, 200);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(v.elements[0] * 20, -v.elements[1] * 20);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.restore();
}
