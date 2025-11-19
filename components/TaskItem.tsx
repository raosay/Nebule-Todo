import React, { useState, useEffect, useRef } from 'react';
import { Task, TaskType } from '../types';

interface TaskItemProps {
  task: Task;
  onToggle: (id: string, x: number, y: number, color: string) => void;
  onDelete: (id: string) => void;
  onUpdate: (id: string, text: string) => void;
}

const TaskItem: React.FC<TaskItemProps> = ({ task, onToggle, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(task.text);
  const inputRef = useRef<HTMLInputElement>(null);

  const isDaily = task.type === TaskType.DAILY;
  
  // Calculate Urgency
  const now = Date.now();
  let urgencyClass = 'border-zinc-800'; // Default
  let shadowClass = '';
  let statusText = '';
  let statusColor = 'text-zinc-500';
  let hoverClass = 'hover:border-zinc-700'; // Default hover behavior

  if (!task.completed && task.deadline) {
      const diffHours = (task.deadline - now) / (1000 * 60 * 60);
      
      if (diffHours < 0) {
          // Overdue
          urgencyClass = 'border-red-500 animate-pulse-slow';
          shadowClass = 'shadow-[0_0_15px_rgba(239,68,68,0.3)]';
          statusText = '已逾期';
          statusColor = 'text-red-400';
          hoverClass = 'hover:border-red-400';
      } else if (diffHours < 24) {
          // Urgent (< 24h) - Strong Amber Highlight
          urgencyClass = 'border-amber-500';
          shadowClass = 'shadow-[0_0_15px_rgba(245,158,11,0.3)]';
          statusText = '即将到期';
          statusColor = 'text-amber-400';
          hoverClass = 'hover:border-amber-400';
      }
  }

  useEffect(() => {
      if (isEditing && inputRef.current) {
          inputRef.current.focus();
      }
  }, [isEditing]);

  const handleCheck = (e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.target as HTMLElement).getBoundingClientRect();
    const x = rect.left + rect.width / 2;
    const y = rect.top + rect.height / 2;
    // Determine color based on task type or urgency
    let color = isDaily ? '#00f3ff' : '#bc13fe'; 
    if (statusText === '已逾期') color = '#ef4444';
    else if (statusText === '即将到期') color = '#f59e0b';
    
    onToggle(task.id, x, y, color);
  };

  const handleSave = () => {
      if (editText.trim()) {
          onUpdate(task.id, editText);
      } else {
          setEditText(task.text); // Revert if empty
      }
      setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === 'Enter') handleSave();
      if (e.key === 'Escape') {
          setEditText(task.text);
          setIsEditing(false);
      }
  };

  return (
    <div 
      className={`
        group relative flex items-center justify-between p-4 mb-3 rounded-xl border transition-all duration-300
        ${task.completed 
          ? 'bg-zinc-900/50 border-zinc-800 opacity-60' 
          : `bg-zinc-900 ${urgencyClass} ${shadowClass} ${hoverClass} hover:shadow-xl hover:-translate-y-0.5`
        }
      `}
    >
      {/* Left Border Accent */}
      <div 
        className={`absolute left-0 top-2 bottom-2 w-1 rounded-r-full transition-colors duration-300
        ${task.completed 
            ? 'bg-zinc-700' 
            : statusText === '已逾期' ? 'bg-red-500'
            : statusText === '即将到期' ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.8)]'
            : isDaily ? 'bg-neon-blue' : 'bg-neon-purple'}`}
      ></div>

      <div className="flex items-center gap-4 pl-4 flex-1 min-w-0">
        {/* Checkbox */}
        <button
          onClick={handleCheck}
          className={`
            w-6 h-6 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-300
            ${task.completed 
              ? 'bg-zinc-700 border-zinc-700 text-zinc-400' 
              : isDaily 
                ? 'border-neon-blue/50 hover:border-neon-blue hover:bg-neon-blue/10' 
                : 'border-neon-purple/50 hover:border-neon-purple hover:bg-neon-purple/10'
            }
          `}
        >
          {task.completed && (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>

        <div className="flex flex-col flex-1 min-w-0 mr-2">
          {isEditing ? (
              <input 
                ref={inputRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onBlur={handleSave}
                onKeyDown={handleKeyDown}
                className="bg-zinc-800 text-zinc-100 px-2 py-1 rounded outline-none w-full"
              />
          ) : (
              <span 
                onDoubleClick={() => !task.completed && setIsEditing(true)}
                className={`text-base truncate transition-all duration-300 select-none ${task.completed ? 'text-zinc-500 line-through' : 'text-zinc-100'}`}
              >
                {task.text}
              </span>
          )}
          
          <div className="flex gap-3 items-center mt-0.5">
              <span className="text-[10px] font-bold tracking-wider uppercase text-zinc-500 flex gap-2 items-center shrink-0">
                 {isDaily && (
                     <span className="text-neon-blue flex items-center gap-1">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3 h-3">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
                        </svg>
                        每日
                     </span>
                 )}
                 {!isDaily && (
                     <span className="text-neon-purple">一次性</span>
                 )}
              </span>

              {task.deadline && (
                  <span className={`text-[10px] flex items-center gap-1 ${statusColor} font-medium`}>
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-3 h-3">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      {new Date(task.deadline).toLocaleString(undefined, { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      {statusText && (
                          <span className={`ml-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${
                              statusText === '即将到期' ? 'bg-amber-500/20 text-amber-300 shadow-sm shadow-amber-900/20' : 
                              statusText === '已逾期' ? 'bg-red-500/20 text-red-300' : 
                              'bg-zinc-800'
                          }`}>
                              {statusText}
                          </span>
                      )}
                  </span>
              )}
          </div>
        </div>
      </div>

      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          {/* Edit Button */}
          {!task.completed && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="text-zinc-600 hover:text-neon-blue transition-all p-2"
                aria-label="编辑任务"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
              </button>
          )}

          {/* Delete Button */}
          <button
            onClick={() => onDelete(task.id)}
            className="text-zinc-600 hover:text-red-500 transition-all p-2"
            aria-label="删除任务"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
      </div>
    </div>
  );
};

export default TaskItem;