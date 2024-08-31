import axios, { type AxiosInstance } from "axios"
import {
	Psbt,
	crypto,
	initEccLib,
	networks,
	payments,
	type Network,
} from "bitcoinjs-lib"
import readline from "node:readline/promises"
import * as ecc from "tiny-secp256k1"
import { BASE_URL } from "./constants"
import type {
	ApiResponse,
	CreateOrderRequest,
	CreateOrderResponse,
	RecommendedFees,
	ResponseData,
	TickerInfo,
	UtxoData,
} from "./types"

// -- API 客户端，用于与 BRC20 相关的 API 进行交互
export class ApiClient {
	private client: AxiosInstance
	private network: Network
	// private config: ConfigClass // -- 添加配置实例

	constructor() {
		initEccLib(ecc)
		this.network = networks.bitcoin
		this.client = axios.create({
			headers: {
				"Content-Type": "application/json",
				Authorization: `Bearer ${process.env.API_KEY}`, // -- 添加 Bearer Token
			},
		})
		// this.config = new ConfigClass("./config.yaml") // -- 初始化配置
	}

	// -- 获取推荐的交易费用
	async getRecommendedFees(): Promise<RecommendedFees> {
		const response = await this.client.get(
			"https://mempool-testnet.fractalbitcoin.io/api/fees/recommended",
		)
		return response.data
	}

	// -- 获取 BRC20 代币的状态信息
	async getBrc20Status(): Promise<ApiResponse<ResponseData>> {
		const params = {
			start: 0,
			limit: 20,
			sort: "minted",
			complete: 999,
			tick_filter: 24,
		}
		const response = await this.client.get(
			`${BASE_URL}/v1/indexer/brc20/status`,
			{
				params,
			},
		)
		return response.data
	}

	// -- 获取特定 BRC20 代币的详细信息
	async getBrc20TickerInfo(ticker: string): Promise<ApiResponse<TickerInfo>> {
		const response = await this.client.get(
			`${BASE_URL}/v1/indexer/brc20/${ticker}/info`,
		)
		return response.data
	}

	// -- 创建 BRC20 代币的铸造订单
	async createBrc20MintOrder(
		request: CreateOrderRequest,
	): Promise<CreateOrderResponse> {
		const response = await this.client.post(
			`${BASE_URL}/v2/inscribe/order/create/brc20-mint`,
			request,
		)
		return response.data
	}

	async getUTXO(address: string): Promise<ApiResponse<Array<UtxoData>>> {
		const response = await this.client.get(
			"https://wallet-api-fractalbitcoin.unisat.space/v5/address/btc-utxo/",
			// `https://fractalbitcoin-mempool.unisat.io/api/address/${address}/utxo`,
			{ params: { address } },
		)
		return response.data
	}

	// -- 转账
	async transfer(
		keyPair,
		toAddresses: Array<{ Address: string; Amount: number }>,
		toAmountSATSAll,
	): Promise<string | boolean> {
		const xOnlyPubkey =
			keyPair.publicKey.length === 32
				? keyPair.publicKey
				: keyPair.publicKey.slice(1, 33)
		const { address: fromAddress, output } = payments.p2tr({
			internalPubkey: xOnlyPubkey,
			network: this.network,
		})

		const utxoAll = (await this.getUTXO(fromAddress)).data
		if (utxoAll.length === 0) {
			return "No UTXO"
		}

		const availableUTXO = []
		for (const utxo of utxoAll) {
			if (utxo.satoshis > 546) {
				availableUTXO.push({
					txid: utxo.txid,
					vout: utxo.vout,
					value: utxo.satoshis,
				})
			}
		}
		if (availableUTXO.length === 0) {
			return "No UTXO"
		}

		const estimateSATS =
			10 + (toAddresses.length + 1) * 43 + availableUTXO.length * 148
		const psbt = new Psbt({ network: this.network })
		let inputValue = 0

		for (const utxo of availableUTXO) {
			if (inputValue < toAmountSATSAll + estimateSATS) {
				const input = {
					index: utxo.vout,
					hash: utxo.txid,
					witnessUtxo: {
						script: output,
						value: utxo.value,
					},
					tapInternalKey: xOnlyPubkey,
				}
				psbt.addInput(input)
				inputValue += utxo.value
			}
		}

		let outputValue = 0
		for (const toAddress of toAddresses) {
			psbt.addOutput({
				address: toAddress.Address,
				value: toAddress.Amount * 1e8,
			})
			outputValue += toAddress.Amount * 1e8
		}

		const gas = (await this.getRecommendedFees()).fastestFee
		const fee =
			gas * (10 + (toAddresses.length + 1) * 43 + psbt.data.inputs.length * 148)
		const changeValue = inputValue - outputValue - fee

		if (changeValue < 0) {
			console.log("可用 UTXO 不足")
			return
		}
		if (changeValue > 0) {
			psbt.addOutput({
				address: fromAddress,
				value: changeValue,
			})
		}

		const tweakedChildNode = keyPair.tweak(
			crypto.taggedHash("TapTweak", xOnlyPubkey),
		)

		psbt.data.inputs.forEach((_input, index) => {
			psbt.signInput(index, tweakedChildNode)
		})
		psbt.finalizeAllInputs()
		const psbtHex = psbt.extractTransaction().toHex()

		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
		})

		const question =
			"是否确认将该交易进行广播，广播后将无法反悔交易；输入 'y'或'Y' 并回车确认，其他字符取消广播: "
		const answer = await rl.question(`\x1b[33m${question}\x1b[39m`)
		rl.close()

		if (answer === "Y" || answer === "y") {
			const res = await this.broadcastTx(psbtHex)
			console.log(`Transaction: ${res}`)
			return true
		}
		console.log("取消广播交易")
		return false
	}

	// 广播交易
	async broadcastTx(psbtHex: string) {
		const url = "https://mempool.fractalbitcoin.io/api/tx"
		const res = await this.client.post(url, psbtHex, {
			headers: {
				"Content-Type": "text/plain",
			},
		})
		return res.data
	}
}
