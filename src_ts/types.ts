export interface QueryParams {
	start: number
	limit: number
	sort: string
	complete: number
	tick_filter: number
}

export interface ApiResponse<T> {
	code: number
	msg: string
	data: T
}

export interface UtxoData {
	txid: string
	vout: number
	satoshis: number
	scriptPk: string
	addressType: number
	inscriptions: string[]
	atomicals: string[]
	runes: string[]
	pubkey: string
	height: number
}

export interface ResponseData {
	detail: TokenDetail[]
}

export interface TokenDetail {
	ticker: string
	creator: string
	decimal: number
	total_minted: string // -- 使用 total_minted 代替 totalMinted
	confirmed_minted: string // -- 使用 confirmed_minted 代替 confirmedMinted
	confirmed_minted_1h: string // -- 使用 confirmed_minted_1h 代替 confirmedMinted1h
	confirmed_minted_24h: string // -- 使用 confirmed_minted_24h 代替 confirmedMinted24h
	minted: string
	txid: string
	inscription_id: string // -- 使用 inscription_id 代替 inscriptionId
	holders_count: number // -- 使用 holders_count 代替 holdersCount
	max: string
	limit: string
	self_mint: boolean // -- 使用 self_mint 代替 selfMint
}

export interface CreateOrderRequest {
	receive_address: string // -- 使用 receive_address 代替 receiveAddress
	fee_rate: number // -- 使用 fee_rate 代替 feeRate
	output_value: number // -- 使用 output_value 代替 outputValue
	dev_address: string // -- 使用 dev_address 代替 devAddress
	dev_fee: number // -- 使用 dev_fee 代替 devFee
	brc20_ticker: string // -- 使用 brc20_ticker 代替 brc20Ticker
	brc20_amount: string // -- 使用 brc20_amount 代替 brc20Amount
	count: number
}

export interface CreateOrderResponse {
	msg: string
	data: OrderData
}

export interface OrderData {
	order_id: string // -- 使用 order_id 代替 orderId
	status: string
	pay_address: string // -- 使用 pay_address 代替 payAddress
	receive_address: string // -- 使用 receive_address 代替 receiveAddress
	amount: number
	fee_rate: number // -- 使用 fee_rate 代替 feeRate
	miner_fee: number // -- 使用 miner_fee 代替 minerFee
	service_fee: number // -- 使用 service_fee 代替 serviceFee
	dev_fee: number // -- 使用 dev_fee 代替 devFee
}

export interface TickerInfo {
	ticker: string
	creator: string
	total_minted: string // -- 使用 total_minted 代替 totalMinted
	confirmed_minted: string // -- 使用 confirmed_minted 代替 confirmedMinted
	confirmed_minted_1h: string // -- 使用 confirmed_minted_1h 代替 confirmedMinted1h
	confirmed_minted_24h: string // -- 使用 confirmed_minted_24h 代替 confirmedMinted24h
	minted: string
	txid: string
	inscription_id: string // -- 使用 inscription_id 代替 inscriptionId
	max: string
	limit: string
}

export interface RecommendedFees {
	economyFee: number
	fastestFee: number
	halfHourFee: number
	hourFee: number
	minimumFee: number
}

export interface PayOrderData {
	orderId: string
	status: string
	transactionId: string // -- 假设支付成功后会返回交易 ID
}
