"use client";

import { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { toast } from "sonner";
import { DiaryTask } from "@/lib/types";
import { ALL_DEMO_TASKS } from "@/lib/data/tasks";

interface TasksContextType {
  tasks: DiaryTask[];
  setTasks: React.Dispatch<React.SetStateAction<DiaryTask[]>>;
  updateTask: (taskId: string, updates: Partial<DiaryTask>) => void;
  claimTask: (taskId: string, userName: string, steal?: boolean) => void;
  toggleComplete: (taskId: string, userName: string) => void;
  addTask: (task: DiaryTask) => void;
}

const TasksContext = createContext<TasksContextType | null>(null);

export function TasksProvider({ children }: { children: ReactNode }) {
  const [tasks, setTasks] = useState<DiaryTask[]>(ALL_DEMO_TASKS);

  const updateTask = useCallback((taskId: string, updates: Partial<DiaryTask>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? ({ ...task, ...updates } as DiaryTask) : task
      )
    );
  }, []);

  const claimTask = useCallback((taskId: string, userName: string, steal: boolean = false) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;

      // Determine action for toast
      let toastMessage = "";
      let toastType: "success" | "info" = "success";

      if (task.claimedBy === userName) {
        toastMessage = `Unclaimed "${task.title}"`;
        toastType = "info";
      } else if (steal && task.claimedBy) {
        toastMessage = `Took over "${task.title}" from ${task.claimedBy}`;
      } else {
        toastMessage = `Claimed "${task.title}"`;
      }

      // Show toast after state update
      setTimeout(() => {
        if (toastType === "info") {
          toast.info(toastMessage);
        } else {
          toast.success(toastMessage);
        }
      }, 0);

      return prev.map((t) => {
        if (t.id !== taskId) return t;

        // Toggle claim
        if (t.claimedBy === userName) {
          // Unclaim if we own it
          return {
            ...t,
            claimedBy: undefined,
            claimedAt: undefined,
          };
        } else if (!t.claimedBy || steal) {
          // Claim if unclaimed, or steal if already claimed
          // Set status to pending (Todo) not in_progress
          const today = new Date().toISOString().split("T")[0];
          return {
            ...t,
            claimedBy: userName,
            claimedAt: today,
            status: t.status === "completed" ? "pending" : t.status === "in_progress" ? "pending" : t.status,
          };
        }
        return t;
      });
    });
  }, []);

  const toggleComplete = useCallback((taskId: string, userName: string) => {
    const today = new Date().toISOString().split("T")[0];
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;

      const isCompleting = task.status !== "completed";
      const toastMessage = isCompleting
        ? `Completed "${task.title}"`
        : `Reopened "${task.title}"`;

      setTimeout(() => {
        if (isCompleting) {
          toast.success(toastMessage, { icon: "✅" });
        } else {
          toast.info(toastMessage);
        }
      }, 0);

      return prev.map((t) =>
        t.id === taskId
          ? {
              ...t,
              status: t.status === "completed" ? "pending" : "completed",
              completedAt: t.status === "completed" ? undefined : today,
              completedBy: t.status === "completed" ? undefined : userName,
            }
          : t
      );
    });
  }, []);

  const addTask = useCallback((task: DiaryTask) => {
    setTasks((prev) => [...prev, task]);
    toast.success(`Added "${task.title}"`, { icon: "➕" });
  }, []);

  return (
    <TasksContext.Provider
      value={{
        tasks,
        setTasks,
        updateTask,
        claimTask,
        toggleComplete,
        addTask,
      }}
    >
      {children}
    </TasksContext.Provider>
  );
}

export function useTasks() {
  const context = useContext(TasksContext);
  if (!context) {
    throw new Error("useTasks must be used within a TasksProvider");
  }
  return context;
}
