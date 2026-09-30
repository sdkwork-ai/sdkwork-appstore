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

class McpServerCategoryRecord {
  final String? id;
  final String? uuid;
  final String? categoryCode;
  final String? name;
  final String? description;
  final String? parentId;
  final int? sortOrder;
  final String? iconRef;
  final String? lifecycleStatus;

  McpServerCategoryRecord({
    this.id,
    this.uuid,
    this.categoryCode,
    this.name,
    this.description,
    this.parentId,
    this.sortOrder,
    this.iconRef,
    this.lifecycleStatus
  });

  factory McpServerCategoryRecord.fromJson(Map<String, dynamic> json) {
    return McpServerCategoryRecord(
      id: json['id']?.toString(),
      uuid: json['uuid']?.toString(),
      categoryCode: json['category_code']?.toString(),
      name: json['name']?.toString(),
      description: json['description']?.toString(),
      parentId: json['parent_id']?.toString(),
      sortOrder: json['sort_order'] is int ? json['sort_order'] : null,
      iconRef: json['icon_ref']?.toString(),
      lifecycleStatus: json['lifecycle_status']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'uuid': uuid,
      'category_code': categoryCode,
      'name': name,
      'description': description,
      'parent_id': parentId,
      'sort_order': sortOrder,
      'icon_ref': iconRef,
      'lifecycle_status': lifecycleStatus,
    };
  }
}

class McpServerRecord {
  final String? id;
  final String? uuid;
  final String? serverKey;
  final String? name;
  final String? description;
  final String? categoryId;
  final String? categoryCode;
  final String? transport;
  final String? visibility;
  final String? dataScope;
  final String? healthStatus;
  final String? lifecycleStatus;
  final List<String>? tags;
  final String? iconRef;

  McpServerRecord({
    this.id,
    this.uuid,
    this.serverKey,
    this.name,
    this.description,
    this.categoryId,
    this.categoryCode,
    this.transport,
    this.visibility,
    this.dataScope,
    this.healthStatus,
    this.lifecycleStatus,
    this.tags,
    this.iconRef
  });

  factory McpServerRecord.fromJson(Map<String, dynamic> json) {
    return McpServerRecord(
      id: json['id']?.toString(),
      uuid: json['uuid']?.toString(),
      serverKey: json['server_key']?.toString(),
      name: json['name']?.toString(),
      description: json['description']?.toString(),
      categoryId: json['category_id']?.toString(),
      categoryCode: json['category_code']?.toString(),
      transport: json['transport']?.toString(),
      visibility: json['visibility']?.toString(),
      dataScope: json['data_scope']?.toString(),
      healthStatus: json['health_status']?.toString(),
      lifecycleStatus: json['lifecycle_status']?.toString(),
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
      iconRef: json['icon_ref']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'uuid': uuid,
      'server_key': serverKey,
      'name': name,
      'description': description,
      'category_id': categoryId,
      'category_code': categoryCode,
      'transport': transport,
      'visibility': visibility,
      'data_scope': dataScope,
      'health_status': healthStatus,
      'lifecycle_status': lifecycleStatus,
      'tags': tags?.map((item) => item).toList(),
      'icon_ref': iconRef,
    };
  }
}

class McpConnectorRecord {
  final String? id;
  final String? uuid;
  final String? serverId;
  final String? connectorKey;
  final String? transport;
  final String? publishStatus;
  final String? lifecycleStatus;
  final String? endpointUrl;

  McpConnectorRecord({
    this.id,
    this.uuid,
    this.serverId,
    this.connectorKey,
    this.transport,
    this.publishStatus,
    this.lifecycleStatus,
    this.endpointUrl
  });

