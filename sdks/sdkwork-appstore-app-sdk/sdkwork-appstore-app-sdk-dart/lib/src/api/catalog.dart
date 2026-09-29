import 'dart:convert';
import '../http/client.dart';
import '../models.dart';

import 'paths.dart';
import 'response_helpers.dart';


class CatalogApi {
  final HttpClient _client;

  CatalogApi(this._client);

  /// Retrieve storefront home feed
  Future<HomeFeedResponse?> appstoreCatalogHomeRetrieve() async {
    final response = await _client.get(ApiPaths.appPath('/appstore/catalog/home'));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : HomeFeedResponse.fromJson(map);
    })();
  }

  /// List store categories
  Future<CategoryListResponse?> appstoreCatalogCategoriesList([String? cursor, int? pageSize, String? locale]) async {
    final query = buildQueryString([
      QueryParameterSpec('cursor', cursor, 'form', true, false, null),
      QueryParameterSpec('page_size', pageSize, 'form', true, false, null),
      QueryParameterSpec('locale', locale, 'form', true, false, null)
    ]);
    final response = await _client.get(ApiPaths.appendQueryString(ApiPaths.appPath('/appstore/catalog/categories'), query));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : CategoryListResponse.fromJson(map);
    })();
  }

  /// Retrieve category detail
  Future<AppstoreCatalogCategoriesRetrieveResponse?> appstoreCatalogCategoriesRetrieve(String categoryId) async {
    final response = await _client.get(ApiPaths.appPath('/appstore/catalog/categories/${serializePathParameter(categoryId, const PathParameterSpec('categoryId', 'simple', false))}'));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : AppstoreCatalogCategoriesRetrieveResponse.fromJson(map);
    })();
  }

  /// List editorial collections
  Future<CollectionListResponse?> appstoreCatalogCollectionsList([String? cursor, int? pageSize]) async {
    final query = buildQueryString([
      QueryParameterSpec('cursor', cursor, 'form', true, false, null),
      QueryParameterSpec('page_size', pageSize, 'form', true, false, null)
    ]);
    final response = await _client.get(ApiPaths.appendQueryString(ApiPaths.appPath('/appstore/catalog/collections'), query));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : CollectionListResponse.fromJson(map);
    })();
  }

  /// Retrieve collection detail
  Future<AppstoreCatalogCollectionsRetrieveResponse?> appstoreCatalogCollectionsRetrieve(String collectionId) async {
    final response = await _client.get(ApiPaths.appPath('/appstore/catalog/collections/${serializePathParameter(collectionId, const PathParameterSpec('collectionId', 'simple', false))}'));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : AppstoreCatalogCollectionsRetrieveResponse.fromJson(map);
    })();
  }

  /// List featured placements
  Future<FeaturedListResponse?> appstoreCatalogFeaturedList() async {
    final response = await _client.get(ApiPaths.appPath('/appstore/catalog/featured'));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : FeaturedListResponse.fromJson(map);
    })();
  }

  /// Retrieve chart rankings
  Future<AppstoreCatalogChartsRetrieveResponse?> appstoreCatalogChartsRetrieve(String chartCode) async {
    final response = await _client.get(ApiPaths.appPath('/appstore/catalog/charts/${serializePathParameter(chartCode, const PathParameterSpec('chartCode', 'simple', false))}'));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : AppstoreCatalogChartsRetrieveResponse.fromJson(map);
    })();
  }

  /// Search public listings
  Future<ListingSummaryListResponse?> appstoreCatalogListingsList([String? q, String? categoryId, String? ids, String? cursor, int? pageSize]) async {
    final query = buildQueryString([
      QueryParameterSpec('q', q, 'form', true, false, null),
      QueryParameterSpec('category_id', categoryId, 'form', true, false, null),
      QueryParameterSpec('ids', ids, 'form', true, false, null),
      QueryParameterSpec('cursor', cursor, 'form', true, false, null),
      QueryParameterSpec('page_size', pageSize, 'form', true, false, null)
    ]);
    final response = await _client.get(ApiPaths.appendQueryString(ApiPaths.appPath('/appstore/catalog/listings/search'), query));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : ListingSummaryListResponse.fromJson(map);
    })();
  }

  /// List recommended listings
  Future<SdkWorkListResponse?> appstoreCatalogRecommendationsList([String? locale, String? platform, String? cursor, int? pageSize]) async {
    final query = buildQueryString([
      QueryParameterSpec('locale', locale, 'form', true, false, null),
      QueryParameterSpec('platform', platform, 'form', true, false, null),
      QueryParameterSpec('cursor', cursor, 'form', true, false, null),
      QueryParameterSpec('page_size', pageSize, 'form', true, false, null)
    ]);
    final response = await _client.get(ApiPaths.appendQueryString(ApiPaths.appPath('/appstore/catalog/recommendations'), query));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : SdkWorkListResponse.fromJson(map);
    })();
  }

  /// List recently updated listings
  Future<SdkWorkListResponse?> appstoreCatalogRecentlyUpdatedList([String? cursor, int? pageSize, String? locale]) async {
    final query = buildQueryString([
      QueryParameterSpec('cursor', cursor, 'form', true, false, null),
      QueryParameterSpec('page_size', pageSize, 'form', true, false, null),
      QueryParameterSpec('locale', locale, 'form', true, false, null)
    ]);
    final response = await _client.get(ApiPaths.appendQueryString(ApiPaths.appPath('/appstore/catalog/recently_updated'), query));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : SdkWorkListResponse.fromJson(map);
    })();
  }

  /// List catalog events
  Future<SdkWorkListResponse?> appstoreCatalogEventsList([String? cursor, int? pageSize, String? status]) async {
    final query = buildQueryString([
      QueryParameterSpec('cursor', cursor, 'form', true, false, null),
      QueryParameterSpec('page_size', pageSize, 'form', true, false, null),
      QueryParameterSpec('status', status, 'form', true, false, null)
    ]);
    final response = await _client.get(ApiPaths.appendQueryString(ApiPaths.appPath('/appstore/catalog/events'), query));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : SdkWorkListResponse.fromJson(map);
    })();
  }

  /// Retrieve catalog event detail
  Future<SdkWorkResourceResponse?> appstoreCatalogEventsRetrieve(String eventId) async {
    final response = await _client.get(ApiPaths.appPath('/appstore/catalog/events/${serializePathParameter(eventId, const PathParameterSpec('eventId', 'simple', false))}'));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : SdkWorkResourceResponse.fromJson(map);
    })();
  }

  /// List search suggestions
  Future<SdkWorkListResponse?> appstoreCatalogSearchSuggestionsList(String q, [String? locale]) async {
    final query = buildQueryString([
      QueryParameterSpec('q', q, 'form', true, false, null),
      QueryParameterSpec('locale', locale, 'form', true, false, null)
    ]);
    final response = await _client.get(ApiPaths.appendQueryString(ApiPaths.appPath('/appstore/catalog/search/suggestions'), query));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : SdkWorkListResponse.fromJson(map);
    })();
  }

  /// List trending search terms
  Future<SdkWorkListResponse?> appstoreCatalogSearchTrendingList([String? locale, int? pageSize]) async {
    final query = buildQueryString([
      QueryParameterSpec('locale', locale, 'form', true, false, null),
      QueryParameterSpec('page_size', pageSize, 'form', true, false, null)
    ]);
    final response = await _client.get(ApiPaths.appendQueryString(ApiPaths.appPath('/appstore/catalog/search/trending'), query));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : SdkWorkListResponse.fromJson(map);
    })();
  }

  /// List search history
  Future<SdkWorkListResponse?> appstoreCatalogSearchHistoryList([String? cursor, int? pageSize]) async {
    final query = buildQueryString([
      QueryParameterSpec('cursor', cursor, 'form', true, false, null),
      QueryParameterSpec('page_size', pageSize, 'form', true, false, null)
    ]);
    final response = await _client.get(ApiPaths.appendQueryString(ApiPaths.appPath('/appstore/catalog/search/history'), query));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : SdkWorkListResponse.fromJson(map);
    })();
  }

  /// Upsert search history entry
  Future<SdkWorkApiResponse?> appstoreCatalogSearchHistoryUpdate(SearchHistoryUpsertRequest body) async {
    final payload = body.toJson();
    final response = await _client.put(ApiPaths.appPath('/appstore/catalog/search/history'), body: payload, contentType: 'application/json');
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : SdkWorkApiResponse.fromJson(map);
    })();
  }

  /// Clear search history
  Future<void> appstoreCatalogSearchHistoryDelete() async {
    await _client.delete(ApiPaths.appPath('/appstore/catalog/search/history'));
  }

  /// List storefront app templates and plugins
  Future<AppTemplateListResponse?> appstoreCatalogTemplatesList([String? q, String? categoryCode, String? templateType, String? cursor, int? pageSize]) async {
    final query = buildQueryString([
      QueryParameterSpec('q', q, 'form', true, false, null),
      QueryParameterSpec('category_code', categoryCode, 'form', true, false, null),
      QueryParameterSpec('template_type', templateType, 'form', true, false, null),
      QueryParameterSpec('cursor', cursor, 'form', true, false, null),
      QueryParameterSpec('page_size', pageSize, 'form', true, false, null)
    ]);
    final response = await _client.get(ApiPaths.appendQueryString(ApiPaths.appPath('/appstore/catalog/templates'), query));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : AppTemplateListResponse.fromJson(map);
    })();
  }

  /// Publish an app template or plugin
  Future<AppTemplateResponse?> appstoreCatalogTemplatesCreate(AppTemplateCreateRequest body, String idempotencyKey) async {
    final requestHeaders = buildRequestHeaders(
      <String, HeaderParameterSpec>{
        'Idempotency-Key': HeaderParameterSpec(idempotencyKey, 'simple', false, null),
      },
      <String, HeaderParameterSpec>{},
    );
    final payload = body.toJson();
    final response = await _client.post(ApiPaths.appPath('/appstore/catalog/templates'), body: payload, headers: requestHeaders, contentType: 'application/json');
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : AppTemplateResponse.fromJson(map);
    })();
  }

  /// Retrieve app template detail
  Future<AppTemplateResponse?> appstoreCatalogTemplatesRetrieve(String templateId) async {
    final response = await _client.get(ApiPaths.appPath('/appstore/catalog/templates/${serializePathParameter(templateId, const PathParameterSpec('templateId', 'simple', false))}'));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : AppTemplateResponse.fromJson(map);
    })();
  }

  /// Record app template usage (star, fork, clone)
  Future<AppTemplateUsageResponse?> appstoreCatalogTemplatesUsageCreate(String templateId, AppTemplateUsageCreateRequest body, String idempotencyKey) async {
    final requestHeaders = buildRequestHeaders(
      <String, HeaderParameterSpec>{
        'Idempotency-Key': HeaderParameterSpec(idempotencyKey, 'simple', false, null),
      },
      <String, HeaderParameterSpec>{},
    );
    final payload = body.toJson();
    final response = await _client.post(ApiPaths.appPath('/appstore/catalog/templates/${serializePathParameter(templateId, const PathParameterSpec('templateId', 'simple', false))}/usage'), body: payload, headers: requestHeaders, contentType: 'application/json');
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : AppTemplateUsageResponse.fromJson(map);
    })();
  }

  /// Submit storefront user feedback
  Future<FeedbackResponse?> appstoreCatalogFeedbackCreate(FeedbackCreateRequest body, String idempotencyKey) async {
    final requestHeaders = buildRequestHeaders(
      <String, HeaderParameterSpec>{
        'Idempotency-Key': HeaderParameterSpec(idempotencyKey, 'simple', false, null),
      },
      <String, HeaderParameterSpec>{},
    );
    final payload = body.toJson();
    final response = await _client.post(ApiPaths.appPath('/appstore/catalog/feedback'), body: payload, headers: requestHeaders, contentType: 'application/json');
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : FeedbackResponse.fromJson(map);
    })();
  }
}

