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

class SkillRecord {
  final String? id;
  final String? uuid;
  final String? tenantId;
  final String? organizationId;
  final String? skillKey;
  final String? packageId;
  final String? name;
  final String? summary;
  final String? description;
  final String? marketStatus;
  final String? visibility;
  final String? reviewStatus;
  final List<String>? categories;
  final bool? enabled;
  final bool? featured;
  final String? installCount;
  final List<String>? tags;
  final String? version;
  final String? createdAt;
  final String? updatedAt;
  final String? deletedAt;

  SkillRecord({
    this.id,
    this.uuid,
    this.tenantId,
    this.organizationId,
    this.skillKey,
    this.packageId,
    this.name,
    this.summary,
    this.description,
    this.marketStatus,
    this.visibility,
    this.reviewStatus,
    this.categories,
    this.enabled,
    this.featured,
    this.installCount,
    this.tags,
    this.version,
    this.createdAt,
    this.updatedAt,
    this.deletedAt
  });

  factory SkillRecord.fromJson(Map<String, dynamic> json) {
    return SkillRecord(
      id: json['id']?.toString(),
      uuid: json['uuid']?.toString(),
      tenantId: json['tenantId']?.toString(),
      organizationId: json['organizationId']?.toString(),
      skillKey: json['skillKey']?.toString(),
      packageId: json['packageId']?.toString(),
      name: json['name']?.toString(),
      summary: json['summary']?.toString(),
      description: json['description']?.toString(),
      marketStatus: json['marketStatus']?.toString(),
      visibility: json['visibility']?.toString(),
      reviewStatus: json['reviewStatus']?.toString(),
      categories: (() {
        final list = _sdkworkAsList(json['categories']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => item?.toString())
            .whereType<String>()
            .toList();
      })(),
      enabled: json['enabled'] is bool ? json['enabled'] : null,
      featured: json['featured'] is bool ? json['featured'] : null,
      installCount: json['installCount']?.toString(),
      tags: (() {
        final list = _sdkworkAsList(json['tags']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => item?.toString())
            .whereType<String>()
            .toList();
      })(),
      version: json['version']?.toString(),
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString(),
      deletedAt: json['deletedAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'uuid': uuid,
      'tenantId': tenantId,
      'organizationId': organizationId,
      'skillKey': skillKey,
      'packageId': packageId,
      'name': name,
      'summary': summary,
      'description': description,
      'marketStatus': marketStatus,
      'visibility': visibility,
      'reviewStatus': reviewStatus,
      'categories': categories?.map((item) => item).toList(),
      'enabled': enabled,
      'featured': featured,
      'installCount': installCount,
      'tags': tags?.map((item) => item).toList(),
      'version': version,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'deletedAt': deletedAt,
    };
  }
}

class SkillPackageRecord {
  final String? id;
  final String? uuid;
  final String? tenantId;
  final String? organizationId;
  final String? ownerUserId;
  final String? skillKey;
  final String? packageKey;
  final String? code;
  final String? displayName;
  final String? summary;
  final String? description;
  final List<String>? categories;
  final List<String>? tags;
  final String? status;
  final String? visibility;
  final bool? featured;
  final int? sortWeight;
  final String? version;
  final String? createdAt;
  final String? updatedAt;
  final String? deletedAt;

  SkillPackageRecord({
    this.id,
    this.uuid,
    this.tenantId,
    this.organizationId,
    this.ownerUserId,
    this.skillKey,
    this.packageKey,
    this.code,
    this.displayName,
    this.summary,
    this.description,
    this.categories,
    this.tags,
    this.status,
    this.visibility,
    this.featured,
    this.sortWeight,
    this.version,
    this.createdAt,
    this.updatedAt,
    this.deletedAt
  });

