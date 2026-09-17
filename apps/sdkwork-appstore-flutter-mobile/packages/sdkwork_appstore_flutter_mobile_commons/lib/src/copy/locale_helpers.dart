/// Locale resolution helpers.
///
/// This module holds no authored copy. Locale fragments live under
/// `lib/src/i18n/<locale>/appstore/<capability>/` per `I18N_SPEC.md`
/// section 6.1 (Flutter allows `.arb` and `.json` fragments). Dart
/// `const Map` copy tables belong in `lib/src/copy/`, never under
/// `lib/src/i18n/`.
library;

const List<String> appstoreSupportedLocales = <String>['en-US', 'zh-CN'];

const String appstoreDefaultLocale = 'en-US';

String normalizeAppstoreLocale(String? candidate) {
  final value = candidate?.trim();
  if (value == null || value.isEmpty) {
    return appstoreDefaultLocale;
  }
  return appstoreSupportedLocales.contains(value)
      ? value
      : appstoreDefaultLocale;
}
