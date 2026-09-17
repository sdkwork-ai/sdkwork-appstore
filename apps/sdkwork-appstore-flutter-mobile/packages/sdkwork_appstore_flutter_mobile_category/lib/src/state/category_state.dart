import '../models/category_models.dart';

enum CategoryStatus { idle, loading, ready, error }

class CategoryState {
  const CategoryState({
    this.status = CategoryStatus.idle,
    this.lastResult,
    this.error,
  });

  final CategoryStatus status;
  final CategoryPageResult<Object?>? lastResult;
  final String? error;

  CategoryState loading() => const CategoryState(status: CategoryStatus.loading);

  CategoryState loaded(CategoryPageResult<Object?> result) =>
      CategoryState(status: CategoryStatus.ready, lastResult: result);

  CategoryState failed(String message) =>
      CategoryState(status: CategoryStatus.error, error: message);
}
