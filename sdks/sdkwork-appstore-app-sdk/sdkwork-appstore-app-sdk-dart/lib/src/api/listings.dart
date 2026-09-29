import 'dart:convert';
import '../http/client.dart';
import '../models.dart';

import 'paths.dart';
import 'response_helpers.dart';


class ListingsApi {
  final HttpClient _client;

  ListingsApi(this._client);

  /// Create listing for registered app
  Future<ListingResponse?> appstoreListingsCreate(ListingCreateRequest body, String idempotencyKey) async {
    final requestHeaders = buildRequestHeaders(
      <String, HeaderParameterSpec>{
        'Idempotency-Key': HeaderParameterSpec(idempotencyKey, 'simple', false, null),
      },
      <String, HeaderParameterSpec>{},
    );
    final payload = body.toJson();
    final response = await _client.post(ApiPaths.appPath('/listings'), body: payload, headers: requestHeaders, contentType: 'application/json');
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : ListingResponse.fromJson(map);
    })();
  }

  /// Retrieve listing detail
  Future<ListingResponse?> appstoreListingsRetrieve(String listingId) async {
    final response = await _client.get(ApiPaths.appPath('/listings/${serializePathParameter(listingId, const PathParameterSpec('listingId', 'simple', false))}'));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : ListingResponse.fromJson(map);
    })();
  }

  /// Update listing metadata
  Future<ListingResponse?> appstoreListingsUpdate(String listingId, ListingUpdateRequest body) async {
    final payload = body.toJson();
    final response = await _client.patch(ApiPaths.appPath('/listings/${serializePathParameter(listingId, const PathParameterSpec('listingId', 'simple', false))}'), body: payload, contentType: 'application/json');
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : ListingResponse.fromJson(map);
    })();
  }

  /// Upsert listing localization
  Future<ListingLocalizationResponse?> appstoreListingsLocalizationUpdate(String listingId, String locale, ListingLocalizationUpsertRequest body) async {
    final payload = body.toJson();
    final response = await _client.put(ApiPaths.appPath('/listings/${serializePathParameter(listingId, const PathParameterSpec('listingId', 'simple', false))}/localizations/${serializePathParameter(locale, const PathParameterSpec('locale', 'simple', false))}'), body: payload, contentType: 'application/json');
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : ListingLocalizationResponse.fromJson(map);
    })();
  }

  /// List listing media
  Future<ListingMediaListResponse?> appstoreListingsMediaList(String listingId) async {
    final response = await _client.get(ApiPaths.appPath('/listings/${serializePathParameter(listingId, const PathParameterSpec('listingId', 'simple', false))}/media'));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : ListingMediaListResponse.fromJson(map);
    })();
  }

  /// Attach listing media
  Future<ListingMediaResponse?> appstoreListingsMediaCreate(String listingId, ListingMediaAttachRequest body) async {
    final payload = body.toJson();
    final response = await _client.post(ApiPaths.appPath('/listings/${serializePathParameter(listingId, const PathParameterSpec('listingId', 'simple', false))}/media'), body: payload, contentType: 'application/json');
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : ListingMediaResponse.fromJson(map);
    })();
  }

  /// Remove listing media
  Future<void> appstoreListingsMediaDelete(String listingId, String mediaId) async {
    await _client.delete(ApiPaths.appPath('/listings/${serializePathParameter(listingId, const PathParameterSpec('listingId', 'simple', false))}/media/${serializePathParameter(mediaId, const PathParameterSpec('mediaId', 'simple', false))}'));
  }

  /// Bind listing categories
  Future<SdkWorkListResponse?> appstoreListingsCategoriesUpdate(String listingId, ListingCategoryBindRequest body) async {
    final payload = body.toJson();
    final response = await _client.put(ApiPaths.appPath('/listings/${serializePathParameter(listingId, const PathParameterSpec('listingId', 'simple', false))}/categories'), body: payload, contentType: 'application/json');
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : SdkWorkListResponse.fromJson(map);
    })();
  }

  /// Update regional availability
  Future<SdkWorkListResponse?> appstoreListingsRegionsUpdate(String listingId, RegionalAvailabilityUpdateRequest body) async {
    final payload = body.toJson();
    final response = await _client.put(ApiPaths.appPath('/listings/${serializePathParameter(listingId, const PathParameterSpec('listingId', 'simple', false))}/regions'), body: payload, contentType: 'application/json');
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : SdkWorkListResponse.fromJson(map);
    })();
  }

  /// List releases for listing
  Future<ListingReleaseListResponse?> appstoreListingsReleasesList(String listingId, [String? cursor, int? pageSize]) async {
    final query = buildQueryString([
      QueryParameterSpec('cursor', cursor, 'form', true, false, null),
      QueryParameterSpec('page_size', pageSize, 'form', true, false, null)
    ]);
    final response = await _client.get(ApiPaths.appendQueryString(ApiPaths.appPath('/listings/${serializePathParameter(listingId, const PathParameterSpec('listingId', 'simple', false))}/releases'), query));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : ListingReleaseListResponse.fromJson(map);
    })();
  }

  /// List release history for listing
  Future<ListingReleaseListResponse?> appstoreListingsReleasesHistoryList(String listingId, [String? cursor, int? pageSize]) async {
    final query = buildQueryString([
      QueryParameterSpec('cursor', cursor, 'form', true, false, null),
      QueryParameterSpec('page_size', pageSize, 'form', true, false, null)
    ]);
    final response = await _client.get(ApiPaths.appendQueryString(ApiPaths.appPath('/listings/${serializePathParameter(listingId, const PathParameterSpec('listingId', 'simple', false))}/releases/history'), query));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : ListingReleaseListResponse.fromJson(map);
    })();
  }

  /// List similar listings
  Future<SdkWorkListResponse?> appstoreListingsSimilarList(String listingId, [String? cursor, int? pageSize]) async {
    final query = buildQueryString([
      QueryParameterSpec('cursor', cursor, 'form', true, false, null),
      QueryParameterSpec('page_size', pageSize, 'form', true, false, null)
    ]);
    final response = await _client.get(ApiPaths.appendQueryString(ApiPaths.appPath('/listings/${serializePathParameter(listingId, const PathParameterSpec('listingId', 'simple', false))}/similar'), query));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : SdkWorkListResponse.fromJson(map);
    })();
  }

  /// List other listings from the same developer
  Future<SdkWorkListResponse?> appstoreListingsDeveloperOtherList(String listingId, [String? cursor, int? pageSize]) async {
    final query = buildQueryString([
      QueryParameterSpec('cursor', cursor, 'form', true, false, null),
      QueryParameterSpec('page_size', pageSize, 'form', true, false, null)
    ]);
    final response = await _client.get(ApiPaths.appendQueryString(ApiPaths.appPath('/listings/${serializePathParameter(listingId, const PathParameterSpec('listingId', 'simple', false))}/developer_other'), query));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : SdkWorkListResponse.fromJson(map);
    })();
  }

  /// Retrieve listing editorial content
  Future<SdkWorkResourceResponse?> appstoreListingsEditorialRetrieve(String listingId) async {
    final response = await _client.get(ApiPaths.appPath('/listings/${serializePathParameter(listingId, const PathParameterSpec('listingId', 'simple', false))}/editorial'));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : SdkWorkResourceResponse.fromJson(map);
    })();
  }

  /// List listing ratings
  Future<ListingRatingListResponse?> appstoreListingsRatingsList(String listingId, [String? cursor, int? pageSize]) async {
    final query = buildQueryString([
      QueryParameterSpec('cursor', cursor, 'form', true, false, null),
      QueryParameterSpec('page_size', pageSize, 'form', true, false, null)
    ]);
    final response = await _client.get(ApiPaths.appendQueryString(ApiPaths.appPath('/listings/${serializePathParameter(listingId, const PathParameterSpec('listingId', 'simple', false))}/ratings'), query));
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : ListingRatingListResponse.fromJson(map);
    })();
  }

  /// Upsert the current user rating for a listing
  Future<ListingRatingResponse?> appstoreListingsRatingsUpdate(String listingId, ListingRatingUpsertRequest body) async {
    final payload = body.toJson();
    final response = await _client.put(ApiPaths.appPath('/listings/${serializePathParameter(listingId, const PathParameterSpec('listingId', 'simple', false))}/ratings/me'), body: payload, contentType: 'application/json');
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : ListingRatingResponse.fromJson(map);
    })();
  }

  /// Submit listing for review
  Future<ListingSubmissionResponse?> appstoreListingsSubmissionsCreate(String listingId, ListingSubmissionCreateRequest body, String idempotencyKey) async {
    final requestHeaders = buildRequestHeaders(
      <String, HeaderParameterSpec>{
        'Idempotency-Key': HeaderParameterSpec(idempotencyKey, 'simple', false, null),
      },
      <String, HeaderParameterSpec>{},
    );
    final payload = body.toJson();
    final response = await _client.post(ApiPaths.appPath('/listings/${serializePathParameter(listingId, const PathParameterSpec('listingId', 'simple', false))}/submissions'), body: payload, headers: requestHeaders, contentType: 'application/json');
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : ListingSubmissionResponse.fromJson(map);
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