  factory McpConnectorRecord.fromJson(Map<String, dynamic> json) {
    return McpConnectorRecord(
      id: json['id']?.toString(),
      uuid: json['uuid']?.toString(),
      serverId: json['server_id']?.toString(),
      connectorKey: json['connector_key']?.toString(),
      transport: json['transport']?.toString(),
      publishStatus: json['publish_status']?.toString(),
      lifecycleStatus: json['lifecycle_status']?.toString(),
      endpointUrl: json['endpoint_url']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'uuid': uuid,
      'server_id': serverId,
      'connector_key': connectorKey,
      'transport': transport,
      'publish_status': publishStatus,
      'lifecycle_status': lifecycleStatus,
      'endpoint_url': endpointUrl,
    };
  }
}

class McpToolRecord {
  final String? id;
  final String? uuid;
  final String? serverId;
  final String? connectorId;
  final String? toolKey;
  final String? name;
  final String? description;
  final bool? enabled;
  final String? lifecycleStatus;
  final String? riskLevel;
  final bool? requiresApproval;

  McpToolRecord({
    this.id,
    this.uuid,
    this.serverId,
    this.connectorId,
    this.toolKey,
    this.name,
    this.description,
    this.enabled,
    this.lifecycleStatus,
    this.riskLevel,
    this.requiresApproval
  });

  factory McpToolRecord.fromJson(Map<String, dynamic> json) {
    return McpToolRecord(
      id: json['id']?.toString(),
      uuid: json['uuid']?.toString(),
      serverId: json['server_id']?.toString(),
      connectorId: json['connector_id']?.toString(),
      toolKey: json['tool_key']?.toString(),
      name: json['name']?.toString(),
      description: json['description']?.toString(),
      enabled: json['enabled'] is bool ? json['enabled'] : null,
      lifecycleStatus: json['lifecycle_status']?.toString(),
      riskLevel: json['risk_level']?.toString(),
      requiresApproval: json['requires_approval'] is bool ? json['requires_approval'] : null
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'uuid': uuid,
      'server_id': serverId,
      'connector_id': connectorId,
      'tool_key': toolKey,
      'name': name,
      'description': description,
      'enabled': enabled,
      'lifecycle_status': lifecycleStatus,
      'risk_level': riskLevel,
      'requires_approval': requiresApproval,
    };
  }
}

class McpResourceRecord {
  final String? id;
  final String? uuid;
  final String? serverId;
  final String? connectorId;
  final String? resourceKey;
  final String? uri;
  final String? name;
  final bool? enabled;
  final String? lifecycleStatus;

  McpResourceRecord({
    this.id,
    this.uuid,
    this.serverId,
    this.connectorId,
    this.resourceKey,
    this.uri,
    this.name,
    this.enabled,
    this.lifecycleStatus
  });

  factory McpResourceRecord.fromJson(Map<String, dynamic> json) {
    return McpResourceRecord(
      id: json['id']?.toString(),
      uuid: json['uuid']?.toString(),
      serverId: json['server_id']?.toString(),
      connectorId: json['connector_id']?.toString(),
      resourceKey: json['resource_key']?.toString(),
      uri: json['uri']?.toString(),
      name: json['name']?.toString(),
      enabled: json['enabled'] is bool ? json['enabled'] : null,
      lifecycleStatus: json['lifecycle_status']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'uuid': uuid,
      'server_id': serverId,
      'connector_id': connectorId,
      'resource_key': resourceKey,
      'uri': uri,
      'name': name,
      'enabled': enabled,
      'lifecycle_status': lifecycleStatus,
    };
  }
}

class McpPromptRecord {
  final String? id;
  final String? uuid;
  final String? serverId;
  final String? connectorId;
  final String? promptKey;
  final String? name;
  final bool? enabled;
  final String? lifecycleStatus;

  McpPromptRecord({
    this.id,
    this.uuid,
    this.serverId,
    this.connectorId,
    this.promptKey,
    this.name,
    this.enabled,
    this.lifecycleStatus
  });

