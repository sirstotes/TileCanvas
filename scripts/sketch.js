
let maker;

let defaultPalette = ["#000000", "#1D2B53", "#7E2553", "#008751", "#AB5236", "#5F574F", "#C2C3C7", "#FFF1E8", "#FF004D", "#FFA300", "#FFEC27", "#00E436", "#29ADFF", "#83769C", "#FF77A8", "#FFCCAA"];

let palette = [];

function addColor(color) {
    for(let c of palette) {
        if(c.color == color) {
            return;
        }
    }

    let newButton = document.createElement("button");
    newButton.onclick = () => {setColor(color)};
    newButton.style = "background-color:"+color+";";
    document.getElementById("colorPalette").appendChild(newButton);

    let newController = document.createElement("button");
    newController.onclick = () => {removeColor(color)};
    newController.innerHTML = "<img src='assets/cross-circle.png'>";
    newController.style = "background-color:"+color+";flex-grow:1;";
    document.getElementById("paletteButtons").appendChild(newController);
    
    palette.push({
        color: color,
        selectButton: newButton,
        removeButton: newController
    });
}

function removeColor(color) {
    for(let i = 0; i < palette.length; i ++) {
        if (palette[i].color == color) {
            palette[i].selectButton.remove();
            palette[i].removeButton.remove();
            palette.splice(i, 1);
        }
    }
}

function loadColors(colors) {
    document.getElementById("colorPalette").childNodes = [];
    for(let color of colors) {
        addColor(color);
    }
}

