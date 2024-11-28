const canvas = document.getElementById('shaderCanvas');
const gl = canvas.getContext('webgl');

if (!gl) {
    console.error('WebGL not supported, falling back on experimental-webgl');
    gl = canvas.getContext('experimental-webgl');
}

if (!gl) {
    alert('Your browser does not support WebGL');
}

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const vertexShaderSource = `
    attribute vec4 a_position;
    void main() {
        gl_Position = a_position;
    }
`;

const fragmentShaderSource = `
    precision mediump float;
uniform float time;
uniform vec2 resolution;

void main( void ) {
    vec2 uv = (gl_FragCoord.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);
    float lines = 96.0;
    uv = floor(uv * lines) / lines;

    vec3 finalColor = vec3(0.0);

    float y = uv.y;
    float x = uv.x + floor(time * lines / 5.0) / lines;
    float w1 = smoothstep(0.81, 0.85, cos(x * 10.0) * 1.2 + cos(x * 3.0) * 1.0 + cos(y * 2.0 + 0.1));
    w1 += smoothstep(0.81, 0.85, cos(x * 10.0 + 3.0) * 1.2 + cos(x * 3.0 + 3.0) * 1.0 + cos(y * 2.0 - 1.0) - 1.0);
    float g1 = smoothstep(0.8, 0.9, cos(cos(y * 19.0) * 5.0 + x * 160.0) + cos(x * 60.0) + cos(x * 133.0) * 0.8 + y * 11.0 + 6.0);
    float l1 = smoothstep(0.8, 0.9, cos(cos(x * 30.0) * 2.0 + y * 110.0) * 2.0 + cos(cos(y * 110.0) * 1.0 + x * 120.0) * 2.0
                            - abs(cos(x * 2.1) * 8.0) - abs(cos(x * 4.4) * 4.0) - y * 50.0 + 31.0);

    x = uv.x + floor(time * lines / 8.0) / lines;
    float w2 = smoothstep(0.81, 0.85, cos(x * 21.0) * 1.1 + cos(x * 16.0) * 0.7 + cos(y * 5.0 + 0.1) * 1.1);
    w2 += smoothstep(0.81, 0.85, cos(x * 21.0 + 3.0) * 0.7 + cos(x * 16.0 + 3.0) * 1.0 + cos(y * 4.0 - 1.0) * 1.0 - 1.0);
    float g2 = smoothstep(0.8, 0.9, cos(cos(y * 38.0) * 5.0 + x * 320.0) + cos(x * 120.0) + cos(x * 266.0) * 0.2 + y * 21.0 + 6.0);
    float l2 = smoothstep(0.8, 0.9, cos(cos(x * 60.0) * 2.0 + y * 220.0) * 2.0 + cos(cos(y * 220.0) * 1.0 + x * 240.0) * 2.0
                            - abs(cos(x * 4.2) * 6.0) - abs(cos(x * 8.8) * 4.0) - y * 100.0 + 28.0);

    x = uv.x + floor(time * lines / 11.0) / lines;
    float w3 = smoothstep(0.81, 0.85, cos(x * 42.0) * 1.1 + cos(x * 32.0) * 0.7 + cos(y * 6.0 + 0.1) * 1.1);
    w3 += smoothstep(0.81, 0.85, cos(x * 42.0 + 3.0) * 0.7 + cos(x * 32.0 + 3.0) * 1.0 + cos(y * 5.0 - 1.0) * 1.0 - 1.0);
    float g3 = smoothstep(0.8, 0.9, cos(cos(y * 76.0) * 5.0 + x * 640.0) + cos(x * 240.0) + cos(x * 532.0) * 0.1 + y * 31.0 + 6.0);
    float l3 = smoothstep(0.8, 0.9, cos(cos(x * 120.0) * 2.0 + y * 440.0) * 2.0 + cos(cos(y * 440.0) * 1.0 + x * 480.0) * 2.0
                            - abs(cos(x * 8.4) * 6.0) - abs(cos(x * 17.6) * 4.0) - y * 200.0 + 25.0);

    vec2 pos = vec2(cos(time * 0.41), sin(time * 0.51) * 0.3);
    pos = floor(pos * lines) / lines;
    float s1 = smoothstep(0.04, 0.0, length(pos - uv));
    pos = vec2(cos(1.0 + time * 0.31), sin(time * 0.52) * 0.3);
    pos = floor(pos * lines) / lines;
    float s2 = smoothstep(0.04, 0.0, length(pos - uv));

    vec2 pos3 = vec2(cos(time * 0.61), sin(time * 0.71) * 0.3);
    pos3 = floor(pos3 * lines) / lines;
    float s3 = smoothstep(0.04, 0.0, length(pos3 - uv));
    vec2 pos4 = vec2(cos(time * 0.71), sin(time * 0.81) * 0.3);
    pos4 = floor(pos4 * lines) / lines;
    float s4 = smoothstep(0.04, 0.0, length(pos4 - uv));
    vec2 pos5 = vec2(cos(time * 0.81), sin(time * 0.91) * 0.3);
    pos5 = floor(pos5 * lines) / lines;
    float s5 = smoothstep(0.04, 0.0, length(pos5 - uv));

    float c;
    c = w3 * g3 * l3; finalColor = clamp(vec3(0.7, 0.8, 1.0) + c, 0.0, 1.0);
    c = w2 * g2 * l2; finalColor = min(clamp(vec3(0.4, 0.5, 0.7) + c, 0.0, 1.0), finalColor);
    c = s1; finalColor += c * vec3(1.0); // Белый светлячок
    c = s2; finalColor += c * vec3(1.0); // Белый светлячок
    c = s3; finalColor += c * vec3(1.0); // Белый светлячок
    c = s4; finalColor += c * vec3(1.0); // Белый светлячок
    c = s5; finalColor += c * vec3(1.0); // Белый светлячок
    c = s1; finalColor += c * c * vec3(1.0) * abs(sin(time * 50.0));
    c = s2; finalColor += c * c * vec3(1.0) * abs(cos(time * 50.0));
    c = w1 * g1 * l1; finalColor *= vec3(0.7, 0.8, 1.0) * c;

    float gray = (finalColor.r + finalColor.g + finalColor.b) / 3.0;
    finalColor = vec3(gray);

    gl_FragColor = vec4(finalColor * finalColor * 0.16, 1.0);
}
`;