  factory McpPromptRecord.fromJson(Map<String, dynamic> json) {
    return McpPromptRecord(
      id: json['id']?.toString(),
      uuid: json['uuid']?.toString(),
      serverId: json['server_id']?.toString(),
      connectorId: json['connector_id']?.toString(),
      promptKey: json['prompt_key']?.toString(),
      name: json['name']?.toString(),
      enabled: json['enabled'] is bool ? json['enabled'] : null,
      lifecycleStatus: json['lifecycle_status']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'uuid': uuid,
      'server_id': serverId,
      'connector_id': connectorId,
      'prompt_key': promptKey,
      'name': name,
      'enabled': enabled,
      'lifecycle_status': lifecycleStatus,
    };
  }
}

class McpInvocationRecord {
  final String? id;
  final String? uuid;
  final String? serverId;
  final String? invocationKind;
  final String? targetKey;
  final String? requestId;
  final String? traceId;
  final String? idempotencyKey;
  final String? status;
  final String? invokedAt;

  McpInvocationRecord({
    this.id,
    this.uuid,
    this.serverId,
    this.invocationKind,
    this.targetKey,
    this.requestId,
    this.traceId,
    this.idempotencyKey,
    this.status,
    this.invokedAt
  });

  factory McpInvocationRecord.fromJson(Map<String, dynamic> json) {
    return McpInvocationRecord(
      id: json['id']?.toString(),
      uuid: json['uuid']?.toString(),
      serverId: json['server_id']?.toString(),
      invocationKind: json['invocation_kind']?.toString(),
      targetKey: json['target_key']?.toString(),
      requestId: json['request_id']?.toString(),
      traceId: json['trace_id']?.toString(),
      idempotencyKey: json['idempotency_key']?.toString(),
      status: json['status']?.toString(),
      invokedAt: json['invoked_at']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'id': id,
      'uuid': uuid,
      'server_id': serverId,
      'invocation_kind': invocationKind,
      'target_key': targetKey,
      'request_id': requestId,
      'trace_id': traceId,
      'idempotency_key': idempotencyKey,
      'status': status,
      'invoked_at': invokedAt,
    };
  }
}

class AppendMcpInvocationCommand {
  final String? serverId;
  final String? connectorId;
  final String? invocationKind;
  final String? targetKey;
  final String? requestId;
  final String? traceId;
  final String? idempotencyKey;
  final String? requestJson;
  final String? responseJson;
  final String? status;
  final String? errorMessage;
  final int? durationMs;

  AppendMcpInvocationCommand({
    this.serverId,
    this.connectorId,
    this.invocationKind,
    this.targetKey,
    this.requestId,
    this.traceId,
    this.idempotencyKey,
    this.requestJson,
    this.responseJson,
    this.status,
    this.errorMessage,
    this.durationMs
  });

  factory AppendMcpInvocationCommand.fromJson(Map<String, dynamic> json) {
    return AppendMcpInvocationCommand(
      serverId: json['server_id']?.toString(),
      connectorId: json['connector_id']?.toString(),
      invocationKind: json['invocation_kind']?.toString(),
      targetKey: json['target_key']?.toString(),
      requestId: json['request_id']?.toString(),
      traceId: json['trace_id']?.toString(),
      idempotencyKey: json['idempotency_key']?.toString(),
      requestJson: json['request_json']?.toString(),
      responseJson: json['response_json']?.toString(),
      status: json['status']?.toString(),
      errorMessage: json['error_message']?.toString(),
      durationMs: json['duration_ms'] is int ? json['duration_ms'] : null
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'server_id': serverId,
      'connector_id': connectorId,
      'invocation_kind': invocationKind,
      'target_key': targetKey,
      'request_id': requestId,
      'trace_id': traceId,
      'idempotency_key': idempotencyKey,
      'request_json': requestJson,
      'response_json': responseJson,
      'status': status,
      'error_message': errorMessage,
      'duration_ms': durationMs,
    };
  }
}

class CreateMcpServerCommand {
  final String? serverKey;
  final String? name;
  final String? description;
  final String? transport;
  final String? visibility;
  final String? categoryId;
  final String? categoryCode;
  final List<String>? tags;
  final String? iconRef;

