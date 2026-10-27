export const aiEval = {
  header: {
    badge: 'AI Evaluation Center',
    title: 'AI Model Evaluation',
    subtitle: 'Multi-spec evaluation apps: one evaluation covering different models and agents (BirdCoder, Codex, Claude Code, etc.), each spec rated and reviewed separately.'
  },
  sections: {
    hall: 'Evaluation Apps ({{count}})',
    desc: 'Filter by category and domain, open an app to browse its specs and rate or review each model or agent separately',
    general: 'General Ability ({{count}})',
    generalDesc: 'Overall arenas, Chinese knowledge, logic traps and instruction following',
    code: 'Coding & Creative Generation ({{count}})',
    codeDesc: 'Real repository repair, SVG spatial reasoning, 3D scenes and front-end work',
    agent: 'Agents & Tools ({{count}})',
    agentDesc: 'Tool calling and real-world assistant tasks',
    multimodal: 'Multimodal & Long Context ({{count}})',
    multimodalDesc: 'Image and chart understanding, very long context retrieval',
    trust: 'Safety & Factuality ({{count}})',
    trustDesc: 'Jailbreak resistance, harmful-content refusal and hallucination calibration'
  },
  filters: {
    all: 'All',
    sectionLabel: 'Category',
    domainLabel: 'Domain',
    allDomains: 'All domains',
    sections: {
      general: 'General',
      code: 'Coding & Creative',
      agent: 'Agents & Tools',
      multimodal: 'Multimodal & Long Context',
      trust: 'Safety & Factuality'
    }
  },
  domains: {
    arena: 'Overall Arena',
    math: 'Math Reasoning',
    chinese: 'Chinese Knowledge',
    logic: 'Logic & Common Sense',
    instruction: 'Instruction Following',
    'agent-coding': 'Coding Agents',
    swe: 'Repo Repair',
    svg: 'SVG Spatial Art',
    scene3d: '3D Scene Generation',
    webdev: 'Front-end Arena',
    gaia: 'Assistant Tasks',
    tools: 'Tool Calling',
    longctx: 'Long Context',
    multimodal: 'Multimodal Understanding',
    safety: 'Safety Alignment',
    hallucination: 'Factuality & Hallucination'
  },
  specs: {
    model: 'Model specs',
    agent: 'Agent specs',
    count: '{{count}} specs',
    breakdown: 'Models×{{model}} · Agents×{{agent}}'
  },
  card: {
    benchmark: 'Benchmark'
  },
  empty: 'No evaluation apps in this category yet. They will appear once configured.'
};
