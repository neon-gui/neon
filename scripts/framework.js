window.NeonWidget = class {
    
}
window.BackgroundWidget = class extends NeonWidget {
    render(painter) {
        painter.fillStyle = `hsl(${(new Date().getTime() / 10) % 360},100%,50%)`;
        painter.fillRect(0,0,painter.canvas.width,painter.canvas.height);
    }
}
window.neonContainer = document.createElement("canvas");
window.bgWidget = new BackgroundWidget();
window.latestMouseEvent = null;
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
    bgWidget.render(neonPainter);
    neonPainter.fillStyle = "black";
    if (!!latestMouseEvent) {
        var cursor = "https://codelikecraze.github.io/neon/cursors/PointerCursor.png";
        neonPainter.drawImage(neonImage(cursor),latestMouseEvent.clientX,latestMouseEvent.clientY,20,neonImage(cursor).height/neonImage(cursor).width*20);
    }
}
window.neonImage = function(src) {
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