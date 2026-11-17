use sdkwork_appstore_catalog_service::domain::results::{
    CategoriesListResult, CategoryRetrieveResult, ChartsRetrieveResult, CollectionRetrieveResult,
    CollectionsListResult, ExpertRetrieveResult, ExpertsListResult, FeaturedListResult,
    FeedbackCreateResult, HomeRetrieveResult, ListingsSearchResult,
};

pub fn map_home_retrieve_response(result: HomeRetrieveResult) -> HomeRetrieveResult {
    result
}

pub fn map_categories_list_response(result: CategoriesListResult) -> CategoriesListResult {
    result
}

pub fn map_category_retrieve_response(result: CategoryRetrieveResult) -> CategoryRetrieveResult {
    result
}

pub fn map_collections_list_response(result: CollectionsListResult) -> CollectionsListResult {
    result
}

pub fn map_collection_retrieve_response(
    result: CollectionRetrieveResult,
) -> CollectionRetrieveResult {
    result
}

pub fn map_featured_list_response(result: FeaturedListResult) -> FeaturedListResult {
    result
}

pub fn map_charts_retrieve_response(result: ChartsRetrieveResult) -> ChartsRetrieveResult {
    result
}

pub fn map_listings_search_response(result: ListingsSearchResult) -> ListingsSearchResult {
    result
}

pub fn map_feedback_create_response(result: FeedbackCreateResult) -> FeedbackCreateResult {
    result
}

pub fn map_experts_list_response(result: ExpertsListResult) -> ExpertsListResult {
    result
}

pub fn map_expert_retrieve_response(result: ExpertRetrieveResult) -> ExpertRetrieveResult {
    result
}
