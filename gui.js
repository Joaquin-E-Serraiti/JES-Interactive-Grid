import { mazeGeneration, pathfinding } from "./algorithms.js";

const gridCanvas = document.getElementById("gridCanvas");
const ctx = gridCanvas.getContext("2d");

const gridDiv = document.getElementById("gridDiv");
const buttonBar = document.getElementById("buttonBar");
const sizeSlider = document.getElementById("sizeSlider");
const arrowUp = document.getElementById("arrowUp");
const arrowDown = document.getElementById("arrowDown");
const dimensionsText = document.getElementById("dimensionsText");
const sidePanel = document.getElementById("sidePanel");

const clearGridButton = document.getElementById("clearGridButton");
const squareBorderButton = document.getElementById("squareBorderButton");
const runPathfinderButton = document.getElementById("runPathfinderButton");
const runMazeGenButton = document.getElementById("runMazeGenButton");
const selectMazeGenButton = document.getElementById("selectMazeGenButton");
const selectPathfinderButton = document.getElementById("selectPathfinderButton");

const sidePanelHandle = document.getElementById("sidePanelHandle");

gridCanvas.width = gridDiv.clientWidth;
gridCanvas.height = gridDiv.clientHeight;

sizeSlider.oninput = function() {

    grid.algorithmCanRun = false;
    grid.pathfinderRunning = false;
    grid.mazeGenRunning = false;
    runPathfinderButtonImg.src = "assets/pathfinder_button_1.svg";
    runMazeGenButtonImg.src = "assets/maze_gen_button_1.svg";

    grid.takeMeasures();
    grid.resetGridData();
    grid.renderGridFromState();
    dimensionsText.innerText = "Grid size: " + grid.COLUMNS + " x " + grid.ROWS;
}

arrowUp.onclick = function() {
    grid.algorithmCanRun = false;
    grid.pathfinderRunning = false;
    grid.mazeGenRunning = false;
    runPathfinderButtonImg.src = "assets/pathfinder_button_1.svg";
    runMazeGenButtonImg.src = "assets/maze_gen_button_1.svg";
    sizeSlider.value = Number(sizeSlider.value)+1;
    grid.takeMeasures();
    grid.resetGridData();
    grid.renderGridFromState();
    dimensionsText.innerText = "Grid size: " + grid.COLUMNS + " x " + grid.ROWS;
}
arrowDown.onclick = function() {
    grid.algorithmCanRun = false;
    grid.pathfinderRunning = false;
    grid.mazeGenRunning = false;
    runPathfinderButtonImg.src = "assets/pathfinder_button_1.svg";
    runMazeGenButtonImg.src = "assets/maze_gen_button_1.svg";
    sizeSlider.value = Number(sizeSlider.value)-1;
    grid.takeMeasures();
    grid.resetGridData();
    grid.renderGridFromState();
    dimensionsText.innerText = "Grid size: " + grid.COLUMNS + " x " + grid.ROWS;
}

function calculateSquareIndex(event) {
    const canvasCoordinates = gridCanvas.getBoundingClientRect();
    const x = event.clientX - canvasCoordinates.left - grid.GRID_MARGIN - grid.X_SHIFT;
    const y = event.clientY - canvasCoordinates.top - grid.GRID_MARGIN - grid.Y_SHIFT;

    const squareClickedX = Math.floor(x / (grid.SQUARE_SIZE));
    const squareClickedY = Math.floor(y / (grid.SQUARE_SIZE));

    if (squareClickedX < 0 || squareClickedX > grid.COLUMNS-1) {return null}
    if (squareClickedY < 0 || squareClickedY > grid.ROWS-1) {return null}

    const squareIndex = squareClickedX + (squareClickedY*(grid.COLUMNS));
    return squareIndex;
}

let isMouseDown = false;
let isDrawing = false;
let previousSquareClicked = null;
let lastDrawTime = 0;

gridCanvas.addEventListener("mousedown", function(event) {
    isMouseDown = true;
    const squareClickedIndex = calculateSquareIndex(event);
    if (squareClickedIndex !== null && !grid.pathfinderRunning && !grid.mazeGenRunning) {
        const nowTime = Date.now();
        if ((nowTime - lastDrawTime) > 600 || !(previousSquareClicked == squareClickedIndex)) {
            grid.squareClicked(squareClickedIndex);
            previousSquareClicked = squareClickedIndex;
            lastDrawTime = nowTime;
        }
    }
})
window.addEventListener("mouseup", function(event) {
    isMouseDown = false;
})