  factory SkillPackageRecord.fromJson(Map<String, dynamic> json) {
    return SkillPackageRecord(
      id: json['id']?.toString(),
      uuid: json['uuid']?.toString(),
      tenantId: json['tenantId']?.toString(),
      organizationId: json['organizationId']?.toString(),
      ownerUserId: json['ownerUserId']?.toString(),
      skillKey: json['skillKey']?.toString(),
      packageKey: json['packageKey']?.toString(),
      code: json['code']?.toString(),
      displayName: json['displayName']?.toString(),
      summary: json['summary']?.toString(),
      description: json['description']?.toString(),
      categories: (() {
        final list = _sdkworkAsList(json['categories']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => item?.toString())
            .whereType<String>()
            .toList();
      })(),
      tags: (() {
        final list = _sdkworkAsList(json['tags']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => item?.toString())
            .whereType<String>()
            .toList();
      })(),
      status: json['status']?.toString(),
      visibility: json['visibility']?.toString(),
      featured: json['featured'] is bool ? json['featured'] : null,
      sortWeight: json['sortWeight'] is int ? json['sortWeight'] : null,
      version: json['version']?.toString(),
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString(),
      deletedAt: json['deletedAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'uuid': uuid,
      'tenantId': tenantId,
      'organizationId': organizationId,
      'ownerUserId': ownerUserId,
      'skillKey': skillKey,
      'packageKey': packageKey,
      'code': code,
      'displayName': displayName,
      'summary': summary,
      'description': description,
      'categories': categories?.map((item) => item).toList(),
      'tags': tags?.map((item) => item).toList(),
      'status': status,
      'visibility': visibility,
      'featured': featured,
      'sortWeight': sortWeight,
      'version': version,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
      'deletedAt': deletedAt,
    };
  }
}

class SkillArtifactRecord {
  final String? id;
  final String? uuid;
  final String? tenantId;
  final String? packageId;
  final String? versionLabel;
  final String? artifactRef;
  final String? checksumSha256;
  final String? sizeBytes;
  final String? invocationKind;
  final String? entrypoint;
  final Map<String, dynamic>? inputSchema;
  final Map<String, dynamic>? outputSchema;
  final Map<String, dynamic>? configSchema;
  final Map<String, dynamic>? defaultConfig;
  final String? securityProfileId;
  final String? status;
  final List<String>? capabilityKeys;
  final String? publishedAt;
  final String? yankedAt;
  final String? createdAt;

  SkillArtifactRecord({
    this.id,
    this.uuid,
    this.tenantId,
    this.packageId,
    this.versionLabel,
    this.artifactRef,
    this.checksumSha256,
    this.sizeBytes,
    this.invocationKind,
    this.entrypoint,
    this.inputSchema,
    this.outputSchema,
    this.configSchema,
    this.defaultConfig,
    this.securityProfileId,
    this.status,
    this.capabilityKeys,
    this.publishedAt,
    this.yankedAt,
    this.createdAt
  });

  factory SkillArtifactRecord.fromJson(Map<String, dynamic> json) {
    return SkillArtifactRecord(
      id: json['id']?.toString(),
      uuid: json['uuid']?.toString(),
      tenantId: json['tenantId']?.toString(),
      packageId: json['packageId']?.toString(),
      versionLabel: json['versionLabel']?.toString(),
      artifactRef: json['artifactRef']?.toString(),
      checksumSha256: json['checksumSha256']?.toString(),
      sizeBytes: json['sizeBytes']?.toString(),
      invocationKind: json['invocationKind']?.toString(),
      entrypoint: json['entrypoint']?.toString(),
      inputSchema: _sdkworkAsMap(json['inputSchema']),
      outputSchema: _sdkworkAsMap(json['outputSchema']),
      configSchema: _sdkworkAsMap(json['configSchema']),
      defaultConfig: _sdkworkAsMap(json['defaultConfig']),
      securityProfileId: json['securityProfileId']?.toString(),
      status: json['status']?.toString(),
      capabilityKeys: (() {
        final list = _sdkworkAsList(json['capabilityKeys']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => item?.toString())
            .whereType<String>()
            .toList();
      })(),
      publishedAt: json['publishedAt']?.toString(),
      yankedAt: json['yankedAt']?.toString(),
      createdAt: json['createdAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'uuid': uuid,
      'tenantId': tenantId,
      'packageId': packageId,
      'versionLabel': versionLabel,
      'artifactRef': artifactRef,
      'checksumSha256': checksumSha256,
      'sizeBytes': sizeBytes,
      'invocationKind': invocationKind,
      'entrypoint': entrypoint,
      'inputSchema': inputSchema,
      'outputSchema': outputSchema,
      'configSchema': configSchema,
      'defaultConfig': defaultConfig,
      'securityProfileId': securityProfileId,
      'status': status,
      'capabilityKeys': capabilityKeys?.map((item) => item).toList(),
      'publishedAt': publishedAt,
      'yankedAt': yankedAt,
      'createdAt': createdAt,
    };
  }
}

class SkillCategoryRecord {
  final String? id;
  final String? uuid;
  final String? tenantId;
  final String? organizationId;
  final String? categoryType;
  final String? code;
  final String? name;
  final String? description;
  final String? parentId;
  final int? sortWeight;
  final String? permissionCode;
  final bool? visible;
  final int? status;
  final String? version;
  final String? createdAt;
  final String? updatedAt;

