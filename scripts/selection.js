class Selection {
    constructor(tiles) {
        this.tiles = tiles;
        this.displayOffsetX = 0;
        this.displayOffsetY = 0;
    }
    size() {
        return this.tiles.length;
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
        for(let tile of this.tiles) {
            tile.move(this.displayOffsetX, this.displayOffsetY);
        }
        this.resetOffset();
    }
    drawOutlines() {
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
}