import { render, screen, fireEvent } from "@testing-library/react";
import { StepEditor } from "@/components/admin/guide-editor/StepEditor";
import { BranchPicker } from "@/components/guides/BranchPicker";
import { ConditionPanel, QuestionPanel } from "@/components/admin/guide-editor/BranchEditors";
import type { BranchBlock } from "@/lib/data/guides/branching";
import type { EditorStep } from "@/lib/data/guides/editor-model";

const area: BranchBlock = {
  id: "q1",
  question: "Which area?",
  choices: [
    { id: "c1", label: "Derby City", hint: "City council" },
    { id: "c2", label: "Derbyshire County" },
  ],
};

describe("BranchPicker", () => {
  it("is a labelled radio group with one radio per choice", () => {
    render(<BranchPicker branch={area} answer={undefined} onAnswer={() => {}} />);
    expect(screen.getByRole("radiogroup", { name: "Which area?" })).toBeInTheDocument();
    expect(screen.getAllByRole("radio")).toHaveLength(2);
  });

  it("marks only the chosen answer as checked", () => {
    render(<BranchPicker branch={area} answer="c2" onAnswer={() => {}} />);
    expect(screen.getByRole("radio", { name: /Derbyshire County/ })).toHaveAttribute("aria-checked", "true");
    expect(screen.getByRole("radio", { name: /Derby City/ })).toHaveAttribute("aria-checked", "false");
  });

  it("reports the choice id when clicked", () => {
    const onAnswer = jest.fn();
    render(<BranchPicker branch={area} answer={undefined} onAnswer={onAnswer} />);
    fireEvent.click(screen.getByRole("radio", { name: /Derby City/ }));
    expect(onAnswer).toHaveBeenCalledWith("c1");
  });

  it("shows the one-line hint under a choice", () => {
    render(<BranchPicker branch={area} answer={undefined} onAnswer={() => {}} />);
    expect(screen.getByText("City council")).toBeInTheDocument();
  });

  it("says when a question is optional", () => {
    render(<BranchPicker branch={{ ...area, required: false }} answer={undefined} onAnswer={() => {}} />);
    expect(screen.getByText(/Optional/)).toBeInTheDocument();
  });
});

describe("QuestionPanel", () => {
  const setup = (branch: BranchBlock, dependants = 0) => {
    const onChange = jest.fn();
    const onRemove = jest.fn();
    const onInsertToken = jest.fn();
    render(<QuestionPanel branch={branch} onChange={onChange} onRemove={onRemove} dependants={dependants} onInsertToken={onInsertToken} />);
    return { onChange, onRemove, onInsertToken };
  };

  it("passes on an edited question", () => {
    const { onChange } = setup(area);
    fireEvent.change(screen.getByLabelText("What are you asking the reader?"), { target: { value: "Which team?" } });
    expect(onChange).toHaveBeenCalledWith({ ...area, question: "Which team?" });
  });

  it("will not remove a choice when only two are left", () => {
    setup(area);
    screen.getAllByRole("button", { name: /Remove choice/ }).forEach((b) => expect(b).toBeDisabled());
  });

  it("adds a choice with a fresh id", () => {
    const { onChange } = setup(area);
    fireEvent.click(screen.getByRole("button", { name: "Add a choice" }));
    const next = onChange.mock.calls[0][0] as BranchBlock;
    expect(next.choices.map((c) => c.id)).toEqual(["c1", "c2", "c3"]);
  });

  it("offers presets only while the question is still blank", () => {
    const blank: BranchBlock = { id: "q1", question: "", choices: [{ id: "c1", label: "" }, { id: "c2", label: "" }] };
    const { onChange } = setup(blank);
    fireEvent.click(screen.getByRole("button", { name: "Yes or no" }));
    expect((onChange.mock.calls[0][0] as BranchBlock).choices.map((c) => c.label)).toEqual(["Yes", "No"]);
  });

  it("hides the presets once there is content", () => {
    setup(area);
    expect(screen.queryByRole("button", { name: "Yes or no" })).not.toBeInTheDocument();
  });

  it("hands over the case note token for this question", () => {
    const { onInsertToken } = setup(area);
    fireEvent.click(screen.getByRole("button", { name: "Add it to the case note" }));
    expect(onInsertToken).toHaveBeenCalledWith("[BRANCH:q1]");
  });

  it("says how many later steps depend on the answer", () => {
    setup(area, 2);
    expect(screen.getByText(/2 later steps change with this answer/)).toBeInTheDocument();
  });

  it("makes an unrequired question skippable", () => {
    const { onChange } = setup(area);
    fireEvent.click(screen.getByLabelText(/has to answer before moving on/));
    expect(onChange).toHaveBeenCalledWith({ ...area, required: false });
  });
});

