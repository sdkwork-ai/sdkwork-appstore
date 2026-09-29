import 'package:flutter/material.dart';

import 'package:sdkwork_appstore_flutter_mobile_commons/sdkwork_appstore_flutter_mobile_commons.dart';

import '../copy/ai_hub_messages.dart';
import '../data/experts_catalog.dart';
import '../models/ai_hub_models.dart';
import '../services/ai_hub_service.dart';

/// AI Hub screens for the canonical ai-hub route family
/// (`app.store.ai-hub.index/experts/plugins/skills/mcp/templates/
/// template-detail/template-detail-alias`).
///
/// The [screen] discriminator picks the presentation per canonical route,
/// mirroring the PC AIHubPage + markets pages: index (专家/AI 应用 tabs),
/// experts (curated catalog), plugins/skills/mcp (registry lists),
/// templates (marketplace), template-detail (detail + CLI).
class AiHubScreen extends StatelessWidget {
  const AiHubScreen({required this.service, required this.screen, this.templateId, super.key});

  final AiHubService service;

  /// Canonical screen token from the route contribution.
  final String screen;

  final String? templateId;

  @override
  Widget build(BuildContext context) {
    if (screen == 'experts') {
      return _ExpertsView(service: service);
    }
    if (screen == 'plugins') {
      return _RegistryView(
        service: service,
        title: '扩展插件',
        kind: _RegistryKind.plugins,
      );
    }
    if (screen == 'skills') {
      return _RegistryView(
        service: service,
        title: '技能中心',
        kind: _RegistryKind.skills,
      );
    }
    if (screen == 'mcp') {
      return _RegistryView(
        service: service,
        title: 'MCP 服务',
        kind: _RegistryKind.mcp,
      );
    }
    if (screen == 'template-detail' || screen == 'template-detail-alias') {
      return _TemplateDetailView(service: service, templateId: templateId ?? '');
    }
    if (screen == 'templates') {
      return _TemplatesView(service: service);
    }
    return _IndexView(service: service);
  }
}

class _IndexView extends StatefulWidget {
  const _IndexView({required this.service});

  final AiHubService service;

  @override
  State<_IndexView> createState() => _IndexViewState();
}

class _IndexViewState extends State<_IndexView> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(ai_hubMessages['titleZh'] ?? 'AI 中心')),
      body: Column(
        children: <Widget>[
          SegmentedButton<int>(
            segments: const <ButtonSegment<int>>[
              ButtonSegment<int>(value: 0, label: Text('专家'), icon: Icon(Icons.people)),
              ButtonSegment<int>(
                value: 1,
                label: Text('AI 应用'),
                icon: Icon(Icons.auto_awesome),
              ),
            ],
            selected: <int>{_tab},
            onSelectionChanged: (Set<int> selection) =>
                setState(() => _tab = selection.first),
          ),
          Expanded(
            child: _tab == 0
                ? _ExpertList(service: widget.service, compact: true)
                : _AiAppList(service: widget.service),
          ),
          _AiLabEntries(),
        ],
      ),
    );
  }
}

class _AiLabEntries extends StatelessWidget {
  static const List<(String, String, IconData)> _entries = <(String, String, IconData)>[
    ('/experts', '专家', Icons.people),
    ('/plugins', '扩展插件', Icons.extension),
    ('/skills', '技能中心', Icons.bolt),
    ('/mcp', 'MCP 服务', Icons.dns),
    ('/templates', '应用模板', Icons.dashboard_customize),
  ];

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.all(16),
      child: Column(
        children: <Widget>[
          for (final (path, label, icon) in _entries)
            ListTile(
              leading: Icon(icon),
              title: Text(label),
              trailing: const Icon(Icons.chevron_right),
              onTap: () => Navigator.pushNamed(context, path),
            ),
        ],
      ),
    );
  }
}

class _ExpertsView extends StatefulWidget {
  const _ExpertsView({required this.service});

  final AiHubService service;

  @override
  State<_ExpertsView> createState() => _ExpertsViewState();
}

class _ExpertsViewState extends State<_ExpertsView> {
  String _category = '全部';

