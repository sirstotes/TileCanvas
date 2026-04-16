class TileCanvas {
    constructor(canvas, resolution) {
        this.displayCanvas = canvas;
        this.resolution = resolution;
        this.layers = [new Layer(this)];
        this.shouldDrawGrid = true;
        this.currentTool = RectTool;
        this.currentColor = '#000000';
        this.currentStartX = 0;
        this.currentStartY = 0;
        this.currentEndX = 0;
        this.currentEndY = 0;
        this.currentRotation = 0;
        this.currentLayer = 0;
        this.movingSelection = false;
    }
    undo() {

    }
    redo() {

    }
    downloadCanvas(fileName) {
        this.displayCanvas.clear;
        this.render(this.displayCanvas);
        this.displayCanvas.saveCanvas(fileName);
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
    render(canvas) {
        for (let layer of this.layers) {
            for(let tile of layer) {
                canvas.noStroke();
                tile.draw(canvas);
            }
        }
    }
    drawGrid() {
        this.displayCanvas.strokeWeight(1);
        this.displayCanvas.stroke(200);
        for (let x = 0; x < width; x += this.getActiveLayer().getGridSize()) {
            this.displayCanvas.line(x, 0, x, height);
        }
        for (let y = 0; y < height; y += this.getActiveLayer().getGridSize()) {
            this.displayCanvas.line(0, y, width, y);
        }
    }
    clear() {
        this.layers = [new Layer(this)];
    }
    setColor(color) {
        this.currentColor = color;
    }
    toggleGrid() {
        this.shouldDrawGrid = !this.shouldDrawGrid;
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
}