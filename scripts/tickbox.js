window.NeonTickboxWidget = class extends NeonWidget {
    lightness = 1;
    clock = new Clock();
    ticked = false;
    tickDisplay = -1;
    render_internal(painter, options) {
        this.clock.tick();
        var targetLightness = 1;
        if (options.isBeingHovered) {
            targetLightness = 1.3;
        }
        if (options.isBeingDragged) {
            targetLightness = 0.8;
        }
        this.lightness = Math.lerp(this.lightness, targetLightness, this.clock.deltaTime*5);
        var targetTickProgress = -1;
        if (this.ticked) {
            targetTickProgress = 1;
        }
        this.tickDisplay = Math.lerp(this.tickDisplay, targetTickProgress, this.clock.deltaTime*5);
        options.addEventAbsorber({
            x:options.x,
            y:options.y,
            width:options.width,
            height:options.height,
            transform:painter.getTransform(),
            node:this
        });
        painter.fillStyle = `rgb(${32*this.lightness},${128*this.lightness},${255*this.lightness})`;
        painter.beginPath();
        painter.roundRect(options.x, options.y, options.width, options.height,10);
        painter.fill();
        var image = "https://codelikecraze.github.io/neon/textures/X.png";
        if (this.tickDisplay > 0) {
            "https://codelikecraze.github.io/neon/textures/tick.png"
        }
        var tickSize = options.width/2*this.tickDisplay;
        painter.drawImage(neonImage(image),options.x+options.width/2-tickSize/2, options.y+options.height/2-tickSize/2, tickSize, tickSize);
    }
    onclick() {
        this.lightness = 8;
        this.ticked = !this.ticked;
    }
}