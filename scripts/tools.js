class Tool {
    static PLACEMENT_MODES = {
        AREA: 0,
        DRAW: 1,
    };
    static PLACEMENT_MODE = 0;
    static ROTATION_MODES = {
        DRAG: 0,
        UI: 1,
    };
    static ROTATION_MODE = 0;
    static SELECTION_MODES = {
        CONTAIN: 0,
        OVERLAP: 1
    };
    static SPLIT_TILES = true;
    constructor(name) {
        this.name = name;
    }
    draw(tileCanvas) {

    }
    update(tileCanvas, mouseX, mouseY, mousePressed) {

    }
    onEnable(tileCanvas) {

    }
    onDisable(tileCanvas) {

    }
    onMousePressed(tileCanvas) {

    }
    onMouseReleased(tileCanvas) {

    }
    onDrag(tileCanvas) {

    }
    onDragStart(tileCanvas) {

    }
    onDragEnd(tileCanvas) {

    }
    onTileChange(tileCanvas) {

    }
}

class ShapeTool extends Tool {
    constructor(name, shape) {
        super(name);
        this.shapeType = shape;
    }
    place(sX, sY, eX, eY, r, c, layer) {
        this.shapeType.place(sX, sY, eX, eY, r, c, layer);
    }
    draw(tileCanvas) {
        if(Tool.PLACEMENT_MODE == Tool.PLACEMENT_MODES.AREA) {
            strokeWeight(0);
            fill(tileCanvas.getColor());
            this.shapeType.drawRaw(tileCanvas.getStartX(), tileCanvas.getStartY(), tileCanvas.getEndX(), tileCanvas.getEndY(), tileCanvas.getRotation(), tileCanvas.getActiveLayer());
        }
    }
    onMousePressed(tileCanvas) {
        if(Tool.PLACEMENT_MODE == Tool.PLACEMENT_MODES.DRAW) {
            this.place( tileCanvas.getEndX(), tileCanvas.getEndY(), tileCanvas.getEndX(), tileCanvas.getEndY(), tileCanvas.getRotation(), tileCanvas.getColor(), tileCanvas.getActiveLayer());
        }
    }
    onMouseReleased(tileCanvas) {
        if(Tool.PLACEMENT_MODE == Tool.PLACEMENT_MODES.AREA) {
            this.place(tileCanvas.getStartX(), tileCanvas.getStartY(), tileCanvas.getEndX(), tileCanvas.getEndY(), tileCanvas.getRotation(), tileCanvas.getColor(), tileCanvas.getActiveLayer());
        }
    }
    onTileChange(tileCanvas) {
        if(Tool.PLACEMENT_MODE == Tool.PLACEMENT_MODES.DRAW) {
            this.place(tileCanvas.getEndX(), tileCanvas.getEndY(), tileCanvas.getEndX(), tileCanvas.getEndY(), tileCanvas.getRotation(), tileCanvas.getColor(), tileCanvas.getActiveLayer());
        }
    }
    onDrag(tileCanvas) {
        if(ToolROTATION_MODE == ToolROTATION_MODES.DRAG) {
            if (getMouseX() > tileCanvas.currentStartMouseX && getMouseY() > tileCanvas.currentStartMouseY) {
                tileCanvas.setRotation(2);
            } else if (getMouseX() < tileCanvas.currentStartMouseX && getMouseY() > tileCanvas.currentStartMouseY) {
                tileCanvas.setRotation(3);
            } else if (getMouseX() < tileCanvas.currentStartMouseX && getMouseY() < tileCanvas.currentStartMouseY) {
                tileCanvas.setRotation(0);
            } else if (getMouseX() > tileCanvas.currentStartMouseX && getMouseY() < tileCanvas.currentStartMouseY) {
                tileCanvas.setRotation(1);
            }
        }
    }
}

class RectTool extends ShapeTool {
    constructor() {
        super("RECT", RectTile);
    }
    place(sX, sY, eX, eY, r, c, layer) {
        if(ToolSPLIT_TILES) {
            for(let i = sX; i < eX + 1; i ++) {
                for(let j = sY; j < eY + 1; j ++) {
                    this.shapeType.place(i, j, i, j, r, c, layer);
                }
            }
        } else {
            this.shapeType.place(sX, sY, eX, eY, r, c, layer);
        }
    }
}

class EllipseTool extends ShapeTool {
    constructor() {
        super("ELLIPSE", EllipseTile);
    }
}

class QuadrantTool extends ShapeTool {
    constructor() {
        super("QUADRANT", QuadrantTile);
    }
}

class InverseQuadrantTool extends ShapeTool {
    constructor() {
        super("INVERSE_QUADRANT", InverseQuadrantTile);
    }
}

class WedgeTool extends ShapeTool {
    constructor() {
        super("WEDGE", WedgeTile);
    }
}

class BezierWedgeTool extends ShapeTool {
    constructor() {
        super("BEZIER_WEDGE", BezierWedgeTile);
    }
}

