function inEllipse(centerX, centerY, radiusX, radiusY, otherX, otherY) {
    return pow(otherX - centerX, 2) / pow(radiusX, 2) + pow(otherY - centerY, 2) / pow(radiusY, 2) <= 1;
}
function inTriangle(x1, y1, x2, y2, x3, y3, otherX, otherY) {
    let areaOrig = abs((x1*(y2-y3) + x2*(y3-y1) + x3*(y1-y2))/2.0);
    let area1 = abs((otherX*(y2-y3) + x2*(y3-otherY) + x3*(otherY-y2))/2.0);
    let area2 = abs((x1*(otherY-y3) + otherX*(y3-y1) + x3*(y1-otherY))/2.0);
    let area3 = abs((x1*(y2-otherY) + x2*(otherY-y1) + otherX*(y1-y2))/2.0);
    return areaOrig == area1 + area2 + area3;
}
function sc(x, gridSize) {
    return x * gridSize;
}
function cc(x, gridSize) {
    return x * gridSize + gridSize / 2;
}
function ec(x, gridSize) {
    return x * gridSize + gridSize;
}


class Layer {
    constructor(displaySize) {
        this.children = [];
        this.gridScale = 1;
        this.displaySize = displaySize;
    }
    getGridSize() {
        return this.gridScale * this.displaySize;
    }
    size() {
        return this.children.length;
    }
    getChild(index) {
        return this.children[index];
    }
    remove(index) {
        if (index >= 0 && index < this.children.length) {
            this.children[index].parent = null;
            return this.children.splice(index, 1)[0];
        }
        return null;
    }
    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children[index].parent = null;
            return this.children.splice(index, 1)[0];
        }
        return null;
    }
    addChild(child) {
        this.children.push(child);
        child.parent = this;
    }
    sendToBack(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            let c = this.children.splice(index, 1)[0];
            this.children.unshift(c);
        }
    }
    sendToFront(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            let c = this.children.splice(index, 1)[0];
            this.children.push(c);
        }
    }
    [Symbol.iterator]() {
        return this.children[Symbol.iterator]();
    }
}

class TileLike {
    constructor(parent) {
        this.parent = parent;
    }
    erase() {
        this.parent.removeChild(this);
    }
    getLayer() {
        if(this.parent instanceof Layer) {
            return this.parent;
        } else {
            return this.parent.getLayer();
        }
    }
    clone(offsetX, offsetY) {
        throw new Error("Not implemented");
    }
    move(offsetX, offsetY) {
        throw new Error("Not implemented");
    }
    recolor(color) {
        throw new Error("Not implemented");
    }
    draw() {
        throw new Error("Not implemented");
    }
    drawWithOffset(offsetX, offsetY) {
        throw new Error("Not implemented");
    }
    drawOutline() {
        throw new Error("Not implemented");
    }
    collidesWith(mouseX, mouseY) {
        throw new Error("Not implemented");
    }
    fitsWithin(sX, sY, eX, eY) {
        throw new Error("Not implemented");
    }
}

