/**
 * Hand-back rules.
 *
 * Handing a job back is the feature the task system is defended by: it is what
 * stops a part-done job changing hands with nobody able to say what state it was
 * in. Its rules live in one setTasks updater in tasks-provider, and every one of
 * them is the sort a later refactor breaks silently. An appointment whose chase
 * date lands on `dueDate` simply never moves. A job that comes back marked
 * completed reads as done work that never happened. Both look fine on screen.
 *
 * These assert INTENT, taken from the code's own comments, not just whatever it
 * happens to do today.
 */
import { renderHook, act } from "@testing-library/react";
import { TasksProvider, useTasks } from "@/app/tasks-provider";
import type { DiaryTask, TaskHandback } from "@/lib/types";

// The provider seeds itself from the demo data, so tests pick a real task out of
// it rather than inventing one whose shape could drift from the real thing.
function setup() {
  return renderHook(() => useTasks(), {
    wrapper: ({ children }) => <TasksProvider>{children}</TasksProvider>,
  });
}

const findTask = (tasks: DiaryTask[], id: string) => tasks.find((t) => t.id === id)!;

const handback = (over: Partial<TaskHandback> = {}): TaskHandback => ({
  state: "part_done",
  next: "carry_on",
  destination: "pool",
  by: "Anne Elliot",
  at: "2026-07-29",
  ...over,
});

describe("handing a job back", () => {
  it("puts the job back in the pool so the next person on shift can see it", () => {
    const { result } = setup();
    const task = result.current.tasks.find((t) => t.type !== "appointment")!;

    act(() => result.current.claimTask(task.id, "Anne Elliot"));
    expect(findTask(result.current.tasks, task.id).claimedBy).toBe("Anne Elliot");

    act(() => result.current.handBackTask(task.id, "Anne Elliot", handback()));

    const after = findTask(result.current.tasks, task.id);
    expect(after.claimedBy).toBeUndefined();
    expect(after.claimedAt).toBeUndefined();
  });

  it("keeps the job with you when that is the destination chosen", () => {
    const { result } = setup();
    const task = result.current.tasks.find((t) => t.type !== "appointment")!;

    act(() => result.current.claimTask(task.id, "Anne Elliot"));
    act(() =>
      result.current.handBackTask(task.id, "Anne Elliot", handback({ destination: "keep" }))
    );

    expect(findTask(result.current.tasks, task.id).claimedBy).toBe("Anne Elliot");
  });

  it("never marks the job completed - the lie the feature exists to avoid", () => {
    const { result } = setup();
    const task = result.current.tasks.find((t) => t.type !== "appointment")!;

    act(() => result.current.claimTask(task.id, "Anne Elliot"));
    act(() => result.current.toggleComplete(task.id, "Anne Elliot"));
    expect(findTask(result.current.tasks, task.id).status).toBe("completed");

    act(() =>
      result.current.handBackTask(task.id, "Anne Elliot", handback({ state: "not_started" }))
    );

    expect(findTask(result.current.tasks, task.id).status).toBe("pending");
  });

  it("counts every hand-back, so a job going round in circles can say so", () => {
    const { result } = setup();
    const task = result.current.tasks.find((t) => t.type !== "appointment")!;

    act(() => result.current.handBackTask(task.id, "Anne Elliot", handback()));
    act(() => result.current.handBackTask(task.id, "Henry Tilney", handback()));
    act(() => result.current.handBackTask(task.id, "Anne Elliot", handback()));

    expect(findTask(result.current.tasks, task.id).handbackCount).toBe(3);
  });

  it("appends to history rather than replacing it, so reopening is not lossy", () => {
    const { result } = setup();
    const task = result.current.tasks.find((t) => t.type !== "appointment")!;
    const before = findTask(result.current.tasks, task.id).history?.length ?? 0;

    act(() => result.current.claimTask(task.id, "Anne Elliot"));
    act(() => result.current.handBackTask(task.id, "Anne Elliot", handback()));

    const history = findTask(result.current.tasks, task.id).history ?? [];
    expect(history.length).toBe(before + 2);
    expect(history[history.length - 1].type).toBe("handed_back");
    expect(history[history.length - 1].by).toBe("Anne Elliot");
    // Assembled from the structured choices, never from anything typed.
    expect(history[history.length - 1].detail).toBeTruthy();
  });

  it("records who we are waiting on and when to chase", () => {
    const { result } = setup();
    const task = result.current.tasks.find((t) => t.type !== "appointment")!;

    act(() =>
      result.current.handBackTask(
        task.id,
        "Anne Elliot",
        handback({ state: "waiting", next: "chase", waitingOn: "Social care", chaseDate: "2026-08-05" })
      )
    );

    const after = findTask(result.current.tasks, task.id);
    expect(after.handback?.waitingOn).toBe("Social care");
    expect(after.handback?.chaseDate).toBe("2026-08-05");
  });

  describe("the chase date moves the job", () => {
    it("writes to dueDate for a ward or patient task", () => {
      const { result } = setup();
      const task = result.current.tasks.find((t) => t.type !== "appointment")!;

      act(() =>
        result.current.handBackTask(task.id, "Anne Elliot", handback({ chaseDate: "2026-08-11" }))
      );

      const after = findTask(result.current.tasks, task.id);
      if (after.type === "appointment") throw new Error("picked an appointment by mistake");
      expect(after.dueDate).toBe("2026-08-11");
    });

    it("writes to appointmentDate for an appointment", () => {
      const { result } = setup();
      const appt = result.current.tasks.find((t) => t.type === "appointment")!;

      act(() =>
        result.current.handBackTask(appt.id, "Anne Elliot", handback({ chaseDate: "2026-08-12" }))
      );

      const after = findTask(result.current.tasks, appt.id);
      if (after.type !== "appointment") throw new Error("expected an appointment");
      expect(after.appointmentDate).toBe("2026-08-12");
    });

    it("leaves the date alone when no chase date was given", () => {
      const { result } = setup();
      const task = result.current.tasks.find((t) => t.type !== "appointment")!;
      const before = task.dueDate;

      act(() => result.current.handBackTask(task.id, "Anne Elliot", handback()));

      const after = findTask(result.current.tasks, task.id);
      if (after.type === "appointment") throw new Error("picked an appointment by mistake");
      expect(after.dueDate).toBe(before);
    });
  });

  it("clears a stale hand-back when someone claims the job afresh", () => {
    const { result } = setup();
    const task = result.current.tasks.find((t) => t.type !== "appointment")!;

    act(() => result.current.handBackTask(task.id, "Anne Elliot", handback()));
    expect(findTask(result.current.tasks, task.id).handback).toBeDefined();

    act(() => result.current.claimTask(task.id, "Henry Tilney"));

    const after = findTask(result.current.tasks, task.id);
    expect(after.handback).toBeUndefined();
    // Gone from the live state, still on the record.
    expect(after.history?.some((e) => e.type === "handed_back")).toBe(true);
  });

  it("does nothing at all when the job does not exist", () => {
    const { result } = setup();
    const before = result.current.tasks.length;

    act(() => result.current.handBackTask("no-such-task", "Anne Elliot", handback()));

    expect(result.current.tasks.length).toBe(before);
  });
});
