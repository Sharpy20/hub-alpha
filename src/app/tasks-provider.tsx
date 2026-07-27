"use client";

import { createContext, useContext, useState, ReactNode, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { DiaryTask, TaskEvent, TaskEventType, TaskHandback } from "@/lib/types";
import { ALL_DEMO_TASKS } from "@/lib/data/tasks";
import { handbackHistoryDetail } from "@/lib/data/tasks/handback";
import { toLocalDateStr } from "@/lib/utils/date";

// Append-only task history. The events already fired, they were simply never
// kept - so Reopen used to wipe completedBy/completedAt with no trace.
let eventSeq = 0;
function event(type: TaskEventType, by: string, detail?: string): TaskEvent {
  eventSeq += 1;
  return {
    id: `ev-${eventSeq}-${type}`,
    type,
    by,
    at: new Date().toISOString(),
    detail,
  };
}

const withEvent = <T extends DiaryTask>(task: T, e: TaskEvent): T =>
  ({ ...task, history: [...(task.history || []), e] }) as T;

interface TasksContextType {
  // Tasks marked in error are excluded here, so every consumer's lists and
  // counts skip them automatically. Use allTasks for audit views (Reports).
  tasks: DiaryTask[];
  allTasks: DiaryTask[];
  setTasks: React.Dispatch<React.SetStateAction<DiaryTask[]>>;
  updateTask: (taskId: string, updates: Partial<DiaryTask>) => void;
  claimTask: (taskId: string, userName: string, steal?: boolean) => void;
  toggleComplete: (taskId: string, userName: string) => void;
  addTask: (task: DiaryTask) => void;
  // Tasks are never deleted - marking in error keeps the record for audit.
  markInError: (taskId: string, userName: string) => void;
  restoreFromError: (taskId: string) => void;
  // Hand a part-done job back with structured state (BACKLOG Section M).
  handBackTask: (taskId: string, userName: string, handback: TaskHandback) => void;
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

        if (t.claimedBy === userName) {
          // Drop: claimed by mistake, silent, no state recorded. Handing a
          // part-done job back is a different action (handBackTask).
          return withEvent(
            { ...t, claimedBy: undefined, claimedAt: undefined },
            event("dropped", userName)
          );
        } else if (!t.claimedBy || steal) {
          // Claim if unclaimed, or steal if already claimed
          // Set status to pending (Todo) not in_progress
          const today = toLocalDateStr();
          return withEvent(
            {
              ...t,
              claimedBy: userName,
              claimedAt: today,
              status: t.status === "completed" ? "pending" : t.status === "in_progress" ? "pending" : t.status,
              // A live claim must not show someone else's stale hand-back state,
              // but the history line keeps the record of it.
              handback: undefined,
            },
            event(
              steal && t.claimedBy ? "taken_over" : "claimed",
              userName,
              steal && t.claimedBy ? `from ${t.claimedBy}` : undefined
            )
          );
        }
        return t;
      });
    });
  }, []);

  const toggleComplete = useCallback((taskId: string, userName: string) => {
    const today = toLocalDateStr();
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
          ? withEvent(
              {
                ...t,
                status: t.status === "completed" ? "pending" : "completed",
                completedAt: t.status === "completed" ? undefined : today,
                completedBy: t.status === "completed" ? undefined : userName,
                // Completing settles whatever state it was handed back in.
                handback: t.status === "completed" ? t.handback : undefined,
              },
              // Reopen used to wipe completedBy/completedAt with no trace; the
              // history line is what makes it non-lossy.
              t.status === "completed"
                ? event("reopened", userName, t.completedBy ? `was completed by ${t.completedBy}` : undefined)
                : event("completed", userName)
            )
          : t
      );
    });
  }, []);

  const addTask = useCallback((task: DiaryTask) => {
    setTasks((prev) => [...prev, task]);
    toast.success(`Added "${task.title}"`, { icon: "➕" });
  }, []);

  const markInError = useCallback((taskId: string, userName: string) => {
    const today = toLocalDateStr();
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;
      setTimeout(() => {
        toast.info(`Marked "${task.title}" in error - removed from active views. Restore it from Reports.`);
      }, 0);
      return prev.map((t) =>
        t.id === taskId
          ? { ...t, inError: true, markedInErrorBy: userName, markedInErrorAt: today }
          : t
      );
    });
  }, []);

  const restoreFromError = useCallback((taskId: string) => {
    setTasks((prev) => {
      const task = prev.find((t) => t.id === taskId);
      if (!task) return prev;
      setTimeout(() => {
        toast.success(`Restored "${task.title}" to active views`);
      }, 0);
      return prev.map((t) =>
        t.id === taskId
          ? { ...t, inError: undefined, markedInErrorBy: undefined, markedInErrorAt: undefined }
          : t
      );
    });
  }, []);

  /**
   * Hand a job back with structured state. Unlike Drop this leaves a trace, and
   * unlike Mark Complete it does not lie (so a discharge barrier stays up).
   * Destination decides where it lands: back in today's pool, scheduled forward
   * to the chase date, or kept with the person who handed it back.
   */
  const handBackTask = useCallback(
    (taskId: string, userName: string, handback: TaskHandback) => {
      setTasks((prev) => {
        const task = prev.find((t) => t.id === taskId);
        if (!task) return prev;

        setTimeout(() => {
          toast.success(
            handback.destination === "keep"
              ? `Updated "${task.title}" - still with you`
              : `Handed back "${task.title}"`
          );
        }, 0);

        return prev.map((t) => {
          if (t.id !== taskId) return t;
          const dateField = t.type === "appointment" ? "appointmentDate" : "dueDate";
          const reschedule =
            handback.destination === "scheduled" && handback.chaseDate
              ? { [dateField]: handback.chaseDate }
              : {};
          return withEvent(
            {
              ...t,
              ...reschedule,
              handback,
              handbackCount: (t.handbackCount || 0) + 1,
              // Keeping it means it stays claimed by you; otherwise it goes back
              // into the pool so the next person on shift can actually see it.
              claimedBy: handback.destination === "keep" ? userName : undefined,
              claimedAt: handback.destination === "keep" ? t.claimedAt : undefined,
              // Never completed - that is the lie this feature exists to avoid.
              status: "pending",
            } as DiaryTask,
            event("handed_back", userName, handbackHistoryDetail(handback))
          );
        });
      });
    },
    []
  );

  // Everything reading `tasks` skips marked-in-error records automatically.
  const visibleTasks = useMemo(() => tasks.filter((t) => !t.inError), [tasks]);

  return (
    <TasksContext.Provider
      value={{
        tasks: visibleTasks,
        allTasks: tasks,
        setTasks,
        updateTask,
        claimTask,
        toggleComplete,
        addTask,
        markInError,
        restoreFromError,
        handBackTask,
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
