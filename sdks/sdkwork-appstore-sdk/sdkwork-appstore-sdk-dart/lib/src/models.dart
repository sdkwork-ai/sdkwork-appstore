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

class PublicUserStoreCategorySummary {
  final String? userCategoryId;
  final String? name;
  final String? iconMediaResourceId;
  final int? sortOrder;
  final String? itemCount;

  PublicUserStoreCategorySummary({
    this.userCategoryId,
    this.name,
    this.iconMediaResourceId,
    this.sortOrder,
    this.itemCount
  });

  factory PublicUserStoreCategorySummary.fromJson(Map<String, dynamic> json) {
    return PublicUserStoreCategorySummary(
      userCategoryId: json['userCategoryId']?.toString(),
      name: json['name']?.toString(),
      iconMediaResourceId: json['iconMediaResourceId']?.toString(),
      sortOrder: json['sortOrder'] is int ? json['sortOrder'] : null,
      itemCount: json['itemCount']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'userCategoryId': userCategoryId,
      'name': name,
      'iconMediaResourceId': iconMediaResourceId,
      'sortOrder': sortOrder,
      'itemCount': itemCount,
    };
  }
}

class PublicUserStoreListingCard {
  final String? listingId;
  final String? displayName;
  final String? subtitle;
  final String? iconMediaResourceId;
  final String? averageRating;

  PublicUserStoreListingCard({
    this.listingId,
    this.displayName,
    this.subtitle,
    this.iconMediaResourceId,
    this.averageRating
  });

  factory PublicUserStoreListingCard.fromJson(Map<String, dynamic> json) {
    return PublicUserStoreListingCard(
      listingId: json['listingId']?.toString(),
      displayName: json['displayName']?.toString(),
      subtitle: json['subtitle']?.toString(),
      iconMediaResourceId: json['iconMediaResourceId']?.toString(),
      averageRating: json['averageRating']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'listingId': listingId,
      'displayName': displayName,
      'subtitle': subtitle,
      'iconMediaResourceId': iconMediaResourceId,
      'averageRating': averageRating,
    };
  }
}

class PublicUserStoreViewResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  PublicUserStoreViewResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory PublicUserStoreViewResponse.fromJson(Map<String, dynamic> json) {
    return PublicUserStoreViewResponse(
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

class PublicUserStoreItemsResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  PublicUserStoreItemsResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory PublicUserStoreItemsResponse.fromJson(Map<String, dynamic> json) {
    return PublicUserStoreItemsResponse(
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

class ReleaseCheckUpdateRequest {
  final String? appKey;
  final String? platform;
  final String? architecture;
  final String? installedVersionCode;
  final String? channelCode;
  final String? deviceId;
  final String? regionCode;

  ReleaseCheckUpdateRequest({
    this.appKey,
    this.platform,
    this.architecture,
    this.installedVersionCode,
    this.channelCode,
    this.deviceId,
    this.regionCode
  });

  factory ReleaseCheckUpdateRequest.fromJson(Map<String, dynamic> json) {
    return ReleaseCheckUpdateRequest(
      appKey: json['appKey']?.toString(),
      platform: json['platform']?.toString(),
      architecture: json['architecture']?.toString(),
      installedVersionCode: json['installedVersionCode']?.toString(),
      channelCode: json['channelCode']?.toString(),
      deviceId: json['deviceId']?.toString(),
      regionCode: json['regionCode']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'appKey': appKey,
      'platform': platform,
      'architecture': architecture,
      'installedVersionCode': installedVersionCode,
      'channelCode': channelCode,
      'deviceId': deviceId,
      'regionCode': regionCode,
    };
  }
}

class ReleaseCheckUpdateResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  ReleaseCheckUpdateResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory ReleaseCheckUpdateResponse.fromJson(Map<String, dynamic> json) {
    return ReleaseCheckUpdateResponse(
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

class ArtifactResolveDownloadRequest {
  final String? artifactId;
  final String? grantId;
  final String? appKey;

  ArtifactResolveDownloadRequest({
    this.artifactId,
    this.grantId,
    this.appKey
  });

  factory ArtifactResolveDownloadRequest.fromJson(Map<String, dynamic> json) {
    return ArtifactResolveDownloadRequest(
      artifactId: json['artifactId']?.toString(),
      grantId: json['grantId']?.toString(),
      appKey: json['appKey']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'artifactId': artifactId,
      'grantId': grantId,
      'appKey': appKey,
    };
  }
}

class ArtifactResolveDownloadResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  ArtifactResolveDownloadResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory ArtifactResolveDownloadResponse.fromJson(Map<String, dynamic> json) {
    return ArtifactResolveDownloadResponse(
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

class AutomationSubmissionCreateRequest {
  final String? appKey;
  final String? submissionType;
  final Map<String, dynamic>? release;
  final List<Map<String, dynamic>>? artifacts;

  AutomationSubmissionCreateRequest({
    this.appKey,
    this.submissionType,
    this.release,
    this.artifacts
  });

  factory AutomationSubmissionCreateRequest.fromJson(Map<String, dynamic> json) {
    return AutomationSubmissionCreateRequest(
      appKey: json['appKey']?.toString(),
      submissionType: json['submissionType']?.toString(),
      release: _sdkworkAsMap(json['release']),
      artifacts: (() {
        final list = _sdkworkAsList(json['artifacts']);
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
      'appKey': appKey,
      'submissionType': submissionType,
      'release': release,
      'artifacts': artifacts?.map((item) => item).toList(),
    };
  }
}

class PublicListing {
  final String? id;
  final String? publisherId;
  final String? appId;
  final String? appKey;
  final String? listingSlug;
  final String? listingType;
  final String? pricingModel;
  final String? listingStatus;
  final String? primaryCategoryId;
  final String? defaultLocale;
  final String? ageRatingCode;
  final String? officialWebsiteUrl;
  final String? supportUrl;
  final String? privacyPolicyUrl;
  final String? commentsThreadId;
  final String? commerceProductId;
  final String? currentReleaseId;
  final int? downloadCount;
  final String? averageRating;
  final int? ratingCount;
  final String? publishedAt;

  PublicListing({
    this.id,
    this.publisherId,
    this.appId,
    this.appKey,
    this.listingSlug,
    this.listingType,
    this.pricingModel,
    this.listingStatus,
    this.primaryCategoryId,
    this.defaultLocale,
    this.ageRatingCode,
    this.officialWebsiteUrl,
    this.supportUrl,
    this.privacyPolicyUrl,
    this.commentsThreadId,
    this.commerceProductId,
    this.currentReleaseId,
    this.downloadCount,
    this.averageRating,
    this.ratingCount,
    this.publishedAt
  });

  factory PublicListing.fromJson(Map<String, dynamic> json) {
    return PublicListing(
      id: json['id']?.toString(),
      publisherId: json['publisherId']?.toString(),
      appId: json['appId']?.toString(),
      appKey: json['appKey']?.toString(),
      listingSlug: json['listingSlug']?.toString(),
      listingType: json['listingType']?.toString(),
      pricingModel: json['pricingModel']?.toString(),
      listingStatus: json['listingStatus']?.toString(),
      primaryCategoryId: json['primaryCategoryId']?.toString(),
      defaultLocale: json['defaultLocale']?.toString(),
      ageRatingCode: json['ageRatingCode']?.toString(),
      officialWebsiteUrl: json['officialWebsiteUrl']?.toString(),
      supportUrl: json['supportUrl']?.toString(),
      privacyPolicyUrl: json['privacyPolicyUrl']?.toString(),
      commentsThreadId: json['commentsThreadId']?.toString(),
      commerceProductId: json['commerceProductId']?.toString(),
      currentReleaseId: json['currentReleaseId']?.toString(),
      downloadCount: json['downloadCount'] is int ? json['downloadCount'] : null,
      averageRating: json['averageRating']?.toString(),
      ratingCount: json['ratingCount'] is int ? json['ratingCount'] : null,
      publishedAt: json['publishedAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'publisherId': publisherId,
      'appId': appId,
      'appKey': appKey,
      'listingSlug': listingSlug,
      'listingType': listingType,
      'pricingModel': pricingModel,
      'listingStatus': listingStatus,
      'primaryCategoryId': primaryCategoryId,
      'defaultLocale': defaultLocale,
      'ageRatingCode': ageRatingCode,
      'officialWebsiteUrl': officialWebsiteUrl,
      'supportUrl': supportUrl,
      'privacyPolicyUrl': privacyPolicyUrl,
      'commentsThreadId': commentsThreadId,
      'commerceProductId': commerceProductId,
      'currentReleaseId': currentReleaseId,
      'downloadCount': downloadCount,
      'averageRating': averageRating,
      'ratingCount': ratingCount,
      'publishedAt': publishedAt,
    };
  }
}

class PublicListingResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  PublicListingResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory PublicListingResponse.fromJson(Map<String, dynamic> json) {
    return PublicListingResponse(
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

class PublicRelease {
  final String? id;
  final String? listingId;
  final String? releaseNo;
  final String? versionName;
  final String? versionCode;
  final String? buildNumber;
  final String? releaseStatus;
  final String? minimumOsVersion;
  final String? publishedAt;

  PublicRelease({
    this.id,
    this.listingId,
    this.releaseNo,
    this.versionName,
    this.versionCode,
    this.buildNumber,
    this.releaseStatus,
    this.minimumOsVersion,
    this.publishedAt
  });

  factory PublicRelease.fromJson(Map<String, dynamic> json) {
    return PublicRelease(
      id: json['id']?.toString(),
      listingId: json['listingId']?.toString(),
      releaseNo: json['releaseNo']?.toString(),
      versionName: json['versionName']?.toString(),
      versionCode: json['versionCode']?.toString(),
      buildNumber: json['buildNumber']?.toString(),
      releaseStatus: json['releaseStatus']?.toString(),
      minimumOsVersion: json['minimumOsVersion']?.toString(),
      publishedAt: json['publishedAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'listingId': listingId,
      'releaseNo': releaseNo,
      'versionName': versionName,
      'versionCode': versionCode,
      'buildNumber': buildNumber,
      'releaseStatus': releaseStatus,
      'minimumOsVersion': minimumOsVersion,
      'publishedAt': publishedAt,
    };
  }
}

class PublicReleaseResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  PublicReleaseResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory PublicReleaseResponse.fromJson(Map<String, dynamic> json) {
    return PublicReleaseResponse(
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

class PublicFeaturedSlot {
  final String? id;
  final String? slotCode;
  final String? listingId;
  final String? status;
  final String? platformScope;
  final List<String>? regionScope;
  final String? startsAt;
  final String? endsAt;

  PublicFeaturedSlot({
    this.id,
    this.slotCode,
    this.listingId,
    this.status,
    this.platformScope,
    this.regionScope,
    this.startsAt,
    this.endsAt
  });

  factory PublicFeaturedSlot.fromJson(Map<String, dynamic> json) {
    return PublicFeaturedSlot(
      id: json['id']?.toString(),
      slotCode: json['slotCode']?.toString(),
      listingId: json['listingId']?.toString(),
      status: json['status']?.toString(),
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
      'platformScope': platformScope,
      'regionScope': regionScope?.map((item) => item).toList(),
      'startsAt': startsAt,
      'endsAt': endsAt,
    };
  }
}

class PublicFeaturedListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  PublicFeaturedListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory PublicFeaturedListResponse.fromJson(Map<String, dynamic> json) {
    return PublicFeaturedListResponse(
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

class AutomationSubmission {
  final bool? accepted;
  final String? releaseId;

  AutomationSubmission({
    this.accepted,
    this.releaseId
  });

  factory AutomationSubmission.fromJson(Map<String, dynamic> json) {
    return AutomationSubmission(
      accepted: json['accepted'] is bool ? json['accepted'] : null,
      releaseId: json['releaseId']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'accepted': accepted,
      'releaseId': releaseId,
    };
  }
}

class AutomationSubmissionResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  AutomationSubmissionResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory AutomationSubmissionResponse.fromJson(Map<String, dynamic> json) {
    return AutomationSubmissionResponse(
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
