
let shapes = {
    rect: Rect,
    ellipse: Ellipse,
    quadrant: Quadrant,
    inverseQuadrant: InverseQuadrant,
    wedge: Wedge
}

let shouldDrawGrid = true;
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

function setShape(shape) {
    currentShape = shape;
}

function setColor(color) {
    currentColor = color;
}

function setSizeX(sizeX) {
    currentSizeX = sizeX;
}

function setSizeY(sizeY) {
    currentSizeY = sizeY;
}

function setRotation(rotation) {
    currentRotation = rotation;
}

function setTool(tool) {
    if(selection.length > 0) {
        switch(tool) {
            case 'erase':
                for(let shape of selection) {
                    shape.erase();
                }
                selection = [];
                break;
            case 'select':
                selection = [];
                break;
            case 'fill':
                for(let shape of selection) {
                    shape.color = currentColor;
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
        shape.parent.addChild(clone);
        newSelection.push(clone);
    }
    selection = newSelection;
}

function rotateSelection(direction) {
    if(direction > 0) {
        
    } else {

    }
}

function drawGrid() {
    strokeWeight(1);
    stroke(200);
    for (let x = 0; x < width; x += layers[currentLayer].gridSize) {
        line(x, 0, x, height);
    }
    for (let y = 0; y < height; y += layers[currentLayer].gridSize) {
        line(0, y, width, y);
    }
}

function clearCanvas() {
    layers = [new Layer()];
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

function setup() {
    createCanvas(800, 800);
    for (let element of document.getElementsByClassName("p5Canvas")) {
        element.addEventListener("contextmenu", (e) => e.preventDefault());
    }
    rectMode(CORNERS);
    ellipseMode(CORNERS);
    //currentColor = document.getElementById('colorPicker').value;
    currentRotation = document.getElementById('rotation').value;
}

let layers = [new Layer()];
let selection = [];

function draw() {
    background(255);
    if(shouldDrawGrid) {
        drawGrid();
    }
    let hoveredShape = null;
    if(selectingTools.includes(currentTool)) {
        hoveredShape = getFirstCollidingShape(mouseX, mouseY);
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
                if(shape === hoveredShape) {
                    stroke(255, 0, 0);
                    strokeWeight(3);
                    shape.drawOutline();
                }
            }
        }
    }
    if(mouseIsPressed) {
        currentEndX = floor(mouseX/layers[currentLayer].gridSize);
        currentEndY = floor(mouseY/layers[currentLayer].gridSize);
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
            rect(sc(sX, layers[currentLayer].gridSize), sc(sY, layers[currentLayer].gridSize), ec(eX, layers[currentLayer].gridSize), ec(eY, layers[currentLayer].gridSize));
        }
    } else {
        currentStartX = floor(mouseX/layers[currentLayer].gridSize);
        currentStartY = floor(mouseY/layers[currentLayer].gridSize);
        currentEndX = floor(mouseX/layers[currentLayer].gridSize);
        currentEndY = floor(mouseY/layers[currentLayer].gridSize);
        if(currentTool == 'draw') {
            fill(currentColor);
            shapes[currentShape].drawRaw(currentStartX, currentStartY, currentEndX, currentEndY, currentRotation, layers[currentLayer]);
        }
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
            rect(sc(sX, layers[currentLayer].gridSize), sc(sY, layers[currentLayer].gridSize), ec(eX, layers[currentLayer].gridSize), ec(eY, layers[currentLayer].gridSize));
        }
        if(collidesWithSelection(mouseX, mouseY)) {
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

function mousePressed() {
    currentX = floor(mouseX/layers[currentLayer].gridSize);
    currentY = floor(mouseY/layers[currentLayer].gridSize);
    let targetShape;
    switch(currentTool) {
        case 'select':
            if(collidesWithSelection(mouseX, mouseY)) {
                movingSelection = true;
            } else {
                movingSelection = false;
            }
            break;
        case 'erase':
            targetShape = getFirstCollidingShape(mouseX, mouseY);
            if(targetShape) {
                targetShape.erase();
            }
            break;
        case 'fill':
            targetShape = getFirstCollidingShape(mouseX, mouseY);
            if(targetShape) {
                targetShape.color = currentColor;
            }
            break;
        case 'back':
            targetShape = getFirstCollidingShape(mouseX, mouseY);
            if(targetShape) {
                targetShape.parent.sendToBack(targetShape);
            }
            break;
        case 'front':
            targetShape = getFirstCollidingShape(mouseX, mouseY);
            if(targetShape) {
                targetShape.parent.sendToFront(targetShape);
            }
            break;
    }
}

function mouseReleased() {
    if(mouseX < 0 || mouseX > width || mouseY < 0 || mouseY > height) {
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
                    let shape = getFirstCollidingShape(mouseX, mouseY);
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
            targetShape = getFirstCollidingShape(mouseX, mouseY);
            if(targetShape) {
                targetShape.erase();
            }
            break;
        case 'fill':
            targetShape = getFirstCollidingShape(mouseX, mouseY);
            if(targetShape) {
                targetShape.color = currentColor;
            }
            break;
    }
}

function mouseWheel(event) {
    if (event.delta > 0) {
        currentRotation = (currentRotation + 1) % 4;
    } else {
        currentRotation = (currentRotation - 1 + 4) % 4;
    }
    document.getElementById('rotation').value = currentRotation;
}