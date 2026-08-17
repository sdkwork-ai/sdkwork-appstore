#[test]
fn standalone_gateway_composes_iam_app_api_contribution() {
    let gateway_main = include_str!("../src/main.rs");
    let gateway_cargo = include_str!("../Cargo.toml");

    assert!(gateway_main.contains("sdkwork_api_iam_assembly::assemble_app_api_contribution"));
    assert!(gateway_main.contains("ComposedApiAssembly::try_compose"));
    assert!(gateway_cargo.contains("sdkwork-api-iam-assembly"));
}
