
let tileCanvas;

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

function getMouseX() {
    return mouseX / canvasScale;
}

function getMouseY() {
    return mouseY / canvasScale;
}

function toggleMenu(id, button) {
    if(document.getElementById(id).style.display === "none") {
        document.getElementById(id).style.display = null;
        button.classList = ["highlighted"];
    } else {
        document.getElementById(id).style.display = "none";
        button.classList = [];
    }
}

function selectButton(button) {
    let currentButtons = document.getElementsByClassName("selectedButton");
    for(let b of currentButtons) {
        b.classList = [];
    }
    button.classList.add("selectedButton");
}

function undo() {
    tileCanvas.undo();
}

function redo() {
    tileCanvas.redo();
}

function toggleGrid(button) {
    tileCanvas.toggleGrid();
    button.classList = shouldDrawGrid ? ["highlighted"] : []
}

function downloadCanvas() {
    tileCanvas.downloadCanvas(document.getElementById("fileName").value);
}

function setColor(color) {
    tileCanvas.setColor(color);
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
    resizeCanvas(w*tileCanvas.resolution, h*tileCanvas.resolution);
}

function setTool(tool) {
    tileCanvas.setTool(TileCanvas.TOOLS[tool]);
    for(let node of document.getElementsByClassName("toolButton")) {
        if(node.internalTool == tool) {
            node.id = "selectedColor";
            node.classList = ["selected"];
            break;
        }
    }
}

function cancelSelection() {
    tileCanvas.cancelSelection();
}

function groupSelection() {
    tileCanvas.groupSelection();
}

function ungroupSelection() {
    tileCanvas.ungroupSelection();
}

function duplicateSelection() {
    tileCanvas.duplicateSelection();
}

function backSelection() {
    tileCanvas.backSelection();
}

function frontSelection() {
    tileCanvas.frontSelection();
}

function rotateSelection(direction) {
    tileCanvas.eraseSelection();
}

function eraseSelection() {
    tileCanvas.eraseSelection();
}

function insideCanvas(mouseX, mouseY) {
    return mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height;
}

function clearCanvas() {
    tileCanvas.clear();
}

let canvas;
let initialSize = 32;
let initialResolution = 32;
function setup() {
    let c = createCanvas(initialSize*initialResolution, initialSize*initialResolution);
    tileCanvas = new TileCanvas(initialSize, initialSize, initialResolution);
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

let canvasScale = 1;
let canvasXOffset = 0;
let canvasYOffset = 0;
let clickingOnCanvas = false;

function draw() {
    clear();
    
    tileCanvas.draw();
    tileCanvas.update(getMouseX(), getMouseY(), clickingOnCanvas);

    if(tileCanvas.hasSelection()) {
        document.getElementById("selectionTools").style = "";
    } else {
        document.getElementById("selectionTools").style = "display: none;";
    }

    if(mouseIsPressed && mouseButton != "left") {
        canvasXOffset += (globalMouse.x - globalMouse2.x) / canvasScale;
        canvasYOffset += (globalMouse.y - globalMouse2.y) / canvasScale;
        document.getElementById("canvasContainer").style.transform = "translate("+canvasXOffset+"px, "+canvasYOffset+"px)";
    }

    globalMouse2.x = globalMouse.x;
    globalMouse2.y = globalMouse.y;
}

function keyPressed() {
    if(key === 'r') {
        selectButton(document.getElementById("rectButton"));
        setShape("rect");
        setTool("draw");
    } else if(key === 'c') {
        selectButton(document.getElementById("ellipseButton"));
        setShape("ellipse");
        setTool("draw");
    } else if(key === 'q') {
        selectButton(document.getElementById("quadrantButton"));
        setShape("quadrant");
        setTool("draw");
    } else if(key === 'i') {
        selectButton(document.getElementById("inverseQuadrantButton"));
        setShape("inverseQuadrant");
        setTool("draw");
    } else if(key === 'w') {
        selectButton(document.getElementById("wedgeButton"));
        setShape("wedge");
        setTool("draw");
    } else if(key === 'b') {
        selectButton(document.getElementById("bezierWedgeButton"));
        setShape("bezierWedge");
        setTool("draw");
    } else if(key === 'e') {
        selectButton(document.getElementById("eraseButton"));
        setTool("erase");
    } else if(key === 'p') {
        selectButton(document.getElementById("paintButton"));
        setTool("paint");
    } else if(key === 's') {
        selectButton(document.getElementById("selectButton"));
        setTool("select");
    } else if(key === 'g') {
        toggleGrid(document.getElementById("gridButton"));
    } else if(key === 'l') {
        toggleMenu('layers', document.getElementById("layerMenuButton"));
    }
}

function mousePressed(event) {
    if(event.target == canvas && insideCanvas(getMouseX(), getMouseY()) && mouseButton == "left") {
        clickingOnCanvas = true;
    }
}
function mouseReleased(event) {
    if(event.target == canvas && insideCanvas(getMouseX(), getMouseY()) && mouseButton == "left") {
        clickingOnCanvas = false;
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