class Group extends TileLike {
    constructor(parent) {
        super(parent);
        this.children = [];
    }
    remove(index) {
        if (index >= 0 && index < this.children.length) {
            this.children[index].parent = null;
            return this.children.splice(index, 1)[0];
        }
        return null;
    }
    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            this.children[index].parent = null;
            return this.children.splice(index, 1)[0];
        }
        return null;
    }
    addChild(child) {
        this.children.push(child);
        child.parent = this;
    }
    sendToBack(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            let c = this.children.splice(index, 1)[0];
            this.children.unshift(c);
        }
    }
    sendToFront(child) {
        const index = this.children.indexOf(child);
        if (index !== -1) {
            let c = this.children.splice(index, 1)[0];
            this.children.push(c);
        }
    }
    [Symbol.iterator]() {
        return this.children[Symbol.iterator]();
    }
    dissolve() {
        let removedChildren = [];
        while(this.children.length > 0) {
            let removedChild = this.remove(0);
            removedChildren.push(removedChild);
            this.parent.addChild(removedChild);
        }
        this.erase();
        return removedChildren;
    }
    clone(offsetX, offsetY) {
        let newGroup = new Group(this.parent);
        for(let child of this.children) {
            newGroup.addChild(child.clone(offsetX, offsetY));
        }
        return newGroup;
    }
    move(offsetX, offsetY) {
        for(let child of this.children) {
            child.move(offsetX, offsetY);
        }
    }
    recolor(color) {
        for(let child of this.children) {
            child.recolor(color);
        }
    }
    draw() {
        for(let child of this.children) {
            child.draw();
        }
    }
    drawWithOffset(offsetX, offsetY) {
        for(let child of this.children) {
            child.drawWithOffset(offsetX, offsetY);
        }
    }
    getBounds() {
        let minX = null;
        let minY = null;
        let maxX = null;
        let maxY = null;
        for(let child of this.children) {
            if(child instanceof Group) {
                let [mnx, mny, mxx, mxy] = child.getBounds();
                if(mnx < minX || minX == null) {
                    minX = mnx;
                }
                if(mny < minY || minY == null) {
                    minY = mny;
                }
                if(mxx > maxX || maxX == null) {
                    maxX = mxx;
                }
                if(mxy > maxY || maxY == null) {
                    maxY = mxy;
                }
            } else {
                if(child.startX < minX || minX == null) {
                    minX = child.startX;
                }
                if(child.startY < minY || minY == null) {
                    minY = child.startY;
                }
                if(child.endX > maxX || maxX == null) {
                    maxX = child.endX;
                }
                if(child.endY > maxY || maxY == null) {
                    maxY = child.endY;
                }
            }
        }
        return [minX, minY, maxX, maxY];
    }
    drawOutline() {
        let [minX, minY, maxX, maxY] = this.getBounds();
        noFill();
        rect(sc(minX, this.getLayer().getGridSize()), sc(minY, this.getLayer().getGridSize()), ec(maxX, this.getLayer().getGridSize()), ec(maxY, this.getLayer().getGridSize()));
    }
    collidesWith(mouseX, mouseY) {
        for(let child of this.children) {
            if(child.collidesWith(mouseX, mouseY)) {
                return true;
            }
        }
        return false;
    }
    fitsWithin(sX, sY, eX, eY) {
        for(let child of this.children) {
            if(!child.fitsWithin(sX, sY, eX, eY)) {
                return false;
            }
        }
        return true;
    }
    
}

class Tile extends TileLike {
    constructor(startX, startY, endX, endY, rotation, color, parent) {
        super(parent);
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.rotation = rotation;
        this.color = color;
    }
    static drawRaw(sX, sY, eX, eY, r, layer) {
        throw new Error("Not implemented");
    }
    static checkCollision(sX, sY, eX, eY, r, layer, mouseX, mouseY) {
        throw new Error("Not implemented");
    }
    static addToLayer(layer, startX, startY, endX, endY, rotation, color) {
        for(let shape of layer) {
            if(shape instanceof this && shape.sameAs({startX : startX, startY : startY, endX : endX, endY : endY, rotation : rotation})) {
                shape.color = color;
                return;
            }
        }
        layer.addChild(new this(startX, startY, endX, endY, rotation, color, layer));
    }
    clone(offsetX, offsetY) {
        let newTile = new this.constructor(this.startX + offsetX, this.startY + offsetY, this.endX + offsetX, this.endY + offsetY, this.rotation, this.color, this.parent);
        return newTile;
    }
    move(offsetX, offsetY) {
        this.startX += offsetX;
        this.startY += offsetY;
        this.endX += offsetX;
        this.endY += offsetY;
    }
    recolor(color) {
        this.color = color;
    }
    sameAs(otherTile) {
        return this.startX == otherTile.startX && this.startY == otherTile.startY && this.endX == otherTile.endX && this.endY == otherTile.endY && this.rotation == otherTile.rotation;
    }
    draw() {
        fill(this.color);
        this.constructor.drawRaw(this.startX, this.startY, this.endX, this.endY, this.rotation, this.getLayer());
    }
    drawWithOffset(offsetX, offsetY) {
        fill(this.color);
        this.constructor.drawRaw(this.startX + offsetX, this.startY + offsetY, this.endX + offsetX, this.endY + offsetY, this.rotation, this.getLayer());
    }
    drawOutline() {
        noFill();
        this.constructor.drawRaw(this.startX, this.startY, this.endX, this.endY, this.rotation, this.getLayer());
    }
    collidesWith(mouseX, mouseY) {
        return this.constructor.checkCollision(this.startX, this.startY, this.endX, this.endY, this.rotation, this.getLayer(), mouseX, mouseY);
    }
    fitsWithin(sX, sY, eX, eY) {
        return this.startX >= sX && this.startY >= sY && this.endX <= eX && this.endY <= eY;
    }
}

class Rect extends Tile {
    constructor(startX, startY, endX, endY, rotation, color, parent) {
        super(startX, startY, endX, endY, rotation, color, parent);
    }
    static drawRaw(sX, sY, eX, eY, r, layer) {
        rect(sc(sX, layer.getGridSize()), sc(sY, layer.getGridSize()), ec(eX, layer.getGridSize()), ec(eY, layer.getGridSize()));
    }
    static checkCollision(sX, sY, eX, eY, r, layer, mouseX, mouseY) {
        return mouseX > sc(sX, layer.getGridSize()) && mouseX < ec(eX, layer.getGridSize()) && mouseY > sc(sY, layer.getGridSize()) && mouseY < ec(eY, layer.getGridSize());
    }
}

