// @corebuild staticEval

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

function propogate(object, settings) {
    var output = fork(object);
    Object.assign(settings, output);
    return output
}

Math.lerp = (a, b, t) => {
    return a * (1 - t) + b * t;
}
NeonWidget = class {
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
        if (!painter.clipStack) {
            painter.clipStack = [];
        }
        optionsClone.updateClip = () => {
            var transform = painter.getTransform();
            painter.restore();
            painter.setTransform(transform);
            for (var i in painter.clipStack) {
                var transform = painter.clipStack[i].transform.multiply(painter.getTransform().inverse());
                var topLeftCorner = new DOMPoint(painter.clipStack[i].clipRect.x, painter.clipStack[i].clipRect.y).matrixTransform(transform);
                var topRightCorner = new DOMPoint(painter.clipStack[i].clipRect.x + painter.clipStack[i].clipRect.width, painter.clipStack[i].clipRect.y).matrixTransform(transform);
                var bottomLeftCorner = new DOMPoint(painter.clipStack[i].clipRect.x, painter.clipStack[i].clipRect.y + painter.clipStack[i].clipRect.height).matrixTransform(transform);
                var bottomRightCorner = new DOMPoint(painter.clipStack[i].clipRect.x + painter.clipStack[i].clipRect.width, painter.clipStack[i].clipRect.y + painter.clipStack[i].clipRect.height).matrixTransform(transform);

                var path = new Path2D();
                path.moveTo(topLeftCorner.x, topLeftCorner.y);
                path.lineTo(topRightCorner.x, topRightCorner.y);
                path.lineTo(bottomRightCorner.x, bottomRightCorner.y);
                path.lineTo(bottomLeftCorner.x, bottomLeftCorner.y);
                path.lineTo(topLeftCorner.x, topLeftCorner.y);
                path.closePath();

                painter.clip(path);
            }
        }
        optionsClone.clip = (rect, callback) => {
            painter.clipStack.push({
                clipRect: rect,
                transform: painter.getTransform()
            });
            optionsClone.updateClip();
            callback();
            painter.clipStack.pop();
            optionsClone.updateClip();
        }
        this.render_internal(painter, optionsClone);
    }
}

NeonColor = class {
    r = 0;
    g = 0;
    b = 0;

    constructor(r, g, b) {
        this.r = r;
        this.g = g;
        this.b = b;
    }

    multiply(lightness) {
        return new NeonColor(this.r * lightness, this.g * lightness, this.b * lightness);
    }

    toString() {
        return `rgb(${this.r},${this.g},${this.b})`;
    }

    lerp(color, t) {
        return new NeonColor(Math.lerp(this.r, color.r, t), Math.lerp(this.g, color.g, t), Math.lerp(this.b, color.b, t));
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

Clock = class {
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

latestMouseEvent = new MouseEvent("mousemove", {
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
    neonContainer = document.createElement("canvas");
    bgWidget = new NeonBackgroundWidget();
    buttonWidget = new NeonButtonWidget();
    tickBoxWidget = new NeonTickboxWidget();
    switchWidget = new NeonSwitchWidget();

    neonContainer.style.position = "absolute";
    neonContainer.style.left = 0;
    neonContainer.style.top = 0;
    neonContainer.style.width = "100vw";
    neonContainer.style.height = "100vh";
    neonContainer.style.zIndex = 99999999;
    neonContainer.style.cursor = "none";
    neonImagePool = {};
    comfortaaElement = document.createElement("style");
    neonAbsorbers = [];
    currentlyHoveredNode = null;
    currentlyDraggedNode = null;
    neonMouseDown = false;
    badApple = new BadAppleWidget();
    comfortaaElement.innerText = `@import url('https://fonts.googleapis.com/css2?family=Comfortaa:wght@500&display=swap');`;
    document.body.appendChild(comfortaaElement);
    DOMRect.prototype.includes = function (point) {
        return point.x > this.left && point.x < this.right && point.y > this.top && point.y < this.bottom;
    };
    neonPainter = neonContainer.getContext("2d");
    neonPainter.save();
    neonContainer.paint = () => {
        neonAbsorbers = [];
        neonContainer.width = innerWidth;
        neonContainer.height = innerHeight;
        var primaryColor = new NeonColor(255, 64, 64); // blue is 64 128 255
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
            primaryColor: primaryColor
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
            primaryColor: primaryColor
        });
        tickBoxWidget.render(neonPainter, {
            x: 220,
            y: 10,
            width: 50,
            height: 50,
            primaryColor: primaryColor
        });
        switchWidget.render(neonPainter, {
            x: 280,
            y: 10,
            width: 50,
            height: 50,
            primaryColor: primaryColor
        });
        neonPainter.fillStyle = "white";
        neonPainter.fillRect(0, 0, innerWidth, innerHeight);
        var dvdLogo = neonImage("https://logos-download.com/wp-content/uploads/2016/07/DVD_logo.png");
        var progress = (new Date().getTime() / 4000) % 2;
        if (progress > 1) {
            progress = 2 - progress;
        }
        console.log(progress);
        var sizeMultiplier = 0.1;
        neonPainter.fillStyle = "black";
        neonPainter.drawImage(dvdLogo, Math.lerp(0, innerWidth - (dvdLogo.width * sizeMultiplier), progress), Math.lerp(innerHeight - (dvdLogo.height * sizeMultiplier), 0, progress), dvdLogo.width * sizeMultiplier, dvdLogo.height * sizeMultiplier);
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
    neonImage = function (src) {
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
});
