class LevelAndPointsClass {
    constructor(canvasId, opts = {}) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) throw new Error('Canvas not found: ' + canvasId);

        // desired CSS size (use attribute first, then client size, then fallback)
        const cssSize = (this.canvas.getAttribute('width') && +this.canvas.getAttribute('width')) ||
            this.canvas.clientWidth || 150;

        this.size = cssSize;
        this.center = this.size / 2;

        // HiDPI scaling
        // const dpr = window.devicePixelRatio || 1; no longer used, fixed at 2x for sharpness when scaling canvas up to 2x
        this.canvas.width = Math.round(this.size * 2);
        this.canvas.height = Math.round(this.size * 2);
        this.canvas.style.width = `${this.size}px`;
        this.canvas.style.height = `${this.size}px`;
        this.ctx = this.canvas.getContext('2d');
        this.ctx.setTransform(2, 0, 0, 2, 0, 0); // scale context

        // geometry
        this.outerTrackWidth = opts.outerTrackWidth ?? 12;
        this.outerRadius = this.center - 8;                     // radius used by the outer arc
        this.innerRadius = opts.innerRadius ?? Math.round(this.size * 0.28); // inner filled circle

        // colors
        this.colors = {
            baseRingDark: opts.baseRingDark ?? '#0f3b23',
            baseRingSoft: opts.baseRingSoft ?? 'rgba(255,255,255,0.03)',
            innerCenter: opts.innerCenter ?? '#0b2f1a',
            innerEdge: opts.innerEdge ?? '#123f27',
            text: opts.text ?? '#ffffff',
            gradientStops: opts.gradientStops ?? [
                { pos: 0.0, col: '#fff8c2' }, // pale/light yellow at start (0%)
                { pos: 0.5, col: '#ffdf3f' }, // yellow mid
                { pos: 1.0, col: '#36e84b' }  // green end
            ]
        };

        // text style
        this.fontSize = opts.fontSize ?? 28;
        this.fontFamily = opts.fontFamily ?? 'system-ui, Arial, sans-serif';
    }

    // clamp percent 0..100
    clampPercent(p) {
        p = Math.max(0, Math.min(100, Math.round(p)));
        return p;
    }

    draw(level, percent) {
        percent = this.clampPercent(percent);
        const ctx = this.ctx;
        const c = this.center;

        // clear
        ctx.clearRect(0, 0, this.size, this.size);

        // ---------- Base outer rings (faint) ----------
        // subtle outer halo
        ctx.beginPath();
        ctx.arc(c, c, this.outerRadius, 0, Math.PI * 2);
        ctx.lineWidth = this.outerTrackWidth + 6;
        ctx.strokeStyle = this.colors.baseRingSoft;
        ctx.stroke();

        // darker ring inside it for depth
        ctx.beginPath();
        ctx.arc(c, c, this.outerRadius, 0, Math.PI * 2);
        ctx.lineWidth = this.outerTrackWidth;
        ctx.strokeStyle = this.colors.baseRingDark;
        ctx.stroke();

        // ---------- Progress arc with gradient ----------
        if (percent > 0) {
            const startAngle = -Math.PI / 2; // top
            const endAngle = startAngle + (Math.PI * 2 * (percent / 100));

            // Create a linear gradient across the canvas diagonal so colors flow along the arc visually.
            const grad = ctx.createLinearGradient(c - this.outerRadius, c - this.outerRadius, c + this.outerRadius, c + this.outerRadius);
            for (const stop of this.colors.gradientStops) {
                grad.addColorStop(stop.pos, stop.col);
            }

            ctx.beginPath();
            ctx.arc(c, c, this.outerRadius, startAngle, endAngle, false);
            ctx.lineWidth = this.outerTrackWidth;
            ctx.lineCap = 'round';
            ctx.strokeStyle = grad;
            ctx.stroke();
        }

        // small notch at start (optional subtle highlight) - keeps look consistent for very small values
        // draw a short faint highlight at the starting position
        ctx.beginPath();
        const notchAngle = -Math.PI / 2;
        const notchRadius = this.outerRadius;
        const notchX = c + Math.cos(notchAngle) * notchRadius;
        const notchY = c + Math.sin(notchAngle) * notchRadius;
        ctx.fillStyle = 'rgba(255,255,255,0.03)';
        ctx.beginPath();
        ctx.arc(notchX, notchY, 1.6, 0, Math.PI * 2);
        ctx.fill();

        // ---------- Inner filled circle behind the number ----------
        // radial gradient to give a subtle depth to the inner circle
        const rg = ctx.createRadialGradient(c, c, Math.max(4, this.innerRadius * 0.2), c, c, this.innerRadius);
        rg.addColorStop(0, this.colors.innerCenter);
        rg.addColorStop(1, this.colors.innerEdge);

        ctx.beginPath();
        ctx.arc(c, c, this.innerRadius, 0, Math.PI * 2);
        ctx.fillStyle = rg;
        ctx.fill();

        // thin inner ring highlight
        ctx.beginPath();
        ctx.arc(c, c, this.innerRadius, 0, Math.PI * 2);
        ctx.lineWidth = 2;
        ctx.strokeStyle = 'rgba(255,255,255,0.03)';
        ctx.stroke();

        // subtle inner dark border just inside the inner circle (for the double-ring look)
        ctx.beginPath();
        ctx.arc(c, c, this.innerRadius - 2.5, 0, Math.PI * 2);
        ctx.lineWidth = 1;
        ctx.strokeStyle = 'rgba(0,0,0,0.25)';
        ctx.stroke();

        // ---------- Level text ----------
        ctx.fillStyle = this.colors.text;
        ctx.font = `bold ${this.fontSize}px ${this.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // optional soft shadow (keeps the white number readable)
        ctx.save();
        ctx.shadowColor = 'rgba(0,0,0,0.45)';
        ctx.shadowBlur = 6;
        ctx.fillText(String(level), c, c);
        ctx.restore();
    }
}