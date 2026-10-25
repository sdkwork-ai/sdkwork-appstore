export const eduExperiment = {
  header: {
    badge: 'Education Experiment Evaluation',
    title: 'Education Experiment Apps',
    subtitle: 'Multi-spec education-experiment evaluation apps: one evaluation covering K12, university and professional experiment tasks, organized by stage and subject, each AI spec rated and reviewed separately.'
  },
  filters: {
    all: 'All',
    stageLabel: 'Stage',
    k12Label: 'K12 stage',
    allStages: 'All K12',
    subjectLabel: 'Subject',
    allSubjects: 'All subjects'
  },
  stageGroups: {
    k12: 'K12',
    university: 'University',
    professional: 'Professional'
  },
  stages: {
    'k12-primary': 'Primary',
    'k12-junior': 'Junior high',
    'k12-senior': 'Senior high',
    university: 'University',
    professional: 'Professional'
  },
  subjects: {
    math: 'Mathematics',
    physics: 'Physics',
    chemistry: 'Chemistry',
    biology: 'Biology',
    science: 'Science',
    geography: 'Geography',
    it: 'Information Technology',
    chinese: 'Chinese',
    'foreign-language': 'Foreign Languages',
    engineering: 'Engineering'
  },
  sections: {
    hall: 'Experiment Evaluation Apps ({{count}})',
    desc: 'Filter by stage and subject to compare per-spec ratings and reviews on experiment tasks'
  },
  card: {
    benchmark: 'Benchmark',
    specs: '{{count}} specs'
  },
  specs: {
    title: 'Education experiment spec evaluation',
    subtitle: '{{name}} covers {{model}} model and {{agent}} agent specs, ranked by benchmark and rated per spec'
  },
  panel: {
    title: 'Stage × subject coverage matrix',
    subtitle: 'Experiment task sets of {{name}} per stage and subject; cells carry task counts and benchmark scores',
    colTask: 'Tasks',
    colScore: 'Benchmark',
    empty: 'Coverage data appears once curated'
  },
  dims: {
    operation: 'Experiment simulation',
    grading: 'Lab report grading',
    design: 'Experiment design coaching',
    qa: 'Subject Q&A',
    safety: 'Safety guidance'
  },
  empty: 'No education experiment apps in this category yet. They will appear once configured.'
};
