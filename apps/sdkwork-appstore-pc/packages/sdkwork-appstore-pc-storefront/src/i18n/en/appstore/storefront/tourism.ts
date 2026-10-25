export const tourism = {
  header: {
    badge: 'Culture & Tourism Evaluation',
    title: 'Culture & Tourism Apps',
    subtitle: 'AI evaluation and distribution for culture and tourism: intelligent guides, itinerary planning and multilingual narration for tourist attractions, plus museums, city walks, heritage and study tours.'
  },
  filters: {
    scenarioLabel: 'Scenario',
    allScenarios: 'All scenarios',
    regionLabel: 'Region',
    allRegions: 'All regions'
  },
  scenarios: {
    attraction: 'Tourist attractions',
    museum: 'Museums',
    citywalk: 'City walk',
    heritage: 'Heritage & folklore',
    'study-tour': 'Study tours'
  },
  regions: {
    north: 'North China',
    east: 'East China',
    south: 'South China',
    central: 'Central China',
    southwest: 'Southwest China',
    northwest: 'Northwest China',
    northeast: 'Northeast China'
  },
  themes: {
    nature: 'Natural scenery',
    culture: 'Culture & history',
    ruins: 'Heritage sites',
    park: 'Theme parks'
  },
  sections: {
    hall: 'Tourism Evaluation Apps ({{count}})',
    desc: 'Tourist attractions as the flagship scenario; compare narration accuracy and itinerary planning per spec'
  },
  card: {
    benchmark: 'Benchmark',
    specs: '{{count}} specs',
    attractions: 'Covers {{count}} attractions'
  },
  specs: {
    title: 'Tourism scenario spec evaluation',
    subtitle: '{{name}} covers {{model}} model and {{agent}} agent specs, ranked by benchmark and rated per spec'
  },
  panel: {
    title: 'Attraction coverage',
    subtitle: 'Attractions covered by {{name}} and their narration accuracy',
    updated: 'Data updated {{time}}; live attraction information follows official announcements',
    colLevel: 'Level',
    colRegion: 'Region',
    colTheme: 'Theme',
    colAccuracy: 'Narration accuracy',
    empty: 'Attraction coverage appears once curated'
  },
  dims: {
    accuracy: 'Narration accuracy',
    planning: 'Itinerary planning',
    multilingual: 'Multilingual narration',
    knowledge: 'Cultural knowledge',
    freshness: 'Practical info freshness'
  },
  empty: 'No tourism apps in this category yet. They will appear once configured.'
};
