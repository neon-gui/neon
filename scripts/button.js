NeonButtonWidget = class extends NeonWidget {
    lightness = 1;
    clock = new Clock();
    text = "button";
    letterSpacing = 0;
    render_internal(painter, options) {
        this.clock.tick();
        var targetLightness = 1;
        if (options.isBeingHovered) {
            targetLightness = 1.3;
        }
        if (options.isBeingDragged) {
            targetLightness = 0.8;
        }
        this.lightness = Math.lerp(this.lightness, targetLightness, this.clock.deltaTime * 5);
        var targetLetterSpacing = 0;
        if (options.isBeingHovered) {
            targetLetterSpacing = 10;
        }
        if (options.isBeingDragged) {
            targetLetterSpacing = 2;
        }
        this.letterSpacing = Math.lerp(this.letterSpacing, targetLetterSpacing, this.clock.deltaTime * 15);
        options.addEventAbsorber({
            x: options.x,
            y: options.y,
            width: options.width,
            height: options.height,
            transform: painter.getTransform(),
            node: this
        });
        painter.letterSpacing = this.letterSpacing + "px";
        painter.fillStyle = options.primaryColor.multiply(this.lightness).toString();
        painter.beginPath();
        painter.roundRect(options.x, options.y, options.width, options.height, 10);
        painter.fill();
        painter.textBaseline = "middle";
        painter.textAlign = "center";
        painter.font = "20px Comfortaa";
        painter.fillStyle = `rgb(${255 * this.lightness},${255 * this.lightness},${255 * this.lightness})`;
        painter.fillText(this.text, options.x + options.width / 2, options.y + options.height / 2);
    }
    onclick() {
        this.lightness = 8;
        this.text = "clicked";
    }
}
