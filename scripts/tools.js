class Tool {
    constructor() {

    }
    onEnable(canvas) {

    }
    onDisable(canvas) {

    }
    onMousePressed(canvas, mouseX, mouseY, gridX, gridY) {

    }
    onMouseReleased(canvas, mouseX, mouseY, gridX, gridY) {

    }
    onMouseMoved(canvas, mouseX, mouseY, gridX, gridY) {

    }
    onDragEnd(canvas, startMouseX, startMouseY, endMouseX, endMouseY, startGridX, startGridY, endGridX, endGridY) {

    }
    draw(canvas) {

    }
}

class ShapeTool extends Tool {
    constructor(shape) {
        this.shape = shape;
    }

}

class RectTool extends ShapeTool {
    constructor() {
        super.constructor(RectTile);
    }
}