gridCanvas.addEventListener("mousemove", function(event) {
    if (!isMouseDown || isDrawing || grid.pathfinderRunning | grid.mazeGenRunning) {return}
    isDrawing = true;
    requestAnimationFrame(function() {
        const squareClickedIndex = calculateSquareIndex(event);
        if (squareClickedIndex !== null) {

            const nowTime = Date.now();
            if ((nowTime - lastDrawTime) > 600 || !(previousSquareClicked == squareClickedIndex)) {
                grid.squareClicked(squareClickedIndex);
                previousSquareClicked = squareClickedIndex;
                lastDrawTime = nowTime;
            }
        }
        isDrawing = false;
    })
})









// ----------------------- GRID OBJECT -----------------------

const grid = {};

grid.squares_states = new Uint8Array(1)
grid.GRID_MARGIN = 26;
grid.SQUARE_BORDER_WIDTH = 0;
grid.CANVAS_WIDTH_AVAILABLE = gridCanvas.width-(grid.GRID_MARGIN*2);
grid.CANVAS_HEIGHT_AVAILABLE = gridCanvas.height-(grid.GRID_MARGIN*2);


grid.takeMeasures = function() {
    this.SQUARE_SIZE = 100-sizeSlider.value;
    const REST_X_PIXELS = this.CANVAS_WIDTH_AVAILABLE%this.SQUARE_SIZE;
    const REST_Y_PIXELS = this.CANVAS_HEIGHT_AVAILABLE%this.SQUARE_SIZE;
    this.COLUMNS = (this.CANVAS_WIDTH_AVAILABLE-REST_X_PIXELS)/this.SQUARE_SIZE;
    this.ROWS = (this.CANVAS_HEIGHT_AVAILABLE-REST_Y_PIXELS)/this.SQUARE_SIZE;
    this.X_SHIFT = Math.ceil(REST_X_PIXELS/2);
    this.Y_SHIFT = Math.ceil(REST_Y_PIXELS/2);
}

grid.renderGridFromState = function() {
    ctx.clearRect(0,0,gridCanvas.width,gridCanvas.height);
    for (let row = 0; row < this.ROWS; row++) {
        for (let col = 0; col < this.COLUMNS; col++) {
            ctx.fillStyle = this.getSquareColorBasedOnState(col+(row*this.COLUMNS));
            ctx.fillRect(((col*this.SQUARE_SIZE)+this.X_SHIFT+this.GRID_MARGIN),((row*this.SQUARE_SIZE)+this.Y_SHIFT+this.GRID_MARGIN),this.SQUARE_SIZE-this.SQUARE_BORDER_WIDTH,this.SQUARE_SIZE-this.SQUARE_BORDER_WIDTH);
        }  
    }
}

grid.colorSquare = function(squareIndex,color) {
    const col = squareIndex%this.COLUMNS;
    const row = Math.floor(squareIndex/this.COLUMNS);
    ctx.fillStyle = color;
    ctx.fillRect(((col*this.SQUARE_SIZE)+this.X_SHIFT+this.GRID_MARGIN),((row*this.SQUARE_SIZE)+this.Y_SHIFT+this.GRID_MARGIN),this.SQUARE_SIZE-this.SQUARE_BORDER_WIDTH,this.SQUARE_SIZE-this.SQUARE_BORDER_WIDTH);
}

grid.squareClicked = function(squareIndex) {
    this.manageSquareState(squareIndex);
    const newColor = this.getSquareColorBasedOnState(squareIndex);
    this.colorSquare(squareIndex,newColor);
}

grid.STATES = {EMPTY: 0b00, START: 0b01, END: 0b10, WALL: 0b11};
grid.COLORS = {
    EMPTY:"rgb(255, 255, 255)",
    EMPTY_2:"rgb(241, 241, 241)",
    WALL:"rgb(80 80 95)",
    START:"rgb(69, 206, 151)",
    END:"rgb(249, 74, 147)",
}
grid.getEmptyColorByPosition = function(squareIndex) {
    const squareCol = squareIndex%this.COLUMNS;
    const squareRow = Math.floor(squareIndex/this.COLUMNS);
    if (squareCol%2 !== squareRow%2) {
        return this.COLORS.EMPTY_2
    }
    return this.COLORS.EMPTY
}

grid.getSquareColorBasedOnState = function(squareIndex) {
    const squareState = this.squares_states[squareIndex];

    if (squareState === this.STATES.START) {return this.COLORS.START}
    if (squareState === this.STATES.END) {return this.COLORS.END}
    if (squareState === this.STATES.WALL) {
        return this.COLORS.WALL}
    if (this.SQUARE_BORDER_WIDTH === 0) {return this.getEmptyColorByPosition(squareIndex)}
    return this.COLORS.EMPTY;
}


