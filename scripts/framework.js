window.NeonWidget = class {
    
}
window.neonContainer = document.createElement("canvas");
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
    neonPainter.fillStyle = "black";
    neonPainter.fillRect(0,0,50,50);
}
setInterval(neonContainer.paint);
document.body.appendChild(neonContainer);