//@corebuild staticEval

if (!CanvasRenderingContext2D.prototype.roundRect) {
    CanvasRenderingContext2D.prototype.roundRect = CanvasRenderingContext2D.prototype.rect;
}

function fork(object) {
    if (typeof object == "number" || object == null || object == true || object == false || object instanceof Function) {
        return object;
    }
    var output = new object.constructor();
    for (var i in object) {
        output[i] = fork(object[i]);
    }
    return output;
}

window.Math.lerp = (a, b, t) => {
    return a * (1 - t) + b * t;
}
window.math = window.Math;
window.NeonWidget = class {
    previouslyClicked = false;
    render(painter, options) {
        var optionsClone = fork(options);
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

window.NeonColor = class {
    r = 0;
    g = 0;
    b = 0;

    constructor(r,g,b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    multiply(lightness) {
        return new NeonColor(this.r*lightness, this.g*lightness, this.b*lightness);
    }

    toString() {
        return `rgb(${this.r},${this.g},${this.b})`;
    }

    lerp(color,t) {
        return new NeonColor(Math.lerp(this.r,color.r,t),Math.lerp(this.g,color.g,t),Math.lerp(this.b,color.b,t));
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
    window.switchWidget = new NeonSwitchWidget();

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
        var primaryColor = new NeonColor(255,64,64); // blue is 64 128 255
        neonPainter.resetTransform();
        /*badApple.render(neonPainter, {
            x: 0,
            y: 0,
            width: neonPainter.canvas.width,
            height: neonPainter.canvas.height
        });*/
        bgWidget.render(neonPainter, {
            x: 0,
            y: 0,
            width: neonPainter.canvas.width,
            height: neonPainter.canvas.height,
            primaryColor:primaryColor
        });
        buttonWidget.text = "Back";
        buttonWidget.onclick = () => {
            neonPainter.canvas.remove();
        };
        buttonWidget.render(neonPainter, {
            x: 10,
            y: 10,
            width: 200,
            height: 200,
            primaryColor:primaryColor
        });
        tickBoxWidget.render(neonPainter, {
            x: 220,
            y: 10,
            width: 50,
            height: 50,
            primaryColor:primaryColor
        });
        switchWidget.render(neonPainter, {
            x: 280,
            y: 10,
            width: 50,
            height: 50,
            primaryColor:primaryColor
        });
        neonPainter.fillStyle = "black";
        var cursor = "<.>GITHUB_PAGES_PATH<.>cursors/pointer.png";
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