class PathParameterSpec {
  final String name;
  final String style;
  final bool explode;

  const PathParameterSpec(this.name, this.style, this.explode);
}

String serializePathParameter(dynamic value, PathParameterSpec spec) {
  if (value == null) return '';
  final style = spec.style.trim().isEmpty ? 'simple' : spec.style;
  if (value is Iterable) {
    return serializePathArray(spec.name, value, style, spec.explode);
  }
  if (value is Map) {
    return serializePathObject(spec.name, value, style, spec.explode);
  }
  return pathPrimitivePrefix(spec.name, style) + Uri.encodeComponent(value.toString());
}

String serializePathArray(String name, Iterable values, String style, bool explode) {
  final serialized = values.where((item) => item != null).map((item) => Uri.encodeComponent(item.toString())).toList();
  if (serialized.isEmpty) return pathPrefix(name, style);
  if (style == 'matrix') {
    if (explode) {
      return serialized.map((item) => ';$name=$item').join();
    }
    return ';$name=${serialized.join(',')}';
  }
  final separator = explode ? '.' : ',';
  return pathPrefix(name, style) + serialized.join(separator);
}

String serializePathObject(String name, Map values, String style, bool explode) {
  final entries = <String>[];
  final exploded = <String>[];
  values.forEach((key, value) {
    if (value == null) return;
    final escapedKey = Uri.encodeComponent(key.toString());
    final escapedValue = Uri.encodeComponent(value.toString());
    if (explode) {
      if (style == 'matrix') {
        exploded.add(';$escapedKey=$escapedValue');
      } else {
        exploded.add('$escapedKey=$escapedValue');
      }
    } else {
      entries.add(escapedKey);
      entries.add(escapedValue);
    }
  });
  if (style == 'matrix') {
    if (explode) return exploded.join();
    return ';$name=${entries.join(',')}';
  }
  if (explode) {
    final separator = style == 'label' ? '.' : ',';
    return pathPrefix(name, style) + exploded.join(separator);
  }
  return pathPrefix(name, style) + entries.join(',');
}

