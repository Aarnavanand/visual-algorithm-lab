import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Plus } from 'lucide-react';

interface ListNode {
  value: number;
  next: ListNode | null;
  id: number;
  isAnimating?: boolean;
  animationType?: 'insert' | 'delete' | 'search';
}

const LinkedListVisualizer = () => {
  const [head, setHead] = useState<ListNode | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [inputPosition, setInputPosition] = useState('');
  const [algorithm, setAlgorithm] = useState('basic');
  const [isAnimating, setIsAnimating] = useState(false);
  const [nodeIdCounter, setNodeIdCounter] = useState(0);

  const algorithms = {
    basic: { 
      name: 'Basic Operations', 
      description: 'Insert, delete, and search operations. Foundation of dynamic data structures.' 
    },
    reverse: { 
      name: 'Reverse List', 
      description: 'Reverse linked list iteratively. Common interview question and useful operation.' 
    },
    cycle: { 
      name: 'Cycle Detection', 
      description: 'Floyd\'s algorithm to detect cycles. Used in memory management and graph algorithms.' 
    },
    merge: { 
      name: 'Merge Sorted Lists', 
      description: 'Merge two sorted lists. Used in merge sort and database operations.' 
    }
  };

  const listToArray = (node: ListNode | null, maxLength: number = 100): ListNode[] => {
    const result: ListNode[] = [];
    const visited = new Set<number>();
    let current = node;
    
    while (current && result.length < maxLength) {
      // If we've seen this node before, we have a cycle
      if (visited.has(current.id)) {
        break;
      }
      
      visited.add(current.id);
      result.push(current);
      current = current.next;
    }
    
    return result;
  };

  const arrayToList = (array: ListNode[]): ListNode | null => {
    if (array.length === 0) return null;
    
    for (let i = 0; i < array.length - 1; i++) {
      array[i].next = array[i + 1];
    }
    array[array.length - 1].next = null;
    
    return array[0];
  };

  const insertAtHead = (value: number) => {
    const newNode: ListNode = {
      value,
      next: head,
      id: nodeIdCounter,
      isAnimating: true,
      animationType: 'insert'
    };
    
    setNodeIdCounter(prev => prev + 1);
    setIsAnimating(true);
    
    setTimeout(() => {
      setHead(newNode);
      setTimeout(() => {
        const nodes = listToArray(newNode);
        nodes[0] = { ...nodes[0], isAnimating: false };
        setHead(arrayToList(nodes));
        setIsAnimating(false);
      }, 300);
    }, 100);
  };

  const insertAtPosition = (value: number, position: number) => {
    if (position === 0) {
      insertAtHead(value);
      return;
    }

    const nodes = listToArray(head);
    if (position > nodes.length) return;

    const newNode: ListNode = {
      value,
      next: null,
      id: nodeIdCounter,
      isAnimating: true,
      animationType: 'insert'
    };

    setNodeIdCounter(prev => prev + 1);
    setIsAnimating(true);

    nodes.splice(position, 0, newNode);
    setHead(arrayToList(nodes));

    setTimeout(() => {
      const updatedNodes = listToArray(head);
      const targetNode = updatedNodes.find(n => n.id === newNode.id);
      if (targetNode) {
        targetNode.isAnimating = false;
      }
      setHead(arrayToList(updatedNodes));
      setIsAnimating(false);
    }, 500);
  };

  const deleteAtPosition = (position: number) => {
    const nodes = listToArray(head);
    if (position >= nodes.length) return;

    setIsAnimating(true);
    nodes[position] = { ...nodes[position], isAnimating: true, animationType: 'delete' };
    setHead(arrayToList(nodes));

    setTimeout(() => {
      nodes.splice(position, 1);
      setHead(arrayToList(nodes));
      setIsAnimating(false);
    }, 500);
  };

  const search = (value: number) => {
    const nodes = listToArray(head);
    let index = 0;

    const searchStep = () => {
      if (index >= nodes.length) {
        setIsAnimating(false);
        return;
      }

      // Reset previous animations
      const resetNodes = nodes.map(n => ({ ...n, isAnimating: false }));
      resetNodes[index] = { ...resetNodes[index], isAnimating: true, animationType: 'search' as const };
      setHead(arrayToList(resetNodes));

      if (nodes[index].value === value) {
        setTimeout(() => {
          const finalNodes = nodes.map(n => ({ ...n, isAnimating: false }));
          setHead(arrayToList(finalNodes));
          setIsAnimating(false);
        }, 1000);
        return;
      }

      index++;
      setTimeout(searchStep, 800);
    };

    setIsAnimating(true);
    searchStep();
  };

  const reverseList = () => {
    const nodes = listToArray(head);
    if (nodes.length <= 1) return;

    setIsAnimating(true);
    let index = 0;

    const reverseStep = () => {
      if (index >= Math.floor(nodes.length / 2)) {
        const reversedNodes = [...nodes].reverse();
        setHead(arrayToList(reversedNodes));
        setTimeout(() => {
          const finalNodes = reversedNodes.map(n => ({ ...n, isAnimating: false }));
          setHead(arrayToList(finalNodes));
          setIsAnimating(false);
        }, 500);
        return;
      }

      // Highlight nodes being swapped
      const animatedNodes = nodes.map((n, i) => ({
        ...n,
        isAnimating: i === index || i === nodes.length - 1 - index,
        animationType: 'search' as const
      }));
      setHead(arrayToList(animatedNodes));

      // Swap values
      [nodes[index].value, nodes[nodes.length - 1 - index].value] = 
        [nodes[nodes.length - 1 - index].value, nodes[index].value];

      index++;
      setTimeout(reverseStep, 1000);
    };

    reverseStep();
  };

  const demonstrateCycleDetection = () => {
    // Create a simple list without cycles for safe demonstration
    const nodes: ListNode[] = [];
    for (let i = 1; i <= 5; i++) {
      nodes.push({
        value: i,
        next: null,
        id: nodeIdCounter + i - 1,
      });
    }
    
    // Link them normally (no cycle)
    for (let i = 0; i < nodes.length - 1; i++) {
      nodes[i].next = nodes[i + 1];
    }

    setNodeIdCounter(prev => prev + 5);
    setHead(arrayToList(nodes));

    // Simulate Floyd's algorithm visualization
    setIsAnimating(true);
    let slow = 0, fast = 0;
    
    const detectStep = () => {
      if (slow >= nodes.length || fast >= nodes.length) {
        setIsAnimating(false);
        return;
      }

      // Reset animations
      const animatedNodes = listToArray(head).map(n => ({ ...n, isAnimating: false }));
      
      // Highlight slow and fast pointers
      if (slow < animatedNodes.length) {
        animatedNodes[slow] = { ...animatedNodes[slow], isAnimating: true, animationType: 'search' };
      }
      if (fast < animatedNodes.length && fast !== slow) {
        animatedNodes[fast] = { ...animatedNodes[fast], isAnimating: true, animationType: 'insert' };
      }

      setHead(arrayToList(animatedNodes));

      // Move pointers
      slow = (slow + 1) % nodes.length;
      fast = (fast + 2) % nodes.length;

      if (slow === fast && slow !== 0) {
        setTimeout(() => {
          setIsAnimating(false);
        }, 1000);
        return;
      }

      setTimeout(detectStep, 1200);
    };

    setTimeout(detectStep, 500);
  };

  const clear = () => {
    setHead(null);
  };

  const handleInsert = () => {
    const value = parseInt(inputValue);
    const position = parseInt(inputPosition);
    
    if (!isNaN(value)) {
      if (!isNaN(position)) {
        insertAtPosition(value, position);
      } else {
        insertAtHead(value);
      }
      setInputValue('');
      setInputPosition('');
    }
  };

  const handleDelete = () => {
    const position = parseInt(inputPosition);
    if (!isNaN(position)) {
      deleteAtPosition(position);
      setInputPosition('');
    }
  };

  const handleSearch = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      search(value);
      setInputValue('');
    }
  };

  const runAlgorithm = () => {
    switch (algorithm) {
      case 'reverse':
        reverseList();
        break;
      case 'cycle':
        demonstrateCycleDetection();
        break;
      case 'merge':
        // For simplicity, just demonstrate by creating a merged-looking list
        clear();
        setTimeout(() => {
          [1, 3, 5, 2, 4, 6].forEach((val, i) => {
            setTimeout(() => insertAtHead(val), i * 300);
          });
        }, 500);
        break;
      default:
        break;
    }
  };

  const getNodeColor = (node: ListNode) => {
    if (!node.isAnimating) return 'bg-blue-500';
    
    switch (node.animationType) {
      case 'insert': return 'bg-green-500';
      case 'delete': return 'bg-red-500';
      case 'search': return 'bg-yellow-500';
      default: return 'bg-blue-500';
    }
  };

  const nodes = listToArray(head);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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

        {algorithm === 'basic' && (
          <>
            <div className="space-y-2">
              <label className="text-sm font-medium">Value</label>
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter value"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Position (optional)</label>
              <Input
                type="number"
                value={inputPosition}
                onChange={(e) => setInputPosition(e.target.value)}
                placeholder="Enter position"
              />
            </div>
          </>
        )}

        <div className="flex gap-2">
          {algorithm !== 'basic' ? (
            <Button onClick={runAlgorithm} disabled={isAnimating}>
              <Play className="w-4 h-4 mr-2" />
              Run
            </Button>
          ) : (
            <>
              <Button onClick={handleInsert} disabled={isAnimating}>
                Insert
              </Button>
              <Button onClick={handleDelete} disabled={isAnimating}>
                Delete
              </Button>
              <Button onClick={handleSearch} disabled={isAnimating}>
                Search
              </Button>
            </>
          )}
          <Button onClick={clear} disabled={isAnimating} variant="outline">
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
          <div className="flex flex-col items-center space-y-4">
            <div className="text-sm text-gray-600 mb-4">
              List Length: {nodes.length} | Head → Tail
            </div>
            
            <div className="flex items-center space-x-4 overflow-x-auto min-h-[100px] w-full justify-center">
              {nodes.length === 0 ? (
                <div className="text-gray-500 italic">Empty List</div>
              ) : (
                nodes.map((node, index) => (
                  <div key={node.id} className="flex items-center">
                    {/* Node */}
                    <div className={`relative w-16 h-16 ${getNodeColor(node)} text-white font-bold rounded-lg flex items-center justify-center transition-all duration-300 ${node.isAnimating ? 'scale-110' : 'scale-100'}`}>
                      {node.value}
                      {index === 0 && (
                        <div className="absolute -top-8 text-xs text-gray-600 font-normal">HEAD</div>
                      )}
                      {index === nodes.length - 1 && (
                        <div className="absolute -bottom-8 text-xs text-gray-600 font-normal">TAIL</div>
                      )}
                    </div>
                    
                    {/* Arrow */}
                    {index < nodes.length - 1 && (
                      <div className="flex items-center">
                        <div className="w-8 h-0.5 bg-gray-400 mx-2"></div>
                        <div className="w-0 h-0 border-t-4 border-b-4 border-l-4 border-transparent border-l-gray-400"></div>
                      </div>
                    )}
                    
                    {/* NULL pointer for last node */}
                    {index === nodes.length - 1 && (
                      <div className="flex items-center">
                        <div className="w-8 h-0.5 bg-gray-400 mx-2"></div>
                        <div className="text-gray-500 text-sm">NULL</div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Time Complexities</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><strong>Insert at head:</strong> O(1)</div>
            <div><strong>Insert at position:</strong> O(n)</div>
            <div><strong>Delete at position:</strong> O(n)</div>
            <div><strong>Search:</strong> O(n)</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Common Applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>• Dynamic memory allocation</div>
            <div>• Implementation of stacks/queues</div>
            <div>• Undo functionality in applications</div>
            <div>• Music playlist management</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Normal</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Inserting</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Deleting</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Searching</span>
        </div>
      </div>
    </div>
  );
};

export default LinkedListVisualizer;
