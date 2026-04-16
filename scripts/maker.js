class TileCanvas {
    static TOOLS = {
        RECT: new RectTool(),
        ELLIPSE: new EllipseTool(),
        QUADRANT: new QuadrantTool(),
        INVERSE_QUADRANT: new InverseQuadrantTool(),
        WEDGE: new WedgeTool(),
        BEZIER_WEDGE: new BezierWedgeTool(),
        ERASE: new EraseTool(),
        PAINT: new PaintTool(),
        SELECT: new SelectTool()
    }
    constructor(width, height, resolution) {
        this.width = width;
        this.height = height;
        this.resolution = resolution;
        this.layers = [new Layer(this)];
        this.shouldDrawGrid = true;
        this.currentTool = TileCanvas.TOOLS.RECT;
        this.currentColor = '#000000';
        this.currentStartMouseX = 0;
        this.currentStartMouseY = 0;
        this.currentEndMouseX = 0;
        this.currentEndMouseY = 0;
        this.currentRotation = 0;
        this.currentLayer = 0;
        this.movingSelection = false;
        this.selection = null;
        this.dragging = false;
        this.pMousePressed = false;
        this.pMouseX = 0;
        this.pMouseY = 0;
    }
    draw() {
        // let hoveredShape = null;
        // if(this.currentTool.highlightHovered) {
        //     hoveredShape = this.getFirstCollidingShape(mouseX, mouseY);
        // }
        // let offsetX = 0;
        // let offsetY = 0;
        // if(currentTool == 'select' && movingSelection) {
        //     offsetX = currentEndX - currentStartX;
        //     offsetY = currentEndY - currentStartY;
        // }
        background(255)
        this.render(this.displayCanvas);
        if(this.shouldDrawGrid) {
            this.drawGrid();
        }
        if(this.hasSelection()) {
            this.selection.drawOutlines();
        }
        this.currentTool.draw(this);
    }
    update(mouseX, mouseY, mousePressed) {
        if(this.dragging) {
            if(!mousePressed) {
                if(insideCanvas(mouseX, mouseY) && focused) {
                    this.currentTool.onDragEnd(this);
                }
                this.dragging = false;
            } else {
                this.currentTool.onDrag(this);
            }
        } else {
            if(insideCanvas(mouseX, mouseY) && focused) {
                this.currentStartMouseX = round(mouseX);
                this.currentStartMouseY = round(mouseY);
                if(mousePressed && mouseButton == "left") {
                    this.currentTool.onDragStart(this);
                    this.dragging = true;
                }
            }
        }
        if(insideCanvas(mouseX, mouseY) && focused) {
            if(mousePressed && !this.pMousePressed) {
                this.currentTool.onMousePressed(this);
            }
            if(!mousePressed && this.pMousePressed) {
                this.currentTool.onMouseReleased(this);
            }
            this.currentEndMouseX = round(mouseX);
            this.currentEndMouseY = round(mouseY);
            if(this.getActiveLayer().toLC(mouseX) != this.getActiveLayer().toLC(this.pMouseX) || this.getActiveLayer().toLC(mouseY) != this.getActiveLayer().toLC(this.pMouseY)) {
                this.currentTool.onTileChange(this);
            }
        }
        this.currentTool.update(this, mouseX, mouseY, mousePressed);
        this.pMouseX = mouseX;
        this.pMouseY = mouseY;
        this.pMousePressed = mousePressed;
    }
    getStartX() {
        return this.getActiveLayer().toLC(min(this.currentStartMouseX, this.currentEndMouseX));
    }
    getStartY() {
        return this.getActiveLayer().toLC(min(this.currentStartMouseY, this.currentEndMouseY));
    }
    getEndX() {
        return this.getActiveLayer().toLC(max(this.currentStartMouseX, this.currentEndMouseX));
    }
    getEndY() {
        return this.getActiveLayer().toLC(max(this.currentStartMouseY, this.currentEndMouseY));
    }
    getXOffset() {
        return this.getActiveLayer().toLC(this.currentEndMouseX - this.currentStartMouseX);
    }
    getYOffset() {
        return this.getActiveLayer().toLC(this.currentEndMouseY - this.currentStartMouseY);
    }
    startEndEqual() {
        return this.getStartX() == this.getEndX() && this.getStartY() == this.getEndY();
    }
    getRotation() {
        return this.currentRotation;
    }
    getSelection() {
        return this.selection;
    }
    getOrCreateSelection() {
        if(!this.hasSelection()) {
            this.selection = new Selection([])
        }
        return this.selection;
    }
    hasSelection() {
        return this.selection instanceof Selection;
    }
    undo() {

    }
    redo() {

    }
    downloadCanvas(fileName) {
        clear;
        this.render(this.displayCanvas);
        saveCanvas(fileName);
    }
    setRotation(rotation) {
        this.currentRotation = rotation;
    }
    setTool(tool) {
        // if(selection.length > 0) {
        //     switch(tool) {
        //         case 'select':
        //             selection = [];
        //             break;
        //         case 'paint':
        //             for(let shape of selection) {
        //                 shape.recolor(currentColor);
        //             }
        //             break;
        //     }
        // }
        this.currentTool.onDisable(this);
        tool.onEnable(this);
        this.currentTool = tool;
    }
    getActiveLayer() {
        return this.layers[this.currentLayer];
    }
    render() {
        for (let layer of this.layers) {
            for(let tile of layer) {
                noStroke();
                tile.draw();
            }
        }
    }
    drawGrid() {
        strokeWeight(1);
        stroke(200);
        for (let x = 0; x < width; x += this.getActiveLayer().getGridSize()) {
            line(x, 0, x, height);
        }
        for (let y = 0; y < height; y += this.getActiveLayer().getGridSize()) {
            line(0, y, width, y);
        }
    }
    clear() {
        this.layers = [new Layer(this)];
    }
    setColor(color) {
        this.currentColor = color;
    }
    getColor() {
        return this.currentColor;
    }
    toggleGrid() {
        this.shouldDrawGrid = !this.shouldDrawGrid;
    }

    firstCollidingInSelection(x, y, callback) {
        for (let i = this.layers.length - 1; i >= 0; i--) {
            let layer = this.layers[i];
            for(let j = layer.size() - 1; j >= 0; j--) {
                let shape = layer.getChild(j);
                if(shape.collidesWith(x, y) && (!this.hasSelection() || this.selection.includes(shape))) {
                    callback(shape);
                    return;
                }
            }
        }
    }

    allWithinSelection(sX, sY, eX, eY, callback) {
        for(let i = this.getActiveLayer().size()-1; i >= 0; i --) {
            let shape = this.getActiveLayer().getChild(i);
            if(shape.fitsWithin(sX, sY, eX, eY) && (!this.hasSelection() || this.selection.includes(shape))) {
                callback(shape);
            }
        }
    }
    
    getFirstCollidingShape(x, y) {
        for (let i = this.layers.length - 1; i >= 0; i--) {
            let layer = this.layers[i];
            for(let j = layer.size() - 1; j >= 0; j--) {
                let shape = layer.getChild(j);
                if(shape.collidesWith(x, y)) {
                    return shape;
                }
            }
        }
        return null;
    }
    eraseTile(tile) {
        tile.erase();
        if(this.hasSelection()) {
            this.removeFromSelection(tile);
        }
    }
    removeFromSelection(tile) {
        this.selection.remove(tile);
        if(this.selection.size() == 0) {
            this.cancelSelection();
        }
    }
    cancelSelection() {
        this.selection = null;
    }
    groupSelection() {
        if(this.selection.tiles.length > 1) {
            let newGroup = new Group(this.getActiveLayer());
            for(let shape of this.selection.tiles) {
                newGroup.addChild(this.getActiveLayer().removeChild(shape));
            }
            this.getActiveLayer().addChild(newGroup);
            this.selection = new Selection([newGroup]);
        }
    }

    ungroupSelection() {
        let newSelection = [];
        for(let shape of this.selection.tiles) {
            if(shape instanceof Group) {
                newSelection.push(...shape.dissolve());
            }
        }
        this.selection = new Selection(newSelection);
    }

    duplicateSelection() {
        let newSelection = [];
        for(let shape of this.selection.tiles) {
            let clone = shape.clone(1, 1);
            shape.parent.addChild(clone);
            newSelection.push(clone);
        }
        this.selection = new Selection(newSelection);
    }

    backSelection() {
        for(let shape of this.selection.tiles) {
            shape.parent.sendToBack(shape);
        }
    }
    frontSelection() {
        for(let shape of this.selection.tiles) {
            shape.parent.sendToFront(shape);
        }
    }
    rotateSelection(direction) {
        if(direction > 0) {
            
        } else {

        }
    }
    eraseSelection() {
        this.selection.erase();
        this.selection = null;
    }
}