class EraseTool extends Tool {
    constructor() {
        super("Eraser")
    }
    draw(tileCanvas) {
        noFill();
        stroke(255, 0, 0);
        strokeWeight(3);
        if(Tool.PLACEMENT_MODE == Tool.PLACEMENT_MODES.AREA && !tileCanvas.startEndEqual()) {
            let al = tileCanvas.getActiveLayer();
            line(al.toSCF(tileCanvas.getStartX()), al.toSCF(tileCanvas.getStartY()), al.toSCC(tileCanvas.getEndX()), al.toSCC(tileCanvas.getEndY()));
            line(al.toSCC(tileCanvas.getEndX()), al.toSCF(tileCanvas.getStartY()), al.toSCF(tileCanvas.getStartX()), al.toSCC(tileCanvas.getEndY()));
            rect(al.toSCF(tileCanvas.getStartX()), al.toSCF(tileCanvas.getStartY()), al.toSCC(tileCanvas.getEndX()), al.toSCC(tileCanvas.getEndY()));
        } else {
            tileCanvas.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                tile.drawOutline(0, 0);
            });
        }
    }
    onMousePressed(tileCanvas) {
        if(Tool.PLACEMENT_MODE == Tool.PLACEMENT_MODES.DRAW) {
            tileCanvas.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                tileCanvas.eraseTile(tile);
            });
        }
    }
    onDrag(tileCanvas) {
        if(Tool.PLACEMENT_MODE == Tool.PLACEMENT_MODES.DRAW) {
                tileCanvas.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                    tileCanvas.eraseTile(tile);
                });
        }
    }
    onMouseReleased(tileCanvas) {
        if(Tool.PLACEMENT_MODE == Tool.PLACEMENT_MODES.AREA) {
            if(tileCanvas.startEndEqual()) {
                tileCanvas.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                    tileCanvas.eraseTile(tile);
                });
            } else {
                tileCanvas.allWithinSelection(tileCanvas.getStartX(), tileCanvas.getStartY(), tileCanvas.getEndX(), tileCanvas.getEndY(), (tile) => {
                    tileCanvas.eraseTile(tile);
                });
            }
        }
    }
}

class PaintTool extends Tool {
    constructor() {
        super("Paintbrush");
    }
    draw(tileCanvas) {
        noFill();
        stroke(tileCanvas.getColor());
        strokeWeight(3);
        if(Tool.PLACEMENT_MODE == Tool.PLACEMENT_MODES.AREA && !tileCanvas.startEndEqual()) {
            let al = tileCanvas.getActiveLayer();
            rect(al.toSCF(tileCanvas.getStartX()), al.toSCF(tileCanvas.getStartY()), al.toSCC(tileCanvas.getEndX()), al.toSCC(tileCanvas.getEndY()));
        } else {
            tileCanvas.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                tile.drawOutline(0, 0);
            });
        }
    }
    onMousePressed(tileCanvas) {
        if(Tool.PLACEMENT_MODE == Tool.PLACEMENT_MODES.DRAW) {
            tileCanvas.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                tile.setColor(tileCanvas.getColor());
            });
        }
    }
    onDrag(tileCanvas) {
        if(Tool.PLACEMENT_MODE == Tool.PLACEMENT_MODES.DRAW) {
            tileCanvas.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                tile.setColor(tileCanvas.getColor());
            });
        }
    }
    onMouseReleased(tileCanvas) {
        if(Tool.PLACEMENT_MODE == Tool.PLACEMENT_MODES.AREA) {
            if(tileCanvas.startEndEqual()) {
                tileCanvas.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                    tile.setColor(tileCanvas.getColor());
                });
            } else {
                tileCanvas.allWithinSelection(tileCanvas.getStartX(), tileCanvas.getStartY(), tileCanvas.getEndX(), tileCanvas.getEndY(), (tile) => {
                    tile.setColor(tileCanvas.getColor());
                });
            }
        }
    }
}

class SelectTool extends Tool {
    constructor() {
        super("Select");
        this.hoveringSelection = false;
        this.moving = false;
    }
    draw(tileCanvas) {
        if(this.hoveringSelection) {
            cursor(MOVE);
        } else {
            cursor(ARROW);
        }
        if(!this.moving) {
            noFill();
            stroke(255, 0, 0);
            strokeWeight(3);
            drawingContext.setLineDash([10, 10]);
            let al = tileCanvas.getActiveLayer();
            rect(al.toSCF(tileCanvas.getStartX()), al.toSCF(tileCanvas.getStartY()), al.toSCC(tileCanvas.getEndX()), al.toSCC(tileCanvas.getEndY()));
            drawingContext.setLineDash([]);
        }
    }
    update(tileCanvase, mouseX, mouseY, mousePressed) {
        if(tileCanvas.hasSelection()) {
            if(tileCanvas.getSelection().collidesWith(getMouseX(), getMouseY())) {
                this.hoveringSelection = true;
            } else {
                this.hoveringSelection = false;
            }
        }
    }
    onDrag(tileCanvas) {
        if(this.moving) {
            tileCanvas.getSelection().setOffset(tileCanvas.getXOffset(), tileCanvas.getYOffset())
        }
    }
    onDisable() {
        cursor(ARROW);
    }
    onMousePressed(tileCanvas) {
        if(this.hoveringSelection) {
            this.moving = true;
        }
    }
    onMouseReleased(tileCanvas) {
        if(this.moving) {
            this.moving = false;
            tileCanvas.getSelection().applyOffset();
        } else {
            if(Tool.PLACEMENT_MODE == Tool.PLACEMENT_MODES.AREA) {
                if(tileCanvas.hasSelection()) {
                    tileCanvas.cancelSelection();
                }
                if(tileCanvas.startEndEqual()) {
                    let tile = tileCanvas.getFirstCollidingShape(getMouseX(), getMouseY());
                    if(tile) {
                        tileCanvas.getOrCreateSelection().add(tile);
                    }
                } else {
                    for(let tile of tileCanvas.getActiveLayer().children) {
                        if(tile.fitsWithin(tileCanvas.getStartX(), tileCanvas.getStartY(), tileCanvas.getEndX(), tileCanvas.getEndY())) {
                            tileCanvas.getOrCreateSelection().add(tile);
                        }
                    }
                }
            }
        }
    }
}