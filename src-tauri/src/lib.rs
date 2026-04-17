use std::collections::HashMap;
use std::time::Instant;

use reqwest::Client;
use serde::{Deserialize, Serialize};

#[derive(Serialize)]
pub struct HttpResponse {
    status: u16,
    headers: HashMap<String, String>,
    body: String,
    elapsed_ms: u64,
}

#[derive(Deserialize)]
#[serde(rename_all = "lowercase")]
enum HttpMethod {
    Get,
    Post,
    Put,
    Delete,
    Patch,
}

#[tauri::command]
async fn send_request(
    url: String,
    method: String,
    headers: HashMap<String, String>,
    body: Option<String>,
) -> Result<HttpResponse, String> {
    let client = Client::builder()
        .danger_accept_invalid_certs(false)
        .build()
        .map_err(|e| e.to_string())?;

    let mut builder = match method.to_uppercase().as_str() {
        "GET" => client.get(&url),
        "POST" => client.post(&url),
        "PUT" => client.put(&url),
        "DELETE" => client.delete(&url),
        "PATCH" => client.patch(&url),
        m => return Err(format!("Unsupported method: {m}")),
    };

    for (key, value) in &headers {
        builder = builder.header(key, value);
    }

    if let Some(ref b) = body {
        if !headers.keys().any(|k| k.to_lowercase() == "content-type") {
            builder = builder.header("Content-Type", "application/json");
        }
        builder = builder.body(b.clone());
    }

    let start = Instant::now();
    let response = builder.send().await.map_err(|e| e.to_string())?;
    let elapsed_ms = start.elapsed().as_millis() as u64;

    let status = response.status().as_u16();

    let mut resp_headers = HashMap::new();
    for (key, value) in response.headers() {
        if let Ok(v) = value.to_str() {
            resp_headers.insert(key.to_string(), v.to_string());
        }
    }

    let body_text = response.text().await.map_err(|e| e.to_string())?;

    Ok(HttpResponse {
        status,
        headers: resp_headers,
        body: body_text,
        elapsed_ms,
    })
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![send_request])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
