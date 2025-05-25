export interface DailyTask {
  id: string;
  text: string;
  completed: boolean;
  date: string; // ISO string
}

export interface TaskContextType {
  currentTask: DailyTask | null;
  setCurrentTask: (task: DailyTask | null) => void;
  streak: number;
} 