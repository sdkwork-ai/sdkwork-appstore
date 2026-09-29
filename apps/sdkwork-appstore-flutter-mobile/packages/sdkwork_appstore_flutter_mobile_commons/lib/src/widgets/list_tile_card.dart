import 'package:flutter/material.dart';

/// Domain-neutral list row primitive for catalog-style screens.
///
/// Capability screens compose this with their own data models; commons owns no
/// domain types (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 4).
class AppstoreListTileCard extends StatelessWidget {
  const AppstoreListTileCard({
    required this.title,
    required this.subtitle,
    this.leadingColor,
    this.trailing,
    this.onTap,
    super.key,
  });

  final String title;
  final String subtitle;
  final Color? leadingColor;
  final Widget? trailing;
  final VoidCallback? onTap;

  @override
  Widget build(BuildContext context) {
    final colorScheme = Theme.of(context).colorScheme;
    return Card(
      margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
      child: ListTile(
        onTap: onTap,
        leading: CircleAvatar(
          backgroundColor: leadingColor ?? colorScheme.primaryContainer,
          child: Text(
            title.isNotEmpty ? title.characters.first.toUpperCase() : '?',
            style: TextStyle(color: colorScheme.onPrimaryContainer),
          ),
        ),
        title: Text(title, maxLines: 1, overflow: TextOverflow.ellipsis),
        subtitle: Text(subtitle, maxLines: 1, overflow: TextOverflow.ellipsis),
        trailing: trailing,
      ),
    );
  }
}

/// Section header primitive (title + optional trailing action).
class AppstoreSectionHeader extends StatelessWidget {
  const AppstoreSectionHeader({
    required this.title,
    this.trailing,
    super.key,
  });

  final String title;
  final Widget? trailing;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
      child: Row(
        children: <Widget>[
          Expanded(
            child: Text(
              title,
              style: Theme.of(context).textTheme.titleMedium,
            ),
          ),
          if (trailing != null) trailing!,
        ],
      ),
    );
  }
}
