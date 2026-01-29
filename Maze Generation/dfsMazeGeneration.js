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

export async function generateDFSMaze(grid) {

    const cols = Math.floor(grid.COLUMNS/2);
    const rows = Math.floor(grid.ROWS/2);

    const startCol = Math.floor(Math.random()*(cols));
    const startRow = Math.floor(Math.random()*(rows));
    const startIndex = (startCol*2)+1 + (((startRow*2)+1)*grid.COLUMNS);

    const path = [startIndex];
    let currentNode = startIndex;
    grid.squares_states[startIndex] = 4;

    let counter = 0;
    while (path.length > 0) {
        if (!grid.algorithmCanRun) {return}
        const neighbours = getEmptyNeighbours(currentNode,grid);
        
        if (neighbours.length === 0) {
            const nodes = path.pop();
            grid.colorSquare(nodes[0],"rgb(155, 158, 255)");
            grid.colorSquare(nodes[1],"rgb(152, 123, 255)");

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
            if (path.length === 0) break;
            currentNode = path[path.length-1][0];
            if (!grid.algorithmCanRun) {return}
            continue
        }

        const neighboursChosen = neighbours[Math.floor(Math.random()*neighbours.length)];
        grid.squares_states[neighboursChosen[0]] = 4;
        grid.squares_states[neighboursChosen[1]] = 4;
        currentNode = neighboursChosen[0];
        path.push(neighboursChosen);

        grid.colorSquare(neighboursChosen[0],"rgb(146, 218, 254)");
        grid.colorSquare(neighboursChosen[1],"rgb(140, 191, 248)");

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
        counter++;
    }

    for (let i = 0; i < grid.squares_states.length; i++) {
        if (!grid.algorithmCanRun) {return}
        if (i%Math.floor(grid.COLUMNS*grid.ROWS/33) === 0 && grid.visToggleOn) {
            await grid.delay(10);
        }
        if (grid.squares_states[i] === 4) {
            grid.squares_states[i] = grid.STATES.EMPTY;
            grid.colorSquare(i,grid.getSquareColorBasedOnState(i));
        } else {
            grid.squares_states[i] = grid.STATES.WALL;
            grid.colorSquare(i,grid.COLORS.WALL);
        }
        if (!grid.algorithmCanRun) {return}
    }
}