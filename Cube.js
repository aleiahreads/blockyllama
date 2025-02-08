/*class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0,1.0,1.0,1.0];
        this.matrix = new Matrix4();
    }

    render() {
        var rgba = this.color;

        // Pass color of a point to u_FragColor variable
        gl.uniform4f(u_FragColor, rgba[0], rgba[1], rgba[2], rgba[3]);
        
        // Pass matrix.elements 
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        // Front of Cube
        drawTriangle3D( [0.0,0.0,0.0, 1.0,1.0,0.0, 1.0,0,0] );
        drawTriangle3D( [0.0,0.0,0.0, 0.0,1.0,0.0, 1.0,1.0,0.0] );

        // Pass the color of a ppoint to u_FragColor uniform variable
        // This makes it so the color is slightly darker and so we can fake lighting
        gl.uniform4f(u_FragColor, rgba[0]*.9, rgba[1]*.9, rgba[2]*.9, rgba[3]);

        // Top of cube
        drawTriangle3D( [0,1,0,  0,1,1,  1,1,1]);
        drawTriangle3D( [0,1,0,  1,1,1,  1,1,0]);
        // Other sides of cube: bottom, left, right, back
        // do them yourself :((

        // Right side of cube
        drawTriangle3D( [1,1,0,  1,1,1,  1,0,0] );
        drawTriangle3D( [1,0,0,  1,1,1, 1,0,1] );

        // Left side of cube
        drawTriangle3D( [0,1,0,  0,0,0, 0,0,1] );
        drawTriangle3D( [0,1,0,  0,0,1, 0,1,1] );

        // Bottom of cube
        drawTriangle3D( [0,0,0, 1,0,1, 1,0,0] );
        drawTriangle3D( [0,0,0, 1,0,1, 0,0,1] );

        //Back of cube
        drawTriangle3D( [0,1,1,  1,0,1,  0,0,1] )
        drawTriangle3D( [0,1,1,  1,0,1,  1,1,1] )
    }

}
*/
/*
class Cube {
    constructor() {
        this.type = 'cube';
        this.color = [1.0, 1.0, 1.0, 1.0];
        this.matrix = new Matrix4();
        
        if (!Cube.vertexBuffer) {
            Cube.initVertexBuffer();
        }
    }

    static initVertexBuffer() {
        // Define cube vertices (two triangles per face)
        Cube.vertices = new Float32Array([
            // Front face
            0,0,0,  1,1,0,  1,0,0,  
            0,0,0,  0,1,0,  1,1,0,

            // Top face
            0,1,0,  0,1,1,  1,1,1,  
            0,1,0,  1,1,1,  1,1,0,

            // Right face
            1,1,0,  1,1,1,  1,0,0,  
            1,0,0,  1,1,1,  1,0,1,

            // Left face
            0,1,0,  0,0,0,  0,0,1,  
            0,1,0,  0,0,1,  0,1,1,

            // Bottom face
            0,0,0,  1,0,1,  1,0,0,  
            0,0,0,  1,0,1,  0,0,1,

            // Back face
            0,1,1,  1,0,1,  0,0,1,  
            0,1,1,  1,0,1,  1,1,1
        ]);

        Cube.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, Cube.vertices, gl.STATIC_DRAW);
    }

    render() {
        gl.uniform4f(u_FragColor, this.color[0], this.color[1], this.color[2], this.color[3]);
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);

        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);

        gl.drawArrays(gl.TRIANGLES, 0, Cube.vertices.length / 3);
    }
}

class Cube {
    constructor() {
        this.type = 'cube';
        this.matrix = new Matrix4();
        this._color = [1.0, 1.0, 1.0, 1.0]; // Default: White

        if (!Cube.vertexBuffer) {
            Cube.initBuffers();
        }

        this.updateFaceColors(); // Generate default shaded colors
    }

    // Getter for color (returns base color)
    get color() {
        return this._color;
    }

    // Setter for color (updates shaded colors)
    set color(newColor) {
        this._color = newColor;
        this.updateFaceColors();
    }

    updateFaceColors() {
        let shades = [1.0, 0.85, 0.7, 0.55, 0.4, 0.25]; // Darker shades
        this.faceColors = shades.map(s => this._color.map((c, i) => (i < 3 ? c * s : c))); // Scale RGB, keep Alpha
        this.updateColorBuffer();
    }

    updateColorBuffer() {
        let colorArray = [];
        for (let i = 0; i < this.faceColors.length; i++) {
            for (let j = 0; j < 6; j++) { // 6 vertices per face
                colorArray.push(...this.faceColors[i]);
            }
        }
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorArray), gl.STATIC_DRAW);
    }

    static initBuffers() {
        Cube.vertices = new Float32Array([
            // Front face
            0,0,0,  1,1,0,  1,0,0,  
            0,0,0,  0,1,0,  1,1,0,
    
            // Top face
            0,1,0,  0,1,1,  1,1,1,  
            0,1,0,  1,1,1,  1,1,0,
    
            // Right face
            1,1,0,  1,1,1,  1,0,0,  
            1,0,0,  1,1,1,  1,0,1,
    
            // Left face
            0,1,0,  0,0,0,  0,0,1,  
            0,1,0,  0,0,1,  0,1,1,
    
            // Bottom face
            0,0,0,  1,0,1,  1,0,0,  
            0,0,0,  1,0,1,  0,0,1,
    
            // Back face
            0,1,1,  1,0,1,  0,0,1,  
            0,1,1,  1,0,1,  1,1,1
        ]);
    
        Cube.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, Cube.vertices, gl.STATIC_DRAW);
    
        // 🔹 Create a color array with a valid length
        let faceColors = [
            [1.0, 0.0, 0.0, 1.0],  // Front - Red
            [0.0, 1.0, 0.0, 1.0],  // Top - Green
            [0.0, 0.0, 1.0, 1.0],  // Right - Blue
            [1.0, 1.0, 0.0, 1.0],  // Left - Yellow
            [1.0, 0.5, 0.0, 1.0],  // Bottom - Orange
            [0.5, 0.0, 0.5, 1.0]   // Back - Purple
        ];
    
        let colorArray = [];
        for (let i = 0; i < 6; i++) {  // 6 faces
            for (let j = 0; j < 6; j++) {  // 6 vertices per face
                colorArray.push(...faceColors[i]);
            }
        }
        Cube.colors = new Float32Array(colorArray); // 🔹 Now it has 144 values!
    
        Cube.colorBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, Cube.colors, gl.STATIC_DRAW);
    }

    render() {
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
        // Use per-vertex colors
        gl.uniform1i(u_UseVertexColor, 1); // Enable vertex colors
    
        // Bind position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
    
        console.log("Vertices count:", Cube.vertices.length / 3); // Should be 36
        console.log("Color count:", Cube.colors.length / 4); // Should be 36

        // Bind color buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(Cube.colors), gl.STATIC_DRAW);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);


        gl.drawArrays(gl.TRIANGLES, 0, Cube.vertices.length / 3);
    
        // Reset color mode so other objects use u_FragColor
        gl.uniform1i(u_UseVertexColor, 0);
    }
}
*/
class Cube {
    constructor() {
        this.type = 'cube';
        this.matrix = new Matrix4();
        this._color = [1.0, 1.0, 1.0, 1.0]; // Default: White

        if (!Cube.vertexBuffer) {
            Cube.initBuffers();
        }

        this.updateFaceColors(); // Generate default shaded colors
    }

