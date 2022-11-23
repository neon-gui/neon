// @corebuild staticEval

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
        this.tickDisplay = Math.lerp(this.tickDisplay, targetTickProgress, this.clock.deltaTime*10);
        options.addEventAbsorber({
            x:options.x,
            y:options.y,
            width:options.width,
            height:options.height,
            transform:painter.getTransform(),
            node:this
        });
        var tickDisplay0to1 = (this.tickDisplay + 1) / 2;
        painter.fillStyle = new NeonColor(128,128,128).lerp(options.primaryColor,tickDisplay0to1).multiply(this.lightness);
        painter.beginPath();
        painter.roundRect(options.x, options.y, options.width, options.height,10);
        painter.fill();
        var image = "<.>GITHUB_PAGES_PATH<.>textures/X.png";
        if (this.tickDisplay > 0) {
            image = "<.>GITHUB_PAGES_PATH<.>textures/tick.png";
        }
        var tickSize = options.width/2*this.tickDisplay;
        painter.drawImage(neonImage(image),options.x+options.width/2-tickSize/2, options.y+options.height/2-tickSize/2, tickSize, tickSize);
    }
    onclick() {
        this.ticked = !this.ticked;
    }
}
