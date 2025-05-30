
import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Pause, RotateCcw, Shuffle } from 'lucide-react';
import { bubbleSort, selectionSort, insertionSort, mergeSort, quickSort } from '@/algorithms/sortingAlgorithms';

const SortingVisualizer = () => {
  const [array, setArray] = useState<number[]>([]);
  const [arraySize, setArraySize] = useState([50]);
  const [speed, setSpeed] = useState([50]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [algorithm, setAlgorithm] = useState('bubble');
  const [comparing, setComparing] = useState<number[]>([]);
  const [swapping, setSwapping] = useState<number[]>([]);
  const [sorted, setSorted] = useState<number[]>([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [steps, setSteps] = useState<any[]>([]);

  const algorithms = {
    bubble: { name: 'Bubble Sort', fn: bubbleSort, description: 'Compares adjacent elements and swaps them if needed. Simple but inefficient for large datasets.' },
    selection: { name: 'Selection Sort', fn: selectionSort, description: 'Finds minimum element and places it at the beginning. Good for small datasets.' },
    insertion: { name: 'Insertion Sort', fn: insertionSort, description: 'Builds sorted array one element at a time. Efficient for small or nearly sorted arrays.' },
    merge: { name: 'Merge Sort', fn: mergeSort, description: 'Divide and conquer approach. Consistent O(n log n) performance, stable sort.' },
    quick: { name: 'Quick Sort', fn: quickSort, description: 'Partitions array around pivot. Average O(n log n), widely used in practice.' }
  };

  const generateRandomArray = useCallback(() => {
    const newArray = Array.from({ length: arraySize[0] }, () => 
      Math.floor(Math.random() * 400) + 10
    );
    setArray(newArray);
    setComparing([]);
    setSwapping([]);
    setSorted([]);
    setCurrentStep(0);
    setSteps([]);
    setIsPlaying(false);
  }, [arraySize]);

  useEffect(() => {
    generateRandomArray();
  }, [generateRandomArray]);

  const startVisualization = async () => {
    if (steps.length === 0) {
      const sortSteps = algorithms[algorithm as keyof typeof algorithms].fn([...array]);
      setSteps(sortSteps);
    }
    setIsPlaying(true);
  };

  const pauseVisualization = () => {
    setIsPlaying(false);
  };

  const resetVisualization = () => {
    setIsPlaying(false);
    setCurrentStep(0);
    setComparing([]);
    setSwapping([]);
    setSorted([]);
    generateRandomArray();
  };

  useEffect(() => {
    if (isPlaying && currentStep < steps.length) {
      const timer = setTimeout(() => {
        const step = steps[currentStep];
        if (step) {
          setArray([...step.array]);
          setComparing(step.comparing || []);
          setSwapping(step.swapping || []);
          setSorted(step.sorted || []);
          setCurrentStep(prev => prev + 1);
        }
      }, 101 - speed[0]);

      return () => clearTimeout(timer);
    } else if (currentStep >= steps.length && steps.length > 0) {
      setIsPlaying(false);
      setSorted(array.map((_, index) => index));
    }
  }, [isPlaying, currentStep, steps, speed, array]);

  const getBarColor = (index: number) => {
    if (sorted.includes(index)) return 'bg-green-500';
    if (swapping.includes(index)) return 'bg-red-500';
    if (comparing.includes(index)) return 'bg-yellow-500';
    return 'bg-blue-500';
  };

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

        <div className="space-y-2">
          <label className="text-sm font-medium">Array Size: {arraySize[0]}</label>
          <Slider
            value={arraySize}
            onValueChange={setArraySize}
            min={10}
            max={100}
            step={5}
            disabled={isPlaying}
          />
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
          <Button onClick={generateRandomArray} variant="outline" disabled={isPlaying}>
            <Shuffle className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{algorithms[algorithm as keyof typeof algorithms].name}</CardTitle>
          <CardDescription>{algorithms[algorithm as keyof typeof algorithms].description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-end justify-center space-x-1 h-96 bg-slate-50 rounded-lg p-4">
            {array.map((value, index) => (
              <div
                key={index}
                className={`${getBarColor(index)} transition-all duration-300 rounded-t-sm`}
                style={{
                  height: `${(value / 400) * 100}%`,
                  width: `${Math.max(800 / array.length - 2, 2)}px`,
                }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-blue-500 rounded"></div>
          <span>Unsorted</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-500 rounded"></div>
          <span>Comparing</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded"></div>
          <span>Swapping</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-500 rounded"></div>
          <span>Sorted</span>
        </div>
      </div>
    </div>
  );
};

export default SortingVisualizer;
