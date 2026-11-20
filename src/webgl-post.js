// Lightweight WebGL Post-Processing (True Bloom + Hit Chromatic Aberration)

const VS = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = vec2(aPos.x * 0.5 + 0.5, 0.5 - aPos.y * 0.5);
  gl_Position = vec4(aPos, 0.0, 1.0);
}
`;

const FS = `
precision mediump float;
varying vec2 vUv;
uniform sampler2D uTex;
uniform vec2 uTexel;
uniform float uAberration;
uniform float uEnabled;

vec3 bright(vec2 uv) {
  vec3 c = texture2D(uTex, clamp(uv, 0.001, 0.999)).rgb;
  float l = dot(c, vec3(0.299, 0.587, 0.114));
  return c * smoothstep(0.72, 0.96, l);
}

void main() {
  if (uEnabled < 0.5) {
    gl_FragColor = texture2D(uTex, vUv);
    return;
  }
  vec2 d = vUv - vec2(0.5);
  float dist = length(d);
  vec2 dir = dist > 0.0001 ? d / dist : vec2(0.0);
  float ca = uAberration * (0.003 + dist * 0.015);
  vec3 base = vec3(
    texture2D(uTex, clamp(vUv + dir * ca, 0.001, 0.999)).r,
    texture2D(uTex, vUv).g,
    texture2D(uTex, clamp(vUv - dir * ca, 0.001, 0.999)).b
  );
  vec2 px = uTexel * 2.2;
  vec3 bloom = bright(vUv) * 0.24
    + (bright(vUv + vec2(px.x, 0.0)) + bright(vUv - vec2(px.x, 0.0))
     + bright(vUv + vec2(0.0, px.y)) + bright(vUv - vec2(0.0, px.y))) * 0.12
    + (bright(vUv + px) + bright(vUv - px) + bright(vUv + vec2(px.x, -px.y)) + bright(vUv + vec2(-px.x, px.y))) * 0.07;

  gl_FragColor = vec4(base + bloom * 0.30, 1.0);
}
`;

export class WebGLPost {
  constructor(canvas) {
    this.canvas = canvas;
    this.enabled = true;
    this.supported = false;
    this.aberration = 0;

    const gl = canvas.getContext('webgl', { alpha: false, antialias: false, depth: false });
    if (!gl) return;
    this.gl = gl;

    const compile = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return gl.getShaderParameter(s, gl.COMPILE_STATUS) ? s : null;
    };
    const vs = compile(gl.VERTEX_SHADER, VS);
    const fs = compile(gl.FRAGMENT_SHADER, FS);
    if (!vs || !fs) return;

    const p = gl.createProgram();
    gl.attachShader(p, vs);
    gl.attachShader(p, fs);
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) return;

    this.program = p;
    gl.useProgram(p);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(p, 'aPos');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    this.tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

    this.uTex = gl.getUniformLocation(p, 'uTex');
    this.uTexel = gl.getUniformLocation(p, 'uTexel');
    this.uAberration = gl.getUniformLocation(p, 'uAberration');
    this.uEnabled = gl.getUniformLocation(p, 'uEnabled');
    this.supported = true;
  }

  pulse(strength = 0.8) {
    this.aberration = Math.max(this.aberration, strength);
  }

  update(dt) {
    if (this.aberration > 0.002) this.aberration *= Math.pow(0.004, dt);
    else this.aberration = 0;
  }

  render(srcCanvas) {
    if (!this.supported) return false;
    const gl = this.gl;
    if (this.canvas.width !== srcCanvas.width || this.canvas.height !== srcCanvas.height) {
      this.canvas.width = srcCanvas.width;
      this.canvas.height = srcCanvas.height;
    }
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.useProgram(this.program);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, srcCanvas);
    gl.uniform1i(this.uTex, 0);
    gl.uniform2f(this.uTexel, 1 / srcCanvas.width, 1 / srcCanvas.height);
    gl.uniform1f(this.uAberration, this.aberration);
    gl.uniform1f(this.uEnabled, this.enabled ? 1 : 0);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
    return true;
  }
}
