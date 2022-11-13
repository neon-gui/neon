window.NeonTickboxWidget = class extends NeonWidget {
    lightness = 1;
    clock = new Clock();
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
        painter.drawImage(neonImage("https://codelikecraze.github.io/neon/textures/Tickbox.png"),options.x, options.y, options.width, options.height)
    }
    onclick() {
        this.lightness = 8;
    }
}
