import 'package:flutter/material.dart';

import 'package:sdkwork_appstore_flutter_mobile_commons/sdkwork_appstore_flutter_mobile_commons.dart';

import '../copy/settings_messages.dart';
import '../models/settings_models.dart';
import '../services/settings_service.dart';

/// Console settings screen (canonical route `console.system.settings.index`).
///
/// Mirrors the PC ConsoleSettingsPage on mobile: account card, general
/// preferences, and about. Account data comes from the injected IAM runtime.
class SettingsScreen extends StatefulWidget {
  const SettingsScreen({required this.service, super.key});

  final SettingsService service;

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  late SettingsAccount _account;
  bool _notificationsEnabled = true;

  @override
  void initState() {
    super.initState();
    _account = widget.service.loadAccount();
  }

  void _signOut() {
    widget.service.signOut();
    setState(() => _account = widget.service.loadAccount());
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(settingsMessages['titleZh'] ?? '设置')),
      body: ListView(
        padding: const EdgeInsets.only(bottom: 24),
        children: <Widget>[
          AppstoreSectionHeader(title: '账户'),
          Card(
            margin: const EdgeInsets.symmetric(horizontal: 16),
            child: ListTile(
              leading: CircleAvatar(
                child: Text(_account.signedIn ? '已' : '?'),
              ),
              title: Text(_account.signedIn ? '已登录（本地会话）' : '未登录'),
              subtitle: const Text('登录后可同步我的库与心愿单'),
              trailing: _account.signedIn
                  ? TextButton(onPressed: _signOut, child: const Text('退出'))
                  : null,
            ),
          ),
          AppstoreSectionHeader(title: '通用'),
          SwitchListTile(
            title: const Text('接收更新与促销通知'),
            value: _notificationsEnabled,
            onChanged: (bool value) => setState(() => _notificationsEnabled = value),
          ),
          ListTile(
            title: const Text('语言'),
            subtitle: const Text('跟随系统（支持中文 / English）'),
            onTap: () {},
          ),
          AppstoreSectionHeader(title: '关于'),
          const ListTile(
            title: Text('SDKWork App Store'),
            subtitle: Text('应用 ID: sdkwork-appstore · Flutter Mobile'),
          ),
        ],
      ),
    );
  }
}
