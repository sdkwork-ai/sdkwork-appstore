import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../data/experts_catalog.dart';
import '../models/ai_hub_models.dart';

/// AI Hub service (index / experts / plugins / skills / mcp / templates).
///
/// Injected clients only; data flows through the generated Dart target of
/// `sdkwork-appstore-app-sdk`: catalog AI-category filter for AI apps,
/// catalog template domain for plugins (templateType PLUGIN) and app
/// templates (templateType APP). Skills / MCP registries ride the generated
/// Dart targets of the skills and mcp SDK families, injected alongside. The
/// curated expert catalog is local presentation content and needs no
/// transport.
class AiHubService {
  const AiHubService({
    required this.clients,
    this.skillsClient,
    this.mcpClient,
  });

  final AppstoreAppSdkClients clients;

  /// Generated skills-domain client (null keeps the skill surfaces on the
  /// explicit-unconfigured error path).
  final SdkworkAppClient? skillsClient;

  /// Generated mcp-domain client (null keeps the MCP surface on the
  /// explicit-unconfigured error path).
  final SdkworkMcpAppClient? mcpClient;

  String get capability => 'ai-hub';

  /// Curated experts (appstore-owned presentation content, no transport).
  Future<List<AiExpertEntry>> loadExperts() async {
    return aiExpertCatalog;
  }

  /// AI category storefront listings (catalog domain filter).
  Future<List<AiAppEntry>> loadAiApps() async {
    clients.ensureTransportBound(capability);
    final client = clients.requireAppClient;
    final categories =
        await client.catalog.appstoreCatalogCategoriesList(null, 200, 'zh-CN').catchError(
              (Object error) => null,
            );
    final aiCategoryIds = <String>{
      for (final row in AppstoreAppSdkClients.itemsOf(categories?.data))
        if (_text(row['categoryCode'], _text(row['category_code']))
            .toLowerCase()
            .startsWith('ai'))
          _text(row['id']),
    };
    final listings =
        await client.catalog.appstoreCatalogListingsList(null, null, null, null, 200);
    return <AiAppEntry>[
      for (final row in AppstoreAppSdkClients.itemsOf(listings?.data))
        if (aiCategoryIds.isEmpty ||
            aiCategoryIds.contains(
              _text(row['primaryCategoryId'], _text(row['primary_category_id'])),
            ))
          AiAppEntry(
            id: _text(row['listingSlug'], _text(row['id'])),
            title: _text(row['displayName'], _text(row['title'], 'AI 应用')),
            developer: _text(row['developerName'], _text(row['publisherName'], '')),
          ),
    ].take(24).toList();
  }

  /// Extension plugins (catalog template domain, templateType PLUGIN).
  Future<List<AiPluginEntry>> loadPlugins({String query = ''}) async {
    clients.ensureTransportBound(capability);
    final response = await clients.requireAppClient.catalog.appstoreCatalogTemplatesList(
      query.trim().isEmpty ? null : query.trim(),
      null,
      'PLUGIN',
      null,
      100,
    );
    return <AiPluginEntry>[
      for (final row in AppstoreAppSdkClients.itemsOf(response?.data))
        AiPluginEntry(
          id: _text(row['id']),
          name: _text(row['templateName'], _text(row['template_name'], '插件')),
          developer: _metadata(row)['authorName']?.toString() ?? 'SDKWork',
          category: _metadata(row)['category']?.toString() ??
              _text(row['categoryCode'] ?? row['category_code'], '代码与开发'),
          description: _text(row['description']),
        ),
    ];
  }

  /// Skill marketplace (generated skills-domain Dart client).
  Future<List<AiSkillEntry>> loadSkills({String query = ''}) async {
    final client = skillsClient;
    if (client == null) {
      throw const AppstoreServiceUnconfiguredException('skills');
    }
    final trimmed = query.trim().isEmpty ? null : query.trim();
    final marketplace =
        await client.skill.marketplaceList(1, 48, null, trimmed);
    final installations = await client.skillInstallation
        .skillInstallationsList(1, 200)
        .catchError((Object error) => null);
    final installedSkillIds = <String>{};
    final installedPackageIds = <String>{};
    for (final row in AppstoreAppSdkClients.itemsOf(installations?.data)) {
      final enabled = row['enabled'] == true;
      final status = row['installStatus']?.toString() ?? row['install_status']?.toString() ?? '';
      if (enabled && status != 'deleted') {
        installedSkillIds.add(_text(row['skillId']));
        installedPackageIds.add(_text(row['packageId']));
      }
    }
    return <AiSkillEntry>[
      for (final row in AppstoreAppSdkClients.itemsOf(marketplace?.data))
        AiSkillEntry(
          id: _text(row['id']),
          name: _text(row['name'], '技能'),
          version: _text(row['version'], '1.0.0'),
          category: _categoriesOf(row),
          description:
              _text(row['summary'], _text(row['description'])),
          installs: int.tryParse(_text(row['installCount'], '0')) ?? 0,
        ),
    ];
  }