describe("ConditionPanel", () => {
  const asks = { id: "s1", title: "Ask", content: "x", branch: area } as EditorStep;
  const after = { id: "s2", title: "After", content: "y", showIf: [{ branch: "q1", is: ["c1"] }] } as EditorStep;

  it("explains itself when there is no earlier question", () => {
    render(<ConditionPanel step={after} steps={[after]} onChange={() => {}} onRemove={() => {}} />);
    expect(screen.getByText(/no question on an earlier step/i)).toBeInTheDocument();
  });

  it("ticks a second choice into the condition", () => {
    const onChange = jest.fn();
    render(<ConditionPanel step={after} steps={[asks, after]} onChange={onChange} onRemove={() => {}} />);
    fireEvent.click(screen.getByLabelText("Derbyshire County"));
    expect((onChange.mock.calls[0][0] as EditorStep).showIf).toEqual([{ branch: "q1", is: ["c1", "c2"] }]);
  });

  it("lists only earlier questions in the picker", () => {
    render(<ConditionPanel step={after} steps={[asks, after]} onChange={() => {}} onRemove={() => {}} />);
    expect(screen.getByRole("option", { name: /Which area\? \(on Ask\)/ })).toBeInTheDocument();
  });
});

describe("BranchPicker messages", () => {
  const withMessage: BranchBlock = {
    id: "q1",
    question: "S117?",
    choices: [
      { id: "a", label: "Entitled", explain: "S117 pathway.\nA meeting is needed.", explainTone: "caution" },
      { id: "b", label: "Not entitled", explain: "Standard pathway." },
      { id: "c", label: "Unsure" },
    ],
  };

  it("shows nothing until a choice with a message is picked", () => {
    render(<BranchPicker branch={withMessage} answer={undefined} onAnswer={() => {}} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("shows the headline and the detail of the picked choice", () => {
    render(<BranchPicker branch={withMessage} answer="a" onAnswer={() => {}} />);
    const box = screen.getByRole("status");
    expect(box).toHaveTextContent("S117 pathway.");
    expect(box).toHaveTextContent("A meeting is needed.");
  });

  it("is amber for caution and grey otherwise", () => {
    const { rerender } = render(<BranchPicker branch={withMessage} answer="a" onAnswer={() => {}} />);
    expect(screen.getByRole("status")).toHaveClass("bg-amber-50");
    rerender(<BranchPicker branch={withMessage} answer="b" onAnswer={() => {}} />);
    expect(screen.getByRole("status")).toHaveClass("bg-gray-50");
  });

  it("shows no message for a choice without one", () => {
    render(<BranchPicker branch={withMessage} answer="c" onAnswer={() => {}} />);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("hides the question line but keeps the group labelled", () => {
    render(<BranchPicker branch={withMessage} answer={undefined} onAnswer={() => {}} hideQuestion />);
    expect(screen.queryByText("S117?", { selector: "p" })).not.toBeInTheDocument();
    expect(screen.getByRole("radiogroup", { name: "S117?" })).toBeInTheDocument();
  });
});

describe("QuestionPanel messages", () => {
  it("takes a message for a choice", () => {
    const onChange = jest.fn();
    render(<QuestionPanel branch={area} onChange={onChange} onRemove={() => {}} dependants={0} onInsertToken={() => {}} />);
    fireEvent.change(screen.getAllByLabelText(/Message shown once this is picked/)[0], { target: { value: "Heads up." } });
    const next = onChange.mock.calls[0][0] as BranchBlock;
    expect(next.choices[0].explain).toBe("Heads up.");
  });

  it("uses the title it is given", () => {
    render(<QuestionPanel title="Another question on this step" branch={area} onChange={() => {}} onRemove={() => {}} dependants={0} onInsertToken={() => {}} />);
    expect(screen.getByRole("heading", { name: "Another question on this step" })).toBeInTheDocument();
  });
});

describe("StepEditor extra questions", () => {
  const step = { id: "s1", title: "Consent", content: "x", branch: area } as EditorStep;
  const renderStep = (s: EditorStep, onChange = jest.fn()) => {
    render(
      <ol>
        <StepEditor
          step={s}
          index={0}
          steps={[s]}
          kind="guide"
          open
          onToggle={() => {}}
          onChange={onChange}
          onMove={() => {}}
          onDuplicate={() => {}}
          onDelete={() => {}}
          onInsertToken={() => {}}
        />
      </ol>
    );
    return onChange;
  };

  it("offers to ask another question once there is a first one", () => {
    const onChange = renderStep(step);
    fireEvent.click(screen.getByRole("button", { name: "Ask another question on this step" }));
    const next = onChange.mock.calls[0][0] as EditorStep;
    expect(next.alsoAsk).toHaveLength(1);
  });

  it("does not offer it on a step with no question", () => {
    renderStep({ id: "s1", title: "Plain", content: "x" } as EditorStep);
    expect(screen.queryByRole("button", { name: "Ask another question on this step" })).not.toBeInTheDocument();
  });

  it("shows each further question in its own panel", () => {
    renderStep({ ...step, alsoAsk: [{ id: "q2", question: "Told?", choices: [{ id: "yes", label: "Yes" }, { id: "no", label: "No" }] }] } as EditorStep);
    expect(screen.getAllByRole("heading", { name: /question/i })).toHaveLength(2);
  });
});
