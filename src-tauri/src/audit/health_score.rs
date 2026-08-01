use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct SecurityScoreBreakdown {
    pub overall_score: u32,
    pub grade: String,
    pub issues_count: usize,
    pub penalty_items: Vec<ScorePenaltyItem>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ScorePenaltyItem {
    pub category: String,
    pub description: String,
    pub points_deducted: u32,
    pub severity: String,
}

pub fn calculate_security_score() -> SecurityScoreBreakdown {
    let mut score = 100u32;
    let mut penalties = Vec::new();

    // 1. Check SIP status
    let sip_out = std::process::Command::new("csrutil")
        .arg("status")
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).to_string())
        .unwrap_or_default();

    if sip_out.contains("disabled") {
        score = score.saturating_sub(30);
        penalties.push(ScorePenaltyItem {
            category: "System Security".to_string(),
            description: "System Integrity Protection (SIP) is disabled".to_string(),
            points_deducted: 30,
            severity: "Critical".to_string(),
        });
    }

    // 2. Check FileVault status
    let fv_out = std::process::Command::new("fdesetup")
        .arg("status")
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).to_string())
        .unwrap_or_default();

    if !fv_out.contains("FileVault is On") {
        score = score.saturating_sub(20);
        penalties.push(ScorePenaltyItem {
            category: "Data Encryption".to_string(),
            description: "FileVault disk encryption is Off".to_string(),
            points_deducted: 20,
            severity: "High".to_string(),
        });
    }

    // 3. Check Firewall status
    let fw_out = std::process::Command::new("defaults")
        .args(["read", "/Library/Preferences/com.apple.alf", "globalstate"])
        .output()
        .map(|o| String::from_utf8_lossy(&o.stdout).trim().to_string())
        .unwrap_or_default();

    if fw_out == "0" {
        score = score.saturating_sub(15);
        penalties.push(ScorePenaltyItem {
            category: "Network Defense".to_string(),
            description: "Application Layer Firewall (ALF) is disabled".to_string(),
            points_deducted: 15,
            severity: "Medium".to_string(),
        });
    }

    let grade = match score {
        90..=100 => "A+ Exceptional".to_string(),
        80..=89 => "B Good".to_string(),
        70..=79 => "C Needs Review".to_string(),
        _ => "D High Risk".to_string(),
    };

    SecurityScoreBreakdown {
        overall_score: score,
        grade,
        issues_count: penalties.len(),
        penalty_items: penalties,
    }
}
