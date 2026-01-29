function getEmptyNeighbours(nodeIndex, grid) {
    const nodeCol = nodeIndex%grid.COLUMNS;
    const nodeRow = Math.floor(nodeIndex/grid.COLUMNS);

    const neighbours = [];

    if (nodeCol >= 2 && grid.squares_states[nodeIndex-2] === grid.STATES.EMPTY) {neighbours.push([nodeIndex-2,nodeIndex-1])}
    if (nodeCol <= grid.COLUMNS-3 && grid.squares_states[nodeIndex+2] === grid.STATES.EMPTY) {neighbours.push([nodeIndex+2,nodeIndex+1])}
    if (nodeRow >= 2 && grid.squares_states[nodeIndex-grid.COLUMNS*2] === grid.STATES.EMPTY) {neighbours.push([nodeIndex-grid.COLUMNS*2,nodeIndex-grid.COLUMNS])}
    if (nodeRow <= grid.ROWS-3 && grid.squares_states[nodeIndex+grid.COLUMNS*2] === grid.STATES.EMPTY) {neighbours.push([nodeIndex+grid.COLUMNS*2,nodeIndex+grid.COLUMNS])}

    return neighbours
}

export async function primMazeGenerator(grid) {

    const cols = Math.floor(grid.COLUMNS/2);
    const rows = Math.floor(grid.ROWS/2);

    const startCol = Math.floor(Math.random()*(cols));
    const startRow = Math.floor(Math.random()*(rows));
    const startIndex = (startCol*2)+1 + (((startRow*2)+1)*grid.COLUMNS);


    const nodesToExplore = [];
    const edges = new Map()
    let currentNode = startIndex;
    grid.squares_states[startIndex] = 4;
    grid.colorSquare(startIndex,"rgb(155, 158, 255)")

    let counter = 0;
    while (nodesToExplore.length > 0 || counter === 0) {
        if (!grid.algorithmCanRun) {return}
        const neighbours = getEmptyNeighbours(currentNode,grid);
        
        for (const neighbourPair of neighbours) {
            if (!grid.algorithmCanRun) {return}
            if (!edges.has(neighbourPair[0])) {
                nodesToExplore.push(neighbourPair[0])
            };
            edges.set(neighbourPair[0], neighbourPair[1]);
        }

        const indexChosen = Math.floor(Math.random()*nodesToExplore.length);
        const neighbourChosen = nodesToExplore[indexChosen];
        nodesToExplore[indexChosen] = nodesToExplore[nodesToExplore.length-1];
        nodesToExplore.pop();
        const wall = edges.get(neighbourChosen);
        edges.delete(neighbourChosen);

        grid.squares_states[neighbourChosen] = 4;
        grid.squares_states[wall] = 4;
        currentNode = neighbourChosen;

        grid.colorSquare(neighbourChosen,"rgb(155, 158, 255)");
        grid.colorSquare(wall,"rgb(152, 123, 255)");

        if (grid.visToggleOn){
            if (grid.visualizationSpeed === 1) {
                await grid.delay(100);
            } else if (grid.visualizationSpeed === 2) {
                await grid.delay(20);
            } else if (grid.visualizationSpeed === 3) {
                await grid.delay(0);
            } else if (grid.visualizationSpeed === 4 && counter%6===0) {
                await grid.delay(0);
            }
        }
        if (!grid.algorithmCanRun) {return}
        counter++;
    }

    for (let i = 0; i < grid.squares_states.length; i++) {
        if (!grid.algorithmCanRun) {return}
        if (i%Math.max(1, Math.floor(grid.COLUMNS * grid.ROWS / 33)) === 0 && grid.visToggleOn) {
            await grid.delay(10);
        }
        if (grid.squares_states[i] === 4) {
            grid.squares_states[i] = grid.STATES.EMPTY;
            grid.colorSquare(i,grid.getSquareColorBasedOnState(i));
        } else {
            grid.squares_states[i] = grid.STATES.WALL;
            grid.colorSquare(i,grid.COLORS.WALL);
        }
    }
}