pub fn init_logging() {
    let subscriber = tracing_subscriber::fmt()
        .with_env_filter("info")
        .finish();
    let _ = tracing::subscriber::set_global_default(subscriber);
}
