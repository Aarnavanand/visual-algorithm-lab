import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Shuffle } from 'lucide-react';

interface GraphNode {
  id: number;
  x: number;
  y: number;
  visited: boolean;
  current: boolean;
  processing: boolean;
  distance: number;
  label: string;
}

interface GraphEdge {
  from: number;
  to: number;
  weight: number;
  highlighted: boolean;
  active: boolean;
}

const GraphVisualizer = () => {
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [speed, setSpeed] = useState([50]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [algorithm, setAlgorithm] = useState('dfs');
  const [startNode, setStartNode] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<any[]>([]);
  const [visitedPath, setVisitedPath] = useState<number[]>([]);

  const algorithms = {
    dfs: { name: 'Depth-First Search', description: 'Explores as far as possible before backtracking. Uses stack (recursion).' },
    bfs: { name: 'Breadth-First Search', description: 'Explores neighbors level by level. Uses queue for traversal.' },
    dijkstra: { name: "Dijkstra's Algorithm", description: 'Finds shortest paths from source to all vertices in weighted graphs.' },
    kruskal: { name: "Kruskal's MST", description: 'Finds Minimum Spanning Tree by sorting edges and avoiding cycles.' }
  };

  const generateRandomGraph = () => {
    const nodeCount = 8;
    const newNodes: GraphNode[] = [];
    const newEdges: GraphEdge[] = [];

    // Create nodes in a circle for better visualization
    for (let i = 0; i < nodeCount; i++) {
      const angle = (i * 2 * Math.PI) / nodeCount;
      const radius = 120;
      newNodes.push({
        id: i,
        x: 200 + radius * Math.cos(angle),
        y: 200 + radius * Math.sin(angle),
        visited: false,
        current: false,
        processing: false,
        distance: i === startNode ? 0 : Infinity,
        label: String.fromCharCode(65 + i) // A, B, C, etc.
      });
    }

    // Create random edges
    for (let i = 0; i < nodeCount; i++) {
      for (let j = i + 1; j < nodeCount; j++) {
        if (Math.random() < 0.4) { // 40% chance for each edge
          const weight = Math.floor(Math.random() * 10) + 1;
          newEdges.push({
            from: i,
            to: j,
            weight,
            highlighted: false,
            active: false
          });
        }
      }
    }

    // Ensure graph is connected by adding edges if needed
    for (let i = 0; i < nodeCount - 1; i++) {
      const hasConnection = newEdges.some(edge => 
        (edge.from === i && edge.to === i + 1) || 
        (edge.from === i + 1 && edge.to === i)
      );
      if (!hasConnection) {
        newEdges.push({
          from: i,
          to: i + 1,
          weight: Math.floor(Math.random() * 10) + 1,
          highlighted: false,
          active: false
        });
      }
    }

    setNodes(newNodes);
    setEdges(newEdges);
    setCurrentStep(0);
    setSteps([]);
    setVisitedPath([]);
    setIsPlaying(false);
  };

  useEffect(() => {
    generateRandomGraph();
  }, []);

  const getNeighbors = (nodeId: number): number[] => {
    return edges
      .filter(edge => edge.from === nodeId || edge.to === nodeId)
      .map(edge => edge.from === nodeId ? edge.to : edge.from);
  };

  const dfsTraversal = (startId: number) => {
    const visitedSet = new Set<number>();
    const steps: any[] = [];
    const stack = [startId];

    while (stack.length > 0) {
      const currentId = stack.pop()!;
      
      if (visitedSet.has(currentId)) continue;
      
      steps.push({
        type: 'visit',
        current: currentId,
        visited: Array.from(visitedSet),
        stack: [...stack],
        action: 'Processing node'
      });
      
      visitedSet.add(currentId);
      
      steps.push({
        type: 'mark_visited',
        current: currentId,
        visited: Array.from(visitedSet),
        stack: [...stack],
        action: 'Marked as visited'
      });

      const neighbors = getNeighbors(currentId).filter(n => !visitedSet.has(n));
      neighbors.reverse().forEach(neighbor => {
        steps.push({
          type: 'explore_edge',
          from: currentId,
          to: neighbor,
          action: `Exploring edge to ${String.fromCharCode(65 + neighbor)}`
        });
        stack.push(neighbor);
      });
    }

    return steps;
  };

  const bfsTraversal = (startId: number) => {
    const visitedSet = new Set<number>();
    const steps: any[] = [];
    const queue = [startId];
    visitedSet.add(startId);

    while (queue.length > 0) {
      const currentId = queue.shift()!;
      
      steps.push({
        type: 'visit',
        current: currentId,
        visited: Array.from(visitedSet),
        queue: [...queue],
        action: 'Processing node'
      });

      const neighbors = getNeighbors(currentId).filter(n => !visitedSet.has(n));
      neighbors.forEach(neighbor => {
        steps.push({
          type: 'explore_edge',
          from: currentId,
          to: neighbor,
          action: `Adding ${String.fromCharCode(65 + neighbor)} to queue`
        });
        visitedSet.add(neighbor);
        queue.push(neighbor);
      });
    }

    return steps;
  };

  const dijkstraAlgorithm = (startId: number) => {
    const distances = new Map<number, number>();
    const visited = new Set<number>();
    const steps: any[] = [];

    // Initialize distances
    nodes.forEach(node => {
      distances.set(node.id, node.id === startId ? 0 : Infinity);
    });

    while (visited.size < nodes.length) {
      // Find unvisited node with minimum distance
      let minDistance = Infinity;
      let currentId = -1;
      
      for (const [nodeId, distance] of distances) {
        if (!visited.has(nodeId) && distance < minDistance) {
          minDistance = distance;
          currentId = nodeId;
        }
      }

      if (currentId === -1 || minDistance === Infinity) break;

      visited.add(currentId);
      steps.push({
        type: 'visit',
        current: currentId,
        visited: Array.from(visited),
        distances: new Map(distances),
        action: `Processing node with distance ${minDistance}`
      });

      // Update distances to neighbors
      const neighbors = getNeighbors(currentId);
      neighbors.forEach(neighborId => {
        if (!visited.has(neighborId)) {
          const edge = edges.find(e => 
            (e.from === currentId && e.to === neighborId) || 
            (e.from === neighborId && e.to === currentId)
          );
          
          if (edge) {
            const newDistance = distances.get(currentId)! + edge.weight;
            if (newDistance < distances.get(neighborId)!) {
              steps.push({
                type: 'update_distance',
                from: currentId,
                to: neighborId,
                oldDistance: distances.get(neighborId),
                newDistance,
                action: `Updated distance to ${String.fromCharCode(65 + neighborId)}`
              });
              distances.set(neighborId, newDistance);
            }
          }
        }
      });
    }

    return steps;
  };

  const kruskalMST = () => {
    const sortedEdges = [...edges].sort((a, b) => a.weight - b.weight);
    const parent = new Map<number, number>();
    const rank = new Map<number, number>();
    const mstEdges: GraphEdge[] = [];
    const steps: any[] = [];

    // Initialize Union-Find
    nodes.forEach(node => {
      parent.set(node.id, node.id);
      rank.set(node.id, 0);
    });

    const find = (x: number): number => {
      if (parent.get(x) !== x) {
        parent.set(x, find(parent.get(x)!));
      }
      return parent.get(x)!;
    };

    const union = (x: number, y: number): boolean => {
      const rootX = find(x);
      const rootY = find(y);

      if (rootX === rootY) return false;

      if (rank.get(rootX)! < rank.get(rootY)!) {
        parent.set(rootX, rootY);
      } else if (rank.get(rootX)! > rank.get(rootY)!) {
        parent.set(rootY, rootX);
      } else {
        parent.set(rootY, rootX);
        rank.set(rootX, rank.get(rootX)! + 1);
      }
      return true;
    };

    sortedEdges.forEach(edge => {
      steps.push({
        type: 'consider',
        considering: edge,
        mstEdges: [...mstEdges],
        action: `Considering edge ${String.fromCharCode(65 + edge.from)}-${String.fromCharCode(65 + edge.to)} (weight: ${edge.weight})`
      });

      if (union(edge.from, edge.to)) {
        mstEdges.push(edge);
        steps.push({
          type: 'accept',
          accepted: edge,
          mstEdges: [...mstEdges],
          action: `Added to MST - no cycle created`
        });
      } else {
        steps.push({
          type: 'reject',
          rejected: edge,
          mstEdges: [...mstEdges],
          action: `Rejected - would create cycle`
        });
      }
    });

    return steps;
  };

  const startVisualization = () => {
    let algorithmSteps: any[] = [];
    
    switch (algorithm) {
      case 'dfs':
        algorithmSteps = dfsTraversal(startNode);
        break;
      case 'bfs':
        algorithmSteps = bfsTraversal(startNode);
        break;
      case 'dijkstra':
        algorithmSteps = dijkstraAlgorithm(startNode);
        break;
      case 'kruskal':
        algorithmSteps = kruskalMST();
        break;
    }

    setSteps(algorithmSteps);
    setCurrentStep(0);
    setVisitedPath([]);
    setIsPlaying(true);
  };

  const resetVisualization = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setSteps([]);
    setVisitedPath([]);
    
    setNodes(nodes.map(node => ({
      ...node,
      visited: false,
      current: false,
      processing: false,
      distance: node.id === startNode ? 0 : Infinity
    })));
    
    setEdges(edges.map(edge => ({
      ...edge,
      highlighted: false,
      active: false
    })));
  };

  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      const timer = setTimeout(() => {
        const step = steps[currentStep];
        
        if (algorithm === 'kruskal') {
          setEdges(edges.map(edge => {
            const isMST = step.mstEdges?.some((mstEdge: GraphEdge) => 
              (mstEdge.from === edge.from && mstEdge.to === edge.to) ||
              (mstEdge.from === edge.to && mstEdge.to === edge.from)
            );
            const isConsidering = step.considering && 
              ((step.considering.from === edge.from && step.considering.to === edge.to) ||
               (step.considering.from === edge.to && step.considering.to === edge.from));
            
            return {
              ...edge,
              highlighted: isMST || false,
              active: isConsidering || false
            };
          }));
        } else {
          // Update nodes for traversal algorithms
          setNodes(nodes.map(node => ({
            ...node,
            visited: step.visited?.includes(node.id) || false,
            current: step.current === node.id,
            processing: step.type === 'visit' && step.current === node.id,
            distance: step.distances?.get(node.id) ?? (node.id === startNode ? 0 : Infinity)
          })));

          // Update edges for traversal visualization
          setEdges(edges.map(edge => ({
            ...edge,
            active: (step.type === 'explore_edge' && 
              ((step.from === edge.from && step.to === edge.to) ||
               (step.from === edge.to && step.to === edge.from)))
          })));

          // Track visited path
          if (step.type === 'visit' || step.type === 'mark_visited') {
            setVisitedPath(prev => {
              if (!prev.includes(step.current)) {
                return [...prev, step.current];
              }
              return prev;
            });
          }
        }
        
        setCurrentStep(prev => prev + 1);
      }, 101 - speed[0]);

      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length && steps.length > 0) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentStep, steps, speed, nodes, edges, algorithm, startNode]);

  const getNodeColor = (node: GraphNode) => {
    if (node.processing) return '#f59e0b'; // amber-500
    if (node.current) return '#ef4444'; // red-500
    if (node.visited) return '#22c55e'; // green-500
    return '#3b82f6'; // blue-500
  };

  const getEdgeColor = (edge: GraphEdge) => {
    if (edge.active) return '#f59e0b'; // amber-500
    if (edge.highlighted) return '#22c55e'; // green-500
    return '#6b7280'; // gray-500
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
          <label className="text-sm font-medium">Start Node</label>
          <Select value={startNode.toString()} onValueChange={(value) => setStartNode(parseInt(value))}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {nodes.map(node => (
                <SelectItem key={node.id} value={node.id.toString()}>
                  Node {node.label}
                </SelectItem>
              ))}
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
          {!isPlaying ? (
            <Button onClick={startVisualization} className="flex-1">
              <Play className="w-4 h-4 mr-2" />
              Start
            </Button>
          ) : (
            <Button onClick={() => setIsPlaying(false)} className="flex-1">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          <Button onClick={resetVisualization} variant="outline">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div>
          <Button onClick={generateRandomGraph} variant="outline" disabled={isPlaying}>
            <Shuffle className="w-4 h-4 mr-2" />
            New Graph
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{algorithms[algorithm as keyof typeof algorithms].name}</CardTitle>
          <CardDescription>{algorithms[algorithm as keyof typeof algorithms].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 rounded-lg p-4 h-96">
            <svg width="100%" height="100%" viewBox="0 0 400 400">
              {/* Render edges */}
              {edges.map((edge, index) => {
                const fromNode = nodes.find(n => n.id === edge.from);
                const toNode = nodes.find(n => n.id === edge.to);
                if (!fromNode || !toNode) return null;

                return (
                  <g key={index}>
                    <line
                      x1={fromNode.x}
                      y1={fromNode.y}
                      x2={toNode.x}
                      y2={toNode.y}
                      stroke={getEdgeColor(edge)}
                      strokeWidth={edge.highlighted || edge.active ? "4" : "2"}
                      className="transition-all duration-300"
                      strokeDasharray={edge.active ? "5,5" : "none"}
                    />
                    {/* Animated arrow for active edges */}
                    {edge.active && (
                      <circle
                        r="3"
                        fill="#f59e0b"
                        className="animate-pulse"
                      >
                        <animateMotion
                          dur="2s"
                          repeatCount="indefinite"
                          path={`M${fromNode.x},${fromNode.y} L${toNode.x},${toNode.y}`}
                        />
                      </circle>
                    )}
                    {/* Edge weight */}
                    <text
                      x={(fromNode.x + toNode.x) / 2}
                      y={(fromNode.y + toNode.y) / 2 - 5}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#374151"
                      className="font-medium"
                    >
                      {edge.weight}
                    </text>
                  </g>
                );
              })}

              {/* Render nodes */}
              {nodes.map(node => (
                <g key={node.id}>
                  <circle
                    cx={node.x}
                    cy={node.y}
                    r={node.processing ? "25" : "20"}
                    fill={getNodeColor(node)}
                    className={`transition-all duration-300 ${node.processing ? 'animate-pulse' : ''}`}
                    stroke={node.processing ? '#fbbf24' : 'transparent'}
                    strokeWidth={node.processing ? '3' : '0'}
                  />
                  <text
                    x={node.x}
                    y={node.y + 5}
                    textAnchor="middle"
                    fill="white"
                    fontSize="14"
                    fontWeight="bold"
                  >
                    {node.label}
                  </text>
                  {algorithm === 'dijkstra' && node.distance !== Infinity && (
                    <text
                      x={node.x}
                      y={node.y - 30}
                      textAnchor="middle"
                      fontSize="12"
                      fill="#374151"
                      className="font-medium"
                    >
                      d:{node.distance}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>

          {/* Current step information */}
          {steps.length > 0 && currentStep > 0 && currentStep <= steps.length && (
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <h3 className="font-medium mb-2">Current Step:</h3>
              <p className="text-sm text-gray-700">
                {steps[currentStep - 1]?.action || 'Processing...'}
              </p>
            </div>
          )}

          {/* Visited path display */}
          {visitedPath.length > 0 && algorithm !== 'kruskal' && (
            <div className="mt-4 p-4 bg-slate-100 rounded-lg">
              <h3 className="font-medium mb-2">Traversal Path:</h3>
              <div className="flex flex-wrap gap-2">
                {visitedPath.map((nodeId, index) => (
                  <span
                    key={index}
                    className="px-2 py-1 rounded text-sm bg-green-500 text-white"
                  >
                    {String.fromCharCode(65 + nodeId)}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded-full"></div>
          <span>Unvisited</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full"></div>
          <span>Current</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-amber-500 rounded-full animate-pulse"></div>
          <span>Processing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span>Visited/MST</span>
        </div>
      </div>
    </div>
  );
};

export default GraphVisualizer;
