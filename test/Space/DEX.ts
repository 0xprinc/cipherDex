import { expect } from "chai";
import { ethers } from "hardhat";

import { createInstances } from "../instance";
import { getSigners } from "../signers";
import { createTransaction } from "../utils";
import { deployFactory, deployTokenA, deployTokenB, getPrivateBalanceERC20 } from "./DEX.fixture";
// import { InitializeCalldataStruct, StrategyStruct } from "../../types";
import { assert } from "console";
import fhevmjs, { FhevmInstance } from "fhevmjs";

import { AbiCoder } from "ethers";
import { sign } from "crypto";

// Remove the duplicate import statement for 'ethers'

describe("DEX", function () {
  before(async function () {
    this.signers = await getSigners(ethers);
  });

  it("initialize space", async function () {

    console.log("\n 1) Deploying contracts... \n")
    const signers = await getSigners(ethers);

    let token0 = await deployTokenA();
    let token0Address = await token0.getaddress();
    let token1 = await deployTokenB();
    let token1Address = await token1.getaddress();

    let fhevmInstance0 = await createInstances(token0Address, ethers, this.signers);
    let fhevmInstance1 = await createInstances(token1Address, ethers, this.signers);


    const fhevmtoken0 = fhevmInstance0.alice.getPublicKey(token0Address) || {
      signature: "",
      publicKey: "",
    };

    const fhevmtoken1 = fhevmInstance1.alice.getPublicKey(token1Address) || {
      signature: "",
      publicKey: "",
    };

    BigInt(token0Address) > BigInt(token1Address) ? ([token0, token1] = [token1, token0]) : null; // sort tokens according to addresses
    token0Address = await token0.getaddress();
    token1Address = await token1.getaddress();

    try {
      const txn0 = await token0.mint(2000);
      console.log("Transaction hash:", txn0.hash);
      await txn0.wait(1);
      console.log("Transaction successful!");
    } catch (error) {
      console.error("Transaction failed:", error);
    }

    try {
      const txn1 = await token1.mint(2000);
      console.log("Transaction hash:", txn1.hash);
      await txn1.wait(1);
      console.log("Transaction successful!");
    } catch (error) {
      console.error("Transaction failed:", error);
    }

    console.log("alice balance int- " + await token0.getbal(signers.alice.address));
    console.log("bob balance int- " + await token0.getbal(signers.bob.address));

    console.log("token1 owner balance -> " +  fhevmInstance1.alice.decrypt(token1Address, await token1.balanceOf(signers.alice.address ,fhevmtoken1.publicKey, fhevmtoken1.signature)));





    try {
      const txn2 = await token0.bytestransfer(signers.bob.address, fhevmInstance0.alice.encrypt32(100));
      console.log("Transaction hash:", txn2.hash);
      await txn2.wait(1);
      console.log("Transaction successful!");
    } catch (error) {
      console.error("Transaction failed:", error);
    }

    console.log("alice balance int- " + await token0.getbal(signers.alice.address));
    console.log("bob balance int- " + await token0.getbal(signers.bob.address));

    console.log("alice balance - " +  fhevmInstance0.alice.decrypt(token0Address, await token0.balanceOf(signers.alice.address ,fhevmtoken0.publicKey, fhevmtoken0.signature)));
    console.log("bob balance - " +  fhevmInstance0.alice.decrypt(token0Address, await token0.balanceOf(signers.bob.address ,fhevmtoken0.publicKey, fhevmtoken0.signature)));

    // try {
    //   const txn3 = await token0.bytestransfer(signers.carol.address, fhevmInstance0.alice.encrypt32(200));
    //   console.log("Transaction hash:", txn3.hash);
    //   await txn3.wait(1);
    //   console.log("Transaction successful!");
    // } catch (error) {
    //   console.error("Transaction failed:", error);
    // }

    // try {
    //   const txn4 = await token1.bytestransfer(signers.bob.address, fhevmInstance1.alice.encrypt32(200));
    //   console.log("Transaction hash:", txn4.hash);
    //   await txn4.wait(1);
    //   console.log("Transaction successful!");
    // } catch (error) {
    //   console.error("Transaction failed:", error);
    // }

    // try {
    //   const txn4 = await token1.bytestransfer(signers.carol.address, fhevmInstance1.alice.encrypt32(400));
    //   console.log("Transaction hash:", txn4.hash);
    //   await txn4.wait(1);
    //   console.log("Transaction successful!");
    // } catch (error) {
    //   console.error("Transaction failed:", error);
    // }

    // console.log("initial balance of market makers (Bob and Carol)");
    // console.log("alice token0 bal - " + fhevmInstance0.alice.decrypt(token0Address, await token0.balanceOf(signers.alice.address ,fhevmtoken0.publicKey, fhevmtoken0.signature)));
    // console.log("Bob token0 bal - " + fhevmInstance0.alice.decrypt(token0Address, await token0.balanceOf(signers.bob.address ,fhevmtoken0.publicKey, fhevmtoken0.signature)));
    // console.log("Bob token1 bal - " + fhevmInstance1.alice.decrypt(token1Address, await token1.balanceOf(signers.bob.address ,fhevmtoken1.publicKey, fhevmtoken1.signature)));
    // console.log("Carol token0 bal - " + fhevmInstance0.alice.decrypt(token0Address, await token0.balanceOf(signers.carol.address ,fhevmtoken0.publicKey, fhevmtoken0.signature)));
    // console.log("Carol token1 bal - " + fhevmInstance1.alice.decrypt(token1Address, await token1.balanceOf(signers.carol.address ,fhevmtoken1.publicKey, fhevmtoken1.signature)));

  });

});

























































