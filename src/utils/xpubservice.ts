import * as ecc from "tiny-secp256k1";
import { BIP32Factory } from "bip32";
const bip32 = BIP32Factory(ecc);
import * as bip39 from "bip39";



export const deriveCommitmentXpubKey = (
  parentXpub: string,
  commitmentId: number
): string => {
  const parentNode = bip32.fromBase58(parentXpub);
  const childNode = parentNode.derive(commitmentId);
  return childNode.neutered().toBase58();
};


export const deriveXpubKey = (mnemonic:string):string => {
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed);
    const path = "m/44'/0'/0'";
    const account = root.derivePath(path);
    return account.neutered().toBase58();
}