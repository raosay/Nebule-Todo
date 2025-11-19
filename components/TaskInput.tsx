import React, { useState } from 'react';
import { TaskType } from '../types';
import { breakdownTaskWithAI } from '../services/geminiService';

interface TaskInputProps {
  onAddTask: (text: string, type: TaskType, deadline?: number) => void;
}

const TaskInput: React.FC<TaskInputProps> = ({ onAddTask }) => {
  const [text, setText] = useState('');
  const [type, setType] = useState<TaskType>(TaskType.ONE_TIME);
  const [deadline, setDeadline] = useState<string>('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    
    const deadlineTimestamp = deadline ? new Date(deadline).getTime() : undefined;
    onAddTask(text, type, deadlineTimestamp);
    
    setText('');
    setDeadline('');
  };

  const handleAIBreakdown = async () => {
    if (!text.trim()) return;
    setIsThinking(true);
    try {
        const subtasks = await breakdownTaskWithAI(text);
        const deadlineTimestamp = deadline ? new Date(deadline).getTime() : undefined;
        
        if (subtasks.length > 0) {
            subtasks.forEach(sub => onAddTask(sub, type, deadlineTimestamp));
            setText('');
            setDeadline('');
        } else {
            onAddTask(text, type, deadlineTimestamp);
            setText('');
            setDeadline('');
        }
    } catch (e) {
        onAddTask(text, type);
        setText('');
    } finally {
        setIsThinking(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative mb-8 group z-20">
      <div className="absolute -inset-1 bg-gradient-to-r from-neon-purple to-neon-blue rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
      <div className="relative bg-zinc-900 rounded-xl p-2 flex flex-col gap-2 border border-zinc-800 shadow-2xl">
        
        {/* Top Row: Input */}
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="输入你的任务..."
          className="w-full bg-transparent text-zinc-100 placeholder-zinc-500 px-4 py-2 outline-none text-lg"
          disabled={isThinking}
        />

        {/* Bottom Row: Controls */}
        <div className="flex items-center justify-between px-2 pb-1">
            <div className="flex items-center gap-2">
                {/* Type Toggle */}
                <div className="flex bg-zinc-800 rounded-lg p-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => setType(TaskType.ONE_TIME)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      type === TaskType.ONE_TIME
                        ? 'bg-zinc-700 text-white shadow-md'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    一次性
                  </button>
                  <button
                    type="button"
                    onClick={() => setType(TaskType.DAILY)}
                    className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                      type === TaskType.DAILY
                        ? 'bg-zinc-700 text-neon-blue shadow-md'
                        : 'text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    每日
                  </button>
                </div>

                {/* Deadline Picker */}
                <div 
                    className={`relative flex items-center gap-1 px-3 py-1.5 rounded-lg border transition-colors cursor-pointer select-none ${deadline ? 'border-neon-purple text-neon-purple bg-neon-purple/10' : 'border-zinc-800 text-zinc-500 hover:border-zinc-700 hover:text-zinc-300'}`}
                >
                     <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-xs font-medium">
                        {deadline ? new Date(deadline).toLocaleDateString(undefined, {month:'numeric', day:'numeric', hour:'2-digit', minute:'2-digit'}) : '截止时间'}
                    </span>
                    
                    {/* 
                        Overlay Input with WebKit Calendar Picker Indicator fix:
                        The [&::-webkit-...] classes force the browser's native calendar trigger area
                        to expand and cover the entire input, ensuring any click opens the picker.
                    */}
                    <input 
                        type="datetime-local"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:w-full [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:opacity-0"
                    />
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2">
               <button
                type="button"
                onClick={handleAIBreakdown}
                disabled={!text.trim() || isThinking}
                className={`w-9 h-9 rounded-lg flex items-center justify-center transition-all ${
                    isThinking ? 'bg-zinc-800' : 'bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400'
                }`}
                title="AI 智能拆分"
              >
                {isThinking ? (
                    <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
                    </svg>
                )}
              </button>

              <button
                type="submit"
                disabled={!text.trim()}
                className="bg-zinc-100 text-zinc-900 px-4 py-1.5 rounded-lg font-bold hover:bg-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                添加
              </button>
            </div>
        </div>
      </div>
    </form>
  );
};

export default TaskInput;