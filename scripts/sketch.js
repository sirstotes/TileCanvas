
let shapes = {
    rect: Rect,
    ellipse: Ellipse,
    quadrant: Quadrant,
    inverseQuadrant: InverseQuadrant,
    wedge: Wedge
}

let displaySize = 32;
let shouldDrawGrid = true;
let drawUI = true;
let selectingTools = ['erase', 'select', 'fill', 'back', 'front'];
let currentTool = 'draw';
let currentShape = 'rect';
let currentColor = '#000000';
let currentStartX = 0;
let currentStartY = 0;
let currentEndX = 0;
let currentEndY = 0;
let currentRotation = 0;
let currentLayer = 0;
let movingSelection = false;
let canvasScale = 1;
let canvasXOffset = 0;
let canvasYOffset = 0;

let defaultPalette = ["#000000", "#1D2B53", "#7E2553", "#008751", "#AB5236", "#5F574F", "#C2C3C7", "#FFF1E8", "#FF004D", "#FFA300", "#FFEC27", "#00E436", "#29ADFF", "#83769C", "#FF77A8", "#FFCCAA"];

function loadColors(colors) {
    document.getElementById("colorPalette").childNodes = [];
    for(let color of colors) {
        let newButton = document.createElement("button");
        newButton.onclick = () => {setColor(color)};
        newButton.style = "background-color:"+color+";";
        newButton.internalColor = color;
        document.getElementById("colorPalette").appendChild(newButton);
    }
}

function undo() {

}

function redo() {

}

function getMouseX() {
    return mouseX / canvasScale;
}

function getMouseY() {
    return mouseY / canvasScale;
}

function toggleGrid(button) {
    shouldDrawGrid = !shouldDrawGrid;
    button.classList = shouldDrawGrid ? ["highlighted"] : []
}

function toggleMenu(button) {
    if(document.getElementById("menu").style.display === "none") {
        document.getElementById("menu").style = null;
        button.classList = ["highlighted"];
    } else {
        document.getElementById("menu").style = "display: none;";
        button.classList = [];
    }
}

function downloadCanvas() {
    drawUI = false;
    redraw();
    saveCanvas(document.getElementById("fileName").value);
    drawUI = true;
}

function setShape(shape) {
    currentShape = shape;
}

function setColor(color) {
    currentColor = color;
    let current = document.getElementById("selectedColor");
    if(current) {
        current.id = "";
        current.classList = [];
    }
    for(let node of document.getElementById("colorPalette").childNodes) {
        if(node.internalColor == color) {
            node.id = "selectedColor";
            node.classList = ["selected"];
            break;
        }
    }
}


function setCanvasSize(w, h) {
    resizeCanvas(w*displaySize, h*displaySize);
}

function setRotation(rotation) {
    currentRotation = rotation;
}

function selectButton(button) {
    let current = document.getElementById("selectedButton");
    if(current) {
        current.id = "";
        current.classList = [];
    }
    button.id = "selectedButton";
    button.classList = ["selected"];
}

function setTool(tool) {
    for(let node of document.getElementsByClassName("toolButton")) {
        if(node.internalTool == tool) {
            node.id = "selectedColor";
            node.classList = ["selected"];
            break;
        }
    }
    if(selection.length > 0) {
        switch(tool) {
            case 'select':
                selection = [];
                break;
            case 'fill':
                for(let shape of selection) {
                    shape.recolor(currentColor);
                }
                break;
            case 'back':
                for(let shape of selection) {
                    shape.parent.sendToBack(shape);
                }
                break;
            case 'front':
                for(let shape of selection) {
                    shape.parent.sendToFront(shape);
                }
                break;
        }
    }
    currentTool = tool;
}

function cancelSelection() {
    selection = [];
}

function groupSelection() {
    if(selection.length > 1) {
        let newGroup = new Group(layers[currentLayer]);
        for(let shape of selection) {
            newGroup.addChild(layers[currentLayer].removeChild(shape));
        }
        layers[currentLayer].addChild(newGroup);
        selection = [newGroup];
    }
}

function ungroupSelection() {
    let newSelection = [];
    for(let shape of selection) {
        if(shape instanceof Group) {
            newSelection.push(...shape.dissolve());
        }
    }
    selection = newSelection;
}

function duplicateSelection() {
    let newSelection = [];
    for(let shape of selection) {
        let clone = shape.clone(1, 1);
        newSelection.push(clone);
    }
    selection = newSelection;
}

function rotateSelection(direction) {
    if(direction > 0) {
        
    } else {

    }
}

function eraseSelection() {
    console.log(selection)
    for(let shape of selection) {
        console.log('erase');
        shape.erase();
    }
    selection = [];
}

function drawGrid() {
    strokeWeight(1);
    stroke(200);
    for (let x = 0; x < width; x += layers[currentLayer].getGridSize()) {
        line(x, 0, x, height);
    }
    for (let y = 0; y < height; y += layers[currentLayer].getGridSize()) {
        line(0, y, width, y);
    }
}

