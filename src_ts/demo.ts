const res = await fetch(
	"https://wallet-api-fractalbitcoin.unisat.space/v5/address/btc-utxo?address=bc1plzhdxhndrmckflv7ygqc0fntk8fccp5yudpcfyduk8nc742928rs23xe59",
)

const r = await res.json()

console.log(r)

export type {}