// {{
//   console.log("\n\ 2) Initializing Space contract \n");
  
//   let data0 : StrategyStruct = {
//     addr: addressValidationStrategy,
//     params: "0x"
//   }

//   let data1 : StrategyStruct = {
//     addr: addressVotingStrategy,
//     params: "0x"
//   }


//   let data : InitializeCalldataStruct = {
//     owner: addressSigner, // Example address
//     votingDelay: 0,
//     minVotingDuration: 0,
//     maxVotingDuration: 1000,
//     proposalValidationStrategy: data0,
//     proposalValidationStrategyMetadataURI: "proposalValidationStrategyMetadataURI",
//     daoURI: "SOC Test DAO",
//     metadataURI: "SOC Test Space",
//     votingStrategies: [data1],
//     votingStrategyMetadataURIs: ["votingStrategyMetadataURIs"],
//     authenticators: [addressAuthenticator]
//   };
//   // console.log("owner before initialize: " + await contractSpace.owner());
//   try {
//     const txn = await contractSpace.initialize(data);
//     console.log("Transaction hash:", txn.hash);
  
//     // Wait for 1 confirmation (adjust confirmations as needed)
//     await txn.wait(1);
//     console.log("Transaction successful!");
//   } catch (error) {
//     console.error("Transaction failed:", error);
//     // Handle the error appropriately (e.g., retry, notify user)
//   }
//   // console.log("alice address -> " + addressSigner);
//   // console.log("owner after initialize: " + await contractSpace.owner());
//   // assert(addressSigner == contractSpace.owner());

// }

// {
//   console.log("\n 3) Making a proposal \n");

//   let data2propose =
//     [
//       addressSigner,
//       "",
//       [
//         addressExecutionStrategy, "0x"
//       ],
//       "0x",
//     ];
  
//   // console.log(AbiCoder.defaultAbiCoder().encode(["address", "string", "tuple(address, bytes)", "bytes"], data2propose));

//   // console.log("old proposal -> " + await contractSpace.proposals(1));
//   try {
//     const txn = await contractAuthenticator.authenticate(addressSpace, '0xaad83f3b', AbiCoder.defaultAbiCoder().encode(["address", "string", "tuple(address, bytes)", "bytes"], data2propose));
//     console.log("Transaction hash:", txn.hash);

//     // Wait for 1 confirmation (adjust confirmations as needed)
//     await txn.wait(1);
//     console.log("proposal successful!");
//   } catch (error) {
//     console.error("Transaction failed:", error);
//     // Handle the error appropriately (e.g., retry, notify user)
//   }
  
//   // console.log("new proposal -> " + await contractSpace.proposals(1));

// }

// {
//   console.log("\n\ 4) Voting \n");

