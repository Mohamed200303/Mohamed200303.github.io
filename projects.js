/* ==========================================================================
   YOUR PROJECTS
   This is the only file you need to edit to add, change or remove a project.
   The site builds the cards, the case-study popups and the ⌘K menu from it.

   HOW TO ADD A PROJECT (full guide in README.md, "Add a project"):
   1. Copy the TEMPLATE block at the bottom of this file (everything between
      the two "copy from here" lines).
   2. Paste it inside the list below, after the last project's closing "},".
   3. Fill in the text between the quotes. Delete any line you don't need.
   4. Save, refresh the page, check it looks right.

   RULES THAT PREVENT ERRORS
   - Every block ends with "}," (a closing brace and a comma).
   - Text goes inside quotes: 'like this'. If your text needs an apostrophe,
     use double quotes instead: "it's fine".
   - The order here is the order on the page. Put your best project first.
   ========================================================================== */

window.PROJECTS = [

  {
    id: 'portfolio',                 // short name for links: lowercase letters, numbers, dashes
    title: 'This website',
    status: 'live',                  // 'live', 'building', 'finished' or 'draft'
    type: 'Web',
    role: 'Solo',
    featured: true,                  // true = shown big at the top. Only one project should have this.
    summary: 'A portfolio that behaves like its subject: a neural network that trains in front of you.',
    tags: ['JavaScript', 'Canvas', 'CSS', 'GitHub API'],
    visual: 'browser',               // picture on the card: 'browser', 'modules', or leave '' for an automatic one
    image: '',                       // or a screenshot instead, e.g. 'assets/projects/my-project.png'
    links: [
      { label: 'View the code', url: 'https://github.com/Mohamed200303/Mohamed200303.github.io' }
    ],
    caseStudy: {
      intro: 'Most portfolios look the same. This one should be remembered after thirty seconds, by anyone, in any field.',
      facts: [
        ['Stack', 'HTML, CSS, JavaScript'],
        ['Frameworks', 'None'],
        ['Build step', 'None']
      ],
      sections: [
        { heading: 'The idea', text: 'The hero is a small neural network. Its weights start random, the loss falls, and a click perturbs the weights so you can watch it learn again. The model card beside it updates live.' },
        { heading: 'How it works', points: [
          '26 neurons and 127 weighted connections, projected into 3D by hand onto a 2D canvas.',
          'Forward passes travel as signals; positive and negative weights get different colours.',
          'A ⌘K command palette, light and dark themes, and live stats from the GitHub API.',
          'Pauses when off-screen and respects reduced-motion settings.'
        ] },
        { heading: 'The constraint', text: "No framework meant every effect had to earn its kilobytes. All the site's code together weighs less than a typical hero image." }
      ]
    }
  },

  {
    id: 'studentos',
    title: 'StudentOS',
    status: 'building',
    stage: 'Plan',                   // only for 'building': 'Plan', 'Build' or 'Launch'
    type: 'Web app',
    role: 'Solo',
    featured: false,
    summary: 'One AI-powered app for university life: revision, deadlines and money first, then careers and campus. Version 1 is being built over the winter break.',
    tags: ['Python', 'Flask', 'SQL', 'Claude API'],
    visual: 'modules',
    image: '',
    links: [
      { label: 'Follow on GitHub', url: 'https://github.com/Mohamed200303' }
    ],
    caseStudy: {
      intro: 'Students juggle separate apps for revision, deadlines, money and careers. StudentOS brings them into one place, with AI in every module, built for all university students and designed with international students in mind.',
      facts: [
        ['Status', 'Planning'],
        ['Stack', 'Python, Flask, SQLite'],
        ['Version 1', 'Winter break 2026–27']
      ],
      sections: [
        { heading: 'Version 1: the core', points: [
          'Study: AI turns lecture notes into flashcards and quizzes, and explains any card step by step.',
          'Planner: every deadline and exam in one place, with an AI-made revision timetable.',
          'Money: a weekly budget, bill splitting with flatmates, rent reminders and an AI weekly summary.'
        ] },
        { heading: 'The roadmap', points: [
          'Version 2: chat with your notes, past-paper practice, a degree class predictor, timetable and habits.',
          'Version 3: CV builder, AI interview practice, internship tracker, and an arrival kit for international students.',
          'Version 4: study buddies, shared notes, societies and a textbook marketplace.'
        ] },
        { heading: 'Why I am building it', text: 'I want to build something students actually use every week, and learn full-stack development, databases and applied AI along the way. If it works for students at Nottingham, the plan is to grow it into a startup.' }
      ]
    }
  },

];


/* ---------- TEMPLATE: copy from here ----------

  {
    id: 'my-project',
    title: 'Project name',
    status: 'finished',
    type: 'Web app',
    role: 'Solo',
    featured: false,
    summary: 'One or two sentences: what it does and who it is for.',
    tags: ['Python', 'Flask'],
    visual: '',
    image: '',
    links: [
      { label: 'View the code', url: 'https://github.com/Mohamed200303/my-project' },
      { label: 'Try it', url: 'https://example.com' }
    ],
    caseStudy: {
      intro: 'The problem in one or two sentences.',
      facts: [
        ['Built in', '3 weeks'],
        ['Stack', 'Python, Flask, SQLite']
      ],
      sections: [
        { heading: 'The problem', text: 'Why this needed to exist.' },
        { heading: 'How I built it', points: [
          'First important step or decision.',
          'Second one.'
        ] },
        { heading: 'What I learned', text: 'The most useful lesson, in plain words.' }
      ]
    }
  },

   ---------- copy to here ---------- */
