use crate::host::service_container::ServiceContainer;

/// Build the composition container.
///
/// Sibling-module ports are composed by
/// [`crate::integrations::ports::integration_ports_from_env`], the single place
/// that decides between the in-process (default) and split-deployment
/// transports (MODULE_SPEC.md §4.2).
pub fn build_service_container() -> ServiceContainer {
    ServiceContainer::build()
}
