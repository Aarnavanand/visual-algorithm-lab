
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import SortingVisualizer from '@/components/SortingVisualizer';
import PathfindingVisualizer from '@/components/PathfindingVisualizer';
import TreeVisualizer from '@/components/TreeVisualizer';
import StackVisualizer from '@/components/StackVisualizer';
import QueueVisualizer from '@/components/QueueVisualizer';
import LinkedListVisualizer from '@/components/LinkedListVisualizer';
import GraphVisualizer from '@/components/GraphVisualizer';

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-4">
            Algorithm Visualizer
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Interactive learning tool to visualize and understand algorithms through beautiful animations
          </p>
        </div>

        <Tabs defaultValue="sorting" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-7 mb-8">
            <TabsTrigger value="sorting">Sorting</TabsTrigger>
            <TabsTrigger value="pathfinding">Pathfinding</TabsTrigger>
            <TabsTrigger value="trees">Trees</TabsTrigger>
            <TabsTrigger value="graphs">Graphs</TabsTrigger>
            <TabsTrigger value="stacks">Stacks</TabsTrigger>
            <TabsTrigger value="queues">Queues</TabsTrigger>
            <TabsTrigger value="linkedlists">Linked Lists</TabsTrigger>
          </TabsList>

          <TabsContent value="sorting">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-500 rounded"></div>
                  Sorting Algorithms
                </CardTitle>
                <CardDescription>
                  Visualize how different sorting algorithms organize data step by step
                </CardDescription>
              </CardHeader>
              <CardContent>
                <SortingVisualizer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pathfinding">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-500 rounded"></div>
                  Pathfinding Algorithms
                </CardTitle>
                <CardDescription>
                  Find the shortest path between two points using various algorithms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <PathfindingVisualizer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="trees">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-purple-500 rounded"></div>
                  Tree Traversal Algorithms
                </CardTitle>
                <CardDescription>
                  Explore different ways to traverse binary trees
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TreeVisualizer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="graphs">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded"></div>
                  Graph Algorithms
                </CardTitle>
                <CardDescription>
                  Visualize graph traversal and shortest path algorithms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <GraphVisualizer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stacks">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-orange-500 rounded"></div>
                  Stack Operations
                </CardTitle>
                <CardDescription>
                  Learn LIFO (Last In, First Out) operations with visual demonstrations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <StackVisualizer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="queues">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-teal-500 rounded"></div>
                  Queue Operations
                </CardTitle>
                <CardDescription>
                  Understand FIFO (First In, First Out) operations through animations
                </CardDescription>
              </CardHeader>
              <CardContent>
                <QueueVisualizer />
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="linkedlists">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-indigo-500 rounded"></div>
                  Linked List Operations
                </CardTitle>
                <CardDescription>
                  Visualize dynamic data structure operations and algorithms
                </CardDescription>
              </CardHeader>
              <CardContent>
                <LinkedListVisualizer />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
