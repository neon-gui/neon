window.NeonWidget = class {
    render(painter, options) {
        var optionsClone = structuredClone(options);
        this.render_internal(painter, optionsClone);
    }
}
window.BackgroundWidget = class extends NeonWidget {
    render_internal(painter, options) {
        var maximumSize = math.max(latestMouseEvent.clientX, latestMouseEvent.clientY, options.width - latestMouseEvent.clientX, options.height - latestMouseEvent.clientY)
        for (var i = maximumSize; i > 0; i--) {
            painter.fillStyle = `hsl(${((new Date().getTime() / 10) + i) % 360},100%,50%)`;
            //painter.fillRect(options.x, options.y, options.width, options.height);    
            painter.fillRect(latestMouseEvent.clientX - i, latestMouseEvent.clientY - i, i * 2, i * 2);
        }
    }
}
window.neonContainer = document.createElement("canvas");
window.bgWidget = new BackgroundWidget();
window.latestMouseEvent = new MouseEvent("mousemove", {
    clientX: 0,
    clientY: 0
});
neonContainer.style.position = "absolute";
neonContainer.style.left = 0;
neonContainer.style.top = 0;
neonContainer.style.width = "100vw";
neonContainer.style.height = "100vh";
neonContainer.style.zIndex = 99999999;
neonContainer.style.cursor = "none";
var neonImagePool = {};
neonContainer.paint = () => {
    neonContainer.width = innerWidth;
    neonContainer.height = innerHeight;
    window.neonPainter = neonContainer.getContext("2d");
    bgWidget.render(neonPainter, {
        x: 0,
        y: 0,
        width: neonPainter.canvas.width,
        height: neonPainter.canvas.height
    });
    neonPainter.fillStyle = "black";
    var cursor = "https://codelikecraze.github.io/neon/cursors/PointerCursor.png";
    neonPainter.drawImage(neonImage(cursor), latestMouseEvent.clientX, latestMouseEvent.clientY, 20, neonImage(cursor).height / neonImage(cursor).width * 20);
}
window.neonImage = function (src) {
    if (!neonImagePool[src]) {
        neonImagePool[src] = document.createElement("img");
        neonImagePool[src].src = src;
    }
    return neonImagePool[src];
}
neonContainer.onmousemove = (e) => {
    latestMouseEvent = e;
}
setInterval(neonContainer.paint);
document.body.appendChild(neonContainer);