  SkillCategoryRecord({
    this.id,
    this.uuid,
    this.tenantId,
    this.organizationId,
    this.categoryType,
    this.code,
    this.name,
    this.description,
    this.parentId,
    this.sortWeight,
    this.permissionCode,
    this.visible,
    this.status,
    this.version,
    this.createdAt,
    this.updatedAt
  });

  factory SkillCategoryRecord.fromJson(Map<String, dynamic> json) {
    return SkillCategoryRecord(
      id: json['id']?.toString(),
      uuid: json['uuid']?.toString(),
      tenantId: json['tenantId']?.toString(),
      organizationId: json['organizationId']?.toString(),
      categoryType: json['categoryType']?.toString(),
      code: json['code']?.toString(),
      name: json['name']?.toString(),
      description: json['description']?.toString(),
      parentId: json['parentId']?.toString(),
      sortWeight: json['sortWeight'] is int ? json['sortWeight'] : null,
      permissionCode: json['permissionCode']?.toString(),
      visible: json['visible'] is bool ? json['visible'] : null,
      status: json['status'] is int ? json['status'] : null,
      version: json['version']?.toString(),
      createdAt: json['createdAt']?.toString(),
      updatedAt: json['updatedAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'uuid': uuid,
      'tenantId': tenantId,
      'organizationId': organizationId,
      'categoryType': categoryType,
      'code': code,
      'name': name,
      'description': description,
      'parentId': parentId,
      'sortWeight': sortWeight,
      'permissionCode': permissionCode,
      'visible': visible,
      'status': status,
      'version': version,
      'createdAt': createdAt,
      'updatedAt': updatedAt,
    };
  }
}

class SkillInstallationRecord {
  final String? id;
  final String? uuid;
  final String? tenantId;
  final String? organizationId;
  final String? subjectKind;
  final String? subjectId;
  final String? skillId;
  final String? packageId;
  final String? artifactId;
  final String? installedByUserId;
  final String? installStatus;
  final bool? enabled;
  final Map<String, dynamic>? config;
  final String? version;
  final String? installedAt;
  final String? updatedAt;

  SkillInstallationRecord({
    this.id,
    this.uuid,
    this.tenantId,
    this.organizationId,
    this.subjectKind,
    this.subjectId,
    this.skillId,
    this.packageId,
    this.artifactId,
    this.installedByUserId,
    this.installStatus,
    this.enabled,
    this.config,
    this.version,
    this.installedAt,
    this.updatedAt
  });

  factory SkillInstallationRecord.fromJson(Map<String, dynamic> json) {
    return SkillInstallationRecord(
      id: json['id']?.toString(),
      uuid: json['uuid']?.toString(),
      tenantId: json['tenantId']?.toString(),
      organizationId: json['organizationId']?.toString(),
      subjectKind: json['subjectKind']?.toString(),
      subjectId: json['subjectId']?.toString(),
      skillId: json['skillId']?.toString(),
      packageId: json['packageId']?.toString(),
      artifactId: json['artifactId']?.toString(),
      installedByUserId: json['installedByUserId']?.toString(),
      installStatus: json['installStatus']?.toString(),
      enabled: json['enabled'] is bool ? json['enabled'] : null,
      config: _sdkworkAsMap(json['config']),
      version: json['version']?.toString(),
      installedAt: json['installedAt']?.toString(),
      updatedAt: json['updatedAt']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'uuid': uuid,
      'tenantId': tenantId,
      'organizationId': organizationId,
      'subjectKind': subjectKind,
      'subjectId': subjectId,
      'skillId': skillId,
      'packageId': packageId,
      'artifactId': artifactId,
      'installedByUserId': installedByUserId,
      'installStatus': installStatus,
      'enabled': enabled,
      'config': config,
      'version': version,
      'installedAt': installedAt,
      'updatedAt': updatedAt,
    };
  }
}

class SkillInstallationTargetCommand {
  final String? kind;
  final String? id;

  SkillInstallationTargetCommand({
    this.kind,
    this.id
  });