function clearCanvas() {
    layers = [new Layer(displaySize)];
    selection = [];
}

function getFirstCollidingShape(x, y) {
    for (let i = layers.length - 1; i >= 0; i--) {
        let layer = layers[i];
        for(let j = layer.size() - 1; j >= 0; j--) {
            let shape = layer.getChild(j);
            if(shape.collidesWith(x, y)) {
                return shape;
            }
        }
    }
    return null;
}

function collidesWithSelection(x, y) {
    for(let shape of selection) {
        if(shape.collidesWith(x, y)) {
            return true;
        }    
    }
    return false;
}

let canvas;
function setup() {
    let c = createCanvas(32*displaySize, 32*displaySize);
    c.parent('canvasContainer');
    canvas = document.getElementById("canvasContainer").firstChild;
    for (let element of document.getElementsByClassName("p5Canvas")) {
        element.addEventListener("contextmenu", (e) => e.preventDefault());
    }
    rectMode(CORNERS);
    ellipseMode(CORNERS);
    loadColors(defaultPalette);
    setColor(defaultPalette[0]);
    noSmooth();
}

let layers = [new Layer(displaySize)];
let selection = [];

function draw() {
    background(255);
    let hoveredShape = null;
    if(selectingTools.includes(currentTool)) {
        hoveredShape = getFirstCollidingShape(getMouseX(), getMouseY());
    }
    let offsetX = 0;
    let offsetY = 0;
    if(currentTool == 'select' && movingSelection) {
        offsetX = currentEndX - currentStartX;
        offsetY = currentEndY - currentStartY;
    }
    for (let layer of layers) {
        for(let shape of layer) {
            noStroke();
            if(selection.includes(shape)) {
                noStroke();
                shape.drawWithOffset(offsetX, offsetY);
            } else {
                shape.draw();
            }
        }
    }
    if(drawUI) {
        if(shouldDrawGrid) {
            drawGrid();
        }
        if(hoveredShape) {
            stroke(255, 0, 0);
            strokeWeight(3);
            drawingContext.setLineDash([10, 10]);
            hoveredShape.drawOutline();
            drawingContext.setLineDash([]);
        }
        if(getMouseX() > 0 && getMouseX() < width && getMouseY() > 0 && getMouseY() < height) {
            if(mouseIsPressed) {
                currentEndX = floor(getMouseX()/layers[currentLayer].getGridSize());
                currentEndY = floor(getMouseY()/layers[currentLayer].getGridSize());
                if(currentTool == 'draw') {
                    let sX = min(currentStartX, currentEndX);
                    let sY = min(currentStartY, currentEndY);
                    let eX = max(currentStartX, currentEndX);
                    let eY = max(currentStartY, currentEndY);

                    fill(currentColor);
                    shapes[currentShape].drawRaw(sX, sY, eX, eY, currentRotation, layers[currentLayer]);
                    
                    stroke(255, 0, 0);
                    strokeWeight(3);
                    noFill();
                    rect(sc(sX, layers[currentLayer].getGridSize()), sc(sY, layers[currentLayer].getGridSize()), ec(eX, layers[currentLayer].getGridSize()), ec(eY, layers[currentLayer].getGridSize()));
                }
            } else {
                currentStartX = floor(getMouseX()/layers[currentLayer].getGridSize());
                currentStartY = floor(getMouseY()/layers[currentLayer].getGridSize());
                currentEndX = floor(getMouseX()/layers[currentLayer].getGridSize());
                currentEndY = floor(getMouseY()/layers[currentLayer].getGridSize());
                if(currentTool == 'draw') {
                    fill(currentColor);
                    shapes[currentShape].drawRaw(currentStartX, currentStartY, currentEndX, currentEndY, currentRotation, layers[currentLayer]);
                }
            }
        } else {
            if(mouseIsPressed) {
                canvasXOffset += globalMouse.x - globalMouse2.x;
                canvasYOffset += globalMouse.y - globalMouse2.y;
                document.getElementById("canvasContainer").style.transform = "translate("+canvasXOffset+"px, "+canvasYOffset+"px)";
            }
        }
        if(selection.length == 0) {
            document.getElementById("selectionTools").style = "display: none;";
        } else {
            document.getElementById("selectionTools").style = "";
        }
        if(currentTool == 'select') {
            if(selection.length == 0) {
                stroke(255, 0, 0);
                strokeWeight(3);
                noFill();
                let sX = min(currentStartX, currentEndX);
                let sY = min(currentStartY, currentEndY);
                let eX = max(currentStartX, currentEndX);
                let eY = max(currentStartY, currentEndY);
                drawingContext.setLineDash([10, 10]);
                rect(sc(sX, layers[currentLayer].getGridSize()), sc(sY, layers[currentLayer].getGridSize()), ec(eX, layers[currentLayer].getGridSize()), ec(eY, layers[currentLayer].getGridSize()));
                drawingContext.setLineDash([]);
            }
            if(collidesWithSelection(getMouseX(), getMouseY())) {
                cursor(MOVE);
            } else {
                cursor(ARROW);
            }
        } else {
            cursor(ARROW);
        }
        for(let shape of selection) {
            stroke(0, 0, 255);
            strokeWeight(3);
            shape.drawOutline();
        }
    }
    globalMouse2.x = globalMouse.x;
    globalMouse2.y = globalMouse.y;
}