class Ellipse extends Tile {
    constructor(startX, startY, endX, endY, rotation, color, parent) {
        super(startX, startY, endX, endY, rotation, color, parent);
    }
    static drawRaw(sX, sY, eX, eY, r, layer) {
        ellipse(sc(sX, layer.getGridSize()), sc(sY, layer.getGridSize()), ec(eX, layer.getGridSize()), ec(eY, layer.getGridSize()));
    }
    static checkCollision(sX, sY, eX, eY, r, layer, mouseX, mouseY) {
        let centerX = cc(sX + (eX - sX) / 2, layer.getGridSize());
        let centerY = cc(sY + (eY - sY) / 2, layer.getGridSize());
        let radiusX = (sc(sX, layer.getGridSize()) - ec(eX, layer.getGridSize())) / 2;
        let radiusY = (sc(sY, layer.getGridSize()) - ec(eY, layer.getGridSize())) / 2;
        return inEllipse(centerX, centerY, radiusX, radiusY, mouseX, mouseY);
    }
}

class Quadrant extends Tile {
    constructor(startX, startY, endX, endY, rotation, color, parent) {
        super(startX, startY, endX, endY, rotation, color, parent);
    }
    static drawRaw(sX, sY, eX, eY, r, layer) {
        let w = eX - sX + 1;
        let h = eY - sY + 1;
        switch(int(r)) {
            case 0:
                arc(sc(sX - w, layer.getGridSize()), sc(sY - h, layer.getGridSize()), ec(eX, layer.getGridSize()), ec(eY, layer.getGridSize()), 0, HALF_PI);
                break;
            case 1:
                arc(sc(sX, layer.getGridSize()), sc(sY - h, layer.getGridSize()), ec(eX + w, layer.getGridSize()), ec(eY, layer.getGridSize()), HALF_PI, PI);
                break;
            case 2:
                arc(sc(sX, layer.getGridSize()), sc(sY, layer.getGridSize()), ec(eX + w, layer.getGridSize()), ec(eY + h, layer.getGridSize()), PI, PI + HALF_PI);
                break;
            case 3:
                arc(sc(sX - w, layer.getGridSize()), sc(sY, layer.getGridSize()), ec(eX, layer.getGridSize()), ec(eY + h, layer.getGridSize()), PI + HALF_PI, TWO_PI);
                break;
        }
    }
    drawOutline() {
        super.drawOutline(this.getLayer().getGridSize());
        let sX = sc(this.startX, this.getLayer().getGridSize());
        let sY = sc(this.startY, this.getLayer().getGridSize());
        let eX = ec(this.endX, this.getLayer().getGridSize());
        let eY = ec(this.endY, this.getLayer().getGridSize());
        switch(int(this.rotation)) {
            case 0:
                line(sX, sY, eX, sY);
                line(sX, sY, sX, eY);
                break;
            case 1:
                line(sX, sY, eX, sY);
                line(eX, sY, eX, eY);
                break;
            case 2:
                line(eX, sY, eX, eY);
                line(sX, eY, eX, eY);
                break;
            case 3:
                line(sX, sY, sX, eY);
                line(sX, eY, eX, eY);
                break;
        }
        
    }
    static checkCollision(sX, sY, eX, eY, r, layer, mouseX, mouseY) {
        let w = eX - sX + 1;
        let h = eY - sY + 1;
        let eSX = sX;
        let eSY = sY;
        let eEX = eX;
        let eEY = eY;
        switch(int(r)) {
            case 0:
                eSX -= w;
                eSY -= h;
                break;
            case 1:
                eEX += w;
                eSY -= h;
                break;
            case 2:
                eEX += w;
                eEY += h;
                break;
            case 3:
                eSX -= w;
                eEY += h;
                break;
        }
        return Rect.checkCollision(sX, sY, eX, eY, r, layer, mouseX, mouseY) && Ellipse.checkCollision(eSX, eSY, eEX, eEY, r, layer, mouseX, mouseY);
    }
}

