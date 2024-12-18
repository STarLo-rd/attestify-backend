import * as bip39 from "bip39";
import * as ecc from "tiny-secp256k1";
import { BIP32Factory } from "bip32";
const bip32 = BIP32Factory(ecc);
import * as crypto from 'crypto';


export function deriveXpubKey(mnemonic: string): string {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const node = bip32.fromSeed(seed);
  return node.neutered().toBase58();
}

export function deriveCommitmentXpubKey(
  creatorXpubkey: string,
  commitmentId: number
): string {
  const seed = bip39.mnemonicToSeedSync(creatorXpubkey);
  const node = bip32.fromSeed(seed);

  const commitmentPath = `m/44'/60'/0'/0/${commitmentId}`;
  const commitmentNode = node.derivePath(commitmentPath);
  return commitmentNode.neutered().toBase58();
}

export function createCommitmentSignature(
  payload: any,
  mnemonic: string
): string {
  const seed = bip39.mnemonicToSeedSync(mnemonic);
  const node = bip32.fromSeed(seed);

  const privateKeyNode = node.derive(0).derive(0);
  const privateKey = privateKeyNode.privateKey;
  if (!privateKey) throw new Error("Failed to derive private key");

  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest();

  const signature = ecc.sign(hash, privateKey);
  return signature.toString("hex");
}

export function verifyCommitmentSignature(
  payload: any,
  publicKey: Buffer,
  signature: string
): boolean {
  const hash = crypto
    .createHash("sha256")
    .update(JSON.stringify(payload))
    .digest();

  return ecc.verify(hash, publicKey, Buffer.from(signature, "hex"));
}
