import '../http/client.dart';
import '../models.dart';

import 'paths.dart';
import 'response_helpers.dart';


class ArtifactsApi {
  final HttpClient _client;

  ArtifactsApi(this._client);

  /// Resolve artifact download location from grant or entitlement
  Future<ArtifactResolveDownloadResponse?> appstoreArtifactsResolveDownload(ArtifactResolveDownloadRequest body) async {
    final payload = body.toJson();
    final response = await _client.post(ApiPaths.customPath('/artifacts/resolve_download'), body: payload, contentType: 'application/json');
    return (() {
      final map = sdkworkResponseAsMap(response);
      return map == null ? null : ArtifactResolveDownloadResponse.fromJson(map);
    })();
  }
}
