import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Shuffle } from 'lucide-react';

interface TreeNode {
  value: number;
  left: TreeNode | null;
  right: TreeNode | null;
  x?: number;
  y?: number;
  visited?: boolean;
  current?: boolean;
  processing?: boolean;
}

const TreeVisualizer = () => {
  const [tree, setTree] = useState<TreeNode | null>(null);
  const [speed, setSpeed] = useState([50]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [algorithm, setAlgorithm] = useState('inorder');
  const [traversalOrder, setTraversalOrder] = useState<number[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [highlightedEdges, setHighlightedEdges] = useState<Set<string>>(new Set());
  const [treeDimensions, setTreeDimensions] = useState({ width: 800, height: 400 });

  const algorithms = {
    inorder: { name: 'Inorder Traversal', description: 'Left → Root → Right. Used for BST to get sorted order.' },
    preorder: { name: 'Preorder Traversal', description: 'Root → Left → Right. Used to copy/serialize trees.' },
    postorder: { name: 'Postorder Traversal', description: 'Left → Right → Root. Used to delete trees safely.' },
    levelorder: { name: 'Level Order Traversal', description: 'Level by level using BFS. Used for tree serialization.' }
  };

  const createRandomTree = (): TreeNode => {
    const values = Array.from({ length: 15 }, () => Math.floor(Math.random() * 100) + 1);
    let root: TreeNode | null = null;

    const insertNode = (root: TreeNode | null, value: number): TreeNode => {
      if (!root) {
        return { value, left: null, right: null };
      }
      
      if (value < root.value) {
        root.left = insertNode(root.left, value);
      } else {
        root.right = insertNode(root.right, value);
      }
      
      return root;
    };

    values.forEach(value => {
      root = insertNode(root, value);
    });

    return root!;
  };

  const getTreeDimensions = (node: TreeNode | null): { minX: number; maxX: number; maxY: number } => {
    if (!node) return { minX: 0, maxX: 0, maxY: 0 };
    
    let minX = node.x || 0;
    let maxX = node.x || 0;
    let maxY = node.y || 0;
    
    if (node.left) {
      const leftDims = getTreeDimensions(node.left);
      minX = Math.min(minX, leftDims.minX);
      maxX = Math.max(maxX, leftDims.maxX);
      maxY = Math.max(maxY, leftDims.maxY);
    }
    
    if (node.right) {
      const rightDims = getTreeDimensions(node.right);
      minX = Math.min(minX, rightDims.minX);
      maxX = Math.max(maxX, rightDims.maxX);
      maxY = Math.max(maxY, rightDims.maxY);
    }
    
    return { minX, maxX, maxY };
  };

  const calculatePositions = (node: TreeNode | null, x: number, y: number, spacing: number): void => {
    if (!node) return;
    
    node.x = x;
    node.y = y;
    
    if (node.left) {
      calculatePositions(node.left, x - spacing, y + 80, spacing * 0.7);
    }
    if (node.right) {
      calculatePositions(node.right, x + spacing, y + 80, spacing * 0.7);
    }
  };

  const generateTree = () => {
    const newTree = createRandomTree();
    calculatePositions(newTree, 400, 50, 150);
    
    // Calculate dynamic dimensions
    const dims = getTreeDimensions(newTree);
    const padding = 100;
    const width = Math.max(800, dims.maxX - dims.minX + padding * 2);
    const height = Math.max(400, dims.maxY + padding);
    
    setTreeDimensions({ width, height });
    setTree(newTree);
    setTraversalOrder([]);
    setCurrentIndex(0);
    setIsPlaying(false);
    setHighlightedEdges(new Set());
  };

  useEffect(() => {
    generateTree();
  }, []);

  const inorderTraversalSteps = (node: TreeNode | null, result: any[] = [], path: string = ''): any[] => {
    if (!node) return result;
    
    // Visit left
    if (node.left) {
      result.push({ type: 'move', from: node.value, to: node.left.value, direction: 'left' });
      inorderTraversalSteps(node.left, result, path + 'L');
      result.push({ type: 'return', from: node.left.value, to: node.value, direction: 'up' });
    }
    
    // Process current
    result.push({ type: 'process', value: node.value, path });
    
    // Visit right
    if (node.right) {
      result.push({ type: 'move', from: node.value, to: node.right.value, direction: 'right' });
      inorderTraversalSteps(node.right, result, path + 'R');
      result.push({ type: 'return', from: node.right.value, to: node.value, direction: 'up' });
    }
    
    return result;
  };

  const preorderTraversalSteps = (node: TreeNode | null, result: any[] = [], path: string = ''): any[] => {
    if (!node) return result;
    
    // Process current first
    result.push({ type: 'process', value: node.value, path });
    
    // Visit left
    if (node.left) {
      result.push({ type: 'move', from: node.value, to: node.left.value, direction: 'left' });
      preorderTraversalSteps(node.left, result, path + 'L');
      result.push({ type: 'return', from: node.left.value, to: node.value, direction: 'up' });
    }
    
    // Visit right
    if (node.right) {
      result.push({ type: 'move', from: node.value, to: node.right.value, direction: 'right' });
      preorderTraversalSteps(node.right, result, path + 'R');
      result.push({ type: 'return', from: node.right.value, to: node.value, direction: 'up' });
    }
    
    return result;
  };

  const postorderTraversalSteps = (node: TreeNode | null, result: any[] = [], path: string = ''): any[] => {
    if (!node) return result;
    
    // Visit left
    if (node.left) {
      result.push({ type: 'move', from: node.value, to: node.left.value, direction: 'left' });
      postorderTraversalSteps(node.left, result, path + 'L');
      result.push({ type: 'return', from: node.left.value, to: node.value, direction: 'up' });
    }
    
    // Visit right
    if (node.right) {
      result.push({ type: 'move', from: node.value, to: node.right.value, direction: 'right' });
      postorderTraversalSteps(node.right, result, path + 'R');
      result.push({ type: 'return', from: node.right.value, to: node.value, direction: 'up' });
    }
    
    // Process current last
    result.push({ type: 'process', value: node.value, path });
    
    return result;
  };

  const levelorderTraversalSteps = (root: TreeNode | null): any[] => {
    if (!root) return [];
    const result: any[] = [];
    const queue: { node: TreeNode; level: number }[] = [{ node: root, level: 0 }];
    
    while (queue.length > 0) {
      const { node, level } = queue.shift()!;
      result.push({ type: 'process', value: node.value, level });
      
      if (node.left) {
        result.push({ type: 'move', from: node.value, to: node.left.value, direction: 'left' });
        queue.push({ node: node.left, level: level + 1 });
      }
      if (node.right) {
        result.push({ type: 'move', from: node.value, to: node.right.value, direction: 'right' });
        queue.push({ node: node.right, level: level + 1 });
      }
    }
    
    return result;
  };

  const [traversalSteps, setTraversalSteps] = useState<any[]>([]);

  const startVisualization = () => {
    if (!tree) return;
    
    let steps: any[] = [];
    
    switch (algorithm) {
      case 'inorder':
        steps = inorderTraversalSteps(tree);
        break;
      case 'preorder':
        steps = preorderTraversalSteps(tree);
        break;
      case 'postorder':
        steps = postorderTraversalSteps(tree);
        break;
      case 'levelorder':
        steps = levelorderTraversalSteps(tree);
        break;
    }
    
    setTraversalSteps(steps);
    setTraversalOrder(steps.filter(step => step.type === 'process').map(step => step.value));
    setCurrentIndex(0);
    setIsPlaying(true);
    setHighlightedEdges(new Set());
    
    // Reset all node states
    const resetNodes = (node: TreeNode | null) => {
      if (!node) return;
      node.visited = false;
      node.current = false;
      node.processing = false;
      resetNodes(node.left);
      resetNodes(node.right);
    };
    resetNodes(tree);
  };

  const pauseVisualization = () => {
    setIsPlaying(false);
  };

  const resetVisualization = () => {
    setIsPlaying(false);
    setCurrentIndex(0);
    setTraversalOrder([]);
    setTraversalSteps([]);
    setHighlightedEdges(new Set());
    
    const resetNodes = (node: TreeNode | null) => {
      if (!node) return;
      node.visited = false;
      node.current = false;
      node.processing = false;
      resetNodes(node.left);
      resetNodes(node.right);
    };
    if (tree) resetNodes(tree);
    setTree({ ...tree! });
  };

  useEffect(() => {
    if (isPlaying && currentIndex < traversalSteps.length) {
      const timer = setTimeout(() => {
        const currentStep = traversalSteps[currentIndex];
        
        // Update tree to show current step
        const updateNodes = (node: TreeNode | null): TreeNode | null => {
          if (!node) return null;
          
          const newNode = { ...node };
          
          if (currentStep.type === 'process' && node.value === currentStep.value) {
            newNode.current = true;
            newNode.processing = true;
            newNode.visited = true;
          } else if (currentStep.type === 'move' && node.value === currentStep.to) {
            newNode.current = true;
            newNode.processing = false;
          } else if (traversalOrder.slice(0, Math.floor(currentIndex / 2)).includes(node.value)) {
            newNode.visited = true;
            newNode.current = false;
            newNode.processing = false;
          } else {
            newNode.current = false;
            newNode.processing = false;
          }
          
          newNode.left = updateNodes(node.left);
          newNode.right = updateNodes(node.right);
          return newNode;
        };
        
        // Update highlighted edges
        if (currentStep.type === 'move') {
          const edgeKey = `${currentStep.from}-${currentStep.to}`;
          setHighlightedEdges(prev => new Set([...prev, edgeKey]));
        }
        
        setTree(updateNodes(tree));
        setCurrentIndex(prev => prev + 1);
      }, 101 - speed[0]);

      return () => clearTimeout(timer);
    } else if (currentIndex >= traversalSteps.length && traversalSteps.length > 0) {
      setIsPlaying(false);
    }
  }, [isPlaying, currentIndex, traversalSteps, speed, tree, traversalOrder]);

  const renderTree = (node: TreeNode | null): JSX.Element | null => {
    if (!node || !node.x || !node.y) return null;
    
    const nodeColor = node.processing ? 'bg-yellow-500' : 
                     node.current ? 'bg-red-500' : 
                     node.visited ? 'bg-green-500' : 'bg-blue-500';
    
    return (
      <g key={node.value}>
        {/* Render connections to children with highlighting */}
        {node.left && (
          <line
            x1={node.x}
            y1={node.y + 20}
            x2={node.left.x}
            y2={node.left.y - 20}
            stroke={highlightedEdges.has(`${node.value}-${node.left.value}`) ? '#ef4444' : '#374151'}
            strokeWidth={highlightedEdges.has(`${node.value}-${node.left.value}`) ? '4' : '2'}
            className="transition-all duration-300"
          />
        )}
        {node.right && (
          <line
            x1={node.x}
            y1={node.y + 20}
            x2={node.right.x}
            y2={node.right.y - 20}
            stroke={highlightedEdges.has(`${node.value}-${node.right.value}`) ? '#ef4444' : '#374151'}
            strokeWidth={highlightedEdges.has(`${node.value}-${node.right.value}`) ? '4' : '2'}
            className="transition-all duration-300"
          />
        )}
        
        {/* Render node with enhanced styling */}
        <circle
          cx={node.x}
          cy={node.y}
          r={node.processing ? "25" : "20"}
          className={`${nodeColor} transition-all duration-300 ${node.processing ? 'animate-pulse' : ''}`}
          fill="currentColor"
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
          {node.value}
        </text>
        
        {/* Render children */}
        {renderTree(node.left)}
        {renderTree(node.right)}
      </g>
    );
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Traversal Algorithm</label>
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
            <Button onClick={pauseVisualization} className="flex-1">
              <Pause className="w-4 h-4 mr-2" />
              Pause
            </Button>
          )}
          <Button onClick={resetVisualization} variant="outline">
            <RotateCcw className="w-4 h-4" />
          </Button>
        </div>

        <div className="flex gap-2">
          <Button onClick={generateTree} variant="outline" disabled={isPlaying}>
            <Shuffle className="w-4 h-4 mr-2" />
            New Tree
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{algorithms[algorithm as keyof typeof algorithms].name}</CardTitle>
          <CardDescription>{algorithms[algorithm as keyof typeof algorithms].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="bg-slate-50 rounded-lg p-4 overflow-auto border">
            <svg 
              width="100%" 
              height={Math.min(treeDimensions.height, 600)}
              viewBox={`0 0 ${treeDimensions.width} ${treeDimensions.height}`}
              className="min-w-full"
              style={{ minWidth: `${treeDimensions.width}px` }}
            >
              {tree && renderTree(tree)}
            </svg>
          </div>
          
          {traversalOrder.length > 0 && (
            <div className="mt-4 p-4 bg-slate-100 rounded-lg">
              <h3 className="font-medium mb-2">Traversal Order:</h3>
              <div className="flex flex-wrap gap-2">
                {traversalOrder.map((value, index) => (
                  <span
                    key={index}
                    className={`px-2 py-1 rounded text-sm transition-all duration-300 ${
                      index < Math.floor(currentIndex / 2)
                        ? 'bg-green-500 text-white'
                        : index === Math.floor(currentIndex / 2) && isPlaying
                        ? 'bg-yellow-500 text-white animate-pulse'
                        : 'bg-gray-200'
                    }`}
                  >
                    {value}
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
          <span>Current Position</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded-full animate-pulse"></div>
          <span>Processing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded-full"></div>
          <span>Visited</span>
        </div>
      </div>
    </div>
  );
};

export default TreeVisualizer;
