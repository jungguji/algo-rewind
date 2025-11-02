use wasm_bindgen::prelude::*;
use models::problem::{Level, Problem};

mod models;
mod srs;
mod utils;

/// Initialize the WASM module
#[wasm_bindgen(start)]
pub fn init() {
    // Future: Set panic hook for better error messages
    // Requires console_error_panic_hook crate
}

/// Test function to verify WASM is working
#[wasm_bindgen]
pub fn greet(name: &str) -> String {
    format!("Hello, {}! WASM is working!", name)
}

/// Add a new problem to the list
/// Returns the created problem as JSON string
#[wasm_bindgen]
pub fn add_problem(
    name: String,
    url: Option<String>,
    tags: Vec<String>,
    memo: String,
    level: String,
) -> Result<String, JsValue> {
    // Parse level string
    let level = Level::from_str(&level)
        .map_err(|e| JsValue::from_str(&e))?;

    // Create new problem
    let problem = Problem::new(name, url, tags, memo, level);

    // Serialize to JSON
    serde_json::to_string(&problem)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}

/// Get problems that need to be reviewed today
/// Takes a JSON array of problems and today's date (YYYY-MM-DD)
/// Returns filtered problems as JSON string
#[wasm_bindgen]
pub fn get_today_reviews(problems_json: String, today: String) -> Result<String, JsValue> {
    // Deserialize problems
    let problems: Vec<Problem> = serde_json::from_str(&problems_json)
        .map_err(|e| JsValue::from_str(&format!("Deserialization error: {}", e)))?;

    // Filter problems that need review today or earlier
    let today_reviews: Vec<Problem> = problems
        .into_iter()
        .filter(|p| p.next_review_at <= today)
        .collect();

    // Serialize back to JSON
    serde_json::to_string(&today_reviews)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}

/// Update a problem after review completion
/// Takes problem JSON and new level, returns updated problem as JSON
#[wasm_bindgen]
pub fn update_review(problem_json: String, new_level: String) -> Result<String, JsValue> {
    // Deserialize problem
    let mut problem: Problem = serde_json::from_str(&problem_json)
        .map_err(|e| JsValue::from_str(&format!("Deserialization error: {}", e)))?;

    // Parse new level
    let level = Level::from_str(&new_level)
        .map_err(|e| JsValue::from_str(&e))?;

    // Get today's date
    let today = chrono::Utc::now().format("%Y-%m-%d").to_string();

    // Update problem
    problem.level = level.clone();
    problem.next_review_at = srs::scheduler::calculate_next_review(&today, &level);

    // Serialize back to JSON
    serde_json::to_string(&problem)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}

/// Filter problems by search term (name or tags)
#[wasm_bindgen]
pub fn filter_problems(problems_json: String, search_term: String) -> Result<String, JsValue> {
    // Deserialize problems
    let problems: Vec<Problem> = serde_json::from_str(&problems_json)
        .map_err(|e| JsValue::from_str(&format!("Deserialization error: {}", e)))?;

    let search_lower = search_term.to_lowercase();

    // Filter by name or tags
    let filtered: Vec<Problem> = problems
        .into_iter()
        .filter(|p| {
            p.name.to_lowercase().contains(&search_lower) ||
            p.tags.iter().any(|tag| tag.to_lowercase().contains(&search_lower))
        })
        .collect();

    // Serialize back to JSON
    serde_json::to_string(&filtered)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}

/// Sort problems by criteria
/// Criteria: "next_review", "created_at", "name"
#[wasm_bindgen]
pub fn sort_problems(problems_json: String, criteria: String) -> Result<String, JsValue> {
    // Deserialize problems
    let mut problems: Vec<Problem> = serde_json::from_str(&problems_json)
        .map_err(|e| JsValue::from_str(&format!("Deserialization error: {}", e)))?;

    // Sort based on criteria
    match criteria.as_str() {
        "next_review" => {
            problems.sort_by(|a, b| a.next_review_at.cmp(&b.next_review_at));
        }
        "created_at" => {
            problems.sort_by(|a, b| b.created_at.cmp(&a.created_at)); // Newest first
        }
        "name" => {
            problems.sort_by(|a, b| a.name.cmp(&b.name));
        }
        _ => {
            return Err(JsValue::from_str("Invalid sort criteria"));
        }
    }

    // Serialize back to JSON
    serde_json::to_string(&problems)
        .map_err(|e| JsValue::from_str(&format!("Serialization error: {}", e)))
}
