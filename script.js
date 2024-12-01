"use strict";

var canvas;
var gl;

var numPositions  = 0;

var near = 0.3;
var far = 3.75;
var radius = 4.0;
var theta = 0.26;
var phi = 2.3;
var dr = 5.0 * Math.PI/180.0;

var  fovy = 45.0;  // Field-of-view in Y direction angle (in degrees)
var  aspect;       // Viewport aspect ratio

var modelViewMatrixLoc, projectionMatrixLoc;
var modelViewMatrix, projectionMatrix;
var eye;
const at = vec3(0.0, 0.0, 0.0);
const up = vec3(0.0, 1.0, 0.0);

var positionsArray = [];
var texCoordsArray = [];

var texSize = 64;

// var points = [];
var vertices = [];

var texture;
var program;

const pointsArray = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, "E", 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, "S", 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
]

function samePoints (point1, point2) {
    return (point1[0] == point2[0]) && (point1[1] == point2[1]);
}

function arrayTo2DPoints (array) {
    let maxY = array.length-1;
    let maxX = array[0].length-1;

    let ySparse = 1.9 / maxY;
    let xSparse = 1.9 / maxX;

    let line_start = null;
    let last_wall = null;

    // Create horizontal lines
    for (let y = 0; y <= maxY; y++) {
        for (let x = 0; x <= maxX; x++) {
            if (array[y][x] === 1) {
                last_wall = [ -0.95 + x * xSparse , 0.95 - y * ySparse ];

                if (line_start === null) {
                    line_start = [ -0.95 + x * xSparse , 0.95 - y * ySparse ];
                }
            }
            
            if ((array[y][x] !== 1) || (x === maxX)) {
                if (line_start !== null) {
                    if (!samePoints(line_start, last_wall)) {
                        points.push( vec2( line_start[0], line_start[1] ) );
                        points.push( vec2( last_wall[0], last_wall[1] ) );
                    }

                    line_start = null;
                }
            }
        }
    }

    // Create vertical lines
    for (let x = 0; x <= maxX; x++) {
        for (let y = 0; y <= maxY; y++) {
            if (array[y][x] === 1) {
                last_wall = [ -0.95 + x * xSparse , 0.95 - y * ySparse ];

                if (line_start === null) {
                    line_start = [ -0.95 + x * xSparse , 0.95 - y * ySparse ];
                }
            }
            
            if ((array[y][x] !== 1) || (y === maxY)) {
                if (line_start !== null) {
                    if (!samePoints(line_start, last_wall)) {
                        points.push( vec2( line_start[0], line_start[1] ) );
                        points.push( vec2( last_wall[0], last_wall[1] ) );
                    }

                    line_start = null;
                }
            }
        }
    }
}

function arrayTo3DPoints (array) {
    let maxY = array.length-1;
    let maxX = array[0].length-1;

    let ySparse = 1.9 / maxY;
    let xSparse = 1.9 / maxX;

    let line_start = null;
    let last_wall = null;

    // Create horizontal lines
    for (let y = 0; y <= maxY; y++) {
        for (let x = 0; x <= maxX; x++) {
            if (array[y][x] === 1) {
                last_wall = [ -0.95 + x * xSparse , 0.95 - y * ySparse ];

                if (line_start === null) {
                    line_start = [ -0.95 + x * xSparse , 0.95 - y * ySparse ];
                }
            }
            
            if ((array[y][x] !== 1) || (x === maxX)) {
                if (line_start !== null) {
                    if (!samePoints(line_start, last_wall)) {
                        vertices.push( vec4(line_start[0], 0.05,  line_start[1], 1.0) );
                        vertices.push( vec4(line_start[0], 0.95,  line_start[1], 1.0) );
                        vertices.push( vec4(last_wall[0], 0.95,  last_wall[1], 1.0) );
                        vertices.push( vec4(last_wall[0], 0.05,  last_wall[1], 1.0) );
                    }

                    line_start = null;
                }
            }
        }
    }

    // Create vertical lines
    for (let x = 0; x <= maxX; x++) {
        for (let y = 0; y <= maxY; y++) {
            if (array[y][x] === 1) {
                last_wall = [ -0.95 + x * xSparse , 0.95 - y * ySparse ];

                if (line_start === null) {
                    line_start = [ -0.95 + x * xSparse , 0.95 - y * ySparse ];
                }
            }
            
            if ((array[y][x] !== 1) || (y === maxY)) {
                if (line_start !== null) {
                    if (!samePoints(line_start, last_wall)) {
                        vertices.push( vec4(line_start[0], 0.05,  line_start[1], 1.0) );
                        vertices.push( vec4(line_start[0], 0.95,  line_start[1], 1.0) );
                        vertices.push( vec4(last_wall[0], 0.95,  last_wall[1], 1.0) );
                        vertices.push( vec4(last_wall[0], 0.05,  last_wall[1], 1.0) );
                    }

                    line_start = null;
                }
            }
        }
    }
}

