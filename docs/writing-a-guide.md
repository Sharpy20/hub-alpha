# Writing a guide in the editor

For anyone who knows a topic well and wants to put it on wardHub in their own words. The editor is at
`/admin/guides`. You need editor or admin permissions.

Guides you save are kept in your browser until the shared store is connected. Download a copy if you
want to keep one.

## Start

1. Open **Guide editor**, type a title, choose **Read-through guide** or **Referral**, and press
   **Create guide**.
2. A read-through guide starts with one step. A referral starts with the standard steps: criteria,
   forms, where to send it, case note, diary reminder, data protection.
3. Every change saves straight away. Use **View guide** to see it the way a reader will.

## A step

Each step is a title and some text. That is all you have to fill in.

- Start a line with `-` for a bullet.
- Leave a blank line between paragraphs.
- `[#1]` adds a numbered reference marker (see References below).

Under **Add to this step** you switch on only what the step needs:

| Switch | What it gives the reader |
|---|---|
| Question | A choice they make on this step. Later steps can depend on it. |
| Only show if | This step appears only for certain answers. |
| In a hurry | A one-line summary above the step. |
| Tip | A highlighted tip under the step. |
| Collapsible sections | Short lines ending in a colon become headings that open and close. |
| Diary jobs | A task list the reader can put into the ward diary. |

## Branching

Say you want City and County readers to see different steps, then meet again.

1. On the step where they choose, switch on **Question**. Start from *Derby City or Derbyshire
   County*, or type your own choices.
2. On the City-only step, switch on **Only show if** and tick *Derby City*.
3. On the County-only step, do the same and tick *Derbyshire County*.
4. Leave the steps after that alone. A step with no condition shows for everyone, so the two routes
   meet again by themselves.

A step can only depend on a question that comes **before** it. If you move a question below the steps
that depend on it, the checks say so.

To write the answer into the case note, use the question's own token, for example `[BRANCH:q1]`. The
**Add it to the case note** button on the question puts it in for you.

## The whole guide

Under **Around the whole guide**:

- **Case note at the end:** the standard sentence, your own wording, or none.
- **Related guides, Printable forms, FOCUS links, References:** switch on the ones you need.

## Checks

The **Checks** panel at the bottom lists problems and every route through the guide. Read the routes.
If you meant two, and it says three, a condition is wrong.

Errors are things that would break the guide, such as a step waiting on a question that does not
exist. Warnings are worth a look but not fatal, such as a step with no text.

## Editing a built-in guide

Choose **Edit a copy**. Your copy replaces the built-in guide for you, and only in your browser. The
built-in version is never changed. **Put the built-in back** removes your copy.

## What the editor does not do

- It does not check clinical content. Every guide still goes through the usual sign-off.
- Interactive tools (risk, care plan, the checkers) are separate screens and are not edited here.
- The payslip and shift widgets can be kept on a copy but not added to a new guide.
- Contacts that are not public should read *Hidden in demo mode*. Never paste an internal number in.