String pathPrefix(String name, String style) {
  if (style == 'label') return '.';
  if (style == 'matrix') return ';$name';
  return '';
}

String pathPrimitivePrefix(String name, String style) {
  return style == 'matrix' ? ';$name=' : pathPrefix(name, style);
}
class QueryParameterSpec {
  final String name;
  final dynamic value;
  final String style;
  final bool explode;
  final bool allowReserved;
  final String? contentType;

  const QueryParameterSpec(
    this.name,
    this.value,
    this.style,
    this.explode,
    this.allowReserved,
    this.contentType,
  );
}

String buildQueryString(List<QueryParameterSpec> parameters) {
  final pairs = <String>[];
  for (final parameter in parameters) {
    appendSerializedParameter(pairs, parameter);
  }
  return pairs.join('&');
}

void appendSerializedParameter(List<String> pairs, QueryParameterSpec parameter) {
  final value = parameter.value;
  if (value == null) return;

  final contentType = parameter.contentType;
  if (contentType != null && contentType.trim().isNotEmpty) {
    pairs.add('${urlEncode(parameter.name)}=${encodeQueryValue(jsonEncode(value), parameter.allowReserved)}');
    return;
  }

  final style = parameter.style.trim().isEmpty ? 'form' : parameter.style;
  if (style == 'deepObject' && value is Map) {
    appendDeepObjectParameter(pairs, parameter.name, value, parameter.allowReserved);
    return;
  }
  if (value is Iterable) {
    appendArrayParameter(pairs, parameter.name, value, style, parameter.explode, parameter.allowReserved);
    return;
  }
  if (value is Map) {
    appendObjectParameter(pairs, parameter.name, value, style, parameter.explode, parameter.allowReserved);
    return;
  }
  pairs.add('${urlEncode(parameter.name)}=${encodeQueryValue(value.toString(), parameter.allowReserved)}');
}

