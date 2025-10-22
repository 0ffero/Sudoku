class PositionedImage {
    constructor(containerName, details={}) {
        this.containerName = containerName;
        this.container = document.getElementById(this.containerName);

        this.setImageAndData(details);
    }

    positionImage() {
        if (!this.container) {
            console.error(`Container with id ${this.containerName} not found.`);
            return;
        };
        this.container.style.backgroundImage = `url(${this.details.imageSource})`;
        this.container.style.backgroundPositionY = this.details.positionY || 'center';
        this.container.style.backgroundRepeat = this.details.backgroundRepeat;
        this.container.style.backgroundSize = this.details.backgroundSize;
        this.container.style.backgroundBlendMode = this.details.blendMode;
    }

    setImageAndData(details) {
        this.details = {
            imageSource: `./images/backgrounds/${details.src}` || 'ERROR',
            positionY: details.positionY,
            backgroundRepeat: details.repeat || 'no-repeat',
            backgroundSize: details.size || 'auto',
            blendMode: details.blendMode || 'normal'
        };

        if (this.details.imageSource === 'ERROR') {
            let error = 'Image source is required! Unable to continue.';
            return error;
        };

        this.positionImage();

    }
}

console.warn('PositionedImageClass.js loaded successfully.\nActual call is disabled currently...');
let available = {
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
let defaults = available.mountainsOverlay;
/* vars.positionedImaged = new PositionedImage('mainContainer', defaults); */