grid.startPlaced = false;
grid.endPlaced = false;
grid.startIndex = null;
grid.endIndex = null;
grid.manageSquareState = function(squareIndex) {
    const state = this.squares_states[squareIndex];

    if (state !== this.STATES.EMPTY) {
        if (state === this.STATES.START) {
            this.startPlaced = false;
            this.startIndex = null;
        }
        if (state === this.STATES.END) {
            this.endPlaced = false;
            this.endIndex = null;
        }
        this.squares_states[squareIndex] = this.STATES.EMPTY;
        return
    }
    if (!this.startPlaced) {
        this.squares_states[squareIndex] = this.STATES.START;
        this.startPlaced = true;
        this.startIndex = squareIndex;
    } else if (!this.endPlaced) {
        this.squares_states[squareIndex] = this.STATES.END;
        this.endPlaced = true;
        this.endIndex = squareIndex;
    } else {
        this.squares_states[squareIndex] = this.STATES.WALL;
    }
}

grid.resetGridData = function() {
    this.squares_states = new Uint8Array(this.COLUMNS*this.ROWS);
    this.previousSquareClicked = null;
    this.lastDrawTime = 0;
    this.startPlaced = false;
    this.endPlaced = false;
    this.startIndex = null;
    this.endIndex = null;
}

grid.getSquareState = function(squareIndex) {
    return this.squares_states[squareIndex];
}

grid.delay = function(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}


grid.getNeighbouringSquares = function(squareIndex,statesTargeted=null, diagonal=false) {
    const col = squareIndex%this.COLUMNS;
    const row = Math.floor(squareIndex/this.COLUMNS);
    const neighbours = {orthogonal:[],diagonal:[]};
    if (statesTargeted) {statesTargeted=new Set(statesTargeted)}

    const orthogonalCandidates = [
        squareIndex+1,
        squareIndex-1,
        squareIndex + this.COLUMNS,
        squareIndex - this.COLUMNS
    ];

    const diagonalCandidates = []
    if (diagonal) {
        diagonalCandidates.push(
            squareIndex - this.COLUMNS - 1,
            squareIndex - this.COLUMNS + 1,
            squareIndex + this.COLUMNS - 1,
            squareIndex + this.COLUMNS + 1
        )
    }

    for (const candidate of orthogonalCandidates) {
        const candidateCol = candidate%this.COLUMNS;
        const candidateRow = Math.floor(candidate/this.COLUMNS);
        if (candidate < 0 || candidate > (this.COLUMNS*this.ROWS)-1) {continue}
        if ((candidateCol - col) > 1 || (candidateCol - col) < -1 || (candidateRow - row) > 1 || (candidateRow - row) < -1) {continue} // This ensures neighbours are in the surroundings of the square
        if (statesTargeted && !(statesTargeted.has(this.squares_states[candidate]))) {continue}
        neighbours.orthogonal.push(candidate);
    }
    for (const candidate of diagonalCandidates) {
        const candidateCol = candidate%this.COLUMNS;
        const candidateRow = Math.floor(candidate/this.COLUMNS);
        if (candidate < 0 || candidate > (this.COLUMNS*this.ROWS)-1) {continue}
        if ((candidateCol - col) > 1 || (candidateCol - col) < -1 || (candidateRow - row) > 1 || (candidateRow - row) < -1) {continue} // This ensures neighbours are in the surroundings of the square
        if (statesTargeted && !(statesTargeted.has(this.squares_states[candidate]))) {continue}
        neighbours.diagonal.push(candidate);
    }
    return neighbours
}

grid.takeMeasures();
grid.resetGridData();
grid.renderGridFromState();
dimensionsText.innerText = "Grid size: " +  grid.COLUMNS + " x " + grid.ROWS;



// --------------------------------- BUTTONS ---------------------------------

let mazeGenAlgorithm = mazeGeneration[0].function;
let pathfindingAlgorithm = pathfinding[0].function;

clearGridButton.onclick = function() {
    if (grid.pathfinderRunning || grid.mazeGenRunning) {return}
    grid.resetGridData();
    grid.renderGridFromState();
};

const borderImg = document.getElementById("borderImg");
squareBorderButton.onclick = function() {
    if (grid.pathfinderRunning || grid.mazeGenRunning) {return}
    grid.SQUARE_BORDER_WIDTH = 1 - grid.SQUARE_BORDER_WIDTH;
    borderImg.src = ["assets/border_img_1.png","assets/border_img_2.png"][grid.SQUARE_BORDER_WIDTH]
    grid.renderGridFromState();
}

grid.pathfinderRunning = false;
grid.mazeGenRunning = false;
grid.algorithmCanRun = false;

const runPathfinderButtonImg = document.getElementById("pathfinderImg");
const runMazeGenButtonImg = document.getElementById("mazeGenImg");