void appendArrayParameter(
  List<String> pairs,
  String name,
  Iterable values,
  String style,
  bool explode,
  bool allowReserved,
) {
  final serialized = values.where((item) => item != null).map((item) => item.toString()).toList();
  if (serialized.isEmpty) return;
  if (style == 'form' && explode) {
    for (final item in serialized) {
      pairs.add('${urlEncode(name)}=${encodeQueryValue(item, allowReserved)}');
    }
    return;
  }
  pairs.add('${urlEncode(name)}=${encodeQueryValue(serialized.join(','), allowReserved)}');
}

void appendObjectParameter(
  List<String> pairs,
  String name,
  Map values,
  String style,
  bool explode,
  bool allowReserved,
) {
  final serialized = <String>[];
  values.forEach((key, value) {
    if (value == null) return;
    if (style == 'form' && explode) {
      pairs.add('${urlEncode(key.toString())}=${encodeQueryValue(value.toString(), allowReserved)}');
      return;
    }
    serialized.add(key.toString());
    serialized.add(value.toString());
  });
  if (serialized.isNotEmpty) {
    pairs.add('${urlEncode(name)}=${encodeQueryValue(serialized.join(','), allowReserved)}');
  }
}

void appendDeepObjectParameter(List<String> pairs, String name, Map values, bool allowReserved) {
  values.forEach((key, value) {
    if (value != null) {
      pairs.add('${urlEncode('$name[$key]')}=${encodeQueryValue(value.toString(), allowReserved)}');
    }
  });
}

