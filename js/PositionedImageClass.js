class PositionedImage {
    constructor(containerName, which) {
        this.clCSS = 'font-weight: bold; color: purple; background-color: #ffffff; font-size: 13px;';
        console.log('%cPositionedImageClass.js initialising...', this.clCSS);

        this.containerName = containerName;
        this.container = document.getElementById(this.containerName);

        this.initAvailabeImages();

        if (!which) {
            console.log(`  > %cNo image specified. Initialisation succesful.`, this.clCSS);
            return;
        };

        this.setImageAndData(which)

    }

    initAvailabeImages() {
        this.available = {
            eagle: {
                src: 'bgEagle.png',
                blendMode: 'overlay',
                positionY: 'top',
                repeat: 'repeat',
                size: 'auto'
            },
            mountainsNormal: {
                src: 'bgMountainsNormal.png',
                blendMode: 'normal',
                positionY: 'bottom',
                repeat: 'repeat-x',
                size: 'contain'
            },
            mountainsOverlay: {
                src: 'bgMountainsOverlay.png',
                blendMode: 'overlay',
                positionY: 'bottom',
                repeat: 'repeat-x',
                size: 'contain'
            },
            snake: {
                src: 'bgSnake.png',
                blendMode: 'overlay',
                positionY: 'top',
                repeat: 'repeat',
                size: 'auto'
            },
            tiger: {
                src: 'bgTiger.png',
                blendMode: 'overlay',
                positionY: 'top',
                repeat: 'repeat',
                size: 'auto'
            }
        };
        console.log(`  > %cFinished initialising available images.`, this.clCSS);
    }

    checkIfValid(which) {
        return this.available.hasOwnProperty(which);
    }

    getTypes() {
        return Object.keys(this.available);
    }

    positionImage() {
        if (!this.container) {
            console.error(`Container with id ${this.containerName} not found.`);
            return;
        };

        this.container.style.backgroundImage = `url(./images/backgrounds/${this.details.src})`;
        this.container.style.backgroundPositionY = this.details.positionY;
        this.container.style.backgroundRepeat = this.details.repeat;
        this.container.style.backgroundSize = this.details.size;
        this.container.style.backgroundBlendMode = this.details.blendMode;
    }

    setImageAndData(which=null) {
        if (which===null || which==='none') {
            vars.positionedImage = 'none';
            return;
        };

        this.which = which;
        this.details = this.available[this.which];
        if (!this.details) {
            let msg = `No image details found for key: ${this.which}.\nUnable to continue.`;
            console.error(msg);
            alert(msg);
            debugger;
            return;
        };
        this.positionImage();
    }
};