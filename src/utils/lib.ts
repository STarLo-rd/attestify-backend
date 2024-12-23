import * as bip39 from "bip39";
import * as ecc from "tiny-secp256k1";
import { BIP32Factory } from "bip32";
import * as crypto from "crypto";

const bip32 = BIP32Factory(ecc);

export enum CommitmentStatus {
  CREATED = "CREATED",
  ACCEPTED = "ACCEPTED",
  ACKNOWLEDGED = "ACKNOWLEDGED",
  DISCHARGED = "DISCHARGED",
}

export interface CommitmentPayload {
  _id?: string;
  commitmentId: Number;
  committee: string;
  committer: string;
  assetPayload: any;
  status: CommitmentStatus;
  committerSignature?: string;
  committeeSignature?: string;
  dischargeSignature?: string;
  committeeXpubKey?: string;
  committerXpubKey?: string;
  createdAt: Date;
  updatedAt: Date;
}

export class Attestify {
  private payload: CommitmentPayload;

  constructor(userPayload?: Partial<CommitmentPayload>) {
    this.validateInitialPayload(userPayload);
    this.payload = {
      ...userPayload,
      status: userPayload?.status || CommitmentStatus.CREATED,
      createdAt: new Date(),
      updatedAt: new Date(),
      id: userPayload?._id,
    } as CommitmentPayload;
  }

  private validateInitialPayload(payload?: Partial<CommitmentPayload>) {
    if (!payload) throw new Error("Payload is required");
    if (!payload.committee) throw new Error("Committee is required");
    if (!payload.committer) throw new Error("Committer is required");
    if (!payload.assetPayload) throw new Error("Asset payload is required");
  }

  public sign(mnemonic: string): any {
    console.log("assetPayload", this.payload);
    console.log("mnemonic", mnemonic);
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed);
    const node = root.derivePath(`m/44'/0'/0'/${1}`);

    if (!node.privateKey) {
      throw new Error("Private key not available");
    }
    const hash = crypto
      .createHash("sha256")
      .update(JSON.stringify(this.payload.assetPayload))
      .digest();

    console.log("hash", hash);

    const signature = ecc.sign(hash, node.privateKey);
    console.log("signature", signature);
    return signature;
  }

  private generateRandomNumber = (): number => {
    return Math.floor(1000000000 + Math.random() * 3294967295); // 10-digit number
    //ValiError: Invalid value: Expected <=4294967295 but received 5828659216
  };
  public createCommitment(): CommitmentPayload {
    if (this.payload.status !== CommitmentStatus.CREATED) {
      throw new Error("Invalid commitment status for creation");
    }
    return { ...this.payload, commitmentId: this.generateRandomNumber() };
  }

  private deriveCommitmentXpubKey(
    parentXpub: string,
    commitmentId: Number
  ): string {
    console.log("commitmentId", commitmentId)
    console.log("commitmentId", this.payload.commitmentId)

    const parentNode = bip32.fromBase58(parentXpub);
    const childNode = parentNode.derive(commitmentId);
    return childNode.neutered().toBase58();
  }

  public accept(mnemonic: string, xpubkey: string): CommitmentPayload {
    if (this.payload.status !== CommitmentStatus.CREATED) {
      throw new Error("Commitment must be in CREATED status to accept");
    }

    const derivedCommitterXpubkey = this.deriveCommitmentXpubKey(xpubkey, this.payload.commitmentId)

    const signature = this.sign(mnemonic);

    // If signature is valid, update the payload
    this.payload = {
      ...this.payload,
      committerSignature: signature,
      status: CommitmentStatus.ACCEPTED,
      committerXpubKey: derivedCommitterXpubkey,
      updatedAt: new Date(),
    };

    return { ...this.payload };
  }

  public acknowledge(mnemonic: string): CommitmentPayload {
    if (this.payload.status !== CommitmentStatus.ACCEPTED) {
      throw new Error("Commitment must be in ACCEPTED status to acknowledge");
    }

    const signature = this.sign(mnemonic);

    this.payload = {
      ...this.payload,
      committeeSignature: signature,
      status: CommitmentStatus.ACKNOWLEDGED,
      updatedAt: new Date(),
    };

    return { ...this.payload };
  }

  public discharge(mnemonic: string, committeeId: string): CommitmentPayload {
    if (this.payload.status !== CommitmentStatus.ACKNOWLEDGED) {
      throw new Error("Commitment must be in ACKNOWLEDGED status to discharge");
    }

    if (this.payload.committee !== committeeId) {
      throw new Error("Only the committee can discharge the commitment");
    }

    const dischargeMessage = {
      commitmentId: this.payload._id,
      message: "discharge commitment",
    };

    const signature = this.sign(dischargeMessage, mnemonic);

    this.payload = {
      ...this.payload,
      dischargeSignature: signature,
      status: CommitmentStatus.DISCHARGED,
      updatedAt: new Date(),
    };

    return { ...this.payload };
  }

  public getPayload(): CommitmentPayload {
    return { ...this.payload };
  }
}
