import 'package:sdkwork_appstore_flutter_mobile_core/sdkwork_appstore_flutter_mobile_core.dart';

import '../data/experts_catalog.dart';
import '../models/ai_hub_models.dart';

/// AI Hub service (index / experts / plugins / skills / mcp / templates).
///
/// Injected clients only; data calls gate on the generated Dart SDK transport
/// binding (PC explicit-unconfigured-port pattern). Data domains: catalog
/// template domain for plugins/templates, skills domain marketplace for
/// skills, mcp domain registry for MCP servers, agents domain preview for the
/// sandbox. The curated expert catalog is local presentation content and needs
/// no transport.
class AiHubService {
  const AiHubService({required this.clients});

  final AppstoreAppSdkClients clients;

  String get capability => 'ai-hub';

  /// Curated experts (appstore-owned presentation content, no transport).
  Future<List<AiExpertEntry>> loadExperts() async {
    return aiExpertCatalog;
  }

  /// AI category storefront listings (catalog domain filter).
  Future<List<AiAppEntry>> loadAiApps() async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// Extension plugins (catalog template domain, templateType PLUGIN).
  Future<List<AiPluginEntry>> loadPlugins({String query = ''}) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// Skill marketplace (skills domain).
  Future<List<AiSkillEntry>> loadSkills({String query = ''}) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// MCP registry servers (mcp domain).
  Future<List<AiMcpServerEntry>> loadMcpServers({String query = ''}) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// App templates (catalog template domain, templateType APP).
  Future<List<AiTemplateEntry>> loadTemplates({String query = ''}) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }

  /// One template detail by id.
  Future<AiTemplateEntry> loadTemplate(String templateId) async {
    clients.ensureTransportBound(capability);
    throw AppstoreServiceUnconfiguredException(capability);
  }
}
