class Selection {
    constructor(tiles) {
        this.tiles = tiles;
        this.hasMoved = false;
        this.displayOffsetX = 0;
        this.displayOffsetY = 0;
    }
    size() {
        return this.tiles.length;
    }
    removeOverlapping(maker) {
        for(let tile of this.tiles) {
            maker.allOverlapping(tile.startX, tile.startY, tile.endX, tile.endY, (t) => {
                if(!this.includes(t)) {
                    t.erase();
                }
            })
        }
    }
    removeIdentical(maker) {
        for(let tile of this.tiles) {
            maker.getActiveLayer().forEach((t) => {
                if(t != tile && t instanceof Tile && t.sameAs(tile)) {
                    t.erase();
                }
            })
        }
    }
    remove(tile) {
        if(this.includes(tile)) {
            this.tiles.splice(this.tiles.indexOf(tile), 1);
        }
    }
    includes(tile) {
        return this.tiles.includes(tile);
    }
    setOffset(x, y) {
        this.displayOffsetX = x;
        this.displayOffsetY = y;
    }
    resetOffset() {
        this.displayOffsetX = 0;
        this.displayOffsetY = 0;
    }
    applyOffset() {
        this.hasMoved = true;
        for(let tile of this.tiles) {
            tile.move(this.displayOffsetX, this.displayOffsetY);
        }
        this.resetOffset();
    }
    drawOutlines() {
        noFill();
        stroke(0, 0, 255);
        strokeWeight(3);
        for(let tile of this.tiles) {
            tile.drawOutline(this.displayOffsetX, this.displayOffsetY);
        }
    }
    collidesWith(screenX, screenY)  {
        for(let tile of this.tiles) {
            if(tile.collidesWith(screenX, screenY)) {
                return true;
            }    
        }
        return false;
    }
    add(tile) {
        this.tiles.push(tile);
    }
    erase() {
        for(let shape of this.tiles) {
            shape.erase();
        }
    }
    onlyBezier() {
        return this.tiles.length == 1 && this.tiles[0] instanceof BezierWedgeTile;
    }
}