  CreateMcpServerCommand({
    this.serverKey,
    this.name,
    this.description,
    this.transport,
    this.visibility,
    this.categoryId,
    this.categoryCode,
    this.tags,
    this.iconRef
  });

  factory CreateMcpServerCommand.fromJson(Map<String, dynamic> json) {
    return CreateMcpServerCommand(
      serverKey: json['server_key']?.toString(),
      name: json['name']?.toString(),
      description: json['description']?.toString(),
      transport: json['transport']?.toString(),
      visibility: json['visibility']?.toString(),
      categoryId: json['category_id']?.toString(),
      categoryCode: json['category_code']?.toString(),
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
      iconRef: json['icon_ref']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'server_key': serverKey,
      'name': name,
      'description': description,
      'transport': transport,
      'visibility': visibility,
      'category_id': categoryId,
      'category_code': categoryCode,
      'tags': tags?.map((item) => item).toList(),
      'icon_ref': iconRef,
    };
  }
}

class UpdateMcpServerCommand {
  final String? name;
  final String? description;
  final String? transport;
  final String? visibility;
  final String? categoryId;
  final String? categoryCode;
  final List<String>? tags;
  final String? iconRef;
  final String? lifecycleStatus;

  UpdateMcpServerCommand({
    this.name,
    this.description,
    this.transport,
    this.visibility,
    this.categoryId,
    this.categoryCode,
    this.tags,
    this.iconRef,
    this.lifecycleStatus
  });

  factory UpdateMcpServerCommand.fromJson(Map<String, dynamic> json) {
    return UpdateMcpServerCommand(
      name: json['name']?.toString(),
      description: json['description']?.toString(),
      transport: json['transport']?.toString(),
      visibility: json['visibility']?.toString(),
      categoryId: json['category_id']?.toString(),
      categoryCode: json['category_code']?.toString(),
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
      iconRef: json['icon_ref']?.toString(),
      lifecycleStatus: json['lifecycle_status']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'name': name,
      'description': description,
      'transport': transport,
      'visibility': visibility,
      'category_id': categoryId,
      'category_code': categoryCode,
      'tags': tags?.map((item) => item).toList(),
      'icon_ref': iconRef,
      'lifecycle_status': lifecycleStatus,
    };
  }
}

class UpsertMcpServerCategoryCommand {
  final String? categoryCode;
  final String? name;
  final String? description;
  final String? parentId;
  final int? sortOrder;
  final String? iconRef;

  UpsertMcpServerCategoryCommand({
    this.categoryCode,
    this.name,
    this.description,
    this.parentId,
    this.sortOrder,
    this.iconRef
  });

  factory UpsertMcpServerCategoryCommand.fromJson(Map<String, dynamic> json) {
    return UpsertMcpServerCategoryCommand(
      categoryCode: json['category_code']?.toString(),
      name: json['name']?.toString(),
      description: json['description']?.toString(),
      parentId: json['parent_id']?.toString(),
      sortOrder: json['sort_order'] is int ? json['sort_order'] : null,
      iconRef: json['icon_ref']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'category_code': categoryCode,
      'name': name,
      'description': description,
      'parent_id': parentId,
      'sort_order': sortOrder,
      'icon_ref': iconRef,
    };
  }
}

class UpsertMcpConnectorCommand {
  final String? connectorKey;
  final String? transport;
  final String? endpointUrl;
  final String? commandRef;
  final String? argsJson;
  final String? envSchemaJson;
  final String? authType;
  final String? secretRef;
  final int? timeoutMs;
  final String? retryPolicyJson;
  final String? publishStatus;
  final String? lifecycleStatus;

  UpsertMcpConnectorCommand({
    this.connectorKey,
    this.transport,
    this.endpointUrl,
    this.commandRef,
    this.argsJson,
    this.envSchemaJson,
    this.authType,
    this.secretRef,
    this.timeoutMs,
    this.retryPolicyJson,
    this.publishStatus,
    this.lifecycleStatus
  });

