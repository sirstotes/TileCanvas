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
    drawBefore(maker) {}
    draw(maker) {}
    update(maker, mouseX, mouseY, mousePressed) {}
    onEnable(maker) {}
    onDisable(maker) {}
    onMousePressed(maker) {}
    onMouseReleased(maker) {}
    onDrag(maker) {}
    onDragStart(maker) {}
    onDragEnd(maker) {}
    onTileChange(maker) {}
}

class ShapeTool extends Tool {
    constructor(name, shape) {
        super(name);
        this.shapeType = shape;
        this.maker = undefined;
    }
    place(maker, sX, sY, eX, eY, r, c, layer) {
        let cancelPlacement = false;
        if(Tool.REPLACEMENT_MODE == Tool.REPLACEMENT_MODE_OPTIONS.IDENTICAL) {
            layer.forEach((tile) => {
                if(tile.overlapsWith(sX, sY, eX, eY)) {
                    if(tile.sameAs({startX : sX, startY : sY, endX : eX, endY : eY, rotation : r, constructor: this.shapeType})) {
                        if(tile.color != c) {
                            maker.addAction(new ModifyTileAction(tile.ID, "color", tile.color, c));
                        }
                        cancelPlacement = true;
                    } else {
                        return true;
                    }
                }
            });
        } else if (Tool.REPLACEMENT_MODE == Tool.REPLACEMENT_MODE_OPTIONS.ALL) {
            layer.forEach((tile) => {
                if(tile.overlapsWith(sX, sY, eX, eY)) {
                    maker.addAction(new RemoveTileAction(tile));
                }
            });
        }
        if(!cancelPlacement) {
            maker.addAction(new AddTileAction(ID.getNext(), this.shapeType, sX, sY, eX, eY, r, c, layer.ID));
        }
    }
    onEnable(maker) {
        this.maker = maker;
    }
    draw(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.AREA && (!window.mobileAndTabletCheck() || clickingOnCanvas)) {
            strokeWeight(0);
            fill(maker.getColor());
            this.shapeType.drawRaw(maker.getStartX(), maker.getStartY(), maker.getEndX(), maker.getEndY(), maker.getRotation(), maker.getActiveLayer());
        }
    }
    onMousePressed(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.DRAW) {
            this.place(maker, maker.getCurrentX(), maker.getCurrentY(), maker.getCurrentX(), maker.getCurrentY(), maker.getRotation(), maker.getColor(), maker.getActiveLayer());
            maker.submitActions();
        }
    }
    onMouseReleased(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.AREA) {
            this.place(maker, maker.getStartX(), maker.getStartY(), maker.getEndX(), maker.getEndY(), maker.getRotation(), maker.getColor(), maker.getActiveLayer());
            maker.submitActions();
        }
    }
    onTileChange(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.DRAW && clickingOnCanvas) {
            this.place(maker, maker.getCurrentX(), maker.getCurrentY(), maker.getCurrentX(), maker.getCurrentY(), maker.getRotation(), maker.getColor(), maker.getActiveLayer());
            maker.submitActions();
        }
    }
    update(maker, mouseX, mouseY, mousePressed) {
        if(Tool.ROTATION_MODE == Tool.ROTATION_MODE_OPTIONS.DRAG) {
            let cmx = maker.getActiveLayer().toSCX(maker.getActiveLayer().toLCX(maker.currentStartMouseX));
            let cmy = maker.getActiveLayer().toSCY(maker.getActiveLayer().toLCY(maker.currentStartMouseY));
            if (mouseX > cmx && mouseY > cmy) {
                maker.setRotation(0);
            } else if (mouseX < cmx && mouseY > cmy) {
                maker.setRotation(1);
            } else if (mouseX < cmx && mouseY < cmy) {
                maker.setRotation(2);
            } else if (mouseX > cmx && mouseY < cmy) {
                maker.setRotation(3);
            }
        }
    }
}
class RectTool extends ShapeTool {
    constructor() {
        super("RECT", RectTile);
    }
    place(maker, sX, sY, eX, eY, r, c, layer) {
        if(Tool.SPLIT_TILES) {
            for(let i = sX; i < eX + 1; i ++) {
                for(let j = sY; j < eY + 1; j ++) {
                    super.place(maker, i, j, i, j, r, c, layer);
                }
            }
        } else {
            super.place(maker, sX, sY, eX, eY, r, c, layer);
        }
    }
}
class WedgeTool extends ShapeTool {
    constructor() {
        super("WEDGE", WedgeTile);
    }
    //TODO split up place() method
}
class LineTool extends ShapeTool {
    constructor() {
        super("LINE", LineTile);
        this.strokeWeight = -2;
        this.minStrokeWeight = -3;
        this.maxStrokeWeight = 0;
    }
    getStrokeWeight(layer) {
        return layer.getGridSize()*(2**this.strokeWeight);
    }
    increaseStrokeWeight() {
        this.strokeWeight = min(this.strokeWeight + 1, this.maxStrokeWeight);
    }
    decreaseStrokeWeight() {
        this.strokeWeight = max(this.strokeWeight - 1, this.minStrokeWeight);
    }
    place(maker, sX, sY, eX, eY, r, c, layer) {
        //TODO: redo this maybe?
        let cancelPlacement = false;
        if(Tool.REPLACEMENT_MODE == Tool.REPLACEMENT_MODE_OPTIONS.IDENTICAL) {
            layer.forEach((tile) => {
                if(tile.overlapsWith(sX, sY, eX, eY) && tile instanceof Tile) {
                    if(tile.sameAs({startX : sX, startY : sY, endX : eX, endY : eY, rotation : r, constructor: this.shapeType})) {
                        if(tile.color != c) {
                            maker.addAction(new ModifyTileAction(tile.ID, "color", tile.color, c));
                        }
                        cancelPlacement = true;
                    } else {
                        return true;
                    }
                }
            });
        } else if (Tool.REPLACEMENT_MODE == Tool.REPLACEMENT_MODE_OPTIONS.ALL) {
            layer.forEach((tile) => {
                if(tile.overlapsWith(sX, sY, eX, eY)) {
                    maker.addAction(new RemoveTileAction(tile));
                }
            });
        }
        if(!cancelPlacement) {
            let tID = ID.getNext();
            maker.addAction(new AddTileAction(tID, this.shapeType, sX, sY, eX, eY, r, c, layer.ID));
            maker.addAction(new ModifyTileAction(tID, "strokeWeight", -2, this.strokeWeight));
        }
    }
    getStartX() {
        return this.maker.getActiveLayer().toLCX(this.maker.currentStartMouseX);
    }
    getStartY() {
        return this.maker.getActiveLayer().toLCY(this.maker.currentStartMouseY);
    }
    getEndX() {
        return this.maker.getActiveLayer().toLCX(this.maker.currentEndMouseX);
    }
    getEndY() {
        return this.maker.getActiveLayer().toLCY(this.maker.currentEndMouseY);
    }
    draw(maker) {
        if(!window.mobileAndTabletCheck() || clickingOnCanvas) {
            strokeWeight(this.getStrokeWeight(maker.getActiveLayer()));
            stroke(maker.getColor());
            this.shapeType.drawRaw(this.getStartX(), this.getStartY(), this.getEndX(), this.getEndY(), 0, maker.getActiveLayer());
        }
    }
    onEnable(maker) {
        this.maker = maker;
        document.getElementById("lineTools").style.display = "";
    }
    onDisable(maker) {
        document.getElementById("lineTools").style.display = "none";
    }
    onMousePressed(maker) {
        
    }
    onMouseReleased(maker) {
        this.place(maker, this.getStartX(), this.getStartY(), this.getEndX(), this.getEndY(), 0, maker.getColor(), maker.getActiveLayer());
        maker.submitActions();
    }
    onTileChange(maker) {
        
    }
    update(maker, mouseX, mouseY, mousePressed) {

    }
}
class CurveTool extends ShapeTool {
    constructor() {
        super("CURVE", CurveTile);
        this.strokeWeight = -2;
        this.minStrokeWeight = -3;
        this.maxStrokeWeight = 0;
    }
    getStrokeWeight(layer) {
        return layer.getGridSize()*(2**this.strokeWeight);
    }
    increaseStrokeWeight() {
        this.strokeWeight = min(this.strokeWeight + 1, this.maxStrokeWeight);
    }
    decreaseStrokeWeight() {
        this.strokeWeight = max(this.strokeWeight - 1, this.minStrokeWeight);
    }
    place(maker, sX, sY, eX, eY, r, c, layer) {
        //TODO: redo this maybe?
        let cancelPlacement = false;
        if(Tool.REPLACEMENT_MODE == Tool.REPLACEMENT_MODE_OPTIONS.IDENTICAL) {
            layer.forEach((tile) => {
                if(tile.overlapsWith(sX, sY, eX, eY) && tile instanceof Tile) {
                    if(tile.sameAs({startX : sX, startY : sY, endX : eX, endY : eY, rotation : r, constructor: this.shapeType})) {
                        if(tile.color != c) {
                            maker.addAction(new ModifyTileAction(tile.ID, "color", tile.color, c));
                        }
                        cancelPlacement = true;
                    } else {
                        return true;
                    }
                }
            });
        } else if (Tool.REPLACEMENT_MODE == Tool.REPLACEMENT_MODE_OPTIONS.ALL) {
            layer.forEach((tile) => {
                if(tile.overlapsWith(sX, sY, eX, eY)) {
                    maker.addAction(new RemoveTileAction(tile));
                }
            });
        }
        if(!cancelPlacement) {
            let tID = ID.getNext();
            maker.addAction(new AddTileAction(tID, this.shapeType, sX, sY, eX, eY, r, c, layer.ID));
            maker.addAction(new ModifyTileAction(tID, "strokeWeight", -2, this.strokeWeight));
        }
    }
    draw(maker) {
        if(!window.mobileAndTabletCheck() || clickingOnCanvas) {
            noFill();
            strokeWeight(this.getStrokeWeight(maker.getActiveLayer()));
            stroke(maker.getColor());
            this.shapeType.drawRaw(maker.getStartX(), maker.getStartY(), maker.getEndX(), maker.getEndY(), maker.getRotation(), maker.getActiveLayer());
        }
    }
    onEnable(maker) {
        this.maker = maker;
        document.getElementById("lineTools").style.display = "";
    }
    onDisable(maker) {
        document.getElementById("lineTools").style.display = "none";
    }
    onMousePressed(maker) {
        
    }
    onMouseReleased(maker) {
        this.place(maker, maker.getStartX(), maker.getStartY(), maker.getEndX(), maker.getEndY(), maker.getRotation(), maker.getColor(), maker.getActiveLayer());
        maker.submitActions();
    }
    onTileChange(maker) {
        
    }
}

