window.NeonSwitchWidget = class extends NeonWidget {
    circleSize = 0;
    clock = new Clock();
    ticked = false;
    tickDisplay = -1;
    render_internal(painter, options) {
        this.clock.tick();
        var height = 20;
        var circleSize = height;
        if (options.isBeingHovered) {
            circleSize *= 0.64;
        }
        if (options.isBeingDragged) {
            circleSize *= 0.64;
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
        painter.fillStyle = `rgb(64,64,64)`;
        painter.beginPath();
        painter.roundRect(options.x, options.y + (-height + options.width) / 2, options.width, height,height);
        painter.fill();

        painter.fillStyle = `rgb(32,128,255)`;
        painter.beginPath();
        painter.roundRect(options.x, options.y + (-height + options.width) / 2, Math.lerp(height,options.width,this.tickDisplay), height,height);
        painter.fill();

        painter.fillStyle = `white`;
        painter.beginPath();
        painter.roundRect(Math.lerp(options.x,options.x+options.width-height,this.tickDisplay)+(height-this.circleSize)/2, options.y + (-this.circleSize + options.width) / 2, this.circleSize,this.circleSize,height);
        painter.fill();
    }
    onclick() {
        this.ticked = !this.ticked;
    }
}