  factory UpsertMcpConnectorCommand.fromJson(Map<String, dynamic> json) {
    return UpsertMcpConnectorCommand(
      connectorKey: json['connector_key']?.toString(),
      transport: json['transport']?.toString(),
      endpointUrl: json['endpoint_url']?.toString(),
      commandRef: json['command_ref']?.toString(),
      argsJson: json['args_json']?.toString(),
      envSchemaJson: json['env_schema_json']?.toString(),
      authType: json['auth_type']?.toString(),
      secretRef: json['secret_ref']?.toString(),
      timeoutMs: json['timeout_ms'] is int ? json['timeout_ms'] : null,
      retryPolicyJson: json['retry_policy_json']?.toString(),
      publishStatus: json['publish_status']?.toString(),
      lifecycleStatus: json['lifecycle_status']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'connector_key': connectorKey,
      'transport': transport,
      'endpoint_url': endpointUrl,
      'command_ref': commandRef,
      'args_json': argsJson,
      'env_schema_json': envSchemaJson,
      'auth_type': authType,
      'secret_ref': secretRef,
      'timeout_ms': timeoutMs,
      'retry_policy_json': retryPolicyJson,
      'publish_status': publishStatus,
      'lifecycle_status': lifecycleStatus,
    };
  }
}

class CreateOwnMcpServerCommand {
  final String? serverKey;
  final String? name;
  final String? description;
  final String? transport;
  final String? categoryId;
  final String? categoryCode;
  final List<String>? tags;
  final String? iconRef;

  CreateOwnMcpServerCommand({
    this.serverKey,
    this.name,
    this.description,
    this.transport,
    this.categoryId,
    this.categoryCode,
    this.tags,
    this.iconRef
  });

  factory CreateOwnMcpServerCommand.fromJson(Map<String, dynamic> json) {
    return CreateOwnMcpServerCommand(
      serverKey: json['server_key']?.toString(),
      name: json['name']?.toString(),
      description: json['description']?.toString(),
      transport: json['transport']?.toString(),
      categoryId: json['category_id']?.toString(),
      categoryCode: json['category_code']?.toString(),
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
      iconRef: json['icon_ref']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'server_key': serverKey,
      'name': name,
      'description': description,
      'transport': transport,
      'category_id': categoryId,
      'category_code': categoryCode,
      'tags': tags?.map((item) => item).toList(),
      'icon_ref': iconRef,
    };
  }
}

class UpdateOwnMcpServerCommand {
  final String? name;
  final String? description;
  final String? transport;
  final String? categoryId;
  final String? categoryCode;
  final List<String>? tags;
  final String? iconRef;

  UpdateOwnMcpServerCommand({
    this.name,
    this.description,
    this.transport,
    this.categoryId,
    this.categoryCode,
    this.tags,
    this.iconRef
  });

  factory UpdateOwnMcpServerCommand.fromJson(Map<String, dynamic> json) {
    return UpdateOwnMcpServerCommand(
      name: json['name']?.toString(),
      description: json['description']?.toString(),
      transport: json['transport']?.toString(),
      categoryId: json['category_id']?.toString(),
      categoryCode: json['category_code']?.toString(),
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
      iconRef: json['icon_ref']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'name': name,
      'description': description,
      'transport': transport,
      'category_id': categoryId,
      'category_code': categoryCode,
      'tags': tags?.map((item) => item).toList(),
      'icon_ref': iconRef,
    };
  }
}

class UpsertOwnMcpConnectorCommand {
  final String? connectorKey;
  final String? transport;
  final String? endpointUrl;
  final String? commandRef;
  final String? argsJson;
  final String? envSchemaJson;
  final String? authType;
  final String? secretRef;
  final int? timeoutMs;
  final String? retryPolicyJson;

  UpsertOwnMcpConnectorCommand({
    this.connectorKey,
    this.transport,
    this.endpointUrl,
    this.commandRef,
    this.argsJson,
    this.envSchemaJson,
    this.authType,
    this.secretRef,
    this.timeoutMs,
    this.retryPolicyJson
  });

