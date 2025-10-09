<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Fireworks 1920x1080 (Transparent, 60 FPS via setTimeout)</title>
  <style>
    html, body {
      margin: 0;
      padding: 0;
      background: black;
      overflow: hidden;
      height: 100%;
    }
    #fwCanvas {
      display: block;
      background: transparent;
      width: 1920px;
      height: 1080px;
    }
    .hint {
      position: absolute;
      top: 12px;
      left: 16px;
      font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif;
      font-size: 14px;
      color: rgba(255,255,255,0.85);
      text-shadow: 0 1px 2px rgba(0,0,0,0.5);
      pointer-events: none;
    }
  </style>
</head>
<body>
  <canvas id="fwCanvas" width="1920" height="1080"></canvas>
  <div class="hint">click/tap to launch</div>

  <script>
    class Fireworks {
      constructor(canvasOrId, opts = {}) {
        this.canvas = typeof canvasOrId === 'string' ? document.getElementById(canvasOrId) : canvasOrId;
        this.ctx = this.canvas.getContext('2d');

        this.opts = Object.assign({
          rocketMinSpeed: 7,
          rocketMaxSpeed: 9.5,
          gravity: 0.15,
          airDrag: 0.985,
          particleCount: 140,
          particleLife: 65,
          trails: 10,
          spawnInterval: 900,
        }, opts);

        this._running = false;
        this._timer = null;
        this._frameMs = 1000 / 60;
        this._nextTickAt = 0;
        this.rockets = [];
        this.particles = [];
        this._lastSpawnAt = 0;

        this._loop = this._loop.bind(this);

        this.canvas.addEventListener('pointerdown', (e) => {
          const rect = this.canvas.getBoundingClientRect();
          const x = (e.clientX - rect.left) * (this.canvas.width / rect.width);
          const y = (e.clientY - rect.top) * (this.canvas.height / rect.height);
          this.launch(x, y);
        });
      }

      start() {
        if (this._running) return;
        this._running = true;
        const now = performance.now();
        this._nextTickAt = now;
        this._lastSpawnAt = now;
        this._scheduleNextTick(0);
      }

      stop() {
        this._running = false;
        if (this._timer) clearTimeout(this._timer);
        this._timer = null;
      }

      launch(targetX, targetY) {
        const startX = Math.random() * this.canvas.width * 0.8 + this.canvas.width * 0.1;
        const startY = this.canvas.height + 10; // spawn just below the bottom

        const tx = (typeof targetX === 'number') ? targetX : (Math.random() * this.canvas.width * 0.8 + this.canvas.width * 0.1);
        const ty = (typeof targetY === 'number') ? targetY : (Math.random() * this.canvas.height * 0.6 + this.canvas.height * 0.1);

        const angle = Math.atan2(ty - startY, tx - startX);
        const speed = this._rand(this.opts.rocketMinSpeed, this.opts.rocketMaxSpeed);
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        this.rockets.push({ x: startX, y: startY, vx, vy, targetY: ty, trail: [] });
      }

      _scheduleNextTick(delayMs) {
        if (!this._running) return;
        this._timer = setTimeout(this._loop, delayMs);
      }

      _loop() {
        if (!this._running) return;
        const now = performance.now();
        if (this._nextTickAt === 0) this._nextTickAt = now;

        this._update();
        this._draw();

        if (this.opts.spawnInterval > 0 && now - this._lastSpawnAt >= this.opts.spawnInterval) {
          this.launch();
          this._lastSpawnAt = now;
        }

        this._nextTickAt += this._frameMs;
        const delay = Math.max(0, this._nextTickAt - performance.now());
        this._scheduleNextTick(delay);
      }

      _update() {
        const g = this.opts.gravity;

        for (let i = this.rockets.length - 1; i >= 0; i--) {
          const r = this.rockets[i];
          r.trail.push({ x: r.x, y: r.y });
          if (r.trail.length > 8) r.trail.shift();

          r.x += r.vx;
          r.y += r.vy;
          r.vy += g * 0.15;

          // explode if reaches target height or leaves bounds (ignore bottom)
          if (r.y <= r.targetY || r.vy > 1.2 || r.x < 0 || r.x > this.canvas.width || r.y < 0) {
            this._explode(r.x, r.y);
            this.rockets.splice(i, 1);
          }
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
          const p = this.particles[i];
          p.life -= 1;
          if (p.life <= 0) {
            this.particles.splice(i, 1);
            continue;
          }
          p.vx *= this.opts.airDrag;
          p.vy *= this.opts.airDrag;
          p.vy += this.opts.gravity;
          p.x += p.vx;
          p.y += p.vy;

          p.trail.push({ x: p.x, y: p.y });
          if (p.trail.length > this.opts.trails) p.trail.shift();

          // if particle leaves canvas (ignore bottom), just remove it
          if (p.x < 0 || p.x > this.canvas.width || p.y < 0) {
            this.particles.splice(i, 1);
          }
        }
      }

      _explode(x, y) {
        try {
          if (typeof vars !== 'undefined' && vars && typeof vars.playSound === 'function') {
            vars.playSound('fireworkExplosion');
          }
        } catch (e) {}

        const count = this.opts.particleCount;
        const hue = Math.floor(Math.random() * 360);
        const spread = Math.PI * 2;
        for (let i = 0; i < count; i++) {
          const angle = (i / count) * spread + Math.random() * 0.1;
          const speed = Math.random() * 7 + 2.5;
          const vx = Math.cos(angle) * speed;
          const vy = Math.sin(angle) * speed;
          const life = Math.floor(this.opts.particleLife * (0.7 + Math.random() * 0.6));
          const brightness = 0.75 + Math.random() * 0.25;
          this.particles.push({
            x: Math.min(Math.max(x, 0), this.canvas.width),
            y: Math.min(Math.max(y, 0), this.canvas.height),
            vx, vy,
            life,
            maxLife: life,
            color: { hue, brightness },
            trail: []
          });
        }
      }

      _draw() {
        const ctx = this.ctx;
        const w = this.canvas.width;
        const h = this.canvas.height;
        ctx.clearRect(0, 0, w, h);

        for (const r of this.rockets) {
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          if (r.trail.length) {
            ctx.moveTo(r.trail[0].x, r.trail[0].y);
            for (const t of r.trail) ctx.lineTo(t.x, t.y);
          }
          ctx.lineTo(r.x, r.y);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(r.x, r.y, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(255,255,255,0.9)';
          ctx.fill();
          ctx.restore();
        }

        for (const p of this.particles) {
          const lifeRatio = p.life / p.maxLife;
          const alpha = Math.max(0, Math.min(1, lifeRatio));
          const sat = 100;
          const light = Math.floor(40 + 40 * p.color.brightness * alpha);
          const color = `hsl(${p.color.hue} ${sat}% ${light}%)`;

          ctx.save();
          ctx.globalCompositeOperation = 'lighter';

          ctx.beginPath();
          const t0 = p.trail[0];
          if (t0) ctx.moveTo(t0.x, t0.y);
          for (const t of p.trail) ctx.lineTo(t.x, t.y);
          ctx.lineWidth = Math.max(1, 2 * lifeRatio);
          ctx.strokeStyle = this._hsla(p.color.hue, sat, light, 0.35 * alpha);
          ctx.stroke();

          ctx.beginPath();
          ctx.arc(p.x, p.y, 1.7 + 2.3 * (1 - lifeRatio), 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
          ctx.restore();
        }
      }

      _rand(min, max) { return min + Math.random() * (max - min); }
      _hsla(h, s, l, a) { return `hsla(${h} ${s}% ${l}% / ${a})`; }
    }

    const fw = new Fireworks('fwCanvas', {
      rocketMinSpeed: 7,
      rocketMaxSpeed: 10,
      gravity: 0.18,
      particleCount: 160,
      particleLife: 70,
      spawnInterval: 1000,
    });

    fw.start();
  </script>
</body>
</html>