//   let data2voteAbstain = [
//     addressSigner,
//     1,
//     fhevmInstance.alice.encrypt8(2),
//     [[0,"0x"]],
//     ""
//   ];
//   let data2voteFor1 = [
//     await this.signers.bob.getAddress(),
//     1,
//     fhevmInstance.alice.encrypt8(1),
//     [[0,"0x"]],
//     ""
//   ];
//   let data2voteFor2 = [
//     await this.signers.dave.getAddress(),
//     1,
//     fhevmInstance.alice.encrypt8(1),
//     [[0,"0x"]],
//     ""
//   ];
//   let data2voteAgainst = [
//     await this.signers.carol.getAddress(),
//     1,
//     fhevmInstance.alice.encrypt8(0),
//     [[0,"0x"]],
//     ""
//   ];

//   try {
//     const txn = await contractAuthenticator.authenticate(addressSpace, '0x954ee6da', AbiCoder.defaultAbiCoder().encode(["address", "uint256", "bytes", "tuple(uint8, bytes)[]", "string"], data2voteAgainst));
//     console.log("Transaction hash:", txn.hash);

//     // Wait for 1 confirmation (adjust confirmations as needed)
//     await txn.wait(1);
//     console.log("Against vote successful!");
//   } catch (error) {
//     console.error("Transaction failed:", error);
//     // Handle the error appropriately (e.g., retry, notify user)
//   }
//   try {
//     const txn = await contractAuthenticator.authenticate(addressSpace, '0x954ee6da', AbiCoder.defaultAbiCoder().encode(["address", "uint256", "bytes", "tuple(uint8, bytes)[]", "string"], data2voteFor1));
//     console.log("Transaction hash:", txn.hash);

//     // Wait for 1 confirmation (adjust confirmations as needed)
//     await txn.wait(1);
//     console.log("For vote successful!");
//   } catch (error) {
//     console.error("Transaction failed:", error);
//     // Handle the error appropriately (e.g., retry, notify user)
//   }
//   try {
//     const txn = await contractAuthenticator.authenticate(addressSpace, '0x954ee6da', AbiCoder.defaultAbiCoder().encode(["address", "uint256", "bytes", "tuple(uint8, bytes)[]", "string"], data2voteFor2));
//     console.log("Transaction hash:", txn.hash);

//     // Wait for 1 confirmation (adjust confirmations as needed)
//     await txn.wait(1);
//     console.log("For vote successful!");
//   } catch (error) {
//     console.error("Transaction failed:", error);
//     // Handle the error appropriately (e.g., retry, notify user)
//   }
//   try {
//     const txn = await contractAuthenticator.authenticate(addressSpace, '0x954ee6da', AbiCoder.defaultAbiCoder().encode(["address", "uint256", "bytes", "tuple(uint8, bytes)[]", "string"], data2voteAbstain));
//     console.log("Transaction hash:", txn.hash);

//     // Wait for 1 confirmation (adjust confirmations as needed)
//     await txn.wait(1);
//     console.log("Abstain vote successful!");
//   } catch (error) {
//     console.error("Transaction failed:", error);
//     // Handle the error appropriately (e.g., retry, notify user)
//   }
//   // console.log("current block number -> " + await ethers.provider.getBlockNumber());


//   const token = fhevmInstance.alice.getPublicKey(addressSpace) || {
//     signature: "",
//     publicKey: "",
//   };

//   console.log("\n\ 5) Checking votes \n");
//   let For_votes = (await contractSpace.getVotePower(1, 1, token.publicKey)).toString();
//   let Abstain_votes = (await contractSpace.getVotePower(1, 2, token.publicKey)).toString();
//   let Against_votes = (await contractSpace.getVotePower(1, 0, token.publicKey)).toString();
//   // console.log(For_votes);
//   // console.log(Abstain_votes);
//   // console.log(Against_votes);
  
//   console.log("For votes -> " +     fhevmInstance.alice.decrypt(addressSpace, For_votes));
//   console.log("Abstain votes -> " + fhevmInstance.alice.decrypt(addressSpace, Abstain_votes));
//   console.log("Against votes -> " + fhevmInstance.alice.decrypt(addressSpace, Against_votes));
// }

//   console.log("\n 6) Execution \n");
//   let executionPayload = "0x";
//   try {
//     const txn = await contractSpace.execute(1, executionPayload);
//     console.log("Transaction hash:", txn.hash);

//     // Wait for 1 confirmation (adjust confirmations as needed)
//     await txn.wait(1);
//     console.log("execution successful!");
//   } catch (error) {
//     console.error("Transaction failed:", error);
//     // Handle the error appropriately (e.g., retry, notify user)
//   }
// }