runPathfinderButton.onclick = function() {
    if (grid.mazeGenRunning) {return}
    if (grid.pathfinderRunning) {
        grid.renderGridFromState();
        runPathfinderButtonImg.src = "assets/pathfinder_button_1.svg";
        grid.algorithmCanRun = false;
        grid.pathfinderRunning = false;
    } else {
        if (!grid.endPlaced || !grid.startPlaced) {return}
        grid.algorithmCanRun = true;
        runPathfinderButtonImg.src = "assets/pathfinder_button_2.svg";
        grid.pathfinderRunning = true;
        pathfindingAlgorithm(grid);
    }
}
runMazeGenButton.onclick = function() {
    if (grid.pathfinderRunning) {return}
    if (grid.mazeGenRunning) {
        runMazeGenButtonImg.src = "assets/maze_gen_button_1.svg";
        grid.algorithmCanRun = false;
        grid.mazeGenRunning = false;
        grid.resetGridData();
        grid.renderGridFromState();
    } else {
        grid.algorithmCanRun = true;
        runMazeGenButtonImg.src = "assets/maze_gen_button_2.svg";
        grid.resetGridData();
        grid.renderGridFromState();
        grid.mazeGenRunning = true;
        (async () => {
            await mazeGenAlgorithm(grid)
            runMazeGenButtonImg.src = "assets/maze_gen_button_1.svg";
            grid.algorithmCanRun = false;
            grid.mazeGenRunning = false;
        })()
        ;
    }
}

let panelOnScreen = false;
const handleArrow = document.getElementById("handleArrow");
sidePanelHandle.onclick = function() {
    if (panelOnScreen) {
        sidePanel.style.left = "-330px";
        handleArrow.style.transform = "rotate(0deg)";
        handleArrow.style.top = "-1px";
        pathfindList.style.display = "none";
        mazeGenList.style.display = "none";
        mazeGenListOn = false;
        pathfindListOn = false;
    } else {
        sidePanel.style.left = "0px";
        handleArrow.style.transform = "rotate(180deg)";
        handleArrow.style.top = "1px";
    }
    panelOnScreen = !panelOnScreen;
}

let pathfindListOn = false;
let mazeGenListOn = false;
const pathfindList = document.getElementById("pathfindList");
const mazeGenList = document.getElementById("mazeGenList");
const pathfinderSelector = document.getElementById("pathfinderSelector");
const mazeGenSelector = document.getElementById("mazeGenSelector");
pathfinderSelector.onclick = function() {
    if (!pathfindListOn) {
        pathfindList.style.display = "initial";
        mazeGenList.style.display = "none";
        mazeGenListOn = false;
    } else {
        pathfindList.style.display = "none";
    }

    pathfindListOn = !pathfindListOn;
}
mazeGenSelector.onclick = function() {
    if (!mazeGenListOn) {
        mazeGenList.style.display = "initial";
        pathfindList.style.display = "none";
        pathfindListOn = false;
    } else {
        mazeGenList.style.display = "none";
    }

    mazeGenListOn = !mazeGenListOn;
}

function addAlgorithmsToList(algorithms,listDiv,pathfinding=true) {
    for (const algorithm of algorithms) {

        const algorithmElement = document.createElement("p");
        algorithmElement.classList.add("algorithmElement");
        algorithmElement.innerText = algorithm.name;
        algorithmElement.onclick = function() {
            if (pathfinding) {
                pathfindingAlgorithm = algorithm.function;
                document.getElementById("pathfindingSelectorText").innerText = algorithm.name;
            } else {
                mazeGenAlgorithm = algorithm.function;
                document.getElementById("mazeGenSelectorText").innerText = algorithm.name;
            }
            pathfindList.style.display = "none";
            pathfindListOn = false;
            mazeGenList.style.display = "none";
            mazeGenListOn = false;
        }
        listDiv.appendChild(algorithmElement)
    }
}
addAlgorithmsToList(mazeGeneration,mazeGenList,false);
addAlgorithmsToList(pathfinding,pathfindList,true);

const visualizationToggle = document.getElementById("visualizationToggle");
const visualizationToggleBackground = document.getElementById("visualizationToggleBackground");
grid.visToggleOn = true;

visualizationToggle.onclick = function() {
    if (grid.visToggleOn) {
        visualizationToggleBackground.style.left = "70px";
    } else {
        visualizationToggleBackground.style.left = "0px";
    }
    grid.visToggleOn = !grid.visToggleOn;
}

grid.visualizationSpeed = 1;
const visSpeedButton = document.getElementById("visSpeedButton");
const speedControlImg = document.getElementById("speedControlImg")
visSpeedButton.onclick = function() {
    grid.visualizationSpeed = (grid.visualizationSpeed%4)+1;
    speedControlImg.src = ["assets/speed_control_1.png","assets/speed_control_2.png","assets/speed_control_3.png","assets/speed_control_4.png"][grid.visualizationSpeed-1]
}