String encodeQueryValue(String value, bool allowReserved) {
  var encoded = urlEncode(value);
  if (!allowReserved) return encoded;
  const replacements = <String, String>{
    '%3A': ':',
    '%2F': '/',
    '%3F': '?',
    '%23': '#',
    '%5B': '[',
    '%5D': ']',
    '%40': '@',
    '%21': '!',
    '%24': r'$',
    '%26': '&',
    '%27': "'",
    '%28': '(',
    '%29': ')',
    '%2A': '*',
    '%2B': '+',
    '%2C': ',',
    '%3B': ';',
    '%3D': '=',
  };
  replacements.forEach((escaped, reserved) {
    encoded = encoded.replaceAll(escaped, reserved);
  });
  return encoded;
}

String urlEncode(String value) => Uri.encodeQueryComponent(value);
class HeaderParameterSpec {
  final dynamic value;
  final String style;
  final bool explode;
  final String? contentType;

  HeaderParameterSpec(this.value, this.style, this.explode, this.contentType);
}

Map<String, String>? buildRequestHeaders(
  Map<String, HeaderParameterSpec> headers, [
  Map<String, HeaderParameterSpec> cookies = const {},
]) {
  final requestHeaders = <String, String>{};

  headers.forEach((name, parameter) {
    final serialized = serializeParameterValue(parameter);
    if (serialized != null) {
      requestHeaders[name] = serialized;
    }
  });

  final cookieHeader = buildCookieHeader(cookies);
  if (cookieHeader != null && cookieHeader.isNotEmpty) {
    requestHeaders['Cookie'] = requestHeaders.containsKey('Cookie')
        ? '${requestHeaders['Cookie']}; $cookieHeader'
        : cookieHeader;
  }

  return requestHeaders.isEmpty ? null : requestHeaders;
}

String? buildCookieHeader(Map<String, HeaderParameterSpec> cookies) {
  final pairs = <String>[];
  cookies.forEach((name, parameter) {
    final serialized = serializeParameterValue(parameter);
    if (serialized != null) {
      pairs.add('${Uri.encodeComponent(name)}=${Uri.encodeComponent(serialized)}');
    }
  });
  return pairs.isEmpty ? null : pairs.join('; ');
}

String? serializeParameterValue(HeaderParameterSpec? parameter) {
  final value = parameter?.value;
  if (value == null) return null;
  if (parameter!.contentType != null && parameter.contentType!.trim().isNotEmpty) {
    return jsonEncode(value);
  }
  if (value is DateTime) return value.toIso8601String();
  if (value is Iterable) {
    return value
        .where((item) => item != null)
        .map((item) => item.toString())
        .whereType<String>()
        .join(',');
  }
  if (value is Map) {
    final serialized = <String>[];
    value.forEach((key, item) {
      if (item == null) return;
      if (parameter.explode) {
        serialized.add('$key=$item');
      } else {
        serialized.add(key.toString());
        serialized.add(item.toString());
      }
    });
    return serialized.join(',');
  }
  return value.toString();
}
