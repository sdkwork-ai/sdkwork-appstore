import '../models/wishlist_models.dart';

enum WishlistStatus { idle, loading, ready, error }

class WishlistState {
  const WishlistState({
    this.status = WishlistStatus.idle,
    this.lastResult,
    this.error,
  });

  final WishlistStatus status;
  final WishlistPageResult<Object?>? lastResult;
  final String? error;

  WishlistState loading() => const WishlistState(status: WishlistStatus.loading);

  WishlistState loaded(WishlistPageResult<Object?> result) =>
      WishlistState(status: WishlistStatus.ready, lastResult: result);

  WishlistState failed(String message) =>
      WishlistState(status: WishlistStatus.error, error: message);
}
