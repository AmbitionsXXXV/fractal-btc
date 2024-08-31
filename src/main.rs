#![allow(dead_code)]
#![allow(unused_variables)]

mod api;
mod constants;
mod error;
mod types;

use crate::api::ApiClient;
use crate::constants::*;
use crate::types::*;
use anyhow::Result;

// -- 计算 mint 进度的函数保持不变
fn calculate_mint_progress(ticker_info: &TickerInfo) -> f64 {
    let total_minted: f64 = ticker_info.total_minted.parse().unwrap_or(0.0);
    let max: f64 = ticker_info.max.parse().unwrap_or(1.0); // -- 避免除以零

    (total_minted / max * 100.0).min(100.0) // -- 确保进度不超过 100%
}

#[tokio::main]
async fn main() -> Result<()> {
    // -- 创建 ApiClient 实例，现在需要处理可能的错误
    let client = ApiClient::new()?;

    // -- 获取推荐费用
    let recommended_fees = client.get_recommended_fees().await?;
    println!("推荐费用：");
    println!("  经济费用：{}", recommended_fees.economy_fee);
    println!("  最快费用：{}", recommended_fees.fastest_fee);
    println!("  半小时费用：{}", recommended_fees.half_hour_fee);
    println!("  一小时费用：{}", recommended_fees.hour_fee);
    println!("  最低费用：{}", recommended_fees.minimum_fee);

    // -- 获取 BRC20 铭文状态
    // let brc20_status = client.get_brc20_status().await?;
    // println!("BRC20 状态：");
    // for token in &brc20_status.data.detail {
    //     // -- 过滤掉 self_mint 为 true 的 ticker
    //     if !token.self_mint && token.holders_count.gt(&2) {
    //         println!("铭文：{}", token.ticker);
    //         println!("  铭文 ID：{:#?}", token);
    //         let ticker_info = client.get_brc20_ticker_info(&token.ticker).await?;
    //         let mint_progress = calculate_mint_progress(&ticker_info.data);
    //         println!("铭文详情：");
    //         println!("  总铸造量：{}", ticker_info.data.total_minted);
    //         println!("  最大供应量：{}", ticker_info.data.max);
    //         println!("  铸造进度：{:.2}%", mint_progress);
    //         println!("---");
    //     }
    // }

    // -- 创建 BRC20 铸造订单（注释掉的部分）
    // let create_order_request = CreateOrderRequest {
    //     receive_address: ADDRESS.to_string(),
    //     fee_rate: recommended_fees.fastest_fee as f32,
    //     output_value: 546,
    //     dev_address: ADDRESS.to_string(),
    //     dev_fee: 0,
    //     brc20_ticker: "cndoge".to_string(),
    //     brc20_amount: "1000".to_string(),
    //     count: 100,
    // };
    // let order_response = client
    //     .create_brc20_mint_order(&create_order_request)
    //     .await?;
    // println!("订单创建成功：{:#?}", order_response);

    // -- 获取 UTXO
    let utxos = client.get_utxo(ADDRESS.to_string()).await?;

    println!("UTXO：{utxos:#?}");

    // -- 获取公钥
    // let key = client.get_pub_key()?;

    Ok(())
}
