NeonBackgroundWidget = class extends NeonWidget {
    render_internal(painter, options) {
        var maximumSize = math.max(latestMouseEvent.clientX, latestMouseEvent.clientY, options.width - latestMouseEvent.clientX, options.height - latestMouseEvent.clientY) * 2;
        for (var i = maximumSize; i > 0; i -= 50) {
            painter.fillStyle = `hsl(${((new Date().getTime() / 50) + (i / 5)) % 360},100%,20%)`;
            //painter.fillRect(options.x, options.y, options.width, options.height);    
            painter.beginPath();
            painter.roundRect(latestMouseEvent.clientX - i, latestMouseEvent.clientY - i, i * 2, i * 2, i);
            painter.fill();
        }
    }
}
