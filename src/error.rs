#![allow(dead_code)]

use thiserror::Error;

#[derive(Error, Debug)]
pub enum AppError {
    #[error("HTTP 请求失败：{0}")]
    HttpError(#[from] reqwest::Error),

    #[error("JSON 解析失败：{0}")]
    JsonError(#[from] serde_json::Error),

    #[error("其他错误：{0}")]
    Other(String),
}
