#![allow(dead_code)]
#![allow(unused_variables)]

use anyhow::{Context, Result};
use bitcoin::key::Secp256k1;
use bitcoin::secp256k1::PublicKey;
use bitcoin::secp256k1::SecretKey;
use dotenv::dotenv;
use reqwest::{Client, RequestBuilder};
use serde_json::json;
use std::env;
use std::str::FromStr;

use crate::constants::*;
use crate::types::*;

/// API 客户端，用于与 BRC20 相关的 API 进行交互
pub struct ApiClient {
    client: Client,
}

impl ApiClient {
    /// 创建一个新的 ApiClient 实例
    pub fn new() -> Result<Self> {
        dotenv().ok(); // -- 加载 .env 文件
        Ok(Self {
            client: Client::new(),
        })
    }

    /// 封装 GET 请求，自动添加 bearer token 认证
    ///
    /// # 参数
    ///
    /// * `url` - 请求的 URL
    fn get(&self, url: &str) -> Result<RequestBuilder> {
        let api_key = env::var("API_KEY").context("API_KEY 未在 .env 文件中设置")?;
        Ok(self
            .client
            .get(url)
            .bearer_auth(api_key)
            .header("Content-Type", "application/json"))
    }

    /// 封装 POST 请求，自动添加 bearer token 认证
    ///
    /// # 参数
    ///
    /// * `url` - 请求的 URL
    fn post(&self, url: &str) -> Result<RequestBuilder> {
        let api_key = env::var("API_KEY").context("API_KEY 未在 .env 文件中设置")?;
        Ok(self
            .client
            .post(url)
            .bearer_auth(api_key)
            .header("Content-Type", "application/json"))
    }

    /// 获取推荐的交易费用
    ///
    /// # 返回值
    ///
    /// 返回一个包含不同类型推荐费用的 `RecommendedFees` 结构体
    pub async fn get_recommended_fees(&self) -> Result<RecommendedFees> {
        let res = self
            .client
            .get("https://mempool-testnet.fractalbitcoin.io/api/fees/recommended")
            .send()
            .await?;

        res.json().await.context("解析推荐费用失败")
    }

    /// 获取 BRC20 代币的状态信息
    ///
    /// # 返回值
    ///
    /// 返回一个包含 BRC20 代币详细信息的 `ApiResponse<ResponseData>` 结构体
    pub async fn get_brc20_status(&self) -> Result<ApiResponse<ResponseData>> {
        let params = QueryParams {
            start: 0,
            limit: 20,
            sort: "minted".to_string(),
            complete: 999,
            tick_filter: 24,
        };

        let res = self
            .get(&format!("{BASE_URL}/v1/indexer/brc20/status"))?
            .query(&params)
            .send()
            .await
            .context("发送请求失败")?;

        res.json().await.context("解析 JSON 失败")
    }

    /// 获取特定 BRC20 代币的详细信息
    ///
    /// # 参数
    ///
    /// * `ticker` - 代币的 ticker 符号
    ///
    /// # 返回值
    ///
    /// 返回一个包含指定代币详细信息的 `ApiResponse<TickerInfo>` 结构体
    pub async fn get_brc20_ticker_info(&self, ticker: &str) -> Result<ApiResponse<TickerInfo>> {
        let url = format!("{}/v1/indexer/brc20/{}/info", BASE_URL, ticker);

        let res = self.get(&url)?.send().await.context("发送请求失败")?;

        res.json().await.context("解析 JSON 失败")
    }

    /// 创建 BRC20 代币的铸造订单
    ///
    /// # 参数
    ///
    /// * `request` - 包含创建订单所需信息的 `CreateOrderRequest` 结构体
    ///
    /// # 返回值
    ///
    /// 返回一个包含创建订单响应信息的 `CreateOrderResponse` 结构体
    pub async fn create_brc20_mint_order(
        &self,
        request: &CreateOrderRequest,
    ) -> Result<CreateOrderResponse> {
        let res = self
            .post(&format!("{BASE_URL}/v2/inscribe/order/create/brc20-mint"))?
            .json(request)
            .send()
            .await
            .context("发送创建订单请求失败")?;

        res.json().await.context("解析创建订单响应失败")
    }

    /// 支付订单
    ///
    /// # 参数
    ///
    /// * `order_id` - 订单 ID
    /// * `pay_address` - 支付地址
    ///
    /// # 返回值
    ///
    /// 返回一个包含支付响应信息的 `PayOrderData` 结构体
    pub async fn pay_order(
        &self,
        order_id: &str,
        pay_address: &str,
    ) -> Result<ApiResponse<PayOrderData>> {
        let url = format!("{BASE_URL}/v2/inscribe/order/create/brc20-transfer");
        let payload = json!({
            "order_id": order_id,
            "pay_address": pay_address,
        });

        let res = self
            .post(&url)?
            .json(&payload)
            .send()
            .await
            .context("发送支付请求失败")?;

        res.json().await.context("解析支付响应失败")
    }

    pub async fn get_utxo(&self, address: String) -> Result<Vec<UtxoData>> {
        let url = format!(
            "https://wallet-api-fractalbitcoin.unisat.space/v5/address/btc-utxo?address={address}"
        );

        let res = self.get(&url)?.send().await.context("发送请求失败")?;

        let response: ApiResponse<Vec<UtxoData>> = res.json().await.context("解析 JSON 失败")?;

        // -- 检查 data 的长度
        if response.data.is_empty() {
            // -- 如果没有 UTXO，返回相应消息
            return Err(anyhow::anyhow!("没有 UTXO"));
        }

        Ok(response.data) // -- 返回 data 字段
    }

    pub fn get_pub_key(&self) -> Result<PublicKey> {
        let secp = Secp256k1::new();
        let wif_private_key = env::var("WIF_PRIVATE_KEY")?;
        let sk = SecretKey::from_str(&wif_private_key).context("解析私钥失败")?;
        let key = PublicKey::from_secret_key(&secp, &sk);

        println!("公钥：{:#?}", key);

        Ok(key)
    }
}
