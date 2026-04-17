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
function rectsOverlap(ax1, ay1, ax2, ay2, bx1, by1, bx2, by2) {
    return ax1 <= bx2 && ax2 >= bx1 && ay1 <= by2 && ay2 >= by1;
}

class Layer {
    constructor(tileCanvas) {
        this.children = [];
        this.gridScale = 1;
        this.canvas = tileCanvas;
    }
    toLC(x) {//To Layer Coordinate (From Screen)
        return  floor(x/this.getGridSize())
    }
    toSC(x) {//To Screen Coordinate
        return (x + 0.5) * this.getGridSize();
    }
    toSCF(x) {//To Screen Coordinate Floored
        return floor(x + 0.5) * this.getGridSize();
    }
    toSCC(x) {//To Screen Coordinate Ceiling'd
        return ceil(x + 0.5) * this.getGridSize();
    }
    getGridSize() {
        return this.gridScale * this.canvas.resolution;
    }
    size() {
        return this.children.length;
    }
    getChild(index) {
        return this.children[index];
    }
    forEach(callback) {
        for(let i = this.children.length - 1; i >= 0; i --) {
            callback(this.children[i]);
        }
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
    setColor(color) {
        throw new Error("Not implemented");
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
    drawOutline(offsetX, offsetY) {
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
    setColor(color) {
        for(let child of this.children) {
            child.setColor(color);
        }
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
    drawOutline(offsetX, offsetY) {
        let [minX, minY, maxX, maxY] = this.getBounds();
        noFill();
        rect(this.getLayer().toSCF(minX+offsetX), this.getLayer().toSCF(minY+offsetY), this.getLayer().toSCC(maxX+offsetX), this.getLayer().toSCC(maxY+offsetY));
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
    setColor(color) {
        this.color = color;
    }
    sameAs(otherTile) {
        return this.startX == otherTile.startX && this.startY == otherTile.startY && this.endX == otherTile.endX && this.endY == otherTile.endY && this.rotation == otherTile.rotation && this.constructor == otherTile.constructor;
    }
    draw() {
        fill(this.color);
        this.constructor.drawRaw(this.startX, this.startY, this.endX, this.endY, this.rotation, this.getLayer());
    }
    drawOutline(offsetX, offsetY) {
        noFill();
        this.constructor.drawRaw(this.startX+offsetX, this.startY+offsetY, this.endX+offsetX, this.endY+offsetY, this.rotation, this.getLayer());
    }
    collidesWith(mouseX, mouseY) {
        return this.constructor.checkCollision(this.startX, this.startY, this.endX, this.endY, this.rotation, this.getLayer(), mouseX, mouseY);
    }
    overlapsWith(sX, sY, eX, eY) {
        return rectsOverlap(sX, sY, eX, eY, this.startX, this.startY, this.endX, this.endY);
    }
    fitsWithin(sX, sY, eX, eY) {
        return this.startX >= sX && this.startY >= sY && this.endX <= eX && this.endY <= eY;
    }
}

class RectTile extends Tile {
    constructor(startX, startY, endX, endY, rotation, color, parent) {
        super(startX, startY, endX, endY, rotation, color, parent);
    }
    static drawRaw(sX, sY, eX, eY, r, layer) {
        rect(layer.toSCF(sX), layer.toSCF(sY), layer.toSCC(eX), layer.toSCC(eY));
    }
    static checkCollision(sX, sY, eX, eY, r, layer, mouseX, mouseY) {
        return mouseX > layer.toSCF(sX) && mouseX < layer.toSCC(eX) && mouseY > layer.toSCF(sY) && mouseY < layer.toSCC(eY);
    }
}

class EllipseTile extends Tile {
    constructor(startX, startY, endX, endY, rotation, color, parent) {
        super(startX, startY, endX, endY, rotation, color, parent);
    }
    static drawRaw(sX, sY, eX, eY, r, layer) {
        ellipse(layer.toSCF(sX), layer.toSCF(sY), layer.toSCC(eX), layer.toSCC(eY));
    }
    static checkCollision(sX, sY, eX, eY, r, layer, mouseX, mouseY) {
        let centerX = layer.toSC(sX + (eX - sX) / 2);
        let centerY = layer.toSC(sY + (eY - sY) / 2);
        let radiusX = (layer.toSCF(sX) - layer.toSCC(eX)) / 2;
        let radiusY = (layer.toSCF(sY) - layer.toSCC(eY)) / 2;
        return inEllipse(centerX, centerY, radiusX, radiusY, mouseX, mouseY);
    }
}

class QuadrantTile extends Tile {
    constructor(startX, startY, endX, endY, rotation, color, parent) {
        super(startX, startY, endX, endY, rotation, color, parent);
    }
    static drawRaw(sX, sY, eX, eY, r, layer) {
        let w = eX - sX + 1;
        let h = eY - sY + 1;
        switch(int(r)) {
            case 0:
                arc(layer.toSCF(sX - w), layer.toSCF(sY - h), layer.toSCC(eX), layer.toSCC(eY), 0, HALF_PI);
                break;
            case 1:
                arc(layer.toSCF(sX), layer.toSCF(sY - h), layer.toSCC(eX + w), layer.toSCC(eY), HALF_PI, PI);
                break;
            case 2:
                arc(layer.toSCF(sX), layer.toSCF(sY), layer.toSCC(eX + w), layer.toSCC(eY + h), PI, PI + HALF_PI);
                break;
            case 3:
                arc(layer.toSCF(sX - w), layer.toSCF(sY), layer.toSCC(eX), layer.toSCC(eY + h), PI + HALF_PI, TWO_PI);
                break;
        }
    }
    drawOutline() {
        QuadrantTile.drawRaw(this.startX, this.startY, this.endX, this.endY, this.rotation, this.getLayer());
        let sX = this.getLayer().toSCF(this.startX);
        let sY = this.getLayer().toSCF(this.startY);
        let eX = this.getLayer().toSCC(this.endX);
        let eY = this.getLayer().toSCC(this.endY);
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
        return RectTile.checkCollision(sX, sY, eX, eY, r, layer, mouseX, mouseY) && EllipseTile.checkCollision(eSX, eSY, eEX, eEY, r, layer, mouseX, mouseY);
    }
}

class InverseQuadrantTile extends Tile {
    constructor(startX, startY, endX, endY, rotation, color, parent) {
        super(startX, startY, endX, endY, rotation, color, parent);
    }
    static drawRaw(sX, sY, eX, eY, r, layer) {
        push();
        let mask = function() {
            QuadrantTile.drawRaw(sX, sY, eX, eY, (r+2)%4, layer);
        }
        clip(mask, { invert: true });
        RectTile.drawRaw(sX, sY, eX, eY, r, layer);
        pop();
    }
    drawOutline() {
        noFill();
        QuadrantTile.drawRaw(this.startX, this.startY, this.endX, this.endY, (this.rotation+2)%4, this.getLayer());
        let sX = this.getLayer().toSCF(this.startX);
        let sY = this.getLayer().toSCF(this.startY);
        let eX = this.getLayer().toSCC(this.endX);
        let eY = this.getLayer().toSCC(this.endY);
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
                eEX += w;
                eEY += h;
                break;
            case 1:
                eSX -= w;
                eEY += h;
                break;
            case 2:
                eSX -= w;
                eSY -= h;
                break;
            case 3:
                eEX += w;
                eSY -= h;
                break;
        }
        return RectTile.checkCollision(sX, sY, eX, eY, r, layer, mouseX, mouseY) && !EllipseTile.checkCollision(eSX, eSY, eEX, eEY, (r+2)%4, layer, mouseX, mouseY);
    }
}

class WedgeTile extends Tile {
    constructor(startX, startY, endX, endY, rotation, color, parent) {
        super(startX, startY, endX, endY, rotation, color, parent);
    }
    static drawRaw(sX, sY, eX, eY, r, layer) {
        switch(int(r)) {
            case 0:
                triangle(layer.toSCF(sX), layer.toSCF(sY), layer.toSCC(eX), layer.toSCF(sY), layer.toSCF(sX), layer.toSCC(eY));
                break;
            case 1:
                triangle(layer.toSCF(sX), layer.toSCF(sY), layer.toSCC(eX), layer.toSCF(sY), layer.toSCC(eX), layer.toSCC(eY));
                break;
            case 2:
                triangle(layer.toSCC(eX), layer.toSCF(sY), layer.toSCC(eX), layer.toSCC(eY), layer.toSCF(sX), layer.toSCC(eY));
                break;
            case 3:
                triangle(layer.toSCC(eX), layer.toSCC(eY), layer.toSCF(sX), layer.toSCC(eY), layer.toSCF(sX), layer.toSCF(sY));
                break;
        }
    }
    static checkCollision(sX, sY, eX, eY, r, layer, mouseX, mouseY) {
        switch(int(r)) {
            case 0:
                return inTriangle(layer.toSCF(sX), layer.toSCF(sY), layer.toSCC(eX), layer.toSCF(sY), layer.toSCF(sX), layer.toSCC(eY), mouseX, mouseY);
            case 1:
                return inTriangle(layer.toSCF(sX), layer.toSCF(sY), layer.toSCC(eX), layer.toSCF(sY), layer.toSCC(eX), layer.toSCC(eY), mouseX, mouseY);
            case 2:
                return inTriangle(layer.toSCC(eX), layer.toSCF(sY), layer.toSCC(eX), layer.toSCC(eY), layer.toSCF(sX), layer.toSCC(eY), mouseX, mouseY);
            case 3:
                return inTriangle(layer.toSCC(eX), layer.toSCC(eY), layer.toSCF(sX), layer.toSCC(eY), layer.toSCF(sX), layer.toSCF(sY), mouseX, mouseY);
        }
    }
}

class BezierWedgeTile extends WedgeTile {
    constructor(startX, startY, endX, endY, rotation, color, parent) {
        super(startX, startY, endX, endY, rotation, color, parent);
        let c = BezierWedgeTile.getStartControls(startX, startY, endX, endY, rotation);
        this.startControlX = c.x1;
        this.startControlY = c.y1;
        this.endControlX = c.x2;
        this.endControlY = c.y2;
    }
    move(offsetX, offsetY) {
        this.startControlX += offsetX;
        this.startControlY += offsetY;
        this.endControlX += offsetX;
        this.endControlY += offsetY;
    }
    static getStartControls(sX, sY, eX, eY, r) {
        let corners = [
            {x: sX - 0.5, y: eY + 0.5},
            {x: sX - 0.5, y: sY - 0.5},
            {x: eX + 0.5, y: sY - 0.5},
            {x: eX + 0.5, y: eY + 0.5},
        ]
        return {x1: corners[(r+2)%4].x, y1: corners[(r+2)%4].y, x2: corners[r%4].x, y2: corners[r%4].y};
    }
    static drawRaw2(sX, sY, eX, eY, x1, y1, x2, y2, r, layer) {
        let corners = [
            {x: layer.toSCF(sX), y: layer.toSCC(eY)},
            {x: layer.toSCF(sX), y: layer.toSCF(sY)},
            {x: layer.toSCC(eX), y: layer.toSCF(sY)},
            {x: layer.toSCC(eX), y: layer.toSCC(eY)},
        ]
        beginShape();
        vertex(corners[r].x, corners[r].y);
        vertex(corners[(r+1)%4].x, corners[(r+1)%4].y);
        vertex(corners[(r+2)%4].x, corners[(r+2)%4].y);
        bezierVertex(layer.toSC(x1), layer.toSC(y1), 
                    layer.toSC(x2), layer.toSC(y2),
                    corners[r].x, corners[r].y);
        endShape();
    }
    static drawRaw(sX, sY, eX, eY, r, layer) {
        let c = BezierWedgeTile.getStartControls(sX, sY, eX, eY, r);
        BezierWedgeTile.drawRaw2(sX, sY, eX, eY, c.x1, c.y1, c.x2, c.y2, r, layer);
    }
    draw() {
        fill(this.color);
        BezierWedgeTile.drawRaw2(this.startX, this.startY, this.endX, this.endY, this.startControlX, this.startControlY, this.endControlX, this.endControlY, this.rotation, this.getLayer());
        //this.drawControls();
    }
    drawOutline() {
        super.drawOutline();
        this.drawControls();
    }
    drawControls() {
        let corners = [
            {x: this.getLayer().toSCF(this.startX), y: this.getLayer().toSCC(this.endY)},
            {x: this.getLayer().toSCF(this.startX), y: this.getLayer().toSCF(this.startY)},
            {x: this.getLayer().toSCC(this.endX), y: this.getLayer().toSCF(this.startY)},
            {x: this.getLayer().toSCC(this.endX), y: this.getLayer().toSCC(this.endY)},
        ]
        stroke(255, 0, 0);
        strokeWeight(3);
        line(corners[(this.rotation+2)%4].x, corners[(this.rotation+2)%4].y, this.getLayer().toSC(this.startControlX), this.getLayer().toSC(this.startControlY));
        line(corners[this.rotation].x, corners[this.rotation].y, this.getLayer().toSC(this.endControlX), this.getLayer().toSC(this.endControlY));
        strokeWeight(10);
        point(this.getLayer().toSC(this.startControlX), this.getLayer().toSC(this.startControlY));
        point(this.getLayer().toSC(this.endControlX), this.getLayer().toSC(this.endControlY));
    }
}