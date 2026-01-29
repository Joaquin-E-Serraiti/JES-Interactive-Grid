let skipList = new Map();
let maxLevel = 3;

skipList.set("start",{
    id:"start",
    gCost:-Infinity,hCost:-Infinity,
    forward:[null,null,null,null]
    //backward pointers are not needed because this node will never be deleted or moved.
})

function getNode(id) {
    return skipList.get(id);
}

function generateLinks(height) {
    return new Array(height).fill(null);
}

function generateLevel() {
    let level = 0;
    while (Math.random()>0.5 && level < 16) { // 16 = max allowed level
        level++
    }

    if (level > maxLevel) {
        const startNode = getNode("start");
        for (let i = maxLevel; i < level; i++) {
            startNode.forward.push(null); 
        }
        maxLevel = level;
    }

    return level
}

function insertNode(nodeId,nodeObject) {
    const newNodeLevel = generateLevel();
    const lastNodesTraversedId = Array(maxLevel+1);
    let currentNodeId = "start";
    let currentNode = getNode("start");
    for (let i = maxLevel; i >= 0; i--) {
        while (currentNode.forward[i] !== null) {
            const nextNode = getNode(currentNode.forward[i]);
            const nextNodeFCost = nextNode.gCost + nextNode.hCost
            const nodeToInsertFCost = nodeObject.gCost + nodeObject.hCost
            if ((nextNodeFCost) > (nodeToInsertFCost) || (nextNodeFCost === nodeToInsertFCost && nextNode.hCost > nodeObject.hCost)) {
                break
            }
            currentNodeId = currentNode.forward[i];
            currentNode = nextNode;
        }
        lastNodesTraversedId[i] = currentNodeId;
    }

    nodeObject.forward = generateLinks(newNodeLevel+1);
    nodeObject.backward = generateLinks(newNodeLevel+1);

    skipList.set(nodeId,nodeObject);
    for (let i = 0; i < newNodeLevel+1; i++) {
        const lastNodeTraversed = getNode(lastNodesTraversedId[i]);

        nodeObject.forward[i] = lastNodeTraversed.forward[i];
        nodeObject.backward[i] = lastNodesTraversedId[i];

        if (getNode(lastNodesTraversedId[i]).forward[i] !== null) {
            const nextNode = getNode(lastNodeTraversed.forward[i]);
            nextNode.backward[i] = nodeId;
        }
        lastNodeTraversed.forward[i] = nodeId;
    } 
}

function deleteNode(nodeId) {
    const node = getNode(nodeId);
    for (let i = 0; i < node.backward.length; i++) {
        const previousNode = getNode(node.backward[i]);
        previousNode.forward[i] = node.forward[i];

        if (node.forward[i] !== null) {
            const nextNode = getNode(node.forward[i]);
            nextNode.backward[i] = node.backward[i];
        }
        node.forward[i] = null;
        node.backward[i] = null;
    }
    skipList.delete(nodeId);
}




// ------------------------ DISTANCE FUNCTIONS ------------------------

function manhattanDistance(squareIndex1,squareIndex2,columns) {
    const col1 = squareIndex1%columns;
    const row1 = Math.floor(squareIndex1/columns);
    const col2 = squareIndex2%columns;
    const row2 = Math.floor(squareIndex2/columns);

    return (Math.abs(col1-col2)+Math.abs(row1-row2))*10
}

// ------------------------------- A STAR FUNCTION -------------------------------

