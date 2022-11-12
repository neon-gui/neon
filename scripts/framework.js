window.math = window.Math;
window.NeonWidget = class {
    render(painter, options) {
        var optionsClone = structuredClone(options);
        this.render_internal(painter, optionsClone);
    }
}
window.NeonBackgroundWidget = class extends NeonWidget {
    render_internal(painter, options) {
        var maximumSize = math.max(latestMouseEvent.clientX, latestMouseEvent.clientY, options.width - latestMouseEvent.clientX, options.height - latestMouseEvent.clientY)*2;
        for (var i = maximumSize; i > 0; i-=50) {
            painter.fillStyle = `hsl(${((new Date().getTime() / 50) + (i/5)) % 360},100%,20%)`;
            //painter.fillRect(options.x, options.y, options.width, options.height);    
            painter.beginPath();
            painter.roundRect(latestMouseEvent.clientX - i, latestMouseEvent.clientY - i, i * 2, i * 2,i);
            painter.fill();
        }
    }
}

window.NeonButtonWidget = class extends NeonWidget {
    render_internal(painter, options) {
        painter.addEventAbsorber({
            x:options.x,
            y:options.y,
            width:options.width,
            height:options.height,
            transform:painter.getTransform(),
            node:this
        });
        painter.fillStyle = "rgb(32,128,255)";
        painter.beginPath();
        painter.roundRect(options.x, options.y, options.width, options.height,10);
        painter.fill();
        painter.textBaseline = "middle";
        painter.textAlign = "center";
        painter.font = "20px Comfortaa";
        painter.fillStyle = "white";
        painter.fillText("button",options.x+options.width/2, options.y+options.height/2);
    }
}

window.Clock = class {
    #lastTime;
    #internalDeltaTime;
    get deltaTime() {
        return this.#internalDeltaTime;
    }
    tick() {
        var currentTime = this.preciseTime();
        if (!this.#lastTime) {
            this.#lastTime = currentTime;
        }
        this.#internalDeltaTime = (currentTime - this.#lastTime) / 1000;
        this.#lastTime = currentTime;
    }
    preciseTime() {
        if (!!window.Temporal) {
            return Temporal.Now.instant();
        }
        if (!!window.performance) {
            return performance.now();
        }
        if (!!window.Date) {
            return new Date().getTime();
        }
        throw new Error("Clock is not available in your browser.");
    }
}

window.neonContainer = document.createElement("canvas");
window.bgWidget = new NeonBackgroundWidget();
window.buttonWidget = new NeonButtonWidget();
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
var comfortaaElement = document.createElement("style");
var neonAbsorbers = [];
var currentlyHoveredNode;
comfortaaElement.innerText = `@import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@500&display=swap');`;
document.body.appendChild(comfortaaElement);
DOMRect.prototype.includes = (point) => {
    return point.x > this.left && point.x < this.right && point.y > this.top && point.y < this.bottom;
}
neonContainer.paint = () => {
    neonAbsorbers = [];
    neonContainer.width = innerWidth;
    neonContainer.height = innerHeight;
    window.neonPainter = neonContainer.getContext("2d");
    neonPainter.addEventAbsorber = (absorber) => {
        neonAbsorbers.push(absorber);
    }
    bgWidget.render(neonPainter, {
        x: 0,
        y: 0,
        width: neonPainter.canvas.width,
        height: neonPainter.canvas.height
    });
    buttonWidget.render(neonPainter, {
        x: 10,
        y: 10,
        width: 300,
        height: 50
    });
    neonPainter.fillStyle = "black";
    var cursor = "https://codelikecraze.github.io/neon/cursors/pointer.png";
    neonPainter.drawImage(neonImage(cursor), latestMouseEvent.clientX, latestMouseEvent.clientY, 20, neonImage(cursor).height / neonImage(cursor).width * 20);
    currentlyHoveredNode = null;
    for (var i in neonAbsorbers) {
        var inverselyTransformedPoint = neonAbsorbers[i].transform.inverse().transformPoint(latestMouseEvent.clientX, latestMouseEvent.clientY);
        if (new DOMRect(neonAbsorbers[i].x,neonAbsorbers[i].y,neonAbsorbers[i].width,neonAbsorbers[i].height).includes(inverselyTransformedPoint)) {
            currentlyHoveredNode = neonAbsorbers[i].node;
        }
    }
    console.log(currentlyHoveredNode);
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