var textures = document.getElementById("textures");
var texture_wall_part =    [[0  , 0.5], [0.5, 0  ]];
var texture_floor_part =   [[0.5, 0.5], [1  , 0  ]];
var texture_ceiling_part = [[0  , 1  ], [0.5, 0.5]];

function configureTexture( image ) {
    texture = gl.createTexture();

    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.texImage2D(
        gl.TEXTURE_2D,
        0,
        gl.RGB,
        gl.RGB,
        gl.UNSIGNED_BYTE,
        image
    );
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MIN_FILTER,
        gl.NEAREST_MIPMAP_LINEAR
    );
    gl.texParameteri(
        gl.TEXTURE_2D,
        gl.TEXTURE_MAG_FILTER,
        gl.NEAREST
    );
    gl.uniform1i(gl.getUniformLocation(program, "uTextureMap"), 0);
}

function quad(a, b, c, d, texture) {
    positionsArray.push(vertices[a]);
    texCoordsArray.push(vec2(texture[0][0], texture[1][1]));

    positionsArray.push(vertices[b]);
    texCoordsArray.push(vec2(texture[0][0], texture[0][1]));

    positionsArray.push(vertices[c]);
    texCoordsArray.push(vec2(texture[1][0], texture[0][1]));
    
    positionsArray.push(vertices[a]);
    texCoordsArray.push(vec2(texture[0][0], texture[1][1]));
    
    positionsArray.push(vertices[c]);
    texCoordsArray.push(vec2(texture[1][0], texture[0][1]));
    
    positionsArray.push(vertices[d]);
    texCoordsArray.push(vec2(texture[1][1], texture[1][1]));
    
}

function labyrinth (vertices) {
    for (let i=0; i < vertices.length; i+=4) {
        quad(i, i+1, i+2, i+3, texture_wall_part);
        numPositions += 6;
    }
}

function floor () {
    vertices.push( vec4( 0.95, 0.05,  0.95, 1.0) );
    vertices.push( vec4( 0.95, 0.05, -0.95, 1.0) );
    vertices.push( vec4(-0.95, 0.05, -0.95, 1.0) );
    vertices.push( vec4(-0.95, 0.05,  0.95, 1.0) );

    quad(vertices.length - 1, vertices.length - 2, vertices.length - 3, vertices.length - 4, texture_floor_part);

    numPositions += 6;
}

function ceiling () {
    vertices.push( vec4( 0.95, 0.95,  0.95, 1.0) );
    vertices.push( vec4( 0.95, 0.95, -0.95, 1.0) );
    vertices.push( vec4(-0.95, 0.95, -0.95, 1.0) );
    vertices.push( vec4(-0.95, 0.95,  0.95, 1.0) );

    quad(vertices.length - 1, vertices.length - 2, vertices.length - 3, vertices.length - 4, texture_ceiling_part);

    numPositions += 6;
}

window.onload = init;

function init()
{
    var canvas = document.getElementById( "gl-canvas" );

    gl = canvas.getContext('webgl2');
    if (!gl) alert("WebGL 2.0 isn't available" );

    gl.viewport(0, 0, canvas.width, canvas.height);

    aspect =  canvas.width/canvas.height;

    gl.clearColor(1.0, 1.0, 1.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    program = initShaders(gl, "vertex-shader", "fragment-shader");
    gl.useProgram(program);

    arrayTo3DPoints(pointsArray);
    labyrinth(vertices);
    floor();
    ceiling();

    // console.log(points);
    console.log(vertices);
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);


    configureTexture(textures);

    var tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(texCoordsArray), gl.STATIC_DRAW);

    var texCoordLoc = gl.getAttribLocation(program, "aTexCoord");
    gl.vertexAttribPointer(texCoordLoc, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(texCoordLoc);


    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");


    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    eye = vec3(radius*Math.sin(theta)*Math.cos(phi),
        radius*Math.sin(theta)*Math.sin(phi), radius*Math.cos(theta));

    projectionMatrix = perspective(fovy, aspect, near, far);
    var S = scale(0.5,0.5,0.5);

    var T = translate(0, -0.5, 0.8);
    
    // Cube in the middle
    // just need to Scale, no translate, coord are already centered
    modelViewMatrix = lookAt(eye, at , up);

    // update modelview matrix with required transformation(s)
    modelViewMatrix = mult(modelViewMatrix,T);
    modelViewMatrix = mult(modelViewMatrix,S);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);
}