export async function aStarOrthogonal(grid) {
    skipList = new Map()
    maxLevel = 3;
    skipList.set("start",{
        id:"start",
        gCost:-Infinity,hCost:-Infinity,
        forward:[null,null,null,null]
        //backward pointers are not needed because this node will never be deleted or moved.
    })

    const start = grid.startIndex;
    const end = grid.endIndex;

    const distToFarthestCorner = distanceToFarthestCorner(start,grid.COLUMNS,grid.ROWS);

    const exploredNodes = new Map();
    let currentNode = {index:start,parentId:null,gCost:0,hCost:manhattanDistance(start,end,grid.COLUMNS)};
    exploredNodes.set(currentNode.index,currentNode);

    let counter = 0;
    while (currentNode.index !== end) {
        if (!grid.algorithmCanRun) {return}
        counter++;

        const neighboursIndices = grid.getNeighbouringSquares(currentNode.index,[grid.STATES.EMPTY,grid.STATES.END],false);
        const orthogonal = neighboursIndices.orthogonal;
        const diagonal = neighboursIndices.diagonal;

        for (let i = 0; i<1; i++) {
            for (const neighbourIndex of [orthogonal,diagonal][i]) {
                if (!grid.algorithmCanRun) {return}

                const alreadyExplored = exploredNodes.get(neighbourIndex);
                if (alreadyExplored) {
                    if (alreadyExplored.gCost > currentNode.gCost+([10,14][i])) {
                        exploredNodes.delete(neighbourIndex);
                        alreadyExplored.gCost = currentNode.gCost+([10,14][i]);
                        alreadyExplored.parentId = currentNode.index;
                        insertNode(alreadyExplored.index,alreadyExplored);
                    }
                    continue
                }
    
                const alreadyOpen = skipList.get(neighbourIndex);
                if (alreadyOpen) {
                    if (alreadyOpen.gCost > currentNode.gCost+([10,14][i])) {
                        deleteNode(alreadyOpen.index);
                        alreadyOpen.gCost = currentNode.gCost+([10,14][i]);
                        alreadyOpen.parentId = currentNode.index;
                        insertNode(alreadyOpen.index,alreadyOpen);
                    }
                    continue
                }
    
                const newNode = {index:neighbourIndex,parentId:currentNode.index,gCost:currentNode.gCost+([10,14][i]), hCost:manhattanDistance(neighbourIndex,end,grid.COLUMNS)};
                insertNode(newNode.index,newNode);
                if(newNode.index !== end){grid.colorSquare(newNode.index,getExploredNodeColor(newNode.gCost,distToFarthestCorner,true))}
            }
        }
        
        
        if (skipList.get("start").forward[0] === null) {return}
        currentNode = skipList.get(skipList.get("start").forward[0]);

        if(currentNode.index !== end){grid.colorSquare(currentNode.index,getExploredNodeColor(currentNode.gCost,distToFarthestCorner))}
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

        deleteNode(currentNode.index);
        exploredNodes.set(currentNode.index,currentNode);
    }
    if (currentNode.index !== end) {return}
    const pathLength = currentNode.gCost/10;
    currentNode = exploredNodes.get(currentNode.parentId);
    let counter2 = 0;
    while (currentNode.index!==start) {
        if (!grid.algorithmCanRun) {return}
        grid.colorSquare(currentNode.index,getPathColors(pathLength,counter2))
        currentNode = exploredNodes.get(currentNode.parentId);
        if (grid.visToggleOn){
            if (grid.visualizationSpeed === 1) {
                await grid.delay(100);
            } else if (grid.visualizationSpeed === 2) {
                await grid.delay(20);
            } else if (grid.visualizationSpeed === 3) {
                await grid.delay(0);
            } else if (grid.visualizationSpeed === 4 && counter2%6===0) {
                await grid.delay(0);
            }
        }
        if (!grid.algorithmCanRun) {return}
        counter2++;
    }
}



// ----------------------- COLOR FUNCTIONS -----------------------

function distanceToFarthestCorner(start,columns,rows) {
    const startCol = start%columns;
    const startRow = Math.floor(start/columns)

    let column = 0;
    let row = 0;

    if (startCol > columns/2) {
        column = 0;
    } else {
        column = columns-1;
    }
    if (startRow > rows/2) {
        row = 0;
    } else {
        row = rows-1;
    }
    const cornerIndex = row*columns + column;
    return (manhattanDistance(start,cornerIndex,columns))
}


function getExploredNodeColor(gCost,distanceToFarthestCorner,openNode=false) {
    const color = "rgb(87, 67, 187)";
    "rgb(110, 165, 230)"
    "rgb(140, 130, 230)"

    let red = Math.min(110+((30/distanceToFarthestCorner)*gCost), 140);
    let green = Math.max(165-((35/distanceToFarthestCorner)*gCost),130);
    let blue = 230

    if (openNode) {
        red = Math.min(160+((55/distanceToFarthestCorner)*gCost), 190);
        green = Math.max(200-((20/distanceToFarthestCorner)*gCost),165);
        blue = 250
    }

    return `rgb(${red},${green},${blue})`
}

function getPathColors(pathLength,current) {
    const unit = 255/pathLength;

    const blue = Math.max(Math.min(Math.abs(165-(unit*current*2)),160),110);
    const red = (Math.min(((255*2) - (unit*current*2.2)),240))
    const green = (Math.min(80+(unit*current*1.1),220))

    return `rgb(${red},${green},${blue})`
}