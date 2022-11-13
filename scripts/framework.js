window.Math.lerp = (a,b,t) => {
    return a*(1-t) + b*t;
}
window.math = window.Math;
window.NeonWidget = class {
    previouslyClicked = false;
    render(painter, options) {
        var optionsClone = structuredClone(options);
        optionsClone.isBeingHovered = this == currentlyHoveredNode;
        var isClicked = this == currentlyDraggedNode && neonMouseDown;
        if (isClicked != this.previouslyClicked) {
            this.previouslyClicked = isClicked;
            if (isClicked) {
                if (!!this.onclick) {
                    this.onclick();
                }
            } else {
                if (!!this.onunclick) {
                    this.onunclick();
                }   
            }
        }
        optionsClone.isBeingDragged = isClicked;
        optionsClone.addEventAbsorber = (absorber) => {
            neonAbsorbers.push(absorber);
        }
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
        this.lightness = Math.lerp(this.lightness, targetLightness, this.clock.deltaTime*5);
        var targetLetterSpacing = 0;
        if (options.isBeingHovered) {
            targetLetterSpacing = 10;
        }
        if (options.isBeingDragged) {
            targetLetterSpacing = 2;
        }
        this.letterSpacing = Math.lerp(this.letterSpacing, targetLetterSpacing, this.clock.deltaTime*15);
        options.addEventAbsorber({
            x:options.x,
            y:options.y,
            width:options.width,
            height:options.height,
            transform:painter.getTransform(),
            node:this
        });
        painter.letterSpacing = this.letterSpacing + "px";
        painter.fillStyle = `rgb(${32*this.lightness},${128*this.lightness},${255*this.lightness})`;
        painter.beginPath();
        painter.roundRect(options.x, options.y, options.width, options.height,10);
        painter.fill();
        painter.textBaseline = "middle";
        painter.textAlign = "center";
        painter.font = "20px Comfortaa";
        painter.fillStyle = `rgb(${255*this.lightness},${255*this.lightness},${255*this.lightness})`;
        painter.fillText(this.text,options.x+options.width/2, options.y+options.height/2);
    }
    onclick() {
        this.lightness = 8;
        this.text = "clicked";
    }
}

window.Clock = class {
    #lastTime;
    #internalDeltaTime;
    get deltaTime() {
        return Math.min(this.#internalDeltaTime,0.1);
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
window.onmousedown = () => {
    neonMouseDown = true;
}
window.onmouseup = () => {
    neonMouseDown = false;
}
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
var currentlyDraggedNode;
var neonMouseDown = false;
comfortaaElement.innerText = `@import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@500&display=swap');`;
document.body.appendChild(comfortaaElement);
DOMRect.prototype.includes = function (point) {
    return point.x > this.left && point.x < this.right && point.y > this.top && point.y < this.bottom;
};
neonContainer.paint = () => {
    neonAbsorbers = [];
    neonContainer.width = innerWidth;
    neonContainer.height = innerHeight;
    window.neonPainter = neonContainer.getContext("2d");
    neonPainter.resetTransform();
    bgWidget.render(neonPainter, {
        x: 0,
        y: 0,
        width: neonPainter.canvas.width,
        height: neonPainter.canvas.height
    });
    neonPainter.translate(100,100);
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
        var inverselyTransformedPoint = neonAbsorbers[i].transform.inverse().transformPoint(new DOMPoint(latestMouseEvent.clientX, latestMouseEvent.clientY));
        if (new DOMRect(neonAbsorbers[i].x,neonAbsorbers[i].y,neonAbsorbers[i].width,neonAbsorbers[i].height).includes(inverselyTransformedPoint)) {
            currentlyHoveredNode = neonAbsorbers[i].node;
        }
    }
    if (!neonMouseDown) {
        currentlyDraggedNode = currentlyHoveredNode;
    }
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