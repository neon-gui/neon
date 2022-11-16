window.NeonSwitchWidget = class extends NeonWidget {
    circleSize = 0;
    clock = new Clock();
    ticked = false;
    tickDisplay = -1;
    render_internal(painter, options) {
        this.clock.tick();
        var height = 30;
        var circleSize = height;
        if (options.isBeingHovered) {
            circleSize *= 0.8;
        }
        if (options.isBeingDragged) {
            circleSize *= 0.8;
        }
        this.circleSize = Math.lerp(this.circleSize, circleSize, this.clock.deltaTime*5);
        var targetTickProgress = 0;
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
        painter.fillStyle = `rgb(32,32,32)`;
        painter.beginPath();
        painter.roundRect(options.x, options.y + (height + options.width) / 2, options.width, height,10);
        painter.fill();

        painter.fillStyle = `rgb(32,128,255)`;
        painter.beginPath();
        painter.roundRect(options.x, options.y + (height + options.width) / 2, Math.lerp(height,options.width,this.tickDisplay), height,10);
        painter.fill();
        var image = "https://codelikecraze.github.io/neon/textures/X.png";
        if (this.tickDisplay > 0) {
            image = "https://codelikecraze.github.io/neon/textures/tick.png";
        }
        var tickSize = options.width/2*this.tickDisplay;
        painter.drawImage(neonImage(image),options.x+options.width/2-tickSize/2, options.y+options.height/2-tickSize/2, tickSize, tickSize);
    }
    onclick() {
        this.ticked = !this.ticked;
    }
}
