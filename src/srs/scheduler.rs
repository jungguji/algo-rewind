use chrono::{NaiveDate, Duration};
use crate::models::problem::Level;

/// Calculate the next review date based on current date and level
/// Returns date in YYYY-MM-DD format
pub fn calculate_next_review(current_date: &str, level: &Level) -> String {
    let date = match NaiveDate::parse_from_str(current_date, "%Y-%m-%d") {
        Ok(d) => d,
        Err(_) => {
            // Fallback to today if parsing fails
            chrono::Utc::now().date_naive()
        }
    };

    let days = match level {
        Level::AGAIN => 1,
        Level::HARD => 3,
        Level::GOOD => 7,
        Level::EASY => 30,
    };

    (date + Duration::days(days)).format("%Y-%m-%d").to_string()
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_next_review_again() {
        let next = calculate_next_review("2025-11-02", &Level::AGAIN);
        assert_eq!(next, "2025-11-03");
    }

    #[test]
    fn test_calculate_next_review_hard() {
        let next = calculate_next_review("2025-11-02", &Level::HARD);
        assert_eq!(next, "2025-11-05");
    }

    #[test]
    fn test_calculate_next_review_good() {
        let next = calculate_next_review("2025-11-02", &Level::GOOD);
        assert_eq!(next, "2025-11-09");
    }

    #[test]
    fn test_calculate_next_review_easy() {
        let next = calculate_next_review("2025-11-02", &Level::EASY);
        assert_eq!(next, "2025-12-02");
    }
}
