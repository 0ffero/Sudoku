class ImageField {
    constructor(canvas, spriteData = null) {
        this.version = 1.1;

        this.canvas = canvas;
        this.ctx = canvas.getContext("2d");
        this.rates = [-3,-2,-1,1,2,3];
        this.blockSize = 168;
        this.bgTint = spriteData.bgTint || '#ffffff80'; // background tint color with alpha

        this.imageSize = spriteData.spriteSizeW || 'ERROR';  // width and height of each sprite in the sprite sheet
        if (this.imageSize === 'ERROR') {
            let error = 'spriteData.spriteSizeW is required! Unable to continue.';
            return error;
        };

        this.imageSource = spriteData.imageSrc || 'ERROR';  // path to the sprite sheet image
        if (this.imageSource === 'ERROR') {
            let error = 'spriteData.imageSrc is required! Unable to continue.';
            return error;
        };

        this.images = [];
        this._loadImage(this.imageSource);
        window.addEventListener("resize", () => this.setup());

        console.log(`ImageField class v${this.version} initialized.`);
    }

    _changeImage(imgSrc, imgSize=0) {
        vars.DEBUG && console.log(`ImageField: Changing image to ${imgSrc} with size ${imgSize}`);
        this.stop();
        if (!imgSrc || !imgSize) {
            console.error('No image source or size provided for _changeImage.');
            return;
        };

        this.imageSize = imgSize;
        this._loadImage(imgSrc);
    }

    _changeTint(tint) {
        vars.DEBUG && console.log(`ImageField: Changing tint to ${tint}`);
        this.stop();
        if (!tint) {
            console.error('No tint color provided for _changeTint.');
            return;
        };
        this.bgTint = tint;
        this.setup();
        this.animate();
    }

    _loadImage(imgSrc) {
        vars.DEBUG && console.log(`  ImageField: Loading image from ${imgSrc}`);
        this.image = new Image();
        this.image.src = imgSrc;
        this.image.onload = () => {
            vars.DEBUG && console.log(`  ImageField: Image loaded successfully.`);
            this.imageCount = this.image.width / this.imageSize;
            this.setup();
            this.animate();
        };
    }

    setup() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.images = [];
        const cols = Math.ceil(this.canvas.width / this.blockSize);
        const rows = Math.ceil(this.canvas.height / this.blockSize);
        let scales = [8,9,10,11,12];

        for (let y = 0; y < rows; y++) {
            for (let x = 0; x < cols; x++) {
                const scale = rnd(scales) / 10;
                const rate = rnd(this.rates) / 1000;
                const imageIndex = Math.floor(Math.random() * this.imageCount);
                this.images.push({
                    x: x * this.blockSize + this.blockSize / 2,
                    y: y * this.blockSize + this.blockSize / 2,
                    scale,
                    angle: Math.random() * Math.PI * 2,
                    rate,
                    imageIndex
                });
            };
        };
    }

    drawImage(image) {
        const { ctx, imageSize } = this;
        const sx = image.imageIndex * imageSize;
        const sy = 0;
        const sSize = imageSize;
        const dSize = imageSize * image.scale;

        ctx.save();
        ctx.translate(image.x, image.y);
        ctx.rotate(image.angle);
        ctx.drawImage(this.image, sx, sy, sSize, sSize, -dSize / 2, -dSize / 2, dSize, dSize);

        ctx.restore();
    }

    animate() {
        this.animationFrame = requestAnimationFrame(() => this.animate());
        const ctx = this.ctx;
        ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        for (let image of this.images) {
            image.angle += image.rate;
            this.drawImage(image);
        };

        this.ctx.fillStyle = this.bgTint;   // your tint color with alpha
        this.ctx.globalCompositeOperation = "source-atop";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.globalCompositeOperation = "source-over";

    }

    stop() {
        cancelAnimationFrame(this.animationFrame);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.images = [];
    }
}