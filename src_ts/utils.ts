import type { Network } from "bitcoinjs-lib"
import ECPairFactory, { type ECPairInterface } from "ecpair"
import * as ecc from "tiny-secp256k1"

export function getKeyPairByPrivateKey(privateKey: string, network: Network) {
	return ECPairFactory(ecc).fromWIF(privateKey, network)
}

export const toXOnly = (pubKey: ECPairInterface["publicKey"]) =>
	pubKey.length === 32 ? pubKey : pubKey.slice(1, 33)

export const ECPair = ECPairFactory(ecc)