  /// MCP registry servers (generated mcp-domain Dart client).
  Future<List<AiMcpServerEntry>> loadMcpServers({String query = ''}) async {
    final client = mcpClient;
    if (client == null) {
      throw const AppstoreServiceUnconfiguredException('mcp');
    }
    final trimmed = query.trim().isEmpty ? null : query.trim();
    final response = await client.mcp.getListServers(1, 48, trimmed);
    return <AiMcpServerEntry>[
      for (final row in AppstoreAppSdkClients.itemsOf(response?.data))
        AiMcpServerEntry(
          id: _text(row['id']),
          name: _text(row['name']),
          publisher: _text(row['categoryCode'] ?? row['category_code'], 'SDKWork MCP'),
          description: _text(row['description']),
          transportType: _transportLabel(
            _text(row['transport'], _text(row['transport_type'])),
          ),
        ),
    ];
  }

  /// App templates (catalog template domain, templateType APP).
  Future<List<AiTemplateEntry>> loadTemplates({String query = ''}) async {
    clients.ensureTransportBound(capability);
    final response = await clients.requireAppClient.catalog.appstoreCatalogTemplatesList(
      query.trim().isEmpty ? null : query.trim(),
      null,
      'APP',
      null,
      50,
    );
    return <AiTemplateEntry>[
      for (final row in AppstoreAppSdkClients.itemsOf(response?.data))
        AiTemplateEntry(
          id: _text(row['id']),
          templateCode: _text(row['templateCode'], _text(row['template_code'])),
          name: _text(row['templateName'], _text(row['template_name'], '模板')),
          author: _metadata(row)['authorName']?.toString() ?? 'SDKWork',
          description: _text(row['description']),
          stars: int.tryParse(_text(row['starCount'], _metadata(row)['stars']?.toString() ?? '0')) ?? 0,
          forks: int.tryParse(_text(row['forkCount'], _metadata(row)['forks']?.toString() ?? '0')) ?? 0,
        ),
    ];
  }

  /// One template detail by id.
  Future<AiTemplateEntry> loadTemplate(String templateId) async {
    clients.ensureTransportBound(capability);
    final response =
        await clients.requireAppClient.catalog.appstoreCatalogTemplatesRetrieve(templateId);
    final row = AppstoreAppSdkClients.itemOf(response?.data);
    if (row == null) {
      throw StateError('模板不存在或已下架');
    }
    return AiTemplateEntry(
      id: _text(row['id'], templateId),
      templateCode: _text(row['templateCode'], _text(row['template_code'])),
      name: _text(row['templateName'], _text(row['template_name'], '模板')),
      author: _metadata(row)['authorName']?.toString() ?? 'SDKWork',
      description: _text(row['description']),
      stars: int.tryParse(_text(row['starCount'], '0')) ?? 0,
      forks: int.tryParse(_text(row['forkCount'], '0')) ?? 0,
    );
  }
}

String _categoriesOf(Map<String, dynamic> row) {
  final categories = row['categories'];
  if (categories is List && categories.isNotEmpty) {
    return categories.first.toString();
  }
  return 'General';
}

String _transportLabel(String raw) {
  final transport = raw.toLowerCase();
  if (transport == 'sse') {
    return 'SSE';
  }
  if (transport == 'http' || transport == 'streamable-http') {
    return 'HTTP';
  }
  if (transport == 'websocket' || transport == 'ws') {
    return 'WebSocket';
  }
  return 'stdio';
}

Map<String, dynamic> _metadata(Map<String, dynamic> row) {
  final raw = row['metadata'];
  if (raw is Map) {
    return raw.map((key, value) => MapEntry(key.toString(), value));
  }
  return const <String, dynamic>{};
}

String _text(dynamic value, [String fallback = '']) {
  final text = value?.toString().trim() ?? '';
  return text.isEmpty ? fallback : text;
}