    // Getter for color (returns base color)
    get color() {
        return this._color;
    }

    // Setter for color (updates shaded colors)
    set color(newColor) {
        this._color = newColor;
        this.updateFaceColors();
    }

    updateFaceColors() {
        let shades = [1.0, 0.85, 0.75, 0.6, 0.85, 0.55]; // Darker shades
        this.faceColors = shades.map(s => this._color.map((c, i) => (i < 3 ? c * s : c))); // Scale RGB, keep Alpha
        this.updateColorBuffer();
    }

    updateColorBuffer() {
        let colorArray = [];
        for (let i = 0; i < this.faceColors.length; i++) {
            for (let j = 0; j < 6; j++) { // 6 vertices per face
                colorArray.push(...this.faceColors[i]);
            }
        }

        // Update the color buffer in OpenGL
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.colorBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(colorArray), gl.STATIC_DRAW);
    }

    static initBuffers() {
        Cube.vertices = new Float32Array([
            // Front face
            0,0,0,  1,1,0,  1,0,0,  
            0,0,0,  0,1,0,  1,1,0,
    
            // Top face
            0,1,0,  0,1,1,  1,1,1,  
            0,1,0,  1,1,1,  1,1,0,
    
            // Right face
            1,1,0,  1,1,1,  1,0,0,  
            1,0,0,  1,1,1,  1,0,1,
    
            // Left face
            0,1,0,  0,0,0,  0,0,1,  
            0,1,0,  0,0,1,  0,1,1,
    
            // Bottom face
            0,0,0,  1,0,1,  1,0,0,  
            0,0,0,  1,0,1,  0,0,1,
    
            // Back face
            0,1,1,  1,0,1,  0,0,1,  
            0,1,1,  1,0,1,  1,1,1
        ]);
    
        Cube.vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, Cube.vertices, gl.STATIC_DRAW);
    
        Cube.colorBuffer = gl.createBuffer();
    }

    render() {
        gl.uniformMatrix4fv(u_ModelMatrix, false, this.matrix.elements);
    
        // Use per-vertex colors
        gl.uniform1i(u_UseVertexColor, 1); // Enable vertex colors
    
        // Bind position buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.vertexBuffer);
        gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Position);
    
        // Bind color buffer (updated with new colors)
        gl.bindBuffer(gl.ARRAY_BUFFER, Cube.colorBuffer);
        gl.vertexAttribPointer(a_Color, 4, gl.FLOAT, false, 0, 0);
        gl.enableVertexAttribArray(a_Color);

        gl.drawArrays(gl.TRIANGLES, 0, Cube.vertices.length / 3);
    
        // Reset color mode so other objects use u_FragColor
        gl.uniform1i(u_UseVertexColor, 0);
    }
}