function mousePressed(event) {
    console.log(event.target)
    if(event.target != canvas || getMouseX() < 0 || getMouseX() > width || getMouseY() < 0 || getMouseY() > height) {
        return;
    }
    currentX = floor(getMouseX()/layers[currentLayer].getGridSize());
    currentY = floor(getMouseY()/layers[currentLayer].getGridSize());
    let targetShape;
    switch(currentTool) {
        case 'select':
            if(collidesWithSelection(getMouseX(), getMouseY())) {
                movingSelection = true;
            } else {
                movingSelection = false;
            }
            break;
        case 'erase':
            targetShape = getFirstCollidingShape(getMouseX(), getMouseY());
            if(targetShape) {
                targetShape.erase();
            }
            break;
        case 'fill':
            targetShape = getFirstCollidingShape(getMouseX(), getMouseY());
            if(targetShape) {
                targetShape.recolor(currentColor);
            }
            break;
        case 'back':
            targetShape = getFirstCollidingShape(getMouseX(), getMouseY());
            if(targetShape) {
                targetShape.parent.sendToBack(targetShape);
            }
            break;
        case 'front':
            targetShape = getFirstCollidingShape(getMouseX(), getMouseY());
            if(targetShape) {
                targetShape.parent.sendToFront(targetShape);
            }
            break;
    }
}

function mouseReleased() {
    if(event.target != canvas || getMouseX() < 0 || getMouseX() > width || getMouseY() < 0 || getMouseY() > height) {
        return;
    }
    switch(currentTool) {
        case 'draw':
            let sX = min(currentStartX, currentEndX);
            let sY = min(currentStartY, currentEndY);
            let eX = max(currentStartX, currentEndX);
            let eY = max(currentStartY, currentEndY);
            if(currentShape == 'rect') {
                for(let x = sX; x <= eX; x ++) {
                    for(let y = sY; y <= eY; y ++) {
                        shapes[currentShape].addToLayer(layers[currentLayer], x, y, x, y, currentRotation, currentColor);
                    }
                }
            } else {
                shapes[currentShape].addToLayer(layers[currentLayer], sX, sY, eX, eY, currentRotation, currentColor);
            }
        break;
        case 'select':
            if(selection.length > 0) {
                if(movingSelection) {
                    movingSelection = false;
                    for(let shape of selection) {
                        shape.move(currentEndX - currentStartX, currentEndY - currentStartY);
                        shape.parent.sendToFront(shape);
                    }
                } else {
                    selection = [];
                }
            } else {
                if(currentStartX == currentEndX && currentStartY == currentEndY) {
                    let shape = getFirstCollidingShape(getMouseX(), getMouseY());
                    if(shape) {
                        selection.push(shape);
                    }
                } else {
                    let sX = min(currentStartX, currentEndX);
                    let sY = min(currentStartY, currentEndY);
                    let eX = max(currentStartX, currentEndX);
                    let eY = max(currentStartY, currentEndY);
                    for(let shape of layers[currentLayer]) {
                        if(shape.fitsWithin(sX, sY, eX, eY)) {
                            selection.push(shape);
                        }
                    }
                }
            }
        break;
    }
}

function mouseDragged() {
    if(event.target != canvas || getMouseX() < 0 || getMouseX() > width || getMouseY() < 0 || getMouseY() > height) {
        return;
    }
    let targetShape;
    switch(currentTool) {
        case 'draw':
            if (currentEndX > currentStartX && currentEndY > currentStartY) {
                setRotation(2);
            } else if (currentEndX < currentStartX && currentEndY > currentStartY) {
                setRotation(3);
            } else if (currentEndX < currentStartX && currentEndY < currentStartY) {
                setRotation(0);
            } else if (currentEndX > currentStartX && currentEndY < currentStartY) {
                setRotation(1);
            }
            break;
        case 'erase':
            targetShape = getFirstCollidingShape(getMouseX(), getMouseY());
            if(targetShape) {
                targetShape.erase();
            }
            break;
        case 'fill':
            targetShape = getFirstCollidingShape(getMouseX(), getMouseY());
            if(targetShape) {
                targetShape.color = currentColor;
            }
            break;
    }
}

function mouseWheel(event) {
    if (event.delta > 0) {
        canvasScale = max(canvasScale - 0.1, 0.1);
    } else {
        canvasScale = min(canvasScale + 0.1, 3);
    }
    document.getElementById("canvasContainer").style.scale = canvasScale;
}

let globalMouse = { x: undefined, y: undefined };
let globalMouse2 = { x: undefined, y: undefined };

window.addEventListener('mousemove', (event) => {
    globalMouse = { x: event.clientX, y: event.clientY };
});