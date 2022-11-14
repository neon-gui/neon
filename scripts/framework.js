if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = CanvasRenderingContext2D.prototype.rect;
}
window.Math.lerp = (a, b, t) => {
    return a * (1 - t) + b * t;
}
window.math = window.Math;
window.NeonWidget = class {
    previouslyClicked = false;
    render(painter, options) {
        var optionsClone = structuredClone(filterObject(options, ["addEventAbsorber"]));
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

function filterObject(object, fields) {
    var output = {};
    for (var i in object) {
        if (!fields.includes(i)) {
            output[i] = object[i];
        }
    }
    return output;
}

window.Clock = class {
    #lastTime;
    #internalDeltaTime;
    get deltaTime() {
        return Math.min(this.#internalDeltaTime, 0.1);
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

xpkg.onloads.push(() => {
    window.neonContainer = document.createElement("canvas");
    window.bgWidget = new NeonBackgroundWidget();
    window.buttonWidget = new NeonButtonWidget();
    window.tickBoxWidget = new NeonTickboxWidget();

    neonContainer.style.position = "absolute";
    neonContainer.style.left = 0;
    neonContainer.style.top = 0;
    neonContainer.style.width = "100vw";
    neonContainer.style.height = "100vh";
    neonContainer.style.zIndex = 99999999;
    neonContainer.style.cursor = "none";
    window.neonImagePool = {};
    window.comfortaaElement = document.createElement("style");
    window.neonAbsorbers = [];
    window.currentlyHoveredNode = null;
    window.currentlyDraggedNode = null;
    window.neonMouseDown = false;
    window.badApple = new BadAppleWidget();
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
        badApple.render(neonPainter, {
            x: 0,
            y: 0,
            width: neonPainter.canvas.width,
            height: neonPainter.canvas.height
        });
        /*
        bgWidget.render(neonPainter, {
            x: 0,
            y: 0,
            width: neonPainter.canvas.width,
            height: neonPainter.canvas.height
        });
        buttonWidget.render(neonPainter, {
            x: 10,
            y: 10,
            width: 200,
            height: 200
        });
        tickBoxWidget.render(neonPainter, {
            x: 220,
            y: 10,
            width: 50,
            height: 50
        });
        */
        neonPainter.fillStyle = "black";
        var cursor = "https://codelikecraze.github.io/neon/cursors/pointer.png";
        neonPainter.resetTransform();
        neonPainter.drawImage(neonImage(cursor), latestMouseEvent.clientX, latestMouseEvent.clientY, 20, neonImage(cursor).height / neonImage(cursor).width * 20);
        currentlyHoveredNode = null;
        for (var i in neonAbsorbers) {
            var inverselyTransformedPoint = neonAbsorbers[i].transform.inverse().transformPoint(new DOMPoint(latestMouseEvent.clientX, latestMouseEvent.clientY));
            if (new DOMRect(neonAbsorbers[i].x, neonAbsorbers[i].y, neonAbsorbers[i].width, neonAbsorbers[i].height).includes(inverselyTransformedPoint)) {
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
            document.body.appendChild(neonImagePool[src]);
            neonImagePool[src].src = src;
        }
        return neonImagePool[src];
    }
    neonContainer.onmousemove = (e) => {
        latestMouseEvent = e;
    }
    setInterval(neonContainer.paint);
    document.body.appendChild(neonContainer);
});