class EraseTool extends Tool {
    constructor() {
        super("ERASE")
    }
    drawBefore(maker) {
        if(Tool.DRAG_MODE != Tool.DRAG_MODE_OPTIONS.AREA || maker.startEndEqual()) {
            maker.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                if(tile.drawOutlineBefore) {
                    noFill();
                    stroke(255, 0, 0);
                    strokeWeight(3);
                    tile.drawOutline(0, 0);
                }
            });
        }
    }
    draw(maker) {
        noFill();
        stroke(255, 0, 0);
        strokeWeight(3);
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.AREA && !maker.startEndEqual()) {
            let al = maker.getActiveLayer();
            line(al.toSCFX(maker.getStartX()), al.toSCFY(maker.getStartY()), al.toSCCX(maker.getEndX()), al.toSCCY(maker.getEndY()));
            line(al.toSCCX(maker.getEndX()), al.toSCFY(maker.getStartY()), al.toSCFX(maker.getStartX()), al.toSCCY(maker.getEndY()));
            rect(al.toSCFX(maker.getStartX()), al.toSCFY(maker.getStartY()), al.toSCCX(maker.getEndX()), al.toSCCY(maker.getEndY()));
        } else {
            maker.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                if(!tile.drawOutlineBefore) {
                    tile.drawOutline(0, 0);
                }
            });
        }
    }
    onMousePressed(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.DRAW) {
            maker.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                maker.addAction(new RemoveTileAction(tile));
                maker.submitActions();
            });
        }
    }
    onDrag(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.DRAW) {
            maker.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                maker.addAction(new RemoveTileAction(tile));
                maker.submitActions();
            });
        }
    }
    onMouseReleased(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.AREA) {
            if(maker.startEndEqual()) {
                maker.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                    maker.addAction(new RemoveTileAction(tile));
                    maker.submitActions();
                });
            } else if(Tool.SELECTION_MODE == Tool.SELECTION_MODE_OPTIONS.CONTAIN) {
                maker.allWithinSelection(maker.getStartX(), maker.getStartY(), maker.getEndX(), maker.getEndY(), (tile) => {
                    maker.addAction(new RemoveTileAction(tile));
                });
                maker.submitActions();
            } else {
                maker.allOverlappingSelection(maker.getStartX(), maker.getStartY(), maker.getEndX(), maker.getEndY(), (tile) => {
                    maker.addAction(new RemoveTileAction(tile));
                });
            }
        }
    }
}

