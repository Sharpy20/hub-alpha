// Shared FAQ pool for the three staff-life pay guides (payslip / roster /
// leave-absence). One place to edit; each question appears in the FAQ step of
// every guide it is tagged with, so cross-topic questions (bank shifts,
// owed hours, bank-holiday sickness) surface everywhere they are relevant.

export type PayFaqTopic = "payslip" | "roster" | "leave";

export interface PayFaqItem {
  q: string;
  a: string;
  topics: PayFaqTopic[];
}

export const PAY_FAQ: PayFaqItem[] = [
  {
    q: "Why is my net pay different from last month?",
    a: "Usually different enhancements worked, an arrears payment, a tax adjustment or a pension tier change. Compare against last month's payslip before assuming an error.",
    topics: ["payslip"],
  },
  {
    q: "My tax looks too high - will it fix itself?",
    a: "Often yes, over a month or two - the year-to-date figures show whether it actually has. A wrong tax CODE will not fix itself: contact HMRC.",
    topics: ["payslip"],
  },
  {
    q: "Why does my payslip show extra HOURS instead of a higher rate?",
    a: "That is how ESR pays enhancements: the percentage becomes extra paid hours at your normal rate. The money is the same - it just looks different on paper.",
    topics: ["payslip"],
  },
  {
    q: "I think I have been overpaid - should I say anything?",
    a: "Yes, straight away. The Trust can reclaim overpayments, and a correction caught in month one is small; left for six months, you are paying back six months' worth.",
    topics: ["payslip", "roster"],
  },
  {
    q: "Are bank shifts overtime?",
    a: "No. Overtime is extra hours on your main contract at time and a half. A bank shift is a separate assignment paid at the band rate plus any unsocial enhancement for when it falls - usually less per hour than overtime, but more flexible, and it never reduces hours you owe on your roster.",
    topics: ["payslip", "roster"],
  },
  {
    q: "Why do I owe hours when I am always at work?",
    a: "Overtime and bank shifts are paid separately and do not count towards contracted hours - so extra shifts can sit alongside owed hours. Check the balance itself, not how busy you feel.",
    topics: ["roster", "payslip"],
  },
  {
    q: "The roster gave me a warning - am I in trouble?",
    a: "No. Warnings are wellbeing prompts about rest, consecutive shifts or average hours - the pattern should be looked at, nothing more.",
    topics: ["roster", "leave"],
  },
  {
    q: "My balance changed and I do not know why.",
    a: "Usually an amended shift, added leave or sickness, a bank or overtime shift, or a contract change part-way through a roster week. Ask your roster lead to walk through it - it is all logged.",
    topics: ["roster"],
  },
  {
    q: "Can TOIL be taken back off me?",
    a: "If the balance came from a roster input error and the error is found after you have taken the time, you can be asked to work it back. Query anything odd BEFORE using the time.",
    topics: ["roster"],
  },
  {
    q: "I was off sick on a bank holiday - why has my leave balance dropped?",
    a: "Sickness pay is unaffected, but you do not build up public holiday hours for a day you were off sick - if those hours are part of your leave allowance, they come off. It can take a pay period or two to show in Loop.",
    topics: ["leave", "roster"],
  },
  {
    q: "Can I agree to less than 11 hours' rest if I want the shifts?",
    a: "No. Unlike the 48-hour average week, daily rest cannot be opted out of. Short rest is only lawful for genuine service needs, with compensatory rest given back afterwards.",
    topics: ["leave", "roster"],
  },
  {
    q: "Does my commute count as rest?",
    a: "No. The 11 hours run from going off duty to coming back on - but rest is supposed to be usable rest, so a long commute either side is worth mentioning when a pattern is reviewed.",
    topics: ["leave"],
  },
  {
    q: "How many days' carers or bereavement leave do I get?",
    a: "From the Trust Special Leave Policy: bereavement is 5 days paid (up to 2 weeks in some circumstances); domestic emergencies are up to 10 days paid in a rolling year; carers leave adds one week unpaid on top; end-of-life care for a dependant can be up to 6 weeks paid. All pro rata, agreed with your manager and recorded in the Absence Manager App.",
    topics: ["leave"],
  },
  {
    q: "Do bank shifts count towards the 48-hour average?",
    a: "Yes - working time adds up across all your NHS work. If you regularly work bank shifts on top of full-time hours, keep an eye on your rolling average.",
    topics: ["leave", "payslip"],
  },
  {
    q: "I was sick during my annual leave - do I lose the leave?",
    a: "Not necessarily. With your manager's agreement the leave can be reclaimed and taken another time - a fit note is needed if the sickness lasted more than 7 days.",
    topics: ["leave"],
  },
  {
    q: "Can I have paid time off for a GP or dental appointment?",
    a: "Routine appointments for yourself are in your own time - arrange a shift change or work the time back. A dependant's hospital appointment is different and can come under paid domestic leave.",
    topics: ["leave"],
  },
];