  @override
  Widget build(BuildContext context) {
    final categories = aiExpertCategories();
    final filtered = aiExpertCatalog
        .where((expert) => _category == '全部' || expert.category == _category)
        .toList();
    return Scaffold(
      appBar: AppBar(title: const Text('专家')),
      body: ListView(
        children: <Widget>[
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              children: <Widget>[
                for (final category in categories)
                  Padding(
                    padding: const EdgeInsets.only(right: 8),
                    child: ChoiceChip(
                      label: Text(category),
                      selected: _category == category,
                      onSelected: (bool selected) {
                        if (!selected) {
                          return;
                        }
                        setState(() => _category = category);
                      },
                    ),
                  ),
              ],
            ),
          ),
          for (final expert in filtered)
            Card(
              margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
              child: ListTile(
                leading: CircleAvatar(
                  child: Text(expert.name.characters.first),
                ),
                title: Text(expert.name),
                subtitle: Text(
                  expert.description,
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                trailing: Chip(
                  label: Text(
                    expert.category,
                    style: const TextStyle(fontSize: 11),
                  ),
                  visualDensity: VisualDensity.compact,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ExpertList extends StatelessWidget {
  const _ExpertList({required this.service, required this.compact});

  final AiHubService service;
  final bool compact;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<AiExpertEntry>>(
      future: service.loadExperts(),
      builder: (BuildContext context, AsyncSnapshot<List<AiExpertEntry>> snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const AppstoreScreenState(
            kind: AppstoreScreenStateKind.loading,
            message: AppstoreScreenStateMessages.loading,
          );
        }
        final experts = (snapshot.data ?? const <AiExpertEntry>[])
            .take(compact ? 4 : snapshot.data!.length)
            .toList();
        return ListView(
          children: <Widget>[
            for (final expert in experts)
              AppstoreListTileCard(
                title: expert.name,
                subtitle: expert.description,
                onTap: () => Navigator.pushNamed(context, '/experts'),
              ),
          ],
        );
      },
    );
  }
}

class _AiAppList extends StatelessWidget {
  const _AiAppList({required this.service});

  final AiHubService service;

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<List<AiAppEntry>>(
      future: service.loadAiApps(),
      builder: (BuildContext context, AsyncSnapshot<List<AiAppEntry>> snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const AppstoreScreenState(
            kind: AppstoreScreenStateKind.loading,
            message: AppstoreScreenStateMessages.loading,
          );
        }
        if (snapshot.hasError) {
          return AppstoreScreenState(
            kind: AppstoreScreenStateKind.error,
            message: AppstoreScreenStateMessages.error,
            onRetry: () => service.loadAiApps(),
          );
        }
        final apps = snapshot.data ?? const <AiAppEntry>[];
        if (apps.isEmpty) {
          return const AppstoreScreenState(
            kind: AppstoreScreenStateKind.empty,
            message: '暂无 AI 应用',
          );
        }
        return ListView(
          children: <Widget>[
            for (final app in apps)
              AppstoreListTileCard(
                title: app.title,
                subtitle: app.developer,
                onTap: () => Navigator.pushNamed(context, '/app/${app.id}'),
              ),
          ],
        );
      },
    );
  }
}

enum _RegistryKind { plugins, skills, mcp }

class _RegistryView extends StatelessWidget {
  const _RegistryView({
    required this.service,
    required this.title,
    required this.kind,
  });

  final AiHubService service;
  final String title;
  final _RegistryKind kind;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(title)),
      body: kind == _RegistryKind.plugins
          ? _pluginList(context)
          : kind == _RegistryKind.skills
              ? _skillList(context)
              : _mcpList(context),
    );
  }

  Widget _pluginList(BuildContext context) {
    return FutureBuilder<List<AiPluginEntry>>(
      future: service.loadPlugins(),
      builder: (BuildContext context, AsyncSnapshot<List<AiPluginEntry>> snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const AppstoreScreenState(
            kind: AppstoreScreenStateKind.loading,
            message: AppstoreScreenStateMessages.loading,
          );
        }
        if (snapshot.hasError) {
          return AppstoreScreenState(
            kind: AppstoreScreenStateKind.error,
            message: AppstoreScreenStateMessages.error,
            onRetry: () => service.loadPlugins(),
          );
        }
        final plugins = snapshot.data ?? const <AiPluginEntry>[];
        if (plugins.isEmpty) {
          return const AppstoreScreenState(
            kind: AppstoreScreenStateKind.empty,
            message: '该分类下暂无插件',
          );
        }
        return ListView(
          children: <Widget>[
            for (final plugin in plugins)
              AppstoreListTileCard(
                title: plugin.name,
                subtitle: plugin.developer + ' · ' + plugin.category,
              ),
          ],
        );
      },
    );
  }

  Widget _skillList(BuildContext context) {
    return FutureBuilder<List<AiSkillEntry>>(
      future: service.loadSkills(),
      builder: (BuildContext context, AsyncSnapshot<List<AiSkillEntry>> snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const AppstoreScreenState(
            kind: AppstoreScreenStateKind.loading,
            message: AppstoreScreenStateMessages.loading,
          );
        }
        if (snapshot.hasError) {
          return AppstoreScreenState(
            kind: AppstoreScreenStateKind.error,
            message: AppstoreScreenStateMessages.error,
            onRetry: () => service.loadSkills(),
          );
        }
        final skills = snapshot.data ?? const <AiSkillEntry>[];
        if (skills.isEmpty) {
          return const AppstoreScreenState(
            kind: AppstoreScreenStateKind.empty,
            message: '没有匹配的技能',
          );
        }
        return ListView(
          children: <Widget>[
            for (final skill in skills)
              AppstoreListTileCard(
                title: skill.name,
                subtitle:
                    'v${skill.version} · ${skill.category} · ${skill.installs} 次安装',
                trailing: const Text('安装'),
              ),
          ],
        );
      },
    );
  }

  Widget _mcpList(BuildContext context) {
    return FutureBuilder<List<AiMcpServerEntry>>(
      future: service.loadMcpServers(),
      builder: (BuildContext context, AsyncSnapshot<List<AiMcpServerEntry>> snapshot) {
        if (snapshot.connectionState != ConnectionState.done) {
          return const AppstoreScreenState(
            kind: AppstoreScreenStateKind.loading,
            message: AppstoreScreenStateMessages.loading,
          );
        }
        if (snapshot.hasError) {
          return AppstoreScreenState(
            kind: AppstoreScreenStateKind.error,
            message: AppstoreScreenStateMessages.error,
            onRetry: () => service.loadMcpServers(),
          );
        }
        final servers = snapshot.data ?? const <AiMcpServerEntry>[];
        if (servers.isEmpty) {
          return const AppstoreScreenState(
            kind: AppstoreScreenStateKind.empty,
            message: '没有匹配的 MCP 服务',
          );
        }
        return ListView(
          children: <Widget>[
            for (final server in servers)
              AppstoreListTileCard(
                title: server.name,
                subtitle: server.publisher + ' · ' + server.transportType,
              ),
          ],
        );
      },
    );
  }
}