function setColor(color) {
    maker.setColor(color);
    let current = document.getElementById("selectedColor");
    if(current) {
        current.id = "";
        current.classList = [];
    }
    for(let c of palette) {
        if(c.color == color) {
            c.selectButton.id = "selectedColor";
            c.selectButton.classList = ["selected"];
            break;
        }
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

function undo() {
    maker.undo();
}

function redo() {
    maker.redo();
}

function toggleGrid(button) {
    maker.toggleGrid();
    button.classList = maker.shouldDrawGrid ? ["highlighted"] : []
}

function downloadCanvas() {
    maker.downloadCanvas(document.getElementById("fileName").value);
}

function setCanvasSize(w, h) {
    maker.width = w;
    maker.height = h;
    resizeCanvas(maker.width*maker.resolution, maker.height*maker.resolution);
}

function setResolution(r) {
    maker.resolution = r;
    resizeCanvas(maker.width*maker.resolution, maker.height*maker.resolution);
}

function setBackgroundColor(c) {
    maker.backgroundColor = c;
}

function setToolOption(optionName, value) {
    Tool[optionName] = Tool[optionName+"_OPTIONS"][value];
}

function setTool(toolName) {
    maker.setTool(Maker.TOOLS[toolName]);
    let currentButtons = document.getElementsByClassName("selectedButton");
    for(let b of currentButtons) {
        b.classList = [];
    }
    document.getElementById(toolName+"_Button").classList.add("selectedButton");
}

function cancelSelection() {
    maker.cancelSelection();
}

function groupSelection() {
    maker.groupSelection();
}

function ungroupSelection() {
    maker.ungroupSelection();
}

function duplicateSelection() {
    maker.duplicateSelection();
}

function backSelection() {
    maker.backSelection();
}

function frontSelection() {
    maker.frontSelection();
}

function rotateSelection(direction) {
    maker.eraseSelection();
}

function eraseSelection() {
    maker.eraseSelection();
}

function insideCanvas(mouseX, mouseY) {
    return mouseX > 0 && mouseX < width && mouseY > 0 && mouseY < height;
}

function clearCanvas() {
    maker.clear();
}

function zoom(x) {
    canvasScale = constrain(canvasScale + x, 0.1, 3);
    document.getElementById("canvasContainer").style.scale = canvasScale;
}

function pan(x, y) {
    canvasXOffset = constrain(canvasXOffset + int(x) / canvasScale, -width, width);
    canvasYOffset = constrain(canvasYOffset + int(y) / canvasScale, -height, height);
    document.getElementById("canvasContainer").style.transform = "translate("+canvasXOffset+"px, "+canvasYOffset+"px)";
}

function continuousPress(button, callback) {
    button.addEventListener("mousedown", () => {
        button.pressInterval = setInterval(callback, 20);
        setTimeout(() => {clearInterval(button.pressInterval)}, 3000);
    });
    button.addEventListener("touchstart", () => {
        button.pressInterval = setInterval(callback, 20);
        setTimeout(() => {clearInterval(button.pressInterval)}, 3000);
    });
    button.addEventListener("mouseup", () => {
        clearInterval(button.pressInterval);
    });
    button.addEventListener("touchend", () => {
        clearInterval(button.pressInterval);
    });
}

let canvas;
function setup() {
    let initialSize = document.getElementById("canvasW").value;
    let initialResolution = document.getElementById("tileResolution").value;
    let c = createCanvas(initialSize*initialResolution, initialSize*initialResolution);
    maker = new Maker(initialSize, initialSize, initialResolution);
    c.parent('canvasContainer');
    canvas = document.getElementById("canvasContainer").firstChild;
    for (let element of document.getElementsByClassName("p5Canvas")) {
        element.addEventListener("contextmenu", (e) => e.preventDefault());
    }

    setTool("RECT");
    setToolOption("REPLACEMENT_MODE", document.getElementById("replacementModeSelect").value);
    setToolOption("DRAG_MODE", document.getElementById("placementModeSelect").value);
    setToolOption("SELECTION_MODE", document.getElementById("selectionModeSelect").value);

    continuousPress(document.getElementById("zoomInButton"), () => {zoom(0.05)});
    continuousPress(document.getElementById("zoomOutButton"), () => {zoom(-0.05)});
    continuousPress(document.getElementById("panLeftButton"), () => {pan(-10, 0)});
    continuousPress(document.getElementById("panRightButton"), () => {pan(10, 0)});
    continuousPress(document.getElementById("panUpButton"), () => {pan(0, -10)});
    continuousPress(document.getElementById("panDownButton"), () => {pan(0, 10)});

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
    
    maker.draw();
    maker.update(getMouseX(), getMouseY(), clickingOnCanvas);

    if(maker.hasSelection()) {
        document.getElementById("selectionTools").style = "";
        if(maker.getSelection().onlyBezier()) {
            document.getElementById("bezierControls").style = "";
        } else {
            document.getElementById("bezierControls").style = "display: none;";
        }
    } else {
        document.getElementById("selectionTools").style = "display: none;";
    }

    if(mouseIsPressed && mouseButton != "left") {
        pan(globalMouse.x - globalMouse2.x, globalMouse.y - globalMouse2.y);
    }

    globalMouse2.x = globalMouse.x;
    globalMouse2.y = globalMouse.y;

    for(let button of document.getElementsByClassName("shapeButton")) {
        button.childNodes[0].style = "rotate:"+maker.getRotation()*90+"deg;"
    }
}

function keyPressed() {
    if(key === 'r') {
        setTool("RECT");
    } else if(key === 'c') {
        setTool("ELLIPSE");
    } else if(key === 'q') {
        setTool("QUADRANT");
    } else if(key === 'i') {
        setTool("INVERSE_QUADRANT");
    } else if(key === 'w') {
        setTool("WEDGE");
    } else if(key === 'b') {
        setTool("BEZIER_WEDGE");
    } else if(key === 'e') {
        setTool("ERASE");
    } else if(key === 'p') {
        setTool("PAINT");
    } else if(key === 's') {
        setTool("SELECT");
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
function touchStarted(event) {
    if(event.target == canvas && insideCanvas(getMouseX(), getMouseY()) && mouseButton == "left") {
        clickingOnCanvas = true;
    }
}
function touchEnded(event) {
    if(event.target == canvas && insideCanvas(getMouseX(), getMouseY()) && mouseButton == "left") {
        clickingOnCanvas = false;
    }
}


let globalMouse = { x: undefined, y: undefined };
let globalMouse2 = { x: undefined, y: undefined };

window.addEventListener('mousemove', (event) => {
    globalMouse = { x: event.clientX, y: event.clientY };
});

document.addEventListener('gesturestart', function(e) {
  e.preventDefault();
});