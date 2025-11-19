import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskType } from './types';
import TaskInput from './components/TaskInput';
import TaskItem from './components/TaskItem';
import ParticleOverlay, { ParticleRef } from './components/ParticleOverlay';

const STORAGE_KEY = 'nebula-todo-data';

// Robust ID generator with fallback
const generateId = () => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

const App: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const particleRef = useRef<ParticleRef>(null);
  const [mounted, setMounted] = useState(false);
  const [now, setNow] = useState(Date.now());

  // Timer for updating UI based on time (urgency)
  useEffect(() => {
      const timer = setInterval(() => setNow(Date.now()), 60000); // Update every minute
      return () => clearInterval(timer);
  }, []);

  // Load from storage and handle daily resets
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        let parsedTasks: Task[] = JSON.parse(stored);
        
        // Check for daily resets
        const today = new Date().toLocaleDateString();
        
        parsedTasks = parsedTasks.map(task => {
          if (task.type === TaskType.DAILY) {
            // If last completed date is not today, reset it
             if (task.completed && task.lastCompletedAt) {
                 const lastDate = new Date(task.lastCompletedAt).toLocaleDateString();
                 if (lastDate !== today) {
                     return { ...task, completed: false };
                 }
             } else if (task.completed && !task.lastCompletedAt) {
                 // Fallback for legacy data
                 return { ...task, completed: false };
             }
          }
          return task;
        });
        
        setTasks(parsedTasks);
      } catch (e) {
        console.error("Failed to parse tasks", e);
      }
    }
    setMounted(true);
  }, []);

  // Persist to storage
  useEffect(() => {
    if (mounted) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
        } catch (error) {
            console.error("Failed to save tasks to localStorage:", error);
        }
    }
  }, [tasks, mounted]);

  const addTask = (text: string, type: TaskType, deadline?: number) => {
    const newTask: Task = {
      id: generateId(),
      text,
      type,
      completed: false,
      createdAt: Date.now(),
      deadline
    };
    setTasks(prev => [newTask, ...prev]);
  };

  const updateTask = (id: string, text: string) => {
      setTasks(prev => prev.map(t => t.id === id ? { ...t, text } : t));
  };

  const toggleTask = (id: string, x: number, y: number, color: string) => {
    setTasks(prev => prev.map(task => {
      if (task.id === id) {
        const isCompleting = !task.completed;
        
        // Trigger explosion only when completing
        if (isCompleting) {
            particleRef.current?.explode(x, y, color);
        }

        return {
          ...task,
          completed: isCompleting,
          lastCompletedAt: isCompleting ? new Date().toISOString() : undefined
        };
      }
      return task;
    }));
  };

  const deleteTask = (id: string) => {
    if (window.confirm('确定要永久删除此任务吗？')) {
        setTasks(prev => prev.filter(t => t.id !== id));
    }
  };

  // Sort: Incomplete first, then by deadline (if exists), then by creation
  const sortedTasks = [...tasks].sort((a, b) => {
    if (a.completed === b.completed) {
        // If both incomplete and have deadlines, sort by deadline
        if (!a.completed && a.deadline && b.deadline) {
            return a.deadline - b.deadline;
        }
        // Put tasks with deadlines before those without
        if (!a.completed && a.deadline && !b.deadline) return -1;
        if (!a.completed && !a.deadline && b.deadline) return 1;
        
        return b.createdAt - a.createdAt;
    }
    return a.completed ? 1 : -1;
  });

  const activeTasksCount = tasks.filter(t => !t.completed).length;
  const completionPercentage = tasks.length > 0 
    ? Math.round(((tasks.length - activeTasksCount) / tasks.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen text-zinc-200 relative selection:bg-neon-purple/30">
      <ParticleOverlay ref={particleRef} />
      
      <div className="max-w-2xl mx-auto px-4 py-12 relative z-10">
        
        {/* Header Area */}
        <div className="mb-12 text-center">
            <div className="inline-block mb-2 relative">
                 <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-white via-zinc-200 to-zinc-500 pb-2">
                    星云待办
                </h1>
                <div className="absolute -top-4 -right-4 w-8 h-8 rounded-full bg-neon-purple blur-xl opacity-50 animate-pulse-slow"></div>
                <div className="absolute -bottom-2 -left-4 w-12 h-12 rounded-full bg-neon-blue blur-xl opacity-30 animate-pulse-slow"></div>
            </div>
            <p className="text-zinc-500 font-medium tracking-wide uppercase text-sm">
                每日循环 & 任务管理系统
            </p>
        </div>

        {/* Stats Bar */}
        <div className="flex justify-between items-end mb-6 px-2">
            <div>
                <span className="text-3xl font-bold text-white">{activeTasksCount}</span>
                <span className="text-zinc-500 ml-2 text-sm">待办</span>
            </div>
            <div className="text-right">
                <div className="text-xs text-zinc-500 mb-1">完成进度</div>
                <div className="h-1 w-24 bg-zinc-800 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-gradient-to-r from-neon-blue to-neon-purple transition-all duration-700 ease-out" 
                        style={{ width: `${completionPercentage}%` }}
                    ></div>
                </div>
            </div>
        </div>

        <TaskInput onAddTask={addTask} />

        <div className="space-y-1 min-h-[300px]">
            {sortedTasks.length === 0 ? (
                <div className="text-center py-20 border border-dashed border-zinc-800 rounded-xl text-zinc-600">
                    <p className="text-lg">系统待机中。</p>
                    <p className="text-sm mt-2">初始化任务以启动协议。</p>
                </div>
            ) : (
                sortedTasks.map(task => (
                    <TaskItem 
                        key={task.id} 
                        task={task} 
                        onToggle={toggleTask} 
                        onDelete={deleteTask}
                        onUpdate={updateTask}
                    />
                ))
            )}
        </div>

        <footer className="mt-20 text-center text-zinc-700 text-xs flex flex-col gap-2">
            <p>由 GEMINI 2.5 • REACT • TAILWIND 驱动</p>
            <p className="flex items-center justify-center gap-1.5 opacity-50">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                数据已自动保存至本地
            </p>
        </footer>

      </div>
    </div>
  );
};

export default App;