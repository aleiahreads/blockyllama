class Circle3D2 {
    constructor(segments = 20) {
        this.type = 'circle3d';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        this.segments = segments;
    }

    render() {
        let angleStep = (2 * Math.PI) / this.segments;
        let center = [0, 0, 0];

        gl.uniform1i(u_UseVertexColor, 0); // Disable vertex colors
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        for (let i = 0; i < this.segments; i++) {
            let angle1 = i * angleStep;
            let angle2 = (i + 1) * angleStep;

            let x1 = Math.cos(angle1);
            let y1 = Math.sin(angle1);
            let x2 = Math.cos(angle2);
            let y2 = Math.sin(angle2);

            drawTriangle3D([center[0], center[1], center[2], x1, y1, center[2], x2, y2, center[2]]);
        }
    }
}
