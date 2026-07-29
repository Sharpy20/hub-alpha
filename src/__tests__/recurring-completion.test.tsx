/**
 * Completing a recurring job is per DAY, not per record.
 *
 * A recurring ward job (fridge temps) is ONE task rendered on every day it
 * falls due. Completion used to be written to `status`, so ticking Monday's
 * check struck the whole week through - eight jobs marked done by one tap on
 * one of them (Mike, 29 Jul). Those days are separate jobs to the people doing
 * them, so completion lives in `completedDates`.
 */
import { renderHook, act } from "@testing-library/react";
import { TasksProvider, useTasks } from "@/app/tasks-provider";
import { isCompleteOn, isPerDate } from "@/lib/utils/task-completion";
import type { DiaryTask } from "@/lib/types";

function setup() {
  return renderHook(() => useTasks(), {
    wrapper: ({ children }) => <TasksProvider>{children}</TasksProvider>,
  });
}

const findTask = (tasks: DiaryTask[], id: string) => tasks.find((t) => t.id === id)!;

const MON = "2026-07-27";
const TUE = "2026-07-28";

describe("a recurring job completes one day at a time", () => {
  const recurring = (tasks: DiaryTask[]) =>
    tasks.find((t) => t.type === "ward" && t.isRecurring)!;

  it("marks only the day it was ticked off", () => {
    const { result } = setup();
    const task = recurring(result.current.tasks);

    act(() => result.current.toggleComplete(task.id, "Anne Elliot", MON));

    const after = findTask(result.current.tasks, task.id);
    expect(isCompleteOn(after, MON)).toBe(true);
    expect(isCompleteOn(after, TUE)).toBe(false);
  });

  it("leaves `status` alone, so no other day reads as done", () => {
    const { result } = setup();
    const task = recurring(result.current.tasks);

    act(() => result.current.toggleComplete(task.id, "Anne Elliot", MON));

    expect(findTask(result.current.tasks, task.id).status).not.toBe("completed");
  });

  it("accumulates days rather than replacing them", () => {
    const { result } = setup();
    const task = recurring(result.current.tasks);

    act(() => result.current.toggleComplete(task.id, "Anne Elliot", MON));
    act(() => result.current.toggleComplete(task.id, "Anne Elliot", TUE));

    const after = findTask(result.current.tasks, task.id);
    expect(isCompleteOn(after, MON)).toBe(true);
    expect(isCompleteOn(after, TUE)).toBe(true);
  });

  it("un-ticks only the day asked for", () => {
    const { result } = setup();
    const task = recurring(result.current.tasks);

    act(() => result.current.toggleComplete(task.id, "Anne Elliot", MON));
    act(() => result.current.toggleComplete(task.id, "Anne Elliot", TUE));
    act(() => result.current.toggleComplete(task.id, "Anne Elliot", MON));

    const after = findTask(result.current.tasks, task.id);
    expect(isCompleteOn(after, MON)).toBe(false);
    expect(isCompleteOn(after, TUE)).toBe(true);
  });

  it("puts the day on the history line - 'completed' alone means nothing here", () => {
    const { result } = setup();
    const task = recurring(result.current.tasks);

    act(() => result.current.toggleComplete(task.id, "Anne Elliot", MON));

    const history = findTask(result.current.tasks, task.id).history ?? [];
    const last = history[history.length - 1];
    expect(last.type).toBe("completed");
    expect(last.detail).toContain(MON);
  });
});

describe("a one-off job is untouched by any of this", () => {
  it("still completes on status", () => {
    const { result } = setup();
    const task = result.current.tasks.find((t) => t.type === "patient")!;

    act(() => result.current.toggleComplete(task.id, "Anne Elliot"));

    const after = findTask(result.current.tasks, task.id);
    expect(after.status).toBe("completed");
    expect(isCompleteOn(after, MON)).toBe(true);
    expect(isCompleteOn(after, TUE)).toBe(true);
  });

  it("is not treated as a per-date job", () => {
    const { result } = setup();
    const task = result.current.tasks.find((t) => t.type === "patient")!;
    expect(isPerDate(task)).toBe(false);
  });
});

describe("isCompleteOn with no date", () => {
  it("answers 'was it done today' for a recurring job", () => {
    const { result } = setup();
    const task = result.current.tasks.find((t) => t.type === "ward" && t.isRecurring)!;

    expect(isCompleteOn(findTask(result.current.tasks, task.id))).toBe(false);
    act(() => result.current.toggleComplete(task.id, "Anne Elliot"));
    expect(isCompleteOn(findTask(result.current.tasks, task.id))).toBe(true);
  });
});