class PaintTool extends Tool {
    constructor() {
        super("PAINT");
    }
    drawBefore(maker) {
        if(Tool.DRAG_MODE != Tool.DRAG_MODE_OPTIONS.AREA || maker.startEndEqual()) {
            maker.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                if(tile.drawOutlineBefore) {
                    noFill();
                    stroke(maker.getColor());
                    strokeWeight(3);
                    tile.drawOutline(0, 0);
                }
            });
        }
    }
    draw(maker) {
        noFill();
        stroke(maker.getColor());
        strokeWeight(3);
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.AREA && !maker.startEndEqual()) {
            let al = maker.getActiveLayer();
            rect(al.toSCFX(maker.getStartX()), al.toSCFY(maker.getStartY()), al.toSCCX(maker.getEndX()), al.toSCCY(maker.getEndY()));
        } else {
            maker.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                if(!tile.drawOutlineBefore) {
                    tile.drawOutline(0, 0);
                }
            });
        }
    }
    onMousePressed(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.DRAW) {
            maker.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                maker.addAction(new ModifyTileAction(tile.ID, "color", tile.color, maker.getColor()));
                maker.submitActions();
            });
        }
    }
    onDrag(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.DRAW) {
            maker.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                maker.addAction(new ModifyTileAction(tile.ID, "color", tile.color, maker.getColor()));
                maker.submitActions();
            });
        }
    }
    onMouseReleased(maker) {
        if(Tool.DRAG_MODE == Tool.DRAG_MODE_OPTIONS.AREA) {
            if(maker.startEndEqual()) {
                maker.firstCollidingInSelection(getMouseX(), getMouseY(), (tile) => {
                    maker.addAction(new ModifyTileAction(tile.ID, "color", tile.color, maker.getColor()));
                    maker.submitActions();
                });
            } else if(Tool.SELECTION_MODE == Tool.SELECTION_MODE_OPTIONS.CONTAIN) {
                maker.allWithinSelection(maker.getStartX(), maker.getStartY(), maker.getEndX(), maker.getEndY(), (tile) => {
                    maker.addAction(new ModifyTileAction(tile.ID, "color", tile.color, maker.getColor()));
                });
                maker.submitActions();
            } else {
                maker.allOverlappingSelection(maker.getStartX(), maker.getStartY(), maker.getEndX(), maker.getEndY(), (tile) => {
                    maker.addAction(new ModifyTileAction(tile.ID, "color", tile.color, maker.getColor()));
                });
                maker.submitActions();
            }
        }
    }
}

