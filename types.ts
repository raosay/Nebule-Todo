export enum TaskType {
  DAILY = 'DAILY',
  ONE_TIME = 'ONE_TIME'
}

export interface Task {
  id: string;
  text: string;
  type: TaskType;
  completed: boolean;
  lastCompletedAt?: string; // ISO Date string
  createdAt: number;
  deadline?: number; // Timestamp for deadline
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  color: string;
  size: number;
}