function createShader(gl, type, source) {
    const shader = gl.createShader(type);
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    const success = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
    if (success) {
        return shader;
    }

    console.log(gl.getShaderInfoLog(shader));
    gl.deleteShader(shader);
}

function createProgram(gl, vertexShader, fragmentShader) {
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
        return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
}

function resizeCanvasToDisplaySize(canvas) {
    const displayWidth = canvas.clientWidth;
    const displayHeight = canvas.clientHeight;

    if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
        canvas.width = displayWidth;
        canvas.height = displayHeight;
        return true;
    }

    return false;
}

const vertexShader = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
const fragmentShader = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);
const program = createProgram(gl, vertexShader, fragmentShader);

const positionAttributeLocation = gl.getAttribLocation(program, "a_position");
const resolutionUniformLocation = gl.getUniformLocation(program, "resolution");
const timeUniformLocation = gl.getUniformLocation(program, "time");

const positionBuffer = gl.createBuffer();
gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

const positions = [
    -1, -1,
    1, -1,
    -1, 1,
    -1, 1,
    1, -1,
    1, 1,
];
gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(positions), gl.STATIC_DRAW);

function render(time) {
    time *= 0.001;  // convert to seconds

    resizeCanvasToDisplaySize(gl.canvas);
    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.useProgram(program);

    gl.enableVertexAttribArray(positionAttributeLocation);
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
    gl.vertexAttribPointer(positionAttributeLocation, 2, gl.FLOAT, false, 0, 0);

    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);
    gl.uniform1f(timeUniformLocation, time);

    gl.drawArrays(gl.TRIANGLES, 0, 6);

    requestAnimationFrame(render);
}