class SelectTool extends Tool {
    constructor() {
        super("SELECT");
        this.hoveringSelection = false;
        this.moving = false;
        this.clicking = false;
    }
    onEnable(maker) {
        this.maker = maker;
    }
    draw(maker) {
        if(this.hoveringSelection) {
            cursor(MOVE);
        } else {
            cursor(ARROW);
        }
        if(!this.moving && this.clicking) {
            noFill();
            stroke(255, 0, 0);
            strokeWeight(3);
            drawingContext.setLineDash([10, 10]);
            let al = maker.getActiveLayer();
            rect(al.toSCFX(maker.getStartX()), al.toSCFY(maker.getStartY()), al.toSCCX(maker.getEndX()), al.toSCCY(maker.getEndY()));
            drawingContext.setLineDash([]);
        }
    }
    update(maker, mouseX, mouseY, mousePressed) {
        this.clicking = mousePressed;
        if(maker.hasSelection()) {
            if(maker.getSelection().collidesWith(getMouseX(), getMouseY())) {
                this.hoveringSelection = true;
            } else {
                this.hoveringSelection = false;
            }
        }
    }
    onDrag(maker) {
        if(this.moving && maker.hasSelection()) {
            maker.getSelection().setOffset(maker.getXOffset(), maker.getYOffset());
        }
    }
    onDisable() {
        cursor(ARROW);
    }
    onMousePressed(maker) {
        if(this.hoveringSelection || (maker.hasSelection() && maker.getSelection().collidesWith(getMouseX(), getMouseY()))) {
            this.moving = true;
        }
    }
    onMouseReleased(maker) {
        if(this.moving && maker.hasSelection()) {
            this.moving = false;
            maker.getSelection().applyOffset(maker);
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
    increaseStrokeWeight() {
        for(let tile of this.maker.getSelection().tiles) {
            tile.strokeWeight = Maker.TOOLS.LINE.strokeWeight;
        }
    }
    decreaseStrokeWeight() {
        for(let tile of this.maker.getSelection().tiles) {
            tile.strokeWeight = Maker.TOOLS.LINE.strokeWeight;
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

class BezierTool extends Tool {
    constructor () {
        super("BEZIER");
        this.hovering = 0;
        this.moving = 0;
        this.bezierTile;
    }
    onEnable(maker) {
        this.bezierTile = maker.getSelection().tiles[0];
    }
    draw(maker) {
        if(this.hovering) {
            cursor(MOVE);
        } else {
            cursor(ARROW);
        }
    }
    update(maker, mouseX, mouseY, mousePressed) {
        if(!this.moving) {
            let al = maker.getActiveLayer();
            if(dist(mouseX, mouseY, al.toSCFX(this.bezierTile.getStartControlX()), al.toSCFY(this.bezierTile.getStartControlY())) < al.getGridSize()) {
                this.hovering = 1;
            } else if(dist(mouseX, mouseY, al.toSCFX(this.bezierTile.getEndControlX()), al.toSCFY(this.bezierTile.getEndControlY())) < al.getGridSize()) {
                this.hovering = 2;
            } else {
                this.hovering = 0;
            }
            if(mousePressed) {
                this.moving = this.hovering;
            }
        }
    }
    onMousePressed(maker) {
        if(this.hovering) {
            this.moving = this.hovering;
        }
    }
    onDrag(maker) {
        if(this.moving == 1) {
            this.bezierTile.setStartOffset(maker.getXOffset(), maker.getYOffset());
        } else if(this.moving == 2) {
            this.bezierTile.setEndOffset(maker.getXOffset(), maker.getYOffset());
        }
    }
    onMouseReleased(maker) {
        if(this.moving) {
            let q = this.bezierTile.getBezier(this.moving);
            let t = this.bezierTile.getOffset(this.moving);
            maker.addAction(new SetBezierAction(this.bezierTile, this.moving, q.x+t.x, q.y+t.y));
            this.bezierTile.resetOffsets();
            this.moving = 0;
            maker.submitActions();
        }
    }
}

class CropTool extends Tool {
    constructor() {
        super("CROP");
    }
    draw(maker) {
        noFill();
        stroke(0, 0, 0);
        strokeWeight(3);
        drawingContext.setLineDash([10, 10]);
        let al = maker.getActiveLayer();
        rect(al.toSCFX(maker.getStartX()), al.toSCFY(maker.getStartY()), al.toSCCX(maker.getEndX()), al.toSCCY(maker.getEndY()));
        drawingContext.setLineDash([]);
    }
    onMouseReleased(maker) {
        maker.addAction(new ResizeCanvasAction(maker.width, maker.getEndX() - maker.getStartX() + 1, maker.height, maker.getEndY() - maker.getStartY() + 1, ));
        maker.moveAll(-maker.getStartX(), -maker.getStartY());
    }
}