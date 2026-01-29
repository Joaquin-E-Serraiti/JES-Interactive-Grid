function getRandomElement(list=[]) {
    const index = Math.floor(Math.random()*(list.length));
    return list[index];
}

export async function secondContactBlocking(grid) {


    const totalSquares = grid.COLUMNS*grid.ROWS;
    const path = [];
    const start = Math.floor(Math.random()*(totalSquares));
    let squareSelected = start;
    grid.squares_states[start] = 4;
    path.push(start)
    let goingBack = false;
    let counter = 0;

    while (path.length > 0) {
        if (!grid.algorithmCanRun) {return}
        counter++;
        const neighbours = grid.getNeighbouringSquares(squareSelected,new Set([0,5,6])).orthogonal;
        const explorableNeighbours = []
        for (const neighbour of neighbours) {
            if (!grid.algorithmCanRun) {return}
            if (grid.squares_states[neighbour] == 5) {
                if (!goingBack) {
                    grid.squares_states[neighbour] = 3;
                    grid.colorSquare(neighbour,grid.COLORS.WALL)
                } else {
                    explorableNeighbours.push(neighbour)
                }
            }
            if (!goingBack && grid.squares_states[neighbour] == 0) {
                grid.squares_states[neighbour] = 5;
                grid.colorSquare(neighbour,"rgb(130, 124, 218)")
                explorableNeighbours.push(neighbour)
            }
        }
        if (explorableNeighbours.length == 0) {
            grid.squares_states[path.pop()] = 0;
            let color = grid.COLORS.EMPTY;
            if (grid.SQUARE_BORDER_WIDTH === 0) {
                color = grid.getEmptyColorByPosition(squareSelected);
            }
            grid.colorSquare(squareSelected,color);
            squareSelected = path[path.length-1];
            goingBack = true;
            continue
        } else {
            goingBack = false
        }
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
        squareSelected = getRandomElement(explorableNeighbours);
        grid.colorSquare(squareSelected,"rgb(184, 198, 255)")
        grid.squares_states[squareSelected] = 4;
        path.push(squareSelected)
    }
}