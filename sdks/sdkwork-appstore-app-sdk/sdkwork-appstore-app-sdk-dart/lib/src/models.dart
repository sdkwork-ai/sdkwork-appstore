Map<String, dynamic>? _sdkworkAsMap(dynamic value) {
  if (value is Map<String, dynamic>) {
    return value;
  }
  if (value is Map) {
    return value.map((key, item) => MapEntry(key.toString(), item));
  }
  return null;
}

List<dynamic>? _sdkworkAsList(dynamic value) {
  return value is List ? value : null;
}

class ProblemDetail {
  final String? type;
  final String? title;
  final int? status;
  final String? detail;
  final String? instance;
  final int? code;
  final String? traceId;
  final String? i18nKey;
  final String? locale;
  final List<FieldError>? errors;

  ProblemDetail({
    this.type,
    this.title,
    this.status,
    this.detail,
    this.instance,
    this.code,
    this.traceId,
    this.i18nKey,
    this.locale,
    this.errors
  });

  factory ProblemDetail.fromJson(Map<String, dynamic> json) {
    return ProblemDetail(
      type: json['type']?.toString(),
      title: json['title']?.toString(),
      status: json['status'] is int ? json['status'] : null,
      detail: json['detail']?.toString(),
      instance: json['instance']?.toString(),
      code: json['code'] is int ? json['code'] : null,
      traceId: json['traceId']?.toString(),
      i18nKey: json['i18nKey']?.toString(),
      locale: json['locale']?.toString(),
      errors: (() {
        final list = _sdkworkAsList(json['errors']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => (() {
        final map = _sdkworkAsMap(item);
        return map == null ? null : FieldError.fromJson(map);
      })())
            .whereType<FieldError>()
            .toList();
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'type': type,
      'title': title,
      'status': status,
      'detail': detail,
      'instance': instance,
      'code': code,
      'traceId': traceId,
      'i18nKey': i18nKey,
      'locale': locale,
      'errors': errors?.map((item) => item.toJson()).toList(),
    };
  }
}

class MediaResource {
  final String? id;
  final String? kind;
  final String? url;
  final String? driveNodeId;

  MediaResource({
    this.id,
    this.kind,
    this.url,
    this.driveNodeId
  });

  factory MediaResource.fromJson(Map<String, dynamic> json) {
    return MediaResource(
      id: json['id']?.toString(),
      kind: json['kind']?.toString(),
      url: json['url']?.toString(),
      driveNodeId: json['driveNodeId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'kind': kind,
      'url': url,
      'driveNodeId': driveNodeId,
    };
  }
}

class ListingSummary {
  final String? id;
  final String? appId;
  final String? appKey;
  final String? displayName;
  final String? subtitle;
  final String? listingSlug;
  final String? pricingModel;
  final MediaResource? icon;
  final String? developerName;
  final String? description;
  final String? currentVersion;
  final String? fileSizeBytes;
  final String? whatsNewSummary;
  final String? releasedAt;
  final String? averageRating;
  final int? ratingCount;

  ListingSummary({
    this.id,
    this.appId,
    this.appKey,
    this.displayName,
    this.subtitle,
    this.listingSlug,
    this.pricingModel,
    this.icon,
    this.developerName,
    this.description,
    this.currentVersion,
    this.fileSizeBytes,
    this.whatsNewSummary,
    this.releasedAt,
    this.averageRating,
    this.ratingCount
  });

  factory ListingSummary.fromJson(Map<String, dynamic> json) {
    return ListingSummary(
      id: json['id']?.toString(),
      appId: json['appId']?.toString(),
      appKey: json['appKey']?.toString(),
      displayName: json['displayName']?.toString(),
      subtitle: json['subtitle']?.toString(),
      listingSlug: json['listingSlug']?.toString(),
      pricingModel: json['pricingModel']?.toString(),
      icon: (() {
        final map = _sdkworkAsMap(json['icon']);
        return map == null ? null : MediaResource.fromJson(map);
      })(),
      developerName: json['developerName']?.toString(),
      description: json['description']?.toString(),
      currentVersion: json['currentVersion']?.toString(),
      fileSizeBytes: json['fileSizeBytes']?.toString(),
      whatsNewSummary: json['whatsNewSummary']?.toString(),
      releasedAt: json['releasedAt']?.toString(),
      averageRating: json['averageRating']?.toString(),
      ratingCount: json['ratingCount'] is int ? json['ratingCount'] : null
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'appId': appId,
      'appKey': appKey,
      'displayName': displayName,
      'subtitle': subtitle,
      'listingSlug': listingSlug,
      'pricingModel': pricingModel,
      'icon': icon?.toJson(),
      'developerName': developerName,
      'description': description,
      'currentVersion': currentVersion,
      'fileSizeBytes': fileSizeBytes,
      'whatsNewSummary': whatsNewSummary,
      'releasedAt': releasedAt,
      'averageRating': averageRating,
      'ratingCount': ratingCount,
    };
  }
}

class ListingResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  ListingResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory ListingResponse.fromJson(Map<String, dynamic> json) {
    return ListingResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class ListingDetail {
  final String? id;
  final String? appId;
  final String? appKey;
  final String? displayName;
  final String? subtitle;
  final String? listingSlug;
  final String? pricingModel;
  final MediaResource? icon;
  final String? developerName;
  final String? description;
  final String? currentVersion;
  final String? fileSizeBytes;
  final String? whatsNewSummary;
  final String? releasedAt;
  final String? averageRating;
  final int? ratingCount;
  final String? listingStatus;
  final String? reviewStatus;
  final String? commentsThreadId;
  final String? commerceProductId;
  final String? currentReleaseId;
  final List<String>? categories;

  ListingDetail({
    this.id,
    this.appId,
    this.appKey,
    this.displayName,
    this.subtitle,
    this.listingSlug,
    this.pricingModel,
    this.icon,
    this.developerName,
    this.description,
    this.currentVersion,
    this.fileSizeBytes,
    this.whatsNewSummary,
    this.releasedAt,
    this.averageRating,
    this.ratingCount,
    this.listingStatus,
    this.reviewStatus,
    this.commentsThreadId,
    this.commerceProductId,
    this.currentReleaseId,
    this.categories
  });

  factory ListingDetail.fromJson(Map<String, dynamic> json) {
    return ListingDetail(
      id: json['id']?.toString(),
      appId: json['appId']?.toString(),
      appKey: json['appKey']?.toString(),
      displayName: json['displayName']?.toString(),
      subtitle: json['subtitle']?.toString(),
      listingSlug: json['listingSlug']?.toString(),
      pricingModel: json['pricingModel']?.toString(),
      icon: (() {
        final map = _sdkworkAsMap(json['icon']);
        return map == null ? null : MediaResource.fromJson(map);
      })(),
      developerName: json['developerName']?.toString(),
      description: json['description']?.toString(),
      currentVersion: json['currentVersion']?.toString(),
      fileSizeBytes: json['fileSizeBytes']?.toString(),
      whatsNewSummary: json['whatsNewSummary']?.toString(),
      releasedAt: json['releasedAt']?.toString(),
      averageRating: json['averageRating']?.toString(),
      ratingCount: json['ratingCount'] is int ? json['ratingCount'] : null,
      listingStatus: json['listingStatus']?.toString(),
      reviewStatus: json['reviewStatus']?.toString(),
      commentsThreadId: json['commentsThreadId']?.toString(),
      commerceProductId: json['commerceProductId']?.toString(),
      currentReleaseId: json['currentReleaseId']?.toString(),
      categories: (() {
        final list = _sdkworkAsList(json['categories']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => item?.toString())
            .whereType<String>()
            .toList();
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'appId': appId,
      'appKey': appKey,
      'displayName': displayName,
      'subtitle': subtitle,
      'listingSlug': listingSlug,
      'pricingModel': pricingModel,
      'icon': icon?.toJson(),
      'developerName': developerName,
      'description': description,
      'currentVersion': currentVersion,
      'fileSizeBytes': fileSizeBytes,
      'whatsNewSummary': whatsNewSummary,
      'releasedAt': releasedAt,
      'averageRating': averageRating,
      'ratingCount': ratingCount,
      'listingStatus': listingStatus,
      'reviewStatus': reviewStatus,
      'commentsThreadId': commentsThreadId,
      'commerceProductId': commerceProductId,
      'currentReleaseId': currentReleaseId,
      'categories': categories?.map((item) => item).toList(),
    };
  }
}

class ListingCreateRequest {
  final String? appId;
  final String? appKey;
  final String? publisherId;
  final String? listingSlug;
  final String? pricingModel;
  final String? defaultLocale;

  ListingCreateRequest({
    this.appId,
    this.appKey,
    this.publisherId,
    this.listingSlug,
    this.pricingModel,
    this.defaultLocale
  });

  factory ListingCreateRequest.fromJson(Map<String, dynamic> json) {
    return ListingCreateRequest(
      appId: json['appId']?.toString(),
      appKey: json['appKey']?.toString(),
      publisherId: json['publisherId']?.toString(),
      listingSlug: json['listingSlug']?.toString(),
      pricingModel: json['pricingModel']?.toString(),
      defaultLocale: json['defaultLocale']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'appId': appId,
      'appKey': appKey,
      'publisherId': publisherId,
      'listingSlug': listingSlug,
      'pricingModel': pricingModel,
      'defaultLocale': defaultLocale,
    };
  }
}

class PublisherAppBootstrapRequest {
  final String? appKey;
  final String? displayName;
  final String? defaultLocale;
  final String? appType;
  final String? listingSlug;
  final String? pricingModel;

  PublisherAppBootstrapRequest({
    this.appKey,
    this.displayName,
    this.defaultLocale,
    this.appType,
    this.listingSlug,
    this.pricingModel
  });

  factory PublisherAppBootstrapRequest.fromJson(Map<String, dynamic> json) {
    return PublisherAppBootstrapRequest(
      appKey: json['appKey']?.toString(),
      displayName: json['displayName']?.toString(),
      defaultLocale: json['defaultLocale']?.toString(),
      appType: json['appType']?.toString(),
      listingSlug: json['listingSlug']?.toString(),
      pricingModel: json['pricingModel']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'appKey': appKey,
      'displayName': displayName,
      'defaultLocale': defaultLocale,
      'appType': appType,
      'listingSlug': listingSlug,
      'pricingModel': pricingModel,
    };
  }
}

class PublisherAppBootstrapResponse {
  final StoreAppSummary? app;
  final ListingSummary? listing;

  PublisherAppBootstrapResponse({
    this.app,
    this.listing
  });

  factory PublisherAppBootstrapResponse.fromJson(Map<String, dynamic> json) {
    return PublisherAppBootstrapResponse(
      app: (() {
        final map = _sdkworkAsMap(json['app']);
        return map == null ? null : StoreAppSummary.fromJson(map);
      })(),
      listing: (() {
        final map = _sdkworkAsMap(json['listing']);
        return map == null ? null : ListingSummary.fromJson(map);
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'app': app?.toJson(),
      'listing': listing?.toJson(),
    };
  }
}

class StoreAppSummary {
  final String? id;
  final String? appKey;
  final String? appSlug;
  final String? displayName;
  final String? defaultLocale;
  final String? appType;
  final String? appStatus;
  final String? publisherId;
  final String? currentListingId;

  StoreAppSummary({
    this.id,
    this.appKey,
    this.appSlug,
    this.displayName,
    this.defaultLocale,
    this.appType,
    this.appStatus,
    this.publisherId,
    this.currentListingId
  });

  factory StoreAppSummary.fromJson(Map<String, dynamic> json) {
    return StoreAppSummary(
      id: json['id']?.toString(),
      appKey: json['appKey']?.toString(),
      appSlug: json['appSlug']?.toString(),
      displayName: json['displayName']?.toString(),
      defaultLocale: json['defaultLocale']?.toString(),
      appType: json['appType']?.toString(),
      appStatus: json['appStatus']?.toString(),
      publisherId: json['publisherId']?.toString(),
      currentListingId: json['currentListingId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'appKey': appKey,
      'appSlug': appSlug,
      'displayName': displayName,
      'defaultLocale': defaultLocale,
      'appType': appType,
      'appStatus': appStatus,
      'publisherId': publisherId,
      'currentListingId': currentListingId,
    };
  }
}

class ListingUpdateRequest {
  final String? pricingModel;
  final String? officialWebsiteUrl;
  final String? supportUrl;
  final String? privacyPolicyUrl;

  ListingUpdateRequest({
    this.pricingModel,
    this.officialWebsiteUrl,
    this.supportUrl,
    this.privacyPolicyUrl
  });

  factory ListingUpdateRequest.fromJson(Map<String, dynamic> json) {
    return ListingUpdateRequest(
      pricingModel: json['pricingModel']?.toString(),
      officialWebsiteUrl: json['officialWebsiteUrl']?.toString(),
      supportUrl: json['supportUrl']?.toString(),
      privacyPolicyUrl: json['privacyPolicyUrl']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'pricingModel': pricingModel,
      'officialWebsiteUrl': officialWebsiteUrl,
      'supportUrl': supportUrl,
      'privacyPolicyUrl': privacyPolicyUrl,
    };
  }
}

class ListingSummaryListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  ListingSummaryListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory ListingSummaryListResponse.fromJson(Map<String, dynamic> json) {
    return ListingSummaryListResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class Category {
  final String? id;
  final String? categoryCode;
  final String? parentCategoryId;
  final int? categoryLevel;
  final String? status;
  final int? sortOrder;
  final String? iconMediaResourceId;
  final List<CategoryLocalization>? localizations;

  Category({
    this.id,
    this.categoryCode,
    this.parentCategoryId,
    this.categoryLevel,
    this.status,
    this.sortOrder,
    this.iconMediaResourceId,
    this.localizations
  });

  factory Category.fromJson(Map<String, dynamic> json) {
    return Category(
      id: json['id']?.toString(),
      categoryCode: json['categoryCode']?.toString(),
      parentCategoryId: json['parentCategoryId']?.toString(),
      categoryLevel: json['categoryLevel'] is int ? json['categoryLevel'] : null,
      status: json['status']?.toString(),
      sortOrder: json['sortOrder'] is int ? json['sortOrder'] : null,
      iconMediaResourceId: json['iconMediaResourceId']?.toString(),
      localizations: (() {
        final list = _sdkworkAsList(json['localizations']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => (() {
        final map = _sdkworkAsMap(item);
        return map == null ? null : CategoryLocalization.fromJson(map);
      })())
            .whereType<CategoryLocalization>()
            .toList();
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'categoryCode': categoryCode,
      'parentCategoryId': parentCategoryId,
      'categoryLevel': categoryLevel,
      'status': status,
      'sortOrder': sortOrder,
      'iconMediaResourceId': iconMediaResourceId,
      'localizations': localizations?.map((item) => item.toJson()).toList(),
    };
  }
}

class CategoryLocalization {
  final String? id;
  final String? locale;
  final String? displayName;
  final String? description;

  CategoryLocalization({
    this.id,
    this.locale,
    this.displayName,
    this.description
  });

  factory CategoryLocalization.fromJson(Map<String, dynamic> json) {
    return CategoryLocalization(
      id: json['id']?.toString(),
      locale: json['locale']?.toString(),
      displayName: json['displayName']?.toString(),
      description: json['description']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'locale': locale,
      'displayName': displayName,
      'description': description,
    };
  }
}

class CatalogCollection {
  final String? id;
  final String? collectionCode;
  final String? collectionType;
  final String? status;
  final String? audienceScope;
  final int? sortOrder;
  final String? coverMediaResourceId;
  final String? startsAt;
  final String? endsAt;
  final List<CatalogCollectionLocalization>? localizations;
  final List<CatalogCollectionItem>? items;

  CatalogCollection({
    this.id,
    this.collectionCode,
    this.collectionType,
    this.status,
    this.audienceScope,
    this.sortOrder,
    this.coverMediaResourceId,
    this.startsAt,
    this.endsAt,
    this.localizations,
    this.items
  });

  factory CatalogCollection.fromJson(Map<String, dynamic> json) {
    return CatalogCollection(
      id: json['id']?.toString(),
      collectionCode: json['collectionCode']?.toString(),
      collectionType: json['collectionType']?.toString(),
      status: json['status']?.toString(),
      audienceScope: json['audienceScope']?.toString(),
      sortOrder: json['sortOrder'] is int ? json['sortOrder'] : null,
      coverMediaResourceId: json['coverMediaResourceId']?.toString(),
      startsAt: json['startsAt']?.toString(),
      endsAt: json['endsAt']?.toString(),
      localizations: (() {
        final list = _sdkworkAsList(json['localizations']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => (() {
        final map = _sdkworkAsMap(item);
        return map == null ? null : CatalogCollectionLocalization.fromJson(map);
      })())
            .whereType<CatalogCollectionLocalization>()
            .toList();
      })(),
      items: (() {
        final list = _sdkworkAsList(json['items']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => (() {
        final map = _sdkworkAsMap(item);
        return map == null ? null : CatalogCollectionItem.fromJson(map);
      })())
            .whereType<CatalogCollectionItem>()
            .toList();
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'collectionCode': collectionCode,
      'collectionType': collectionType,
      'status': status,
      'audienceScope': audienceScope,
      'sortOrder': sortOrder,
      'coverMediaResourceId': coverMediaResourceId,
      'startsAt': startsAt,
      'endsAt': endsAt,
      'localizations': localizations?.map((item) => item.toJson()).toList(),
      'items': items?.map((item) => item.toJson()).toList(),
    };
  }
}

class CatalogCollectionLocalization {
  final String? id;
  final String? locale;
  final String? displayName;
  final String? description;

  CatalogCollectionLocalization({
    this.id,
    this.locale,
    this.displayName,
    this.description
  });

  factory CatalogCollectionLocalization.fromJson(Map<String, dynamic> json) {
    return CatalogCollectionLocalization(
      id: json['id']?.toString(),
      locale: json['locale']?.toString(),
      displayName: json['displayName']?.toString(),
      description: json['description']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'locale': locale,
      'displayName': displayName,
      'description': description,
    };
  }
}

class CatalogCollectionItem {
  final String? id;
  final String? listingId;
  final int? sortOrder;
  final Map<String, dynamic>? highlight;
  final String? startsAt;
  final String? endsAt;

  CatalogCollectionItem({
    this.id,
    this.listingId,
    this.sortOrder,
    this.highlight,
    this.startsAt,
    this.endsAt
  });

  factory CatalogCollectionItem.fromJson(Map<String, dynamic> json) {
    return CatalogCollectionItem(
      id: json['id']?.toString(),
      listingId: json['listingId']?.toString(),
      sortOrder: json['sortOrder'] is int ? json['sortOrder'] : null,
      highlight: _sdkworkAsMap(json['highlight']),
      startsAt: json['startsAt']?.toString(),
      endsAt: json['endsAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'listingId': listingId,
      'sortOrder': sortOrder,
      'highlight': highlight,
      'startsAt': startsAt,
      'endsAt': endsAt,
    };
  }
}

class CatalogFeaturedSlot {
  final String? id;
  final String? slotCode;
  final String? listingId;
  final String? status;
  final String? audienceScope;
  final String? platformScope;
  final List<String>? regionScope;
  final String? startsAt;
  final String? endsAt;

  CatalogFeaturedSlot({
    this.id,
    this.slotCode,
    this.listingId,
    this.status,
    this.audienceScope,
    this.platformScope,
    this.regionScope,
    this.startsAt,
    this.endsAt
  });

  factory CatalogFeaturedSlot.fromJson(Map<String, dynamic> json) {
    return CatalogFeaturedSlot(
      id: json['id']?.toString(),
      slotCode: json['slotCode']?.toString(),
      listingId: json['listingId']?.toString(),
      status: json['status']?.toString(),
      audienceScope: json['audienceScope']?.toString(),
      platformScope: json['platformScope']?.toString(),
      regionScope: (() {
        final list = _sdkworkAsList(json['regionScope']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => item?.toString())
            .whereType<String>()
            .toList();
      })(),
      startsAt: json['startsAt']?.toString(),
      endsAt: json['endsAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'slotCode': slotCode,
      'listingId': listingId,
      'status': status,
      'audienceScope': audienceScope,
      'platformScope': platformScope,
      'regionScope': regionScope?.map((item) => item).toList(),
      'startsAt': startsAt,
      'endsAt': endsAt,
    };
  }
}

class CatalogChartSnapshot {
  final String? id;
  final String? chartCode;
  final String? snapshotDate;
  final String? locale;
  final String? platformScope;
  final dynamic rankingJson;
  final String? generatedAt;

  CatalogChartSnapshot({
    this.id,
    this.chartCode,
    this.snapshotDate,
    this.locale,
    this.platformScope,
    this.rankingJson,
    this.generatedAt
  });

  factory CatalogChartSnapshot.fromJson(Map<String, dynamic> json) {
    return CatalogChartSnapshot(
      id: json['id']?.toString(),
      chartCode: json['chartCode']?.toString(),
      snapshotDate: json['snapshotDate']?.toString(),
      locale: json['locale']?.toString(),
      platformScope: json['platformScope']?.toString(),
      rankingJson: json['rankingJson'],
      generatedAt: json['generatedAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'chartCode': chartCode,
      'snapshotDate': snapshotDate,
      'locale': locale,
      'platformScope': platformScope,
      'rankingJson': rankingJson,
      'generatedAt': generatedAt,
    };
  }
}

class HomeFeedData {
  final List<CatalogFeaturedSlot>? featuredSlots;
  final List<CatalogCollection>? collections;
  final List<CatalogChartSnapshot>? charts;

  HomeFeedData({
    this.featuredSlots,
    this.collections,
    this.charts
  });

  factory HomeFeedData.fromJson(Map<String, dynamic> json) {
    return HomeFeedData(
      featuredSlots: (() {
        final list = _sdkworkAsList(json['featuredSlots']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => (() {
        final map = _sdkworkAsMap(item);
        return map == null ? null : CatalogFeaturedSlot.fromJson(map);
      })())
            .whereType<CatalogFeaturedSlot>()
            .toList();
      })(),
      collections: (() {
        final list = _sdkworkAsList(json['collections']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => (() {
        final map = _sdkworkAsMap(item);
        return map == null ? null : CatalogCollection.fromJson(map);
      })())
            .whereType<CatalogCollection>()
            .toList();
      })(),
      charts: (() {
        final list = _sdkworkAsList(json['charts']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => (() {
        final map = _sdkworkAsMap(item);
        return map == null ? null : CatalogChartSnapshot.fromJson(map);
      })())
            .whereType<CatalogChartSnapshot>()
            .toList();
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'featuredSlots': featuredSlots?.map((item) => item.toJson()).toList(),
      'collections': collections?.map((item) => item.toJson()).toList(),
      'charts': charts?.map((item) => item.toJson()).toList(),
    };
  }
}

class HomeFeedResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  HomeFeedResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory HomeFeedResponse.fromJson(Map<String, dynamic> json) {
    return HomeFeedResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class CategoryListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  CategoryListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory CategoryListResponse.fromJson(Map<String, dynamic> json) {
    return CategoryListResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class CollectionListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  CollectionListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory CollectionListResponse.fromJson(Map<String, dynamic> json) {
    return CollectionListResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class FeaturedListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  FeaturedListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory FeaturedListResponse.fromJson(Map<String, dynamic> json) {
    return FeaturedListResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class ListingLocalizationUpsertRequest {
  final String? displayName;
  final String? subtitle;
  final String? shortDescription;
  final String? fullDescription;
  final List<String>? keywords;

  ListingLocalizationUpsertRequest({
    this.displayName,
    this.subtitle,
    this.shortDescription,
    this.fullDescription,
    this.keywords
  });

  factory ListingLocalizationUpsertRequest.fromJson(Map<String, dynamic> json) {
    return ListingLocalizationUpsertRequest(
      displayName: json['displayName']?.toString(),
      subtitle: json['subtitle']?.toString(),
      shortDescription: json['shortDescription']?.toString(),
      fullDescription: json['fullDescription']?.toString(),
      keywords: (() {
        final list = _sdkworkAsList(json['keywords']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => item?.toString())
            .whereType<String>()
            .toList();
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'displayName': displayName,
      'subtitle': subtitle,
      'shortDescription': shortDescription,
      'fullDescription': fullDescription,
      'keywords': keywords?.map((item) => item).toList(),
    };
  }
}

class ListingLocalization {
  final String? id;
  final String? locale;
  final String? displayName;
  final String? subtitle;
  final String? shortDescription;
  final String? fullDescription;
  final String? whatsNewSummary;
  final List<String>? keywords;

  ListingLocalization({
    this.id,
    this.locale,
    this.displayName,
    this.subtitle,
    this.shortDescription,
    this.fullDescription,
    this.whatsNewSummary,
    this.keywords
  });

  factory ListingLocalization.fromJson(Map<String, dynamic> json) {
    return ListingLocalization(
      id: json['id']?.toString(),
      locale: json['locale']?.toString(),
      displayName: json['displayName']?.toString(),
      subtitle: json['subtitle']?.toString(),
      shortDescription: json['shortDescription']?.toString(),
      fullDescription: json['fullDescription']?.toString(),
      whatsNewSummary: json['whatsNewSummary']?.toString(),
      keywords: (() {
        final list = _sdkworkAsList(json['keywords']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => item?.toString())
            .whereType<String>()
            .toList();
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'locale': locale,
      'displayName': displayName,
      'subtitle': subtitle,
      'shortDescription': shortDescription,
      'fullDescription': fullDescription,
      'whatsNewSummary': whatsNewSummary,
      'keywords': keywords?.map((item) => item).toList(),
    };
  }
}

class ListingLocalizationResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  ListingLocalizationResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory ListingLocalizationResponse.fromJson(Map<String, dynamic> json) {
    return ListingLocalizationResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class ListingMediaAttachRequest {
  final String? mediaRole;
  final String? mediaResourceId;
  final String? platformScope;
  final String? locale;

  ListingMediaAttachRequest({
    this.mediaRole,
    this.mediaResourceId,
    this.platformScope,
    this.locale
  });

  factory ListingMediaAttachRequest.fromJson(Map<String, dynamic> json) {
    return ListingMediaAttachRequest(
      mediaRole: json['mediaRole']?.toString(),
      mediaResourceId: json['mediaResourceId']?.toString(),
      platformScope: json['platformScope']?.toString(),
      locale: json['locale']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'mediaRole': mediaRole,
      'mediaResourceId': mediaResourceId,
      'platformScope': platformScope,
      'locale': locale,
    };
  }
}

class ListingMedia {
  final String? id;
  final String? mediaRole;
  final String? mediaResourceId;
  final String? driveNodeId;
  final String? platformScope;
  final int? sortOrder;
  final String? locale;

  ListingMedia({
    this.id,
    this.mediaRole,
    this.mediaResourceId,
    this.driveNodeId,
    this.platformScope,
    this.sortOrder,
    this.locale
  });

  factory ListingMedia.fromJson(Map<String, dynamic> json) {
    return ListingMedia(
      id: json['id']?.toString(),
      mediaRole: json['mediaRole']?.toString(),
      mediaResourceId: json['mediaResourceId']?.toString(),
      driveNodeId: json['driveNodeId']?.toString(),
      platformScope: json['platformScope']?.toString(),
      sortOrder: json['sortOrder'] is int ? json['sortOrder'] : null,
      locale: json['locale']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'mediaRole': mediaRole,
      'mediaResourceId': mediaResourceId,
      'driveNodeId': driveNodeId,
      'platformScope': platformScope,
      'sortOrder': sortOrder,
      'locale': locale,
    };
  }
}

class ListingMediaResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  ListingMediaResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory ListingMediaResponse.fromJson(Map<String, dynamic> json) {
    return ListingMediaResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class ListingMediaListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  ListingMediaListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory ListingMediaListResponse.fromJson(Map<String, dynamic> json) {
    return ListingMediaListResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class ListingReleaseListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  ListingReleaseListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory ListingReleaseListResponse.fromJson(Map<String, dynamic> json) {
    return ListingReleaseListResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class ListingCategoryBindRequest {
  final String? primaryCategoryId;
  final List<String>? categoryIds;

  ListingCategoryBindRequest({
    this.primaryCategoryId,
    this.categoryIds
  });

  factory ListingCategoryBindRequest.fromJson(Map<String, dynamic> json) {
    return ListingCategoryBindRequest(
      primaryCategoryId: json['primaryCategoryId']?.toString(),
      categoryIds: (() {
        final list = _sdkworkAsList(json['categoryIds']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => item?.toString())
            .whereType<String>()
            .toList();
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'primaryCategoryId': primaryCategoryId,
      'categoryIds': categoryIds?.map((item) => item).toList(),
    };
  }
}

class RegionalAvailabilityUpdateRequest {
  final List<Map<String, dynamic>>? regions;

  RegionalAvailabilityUpdateRequest({
    this.regions
  });

  factory RegionalAvailabilityUpdateRequest.fromJson(Map<String, dynamic> json) {
    return RegionalAvailabilityUpdateRequest(
      regions: (() {
        final list = _sdkworkAsList(json['regions']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => _sdkworkAsMap(item))
            .whereType<Map<String, dynamic>>()
            .toList();
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'regions': regions?.map((item) => item).toList(),
    };
  }
}

class RegionalAvailabilityListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  RegionalAvailabilityListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory RegionalAvailabilityListResponse.fromJson(Map<String, dynamic> json) {
    return RegionalAvailabilityListResponse(
      code: json['code'] is int ? json['code'] : null,
      data: json['data'],
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class ListingSubmissionCreateRequest {
  final String? submissionType;
  final String? releaseId;

  ListingSubmissionCreateRequest({
    this.submissionType,
    this.releaseId
  });

  factory ListingSubmissionCreateRequest.fromJson(Map<String, dynamic> json) {
    return ListingSubmissionCreateRequest(
      submissionType: json['submissionType']?.toString(),
      releaseId: json['releaseId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'submissionType': submissionType,
      'releaseId': releaseId,
    };
  }
}

class ListingSubmission {
  final String? id;
  final String? submissionNo;
  final String? submissionType;
  final String? submissionStatus;
  final String? submittedBy;
  final String? submittedAt;
  final String? releaseId;

  ListingSubmission({
    this.id,
    this.submissionNo,
    this.submissionType,
    this.submissionStatus,
    this.submittedBy,
    this.submittedAt,
    this.releaseId
  });

  factory ListingSubmission.fromJson(Map<String, dynamic> json) {
    return ListingSubmission(
      id: json['id']?.toString(),
      submissionNo: json['submissionNo']?.toString(),
      submissionType: json['submissionType']?.toString(),
      submissionStatus: json['submissionStatus']?.toString(),
      submittedBy: json['submittedBy']?.toString(),
      submittedAt: json['submittedAt']?.toString(),
      releaseId: json['releaseId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'submissionNo': submissionNo,
      'submissionType': submissionType,
      'submissionStatus': submissionStatus,
      'submittedBy': submittedBy,
      'submittedAt': submittedAt,
      'releaseId': releaseId,
    };
  }
}

class ListingSubmissionResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  ListingSubmissionResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory ListingSubmissionResponse.fromJson(Map<String, dynamic> json) {
    return ListingSubmissionResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class PublisherCreateRequest {
  final String? displayName;
  final String? legalName;
  final String? supportEmail;
  final String? websiteUrl;
  final String? publisherType;

  PublisherCreateRequest({
    this.displayName,
    this.legalName,
    this.supportEmail,
    this.websiteUrl,
    this.publisherType
  });

  factory PublisherCreateRequest.fromJson(Map<String, dynamic> json) {
    return PublisherCreateRequest(
      displayName: json['displayName']?.toString(),
      legalName: json['legalName']?.toString(),
      supportEmail: json['supportEmail']?.toString(),
      websiteUrl: json['websiteUrl']?.toString(),
      publisherType: json['publisherType']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'displayName': displayName,
      'legalName': legalName,
      'supportEmail': supportEmail,
      'websiteUrl': websiteUrl,
      'publisherType': publisherType,
    };
  }
}

class PublisherUpdateRequest {
  final String? displayName;
  final String? websiteUrl;
  final String? supportEmail;

  PublisherUpdateRequest({
    this.displayName,
    this.websiteUrl,
    this.supportEmail
  });

  factory PublisherUpdateRequest.fromJson(Map<String, dynamic> json) {
    return PublisherUpdateRequest(
      displayName: json['displayName']?.toString(),
      websiteUrl: json['websiteUrl']?.toString(),
      supportEmail: json['supportEmail']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'displayName': displayName,
      'websiteUrl': websiteUrl,
      'supportEmail': supportEmail,
    };
  }
}

class Publisher {
  final String? id;
  final String? publisherNo;
  final String? publisherType;
  final String? displayName;
  final String? legalName;
  final String? status;
  final String? verificationStatus;
  final String? websiteUrl;
  final String? supportEmail;
  final String? logoMediaResourceId;
  final String? ownerUserId;
  final String? verifiedAt;

  Publisher({
    this.id,
    this.publisherNo,
    this.publisherType,
    this.displayName,
    this.legalName,
    this.status,
    this.verificationStatus,
    this.websiteUrl,
    this.supportEmail,
    this.logoMediaResourceId,
    this.ownerUserId,
    this.verifiedAt
  });

  factory Publisher.fromJson(Map<String, dynamic> json) {
    return Publisher(
      id: json['id']?.toString(),
      publisherNo: json['publisherNo']?.toString(),
      publisherType: json['publisherType']?.toString(),
      displayName: json['displayName']?.toString(),
      legalName: json['legalName']?.toString(),
      status: json['status']?.toString(),
      verificationStatus: json['verificationStatus']?.toString(),
      websiteUrl: json['websiteUrl']?.toString(),
      supportEmail: json['supportEmail']?.toString(),
      logoMediaResourceId: json['logoMediaResourceId']?.toString(),
      ownerUserId: json['ownerUserId']?.toString(),
      verifiedAt: json['verifiedAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'publisherNo': publisherNo,
      'publisherType': publisherType,
      'displayName': displayName,
      'legalName': legalName,
      'status': status,
      'verificationStatus': verificationStatus,
      'websiteUrl': websiteUrl,
      'supportEmail': supportEmail,
      'logoMediaResourceId': logoMediaResourceId,
      'ownerUserId': ownerUserId,
      'verifiedAt': verifiedAt,
    };
  }
}

class PublisherResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  PublisherResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory PublisherResponse.fromJson(Map<String, dynamic> json) {
    return PublisherResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class PublisherMemberInviteRequest {
  final String? userId;
  final String? memberRole;

  PublisherMemberInviteRequest({
    this.userId,
    this.memberRole
  });

  factory PublisherMemberInviteRequest.fromJson(Map<String, dynamic> json) {
    return PublisherMemberInviteRequest(
      userId: json['userId']?.toString(),
      memberRole: json['memberRole']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'userId': userId,
      'memberRole': memberRole,
    };
  }
}

class PublisherMember {
  final String? id;
  final String? userId;
  final String? memberRole;
  final String? memberStatus;
  final String? invitedBy;
  final String? joinedAt;

  PublisherMember({
    this.id,
    this.userId,
    this.memberRole,
    this.memberStatus,
    this.invitedBy,
    this.joinedAt
  });

  factory PublisherMember.fromJson(Map<String, dynamic> json) {
    return PublisherMember(
      id: json['id']?.toString(),
      userId: json['userId']?.toString(),
      memberRole: json['memberRole']?.toString(),
      memberStatus: json['memberStatus']?.toString(),
      invitedBy: json['invitedBy']?.toString(),
      joinedAt: json['joinedAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'userId': userId,
      'memberRole': memberRole,
      'memberStatus': memberStatus,
      'invitedBy': invitedBy,
      'joinedAt': joinedAt,
    };
  }
}

class PublisherMemberListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  PublisherMemberListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory PublisherMemberListResponse.fromJson(Map<String, dynamic> json) {
    return PublisherMemberListResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class PublisherMemberResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  PublisherMemberResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory PublisherMemberResponse.fromJson(Map<String, dynamic> json) {
    return PublisherMemberResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class PublisherVerificationSubmitRequest {
  final String? verificationType;
  final Map<String, dynamic>? credentialSnapshot;
  final String? evidenceMediaResourceId;

  PublisherVerificationSubmitRequest({
    this.verificationType,
    this.credentialSnapshot,
    this.evidenceMediaResourceId
  });

  factory PublisherVerificationSubmitRequest.fromJson(Map<String, dynamic> json) {
    return PublisherVerificationSubmitRequest(
      verificationType: json['verificationType']?.toString(),
      credentialSnapshot: _sdkworkAsMap(json['credentialSnapshot']),
      evidenceMediaResourceId: json['evidenceMediaResourceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'verificationType': verificationType,
      'credentialSnapshot': credentialSnapshot,
      'evidenceMediaResourceId': evidenceMediaResourceId,
    };
  }
}

class PublisherVerification {
  final String? id;
  final String? verificationType;
  final String? verificationStatus;
  final String? reviewedBy;
  final String? reviewedAt;
  final String? expiresAt;

  PublisherVerification({
    this.id,
    this.verificationType,
    this.verificationStatus,
    this.reviewedBy,
    this.reviewedAt,
    this.expiresAt
  });

  factory PublisherVerification.fromJson(Map<String, dynamic> json) {
    return PublisherVerification(
      id: json['id']?.toString(),
      verificationType: json['verificationType']?.toString(),
      verificationStatus: json['verificationStatus']?.toString(),
      reviewedBy: json['reviewedBy']?.toString(),
      reviewedAt: json['reviewedAt']?.toString(),
      expiresAt: json['expiresAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'verificationType': verificationType,
      'verificationStatus': verificationStatus,
      'reviewedBy': reviewedBy,
      'reviewedAt': reviewedAt,
      'expiresAt': expiresAt,
    };
  }
}

class PublisherVerificationResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  PublisherVerificationResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory PublisherVerificationResponse.fromJson(Map<String, dynamic> json) {
    return PublisherVerificationResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class ReleaseCreateRequest {
  final String? channelCode;
  final String? versionName;
  final String? versionCode;
  final String? buildNumber;
  final String? minimumOsVersion;

  ReleaseCreateRequest({
    this.channelCode,
    this.versionName,
    this.versionCode,
    this.buildNumber,
    this.minimumOsVersion
  });

  factory ReleaseCreateRequest.fromJson(Map<String, dynamic> json) {
    return ReleaseCreateRequest(
      channelCode: json['channelCode']?.toString(),
      versionName: json['versionName']?.toString(),
      versionCode: json['versionCode']?.toString(),
      buildNumber: json['buildNumber']?.toString(),
      minimumOsVersion: json['minimumOsVersion']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'channelCode': channelCode,
      'versionName': versionName,
      'versionCode': versionCode,
      'buildNumber': buildNumber,
      'minimumOsVersion': minimumOsVersion,
    };
  }
}

class ReleaseUpdateRequest {
  final String? minimumOsVersion;
  final String? releaseStatus;

  ReleaseUpdateRequest({
    this.minimumOsVersion,
    this.releaseStatus
  });

  factory ReleaseUpdateRequest.fromJson(Map<String, dynamic> json) {
    return ReleaseUpdateRequest(
      minimumOsVersion: json['minimumOsVersion']?.toString(),
      releaseStatus: json['releaseStatus']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'minimumOsVersion': minimumOsVersion,
      'releaseStatus': releaseStatus,
    };
  }
}

class Release {
  final String? id;
  final String? releaseNo;
  final String? listingId;
  final String? channelId;
  final String? versionName;
  final String? versionCode;
  final String? buildNumber;
  final String? releaseStatus;
  final String? minimumOsVersion;
  final String? submittedAt;
  final String? approvedAt;
  final String? publishedAt;
  final String? retiredAt;

  Release({
    this.id,
    this.releaseNo,
    this.listingId,
    this.channelId,
    this.versionName,
    this.versionCode,
    this.buildNumber,
    this.releaseStatus,
    this.minimumOsVersion,
    this.submittedAt,
    this.approvedAt,
    this.publishedAt,
    this.retiredAt
  });

  factory Release.fromJson(Map<String, dynamic> json) {
    return Release(
      id: json['id']?.toString(),
      releaseNo: json['releaseNo']?.toString(),
      listingId: json['listingId']?.toString(),
      channelId: json['channelId']?.toString(),
      versionName: json['versionName']?.toString(),
      versionCode: json['versionCode']?.toString(),
      buildNumber: json['buildNumber']?.toString(),
      releaseStatus: json['releaseStatus']?.toString(),
      minimumOsVersion: json['minimumOsVersion']?.toString(),
      submittedAt: json['submittedAt']?.toString(),
      approvedAt: json['approvedAt']?.toString(),
      publishedAt: json['publishedAt']?.toString(),
      retiredAt: json['retiredAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'releaseNo': releaseNo,
      'listingId': listingId,
      'channelId': channelId,
      'versionName': versionName,
      'versionCode': versionCode,
      'buildNumber': buildNumber,
      'releaseStatus': releaseStatus,
      'minimumOsVersion': minimumOsVersion,
      'submittedAt': submittedAt,
      'approvedAt': approvedAt,
      'publishedAt': publishedAt,
      'retiredAt': retiredAt,
    };
  }
}

class ReleaseResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  ReleaseResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory ReleaseResponse.fromJson(Map<String, dynamic> json) {
    return ReleaseResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class ReleaseNotesUpsertRequest {
  final String? releaseNotes;

  ReleaseNotesUpsertRequest({
    this.releaseNotes
  });

  factory ReleaseNotesUpsertRequest.fromJson(Map<String, dynamic> json) {
    return ReleaseNotesUpsertRequest(
      releaseNotes: json['releaseNotes']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'releaseNotes': releaseNotes,
    };
  }
}

class ReleaseNoteLocalization {
  final String? id;
  final String? locale;
  final String? releaseNotes;

  ReleaseNoteLocalization({
    this.id,
    this.locale,
    this.releaseNotes
  });

  factory ReleaseNoteLocalization.fromJson(Map<String, dynamic> json) {
    return ReleaseNoteLocalization(
      id: json['id']?.toString(),
      locale: json['locale']?.toString(),
      releaseNotes: json['releaseNotes']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'locale': locale,
      'releaseNotes': releaseNotes,
    };
  }
}

class ReleaseNotesResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  ReleaseNotesResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory ReleaseNotesResponse.fromJson(Map<String, dynamic> json) {
    return ReleaseNotesResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class ReleaseArtifactAttachRequest {
  final String? platform;
  final String? architecture;
  final String? packageFormat;
  final String? driveNodeId;
  final String? checksumSha256;
  final String? fileSizeBytes;
  final String? contentType;
  final String? mediaResourceId;
  final String? minOsVersion;

  ReleaseArtifactAttachRequest({
    this.platform,
    this.architecture,
    this.packageFormat,
    this.driveNodeId,
    this.checksumSha256,
    this.fileSizeBytes,
    this.contentType,
    this.mediaResourceId,
    this.minOsVersion
  });

  factory ReleaseArtifactAttachRequest.fromJson(Map<String, dynamic> json) {
    return ReleaseArtifactAttachRequest(
      platform: json['platform']?.toString(),
      architecture: json['architecture']?.toString(),
      packageFormat: json['packageFormat']?.toString(),
      driveNodeId: json['driveNodeId']?.toString(),
      checksumSha256: json['checksumSha256']?.toString(),
      fileSizeBytes: json['fileSizeBytes']?.toString(),
      contentType: json['contentType']?.toString(),
      mediaResourceId: json['mediaResourceId']?.toString(),
      minOsVersion: json['minOsVersion']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'platform': platform,
      'architecture': architecture,
      'packageFormat': packageFormat,
      'driveNodeId': driveNodeId,
      'checksumSha256': checksumSha256,
      'fileSizeBytes': fileSizeBytes,
      'contentType': contentType,
      'mediaResourceId': mediaResourceId,
      'minOsVersion': minOsVersion,
    };
  }
}

class ReleaseArtifact {
  final String? id;
  final String? artifactNo;
  final String? platform;
  final String? architecture;
  final String? packageFormat;
  final String? artifactStatus;
  final String? driveNodeId;
  final String? fileSizeBytes;
  final String? contentType;
  final String? checksumSha256;
  final String? minOsVersion;

  ReleaseArtifact({
    this.id,
    this.artifactNo,
    this.platform,
    this.architecture,
    this.packageFormat,
    this.artifactStatus,
    this.driveNodeId,
    this.fileSizeBytes,
    this.contentType,
    this.checksumSha256,
    this.minOsVersion
  });

  factory ReleaseArtifact.fromJson(Map<String, dynamic> json) {
    return ReleaseArtifact(
      id: json['id']?.toString(),
      artifactNo: json['artifactNo']?.toString(),
      platform: json['platform']?.toString(),
      architecture: json['architecture']?.toString(),
      packageFormat: json['packageFormat']?.toString(),
      artifactStatus: json['artifactStatus']?.toString(),
      driveNodeId: json['driveNodeId']?.toString(),
      fileSizeBytes: json['fileSizeBytes']?.toString(),
      contentType: json['contentType']?.toString(),
      checksumSha256: json['checksumSha256']?.toString(),
      minOsVersion: json['minOsVersion']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'artifactNo': artifactNo,
      'platform': platform,
      'architecture': architecture,
      'packageFormat': packageFormat,
      'artifactStatus': artifactStatus,
      'driveNodeId': driveNodeId,
      'fileSizeBytes': fileSizeBytes,
      'contentType': contentType,
      'checksumSha256': checksumSha256,
      'minOsVersion': minOsVersion,
    };
  }
}

class ReleaseArtifactResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  ReleaseArtifactResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory ReleaseArtifactResponse.fromJson(Map<String, dynamic> json) {
    return ReleaseArtifactResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class ReleaseRolloutUpdateRequest {
  final String? rolloutStrategy;
  final int? targetPercentage;
  final List<String>? regionFilter;
  final Map<String, dynamic>? deviceFilter;

  ReleaseRolloutUpdateRequest({
    this.rolloutStrategy,
    this.targetPercentage,
    this.regionFilter,
    this.deviceFilter
  });

  factory ReleaseRolloutUpdateRequest.fromJson(Map<String, dynamic> json) {
    return ReleaseRolloutUpdateRequest(
      rolloutStrategy: json['rolloutStrategy']?.toString(),
      targetPercentage: json['targetPercentage'] is int ? json['targetPercentage'] : null,
      regionFilter: (() {
        final list = _sdkworkAsList(json['regionFilter']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => item?.toString())
            .whereType<String>()
            .toList();
      })(),
      deviceFilter: _sdkworkAsMap(json['deviceFilter'])
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'rolloutStrategy': rolloutStrategy,
      'targetPercentage': targetPercentage,
      'regionFilter': regionFilter?.map((item) => item).toList(),
      'deviceFilter': deviceFilter,
    };
  }
}

class ReleaseRollout {
  final String? id;
  final String? rolloutStrategy;
  final String? rolloutStatus;
  final int? targetPercentage;
  final int? currentPercentage;
  final String? startedAt;
  final String? completedAt;
  final String? pausedAt;

  ReleaseRollout({
    this.id,
    this.rolloutStrategy,
    this.rolloutStatus,
    this.targetPercentage,
    this.currentPercentage,
    this.startedAt,
    this.completedAt,
    this.pausedAt
  });

  factory ReleaseRollout.fromJson(Map<String, dynamic> json) {
    return ReleaseRollout(
      id: json['id']?.toString(),
      rolloutStrategy: json['rolloutStrategy']?.toString(),
      rolloutStatus: json['rolloutStatus']?.toString(),
      targetPercentage: json['targetPercentage'] is int ? json['targetPercentage'] : null,
      currentPercentage: json['currentPercentage'] is int ? json['currentPercentage'] : null,
      startedAt: json['startedAt']?.toString(),
      completedAt: json['completedAt']?.toString(),
      pausedAt: json['pausedAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'rolloutStrategy': rolloutStrategy,
      'rolloutStatus': rolloutStatus,
      'targetPercentage': targetPercentage,
      'currentPercentage': currentPercentage,
      'startedAt': startedAt,
      'completedAt': completedAt,
      'pausedAt': pausedAt,
    };
  }
}

class ReleaseRolloutResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  ReleaseRolloutResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory ReleaseRolloutResponse.fromJson(Map<String, dynamic> json) {
    return ReleaseRolloutResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class ComplianceProfile {
  final String? id;
  final String? listingId;
  final int? complianceVersion;
  final dynamic privacyNutrition;
  final dynamic contentRatingQuestionnaire;
  final dynamic dataSafety;
  final dynamic targetAudience;
  final String? complianceStatus;
  final String? reviewedBy;
  final String? reviewedAt;

  ComplianceProfile({
    this.id,
    this.listingId,
    this.complianceVersion,
    this.privacyNutrition,
    this.contentRatingQuestionnaire,
    this.dataSafety,
    this.targetAudience,
    this.complianceStatus,
    this.reviewedBy,
    this.reviewedAt
  });

  factory ComplianceProfile.fromJson(Map<String, dynamic> json) {
    return ComplianceProfile(
      id: json['id']?.toString(),
      listingId: json['listingId']?.toString(),
      complianceVersion: json['complianceVersion'] is int ? json['complianceVersion'] : null,
      privacyNutrition: json['privacyNutrition'],
      contentRatingQuestionnaire: json['contentRatingQuestionnaire'],
      dataSafety: json['dataSafety'],
      targetAudience: json['targetAudience'],
      complianceStatus: json['complianceStatus']?.toString(),
      reviewedBy: json['reviewedBy']?.toString(),
      reviewedAt: json['reviewedAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'listingId': listingId,
      'complianceVersion': complianceVersion,
      'privacyNutrition': privacyNutrition,
      'contentRatingQuestionnaire': contentRatingQuestionnaire,
      'dataSafety': dataSafety,
      'targetAudience': targetAudience,
      'complianceStatus': complianceStatus,
      'reviewedBy': reviewedBy,
      'reviewedAt': reviewedAt,
    };
  }
}

class ComplianceProfileResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  ComplianceProfileResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory ComplianceProfileResponse.fromJson(Map<String, dynamic> json) {
    return ComplianceProfileResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class ComplianceProfileUpdateRequest {
  final Map<String, dynamic>? privacyNutrition;
  final Map<String, dynamic>? contentRatingQuestionnaire;
  final Map<String, dynamic>? dataSafety;
  final Map<String, dynamic>? targetAudience;

  ComplianceProfileUpdateRequest({
    this.privacyNutrition,
    this.contentRatingQuestionnaire,
    this.dataSafety,
    this.targetAudience
  });

  factory ComplianceProfileUpdateRequest.fromJson(Map<String, dynamic> json) {
    return ComplianceProfileUpdateRequest(
      privacyNutrition: _sdkworkAsMap(json['privacyNutrition']),
      contentRatingQuestionnaire: _sdkworkAsMap(json['contentRatingQuestionnaire']),
      dataSafety: _sdkworkAsMap(json['dataSafety']),
      targetAudience: _sdkworkAsMap(json['targetAudience'])
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'privacyNutrition': privacyNutrition,
      'contentRatingQuestionnaire': contentRatingQuestionnaire,
      'dataSafety': dataSafety,
      'targetAudience': targetAudience,
    };
  }
}

class CompliancePermissionUpdateRequest {
  final List<Map<String, dynamic>>? permissions;

  CompliancePermissionUpdateRequest({
    this.permissions
  });

  factory CompliancePermissionUpdateRequest.fromJson(Map<String, dynamic> json) {
    return CompliancePermissionUpdateRequest(
      permissions: (() {
        final list = _sdkworkAsList(json['permissions']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => _sdkworkAsMap(item))
            .whereType<Map<String, dynamic>>()
            .toList();
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'permissions': permissions?.map((item) => item).toList(),
    };
  }
}

class CompliancePermissionDisclosure {
  final String? id;
  final String? listingId;
  final String? permissionCode;
  final String? usagePurpose;
  final bool? isRequired;
  final String? disclosureStatus;

  CompliancePermissionDisclosure({
    this.id,
    this.listingId,
    this.permissionCode,
    this.usagePurpose,
    this.isRequired,
    this.disclosureStatus
  });

  factory CompliancePermissionDisclosure.fromJson(Map<String, dynamic> json) {
    return CompliancePermissionDisclosure(
      id: json['id']?.toString(),
      listingId: json['listingId']?.toString(),
      permissionCode: json['permissionCode']?.toString(),
      usagePurpose: json['usagePurpose']?.toString(),
      isRequired: json['isRequired'] is bool ? json['isRequired'] : null,
      disclosureStatus: json['disclosureStatus']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'listingId': listingId,
      'permissionCode': permissionCode,
      'usagePurpose': usagePurpose,
      'isRequired': isRequired,
      'disclosureStatus': disclosureStatus,
    };
  }
}

class CompliancePermissionListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  CompliancePermissionListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory CompliancePermissionListResponse.fromJson(Map<String, dynamic> json) {
    return CompliancePermissionListResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class UserLibraryItem {
  final String? id;
  final String? listingId;
  final String? appKey;
  final String? libraryStatus;
  final String? installedReleaseId;
  final String? installedVersionCode;
  final String? installSource;
  final String? platform;
  final String? architecture;
  final String? deviceId;
  final String? installedAt;
  final String? removedAt;

  UserLibraryItem({
    this.id,
    this.listingId,
    this.appKey,
    this.libraryStatus,
    this.installedReleaseId,
    this.installedVersionCode,
    this.installSource,
    this.platform,
    this.architecture,
    this.deviceId,
    this.installedAt,
    this.removedAt
  });

  factory UserLibraryItem.fromJson(Map<String, dynamic> json) {
    return UserLibraryItem(
      id: json['id']?.toString(),
      listingId: json['listingId']?.toString(),
      appKey: json['appKey']?.toString(),
      libraryStatus: json['libraryStatus']?.toString(),
      installedReleaseId: json['installedReleaseId']?.toString(),
      installedVersionCode: json['installedVersionCode']?.toString(),
      installSource: json['installSource']?.toString(),
      platform: json['platform']?.toString(),
      architecture: json['architecture']?.toString(),
      deviceId: json['deviceId']?.toString(),
      installedAt: json['installedAt']?.toString(),
      removedAt: json['removedAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'listingId': listingId,
      'appKey': appKey,
      'libraryStatus': libraryStatus,
      'installedReleaseId': installedReleaseId,
      'installedVersionCode': installedVersionCode,
      'installSource': installSource,
      'platform': platform,
      'architecture': architecture,
      'deviceId': deviceId,
      'installedAt': installedAt,
      'removedAt': removedAt,
    };
  }
}

class LibraryItemListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  LibraryItemListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory LibraryItemListResponse.fromJson(Map<String, dynamic> json) {
    return LibraryItemListResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class LibraryItemResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  LibraryItemResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory LibraryItemResponse.fromJson(Map<String, dynamic> json) {
    return LibraryItemResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class LibraryInstallRequest {
  final String? listingId;
  final String? platform;
  final String? architecture;
  final String? deviceId;

  LibraryInstallRequest({
    this.listingId,
    this.platform,
    this.architecture,
    this.deviceId
  });

  factory LibraryInstallRequest.fromJson(Map<String, dynamic> json) {
    return LibraryInstallRequest(
      listingId: json['listingId']?.toString(),
      platform: json['platform']?.toString(),
      architecture: json['architecture']?.toString(),
      deviceId: json['deviceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'listingId': listingId,
      'platform': platform,
      'architecture': architecture,
      'deviceId': deviceId,
    };
  }
}

class InstallEvent {
  final String? id;
  final String? eventNo;
  final String? listingId;
  final String? releaseId;
  final String? eventType;
  final String? platform;
  final String? occurredAt;

  InstallEvent({
    this.id,
    this.eventNo,
    this.listingId,
    this.releaseId,
    this.eventType,
    this.platform,
    this.occurredAt
  });

  factory InstallEvent.fromJson(Map<String, dynamic> json) {
    return InstallEvent(
      id: json['id']?.toString(),
      eventNo: json['eventNo']?.toString(),
      listingId: json['listingId']?.toString(),
      releaseId: json['releaseId']?.toString(),
      eventType: json['eventType']?.toString(),
      platform: json['platform']?.toString(),
      occurredAt: json['occurredAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'eventNo': eventNo,
      'listingId': listingId,
      'releaseId': releaseId,
      'eventType': eventType,
      'platform': platform,
      'occurredAt': occurredAt,
    };
  }
}

class LibraryInstallResult {
  final UserLibraryItem? libraryItem;
  final InstallEvent? installEvent;

  LibraryInstallResult({
    this.libraryItem,
    this.installEvent
  });

  factory LibraryInstallResult.fromJson(Map<String, dynamic> json) {
    return LibraryInstallResult(
      libraryItem: (() {
        final map = _sdkworkAsMap(json['libraryItem']);
        return map == null ? null : UserLibraryItem.fromJson(map);
      })(),
      installEvent: (() {
        final map = _sdkworkAsMap(json['installEvent']);
        return map == null ? null : InstallEvent.fromJson(map);
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'libraryItem': libraryItem?.toJson(),
      'installEvent': installEvent?.toJson(),
    };
  }
}

class LibraryInstallResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  LibraryInstallResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory LibraryInstallResponse.fromJson(Map<String, dynamic> json) {
    return LibraryInstallResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class LibraryUninstallRequest {
  final String? libraryItemId;

  LibraryUninstallRequest({
    this.libraryItemId
  });

  factory LibraryUninstallRequest.fromJson(Map<String, dynamic> json) {
    return LibraryUninstallRequest(
      libraryItemId: json['libraryItemId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'libraryItemId': libraryItemId,
    };
  }
}

class LibraryUpdatesCheckRequest {
  final List<Map<String, dynamic>>? items;

  LibraryUpdatesCheckRequest({
    this.items
  });

  factory LibraryUpdatesCheckRequest.fromJson(Map<String, dynamic> json) {
    return LibraryUpdatesCheckRequest(
      items: (() {
        final list = _sdkworkAsList(json['items']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => _sdkworkAsMap(item))
            .whereType<Map<String, dynamic>>()
            .toList();
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'items': items?.map((item) => item).toList(),
    };
  }
}

class UpdateAvailable {
  final String? appKey;
  final String? platform;
  final String? installedVersionCode;
  final String? latestVersionCode;
  final String? latestVersionName;
  final String? releaseId;
  final String? artifactId;
  final String? fileSizeBytes;
  final String? releaseNotes;
  final String? releasedAt;

  UpdateAvailable({
    this.appKey,
    this.platform,
    this.installedVersionCode,
    this.latestVersionCode,
    this.latestVersionName,
    this.releaseId,
    this.artifactId,
    this.fileSizeBytes,
    this.releaseNotes,
    this.releasedAt
  });

  factory UpdateAvailable.fromJson(Map<String, dynamic> json) {
    return UpdateAvailable(
      appKey: json['appKey']?.toString(),
      platform: json['platform']?.toString(),
      installedVersionCode: json['installedVersionCode']?.toString(),
      latestVersionCode: json['latestVersionCode']?.toString(),
      latestVersionName: json['latestVersionName']?.toString(),
      releaseId: json['releaseId']?.toString(),
      artifactId: json['artifactId']?.toString(),
      fileSizeBytes: json['fileSizeBytes']?.toString(),
      releaseNotes: json['releaseNotes']?.toString(),
      releasedAt: json['releasedAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'appKey': appKey,
      'platform': platform,
      'installedVersionCode': installedVersionCode,
      'latestVersionCode': latestVersionCode,
      'latestVersionName': latestVersionName,
      'releaseId': releaseId,
      'artifactId': artifactId,
      'fileSizeBytes': fileSizeBytes,
      'releaseNotes': releaseNotes,
      'releasedAt': releasedAt,
    };
  }
}

class LibraryUpdatesCheckResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  LibraryUpdatesCheckResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory LibraryUpdatesCheckResponse.fromJson(Map<String, dynamic> json) {
    return LibraryUpdatesCheckResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class WishlistItem {
  final String? id;
  final String? listingId;
  final String? wishlistStatus;
  final String? createdAt;

  WishlistItem({
    this.id,
    this.listingId,
    this.wishlistStatus,
    this.createdAt
  });

  factory WishlistItem.fromJson(Map<String, dynamic> json) {
    return WishlistItem(
      id: json['id']?.toString(),
      listingId: json['listingId']?.toString(),
      wishlistStatus: json['wishlistStatus']?.toString(),
      createdAt: json['createdAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'listingId': listingId,
      'wishlistStatus': wishlistStatus,
      'createdAt': createdAt,
    };
  }
}

class WishlistItemListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  WishlistItemListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory WishlistItemListResponse.fromJson(Map<String, dynamic> json) {
    return WishlistItemListResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class WishlistItemAddRequest {
  final String? listingId;

  WishlistItemAddRequest({
    this.listingId
  });

  factory WishlistItemAddRequest.fromJson(Map<String, dynamic> json) {
    return WishlistItemAddRequest(
      listingId: json['listingId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'listingId': listingId,
    };
  }
}

class WishlistItemResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  WishlistItemResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory WishlistItemResponse.fromJson(Map<String, dynamic> json) {
    return WishlistItemResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class DownloadGrantCreateRequest {
  final String? artifactId;

  DownloadGrantCreateRequest({
    this.artifactId
  });

  factory DownloadGrantCreateRequest.fromJson(Map<String, dynamic> json) {
    return DownloadGrantCreateRequest(
      artifactId: json['artifactId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'artifactId': artifactId,
    };
  }
}

class DownloadGrant {
  final String? id;
  final String? grantNo;
  final String? listingId;
  final String? releaseId;
  final String? artifactId;
  final String? grantStatus;
  final String? grantReason;
  final String? expiresAt;
  final String? consumedAt;
  final int? downloadCount;
  final int? maxDownloadCount;

  DownloadGrant({
    this.id,
    this.grantNo,
    this.listingId,
    this.releaseId,
    this.artifactId,
    this.grantStatus,
    this.grantReason,
    this.expiresAt,
    this.consumedAt,
    this.downloadCount,
    this.maxDownloadCount
  });

  factory DownloadGrant.fromJson(Map<String, dynamic> json) {
    return DownloadGrant(
      id: json['id']?.toString(),
      grantNo: json['grantNo']?.toString(),
      listingId: json['listingId']?.toString(),
      releaseId: json['releaseId']?.toString(),
      artifactId: json['artifactId']?.toString(),
      grantStatus: json['grantStatus']?.toString(),
      grantReason: json['grantReason']?.toString(),
      expiresAt: json['expiresAt']?.toString(),
      consumedAt: json['consumedAt']?.toString(),
      downloadCount: json['downloadCount'] is int ? json['downloadCount'] : null,
      maxDownloadCount: json['maxDownloadCount'] is int ? json['maxDownloadCount'] : null
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'grantNo': grantNo,
      'listingId': listingId,
      'releaseId': releaseId,
      'artifactId': artifactId,
      'grantStatus': grantStatus,
      'grantReason': grantReason,
      'expiresAt': expiresAt,
      'consumedAt': consumedAt,
      'downloadCount': downloadCount,
      'maxDownloadCount': maxDownloadCount,
    };
  }
}

class DownloadGrantResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  DownloadGrantResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory DownloadGrantResponse.fromJson(Map<String, dynamic> json) {
    return DownloadGrantResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class SearchHistoryUpsertRequest {
  final String? queryText;
  final Map<String, dynamic>? filters;

  SearchHistoryUpsertRequest({
    this.queryText,
    this.filters
  });

  factory SearchHistoryUpsertRequest.fromJson(Map<String, dynamic> json) {
    return SearchHistoryUpsertRequest(
      queryText: json['queryText']?.toString(),
      filters: _sdkworkAsMap(json['filters'])
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'queryText': queryText,
      'filters': filters,
    };
  }
}

class AppTemplate {
  final String? id;
  final String? templateCode;
  final String? templateName;
  final String? description;
  final String? templateType;
  final String? categoryCode;
  final String? framework;
  final String? language;
  final String? iconMediaResourceId;
  final String? gitRepoUrl;
  final String? authorName;
  final Map<String, dynamic>? capabilityManifest;
  final Map<String, dynamic>? metadata;
  final int? starCount;
  final int? forkCount;
  final int? cloneCount;
  final String? publishedAt;
  final String? createdAt;

  AppTemplate({
    this.id,
    this.templateCode,
    this.templateName,
    this.description,
    this.templateType,
    this.categoryCode,
    this.framework,
    this.language,
    this.iconMediaResourceId,
    this.gitRepoUrl,
    this.authorName,
    this.capabilityManifest,
    this.metadata,
    this.starCount,
    this.forkCount,
    this.cloneCount,
    this.publishedAt,
    this.createdAt
  });

  factory AppTemplate.fromJson(Map<String, dynamic> json) {
    return AppTemplate(
      id: json['id']?.toString(),
      templateCode: json['templateCode']?.toString(),
      templateName: json['templateName']?.toString(),
      description: json['description']?.toString(),
      templateType: json['templateType']?.toString(),
      categoryCode: json['categoryCode']?.toString(),
      framework: json['framework']?.toString(),
      language: json['language']?.toString(),
      iconMediaResourceId: json['iconMediaResourceId']?.toString(),
      gitRepoUrl: json['gitRepoUrl']?.toString(),
      authorName: json['authorName']?.toString(),
      capabilityManifest: _sdkworkAsMap(json['capabilityManifest']),
      metadata: _sdkworkAsMap(json['metadata']),
      starCount: json['starCount'] is int ? json['starCount'] : null,
      forkCount: json['forkCount'] is int ? json['forkCount'] : null,
      cloneCount: json['cloneCount'] is int ? json['cloneCount'] : null,
      publishedAt: json['publishedAt']?.toString(),
      createdAt: json['createdAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'templateCode': templateCode,
      'templateName': templateName,
      'description': description,
      'templateType': templateType,
      'categoryCode': categoryCode,
      'framework': framework,
      'language': language,
      'iconMediaResourceId': iconMediaResourceId,
      'gitRepoUrl': gitRepoUrl,
      'authorName': authorName,
      'capabilityManifest': capabilityManifest,
      'metadata': metadata,
      'starCount': starCount,
      'forkCount': forkCount,
      'cloneCount': cloneCount,
      'publishedAt': publishedAt,
      'createdAt': createdAt,
    };
  }
}

class AppTemplateCreateRequest {
  final String? templateCode;
  final String? templateName;
  final String? description;
  final String? templateType;
  final String? categoryCode;
  final String? framework;
  final String? language;
  final String? iconMediaResourceId;
  final String? gitRepoUrl;
  final Map<String, dynamic>? capabilityManifest;
  final Map<String, dynamic>? metadata;

  AppTemplateCreateRequest({
    this.templateCode,
    this.templateName,
    this.description,
    this.templateType,
    this.categoryCode,
    this.framework,
    this.language,
    this.iconMediaResourceId,
    this.gitRepoUrl,
    this.capabilityManifest,
    this.metadata
  });

  factory AppTemplateCreateRequest.fromJson(Map<String, dynamic> json) {
    return AppTemplateCreateRequest(
      templateCode: json['templateCode']?.toString(),
      templateName: json['templateName']?.toString(),
      description: json['description']?.toString(),
      templateType: json['templateType']?.toString(),
      categoryCode: json['categoryCode']?.toString(),
      framework: json['framework']?.toString(),
      language: json['language']?.toString(),
      iconMediaResourceId: json['iconMediaResourceId']?.toString(),
      gitRepoUrl: json['gitRepoUrl']?.toString(),
      capabilityManifest: _sdkworkAsMap(json['capabilityManifest']),
      metadata: _sdkworkAsMap(json['metadata'])
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'templateCode': templateCode,
      'templateName': templateName,
      'description': description,
      'templateType': templateType,
      'categoryCode': categoryCode,
      'framework': framework,
      'language': language,
      'iconMediaResourceId': iconMediaResourceId,
      'gitRepoUrl': gitRepoUrl,
      'capabilityManifest': capabilityManifest,
      'metadata': metadata,
    };
  }
}

class AppTemplateUsageCreateRequest {
  final String? usageType;
  final Map<String, dynamic>? metadata;

  AppTemplateUsageCreateRequest({
    this.usageType,
    this.metadata
  });

  factory AppTemplateUsageCreateRequest.fromJson(Map<String, dynamic> json) {
    return AppTemplateUsageCreateRequest(
      usageType: json['usageType']?.toString(),
      metadata: _sdkworkAsMap(json['metadata'])
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'usageType': usageType,
      'metadata': metadata,
    };
  }
}

class AppTemplateUsageResult {
  final String? templateId;
  final String? usageType;
  final int? starCount;
  final int? forkCount;
  final int? cloneCount;
  final bool? isStarred;
  final bool? isEnabled;

  AppTemplateUsageResult({
    this.templateId,
    this.usageType,
    this.starCount,
    this.forkCount,
    this.cloneCount,
    this.isStarred,
    this.isEnabled
  });

  factory AppTemplateUsageResult.fromJson(Map<String, dynamic> json) {
    return AppTemplateUsageResult(
      templateId: json['templateId']?.toString(),
      usageType: json['usageType']?.toString(),
      starCount: json['starCount'] is int ? json['starCount'] : null,
      forkCount: json['forkCount'] is int ? json['forkCount'] : null,
      cloneCount: json['cloneCount'] is int ? json['cloneCount'] : null,
      isStarred: json['isStarred'] is bool ? json['isStarred'] : null,
      isEnabled: json['isEnabled'] is bool ? json['isEnabled'] : null
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'templateId': templateId,
      'usageType': usageType,
      'starCount': starCount,
      'forkCount': forkCount,
      'cloneCount': cloneCount,
      'isStarred': isStarred,
      'isEnabled': isEnabled,
    };
  }
}

class AppTemplateListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  AppTemplateListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory AppTemplateListResponse.fromJson(Map<String, dynamic> json) {
    return AppTemplateListResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class AppTemplateResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  AppTemplateResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory AppTemplateResponse.fromJson(Map<String, dynamic> json) {
    return AppTemplateResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class AppTemplateUsageResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  AppTemplateUsageResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory AppTemplateUsageResponse.fromJson(Map<String, dynamic> json) {
    return AppTemplateUsageResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class ListingRating {
  final String? id;
  final String? listingId;
  final String? userId;
  final int? rating;
  final String? title;
  final String? createdAt;

  ListingRating({
    this.id,
    this.listingId,
    this.userId,
    this.rating,
    this.title,
    this.createdAt
  });

  factory ListingRating.fromJson(Map<String, dynamic> json) {
    return ListingRating(
      id: json['id']?.toString(),
      listingId: json['listingId']?.toString(),
      userId: json['userId']?.toString(),
      rating: json['rating'] is int ? json['rating'] : null,
      title: json['title']?.toString(),
      createdAt: json['createdAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'listingId': listingId,
      'userId': userId,
      'rating': rating,
      'title': title,
      'createdAt': createdAt,
    };
  }
}

class ListingRatingUpsertRequest {
  final int? rating;
  final String? title;

  ListingRatingUpsertRequest({
    this.rating,
    this.title
  });

  factory ListingRatingUpsertRequest.fromJson(Map<String, dynamic> json) {
    return ListingRatingUpsertRequest(
      rating: json['rating'] is int ? json['rating'] : null,
      title: json['title']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'rating': rating,
      'title': title,
    };
  }
}

class ListingRatingListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  ListingRatingListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory ListingRatingListResponse.fromJson(Map<String, dynamic> json) {
    return ListingRatingListResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class ListingRatingResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  ListingRatingResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory ListingRatingResponse.fromJson(Map<String, dynamic> json) {
    return ListingRatingResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class FeedbackCreateRequest {
  final String? type;
  final String? content;
  final String? contact;
  final String? listingId;
  final String? appKey;

  FeedbackCreateRequest({
    this.type,
    this.content,
    this.contact,
    this.listingId,
    this.appKey
  });

  factory FeedbackCreateRequest.fromJson(Map<String, dynamic> json) {
    return FeedbackCreateRequest(
      type: json['type']?.toString(),
      content: json['content']?.toString(),
      contact: json['contact']?.toString(),
      listingId: json['listingId']?.toString(),
      appKey: json['appKey']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'type': type,
      'content': content,
      'contact': contact,
      'listingId': listingId,
      'appKey': appKey,
    };
  }
}

class Feedback {
  final String? id;
  final String? type;
  final String? content;
  final String? status;
  final String? createdAt;

  Feedback({
    this.id,
    this.type,
    this.content,
    this.status,
    this.createdAt
  });

  factory Feedback.fromJson(Map<String, dynamic> json) {
    return Feedback(
      id: json['id']?.toString(),
      type: json['type']?.toString(),
      content: json['content']?.toString(),
      status: json['status']?.toString(),
      createdAt: json['createdAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'type': type,
      'content': content,
      'status': status,
      'createdAt': createdAt,
    };
  }
}

class FeedbackResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  FeedbackResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory FeedbackResponse.fromJson(Map<String, dynamic> json) {
    return FeedbackResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class UserCategory {
  final String? id;
  final String? name;
  final String? description;
  final String? iconMediaResourceId;
  final int? sortOrder;
  final int? itemCount;
  final String? status;
  final String? createdAt;
  final String? updatedAt;

  UserCategory({
    this.id,
    this.name,
    this.description,
    this.iconMediaResourceId,
    this.sortOrder,
    this.itemCount,
    this.status,
    this.createdAt,
    this.updatedAt
  });

  factory UserCategory.fromJson(Map<String, dynamic> json) {
    return UserCategory(
      id: json['id']?.toString(),
      name: json['name']?.toString(),
      description: json['description']?.toString(),
      iconMediaResourceId: json['iconMediaResourceId']?.toString(),
      sortOrder: json['sortOrder'] is int ? json['sortOrder'] : null,
      itemCount: json['itemCount'] is int ? json['itemCount'] : null,
      status: json['status']?.toString(),
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'name': name,
      'description': description,
      'iconMediaResourceId': iconMediaResourceId,
      'sortOrder': sortOrder,
      'itemCount': itemCount,
      'status': status,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}

class UserCategoryCreateRequest {
  final String? name;
  final String? description;
  final String? iconMediaResourceId;

  UserCategoryCreateRequest({
    this.name,
    this.description,
    this.iconMediaResourceId
  });

  factory UserCategoryCreateRequest.fromJson(Map<String, dynamic> json) {
    return UserCategoryCreateRequest(
      name: json['name']?.toString(),
      description: json['description']?.toString(),
      iconMediaResourceId: json['iconMediaResourceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'name': name,
      'description': description,
      'iconMediaResourceId': iconMediaResourceId,
    };
  }
}

class UserCategoryUpdateRequest {
  final String? name;
  final String? description;
  final String? iconMediaResourceId;
  final int? sortOrder;

  UserCategoryUpdateRequest({
    this.name,
    this.description,
    this.iconMediaResourceId,
    this.sortOrder
  });

  factory UserCategoryUpdateRequest.fromJson(Map<String, dynamic> json) {
    return UserCategoryUpdateRequest(
      name: json['name']?.toString(),
      description: json['description']?.toString(),
      iconMediaResourceId: json['iconMediaResourceId']?.toString(),
      sortOrder: json['sortOrder'] is int ? json['sortOrder'] : null
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'name': name,
      'description': description,
      'iconMediaResourceId': iconMediaResourceId,
      'sortOrder': sortOrder,
    };
  }
}

class UserCategoryResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  UserCategoryResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory UserCategoryResponse.fromJson(Map<String, dynamic> json) {
    return UserCategoryResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class UserCategoryPageResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  UserCategoryPageResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory UserCategoryPageResponse.fromJson(Map<String, dynamic> json) {
    return UserCategoryPageResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class ListingCard {
  final String? listingId;
  final String? displayName;
  final String? subtitle;
  final String? iconMediaResourceId;
  final String? averageRating;
  final String? downloadCount;

  ListingCard({
    this.listingId,
    this.displayName,
    this.subtitle,
    this.iconMediaResourceId,
    this.averageRating,
    this.downloadCount
  });

  factory ListingCard.fromJson(Map<String, dynamic> json) {
    return ListingCard(
      listingId: json['listingId']?.toString(),
      displayName: json['displayName']?.toString(),
      subtitle: json['subtitle']?.toString(),
      iconMediaResourceId: json['iconMediaResourceId']?.toString(),
      averageRating: json['averageRating']?.toString(),
      downloadCount: json['downloadCount']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'listingId': listingId,
      'displayName': displayName,
      'subtitle': subtitle,
      'iconMediaResourceId': iconMediaResourceId,
      'averageRating': averageRating,
      'downloadCount': downloadCount,
    };
  }
}

class UserCategoryItem {
  final String? id;
  final String? userCategoryId;
  final String? listingId;
  final String? note;
  final int? sortOrder;
  final String? createdAt;
  final String? updatedAt;

  UserCategoryItem({
    this.id,
    this.userCategoryId,
    this.listingId,
    this.note,
    this.sortOrder,
    this.createdAt,
    this.updatedAt
  });

  factory UserCategoryItem.fromJson(Map<String, dynamic> json) {
    return UserCategoryItem(
      id: json['id']?.toString(),
      userCategoryId: json['userCategoryId']?.toString(),
      listingId: json['listingId']?.toString(),
      note: json['note']?.toString(),
      sortOrder: json['sortOrder'] is int ? json['sortOrder'] : null,
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'userCategoryId': userCategoryId,
      'listingId': listingId,
      'note': note,
      'sortOrder': sortOrder,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}

class UserCategoryItemAddRequest {
  final String? listingId;
  final String? note;

  UserCategoryItemAddRequest({
    this.listingId,
    this.note
  });

  factory UserCategoryItemAddRequest.fromJson(Map<String, dynamic> json) {
    return UserCategoryItemAddRequest(
      listingId: json['listingId']?.toString(),
      note: json['note']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'listingId': listingId,
      'note': note,
    };
  }
}

class UserCategoryItemsReorderRequest {
  final List<String>? itemIds;

  UserCategoryItemsReorderRequest({
    this.itemIds
  });

  factory UserCategoryItemsReorderRequest.fromJson(Map<String, dynamic> json) {
    return UserCategoryItemsReorderRequest(
      itemIds: (() {
        final list = _sdkworkAsList(json['itemIds']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => item?.toString())
            .whereType<String>()
            .toList();
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'itemIds': itemIds?.map((item) => item).toList(),
    };
  }
}

class UserCategoryItemWithCard {
  final UserCategoryItem? item;
  final ListingCard? listingCard;

  UserCategoryItemWithCard({
    this.item,
    this.listingCard
  });

  factory UserCategoryItemWithCard.fromJson(Map<String, dynamic> json) {
    return UserCategoryItemWithCard(
      item: (() {
        final map = _sdkworkAsMap(json['item']);
        return map == null ? null : UserCategoryItem.fromJson(map);
      })(),
      listingCard: (() {
        final map = _sdkworkAsMap(json['listingCard']);
        return map == null ? null : ListingCard.fromJson(map);
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'item': item?.toJson(),
      'listingCard': listingCard?.toJson(),
    };
  }
}

class UserCategoryItemResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  UserCategoryItemResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory UserCategoryItemResponse.fromJson(Map<String, dynamic> json) {
    return UserCategoryItemResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class UserCategoryItemPageResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  UserCategoryItemPageResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory UserCategoryItemPageResponse.fromJson(Map<String, dynamic> json) {
    return UserCategoryItemPageResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class UserStoreCommandResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  UserStoreCommandResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory UserStoreCommandResponse.fromJson(Map<String, dynamic> json) {
    return UserStoreCommandResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class UserStoreShare {
  final String? id;
  final String? shareToken;
  final String? title;
  final String? description;
  final String? scope;
  final List<String>? selectedCategoryIds;
  final String? visibility;
  final String? status;
  final String? expiresAt;
  final String? viewCount;
  final String? createdAt;
  final String? updatedAt;

  UserStoreShare({
    this.id,
    this.shareToken,
    this.title,
    this.description,
    this.scope,
    this.selectedCategoryIds,
    this.visibility,
    this.status,
    this.expiresAt,
    this.viewCount,
    this.createdAt,
    this.updatedAt
  });

  factory UserStoreShare.fromJson(Map<String, dynamic> json) {
    return UserStoreShare(
      id: json['id']?.toString(),
      shareToken: json['shareToken']?.toString(),
      title: json['title']?.toString(),
      description: json['description']?.toString(),
      scope: json['scope']?.toString(),
      selectedCategoryIds: (() {
        final list = _sdkworkAsList(json['selectedCategoryIds']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => item?.toString())
            .whereType<String>()
            .toList();
      })(),
      visibility: json['visibility']?.toString(),
      status: json['status']?.toString(),
      expiresAt: json['expiresAt']?.toString(),
      viewCount: json['viewCount']?.toString(),
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'shareToken': shareToken,
      'title': title,
      'description': description,
      'scope': scope,
      'selectedCategoryIds': selectedCategoryIds?.map((item) => item).toList(),
      'visibility': visibility,
      'status': status,
      'expiresAt': expiresAt,
      'viewCount': viewCount,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}

class UserStoreShareCreateRequest {
  final String? title;
  final String? description;
  final String? scope;
  final List<String>? selectedCategoryIds;
  final String? visibility;

  UserStoreShareCreateRequest({
    this.title,
    this.description,
    this.scope,
    this.selectedCategoryIds,
    this.visibility
  });

  factory UserStoreShareCreateRequest.fromJson(Map<String, dynamic> json) {
    return UserStoreShareCreateRequest(
      title: json['title']?.toString(),
      description: json['description']?.toString(),
      scope: json['scope']?.toString(),
      selectedCategoryIds: (() {
        final list = _sdkworkAsList(json['selectedCategoryIds']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => item?.toString())
            .whereType<String>()
            .toList();
      })(),
      visibility: json['visibility']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'title': title,
      'description': description,
      'scope': scope,
      'selectedCategoryIds': selectedCategoryIds?.map((item) => item).toList(),
      'visibility': visibility,
    };
  }
}

class UserStoreShareUpdateRequest {
  final String? title;
  final String? description;
  final String? scope;
  final List<String>? selectedCategoryIds;
  final String? visibility;

  UserStoreShareUpdateRequest({
    this.title,
    this.description,
    this.scope,
    this.selectedCategoryIds,
    this.visibility
  });

  factory UserStoreShareUpdateRequest.fromJson(Map<String, dynamic> json) {
    return UserStoreShareUpdateRequest(
      title: json['title']?.toString(),
      description: json['description']?.toString(),
      scope: json['scope']?.toString(),
      selectedCategoryIds: (() {
        final list = _sdkworkAsList(json['selectedCategoryIds']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => item?.toString())
            .whereType<String>()
            .toList();
      })(),
      visibility: json['visibility']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'title': title,
      'description': description,
      'scope': scope,
      'selectedCategoryIds': selectedCategoryIds?.map((item) => item).toList(),
      'visibility': visibility,
    };
  }
}

class UserStoreShareResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  UserStoreShareResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory UserStoreShareResponse.fromJson(Map<String, dynamic> json) {
    return UserStoreShareResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class UserStoreSharePageResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  UserStoreSharePageResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory UserStoreSharePageResponse.fromJson(Map<String, dynamic> json) {
    return UserStoreSharePageResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class SdkWorkApiResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  SdkWorkApiResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory SdkWorkApiResponse.fromJson(Map<String, dynamic> json) {
    return SdkWorkApiResponse(
      code: json['code'] is int ? json['code'] : null,
      data: json['data'],
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class SdkWorkResourceData {
  final Map<String, dynamic>? item;

  SdkWorkResourceData({
    this.item
  });

  factory SdkWorkResourceData.fromJson(Map<String, dynamic> json) {
    return SdkWorkResourceData(
      item: _sdkworkAsMap(json['item'])
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'item': item,
    };
  }
}

class SdkWorkPageData {
  final List<Map<String, dynamic>>? items;
  final PageInfo? pageInfo;

  SdkWorkPageData({
    this.items,
    this.pageInfo
  });

  factory SdkWorkPageData.fromJson(Map<String, dynamic> json) {
    return SdkWorkPageData(
      items: (() {
        final list = _sdkworkAsList(json['items']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => _sdkworkAsMap(item))
            .whereType<Map<String, dynamic>>()
            .toList();
      })(),
      pageInfo: (() {
        final map = _sdkworkAsMap(json['pageInfo']);
        return map == null ? null : PageInfo.fromJson(map);
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'items': items?.map((item) => item).toList(),
      'pageInfo': pageInfo?.toJson(),
    };
  }
}

class SdkWorkCommandData {
  final bool? accepted;
  final String? resourceId;
  final String? status;

  SdkWorkCommandData({
    this.accepted,
    this.resourceId,
    this.status
  });

  factory SdkWorkCommandData.fromJson(Map<String, dynamic> json) {
    return SdkWorkCommandData(
      accepted: json['accepted'] is bool ? json['accepted'] : null,
      resourceId: json['resourceId']?.toString(),
      status: json['status']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'accepted': accepted,
      'resourceId': resourceId,
      'status': status,
    };
  }
}

class PageInfo {
  final String? mode;
  final int? page;
  final int? pageSize;
  final String? totalItems;
  final int? totalPages;
  final String? nextCursor;
  final bool? hasMore;

  PageInfo({
    this.mode,
    this.page,
    this.pageSize,
    this.totalItems,
    this.totalPages,
    this.nextCursor,
    this.hasMore
  });

  factory PageInfo.fromJson(Map<String, dynamic> json) {
    return PageInfo(
      mode: json['mode']?.toString(),
      page: json['page'] is int ? json['page'] : null,
      pageSize: json['pageSize'] is int ? json['pageSize'] : null,
      totalItems: json['totalItems']?.toString(),
      totalPages: json['totalPages'] is int ? json['totalPages'] : null,
      nextCursor: json['nextCursor']?.toString(),
      hasMore: json['hasMore'] is bool ? json['hasMore'] : null
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'mode': mode,
      'page': page,
      'pageSize': pageSize,
      'totalItems': totalItems,
      'totalPages': totalPages,
      'nextCursor': nextCursor,
      'hasMore': hasMore,
    };
  }
}

class FieldError {
  final String? field;
  final String? message;
  final int? code;
  final String? i18nKey;
  final Map<String, dynamic>? params;

  FieldError({
    this.field,
    this.message,
    this.code,
    this.i18nKey,
    this.params
  });

  factory FieldError.fromJson(Map<String, dynamic> json) {
    return FieldError(
      field: json['field']?.toString(),
      message: json['message']?.toString(),
      code: json['code'] is int ? json['code'] : null,
      i18nKey: json['i18nKey']?.toString(),
      params: (() {
        final map = _sdkworkAsMap(json['params']);
        if (map == null) {
          return null;
        }
        final result = <String, String>{};
        map.forEach((key, item) {
          final deserialized = item?.toString();
          if (deserialized is String) {
            result[key] = deserialized;
          }
        });
        return result;
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'field': field,
      'message': message,
      'code': code,
      'i18nKey': i18nKey,
      'params': params?.map((key, item) => MapEntry(key, item)),
    };
  }
}

class SdkWorkResourceResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  SdkWorkResourceResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory SdkWorkResourceResponse.fromJson(Map<String, dynamic> json) {
    return SdkWorkResourceResponse(
      code: json['code'] is int ? json['code'] : null,
      data: json['data'],
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class SdkWorkListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  SdkWorkListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory SdkWorkListResponse.fromJson(Map<String, dynamic> json) {
    return SdkWorkListResponse(
      code: json['code'] is int ? json['code'] : null,
      data: json['data'],
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class SdkWorkCommandResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  SdkWorkCommandResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory SdkWorkCommandResponse.fromJson(Map<String, dynamic> json) {
    return SdkWorkCommandResponse(
      code: json['code'] is int ? json['code'] : null,
      data: json['data'],
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class AppstoreCatalogCategoriesRetrieveResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  AppstoreCatalogCategoriesRetrieveResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory AppstoreCatalogCategoriesRetrieveResponse.fromJson(Map<String, dynamic> json) {
    return AppstoreCatalogCategoriesRetrieveResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class AppstoreCatalogCollectionsRetrieveResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  AppstoreCatalogCollectionsRetrieveResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory AppstoreCatalogCollectionsRetrieveResponse.fromJson(Map<String, dynamic> json) {
    return AppstoreCatalogCollectionsRetrieveResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class AppstoreCatalogChartsRetrieveResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  AppstoreCatalogChartsRetrieveResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory AppstoreCatalogChartsRetrieveResponse.fromJson(Map<String, dynamic> json) {
    return AppstoreCatalogChartsRetrieveResponse(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}

class AppstorePublishersMeAppsCreateResponse201 {
  final int? code;
  final dynamic data;
  final String? traceId;

  AppstorePublishersMeAppsCreateResponse201({
    this.code,
    this.data,
    this.traceId
  });

  factory AppstorePublishersMeAppsCreateResponse201.fromJson(Map<String, dynamic> json) {
    return AppstorePublishersMeAppsCreateResponse201(
      code: json['code'] is int ? json['code'] : null,
      data: _sdkworkAsMap(json['data']),
      traceId: json['traceId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'code': code,
      'data': data,
      'traceId': traceId,
    };
  }
}
