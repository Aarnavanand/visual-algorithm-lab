
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

const getNeighbors = (grid: Cell[][], cell: Cell): Cell[] => {
  const neighbors: Cell[] = [];
  const { row, col } = cell;
  const directions = [[-1, 0], [1, 0], [0, -1], [0, 1]];

  for (const [dRow, dCol] of directions) {
    const newRow = row + dRow;
    const newCol = col + dCol;
    
    if (
      newRow >= 0 && 
      newRow < grid.length && 
      newCol >= 0 && 
      newCol < grid[0].length &&
      !grid[newRow][newCol].isWall
    ) {
      neighbors.push(grid[newRow][newCol]);
    }
  }
  
  return neighbors;
};

const reconstructPath = (endNode: Cell): Cell[] => {
  const path: Cell[] = [];
  let current: Cell | null = endNode;
  
  while (current !== null) {
    path.unshift(current);
    current = current.parent;
  }
  
  return path;
};

const heuristic = (a: Cell, b: Cell): number => {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
};

export const bfs = (grid: Cell[][], startNode: Cell, endNode: Cell) => {
  const visitedNodes: Cell[] = [];
  const queue: Cell[] = [];
  
  startNode.distance = 0;
  queue.push(startNode);
  
  while (queue.length > 0) {
    const current = queue.shift()!;
    
    if (current.isVisited) continue;
    current.isVisited = true;
    visitedNodes.push(current);
    
    if (current === endNode) {
      return {
        visitedNodes,
        path: reconstructPath(endNode)
      };
    }
    
    const neighbors = getNeighbors(grid, current);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited && neighbor.distance === Infinity) {
        neighbor.distance = current.distance + 1;
        neighbor.parent = current;
        queue.push(neighbor);
      }
    }
  }
  
  return { visitedNodes, path: [] };
};

export const dfs = (grid: Cell[][], startNode: Cell, endNode: Cell) => {
  const visitedNodes: Cell[] = [];
  const stack: Cell[] = [];
  
  stack.push(startNode);
  
  while (stack.length > 0) {
    const current = stack.pop()!;
    
    if (current.isVisited) continue;
    current.isVisited = true;
    visitedNodes.push(current);
    
    if (current === endNode) {
      return {
        visitedNodes,
        path: reconstructPath(endNode)
      };
    }
    
    const neighbors = getNeighbors(grid, current);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        neighbor.parent = current;
        stack.push(neighbor);
      }
    }
  }
  
  return { visitedNodes, path: [] };
};

export const dijkstra = (grid: Cell[][], startNode: Cell, endNode: Cell) => {
  const visitedNodes: Cell[] = [];
  const unvisitedNodes: Cell[] = [];
  
  // Initialize all nodes
  for (const row of grid) {
    for (const cell of row) {
      cell.distance = cell === startNode ? 0 : Infinity;
      unvisitedNodes.push(cell);
    }
  }
  
  while (unvisitedNodes.length > 0) {
    // Sort by distance and get closest unvisited node
    unvisitedNodes.sort((a, b) => a.distance - b.distance);
    const current = unvisitedNodes.shift()!;
    
    if (current.distance === Infinity) break;
    
    current.isVisited = true;
    visitedNodes.push(current);
    
    if (current === endNode) {
      return {
        visitedNodes,
        path: reconstructPath(endNode)
      };
    }
    
    const neighbors = getNeighbors(grid, current);
    for (const neighbor of neighbors) {
      if (!neighbor.isVisited) {
        const newDistance = current.distance + 1;
        if (newDistance < neighbor.distance) {
          neighbor.distance = newDistance;
          neighbor.parent = current;
        }
      }
    }
  }
  
  return { visitedNodes, path: [] };
};

export const astar = (grid: Cell[][], startNode: Cell, endNode: Cell) => {
  const visitedNodes: Cell[] = [];
  const openSet: Cell[] = [];
  const closedSet: Set<Cell> = new Set();
  
  startNode.distance = 0;
  startNode.heuristic = heuristic(startNode, endNode);
  openSet.push(startNode);
  
  while (openSet.length > 0) {
    // Sort by f = g + h (distance + heuristic)
    openSet.sort((a, b) => (a.distance + a.heuristic) - (b.distance + b.heuristic));
    const current = openSet.shift()!;
    
    closedSet.add(current);
    current.isVisited = true;
    visitedNodes.push(current);
    
    if (current === endNode) {
      return {
        visitedNodes,
        path: reconstructPath(endNode)
      };
    }
    
    const neighbors = getNeighbors(grid, current);
    for (const neighbor of neighbors) {
      if (closedSet.has(neighbor)) continue;
      
      const tentativeDistance = current.distance + 1;
      
      if (!openSet.includes(neighbor)) {
        openSet.push(neighbor);
      } else if (tentativeDistance >= neighbor.distance) {
        continue;
      }
      
      neighbor.parent = current;
      neighbor.distance = tentativeDistance;
      neighbor.heuristic = heuristic(neighbor, endNode);
    }
  }
  
  return { visitedNodes, path: [] };
};
