function addEmptyNeighbours(nodeIndex, exploredNodes, newNodes, grid, endIndex) {
    const nodeCol = nodeIndex%grid.COLUMNS;
    const nodeRow = Math.floor(nodeIndex/grid.COLUMNS);

    if (nodeCol >= 1 && grid.squares_states[nodeIndex-1] !== grid.STATES.WALL && !exploredNodes.has(nodeIndex-1)) {
        if (nodeIndex-1 === endIndex) {return true}
        newNodes.push(nodeIndex-1);
        exploredNodes.set(nodeIndex-1,nodeIndex);
    }

    if (nodeCol <= grid.COLUMNS-2 && grid.squares_states[nodeIndex+1] !== grid.STATES.WALL && !exploredNodes.has(nodeIndex+1)) {
        if (nodeIndex+1 === endIndex) {return true}
        newNodes.push(nodeIndex+1);
        exploredNodes.set(nodeIndex+1,nodeIndex);
    }

    if (nodeRow >= 1 && grid.squares_states[nodeIndex-grid.COLUMNS] !== grid.STATES.WALL && !exploredNodes.has(nodeIndex-grid.COLUMNS)) {
        if (nodeIndex-grid.COLUMNS === endIndex) {return true}
        newNodes.push(nodeIndex-grid.COLUMNS);
        exploredNodes.set(nodeIndex-grid.COLUMNS,nodeIndex);
    }

    if (nodeRow <= grid.ROWS-2 && grid.squares_states[nodeIndex+grid.COLUMNS] !== grid.STATES.WALL && !exploredNodes.has(nodeIndex+grid.COLUMNS)) {
        if (nodeIndex + grid.COLUMNS === endIndex) {return true}
        newNodes.push(nodeIndex+grid.COLUMNS);
        exploredNodes.set(nodeIndex+grid.COLUMNS,nodeIndex);
    }

    return false
}

export async function BFS(grid) {
    
    const start = grid.startIndex;
    const end = grid.endIndex;

    const exploredNodes = new Map();
    exploredNodes.set(start,null)
    let currentLayer = [start];
    let nextLayer = [];
    let counter = 0;

    while (currentLayer.length > 0) {
        if (!grid.algorithmCanRun) {return}
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
        for (let i = 0; i < currentLayer.length; i++) {
            if (!grid.algorithmCanRun) {return}

            if (currentLayer[i] !== start){grid.colorSquare(currentLayer[i],"rgb(109, 110, 225)")}
            

            if (addEmptyNeighbours(currentLayer[i],exploredNodes,nextLayer,grid,end)) {
                let currentNode = currentLayer[i];
                let counter = 0;
                while (currentNode !== start) {
                    if (!grid.algorithmCanRun) {return}
                    grid.colorSquare(currentNode,"rgb(153, 245, 255)")
                    currentNode = exploredNodes.get(currentNode);
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
                return
            }
        }
        currentLayer = nextLayer;
        nextLayer = [];
    }
}