use serde::{Deserialize, Serialize};

#[derive(Serialize, Deserialize, Clone, Debug, PartialEq)]
pub enum Level {
    AGAIN,
    HARD,
    GOOD,
    EASY,
}

impl Level {
    pub fn from_str(s: &str) -> Result<Self, String> {
        match s.to_uppercase().as_str() {
            "AGAIN" => Ok(Level::AGAIN),
            "HARD" => Ok(Level::HARD),
            "GOOD" => Ok(Level::GOOD),
            "EASY" => Ok(Level::EASY),
            _ => Err(format!("Invalid level: {}", s)),
        }
    }
}

#[derive(Serialize, Deserialize, Clone, Debug)]
pub struct Problem {
    pub id: i64,              // timestamp
    pub name: String,
    pub url: Option<String>,
    pub tags: Vec<String>,
    pub memo: String,
    pub level: Level,
    pub created_at: String,   // ISO 8601 format (YYYY-MM-DD)
    pub next_review_at: String, // ISO 8601 format (YYYY-MM-DD)
}

impl Problem {
    pub fn new(
        name: String,
        url: Option<String>,
        tags: Vec<String>,
        memo: String,
        level: Level,
    ) -> Self {
        let now = chrono::Utc::now();
        let id = now.timestamp_millis();
        let created_at = now.format("%Y-%m-%d").to_string();

        // Calculate next review date based on level
        let next_review_at = crate::srs::scheduler::calculate_next_review(&created_at, &level);

        Problem {
            id,
            name,
            url,
            tags,
            memo,
            level,
            created_at,
            next_review_at,
        }
    }
}
