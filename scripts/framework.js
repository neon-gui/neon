window.NeonWidget = class {
    
}
window.BackgroundWidget = class extends NeonWidget {
    render(painter) {
        painter.fillStyle = "red";
        painter.fillRect(0,0,painter.canvas.width,painter.canvas.height);
    }
}
window.neonContainer = document.createElement("canvas");
window.bgWidget = new BackgroundWidget();
neonContainer.style.position = "absolute";
neonContainer.style.left = 0;
neonContainer.style.top = 0;
neonContainer.style.width = "100vw";
neonContainer.style.height = "100vh";
neonContainer.style.zIndex = 99999999;
neonContainer.paint = () => {
    neonContainer.width = innerWidth;
    neonContainer.height = innerHeight;
    window.neonPainter = neonContainer.getContext("2d");
    bgWidget.render(neonPainter);
    neonPainter.fillStyle = "black";
    neonPainter.fillRect(0,0,50,50);
}
setInterval(neonContainer.paint);
document.body.appendChild(neonContainer);