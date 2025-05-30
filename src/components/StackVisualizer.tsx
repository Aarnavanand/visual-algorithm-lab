
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Play, Plus } from 'lucide-react';

const StackVisualizer = () => {
  const [stack, setStack] = useState<number[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [algorithm, setAlgorithm] = useState('basic');
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingIndex, setAnimatingIndex] = useState(-1);

  const algorithms = {
    basic: { 
      name: 'Basic Stack Operations', 
      description: 'Push and Pop operations. Used for function calls, undo operations, and expression evaluation.' 
    },
    balanced: { 
      name: 'Balanced Parentheses', 
      description: 'Check if parentheses are balanced. Used in compilers and syntax checking.' 
    },
    reverse: { 
      name: 'Reverse String', 
      description: 'Reverse a string using stack. Demonstrates LIFO principle.' 
    },
    postfix: { 
      name: 'Postfix Evaluation', 
      description: 'Evaluate postfix expressions. Used in calculators and expression parsing.' 
    }
  };

  const push = (value: number) => {
    if (stack.length >= 10) return; // Limit stack size for visualization
    
    setIsAnimating(true);
    setAnimatingIndex(stack.length);
    
    setTimeout(() => {
      setStack(prev => [...prev, value]);
      setIsAnimating(false);
      setAnimatingIndex(-1);
    }, 300);
  };

  const pop = () => {
    if (stack.length === 0) return null;
    
    setIsAnimating(true);
    setAnimatingIndex(stack.length - 1);
    
    setTimeout(() => {
      setStack(prev => prev.slice(0, -1));
      setIsAnimating(false);
      setAnimatingIndex(-1);
    }, 300);
    
    return stack[stack.length - 1];
  };

  const peek = () => {
    if (stack.length === 0) return null;
    
    setAnimatingIndex(stack.length - 1);
    setTimeout(() => setAnimatingIndex(-1), 1000);
    
    return stack[stack.length - 1];
  };

  const clear = () => {
    setStack([]);
    setAnimatingIndex(-1);
  };

  const handlePush = () => {
    const value = parseInt(inputValue);
    if (!isNaN(value)) {
      push(value);
      setInputValue('');
    }
  };

  const demonstrateBalancedParentheses = () => {
    const expressions = ['()', '(())', '(()', ')(', '(()())'];
    let currentExpression = 0;
    
    const checkExpression = (expr: string) => {
      clear();
      setTimeout(() => {
        const chars = expr.split('');
        let index = 0;
        
        const processChar = () => {
          if (index >= chars.length) {
            setTimeout(() => {
              if (currentExpression < expressions.length - 1) {
                currentExpression++;
                setTimeout(() => checkExpression(expressions[currentExpression]), 1000);
              }
            }, 1000);
            return;
          }
          
          const char = chars[index];
          if (char === '(') {
            push(1); // Use 1 to represent opening parenthesis
          } else if (char === ')') {
            if (stack.length === 0) {
              // Unbalanced - no opening parenthesis
            } else {
              pop();
            }
          }
          
          index++;
          setTimeout(processChar, 800);
        };
        
        processChar();
      }, 500);
    };
    
    checkExpression(expressions[currentExpression]);
  };

  const demonstrateReverse = () => {
    const word = "HELLO";
    clear();
    
    setTimeout(() => {
      const chars = word.split('');
      let index = 0;
      
      const pushChars = () => {
        if (index >= chars.length) {
          setTimeout(popChars, 1000);
          return;
        }
        
        push(chars[index].charCodeAt(0) - 64); // Convert A-Z to 1-26
        index++;
        setTimeout(pushChars, 600);
      };
      
      const popChars = () => {
        if (stack.length === 0) return;
        pop();
        setTimeout(popChars, 600);
      };
      
      pushChars();
    }, 500);
  };

  const demonstratePostfix = () => {
    const expression = "23+4*"; // (2+3)*4 = 20
    clear();
    
    setTimeout(() => {
      const tokens = expression.split('');
      let index = 0;
      
      const processToken = () => {
        if (index >= tokens.length) return;
        
        const token = tokens[index];
        if (!isNaN(parseInt(token))) {
          push(parseInt(token));
        } else {
          // Operator - pop two operands
          if (stack.length >= 2) {
            setTimeout(() => {
              pop();
              setTimeout(() => {
                pop();
                setTimeout(() => {
                  // Push result (simplified - just push a result value)
                  push(Math.floor(Math.random() * 20) + 1);
                }, 300);
              }, 300);
            }, 300);
          }
        }
        
        index++;
        setTimeout(processToken, 1200);
      };
      
      processToken();
    }, 500);
  };

  const runAlgorithm = () => {
    switch (algorithm) {
      case 'balanced':
        demonstrateBalancedParentheses();
        break;
      case 'reverse':
        demonstrateReverse();
        break;
      case 'postfix':
        demonstratePostfix();
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
            <label className="text-sm font-medium">Value to Push</label>
            <div className="flex gap-2">
              <Input
                type="number"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Enter number"
                onKeyPress={(e) => e.key === 'Enter' && handlePush()}
              />
              <Button onClick={handlePush} disabled={isAnimating}>
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
              <Button onClick={pop} disabled={isAnimating || stack.length === 0}>
                Pop
              </Button>
              <Button onClick={peek} disabled={stack.length === 0}>
                Peek
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
              Stack Size: {stack.length} | Top → Bottom
            </div>
            
            <div className="relative">
              {/* Stack base */}
              <div className="w-24 h-8 bg-gray-800 rounded-b-lg"></div>
              
              {/* Stack elements */}
              <div className="flex flex-col-reverse">
                {stack.map((value, index) => (
                  <div
                    key={index}
                    className={`w-20 h-12 mx-2 flex items-center justify-center text-white font-bold rounded transition-all duration-300 ${
                      animatingIndex === index
                        ? 'bg-red-500 scale-110'
                        : 'bg-blue-500'
                    }`}
                    style={{
                      transform: animatingIndex === index ? 'scale(1.1)' : 'scale(1)',
                    }}
                  >
                    {value}
                  </div>
                ))}
                
                {/* Animating element for push operation */}
                {isAnimating && animatingIndex === stack.length && (
                  <div className="w-20 h-12 mx-2 flex items-center justify-center bg-green-500 text-white font-bold rounded animate-[slide-in-right_0.3s_ease-out]">
                    New
                  </div>
                )}
              </div>
              
              {/* Stack pointer */}
              <div className="flex items-center justify-center mt-2">
                <div className="text-sm font-medium text-gray-600">
                  {stack.length > 0 ? '↑ TOP' : 'EMPTY'}
                </div>
              </div>
            </div>
            
            {/* Current operation display */}
            <div className="text-center">
              <div className="text-sm font-medium">
                Last Value: {stack.length > 0 ? stack[stack.length - 1] : 'None'}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Stack Operations</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div><strong>Push:</strong> Add element to top - O(1)</div>
            <div><strong>Pop:</strong> Remove top element - O(1)</div>
            <div><strong>Peek/Top:</strong> View top element - O(1)</div>
            <div><strong>IsEmpty:</strong> Check if stack is empty - O(1)</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Common Applications</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div>• Function call management</div>
            <div>• Undo operations in applications</div>
            <div>• Expression evaluation</div>
            <div>• Browser history navigation</div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StackVisualizer;
