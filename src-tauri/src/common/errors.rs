use std::fmt;

#[derive(Debug)]
pub enum MacPulseError {
    SystemApi(String),
    PermissionDenied(String),
    NotFound(String),
    ExecutionFailed(String),
}

impl fmt::Display for MacPulseError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            MacPulseError::SystemApi(msg) => write!(f, "System API Error: {}", msg),
            MacPulseError::PermissionDenied(msg) => write!(f, "Permission Denied: {}", msg),
            MacPulseError::NotFound(msg) => write!(f, "Not Found: {}", msg),
            MacPulseError::ExecutionFailed(msg) => write!(f, "Execution Failed: {}", msg),
        }
    }
}

impl std::error::Error for MacPulseError {}
