//! Event publication port for user store use cases.

use async_trait::async_trait;

use crate::domain::events::UserStoreDomainEvent;
use crate::error::AppstoreServiceResult;

#[async_trait]
pub trait UserStoreEventPublisher: Send + Sync {
    async fn publish(&self, event: &UserStoreDomainEvent) -> AppstoreServiceResult<()>;
}
