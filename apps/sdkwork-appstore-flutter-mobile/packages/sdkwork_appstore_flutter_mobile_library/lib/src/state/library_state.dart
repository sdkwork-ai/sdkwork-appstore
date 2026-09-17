import '../models/library_models.dart';

enum LibraryStatus { idle, loading, ready, error }

class LibraryState {
  const LibraryState({
    this.status = LibraryStatus.idle,
    this.lastResult,
    this.error,
  });

  final LibraryStatus status;
  final LibraryPageResult<Object?>? lastResult;
  final String? error;

  LibraryState loading() => const LibraryState(status: LibraryStatus.loading);

  LibraryState loaded(LibraryPageResult<Object?> result) =>
      LibraryState(status: LibraryStatus.ready, lastResult: result);

  LibraryState failed(String message) =>
      LibraryState(status: LibraryStatus.error, error: message);
}
