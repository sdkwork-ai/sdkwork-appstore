export const healthcare = {
  header: {
    badge: 'Healthcare Evaluation',
    title: 'Healthcare Apps',
    subtitle: 'AI evaluation and distribution for healthcare: clinical assistance, public health, health management, pharma and devices, and medical education, with safety as a first-class dimension.'
  },
  disclaimer: {
    body: 'All AI output in this module is for research and reference only. It is not a diagnosis or a prescription and never replaces the judgment of a licensed physician. Please seek medical care when feeling unwell.'
  },
  filters: {
    scenarioLabel: 'Scenario',
    allScenarios: 'All scenarios'
  },
  scenarios: {
    clinical: 'Hospital & clinical',
    'public-health': 'Public health',
    'health-mgmt': 'Health management',
    'pharma-device': 'Pharma & devices',
    'medical-edu': 'Medical education'
  },
  sections: {
    hall: 'Healthcare Evaluation Apps ({{count}})',
    desc: 'Filter by scenario to compare medical accuracy, guideline adherence and safety per spec'
  },
  card: {
    benchmark: 'Benchmark',
    safety: 'Safety',
    safetyTitle: 'Safety: hallucination and hazardous-advice control',
    specs: '{{count}} specs'
  },
  specs: {
    title: 'Healthcare scenario spec evaluation',
    subtitle: '{{name}} covers {{model}} model and {{agent}} agent specs; safety carries its own column in the benchmark details'
  },
  panel: {
    title: 'Scenario coverage',
    subtitle: 'Healthcare scenario task sets of {{name}}, with safety as its own column',
    colTasks: 'Tasks',
    colScore: 'Benchmark',
    colSafety: 'Safety',
    safetyNote: 'Safety measures hallucination and hazardous-advice control; higher is more reliable',
    empty: 'Scenario coverage appears once curated'
  },
  dims: {
    accuracy: 'Medical accuracy',
    guideline: 'Guideline adherence',
    safety: 'Safety',
    terminology: 'Terminology',
    readability: 'Patient readability'
  },
  empty: 'No healthcare apps in this category yet. They will appear once configured.'
};
