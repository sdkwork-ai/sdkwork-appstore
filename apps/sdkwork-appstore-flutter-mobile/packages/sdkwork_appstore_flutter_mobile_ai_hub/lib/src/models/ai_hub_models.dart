/// Domain models owned by the ai-hub capability.
class AiHubRouteEntry {
  const AiHubRouteEntry({required this.routeId, required this.path});

  final String routeId;
  final String path;
}

class AiHubPageResult<TItem> {
  const AiHubPageResult({required this.items, this.nextCursor});

  final List<TItem> items;
  final String? nextCursor;
}

/// One storefront AI listing card (catalog domain).
class AiAppEntry {
  const AiAppEntry({
    required this.id,
    required this.title,
    this.developer = '',
  });

  final String id;
  final String title;
  final String developer;
}

/// Storefront curated expert entry (appstore-owned presentation content).
class AiExpertEntry {
  const AiExpertEntry({
    required this.id,
    required this.name,
    required this.title,
    required this.description,
    required this.category,
    required this.tags,
  });

  final String id;
  final String name;
  final String title;
  final String description;
  final String category;
  final List<String> tags;
}

/// One extension plugin card (catalog template domain, templateType PLUGIN).
class AiPluginEntry {
  const AiPluginEntry({
    required this.id,
    required this.name,
    required this.developer,
    required this.category,
    this.description = '',
  });

  final String id;
  final String name;
  final String developer;
  final String category;
  final String description;
}

/// One skill card (skills domain marketplace).
class AiSkillEntry {
  const AiSkillEntry({
    required this.id,
    required this.name,
    required this.version,
    required this.category,
    this.description = '',
    this.installs = 0,
  });

  final String id;
  final String name;
  final String version;
  final String category;
  final String description;
  final int installs;
}

/// One MCP registry server card (mcp domain).
class AiMcpServerEntry {
  const AiMcpServerEntry({
    required this.id,
    required this.name,
    required this.transportType,
    required this.publisher,
    this.description = '',
  });

  final String id;
  final String name;
  final String transportType;
  final String publisher;
  final String description;
}

/// One app template card (catalog template domain, templateType APP).
class AiTemplateEntry {
  const AiTemplateEntry({
    required this.id,
    required this.templateCode,
    required this.name,
    required this.author,
    this.description = '',
    this.stars = 0,
    this.forks = 0,
  });

  final String id;
  final String templateCode;
  final String name;
  final String author;
  final String description;
  final int stars;
  final int forks;
}
