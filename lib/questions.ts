export interface Question {
  id: number
  question: string
  options: { label: string; text: string }[]
  correctAnswer: string
  category: string
  explanation: string
}

export const allQuestions: Question[] = [
  {
    id: 1,
    question: "What is the primary goal of the Toyota Production System (TPS)?",
    options: [
      { label: "A", text: "Maximise production output at all costs" },
      { label: "B", text: "Eliminate waste while delivering value to the customer" },
      { label: "C", text: "Reduce the number of employees on the production floor" },
      { label: "D", text: "Increase machine utilisation above 95%" }
    ],
    correctAnswer: "B",
    category: "TPS Fundamentals",
    explanation: "TPS focuses on eliminating all forms of waste (muda) while ensuring value flows to the customer efficiently and reliably."
  },
  {
    id: 2,
    question: "Which of the following best describes *Muda* in Lean thinking?",
    options: [
      { label: "A", text: "A Japanese word for continuous improvement" },
      { label: "B", text: "Any activity that consumes resources but creates no value for the customer" },
      { label: "C", text: "A method for scheduling production" },
      { label: "D", text: "The process of standardising work instructions" }
    ],
    correctAnswer: "B",
    category: "Waste Elimination",
    explanation: "Muda means waste — any activity that uses resources without adding customer value. There are 8 types: transport, inventory, motion, waiting, overproduction, over-processing, defects, and unused talent."
  },
  {
    id: 3,
    question: "What are the two main pillars of the Toyota Production System?",
    options: [
      { label: "A", text: "Kaizen and 5S" },
      { label: "B", text: "Just-In-Time and Jidoka" },
      { label: "C", text: "Heijunka and Kanban" },
      { label: "D", text: "Takt time and Standard Work" }
    ],
    correctAnswer: "B",
    category: "TPS Fundamentals",
    explanation: "The two pillars of TPS are Just-In-Time (producing only what is needed, when needed) and Jidoka (automation with a human touch — stopping when a defect occurs)."
  },
  {
    id: 4,
    question: "What does *Jidoka* mean in the context of TPS?",
    options: [
      { label: "A", text: "Continuous flow production without any stops" },
      { label: "B", text: "Automation that detects abnormalities and stops to prevent defects from passing downstream" },
      { label: "C", text: "A scheduling technique for levelling production" },
      { label: "D", text: "The process of employee empowerment through training" }
    ],
    correctAnswer: "B",
    category: "TPS Fundamentals",
    explanation: "Jidoka gives machines and operators the ability to detect abnormal conditions and stop immediately, preventing defects from being passed to the next process."
  },
  {
    id: 5,
    question: "Value Stream Mapping (VSM) is used primarily to:",
    options: [
      { label: "A", text: "Map the organisation's reporting structure" },
      { label: "B", text: "Visualise the flow of material and information to identify waste and improvement opportunities" },
      { label: "C", text: "Create a financial budget for improvement projects" },
      { label: "D", text: "Document employee performance metrics" }
    ],
    correctAnswer: "B",
    category: "Value Stream Mapping",
    explanation: "VSM is a Lean tool that maps the entire flow of materials and information to reveal waste, delays, and improvement opportunities across the value stream."
  },
  {
    id: 6,
    question: "Takt time is best defined as:",
    options: [
      { label: "A", text: "The time it takes to complete one unit from start to finish" },
      { label: "B", text: "The rate at which customers demand a product — available production time divided by customer demand" },
      { label: "C", text: "The total machine downtime in a production period" },
      { label: "D", text: "The time spent on value-added activities only" }
    ],
    correctAnswer: "B",
    category: "TPS Fundamentals",
    explanation: "Takt time sets the production rhythm to match customer demand. Formula: Available production time / Customer demand per period."
  },
  {
    id: 7,
    question: "What does *Kaizen* mean?",
    options: [
      { label: "A", text: "Radical, top-down organisational restructuring" },
      { label: "B", text: "Continuous improvement through small, incremental changes involving everyone" },
      { label: "C", text: "A tool for measuring customer satisfaction" },
      { label: "D", text: "A production scheduling system" }
    ],
    correctAnswer: "B",
    category: "Continuous Improvement",
    explanation: "Kaizen (Kai = change, Zen = good) means continuous improvement. It involves everyone — from senior leadership to frontline workers — making small, ongoing improvements."
  },
  {
    id: 8,
    question: "In a Kanban system, what does a Kanban card signal?",
    options: [
      { label: "A", text: "A quality defect has been detected" },
      { label: "B", text: "An authorisation to produce or move a specific quantity of material" },
      { label: "C", text: "An employee has completed their shift" },
      { label: "D", text: "A machine requires maintenance" }
    ],
    correctAnswer: "B",
    category: "Pull Systems",
    explanation: "Kanban cards are visual signals that authorise production or replenishment of a specific quantity. They ensure production is driven by actual consumption (pull), not forecasts (push)."
  },
  {
    id: 9,
    question: "Which of the 8 wastes involves producing more than what the customer currently needs?",
    options: [
      { label: "A", text: "Over-processing" },
      { label: "B", text: "Waiting" },
      { label: "C", text: "Overproduction" },
      { label: "D", text: "Excess inventory" }
    ],
    correctAnswer: "C",
    category: "Waste Elimination",
    explanation: "Overproduction is considered the worst waste in TPS because it causes or hides all other wastes — creating unnecessary inventory, transport, and storage costs."
  },
  {
    id: 10,
    question: "What is the purpose of 5S in a Lean workplace?",
    options: [
      { label: "A", text: "To define the five stages of a Kaizen event" },
      { label: "B", text: "To create a clean, organised, and standardised workplace that supports efficiency and safety" },
      { label: "C", text: "To set production targets for five different product lines" },
      { label: "D", text: "To outline the five steps of the PDCA cycle" }
    ],
    correctAnswer: "B",
    category: "Workplace Organisation",
    explanation: "5S (Sort, Set in Order, Shine, Standardise, Sustain) creates an organised workplace where everything has a place, abnormalities are visible, and waste is minimised."
  },
  {
    id: 11,
    question: "What does *Heijunka* refer to in Lean production?",
    options: [
      { label: "A", text: "A technique for identifying root causes of problems" },
      { label: "B", text: "Production levelling — smoothing the mix and volume of production over time" },
      { label: "C", text: "A visual management board for tracking defects" },
      { label: "D", text: "A method for cross-training employees" }
    ],
    correctAnswer: "B",
    category: "TPS Fundamentals",
    explanation: "Heijunka (production levelling) smooths out production volume and mix to reduce unevenness (Mura), avoid overburden (Muri), and enable efficient use of resources."
  },
  {
    id: 12,
    question: "The PDCA cycle stands for:",
    options: [
      { label: "A", text: "Plan, Deploy, Control, Assess" },
      { label: "B", text: "Plan, Do, Check, Act" },
      { label: "C", text: "Prepare, Develop, Confirm, Approve" },
      { label: "D", text: "Process, Define, Create, Analyse" }
    ],
    correctAnswer: "B",
    category: "Problem Solving",
    explanation: "PDCA (Plan-Do-Check-Act), also called the Deming Cycle, is the foundation of scientific problem solving and continuous improvement in Lean and TPS."
  },
  {
    id: 13,
    question: "What is the primary purpose of a *Gemba* walk?",
    options: [
      { label: "A", text: "Reviewing financial reports in the boardroom" },
      { label: "B", text: "Going to the actual workplace to observe processes, understand problems, and engage with employees" },
      { label: "C", text: "Conducting customer satisfaction surveys" },
      { label: "D", text: "Performing an annual safety audit" }
    ],
    correctAnswer: "B",
    category: "Lean Leadership",
    explanation: "Gemba means 'the real place' in Japanese. Gemba walks involve leaders going to where value is created to observe, learn, and support problem-solving — not to manage from a distance."
  },
  {
    id: 14,
    question: "Which problem-solving technique asks 'Why?' five times to find the root cause?",
    options: [
      { label: "A", text: "FMEA (Failure Mode and Effects Analysis)" },
      { label: "B", text: "Pareto Analysis" },
      { label: "C", text: "5 Whys" },
      { label: "D", text: "Fishbone Diagram" }
    ],
    correctAnswer: "C",
    category: "Problem Solving",
    explanation: "The 5 Whys technique, developed by Sakichi Toyoda, involves asking 'why' repeatedly to drill past symptoms to the true root cause of a problem."
  },
  {
    id: 15,
    question: "In Lean, *Standard Work* is best described as:",
    options: [
      { label: "A", text: "A rigid set of rules that employees must never deviate from" },
      { label: "B", text: "The currently agreed best method for performing a task, used as the baseline for improvement" },
      { label: "C", text: "A document that describes the history of a manufacturing process" },
      { label: "D", text: "An industry benchmark set by external auditors" }
    ],
    correctAnswer: "B",
    category: "Standard Work",
    explanation: "Standard work captures the current best-known method and provides the baseline for Kaizen. It is not permanent — it should be continuously improved."
  },
  {
    id: 16,
    question: "What is the concept of *flow* in Lean production?",
    options: [
      { label: "A", text: "Producing large batches to reduce setup time" },
      { label: "B", text: "Moving products continuously through the value stream without interruption or accumulation" },
      { label: "C", text: "Using a push scheduling system based on forecasts" },
      { label: "D", text: "Assigning workers to fixed workstations permanently" }
    ],
    correctAnswer: "B",
    category: "Flow",
    explanation: "Flow means products move continuously from one value-added step to the next without stopping, batching, or queuing. It reduces lead time and exposes problems."
  },
  {
    id: 17,
    question: "A *pull system* in Lean means:",
    options: [
      { label: "A", text: "Production is pushed according to a master schedule based on forecasts" },
      { label: "B", text: "Downstream processes signal upstream processes to produce only what is needed, when it is needed" },
      { label: "C", text: "Managers pull employees away from their work for meetings" },
      { label: "D", text: "Sales teams pull orders from customers in advance" }
    ],
    correctAnswer: "B",
    category: "Pull Systems",
    explanation: "In a pull system, actual downstream consumption triggers upstream production. This prevents overproduction and ensures work is done based on real demand."
  },
  {
    id: 18,
    question: "What does OEE (Overall Equipment Effectiveness) measure?",
    options: [
      { label: "A", text: "The number of operators required to run a machine" },
      { label: "B", text: "The productivity of equipment based on availability, performance, and quality" },
      { label: "C", text: "The cost of maintaining equipment over its lifetime" },
      { label: "D", text: "The energy consumption of manufacturing equipment" }
    ],
    correctAnswer: "B",
    category: "Performance Metrics",
    explanation: "OEE = Availability x Performance x Quality. It is the gold standard for measuring manufacturing productivity, with world-class OEE considered to be around 85%."
  },
  {
    id: 19,
    question: "What is the main difference between *Mura* and *Muri* in the 3M model?",
    options: [
      { label: "A", text: "Mura is defects; Muri is waiting time" },
      { label: "B", text: "Mura is unevenness/variability; Muri is overburden/unreasonable demands on people or equipment" },
      { label: "C", text: "Mura is transport waste; Muri is motion waste" },
      { label: "D", text: "Mura refers to employees; Muri refers to machines" }
    ],
    correctAnswer: "B",
    category: "Waste Elimination",
    explanation: "The 3Ms are Muda (waste), Mura (unevenness/variation), and Muri (overburden). Eliminating all three is essential for a stable, efficient Lean system."
  },
  {
    id: 20,
    question: "In a Value Stream Map, what does a 'push arrow' indicate?",
    options: [
      { label: "A", text: "Material is being pulled based on actual customer demand" },
      { label: "B", text: "Material is being pushed to the next step based on a schedule, regardless of downstream need" },
      { label: "C", text: "A Kaizen improvement opportunity has been identified" },
      { label: "D", text: "A finished goods shipment to the customer" }
    ],
    correctAnswer: "B",
    category: "Value Stream Mapping",
    explanation: "A push arrow in VSM shows that material is moved or produced based on a forecast or schedule, not on actual demand — a common source of overproduction and excess inventory."
  },
  {
    id: 21,
    question: "What is the purpose of *Poka-Yoke* (mistake-proofing)?",
    options: [
      { label: "A", text: "To train employees to catch errors during inspection" },
      { label: "B", text: "To design processes or devices so that errors are prevented or immediately detected before they cause defects" },
      { label: "C", text: "To create a punishment system for quality failures" },
      { label: "D", text: "To measure the defect rate per million opportunities" }
    ],
    correctAnswer: "B",
    category: "Quality",
    explanation: "Poka-Yoke (error-proofing) uses physical or procedural mechanisms to prevent mistakes from occurring or ensure they are caught immediately, making it impossible to produce defects."
  },
  {
    id: 22,
    question: "What does 'Lead Time' measure in a Lean context?",
    options: [
      { label: "A", text: "Only the time spent on value-added processing steps" },
      { label: "B", text: "The total elapsed time from when a customer places an order to when they receive it" },
      { label: "C", text: "The time a manager spends leading a team meeting" },
      { label: "D", text: "The time required to train a new employee" }
    ],
    correctAnswer: "B",
    category: "Flow",
    explanation: "Lead time is the total elapsed time from order to delivery, including all waiting, transport, and processing. Lean aims to reduce lead time by eliminating non-value-added time."
  },
  {
    id: 23,
    question: "TPM (Total Productive Maintenance) focuses on:",
    options: [
      { label: "A", text: "Outsourcing all equipment maintenance to specialist contractors" },
      { label: "B", text: "Maximising equipment effectiveness by involving operators in maintenance and preventing breakdowns" },
      { label: "C", text: "Repairing machines only after they break down" },
      { label: "D", text: "Replacing equipment on a fixed annual schedule" }
    ],
    correctAnswer: "B",
    category: "TPM",
    explanation: "TPM engages operators in routine maintenance and uses proactive/preventive approaches to eliminate equipment losses, breakdowns, and defects at their source."
  },
  {
    id: 24,
    question: "A Kaizen event (or Kaizen blitz) is:",
    options: [
      { label: "A", text: "A long-term, 12-month improvement project led by consultants" },
      { label: "B", text: "An intensive, focused improvement workshop (typically 3-5 days) targeting a specific process" },
      { label: "C", text: "An annual performance review for frontline employees" },
      { label: "D", text: "A crisis response process for major equipment failures" }
    ],
    correctAnswer: "B",
    category: "Continuous Improvement",
    explanation: "A Kaizen event brings a cross-functional team together for 3-5 days to rapidly analyse, improve, and implement changes in a specific process area."
  },
  {
    id: 25,
    question: "What is the role of *visual management* in a Lean organisation?",
    options: [
      { label: "A", text: "To decorate the workplace with motivational posters" },
      { label: "B", text: "To make the status, performance, and abnormalities of a process immediately visible to everyone" },
      { label: "C", text: "To track executive KPIs in a private management dashboard" },
      { label: "D", text: "To display employee attendance records" }
    ],
    correctAnswer: "B",
    category: "Visual Management",
    explanation: "Visual management makes the standard and actual condition visible at a glance, so abnormalities are immediately apparent and corrective action can be taken quickly."
  },
  {
    id: 26,
    question: "In Lean, what is a 'supermarket' (in the context of inventory)?",
    options: [
      { label: "A", text: "A retail store used as a benchmarking example" },
      { label: "B", text: "A controlled inventory buffer where items are replenished based on what is consumed downstream" },
      { label: "C", text: "A warehouse that stores large quantities of finished goods" },
      { label: "D", text: "A supplier managed inventory system" }
    ],
    correctAnswer: "B",
    category: "Pull Systems",
    explanation: "A supermarket in Lean is a controlled inventory location where downstream processes take what they need, and upstream processes replenish only what was consumed — enabling pull."
  },
  {
    id: 27,
    question: "What does the term 'single-piece flow' (or one-piece flow) mean?",
    options: [
      { label: "A", text: "Producing one large batch at a time" },
      { label: "B", text: "Processing one item at a time and moving it immediately to the next step, without batching or waiting" },
      { label: "C", text: "Having a single employee perform all tasks in a process" },
      { label: "D", text: "Offering a single product line to simplify production" }
    ],
    correctAnswer: "B",
    category: "Flow",
    explanation: "One-piece flow minimises WIP (work in progress), reduces lead time, exposes problems immediately, and improves quality by ensuring each unit is inspected before moving to the next step."
  },
  {
    id: 28,
    question: "What is an A3 report used for in Lean problem solving?",
    options: [
      { label: "A", text: "Printing production schedules on A3-size paper" },
      { label: "B", text: "A structured one-page problem-solving and communication tool that captures the full PDCA thinking process" },
      { label: "C", text: "A financial summary for senior management" },
      { label: "D", text: "A checklist for conducting 5S audits" }
    ],
    correctAnswer: "B",
    category: "Problem Solving",
    explanation: "An A3 report (named for the A3 paper size) is a concise, structured document used in Toyota and Lean organisations to communicate problem background, analysis, countermeasures, and results."
  },
  {
    id: 29,
    question: "Which of the following is NOT one of the 8 wastes (DOWNTIME) in Lean?",
    options: [
      { label: "A", text: "Defects" },
      { label: "B", text: "Overproduction" },
      { label: "C", text: "Training" },
      { label: "D", text: "Non-utilised talent" }
    ],
    correctAnswer: "C",
    category: "Waste Elimination",
    explanation: "The 8 wastes are: Defects, Overproduction, Waiting, Non-utilised talent, Transport, Inventory, Motion, Extra-processing (DOWNTIME). Training is not a waste — it develops capability."
  },
  {
    id: 30,
    question: "What is *Andon* in a Lean/TPS environment?",
    options: [
      { label: "A", text: "A Japanese word for the production schedule" },
      { label: "B", text: "A visual signal (light or board) that alerts the team to a problem requiring immediate attention" },
      { label: "C", text: "A type of Kanban card used for raw materials" },
      { label: "D", text: "A daily shift handover meeting" }
    ],
    correctAnswer: "B",
    category: "Visual Management",
    explanation: "Andon is a visual alert system — lights, boards, or alarms — that signals when a process abnormality occurs, enabling swift team response and supporting Jidoka."
  },
  {
    id: 31,
    question: "In Lean, 'value' is defined by:",
    options: [
      { label: "A", text: "The cost of production" },
      { label: "B", text: "The customer — anything the customer is willing to pay for" },
      { label: "C", text: "The financial return on investment" },
      { label: "D", text: "The production manager's assessment of quality" }
    ],
    correctAnswer: "B",
    category: "Lean Principles",
    explanation: "In Lean thinking, value is always defined by the customer. Any activity the customer would not willingly pay for is potentially waste, unless it is a necessary support activity."
  },
  {
    id: 32,
    question: "What is the key difference between a 'current state' and 'future state' Value Stream Map?",
    options: [
      { label: "A", text: "The current state shows customer data; the future state shows supplier data" },
      { label: "B", text: "The current state documents how the process works today; the future state shows how it should work after improvements are made" },
      { label: "C", text: "The current state is drawn by managers; the future state is drawn by operators" },
      { label: "D", text: "The current state measures cost; the future state measures quality" }
    ],
    correctAnswer: "B",
    category: "Value Stream Mapping",
    explanation: "VSM starts with a current state map to expose waste and then creates a future state map as the improvement vision, which becomes the implementation plan."
  },
  {
    id: 33,
    question: "What is the purpose of *cycle time* measurement in a production process?",
    options: [
      { label: "A", text: "To measure how long a machine has been running since its last service" },
      { label: "B", text: "To measure the time to complete one unit at a specific process step, used to balance workload and compare to takt time" },
      { label: "C", text: "To track the number of production cycles per shift" },
      { label: "D", text: "To calculate the financial return on capital investment" }
    ],
    correctAnswer: "B",
    category: "Flow",
    explanation: "Cycle time is the elapsed time for one unit at a single process step. Comparing cycle time to takt time reveals bottlenecks and enables workload balancing (line balancing)."
  },
  {
    id: 34,
    question: "Which Lean principle focuses on identifying and delivering exactly what the customer wants?",
    options: [
      { label: "A", text: "Pull" },
      { label: "B", text: "Flow" },
      { label: "C", text: "Specify Value" },
      { label: "D", text: "Perfection" }
    ],
    correctAnswer: "C",
    category: "Lean Principles",
    explanation: "The first of Womack and Jones' five Lean principles is 'Specify Value' — defining what the customer truly values is the starting point for eliminating everything else."
  },
  {
    id: 35,
    question: "What is the significance of *Nemawashi* in a Lean culture?",
    options: [
      { label: "A", text: "A fast decision-making process used in crisis situations" },
      { label: "B", text: "The practice of carefully building consensus and sharing information before making a major decision" },
      { label: "C", text: "A type of visual management board" },
      { label: "D", text: "A method for calculating return on improvement investments" }
    ],
    correctAnswer: "B",
    category: "Lean Leadership",
    explanation: "Nemawashi (literally 'going around the roots') is a Japanese consensus-building process where an idea is shared with all stakeholders before a formal decision is made, ensuring alignment and smooth implementation."
  },
  {
    id: 36,
    question: "What does SMED stand for and what is its purpose?",
    options: [
      { label: "A", text: "Standard Method for Equipment Diagnostics — used to assess machine health" },
      { label: "B", text: "Single-Minute Exchange of Die — a technique to reduce changeover/setup time to under 10 minutes" },
      { label: "C", text: "Systematic Manufacturing Excellence Design — a framework for factory layout" },
      { label: "D", text: "Sequential Machine Error Detection — a quality control process" }
    ],
    correctAnswer: "B",
    category: "Flow",
    explanation: "SMED (Single-Minute Exchange of Die) is a technique developed by Shigeo Shingo to dramatically reduce changeover times, enabling smaller batch sizes and greater flexibility."
  },
  {
    id: 37,
    question: "Which of the following best describes *Hoshin Kanri*?",
    options: [
      { label: "A", text: "A daily stand-up meeting format" },
      { label: "B", text: "A strategic policy deployment method that aligns the entire organisation's activities with a few critical long-term objectives" },
      { label: "C", text: "A tool for mapping customer journey processes" },
      { label: "D", text: "A technique for reducing defects to zero" }
    ],
    correctAnswer: "B",
    category: "Lean Leadership",
    explanation: "Hoshin Kanri (Policy Deployment) is a strategic planning method used to focus improvement efforts across the organisation, cascading from top-level objectives to frontline actions through a catch-ball process."
  },
  {
    id: 38,
    question: "In a 5S implementation, what does the 'Sustain' step involve?",
    options: [
      { label: "A", text: "Removing all unnecessary items from the workplace" },
      { label: "B", text: "Cleaning the workspace thoroughly" },
      { label: "C", text: "Creating habits, discipline, and audit systems to maintain the improvements over time" },
      { label: "D", text: "Setting up visual indicators and labels" }
    ],
    correctAnswer: "C",
    category: "Workplace Organisation",
    explanation: "Sustain (Shitsuke) is the hardest S — it requires embedding discipline through regular audits, leader standard work, and a culture that maintains the new standards."
  },
  {
    id: 39,
    question: "What is the definition of *Work-In-Progress (WIP)* in a Lean context?",
    options: [
      { label: "A", text: "Finished goods waiting to be dispatched to customers" },
      { label: "B", text: "Raw materials stored in the warehouse" },
      { label: "C", text: "Products or items that have started processing but have not yet been completed and delivered to the customer" },
      { label: "D", text: "Employees who are being trained on a new process" }
    ],
    correctAnswer: "C",
    category: "Flow",
    explanation: "WIP represents partially completed work sitting between process steps. High WIP is a symptom of batching, bottlenecks, and poor flow — all targets for Lean improvement."
  },
  {
    id: 40,
    question: "What is the principle behind *Respect for People* in the Toyota Way?",
    options: [
      { label: "A", text: "Providing employees with comfortable break rooms and social events" },
      { label: "B", text: "Treating people as the most important asset, developing their capability, and trusting them to solve problems and improve their work" },
      { label: "C", text: "Ensuring all employees have equal pay regardless of performance" },
      { label: "D", text: "Giving senior managers the final say in all improvement decisions" }
    ],
    correctAnswer: "B",
    category: "Lean Leadership",
    explanation: "The Toyota Way's Respect for People principle means developing people's capabilities, challenging them to grow, giving them responsibility, and trusting them as problem-solvers — not just task-executors."
  },
  {
    id: 41,
    question: "What is the primary benefit of *cross-training* in a Lean environment?",
    options: [
      { label: "A", text: "Reducing the total headcount needed in a team" },
      { label: "B", text: "Creating flexibility to balance workloads, cover absences, and prevent bottlenecks" },
      { label: "C", text: "Simplifying the production scheduling process" },
      { label: "D", text: "Preparing employees for promotion to management" }
    ],
    correctAnswer: "B",
    category: "Standard Work",
    explanation: "Cross-training builds a multi-skilled, flexible workforce (Shojinka) that can shift between tasks to match takt time, cover absenteeism, and prevent bottlenecks."
  },
  {
    id: 42,
    question: "A *bottleneck* in a value stream is best described as:",
    options: [
      { label: "A", text: "A process step with the highest quality defect rate" },
      { label: "B", text: "The process step with the longest cycle time that constrains the overall output of the system" },
      { label: "C", text: "Any process where automation has replaced manual labour" },
      { label: "D", text: "A supplier who frequently delivers late" }
    ],
    correctAnswer: "B",
    category: "Flow",
    explanation: "A bottleneck (constraint) is the step with the longest cycle time — it limits system throughput. In the Theory of Constraints (ToC), improvement must focus on the bottleneck first."
  },
  {
    id: 43,
    question: "In Lean, what is the purpose of *line balancing*?",
    options: [
      { label: "A", text: "Ensuring all employees are paid the same wage" },
      { label: "B", text: "Distributing work evenly across process steps so each step's cycle time is as close as possible to takt time" },
      { label: "C", text: "Equalising the number of defects across all production lines" },
      { label: "D", text: "Balancing the financial budget across different departments" }
    ],
    correctAnswer: "B",
    category: "Flow",
    explanation: "Line balancing aligns each workstation's cycle time to takt time, eliminating idle time and overburden, enabling smooth continuous flow."
  },
  {
    id: 44,
    question: "Which tool would you use to prioritise which defects or problems to address first?",
    options: [
      { label: "A", text: "5S" },
      { label: "B", text: "Pareto Chart (80/20 Rule)" },
      { label: "C", text: "Kanban" },
      { label: "D", text: "SMED" }
    ],
    correctAnswer: "B",
    category: "Problem Solving",
    explanation: "A Pareto Chart ranks problems by frequency or impact, applying the 80/20 rule — typically 80% of problems come from 20% of causes. It helps focus limited improvement resources on the highest-impact issues."
  },
  {
    id: 45,
    question: "What does *Genchi Genbutsu* mean in the Toyota Way?",
    options: [
      { label: "A", text: "Creating detailed plans before going to the production floor" },
      { label: "B", text: "Go and see for yourself — understand the actual situation at the actual place" },
      { label: "C", text: "Delegating all problem-solving to frontline employees" },
      { label: "D", text: "Using data from management information systems to make decisions" }
    ],
    correctAnswer: "B",
    category: "Lean Leadership",
    explanation: "Genchi Genbutsu ('go and see') is a Toyota Way principle emphasising that good decisions must be based on direct observation at the actual place where value is created — not on reports or assumptions."
  },
  {
    id: 46,
    question: "What is the relationship between batch size and lead time in a production system?",
    options: [
      { label: "A", text: "Larger batch sizes always result in shorter lead times" },
      { label: "B", text: "Smaller batch sizes generally reduce lead time, WIP, and the time to detect quality problems" },
      { label: "C", text: "Batch size has no effect on lead time" },
      { label: "D", text: "Lead time is determined only by machine speed, not batch size" }
    ],
    correctAnswer: "B",
    category: "Flow",
    explanation: "Reducing batch size reduces WIP, shortens queue times, and enables faster feedback on quality issues. Moving toward one-piece flow is the ideal in Lean manufacturing."
  },
  {
    id: 47,
    question: "What is the purpose of a *Fishbone Diagram* (Ishikawa Diagram)?",
    options: [
      { label: "A", text: "To map the flow of materials through a factory" },
      { label: "B", text: "To visually identify and categorise the potential causes of a problem or effect" },
      { label: "C", text: "To schedule preventive maintenance activities" },
      { label: "D", text: "To track inventory levels in a supermarket system" }
    ],
    correctAnswer: "B",
    category: "Problem Solving",
    explanation: "The Fishbone (Cause-and-Effect) Diagram helps teams brainstorm and categorise potential causes of a problem (usually under categories like Man, Machine, Method, Material, Measurement, Environment)."
  },
  {
    id: 48,
    question: "What is the key principle behind *Just-In-Time (JIT)* production?",
    options: [
      { label: "A", text: "Producing and delivering the right items, in the right quantity, at the right time — minimising inventory" },
      { label: "B", text: "Producing as fast as possible to maximise machine utilisation" },
      { label: "C", text: "Stocking large quantities to avoid any possibility of running out" },
      { label: "D", text: "Delivering finished goods only at the end of the month" }
    ],
    correctAnswer: "A",
    category: "TPS Fundamentals",
    explanation: "JIT produces only what is needed, when it is needed, in the quantity needed. It is one of the two TPS pillars and reduces inventory, lead time, and waste throughout the supply chain."
  },
  {
    id: 49,
    question: "What does *FIFO* (First-In, First-Out) mean in a Lean context?",
    options: [
      { label: "A", text: "The first employee hired should be the first to be promoted" },
      { label: "B", text: "Material that enters a queue first is processed and moves on first, preventing ageing, degradation, or obsolescence" },
      { label: "C", text: "A financial accounting method for valuing inventory" },
      { label: "D", text: "A priority system for urgent customer orders" }
    ],
    correctAnswer: "B",
    category: "Flow",
    explanation: "FIFO lanes ensure the oldest inventory is used first, preventing items from ageing, becoming obsolete, or losing quality while waiting. It is essential for perishable goods and maintaining flow integrity."
  },
  {
    id: 50,
    question: "In Lean, *leader standard work* refers to:",
    options: [
      { label: "A", text: "Performance targets that all leaders must achieve each quarter" },
      { label: "B", text: "A defined set of daily routines and activities that leaders perform to sustain the Lean management system and develop people" },
      { label: "C", text: "A document describing the minimum skills required to become a team leader" },
      { label: "D", text: "An audit process conducted annually by external assessors" }
    ],
    correctAnswer: "B",
    category: "Lean Leadership",
    explanation: "Leader standard work defines the structured daily activities (Gemba walks, coaching, checking visual controls) that leaders perform to model Lean behaviours and sustain the management system."
  },
  {
    id: 51,
    question: "What is a *Kaikaku* event, and how does it differ from Kaizen?",
    options: [
      { label: "A", text: "Kaikaku is the same as Kaizen — both mean small incremental improvement" },
      { label: "B", text: "Kaikaku refers to radical, breakthrough improvement (transformation), whereas Kaizen refers to continuous, incremental improvement" },
      { label: "C", text: "Kaikaku is a daily improvement routine; Kaizen is a monthly improvement event" },
      { label: "D", text: "Kaikaku applies to service industries; Kaizen applies to manufacturing only" }
    ],
    correctAnswer: "B",
    category: "Continuous Improvement",
    explanation: "Kaikaku means radical change or transformation — a major process redesign. Kaizen means small, continuous, incremental improvement. Both are valuable; Kaikaku resets the baseline for Kaizen to continue."
  },
  {
    id: 52,
    question: "What is the primary purpose of *standardised work-in-process (SWIP)* in Lean?",
    options: [
      { label: "A", text: "To maximise inventory held between process steps" },
      { label: "B", text: "To define the minimum inventory needed to maintain continuous flow and meet takt time" },
      { label: "C", text: "To document all defects found during a production run" },
      { label: "D", text: "To create a master schedule for the production line" }
    ],
    correctAnswer: "B",
    category: "Standard Work",
    explanation: "SWIP is the minimum amount of WIP needed for a process to operate at takt time without stopping. It is determined by process conditions like cooling time, inspection, or curing requirements."
  },
  {
    id: 53,
    question: "What best describes the concept of *Yokoten* in Lean?",
    options: [
      { label: "A", text: "A technique for rapidly changing over production equipment" },
      { label: "B", text: "The practice of horizontally sharing and replicating successful improvements across other areas or departments" },
      { label: "C", text: "A visual indicator board used in daily team meetings" },
      { label: "D", text: "A structured approach to root cause analysis" }
    ],
    correctAnswer: "B",
    category: "Continuous Improvement",
    explanation: "Yokoten means 'across everywhere' — it is the practice of identifying successful improvements and proactively sharing them horizontally across the organisation to avoid solving the same problem twice."
  },
  {
    id: 54,
    question: "What is the role of the *Process Owner* in a value stream improvement initiative?",
    options: [
      { label: "A", text: "To approve budgets for all improvement projects" },
      { label: "B", text: "To be accountable for the end-to-end performance of the value stream and lead its ongoing improvement" },
      { label: "C", text: "To document all current state processes before any changes are made" },
      { label: "D", text: "To enforce compliance with standard operating procedures" }
    ],
    correctAnswer: "B",
    category: "Lean Leadership",
    explanation: "A Value Stream Owner (or Process Owner) is accountable for the performance of the entire end-to-end flow — from customer order to delivery — and leads the continuous improvement of that stream."
  },
  {
    id: 55,
    question: "In Business Process Management (BPM), what is a process model used for?",
    options: [
      { label: "A", text: "Storing historical records of past performance" },
      { label: "B", text: "Creating a visual representation of a process to analyse, communicate, and improve how work is done" },
      { label: "C", text: "Setting financial targets for each department" },
      { label: "D", text: "Tracking individual employee output metrics" }
    ],
    correctAnswer: "B",
    category: "Business Process Management",
    explanation: "A process model (e.g., BPMN diagram) visually represents the sequence of activities, decisions, and flows in a process, enabling teams to analyse, redesign, and improve how work is performed."
  }
]

export function getRandomQuestions(count: number): Question[] {
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, Math.min(count, shuffled.length))
}
