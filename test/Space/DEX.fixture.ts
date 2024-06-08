import { ethers } from "hardhat";
import { createInstances } from "../instance";
import type { EncryptedDEXPair, EncryptedERC20, EncryptedDEXFactory} from "../../types";
import { getSigners } from "../signers";

export async function deployFactory(): Promise<EncryptedDEXFactory> {
  const signers = await getSigners(ethers);

  const contractFactory = await ethers.getContractFactory("EncryptedDEXFactory");
  const contract = await contractFactory.connect(signers.alice).deploy();
  await contract.waitForDeployment();
  console.log("deployFactory -> " + await contract.getAddress());
  return contract;
}
export async function deployTokenA(): Promise<EncryptedERC20> {
  const signers = await getSigners(ethers);

  const contractFactory = await ethers.getContractFactory("EncryptedERC20");
  const contract = await contractFactory.connect(signers.alice).deploy("tokenA", "tokenA");
  await contract.waitForDeployment();
  console.log("deployTokenA -> " + await contract.getAddress());
  return contract;
}
export async function deployTokenB(): Promise<EncryptedERC20> {
  const signers = await getSigners(ethers);

  const contractFactory = await ethers.getContractFactory("EncryptedERC20");
  const contract = await contractFactory.connect(signers.alice).deploy("tokenB", "tokenB");
  await contract.waitForDeployment();
  console.log("deployTokeB -> " + await contract.getAddress());
  return contract;
}