class FireworksShader {
    constructor(canvas) {
        this.ERROR = '';
        this._stopped = false;
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl");
        if (!this.gl) {
            let msg = 'NOWEBGL';
            console.error(msg);
            this.ERROR = msg;
            return;
        };

        this.vertexShaderSrc = `
attribute vec2 position;
void main() {
    gl_Position = vec4(position, 0.0, 1.0);
}
`;

        this.fragmentShaderSrc = `
#ifdef GL_ES
precision mediump float;
#endif

uniform float time;
uniform vec2 resolution;

#define iTime time
#define iResolution resolution

#define NUM_EXPLOSIONS 5.
#define NUM_PARTICLES 75.

vec2 Hash12(float t){
    float x = fract(sin(t*674.3)*453.2);
    float y = fract(sin((t+x)*714.3)*263.2);
    return vec2(x, y);
}

vec2 Hash12_Polar(float t){
    float p_Angle = fract(sin(t*674.3)*453.2)*6.2832;
    float p_Dist = fract(sin((t+p_Angle)*714.3)*263.2);
    return vec2(sin(p_Angle), cos(p_Angle)) * p_Dist;
}

float Explosion(vec2 uv, float t){
    float sparks = 0.;
    for(float i = 0.; i < NUM_PARTICLES; i++){
        vec2 dir = Hash12_Polar(i+1.) * .5;
        float dist = length(uv - dir * t);
        float brightness = .0005;
        brightness *= sin(t*20. + i) * .5 + .5; 
        brightness *= smoothstep(1., .6, t);
        sparks += brightness / dist;
    }
    return sparks;
}

void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 uv = (fragCoord - .5*iResolution.xy) / iResolution.y;
    vec3 col = vec3(0);
    
    for(float i = 0.; i < NUM_EXPLOSIONS; i++){
        float t = iTime + i / NUM_EXPLOSIONS;
        float ft = floor(t);
        vec3 color = sin(4.*vec3(.34,.54,.43) * ft)*.25 + .75;

        vec2 offset = Hash12(i + 1. + ft) - .5;
        offset *= vec2(1.77, 1.);

        col += Explosion(uv - offset, fract(t)) * color;
    }
    
    col *= 2.0;
    fragColor = vec4(col, 0.5);
}

void main(){
    mainImage(gl_FragColor, gl_FragCoord.xy);
}
`;

        this.start = performance.now();

        this._initProgram();
        this.resize();
        window.addEventListener("resize", () => this.resize());
        this.draw = this.draw.bind(this);
        requestAnimationFrame(this.draw);
    }

    compile(src, type) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, src);
        this.gl.compileShader(shader);
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error(this.gl.getShaderInfoLog(shader));
        }
        return shader;
    }

    _initProgram() {
        const gl = this.gl;
        const vs = this.compile(this.vertexShaderSrc, gl.VERTEX_SHADER);
        const fs = this.compile(this.fragmentShaderSrc, gl.FRAGMENT_SHADER);

        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);
        gl.useProgram(prog);
        this.program = prog;

        // Fullscreen triangle
        const buffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(
            gl.ARRAY_BUFFER,
            new Float32Array([
                -1, -1,   1, -1,   -1, 1,
                -1,  1,   1, -1,    1, 1
            ]),
            gl.STATIC_DRAW
        );

        const positionLoc = gl.getAttribLocation(prog, "position");
        gl.enableVertexAttribArray(positionLoc);
        gl.vertexAttribPointer(positionLoc, 2, gl.FLOAT, false, 0, 0);

        // Uniform locations
        this.timeLoc = gl.getUniformLocation(prog, "time");
        this.resLoc  = gl.getUniformLocation(prog, "resolution");
    }

    resize() {
        const gl = this.gl;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
    }

    draw() {
        const gl = this.gl;
        const t = (performance.now() - this.start) * 0.001;

        gl.uniform1f(this.timeLoc, t);
        gl.uniform2f(this.resLoc, this.canvas.width, this.canvas.height);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        requestAnimationFrame(this.draw);
    }

    stop() {

        if (this._stopped) return;
        const gl = this.gl;
        if (!gl) return;

        try {
            // unuse and remove program + attached shaders
            if (this.program) {
                gl.useProgram(null);

                if (gl.getAttachedShaders) {
                    const attached = gl.getAttachedShaders(this.program) || [];
                    for (let s of attached) {
                        try {
                            gl.detachShader(this.program, s);
                            gl.deleteShader(s);
                        } catch (e) { /* ignore */ }
                    }
                }

                // disable any vertex attribute arrays used by the program
                try {
                    const n = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES) || 0;
                    for (let i = 0; i < n; i++) {
                        const info = gl.getActiveAttrib(this.program, i);
                        if (!info) continue;
                        const loc = gl.getAttribLocation(this.program, info.name);
                        if (loc >= 0) gl.disableVertexAttribArray(loc);
                    }
                } catch (e) { /* ignore */ }

                gl.deleteProgram(this.program);
                this.program = null;
            }

            // delete bound ARRAY_BUFFER if it exists (cleanup the fullscreen triangle buffer)
            try {
                const buf = gl.getParameter(gl.ARRAY_BUFFER_BINDING);
                if (buf) {
                    gl.bindBuffer(gl.ARRAY_BUFFER, null);
                    gl.deleteBuffer(buf);
                }
            } catch (e) { /* ignore */ }

            // try to explicitly lose the GL context to free GPU resources
            const ext = (gl.getExtension && (gl.getExtension('WEBGL_lose_context') || gl.getExtension('WEBKIT_WEBGL_lose_context')));
            if (ext && ext.loseContext) ext.loseContext();
        } catch (e) {
            // swallow any errors during cleanup
        }

        this._stopped = true;
    }
}