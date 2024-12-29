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