  factory UpsertOwnMcpConnectorCommand.fromJson(Map<String, dynamic> json) {
    return UpsertOwnMcpConnectorCommand(
      connectorKey: json['connector_key']?.toString(),
      transport: json['transport']?.toString(),
      endpointUrl: json['endpoint_url']?.toString(),
      commandRef: json['command_ref']?.toString(),
      argsJson: json['args_json']?.toString(),
      envSchemaJson: json['env_schema_json']?.toString(),
      authType: json['auth_type']?.toString(),
      secretRef: json['secret_ref']?.toString(),
      timeoutMs: json['timeout_ms'] is int ? json['timeout_ms'] : null,
      retryPolicyJson: json['retry_policy_json']?.toString()
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'connector_key': connectorKey,
      'transport': transport,
      'endpoint_url': endpointUrl,
      'command_ref': commandRef,
      'args_json': argsJson,
      'env_schema_json': envSchemaJson,
      'auth_type': authType,
      'secret_ref': secretRef,
      'timeout_ms': timeoutMs,
      'retry_policy_json': retryPolicyJson,
    };
  }
}

class UpsertMcpToolCommand {
  final String? connectorId;
  final String? toolKey;
  final String? name;
  final String? description;
  final String? inputSchemaJson;
  final String? outputSchemaJson;
  final String? riskLevel;
  final bool? requiresApproval;
  final bool? enabled;
  final int? sortWeight;

  UpsertMcpToolCommand({
    this.connectorId,
    this.toolKey,
    this.name,
    this.description,
    this.inputSchemaJson,
    this.outputSchemaJson,
    this.riskLevel,
    this.requiresApproval,
    this.enabled,
    this.sortWeight
  });

  factory UpsertMcpToolCommand.fromJson(Map<String, dynamic> json) {
    return UpsertMcpToolCommand(
      connectorId: json['connector_id']?.toString(),
      toolKey: json['tool_key']?.toString(),
      name: json['name']?.toString(),
      description: json['description']?.toString(),
      inputSchemaJson: json['input_schema_json']?.toString(),
      outputSchemaJson: json['output_schema_json']?.toString(),
      riskLevel: json['risk_level']?.toString(),
      requiresApproval: json['requires_approval'] is bool ? json['requires_approval'] : null,
      enabled: json['enabled'] is bool ? json['enabled'] : null,
      sortWeight: json['sort_weight'] is int ? json['sort_weight'] : null
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'connector_id': connectorId,
      'tool_key': toolKey,
      'name': name,
      'description': description,
      'input_schema_json': inputSchemaJson,
      'output_schema_json': outputSchemaJson,
      'risk_level': riskLevel,
      'requires_approval': requiresApproval,
      'enabled': enabled,
      'sort_weight': sortWeight,
    };
  }
}

class UpsertMcpResourceCommand {
  final String? connectorId;
  final String? resourceKey;
  final String? uri;
  final String? name;
  final String? description;
  final String? mimeType;
  final bool? enabled;

  UpsertMcpResourceCommand({
    this.connectorId,
    this.resourceKey,
    this.uri,
    this.name,
    this.description,
    this.mimeType,
    this.enabled
  });

  factory UpsertMcpResourceCommand.fromJson(Map<String, dynamic> json) {
    return UpsertMcpResourceCommand(
      connectorId: json['connector_id']?.toString(),
      resourceKey: json['resource_key']?.toString(),
      uri: json['uri']?.toString(),
      name: json['name']?.toString(),
      description: json['description']?.toString(),
      mimeType: json['mime_type']?.toString(),
      enabled: json['enabled'] is bool ? json['enabled'] : null
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'connector_id': connectorId,
      'resource_key': resourceKey,
      'uri': uri,
      'name': name,
      'description': description,
      'mime_type': mimeType,
      'enabled': enabled,
    };
  }
}