class InverseQuadrant extends Tile {
    constructor(startX, startY, endX, endY, rotation, color, parent) {
        super(startX, startY, endX, endY, rotation, color, parent);
    }
    static drawRaw(sX, sY, eX, eY, r, layer) {
        push();
        let mask = function() {
            Quadrant.drawRaw(sX, sY, eX, eY, r, layer);
        }
        clip(mask, { invert: true });
        Rect.drawRaw(sX, sY, eX, eY, r, layer);
        pop();
    }
    drawOutline() {
        noFill();
        Quadrant.drawRaw(this.startX, this.startY, this.endX, this.endY, this.rotation, this.getLayer());
        let sX = sc(this.startX, this.getLayer().getGridSize());
        let sY = sc(this.startY, this.getLayer().getGridSize());
        let eX = ec(this.endX, this.getLayer().getGridSize());
        let eY = ec(this.endY, this.getLayer().getGridSize());
        switch(int(this.rotation)) {
            case 0:
                line(eX, sY, eX, eY);
                line(sX, eY, eX, eY);
                break;
            case 1:
                line(sX, sY, sX, eY);
                line(sX, eY, eX, eY);
                break;
            case 2:
                line(sX, sY, eX, sY);
                line(sX, sY, sX, eY);
                break;
            case 3:
                line(sX, sY, eX, sY);
                line(eX, sY, eX, eY);
                break;
        }
        
    }
    static checkCollision(sX, sY, eX, eY, r, layer, mouseX, mouseY) {
        let w = eX - sX + 1;
        let h = eY - sY + 1;
        let eSX = sX;
        let eSY = sY;
        let eEX = eX;
        let eEY = eY;
        switch(int(r)) {
            case 0:
                eSX -= w;
                eSY -= h;
                break;
            case 1:
                eEX += w;
                eSY -= h;
                break;
            case 2:
                eEX += w;
                eEY += h;
                break;
            case 3:
                eSX -= w;
                eEY += h;
                break;
        }
        return Rect.checkCollision(sX, sY, eX, eY, r, layer, mouseX, mouseY) && !Ellipse.checkCollision(eSX, eSY, eEX, eEY, r, layer, mouseX, mouseY);
    }
}

class Wedge extends Tile {
    constructor(startX, startY, endX, endY, rotation, color, parent) {
        super(startX, startY, endX, endY, rotation, color, parent);
    }
    static drawRaw(sX, sY, eX, eY, r, layer) {
        switch(int(r)) {
            case 0:
                triangle(sc(sX, layer.getGridSize()), sc(sY, layer.getGridSize()), ec(eX, layer.getGridSize()), sc(sY, layer.getGridSize()), sc(sX, layer.getGridSize()), ec(eY, layer.getGridSize()));
                break;
            case 1:
                triangle(sc(sX, layer.getGridSize()), sc(sY, layer.getGridSize()), ec(eX, layer.getGridSize()), sc(sY, layer.getGridSize()), ec(eX, layer.getGridSize()), ec(eY, layer.getGridSize()));
                break;
            case 2:
                triangle(ec(eX, layer.getGridSize()), sc(sY, layer.getGridSize()), ec(eX, layer.getGridSize()), ec(eY, layer.getGridSize()), sc(sX, layer.getGridSize()), ec(eY, layer.getGridSize()));
                break;
            case 3:
                triangle(ec(eX, layer.getGridSize()), ec(eY, layer.getGridSize()), sc(sX, layer.getGridSize()), ec(eY, layer.getGridSize()), sc(sX, layer.getGridSize()), sc(sY, layer.getGridSize()));
                break;
        }
    }
    static checkCollision(sX, sY, eX, eY, r, layer, mouseX, mouseY) {
        switch(int(r)) {
            case 0:
                return inTriangle(sc(sX, layer.getGridSize()), sc(sY, layer.getGridSize()), ec(eX, layer.getGridSize()), sc(sY, layer.getGridSize()), sc(sX, layer.getGridSize()), ec(eY, layer.getGridSize()), mouseX, mouseY);
            case 1:
                return inTriangle(sc(sX, layer.getGridSize()), sc(sY, layer.getGridSize()), ec(eX, layer.getGridSize()), sc(sY, layer.getGridSize()), ec(eX, layer.getGridSize()), ec(eY, layer.getGridSize()), mouseX, mouseY);
            case 2:
                return inTriangle(ec(eX, layer.getGridSize()), sc(sY, layer.getGridSize()), ec(eX, layer.getGridSize()), ec(eY, layer.getGridSize()), sc(sX, layer.getGridSize()), ec(eY, layer.getGridSize()), mouseX, mouseY);
            case 3:
                return inTriangle(ec(eX, layer.getGridSize()), ec(eY, layer.getGridSize()), sc(sX, layer.getGridSize()), ec(eY, layer.getGridSize()), sc(sX, layer.getGridSize()), sc(sY, layer.getGridSize()), mouseX, mouseY);
        }
    }
}