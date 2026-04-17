class Tool {
    static DRAG_MODE_OPTIONS = {
        AREA: 0,
        DRAW: 1,
    };
    static DRAG_MODE = 0;
    static ROTATION_MODE_OPTIONS = {
        DRAG: 0,
        UI: 1,
    };
    static ROTATION_MODE = 0;
    static SELECTION_MODE_OPTIONS = {
        CONTAIN: 0,
        OVERLAP: 1
    };
    static REPLACEMENT_MODE = 0;
    static REPLACEMENT_MODE_OPTIONS = {
        IDENTICAL: 0,
        NONE: 1,
        ALL: 2
    };
    static SPLIT_TILES = true;
    constructor(name) {
        this.name = name;
    }
    draw(maker) {

    }
    update(maker, mouseX, mouseY, mousePressed) {

    }
    onEnable(maker) {

    }
    onDisable(maker) {

    }
    onMousePressed(maker) {

    }
    onMouseReleased(maker) {

    }
    onDrag(maker) {

    }
    onDragStart(maker) {

    }
    onDragEnd(maker) {

    }
    onTileChange(maker) {

    }
}

class ShapeTool extends Tool {
    constructor(name, shape) {
        super(name);
        this.shapeType = shape;
        this.maker = undefined;
    }
    place(sX, sY, eX, eY, r, c, layer) {
        if(Tool.REPLACEMENT_MODE == Tool.REPLACEMENT_MODE_OPTIONS.IDENTICAL) {
            for(let tile of layer) {
                if(tile.sameAs({startX : sX, startY : sY, endX : eX, endY : eY, rotation : r, constructor: this.shapeType})) {
                    tile.setColor(c);
                    return;
                }
            }
        } else if (Tool.REPLACEMENT_MODE == Tool.REPLACEMENT_MODE_OPTIONS.ALL) {

            layer.forEach((tile) => {
                if(tile.overlapsWith(sX, sY, eX, eY)) {
                    this.maker.eraseTile(tile);
                }
            });
        }
        layer.addChild(new this.shapeType(sX, sY, eX, eY, r, c, layer));
    }
    onEnable(maker) {
        this.maker = maker;
    }
    draw(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.AREA) {
            strokeWeight(0);
            fill(maker.getColor());
            this.shapeType.drawRaw(maker.getStartX(), maker.getStartY(), maker.getEndX(), maker.getEndY(), maker.getRotation(), maker.getActiveLayer());
        }
    }
    onMousePressed(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.DRAW) {
            this.place( maker.getCurrentX(), maker.getCurrentY(), maker.getCurrentX(), maker.getCurrentY(), maker.getRotation(), maker.getColor(), maker.getActiveLayer());
        }
    }
    onMouseReleased(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.AREA) {
            this.place(maker.getStartX(), maker.getStartY(), maker.getEndX(), maker.getEndY(), maker.getRotation(), maker.getColor(), maker.getActiveLayer());
        }
    }
    onTileChange(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.DRAW && clickingOnCanvas) {
            this.place(maker.getCurrentX(), maker.getCurrentY(), maker.getCurrentX(), maker.getCurrentY(), maker.getRotation(), maker.getColor(), maker.getActiveLayer());
        }
    }
    onDrag(maker) {
        if(Tool.ROTATION_MODE == Tool.ROTATION_MODE_OPTIONS.DRAG) {
            if (getMouseX() > maker.currentStartMouseX && getMouseY() > maker.currentStartMouseY) {
                maker.setRotation(2);
            } else if (getMouseX() < maker.currentStartMouseX && getMouseY() > maker.currentStartMouseY) {
                maker.setRotation(3);
            } else if (getMouseX() < maker.currentStartMouseX && getMouseY() < maker.currentStartMouseY) {
                maker.setRotation(0);
            } else if (getMouseX() > maker.currentStartMouseX && getMouseY() < maker.currentStartMouseY) {
                maker.setRotation(1);
            }
        }
    }
}

class RectTool extends ShapeTool {
    constructor() {
        super("RECT", RectTile);
    }
    place(sX, sY, eX, eY, r, c, layer) {
        if(Tool.SPLIT_TILES) {
            for(let i = sX; i < eX + 1; i ++) {
                for(let j = sY; j < eY + 1; j ++) {
                    super.place(i, j, i, j, r, c, layer);
                }
            }
        } else {
            super.place(sX, sY, eX, eY, r, c, layer);
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
        super("ERASE")
    }
    draw(maker) {
        noFill();
        stroke(255, 0, 0);
        strokeWeight(3);
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.AREA && !maker.startEndEqual()) {
            let al = maker.getActiveLayer();
            line(al.toSCF(maker.getStartX()), al.toSCF(maker.getStartY()), al.toSCC(maker.getEndX()), al.toSCC(maker.getEndY()));
            line(al.toSCC(maker.getEndX()), al.toSCF(maker.getStartY()), al.toSCF(maker.getStartX()), al.toSCC(maker.getEndY()));
            rect(al.toSCF(maker.getStartX()), al.toSCF(maker.getStartY()), al.toSCC(maker.getEndX()), al.toSCC(maker.getEndY()));
        } else {
            maker.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                tile.drawOutline(0, 0);
            });
        }
    }
    onMousePressed(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.DRAW) {
            maker.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                maker.eraseTile(tile);
            });
        }
    }
    onDrag(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.DRAW) {
                maker.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                    maker.eraseTile(tile);
                });
        }
    }
    onMouseReleased(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.AREA) {
            if(maker.startEndEqual()) {
                maker.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                    maker.eraseTile(tile);
                });
            } else if(Tool.SELECTION_MODE == Tool.SELECTION_MODE_OPTIONS.CONTAIN) {
                maker.allWithinSelection(maker.getStartX(), maker.getStartY(), maker.getEndX(), maker.getEndY(), (tile) => {
                    maker.eraseTile(tile);
                });
            } else {
                maker.allOverlappingSelection(maker.getStartX(), maker.getStartY(), maker.getEndX(), maker.getEndY(), (tile) => {
                    maker.eraseTile(tile);
                });
            }
        }
    }
}

