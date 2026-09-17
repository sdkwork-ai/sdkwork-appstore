import '../models/search_models.dart';

enum SearchStatus { idle, loading, ready, error }

class SearchState {
  const SearchState({
    this.status = SearchStatus.idle,
    this.lastResult,
    this.error,
  });

  final SearchStatus status;
  final SearchPageResult<Object?>? lastResult;
  final String? error;

  SearchState loading() => const SearchState(status: SearchStatus.loading);

  SearchState loaded(SearchPageResult<Object?> result) =>
      SearchState(status: SearchStatus.ready, lastResult: result);

  SearchState failed(String message) =>
      SearchState(status: SearchStatus.error, error: message);
}
