
import React, { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Shuffle } from 'lucide-react';
import { bfs, dfs, dijkstra, astar } from '@/algorithms/pathfindingAlgorithms';

interface Cell {
  row: number;
  col: number;
  isWall: boolean;
  isStart: boolean;
  isEnd: boolean;
  isVisited: boolean;
  isPath: boolean;
  distance: number;
  heuristic: number;
  parent: Cell | null;
}

const PathfindingVisualizer = () => {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [speed, setSpeed] = useState([50]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [algorithm, setAlgorithm] = useState('bfs');
  const [startNode, setStartNode] = useState({ row: 5, col: 5 });
  const [endNode, setEndNode] = useState({ row: 15, col: 25 });
  const [isPlacingWalls, setIsPlacingWalls] = useState(false);
  const [mode, setMode] = useState('wall'); // wall, start, end

  const ROWS = 20;
  const COLS = 40;

  const algorithms = {
    bfs: { name: 'Breadth-First Search', fn: bfs, description: 'Explores nodes level by level. Guarantees shortest path for unweighted graphs.' },
    dfs: { name: 'Depth-First Search', fn: dfs, description: 'Explores as far as possible before backtracking. Does not guarantee shortest path.' },
    dijkstra: { name: "Dijkstra's Algorithm", fn: dijkstra, description: 'Finds shortest path in weighted graphs. Guarantees optimal solution.' },
    astar: { name: 'A* Search', fn: astar, description: 'Heuristic-based search. Often faster than Dijkstra while maintaining optimality.' }
  };

  const createNode = (row: number, col: number): Cell => ({
    row,
    col,
    isWall: false,
    isStart: row === startNode.row && col === startNode.col,
    isEnd: row === endNode.row && col === endNode.col,
    isVisited: false,
    isPath: false,
    distance: Infinity,
    heuristic: 0,
    parent: null,
  });

  const initializeGrid = useCallback(() => {
    const newGrid: Cell[][] = [];
    for (let row = 0; row < ROWS; row++) {
      const currentRow: Cell[] = [];
      for (let col = 0; col < COLS; col++) {
        currentRow.push(createNode(row, col));
      }
      newGrid.push(currentRow);
    }
    return newGrid;
  }, [startNode, endNode]);

  useEffect(() => {
    setGrid(initializeGrid());
  }, [initializeGrid]);

  const clearVisualization = () => {
    setGrid(grid.map(row => 
      row.map(cell => ({
        ...cell,
        isVisited: false,
        isPath: false,
        distance: Infinity,
        parent: null,
      }))
    ));
  };

  const clearWalls = () => {
    setGrid(grid.map(row => 
      row.map(cell => ({
        ...cell,
        isWall: false,
      }))
    ));
  };

  const generateMaze = () => {
    const newGrid = grid.map(row => 
      row.map(cell => ({
        ...cell,
        isWall: Math.random() < 0.3 && !cell.isStart && !cell.isEnd,
        isVisited: false,
        isPath: false,
      }))
    );
    setGrid(newGrid);
  };

  const handleCellClick = (row: number, col: number) => {
    if (isPlaying) return;

    const newGrid = [...grid];
    const cell = newGrid[row][col];

    if (mode === 'start') {
      // Clear previous start
      newGrid.forEach(r => r.forEach(c => c.isStart = false));
      cell.isStart = true;
      cell.isWall = false;
      setStartNode({ row, col });
    } else if (mode === 'end') {
      // Clear previous end
      newGrid.forEach(r => r.forEach(c => c.isEnd = false));
      cell.isEnd = true;
      cell.isWall = false;
      setEndNode({ row, col });
    } else if (mode === 'wall' && !cell.isStart && !cell.isEnd) {
      cell.isWall = !cell.isWall;
    }

    setGrid(newGrid);
  };

  const handleMouseEnter = (row: number, col: number) => {
    if (isPlaying || !isPlacingWalls || mode !== 'wall') return;
    
    const newGrid = [...grid];
    const cell = newGrid[row][col];
    
    if (!cell.isStart && !cell.isEnd) {
      cell.isWall = true;
      setGrid(newGrid);
    }
  };

  const startVisualization = async () => {
    clearVisualization();
    setIsPlaying(true);
    
    const startCell = grid[startNode.row][startNode.col];
    const endCell = grid[endNode.row][endNode.col];
    
    const result = algorithms[algorithm as keyof typeof algorithms].fn(grid, startCell, endCell);
    
    // Animate visited nodes
    for (let i = 0; i < result.visitedNodes.length; i++) {
      setTimeout(() => {
        const node = result.visitedNodes[i];
        setGrid(prevGrid => {
          const newGrid = [...prevGrid];
          newGrid[node.row][node.col] = { ...newGrid[node.row][node.col], isVisited: true };
          return newGrid;
        });
      }, (101 - speed[0]) * i);
    }

    // Animate path
    setTimeout(() => {
      for (let i = 0; i < result.path.length; i++) {
        setTimeout(() => {
          const node = result.path[i];
          setGrid(prevGrid => {
            const newGrid = [...prevGrid];
            newGrid[node.row][node.col] = { ...newGrid[node.row][node.col], isPath: true };
            return newGrid;
          });
        }, 50 * i);
      }
      setIsPlaying(false);
    }, (101 - speed[0]) * result.visitedNodes.length);
  };

  const getCellClass = (cell: Cell) => {
    if (cell.isStart) return 'bg-green-500';
    if (cell.isEnd) return 'bg-red-500';
    if (cell.isPath) return 'bg-yellow-400';
    if (cell.isVisited) return 'bg-blue-300';
    if (cell.isWall) return 'bg-gray-800';
    return 'bg-white border border-gray-300';
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Algorithm</label>
          <Select value={algorithm} onValueChange={setAlgorithm}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(algorithms).map(([key, algo]) => (
                <SelectItem key={key} value={key}>{algo.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Mode</label>
          <Select value={mode} onValueChange={setMode}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="wall">Place Walls</SelectItem>
              <SelectItem value="start">Set Start</SelectItem>
              <SelectItem value="end">Set End</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Speed: {speed[0]}%</label>
          <Slider
            value={speed}
            onValueChange={setSpeed}
            min={1}
            max={100}
            step={1}
          />
        </div>

        <div className="flex gap-2">
          <Button onClick={startVisualization} disabled={isPlaying} className="flex-1">
            <Play className="w-4 h-4 mr-2" />
            Start
          </Button>
          <Button onClick={clearVisualization} variant="outline">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={generateMaze} variant="outline" disabled={isPlaying}>
            <Shuffle className="w-4 h-4 mr-2" />
            Maze
          </Button>
          <Button onClick={clearWalls} variant="outline" disabled={isPlaying}>
            Clear
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{algorithms[algorithm as keyof typeof algorithms].name}</CardTitle>
          <CardDescription>{algorithms[algorithm as keyof typeof algorithms].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div 
            className="grid gap-0 mx-auto w-fit border border-gray-400"
            style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
            onMouseLeave={() => setIsPlacingWalls(false)}
          >
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={`w-4 h-4 cursor-pointer transition-colors duration-100 ${getCellClass(cell)}`}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                  onMouseDown={() => setIsPlacingWalls(true)}
                  onMouseEnter={() => handleMouseEnter(rowIndex, colIndex)}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500"></div>
          <span>Start</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500"></div>
          <span>End</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-800"></div>
          <span>Wall</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-300"></div>
          <span>Visited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-400"></div>
          <span>Path</span>
        </div>
      </div>
    </div>
  );
};

export default PathfindingVisualizer;
