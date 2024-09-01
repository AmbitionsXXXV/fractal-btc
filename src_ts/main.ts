import dotenv from "dotenv"
import { ApiClient } from "./api"
import { ADDRESS } from "./constants"
// import { TickerInfo } from './types';

dotenv.config()

// -- 计算 mint 进度的函数
// function calculateMintProgress(tickerInfo: TickerInfo): number {
//     const totalMinted = parseFloat(tickerInfo.total_minted) || 0;
//     const max = parseFloat(tickerInfo.max) || 1; // -- 避免除以零
//     return Math.min((totalMinted / max) * 100, 100); // -- 确保进度不超过 100%
// }

async function main() {
	const client = new ApiClient()

	// -- 获取推荐费用
	const recommendedFees = await client.getRecommendedFees()
	console.log("推荐费用：")
	console.log(`  经济费用：${recommendedFees.economyFee}`)
	console.log(`  最快费用：${recommendedFees.fastestFee}`)
	console.log(`  半小时费用：${recommendedFees.halfHourFee}`)
	console.log(`  一小时费用：${recommendedFees.hourFee}`)
	console.log(`  最低费用：${recommendedFees.minimumFee}`)

	// -- 获取 BRC20 铭文状态
	// const brc20Status = await client.getBrc20Status();
	// console.log('BRC20 状态：');
	// for (const token of brc20Status.data.detail) {
	//     // -- 过滤掉 self_mint 为 true 的 ticker
	//     if (!token.self_mint && token.holders_count > 2) {
	//         console.log(`铭文：${token.ticker}`);
	//         console.log(`  铭文 ID：${JSON.stringify(token)}`);
	//         const tickerInfo = await client.getBrc20TickerInfo(token.ticker);
	//         const mintProgress = calculateMintProgress(tickerInfo.data);
	//         console.log('铭文详情：');
	//         console.log(`  总铸造量：${tickerInfo.data.total_minted}`);
	//         console.log(`  最大供应量：${tickerInfo.data.max}`);
	//         console.log(`  铸造进度：${mintProgress.toFixed(2)}%`);
	//         console.log('---');
	//     }
	// }

	// -- 创建 BRC20 铸造订单（注释掉的部分）
	// const createOrderRequest: CreateOrderRequest = {
	//     receive_address: process.env.ADDRESS,
	//     fee_rate: recommendedFees.fastest_fee,
	//     output_value: 546,
	//     dev_address: process.env.ADDRESS,
	//     dev_fee: 0, // 根据 gasPrice 计算
	//     brc20_ticker: 'cndoge', // -- 选择一个 BRC20 代币
	//     brc20_amount: '1000',
	//     count: 100, // 1~100
	// };
	// const orderResponse = await client.createBrc20MintOrder(createOrderRequest);
	// console.log(`订单创建成功：${JSON.stringify(orderResponse)}`);

	const utxo = await client.getUTXO(ADDRESS)

	console.log(utxo)
}

main().catch(console.error)
