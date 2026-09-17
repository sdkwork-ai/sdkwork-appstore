/// Flutter host adapters.
///
/// Host-only capabilities are registered here behind typed contracts so
/// capability packages stay platform-agnostic
/// (`APP_CLIENT_ARCHITECTURE_ALIGNMENT_SPEC.md` section 1).
library;

final Set<String> _registered = <String>{};

List<String> registerFlutterHostAdapters() {
  _registered.addAll(<String>[
    'secure-storage',
    'haptic',
    'share',
    'deep-link',
  ]);
  return listFlutterHostAdapters();
}

List<String> listFlutterHostAdapters() => _registered.toList()..sort();

bool isFlutterHostAdapterAvailable(String name) => _registered.contains(name);
