import { secondContactBlocking } from "./Maze Generation/secondContactBlocking.js";
import { aStarDiagonal } from "./Pathfinding/aStarDiagonal.js";
import { aStarOrthogonal } from "./Pathfinding/aStarOrthogonal.js";
import { wavesCollisions } from "./Pathfinding/wavesCollisions.js";
import { generateDFSMaze } from "./Maze Generation/dfsMazeGeneration.js";
import { primMazeGenerator } from "./Maze Generation/primMazeGeneration.js";
import { BFS } from "./Pathfinding/bfsAlgorithm.js";



export const mazeGeneration = [    
    {function: generateDFSMaze,
        name: "DFS"},
    {function: primMazeGenerator,
        name: "Prim's algorithm (kind of)"},
    {function: secondContactBlocking,
        name: "Second Contact Blocking"}  
]
export const pathfinding = [
    
    {function: aStarOrthogonal,
        name: "A Star"},
    {function: aStarDiagonal,
        name: "A Star (diagonal)"},
    {function: BFS,
        name: "BFS"},
    {function: wavesCollisions,
        name: "Waves Collisions"},

]