class PaintTool extends Tool {
    constructor() {
        super("PAINT");
    }
    draw(maker) {
        noFill();
        stroke(maker.getColor());
        strokeWeight(3);
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.AREA && !maker.startEndEqual()) {
            let al = maker.getActiveLayer();
            rect(al.toSCF(maker.getStartX()), al.toSCF(maker.getStartY()), al.toSCC(maker.getEndX()), al.toSCC(maker.getEndY()));
        } else {
            maker.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                tile.drawOutline(0, 0);
            });
        }
    }
    onMousePressed(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.DRAW) {
            maker.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                tile.setColor(maker.getColor());
            });
        }
    }
    onDrag(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.DRAW) {
            maker.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                tile.setColor(maker.getColor());
            });
        }
    }
    onMouseReleased(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.AREA) {
            if(maker.startEndEqual()) {
                maker.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                    tile.setColor(maker.getColor());
                });
            } else if(Tool.SELECTION_MODE == Tool.SELECTION_MODE_OPTIONS.CONTAIN) {
                maker.allWithinSelection(maker.getStartX(), maker.getStartY(), maker.getEndX(), maker.getEndY(), (tile) => {
                    tile.setColor(maker.getColor());
                });
            } else {
                maker.allOverlappingSelection(maker.getStartX(), maker.getStartY(), maker.getEndX(), maker.getEndY(), (tile) => {
                    tile.setColor(maker.getColor());
                });
            }
        }
    }
}

class SelectTool extends Tool {
    constructor() {
        super("SELECT");
        this.hoveringSelection = false;
        this.moving = false;
    }
    draw(maker) {
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
            let al = maker.getActiveLayer();
            rect(al.toSCF(maker.getStartX()), al.toSCF(maker.getStartY()), al.toSCC(maker.getEndX()), al.toSCC(maker.getEndY()));
            drawingContext.setLineDash([]);
        }
    }
    update(makere, mouseX, mouseY, mousePressed) {
        if(maker.hasSelection()) {
            if(maker.getSelection().collidesWith(getMouseX(), getMouseY())) {
                this.hoveringSelection = true;
            } else {
                this.hoveringSelection = false;
            }
        }
    }
    onDrag(maker) {
        if(this.moving) {
            maker.getSelection().setOffset(maker.getXOffset(), maker.getYOffset())
        }
    }
    onDisable() {
        cursor(ARROW);
    }
    onMousePressed(maker) {
        if(this.hoveringSelection) {
            this.moving = true;
        }
    }
    onMouseReleased(maker) {
        if(this.moving) {
            this.moving = false;
            maker.getSelection().applyOffset();
        } else {
            if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.AREA) {
                if(maker.hasSelection()) {
                    if(maker.getSelection().hasMoved) {
                        if(Tool.REPLACEMENT_MODE == Tool.REPLACEMENT_MODE_OPTIONS.ALL) {
                            maker.getSelection().removeOverlapping(maker);
                        } else if(Tool.REPLACEMENT_MODE == Tool.REPLACEMENT_MODE_OPTIONS.IDENTICAL) {
                            maker.getSelection().removeIdentical(maker);
                        }
                    }
                    maker.cancelSelection();
                }
                if(maker.startEndEqual()) {
                    maker.firstColliding(getMouseX(), getMouseY(), (tile) => {
                        maker.getOrCreateSelection().add(tile);
                    });
                } else if(Tool.SELECTION_MODE == Tool.SELECTION_MODE_OPTIONS.CONTAIN) {
                    for(let tile of maker.getActiveLayer().children) {
                        if(tile.fitsWithin(maker.getStartX(), maker.getStartY(), maker.getEndX(), maker.getEndY())) {
                            maker.getOrCreateSelection().add(tile);
                        }
                    }
                } else {
                    for(let tile of maker.getActiveLayer().children) {
                        if(tile.overlapsWith(maker.getStartX(), maker.getStartY(), maker.getEndX(), maker.getEndY())) {
                            maker.getOrCreateSelection().add(tile);
                        }
                    }
                }
            }
        }
    }
}

class ColorSelectTool extends Tool {
    constructor() {
        super("EYEDROP");
        this.previousTool;
    }
    draw(maker) {
        noFill();
        stroke(255, 0, 0);
        strokeWeight(3);
        maker.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
            tile.drawOutline(0, 0);
        });
    }
    onEnable(maker) {
        this.previousTool = maker.currentTool; 
    }
    onMouseReleased(maker) {
        maker.firstColliding(getMouseX(), getMouseY(), (tile) => {
            setColor(tile.color);
            setTool(this.previousTool.name);
            console.log(this.previousTool.name);
        });
    }
}