class _TemplatesView extends StatelessWidget {
  const _TemplatesView({required this.service});

  final AiHubService service;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('应用模板')),
      body: FutureBuilder<List<AiTemplateEntry>>(
        future: service.loadTemplates(),
        builder: (BuildContext context, AsyncSnapshot<List<AiTemplateEntry>> snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const AppstoreScreenState(
              kind: AppstoreScreenStateKind.loading,
              message: AppstoreScreenStateMessages.loading,
            );
          }
          if (snapshot.hasError) {
            return AppstoreScreenState(
              kind: AppstoreScreenStateKind.error,
              message: AppstoreScreenStateMessages.error,
              onRetry: () => service.loadTemplates(),
            );
          }
          final templates = snapshot.data ?? const <AiTemplateEntry>[];
          if (templates.isEmpty) {
            return const AppstoreScreenState(
              kind: AppstoreScreenStateKind.empty,
              message: '没有匹配的模板',
            );
          }
          return ListView(
            children: <Widget>[
              for (final template in templates)
                AppstoreListTileCard(
                  title: template.name,
                  subtitle: template.author + ' · ' + template.stars.toString() + ' Stars',
                  trailing: const Icon(Icons.chevron_right),
                  onTap: () => Navigator.pushNamed(
                      context, '/template/' + template.id),
                ),
            ],
          );
        },
      ),
    );
  }
}

class _TemplateDetailView extends StatelessWidget {
  const _TemplateDetailView({required this.service, required this.templateId});

  final AiHubService service;
  final String templateId;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('模板详情')),
      body: FutureBuilder<AiTemplateEntry>(
        future: service.loadTemplate(templateId),
        builder: (BuildContext context, AsyncSnapshot<AiTemplateEntry> snapshot) {
          if (snapshot.connectionState != ConnectionState.done) {
            return const AppstoreScreenState(
              kind: AppstoreScreenStateKind.loading,
              message: AppstoreScreenStateMessages.loading,
            );
          }
          if (snapshot.hasError) {
            return const AppstoreScreenState(
              kind: AppstoreScreenStateKind.empty,
              message: '模板不存在或已下架',
            );
          }
          final template = snapshot.data!;
          return ListView(
            padding: const EdgeInsets.all(16),
            children: <Widget>[
              Text(template.name, style: Theme.of(context).textTheme.headlineSmall),
              const SizedBox(height: 4),
              Text(
                template.author + ' · ' + template.stars.toString() + ' Stars · ' +
                    template.forks.toString() + ' Forks',
                style: Theme.of(context).textTheme.labelSmall,
              ),
              const SizedBox(height: 16),
              Text(
                template.description.isEmpty ? '该模板暂无详细介绍。' : template.description,
                style: Theme.of(context).textTheme.bodyMedium,
              ),
              const SizedBox(height: 24),
              FilledButton.tonalIcon(
                onPressed: () {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                    content: Text(
                      'npx create-sdkwork-app my-app --template ' +
                          (template.templateCode.isEmpty
                              ? template.id
                              : template.templateCode),
                    ),
                  ));
                },
                icon: const Icon(Icons.terminal),
                label: const Text('复制 CLI 创建命令'),
              ),
            ],
          );
        },
      ),
    );
  }
}
