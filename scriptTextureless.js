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
var at;
const up = vec3(0.0, 1.0, 0.0);

var positionsArray = [];
var colorsArray = [];

// var points = [];
var vertices = [];

var program;

const pointsArray = [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, "Entrance", 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0,     0,      1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,     1,      1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0,     0,      1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 0, 1, 1, 1, 0, 1, 1, 1,     0,      1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0,     0,      1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1,     1,      1, 0, 1, 1, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1,     0,      0, 0, 1, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1,     0,      1, 0, 1, 1, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1,     0,      1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1,     0,      1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1,     0,      1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1,     1,      1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 1, 0, 0,     0,      1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1,     0,      1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 0, 0, 0, 0, 1,     0,      0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1,     0,      1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0,     0,      1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1,     1,      1, 1, 1, 0, 1, 1, 1, 1, 1, 0, 1],
    [1, 0, 1, 0, 1, 0, 1, 0, 0, 0, 0,     0,      0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 1, 1, 0, 1, 1, 1, 1, 1,     0,      1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1,     0,      1, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,   "Exit",   1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1]
];

var ySparse;
var xSparse;

var yUser;
var xUser;

var dir = [0, 3];

var move_forward = false;
var move_behind = false;

var list = [0, -1, 0, 1];

function quad(a, b, c, d, color) {
    positionsArray.push(vertices[a]);
    colorsArray.push(vec4(color[0], color[1], color[2], color[3]));

    positionsArray.push(vertices[b]);
    colorsArray.push(vec4(color[0], color[1], color[2], color[3]));

    positionsArray.push(vertices[c]);
    colorsArray.push(vec4(color[0], color[1], color[2], color[3]));
    
    positionsArray.push(vertices[a]);
    colorsArray.push(vec4(color[0], color[1], color[2], color[3]));
    
    positionsArray.push(vertices[c]);
    colorsArray.push(vec4(color[0], color[1], color[2], color[3]));
    
    positionsArray.push(vertices[d]);
    colorsArray.push(vec4(color[0], color[1], color[2], color[3]));
    
}

function labyrinth (vertices) {
    for (let i=0; i < vertices.length; i+=4) {
        quad(i, i+1, i+2, i+3, [1.0, 0.0, 0.0, 1.0]);
        numPositions += 6;
    }
}

function floor () {
    vertices.push( vec4( 0.95, 0.05,  0.95, 1.0) );
    vertices.push( vec4( 0.95, 0.05, -0.95, 1.0) );
    vertices.push( vec4(-0.95, 0.05, -0.95, 1.0) );
    vertices.push( vec4(-0.95, 0.05,  0.95, 1.0) );

    quad(vertices.length - 1, vertices.length - 2, vertices.length - 3, vertices.length - 4, [0.0, 1.0, 0.0, 1.0]);

    numPositions += 6;
}

function ceiling () {
    vertices.push( vec4( 0.95, 0.95,  0.95, 1.0) );
    vertices.push( vec4( 0.95, 0.95, -0.95, 1.0) );
    vertices.push( vec4(-0.95, 0.95, -0.95, 1.0) );
    vertices.push( vec4(-0.95, 0.95,  0.95, 1.0) );

    quad(vertices.length - 1, vertices.length - 2, vertices.length - 3, vertices.length - 4, [0.0, 0.0, 1.0, 1.0]);

    numPositions += 6;
}

function samePoints (point1, point2) {
    return (point1[0] == point2[0]) && (point1[1] == point2[1]);
}

function arrayTo3DPoints (array) {
    let maxY = array.length-1;
    let maxX = array[0].length-1;

    ySparse = 1.9 / maxY;
    xSparse = 1.9 / maxX;

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
    // console.log(vertices);
    
    var vBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(positionsArray), gl.STATIC_DRAW);

    var positionLoc = gl.getAttribLocation(program, "aPosition");
    gl.vertexAttribPointer(positionLoc, 4, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(positionLoc);


    var cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorsArray), gl.STATIC_DRAW);

    var colorLoc = gl.getAttribLocation( program, "aColor" );
    gl.vertexAttribPointer( colorLoc, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( colorLoc );


    modelViewMatrixLoc = gl.getUniformLocation(program, "uModelViewMatrix");
    projectionMatrixLoc = gl.getUniformLocation(program, "uProjectionMatrix");


    for (let y = 0; y < pointsArray.length; y++) {
        for (let x = 0; x < pointsArray[0].length; x++) {
            if (pointsArray[y][x] == "Entrance") {
                xUser = x;
                yUser = y;
            }
        }
    }

    document.querySelector('body').addEventListener('keydown', function (event) {
        switch (event.key) {
            case 'ArrowUp':
                move_forward = true;
                break;
            case 'ArrowDown':
                move_behind = true;
                break;
        }
    });

    document.querySelector('body').addEventListener('keyup', function (event) {
        switch (event.key) {
            case 'ArrowUp':
                move_forward = false;
                break;
            case 'ArrowDown':
                move_behind = false;
                break;
            case 'ArrowLeft':
                dir[0] += 1;
                if (dir[0] == 4) {
                    dir[0] = 0;
                }

                dir[1] += 1;
                if (dir[1] == 4) {
                    dir[1] = 0;
                }
                break;
            case 'ArrowRight':
                dir[0] -= 1;
                if (dir[0] == -1) {
                    dir[0] = 3;
                }

                dir[1] -= 1;
                if (dir[1] == -1) {
                    dir[1] = 3;
                }
                break;
        }
    });

    render();
};

function render() {
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (move_behind) {
        xUser -= list[dir[0]];
        yUser -= list[dir[1]];
    }

    if (move_forward) {
        xUser += list[dir[0]];
        yUser += list[dir[1]];
    }

    eye = vec3(-0.95 + xUser * xSparse, 0.2, 0.95 - yUser * ySparse);
    at = vec3(-0.95 + (xUser + list[dir[0]]) * xSparse, 0.2, 0.95 - (yUser + list[dir[1]]) * ySparse);

    // console.log(eye);

    projectionMatrix = perspective(fovy, aspect, near, far);
    
    modelViewMatrix = lookAt(eye, at , up);

    gl.uniformMatrix4fv(modelViewMatrixLoc, false, flatten(modelViewMatrix));
    gl.uniformMatrix4fv(projectionMatrixLoc, false, flatten(projectionMatrix));
    gl.drawArrays(gl.TRIANGLES, 0, numPositions);

    requestAnimationFrame(render);
}