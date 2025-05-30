
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Plus } from 'lucide-react';

const QueueVisualizer = () => {
  const [queue, setQueue] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [algorithm, setAlgorithm] = useState('basic');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingType, setAnimatingType] = useState<'enqueue' | 'dequeue' | null>(null);

  const algorithms = {
    basic: { 
      name: 'Basic Queue Operations', 
      description: 'Enqueue and Dequeue operations. Used for task scheduling and breadth-first search.' 
    },
    bfs: { 
      name: 'BFS Simulation', 
      description: 'Breadth-First Search uses queue. Demonstrates level-by-level exploration.' 
    },
    scheduling: { 
      name: 'Task Scheduling', 
      description: 'Round-robin scheduling simulation. Shows how OS manages processes.' 
    },
    buffer: { 
      name: 'Buffer Management', 
      description: 'Producer-consumer pattern. Used in data streaming and I/O operations.' 
    }
  };

  const enqueue = (value: number) => {
    if (queue.length >= 8) return; // Limit for visualization
    
    setIsAnimating(true);
    setAnimatingType('enqueue');
    
    setTimeout(() => {
      setQueue(prev => [...prev, value]);
      setIsAnimating(false);
      setAnimatingType(null);
    }, 300);
  };

  const dequeue = () => {
    if (queue.length === 0) return null;
    
    setIsAnimating(true);
    setAnimatingType('dequeue');
    
    setTimeout(() => {
      setQueue(prev => prev.slice(1));
      setIsAnimating(false);
      setAnimatingType(null);
    }, 300);
    
    return queue[0];
  };

  const clear = () => {
    setQueue([]);
  };

  const handleEnqueue = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      enqueue(value);
      setInputValue('');
    }
  };

  const demonstrateBFS = () => {
    clear();
    const nodes = [1, 2, 3, 4, 5, 6, 7];
    let index = 0;
    
    const processNode = () => {
      if (index >= nodes.length) return;
      
      // Add nodes to queue (simulating adding neighbors)
      if (index < 3) {
        enqueue(nodes[index]);
        setTimeout(() => {
          if (index < 2) enqueue(nodes[index + 3]);
          if (index < 2) enqueue(nodes[index + 4]);
        }, 400);
      }
      
      // Process (dequeue) after a delay
      setTimeout(() => {
        if (queue.length > 0) dequeue();
      }, 800);
      
      index++;
      setTimeout(processNode, 1200);
    };
    
    setTimeout(processNode, 500);
  };

  const demonstrateScheduling = () => {
    clear();
    const processes = [1, 2, 3, 4, 5];
    let processIndex = 0;
    let cycles = 0;
    
    const scheduleCycle = () => {
      if (cycles >= 10) return;
      
      // Add new process
      if (processIndex < processes.length) {
        enqueue(processes[processIndex]);
        processIndex++;
      }
      
      // Execute current process (dequeue and possibly re-enqueue)
      setTimeout(() => {
        if (queue.length > 0) {
          const currentProcess = queue[0];
          dequeue();
          
          // Simulate process not completed - re-enqueue
          if (Math.random() > 0.4 && cycles < 8) {
            setTimeout(() => enqueue(currentProcess), 600);
          }
        }
      }, 400);
      
      cycles++;
      setTimeout(scheduleCycle, 1000);
    };
    
    setTimeout(scheduleCycle, 500);
  };

  const demonstrateBuffer = () => {
    clear();
    let producerCount = 0;
    let consumerCycle = 0;
    
    const producer = () => {
      if (producerCount >= 6) return;
      
      const item = Math.floor(Math.random() * 100) + 1;
      enqueue(item);
      producerCount++;
      
      setTimeout(producer, 800);
    };
    
    const consumer = () => {
      if (consumerCycle >= 8) return;
      
      if (queue.length > 0) {
        dequeue();
      }
      
      consumerCycle++;
      setTimeout(consumer, 1200);
    };
    
    // Start producer immediately, consumer after a delay
    setTimeout(producer, 200);
    setTimeout(consumer, 1000);
  };

  const runAlgorithm = () => {
    switch (algorithm) {
      case 'bfs':
        demonstrateBFS();
        break;
      case 'scheduling':
        demonstrateScheduling();
        break;
      case 'buffer':
        demonstrateBuffer();
        break;
      default:
        break;
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          <div className="space-y-2">
            <label className="text-sm font-medium">Value to Enqueue</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter number"
                onKeyPress={(e) => e.key === 'Enter' && handleEnqueue()}
              />
              <Button onClick={handleEnqueue} disabled={isAnimating}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          {algorithm !== 'basic' ? (
            <Button onClick={runAlgorithm} disabled={isAnimating}>
              <Play className="w-4 h-4 mr-2" />
              Demonstrate
            </Button>
          ) : (
            <>
              <Button onClick={dequeue} disabled={isAnimating || queue.length === 0}>
                Dequeue
              </Button>
              <Button onClick={clear} disabled={isAnimating}>
                Clear
              </Button>
            </>
          )}
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
              Queue Size: {queue.length} | Front → Rear
            </div>
            
            <div className="relative flex items-center">
              {/* Front pointer */}
              <div className="text-sm font-medium text-gray-600 mr-4">
                FRONT
              </div>
              
              {/* Queue elements */}
              <div className="flex items-center space-x-1 min-w-[300px]">
                {/* Dequeue animation slot */}
                {animatingType === 'dequeue' && (
                  <div className="w-12 h-12 flex items-center justify-center bg-red-500 text-white font-bold rounded animate-[fade-out_0.3s_ease-out]">
                    {queue[0]}
                  </div>
                )}
                
                {queue.map((value, index) => (
                  <div
                    key={index}
                    className={`w-12 h-12 flex items-center justify-center text-white font-bold rounded transition-all duration-300 ${
                      index === 0 && animatingType === 'dequeue'
                        ? 'bg-red-500'
                        : 'bg-blue-500'
                    }`}
                  >
                    {value}
                  </div>
                ))}
                
                {/* Enqueue animation slot */}
                {animatingType === 'enqueue' && (
                  <div className="w-12 h-12 flex items-center justify-center bg-green-500 text-white font-bold rounded animate-[fade-in_0.3s_ease-out]">
                    New
                  </div>
                )}
                
                {/* Empty slots */}
                {queue.length < 8 && !isAnimating && (
                  Array.from({ length: Math.min(3, 8 - queue.length) }, (_, i) => (
                    <div key={`empty-${i}`} className="w-12 h-12 border-2 border-dashed border-gray-300 rounded"></div>
                  ))
                )}
              </div>
              
              {/* Rear pointer */}
              <div className="text-sm font-medium text-gray-600 ml-4">
                REAR
              </div>
            </div>
            
            {/* Operation indicators */}
            <div className="flex space-x-8 text-sm">
              <div className="text-center">
                <div className="font-medium">Dequeue ←</div>
                <div className="text-gray-500">Remove from front</div>
              </div>
              <div className="text-center">
                <div className="font-medium">→ Enqueue</div>
                <div className="text-gray-500">Add to rear</div>
              </div>
            </div>
            
            {/* Current values display */}
            <div className="text-center">
              <div className="text-sm font-medium">
                Front: {queue.length > 0 ? queue[0] : 'None'} | 
                Rear: {queue.length > 0 ? queue[queue.length - 1] : 'None'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Queue Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><strong>Enqueue:</strong> Add element to rear - O(1)</div>
            <div><strong>Dequeue:</strong> Remove element from front - O(1)</div>
            <div><strong>Front:</strong> View front element - O(1)</div>
            <div><strong>IsEmpty:</strong> Check if queue is empty - O(1)</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Common Applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>• Process scheduling in OS</div>
            <div>• Breadth-First Search (BFS)</div>
            <div>• Print job management</div>
            <div>• Buffering in data streams</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default QueueVisualizer;
