#![allow(dead_code)]

use serde::{Deserialize, Serialize};

// -- 这里定义所有的结构体，如 QueryParams、ApiResponse、ResponseData 等

#[derive(Serialize)]
pub struct QueryParams {
    pub start: u32,
    pub limit: u32,
    pub sort: String,
    pub complete: u32,
    pub tick_filter: u32,
}

#[derive(Debug, Deserialize)]
pub struct ApiResponse<T> {
    pub code: i32,
    pub msg: String,
    pub data: T,
}

#[derive(Debug, Deserialize)]
pub struct ResponseData {
    pub detail: Vec<TokenDetail>,
}

#[derive(Debug, Deserialize)]
pub struct TokenDetail {
    pub ticker: String,
    pub creator: String,
    pub decimal: u8,
    #[serde(rename = "totalMinted")]
    pub total_minted: String,
    #[serde(rename = "confirmedMinted")]
    pub confirmed_minted: String,
    #[serde(rename = "confirmedMinted1h")]
    pub confirmed_minted_1h: String,
    #[serde(rename = "confirmedMinted24h")]
    pub confirmed_minted_24h: String,
    pub minted: String,
    pub txid: String,
    #[serde(rename = "inscriptionId")]
    pub inscription_id: String,
    #[serde(rename = "holdersCount")]
    pub holders_count: u64,
    pub max: String,
    pub limit: String,
    #[serde(rename = "selfMint")]
    pub self_mint: bool,
}

#[derive(Serialize)]
pub struct CreateOrderRequest {
    #[serde(rename = "receiveAddress")]
    pub receive_address: String,
    #[serde(rename = "feeRate")]
    pub fee_rate: f32,
    #[serde(rename = "outputValue")]
    pub output_value: i32,
    #[serde(rename = "devAddress")]
    pub dev_address: String,
    #[serde(rename = "devFee")]
    pub dev_fee: i32,
    #[serde(rename = "brc20Ticker")]
    pub brc20_ticker: String,
    #[serde(rename = "brc20Amount")]
    pub brc20_amount: String,
    pub count: i32,
}

#[derive(Deserialize, Debug)]
pub struct CreateOrderResponse {
    pub msg: String,
    pub data: OrderData,
}

#[derive(Deserialize, Debug)]
pub struct OrderData {
    #[serde(rename = "orderId")]
    pub order_id: String,
    pub status: String,
    #[serde(rename = "payAddress")]
    pub pay_address: String,
    #[serde(rename = "receiveAddress")]
    pub receive_address: String,
    pub amount: i32,
    #[serde(rename = "feeRate")]
    pub fee_rate: i32,
    #[serde(rename = "minerFee")]
    pub miner_fee: i32,
    #[serde(rename = "serviceFee")]
    pub service_fee: i32,
    #[serde(rename = "devFee")]
    pub dev_fee: i32,
}

#[derive(Debug, Deserialize)]
pub struct TickerInfo {
    pub ticker: String,
    pub creator: String,
    #[serde(rename = "totalMinted")]
    pub total_minted: String,
    #[serde(rename = "confirmedMinted")]
    pub confirmed_minted: String,
    #[serde(rename = "confirmedMinted1h")]
    pub confirmed_minted_1h: String,
    #[serde(rename = "confirmedMinted24h")]
    pub confirmed_minted_24h: String,
    pub minted: String,
    pub txid: String,
    #[serde(rename = "inscriptionId")]
    pub inscription_id: String,
    pub max: String,
    pub limit: String,
}

#[derive(Debug, Deserialize)]
pub struct RecommendedFees {
    #[serde(rename = "economyFee")]
    pub economy_fee: u32,
    #[serde(rename = "fastestFee")]
    pub fastest_fee: u32,
    #[serde(rename = "halfHourFee")]
    pub half_hour_fee: u32,
    #[serde(rename = "hourFee")]
    pub hour_fee: u32,
    #[serde(rename = "minimumFee")]
    pub minimum_fee: u32,
}

#[derive(Debug, Deserialize)]
pub struct PayOrderData {
    pub order_id: String,
    pub status: String,
    pub transaction_id: String, // 假设支付成功后会返回交易 ID
}