  factory SkillInstallationTargetCommand.fromJson(Map<String, dynamic> json) {
    return SkillInstallationTargetCommand(
      kind: json['kind']?.toString(),
      id: json['id']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'kind': kind,
      'id': id,
    };
  }
}

class CreateSkillInstallationCommand {
  final String? artifactId;
  final SkillInstallationTargetCommand? target;
  final Map<String, dynamic>? config;

  CreateSkillInstallationCommand({
    this.artifactId,
    this.target,
    this.config
  });

  factory CreateSkillInstallationCommand.fromJson(Map<String, dynamic> json) {
    return CreateSkillInstallationCommand(
      artifactId: json['artifactId']?.toString(),
      target: (() {
        final map = _sdkworkAsMap(json['target']);
        return map == null ? null : SkillInstallationTargetCommand.fromJson(map);
      })(),
      config: _sdkworkAsMap(json['config'])
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'artifactId': artifactId,
      'target': target?.toJson(),
      'config': config,
    };
  }
}

class CreateSkillArtifactCommand {
  final String? versionLabel;
  final String? artifactRef;
  final String? checksumSha256;
  final String? sizeBytes;
  final String? invocationKind;
  final String? entrypoint;
  final Map<String, dynamic>? inputSchema;
  final Map<String, dynamic>? outputSchema;
  final Map<String, dynamic>? configSchema;
  final Map<String, dynamic>? defaultConfig;
  final String? securityProfileId;
  final String? status;
  final List<String>? capabilityKeys;

  CreateSkillArtifactCommand({
    this.versionLabel,
    this.artifactRef,
    this.checksumSha256,
    this.sizeBytes,
    this.invocationKind,
    this.entrypoint,
    this.inputSchema,
    this.outputSchema,
    this.configSchema,
    this.defaultConfig,
    this.securityProfileId,
    this.status,
    this.capabilityKeys
  });