class UpsertMcpPromptCommand {
  final String? connectorId;
  final String? promptKey;
  final String? name;
  final String? description;
  final String? argumentsSchemaJson;
  final bool? enabled;

  UpsertMcpPromptCommand({
    this.connectorId,
    this.promptKey,
    this.name,
    this.description,
    this.argumentsSchemaJson,
    this.enabled
  });

  factory UpsertMcpPromptCommand.fromJson(Map<String, dynamic> json) {
    return UpsertMcpPromptCommand(
      connectorId: json['connector_id']?.toString(),
      promptKey: json['prompt_key']?.toString(),
      name: json['name']?.toString(),
      description: json['description']?.toString(),
      argumentsSchemaJson: json['arguments_schema_json']?.toString(),
      enabled: json['enabled'] is bool ? json['enabled'] : null
    );
  }

  Map<String, dynamic> toJson() {
    return <String, dynamic>{
      'connector_id': connectorId,
      'prompt_key': promptKey,
      'name': name,
      'description': description,
      'arguments_schema_json': argumentsSchemaJson,
      'enabled': enabled,
    };
  }
}

class ListResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  ListResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory ListResponse.fromJson(Map<String, dynamic> json) {
    return ListResponse(
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

class ListGetResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  ListGetResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory ListGetResponse.fromJson(Map<String, dynamic> json) {
    return ListGetResponse(
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

class CreateResponse201 {
  final int? code;
  final dynamic data;
  final String? traceId;

  CreateResponse201({
    this.code,
    this.data,
    this.traceId
  });

  factory CreateResponse201.fromJson(Map<String, dynamic> json) {
    return CreateResponse201(
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

class ListGetResponse2 {
  final int? code;
  final dynamic data;
  final String? traceId;

  ListGetResponse2({
    this.code,
    this.data,
    this.traceId
  });

  factory ListGetResponse2.fromJson(Map<String, dynamic> json) {
    return ListGetResponse2(
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

class RetrieveResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  RetrieveResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory RetrieveResponse.fromJson(Map<String, dynamic> json) {
    return RetrieveResponse(
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

class UpdateResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  UpdateResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory UpdateResponse.fromJson(Map<String, dynamic> json) {
    return UpdateResponse(
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

class ListGetResponse3 {
  final int? code;
  final dynamic data;
  final String? traceId;

  ListGetResponse3({
    this.code,
    this.data,
    this.traceId
  });

  factory ListGetResponse3.fromJson(Map<String, dynamic> json) {
    return ListGetResponse3(
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

class RetrieveGetResponse {
  final int? code;
  final dynamic data;
  final String? traceId;

  RetrieveGetResponse({
    this.code,
    this.data,
    this.traceId
  });

  factory RetrieveGetResponse.fromJson(Map<String, dynamic> json) {
    return RetrieveGetResponse(
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

class ListGetResponse4 {
  final int? code;
  final dynamic data;
  final String? traceId;

  ListGetResponse4({
    this.code,
    this.data,
    this.traceId
  });

  factory ListGetResponse4.fromJson(Map<String, dynamic> json) {
    return ListGetResponse4(
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

class ListGetResponse5 {
  final int? code;
  final dynamic data;
  final String? traceId;

  ListGetResponse5({
    this.code,
    this.data,
    this.traceId
  });

  factory ListGetResponse5.fromJson(Map<String, dynamic> json) {
    return ListGetResponse5(
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

class CreatePostResponse201 {
  final int? code;
  final dynamic data;
  final String? traceId;

  CreatePostResponse201({
    this.code,
    this.data,
    this.traceId
  });

  factory CreatePostResponse201.fromJson(Map<String, dynamic> json) {
    return CreatePostResponse201(
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

class ListGetResponse6 {
  final int? code;
  final dynamic data;
  final String? traceId;

  ListGetResponse6({
    this.code,
    this.data,
    this.traceId
  });

  factory ListGetResponse6.fromJson(Map<String, dynamic> json) {
    return ListGetResponse6(
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