  factory CreateSkillArtifactCommand.fromJson(Map<String, dynamic> json) {
    return CreateSkillArtifactCommand(
      versionLabel: json['versionLabel']?.toString(),
      artifactRef: json['artifactRef']?.toString(),
      checksumSha256: json['checksumSha256']?.toString(),
      sizeBytes: json['sizeBytes']?.toString(),
      invocationKind: json['invocationKind']?.toString(),
      entrypoint: json['entrypoint']?.toString(),
      inputSchema: _sdkworkAsMap(json['inputSchema']),
      outputSchema: _sdkworkAsMap(json['outputSchema']),
      configSchema: _sdkworkAsMap(json['configSchema']),
      defaultConfig: _sdkworkAsMap(json['defaultConfig']),
      securityProfileId: json['securityProfileId']?.toString(),
      status: json['status']?.toString(),
      capabilityKeys: (() {
        final list = _sdkworkAsList(json['capabilityKeys']);
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
      'versionLabel': versionLabel,
      'artifactRef': artifactRef,
      'checksumSha256': checksumSha256,
      'sizeBytes': sizeBytes,
      'invocationKind': invocationKind,
      'entrypoint': entrypoint,
      'inputSchema': inputSchema,
      'outputSchema': outputSchema,
      'configSchema': configSchema,
      'defaultConfig': defaultConfig,
      'securityProfileId': securityProfileId,
      'status': status,
      'capabilityKeys': capabilityKeys?.map((item) => item).toList(),
    };
  }
}

class CreateSkillPackageCommand {
  final String? skillKey;
  final String? packageKey;
  final String? code;
  final String? displayName;
  final String? summary;
  final String? description;
  final List<String>? categories;
  final List<String>? tags;
  final String? status;
  final String? visibility;
  final bool? featured;
  final int? sortWeight;
  final CreateSkillArtifactCommand? initialArtifact;

  CreateSkillPackageCommand({
    this.skillKey,
    this.packageKey,
    this.code,
    this.displayName,
    this.summary,
    this.description,
    this.categories,
    this.tags,
    this.status,
    this.visibility,
    this.featured,
    this.sortWeight,
    this.initialArtifact
  });

  factory CreateSkillPackageCommand.fromJson(Map<String, dynamic> json) {
    return CreateSkillPackageCommand(
      skillKey: json['skillKey']?.toString(),
      packageKey: json['packageKey']?.toString(),
      code: json['code']?.toString(),
      displayName: json['displayName']?.toString(),
      summary: json['summary']?.toString(),
      description: json['description']?.toString(),
      categories: (() {
        final list = _sdkworkAsList(json['categories']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => item?.toString())
            .whereType<String>()
            .toList();
      })(),
      tags: (() {
        final list = _sdkworkAsList(json['tags']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => item?.toString())
            .whereType<String>()
            .toList();
      })(),
      status: json['status']?.toString(),
      visibility: json['visibility']?.toString(),
      featured: json['featured'] is bool ? json['featured'] : null,
      sortWeight: json['sortWeight'] is int ? json['sortWeight'] : null,
      initialArtifact: (() {
        final map = _sdkworkAsMap(json['initialArtifact']);
        return map == null ? null : CreateSkillArtifactCommand.fromJson(map);
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'skillKey': skillKey,
      'packageKey': packageKey,
      'code': code,
      'displayName': displayName,
      'summary': summary,
      'description': description,
      'categories': categories?.map((item) => item).toList(),
      'tags': tags?.map((item) => item).toList(),
      'status': status,
      'visibility': visibility,
      'featured': featured,
      'sortWeight': sortWeight,
      'initialArtifact': initialArtifact?.toJson(),
    };
  }
}

class UpdateOwnSkillPackageCommand {
  final String? version;
  final String? displayName;
  final String? summary;
  final String? description;
  final List<String>? categories;
  final List<String>? tags;

  UpdateOwnSkillPackageCommand({
    this.version,
    this.displayName,
    this.summary,
    this.description,
    this.categories,
    this.tags
  });

  factory UpdateOwnSkillPackageCommand.fromJson(Map<String, dynamic> json) {
    return UpdateOwnSkillPackageCommand(
      version: json['version']?.toString(),
      displayName: json['displayName']?.toString(),
      summary: json['summary']?.toString(),
      description: json['description']?.toString(),
      categories: (() {
        final list = _sdkworkAsList(json['categories']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => item?.toString())
            .whereType<String>()
            .toList();
      })(),
      tags: (() {
        final list = _sdkworkAsList(json['tags']);
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
      'version': version,
      'displayName': displayName,
      'summary': summary,
      'description': description,
      'categories': categories?.map((item) => item).toList(),
      'tags': tags?.map((item) => item).toList(),
    };
  }
}

class SkillsPageData {
  final List<SkillRecord>? items;
  final PageInfo? pageInfo;

  SkillsPageData({
    this.items,
    this.pageInfo
  });

  factory SkillsPageData.fromJson(Map<String, dynamic> json) {
    return SkillsPageData(
      items: (() {
        final list = _sdkworkAsList(json['items']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => (() {
        final map = _sdkworkAsMap(item);
        return map == null ? null : SkillRecord.fromJson(map);
      })())
            .whereType<SkillRecord>()
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
      'items': items?.map((item) => item.toJson()).toList(),
      'pageInfo': pageInfo?.toJson(),
    };
  }
}

class SkillsListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  SkillsListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory SkillsListResponse.fromJson(Map<String, dynamic> json) {
    return SkillsListResponse(
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

class SkillResourceData {
  final SkillRecord? item;

  SkillResourceData({
    this.item
  });

  factory SkillResourceData.fromJson(Map<String, dynamic> json) {
    return SkillResourceData(
      item: (() {
        final map = _sdkworkAsMap(json['item']);
        return map == null ? null : SkillRecord.fromJson(map);
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'item': item?.toJson(),
    };
  }
}

class SkillResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  SkillResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory SkillResponse.fromJson(Map<String, dynamic> json) {
    return SkillResponse(
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

class SkillPackagesPageData {
  final List<SkillPackageRecord>? items;
  final PageInfo? pageInfo;

  SkillPackagesPageData({
    this.items,
    this.pageInfo
  });

  factory SkillPackagesPageData.fromJson(Map<String, dynamic> json) {
    return SkillPackagesPageData(
      items: (() {
        final list = _sdkworkAsList(json['items']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => (() {
        final map = _sdkworkAsMap(item);
        return map == null ? null : SkillPackageRecord.fromJson(map);
      })())
            .whereType<SkillPackageRecord>()
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
      'items': items?.map((item) => item.toJson()).toList(),
      'pageInfo': pageInfo?.toJson(),
    };
  }
}

class SkillPackagesListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  SkillPackagesListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory SkillPackagesListResponse.fromJson(Map<String, dynamic> json) {
    return SkillPackagesListResponse(
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

class SkillPackageResourceData {
  final SkillPackageRecord? item;

  SkillPackageResourceData({
    this.item
  });

  factory SkillPackageResourceData.fromJson(Map<String, dynamic> json) {
    return SkillPackageResourceData(
      item: (() {
        final map = _sdkworkAsMap(json['item']);
        return map == null ? null : SkillPackageRecord.fromJson(map);
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'item': item?.toJson(),
    };
  }
}

class SkillPackageResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  SkillPackageResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory SkillPackageResponse.fromJson(Map<String, dynamic> json) {
    return SkillPackageResponse(
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

class SkillArtifactsPageData {
  final List<SkillArtifactRecord>? items;
  final PageInfo? pageInfo;

  SkillArtifactsPageData({
    this.items,
    this.pageInfo
  });

  factory SkillArtifactsPageData.fromJson(Map<String, dynamic> json) {
    return SkillArtifactsPageData(
      items: (() {
        final list = _sdkworkAsList(json['items']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => (() {
        final map = _sdkworkAsMap(item);
        return map == null ? null : SkillArtifactRecord.fromJson(map);
      })())
            .whereType<SkillArtifactRecord>()
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
      'items': items?.map((item) => item.toJson()).toList(),
      'pageInfo': pageInfo?.toJson(),
    };
  }
}

class SkillArtifactsListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  SkillArtifactsListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory SkillArtifactsListResponse.fromJson(Map<String, dynamic> json) {
    return SkillArtifactsListResponse(
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

class SkillArtifactResourceData {
  final SkillArtifactRecord? item;

  SkillArtifactResourceData({
    this.item
  });

  factory SkillArtifactResourceData.fromJson(Map<String, dynamic> json) {
    return SkillArtifactResourceData(
      item: (() {
        final map = _sdkworkAsMap(json['item']);
        return map == null ? null : SkillArtifactRecord.fromJson(map);
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'item': item?.toJson(),
    };
  }
}

class SkillArtifactResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  SkillArtifactResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory SkillArtifactResponse.fromJson(Map<String, dynamic> json) {
    return SkillArtifactResponse(
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

class SkillCategoriesPageData {
  final List<SkillCategoryRecord>? items;
  final PageInfo? pageInfo;

  SkillCategoriesPageData({
    this.items,
    this.pageInfo
  });

  factory SkillCategoriesPageData.fromJson(Map<String, dynamic> json) {
    return SkillCategoriesPageData(
      items: (() {
        final list = _sdkworkAsList(json['items']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => (() {
        final map = _sdkworkAsMap(item);
        return map == null ? null : SkillCategoryRecord.fromJson(map);
      })())
            .whereType<SkillCategoryRecord>()
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
      'items': items?.map((item) => item.toJson()).toList(),
      'pageInfo': pageInfo?.toJson(),
    };
  }
}

class SkillCategoriesListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  SkillCategoriesListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory SkillCategoriesListResponse.fromJson(Map<String, dynamic> json) {
    return SkillCategoriesListResponse(
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

class SkillInstallationsPageData {
  final List<SkillInstallationRecord>? items;
  final PageInfo? pageInfo;

  SkillInstallationsPageData({
    this.items,
    this.pageInfo
  });

  factory SkillInstallationsPageData.fromJson(Map<String, dynamic> json) {
    return SkillInstallationsPageData(
      items: (() {
        final list = _sdkworkAsList(json['items']);
        if (list == null) {
          return null;
        }
        return list
            .map((item) => (() {
        final map = _sdkworkAsMap(item);
        return map == null ? null : SkillInstallationRecord.fromJson(map);
      })())
            .whereType<SkillInstallationRecord>()
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
      'items': items?.map((item) => item.toJson()).toList(),
      'pageInfo': pageInfo?.toJson(),
    };
  }
}

class SkillInstallationsListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  SkillInstallationsListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory SkillInstallationsListResponse.fromJson(Map<String, dynamic> json) {
    return SkillInstallationsListResponse(
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

class SkillInstallationResourceData {
  final SkillInstallationRecord? item;

  SkillInstallationResourceData({
    this.item
  });

  factory SkillInstallationResourceData.fromJson(Map<String, dynamic> json) {
    return SkillInstallationResourceData(
      item: (() {
        final map = _sdkworkAsMap(json['item']);
        return map == null ? null : SkillInstallationRecord.fromJson(map);
      })()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'item': item?.toJson(),
    };
  }
}

class SkillInstallationResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  SkillInstallationResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory SkillInstallationResponse.fromJson(Map<String, dynamic> json) {
    return SkillInstallationResponse(
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
