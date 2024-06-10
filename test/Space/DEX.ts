import { expect } from "chai";
import { assert } from "console";
import { sign } from "crypto";
import { AbiCoder } from "ethers";
import fhevmjs, { FhevmInstance } from "fhevmjs";
import { ethers } from "hardhat";

import type { EncryptedDEXPair } from "../../types";
import { createInstances } from "../instance";
import { getSigners } from "../signers";
import { createTransaction } from "../utils";
import { deployFactory, deployTokenA, deployTokenB } from "./DEX.fixture";

// Remove the duplicate import statement for 'ethers'

describe("DEX", function () {
  before(async function () {
    this.signers = await getSigners(ethers);
  });

  it("Encrypted DEX Pool - multiple epochs", async function () {
    console.log("\n 1) Deploying contracts... \n");
    const signers = await getSigners(ethers);

    let token0 = await deployTokenA();
    let token0Address = await token0.getaddress();
    let token1 = await deployTokenB();
    let token1Address = await token1.getaddress();

    let fhevmInstance0 = await createInstances(token0Address, ethers, signers);
    let fhevmInstance1 = await createInstances(token1Address, ethers, signers);

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

    console.log("address - " + signers.bob.address);
    console.log("address - " + signers.alice.address);
    console.log("address - " + signers.carol.address);
    console.log("address - " + signers.dave.address);
    console.log("address - " + signers.eve.address);

    try {
      const txn0 = await token0.mint(2000000000);
      console.log("txn0 hash:", txn0.hash);
      await txn0.wait(1);
      console.log("txn0 successful!");
    } catch (error) {
      console.error("txn0 failed:", error);
    }

    try {
      const txn1 = await token1.mint(2000000000);
      console.log("txn1 hash:", txn1.hash);
      await txn1.wait(1);
      console.log("txn1 successful!");
    } catch (error) {
      console.error("txn1 failed:", error);
    }

    console.log("alice balance int- " + (await token0.getbal(signers.alice.address)));
    console.log("bob balance int- " + (await token0.getbal(signers.bob.address)));

    // console.log("decrypted owner balance - " +  fhevmInstance1.alice.decrypt(token1Address, await token1.ebalanceOf(signers.alice.address ,fhevmtoken1.publicKey)));

    try {
      const txn2 = await token0.bytestransfer(signers.bob.address, fhevmInstance0.alice.encrypt32(100000000));
      console.log("txn2 hash:", txn2.hash);
      await txn2.wait(1);
      console.log("txn2 successful!");
    } catch (error) {
      console.error("txn2 failed:", error);
    }

    console.log("alice balance int- " + (await token0.getbal(signers.alice.address)));
    console.log("bob balance int- " + (await token0.getbal(signers.bob.address)));

    console.log(
      "bob balance - " +
        fhevmInstance0.alice.decrypt(
          token0Address,
          await token0.ebalanceOf(signers.bob.address, fhevmtoken0.publicKey),
        ),
    );
    console.log(
      "alice balance - " +
        fhevmInstance0.alice.decrypt(
          token0Address,
          await token0.ebalanceOf(signers.alice.address, fhevmtoken0.publicKey),
        ),
    );

    try {
      const txn3 = await token0.bytestransfer(signers.carol.address, fhevmInstance0.alice.encrypt32(200000000));
      console.log("txn3 hash:", txn3.hash);
      await txn3.wait(1);
      console.log("txn3 successful!");
    } catch (error) {
      console.error("txn3 failed:", error);
    }

    try {
      const txn4 = await token1.bytestransfer(signers.bob.address, fhevmInstance1.alice.encrypt32(200000000));
      console.log("txn4 hash:", txn4.hash);
      await txn4.wait(1);
      console.log("txn4 successful!");
    } catch (error) {
      console.error("txn4 failed:", error);
    }

    try {
      const txn5 = await token1.bytestransfer(signers.carol.address, fhevmInstance1.alice.encrypt32(400000000));
      console.log("txn5 hash:", txn5.hash);
      await txn5.wait(1);
      console.log("txn5 successful!");
    } catch (error) {
      console.error("txn5 failed:", error);
    }

    console.log("initial balance of market makers (Bob and Carol)");
    console.log(
      "Bob token0 bal - " +
        fhevmInstance0.alice.decrypt(
          token0Address,
          await token0.ebalanceOf(signers.bob.address, fhevmtoken0.publicKey),
        ),
    );
    console.log(
      "Bob token1 bal - " +
        fhevmInstance1.alice.decrypt(
          token1Address,
          await token1.ebalanceOf(signers.bob.address, fhevmtoken1.publicKey),
        ),
    );
    console.log(
      "Carol token0 bal - " +
        fhevmInstance0.alice.decrypt(
          token0Address,
          await token0.ebalanceOf(signers.carol.address, fhevmtoken0.publicKey),
        ),
    );
    console.log(
      "Carol token1 bal - " +
        fhevmInstance1.alice.decrypt(
          token1Address,
          await token1.ebalanceOf(signers.carol.address, fhevmtoken1.publicKey),
        ),
    );

    try {
      const txn6 = await token0.bytestransfer(signers.dave.address, fhevmInstance0.alice.encrypt32(1000000));
      console.log("txn6 hash:", txn6.hash);
      await txn6.wait(1);
      console.log("txn6 successful!");
    } catch (error) {
      console.error("txn6 failed:", error);
    }

    try {
      const txn6bis = await token1.bytestransfer(signers.dave.address, fhevmInstance1.alice.encrypt32(0));
      console.log("txn6bis hash:", txn6bis.hash);
      await txn6bis.wait(1);
      console.log("txn6bis successful!");
    } catch (error) {
      console.error("txn6bis failed:", error);
    }

    try {
      const txn7 = await token1.bytestransfer(signers.eve.address, fhevmInstance1.alice.encrypt32(1000000));
      console.log("txn7 hash:", txn7.hash);
      await txn7.wait(1);
      console.log("txn7 successful!");
    } catch (error) {
      console.error("txn7 failed:", error);
    }

    try {
      const txn7bis = await token0.bytestransfer(signers.eve.address, fhevmInstance0.alice.encrypt32(0));
      console.log("txn7bis hash:", txn7bis.hash);
      await txn7bis.wait(1);
      console.log("txn7bis successful!");
    } catch (error) {
      console.error("txn7bis failed:", error);
    }

    console.log("initial balance of market makers (Dave and Eve)");
    console.log(
      "Dave token0 bal - " +
        fhevmInstance0.alice.decrypt(
          token0Address,
          await token0.ebalanceOf(signers.dave.address, fhevmtoken0.publicKey),
        ),
    );
    console.log(
      "Dave token1 bal - " +
        fhevmInstance1.alice.decrypt(
          token1Address,
          await token1.ebalanceOf(signers.dave.address, fhevmtoken1.publicKey),
        ),
    );
    console.log(
      "Eve token0 bal - " +
        fhevmInstance0.alice.decrypt(
          token0Address,
          await token0.ebalanceOf(signers.eve.address, fhevmtoken0.publicKey),
        ),
    );
    console.log(
      "Eve token1 bal - " +
        fhevmInstance1.alice.decrypt(
          token1Address,
          await token1.ebalanceOf(signers.eve.address, fhevmtoken1.publicKey),
        ),
    );

    const dexFactory = await deployFactory();

    try {
      const txn8 = await dexFactory.createPair(token0Address, token1Address);
      console.log("txn8 hash:", txn8.hash);
      await txn8.wait(1);
      console.log("txn8 successful!");
    } catch (error) {
      console.error("txn8 failed:", error);
    }

    const pairAddress = await dexFactory.getPair(token0Address, token1Address);
    const pair = await ethers.getContractAt("EncryptedDEXPair", pairAddress);

    console.log("DEX contract was deployed for pair token0/token1 \n");

    let fhevmInstancePair = await createInstances(pairAddress, ethers, this.signers);

    const fhevmtokenpair = fhevmInstancePair.alice.getPublicKey(pairAddress) || {
      signature: "",
      publicKey: "",
    };

    try {
      const txn9 = await token0.connect(signers.bob).bytesapprove(pairAddress, fhevmInstance0.bob.encrypt32(100000000));
      console.log("txn9 hash:", txn9.hash);
      await txn9.wait(1);
      console.log("txn9 successful!");
    } catch (error) {
      console.error("txn9 failed:", error);
    }

    try {
      const txn10 = await token1.connect(signers.bob).bytesapprove(pairAddress, fhevmInstance1.bob.encrypt32(200000000));
      console.log("txn10 hash:", txn10.hash);
      await txn10.wait(1);
      console.log("txn10 successful!");
    } catch (error) {
      console.error("txn10 failed:", error);
    }

    try {
      const txn11 = await pair
        .connect(signers.bob)
        .addLiquidity(
          fhevmInstancePair.bob.encrypt32(100000000),
          fhevmInstancePair.bob.encrypt32(200000000),
          this.signers.bob.address,
          0,
        );
      console.log("txn11 hash:", txn11.hash);
      await txn11.wait(1);
      console.log("txn11 successful!");
    } catch (error) {
      console.error("txn11 failed:", error);
    }

    console.log("Bob submitted an addLiquidity order at tradingEpoch ", await pair.currentTradingEpoch());

    try {
      const txn12 = await token0.connect(signers.carol)
        .bytesapprove(pairAddress, fhevmInstance0.carol.encrypt32(200000000));
      console.log("txn12 hash:", txn12.hash);
      await txn12.wait(1);
      console.log("txn12 successful!");
    } catch (error) {
      console.error("txn12 failed:", error);
    }

    try {
      const txn13 = await token1.connect(signers.carol)
        .bytesapprove(pairAddress, fhevmInstance1.carol.encrypt32(400000000));
      console.log("txn13 hash:", txn13.hash);
      await txn13.wait(1);
      console.log("txn13 successful!");
    } catch (error) {
      console.error("txn13 failed:", error);
    }

    try {
      const txn14 = await pair
        .connect(signers.carol)
        .addLiquidity(
          fhevmInstancePair.carol.encrypt32(200000000),
          fhevmInstancePair.carol.encrypt32(400000000),
          this.signers.carol.address,
          0,
        );
      console.log("txn14 hash:", txn14.hash);
      await txn14.wait(1);
      console.log("txn14 successful!");
    } catch (error) {
      console.error("txn14 failed:", error);
    }

    console.log("Carol submitted an addLiquidity order at tradingEpoch ", await pair.currentTradingEpoch());

    try {
      const txn15 = await pair.batchSettlement();
      console.log("txn15 hash:", txn15.hash);
      await txn15.wait(1);
      console.log("txn15 successful!");
    } catch (error) {
      console.error("txn15 failed:", error);
    }

    console.log(
      "Batch Settlement was confirmed with threshold decryptions for tradingEpoch ",
      (await pair.currentTradingEpoch()) - 1n,
    );

    console.log("New reserves for tradingEpoch ", await pair.currentTradingEpoch(), " are now publicly revealed : ");

    let [reserve0, reserve1] = await pair.getReserves();
    console.log("Reserve token0 ", reserve0);
    console.log("Reserve token1 ", reserve1, "\n");

    try {
      const txn16 = await pair.claimMint(0, signers.bob.address);
      console.log("txn16 hash:", txn16.hash);
      await txn16.wait(1);
      console.log("txn16 successful!");
    } catch (error) {
      console.error("txn16 failed:", error);
    }

    try {
      const txn17 = await pair.claimMint(0, signers.carol.address);
      console.log("txn17 hash:", txn17.hash);
      await txn17.wait(1);
      console.log("txn17 successful!");
    } catch (error) {
      console.error("txn17 failed:", error);
    }

    try {
      const txn18 = await token0.connect(signers.dave).bytesapprove(pairAddress, fhevmInstance0.bob.encrypt32(100000000));
      console.log("txn18 hash:", txn18.hash);
      await txn18.wait(1);
      console.log("txn18 successful!");
    } catch (error) {
      console.error("txn18 failed:", error);
    }

    try {
      const txn19 = await token1.connect(signers.dave).bytesapprove(pairAddress, fhevmInstance1.bob.encrypt32(100000000));
      console.log("txn19 hash:", txn19.hash);
      await txn19.wait(1);
      console.log("txn19 successful!");
    } catch (error) {
      console.error("txn19 failed:", error);
    }

    try {
      const txn20 = await pair.connect(signers.dave).swapTokens(
        fhevmInstancePair.dave.encrypt32(100),
        fhevmInstancePair.dave.encrypt32(0),
        signers.dave.address,
        1);
      console.log("txn20 hash:", txn20.hash);
      await txn20.wait(1);
      console.log("txn20 successful!");
    } catch (error) {
      console.error("txn20 failed:", error);
    }

    console.log("Dave submitted a swap order at tradingEpoch ", await pair.currentTradingEpoch());

    try {
      const txn21 = await token0.connect(signers.eve).bytesapprove(pairAddress, fhevmInstance0.bob.encrypt32(100000000));
      console.log("txn21 hash:", txn21.hash);
      await txn21.wait(1);
      console.log("txn21 successful!");
    } catch (error) {
      console.error("txn21 failed:", error);
    }

    try {
      const txn22 = await token1.connect(signers.eve).bytesapprove(pairAddress, fhevmInstance1.bob.encrypt32(100000000));
      console.log("txn22 hash:", txn22.hash);
      await txn22.wait(1);
      console.log("txn22 successful!");
    } catch (error) {
      console.error("txn22 failed:", error);
    }

    try {
      const txn23 = await pair.connect(signers.eve).swapTokens(
        fhevmInstancePair.eve.encrypt32(0),
        fhevmInstancePair.eve.encrypt32(1000000),
        signers.eve.address,
        1);
      console.log("txn23 hash:", txn23.hash);
      await txn23.wait(1);
      console.log("txn23 successful!");
    } catch (error) {
      console.error("txn23 failed:", error);
    }

    console.log("Eve submitted a swap order at tradingEpoch ", await pair.currentTradingEpoch(), "\n");

    try {
      const txn24 = await pair.batchSettlement({gasLimit: 10000000});
      console.log("txn24 hash:", txn24.hash);
      await txn24.wait(1);
      console.log("txn24 successful!");
    } catch (error) {
      console.error("txn24 failed:", error);
    }

    console.log(
      "Batch Settlement was confirmed with threshold decryptions for tradingEpoch ",
      (await pair.currentTradingEpoch()) - 1n,
    );

    console.log("New reserves for tradingEpoch ", await pair.currentTradingEpoch(), " are now publicly revealed : ");
    [reserve0, reserve1] = await pair.getReserves();
    console.log("Reserve token0 ", reserve0);
    console.log("Reserve token1 ", reserve1, "\n");

    try {
      const txn25 = await pair.claimSwap(1, signers.dave.address);
      console.log("txn25 hash:", txn25.hash);
      await txn25.wait(1);
      console.log("txn25 successful!");
    } catch (error) {
      console.error("txn25 failed:", error);
    }

    try {
      const txn26 = await pair.claimSwap(1, signers.eve.address);
      console.log("txn26 hash:", txn26.hash);
      await txn26.wait(1);
      console.log("txn26 successful!");
    } catch (error) {
      console.error("txn26 failed:", error);
    }

    console.log("New balances of traders (Dave and Eve) : ");

    console.log("initial balance of market makers (Bob and Carol)");
    console.log(
      "Bob token0 bal - " +
        fhevmInstance0.alice.decrypt(
          token0Address,
          await token0.ebalanceOf(signers.dave.address, fhevmtoken0.publicKey),
        ),
    );
    console.log(
      "Bob token1 bal - " +
        fhevmInstance1.alice.decrypt(
          token1Address,
          await token1.ebalanceOf(signers.dave.address, fhevmtoken1.publicKey),
        ),
    );
    console.log(
      "Carol token0 bal - " +
        fhevmInstance0.alice.decrypt(
          token0Address,
          await token0.ebalanceOf(signers.eve.address, fhevmtoken0.publicKey),
        ),
    );
    console.log(
      "Carol token1 bal - " +
        fhevmInstance1.alice.decrypt(
          token1Address,
          await token1.ebalanceOf(signers.eve.address, fhevmtoken1.publicKey),
        ),
    );

    try {
      const txn27 = await pair.connect(this.signers.bob).removeLiquidity(fhevmInstancePair.bob.encrypt32(149999900 / 2), signers.bob.address, 2);
      console.log("txn27 hash:", txn27.hash);
      await txn27.wait(1);
      console.log("txn27 successful!");
    } catch (error) {
      console.error("txn27 failed:", error);
    }    

    console.log("Bob submitted a removeLiquidity order at tradingEpoch ", await pair.currentTradingEpoch());

    try {
      const txn28 = await pair.connect(this.signers.carol).removeLiquidity(fhevmInstancePair.bob.encrypt32(299999900 / 2), signers.bob.address, 2);
      console.log("txn28 hash:", txn28.hash);
      await txn28.wait(1);
      console.log("txn28 successful!");
    } catch (error) {
      console.error("txn28 failed:", error);
    }

    console.log("Carol submitted a removeLiquidity order at tradingEpoch ", await pair.currentTradingEpoch(), "\n");
    console.log("Bob now owns a private balance of ", await pair.ebalanceOf(signers.bob.address, fhevmtokenpair.publicKey), " liquidity tokens");
    console.log("Carol now owns a private balance of ", await pair.ebalanceOf(signers.carol.address, fhevmtokenpair.publicKey), " liquidity tokens \n");

    console.log("total supply - " + await pair.gettotalsupply());

    let [_reserve0, _reserve1] = await pair.getReserves();
    console.log("mapping - " + await pair.getfirstBlockPerEpoch(await pair.currentTradingEpoch()));
    console.log("Reserve token0 ", _reserve0);
    console.log("Reserve token1 ", _reserve1, "\n");

    console.log("request decryptions - " + await pair.requestAllDecryptions());

    try {
      const txn29 = await pair.batchSettlement({gasLimit: 10000000});
      console.log("txn29 hash:", txn29.hash);
      await txn29.wait(1);
      console.log("txn29 successful!");
    } catch (error) {
      console.error("txn29 failed:", error);
    }

    console.log(
      "Batch Settlement was confirmed with threshold decryptions for tradingEpoch ",
      (await pair.currentTradingEpoch()) - 1n,
    );

    console.log("New reserves for tradingEpoch ", await pair.currentTradingEpoch(), " are now publicly revealed : ");
    [reserve0, reserve1] = await pair.getReserves();
    console.log("Reserve token0 ", reserve0);
    console.log("Reserve token1 ", reserve1, "\n");

    try {
      const txn30 = await pair.claimBurn(2n, signers.bob.address);
      console.log("txn30 hash:", txn30.hash);
      await txn30.wait(1);
      console.log("txn30 successful!");
    } catch (error) {
      console.error("txn30 failed:", error);
    }

    try {
      const txn31 = await pair.claimBurn(2n, signers.carol.address);
      console.log("txn31 hash:", txn31.hash);
      await txn31.wait(1);
      console.log("txn31 successful!");
    } catch (error) {
      console.error("txn31 failed:", error);
    }

    console.log("New balances of market makers (Bob and Carol) : ");
    console.log(
      "Bob token0 bal - " +
        fhevmInstance0.alice.decrypt(
          token0Address,
          await token0.ebalanceOf(signers.dave.address, fhevmtoken0.publicKey),
        ),
    );
    console.log(
      "Bob token1 bal - " +
        fhevmInstance1.alice.decrypt(
          token1Address,
          await token1.ebalanceOf(signers.dave.address, fhevmtoken1.publicKey),
        ),
    );
    console.log(
      "Carol token0 bal - " +
        fhevmInstance0.alice.decrypt(
          token0Address,
          await token0.ebalanceOf(signers.eve.address, fhevmtoken0.publicKey),
        ),
    );
    console.log(
      "Carol token1 bal - " +
        fhevmInstance1.alice.decrypt(
          token1Address,
          await token1.ebalanceOf(signers.eve.address, fhevmtoken1.publicKey),
        ),
    );

  });

  it("Encrypted DEX Pool - single epoch (addLiquidity+swap)", async function () {
    console.log("\n 1) Deploying contracts... \n");
    const signers = await getSigners(ethers);

    let token0 = await deployTokenA();
    let token0Address = await token0.getaddress();
    let token1 = await deployTokenB();
    let token1Address = await token1.getaddress();

    let fhevmInstance0 = await createInstances(token0Address, ethers, signers);
    let fhevmInstance1 = await createInstances(token1Address, ethers, signers);

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

    console.log("address - " + signers.bob.address);
    console.log("address - " + signers.alice.address);
    console.log("address - " + signers.carol.address);
    console.log("address - " + signers.dave.address);
    console.log("address - " + signers.eve.address);

    try {
      const txn0 = await token0.mint(2000000000);
      console.log("txn0 hash:", txn0.hash);
      await txn0.wait(1);
      console.log("txn0 successful!");
    } catch (error) {
      console.error("txn0 failed:", error);
    }

    try {
      const txn1 = await token1.mint(2000000000);
      console.log("txn1 hash:", txn1.hash);
      await txn1.wait(1);
      console.log("txn1 successful!");
    } catch (error) {
      console.error("txn1 failed:", error);
    }

    console.log("alice balance int- " + (await token0.getbal(signers.alice.address)));
    console.log("bob balance int- " + (await token0.getbal(signers.bob.address)));

    // console.log("decrypted owner balance - " +  fhevmInstance1.alice.decrypt(token1Address, await token1.ebalanceOf(signers.alice.address ,fhevmtoken1.publicKey)));

    try {
      const txn2 = await token0.bytestransfer(signers.bob.address, fhevmInstance0.alice.encrypt32(100000000));
      console.log("txn2 hash:", txn2.hash);
      await txn2.wait(1);
      console.log("txn2 successful!");
    } catch (error) {
      console.error("txn2 failed:", error);
    }

    console.log("alice balance int- " + (await token0.getbal(signers.alice.address)));
    console.log("bob balance int- " + (await token0.getbal(signers.bob.address)));

    console.log(
      "bob balance - " +
        fhevmInstance0.alice.decrypt(
          token0Address,
          await token0.ebalanceOf(signers.bob.address, fhevmtoken0.publicKey),
        ),
    );
    console.log(
      "alice balance - " +
        fhevmInstance0.alice.decrypt(
          token0Address,
          await token0.ebalanceOf(signers.alice.address, fhevmtoken0.publicKey),
        ),
    );

    try {
      const txn3 = await token0.bytestransfer(signers.carol.address, fhevmInstance0.alice.encrypt32(200000000));
      console.log("txn3 hash:", txn3.hash);
      await txn3.wait(1);
      console.log("txn3 successful!");
    } catch (error) {
      console.error("txn3 failed:", error);
    }

    try {
      const txn4 = await token1.bytestransfer(signers.bob.address, fhevmInstance1.alice.encrypt32(200000000));
      console.log("txn4 hash:", txn4.hash);
      await txn4.wait(1);
      console.log("txn4 successful!");
    } catch (error) {
      console.error("txn4 failed:", error);
    }

    try {
      const txn5 = await token1.bytestransfer(signers.carol.address, fhevmInstance1.alice.encrypt32(400000000));
      console.log("txn5 hash:", txn5.hash);
      await txn5.wait(1);
      console.log("txn5 successful!");
    } catch (error) {
      console.error("txn5 failed:", error);
    }

    console.log("initial balance of market makers (Bob and Carol)");
    console.log(
      "Bob token0 bal - " +
        fhevmInstance0.alice.decrypt(
          token0Address,
          await token0.ebalanceOf(signers.bob.address, fhevmtoken0.publicKey),
        ),
    );
    console.log(
      "Bob token1 bal - " +
        fhevmInstance1.alice.decrypt(
          token1Address,
          await token1.ebalanceOf(signers.bob.address, fhevmtoken1.publicKey),
        ),
    );
    console.log(
      "Carol token0 bal - " +
        fhevmInstance0.alice.decrypt(
          token0Address,
          await token0.ebalanceOf(signers.carol.address, fhevmtoken0.publicKey),
        ),
    );
    console.log(
      "Carol token1 bal - " +
        fhevmInstance1.alice.decrypt(
          token1Address,
          await token1.ebalanceOf(signers.carol.address, fhevmtoken1.publicKey),
        ),
    );

    try {
      const txn6 = await token0.bytestransfer(signers.dave.address, fhevmInstance0.alice.encrypt32(1000000));
      console.log("txn6 hash:", txn6.hash);
      await txn6.wait(1);
      console.log("txn6 successful!");
    } catch (error) {
      console.error("txn6 failed:", error);
    }

    try {
      const txn6bis = await token1.bytestransfer(signers.dave.address, fhevmInstance1.alice.encrypt32(0));
      console.log("txn6bis hash:", txn6bis.hash);
      await txn6bis.wait(1);
      console.log("txn6bis successful!");
    } catch (error) {
      console.error("txn6bis failed:", error);
    }

    try {
      const txn7 = await token1.bytestransfer(signers.eve.address, fhevmInstance1.alice.encrypt32(1000000));
      console.log("txn7 hash:", txn7.hash);
      await txn7.wait(1);
      console.log("txn7 successful!");
    } catch (error) {
      console.error("txn7 failed:", error);
    }

    try {
      const txn7bis = await token0.bytestransfer(signers.eve.address, fhevmInstance0.alice.encrypt32(0));
      console.log("txn7bis hash:", txn7bis.hash);
      await txn7bis.wait(1);
      console.log("txn7bis successful!");
    } catch (error) {
      console.error("txn7bis failed:", error);
    }

    console.log("initial balance of market makers (Dave and Eve)");
    console.log(
      "Dave token0 bal - " +
        fhevmInstance0.alice.decrypt(
          token0Address,
          await token0.ebalanceOf(signers.dave.address, fhevmtoken0.publicKey),
        ),
    );
    console.log(
      "Dave token1 bal - " +
        fhevmInstance1.alice.decrypt(
          token1Address,
          await token1.ebalanceOf(signers.dave.address, fhevmtoken1.publicKey),
        ),
    );
    console.log(
      "Eve token0 bal - " +
        fhevmInstance0.alice.decrypt(
          token0Address,
          await token0.ebalanceOf(signers.eve.address, fhevmtoken0.publicKey),
        ),
    );
    console.log(
      "Eve token1 bal - " +
        fhevmInstance1.alice.decrypt(
          token1Address,
          await token1.ebalanceOf(signers.eve.address, fhevmtoken1.publicKey),
        ),
    );

    const dexFactory = await deployFactory();

    try {
      const txn8 = await dexFactory.createPair(token0Address, token1Address);
      console.log("txn8 hash:", txn8.hash);
      await txn8.wait(1);
      console.log("txn8 successful!");
    } catch (error) {
      console.error("txn8 failed:", error);
    }

    const pairAddress = await dexFactory.getPair(token0Address, token1Address);
    const pair = await ethers.getContractAt("EncryptedDEXPair", pairAddress);

    console.log("DEX contract was deployed for pair token0/token1 \n");

    let fhevmInstancePair = await createInstances(pairAddress, ethers, this.signers);

    const fhevmtokenpair = fhevmInstancePair.alice.getPublicKey(pairAddress) || {
      signature: "",
      publicKey: "",
    };

    try {
      const txn9 = await token0.connect(signers.bob).bytesapprove(pairAddress, fhevmInstance0.bob.encrypt32(100000000));
      console.log("txn9 hash:", txn9.hash);
      await txn9.wait(1);
      console.log("txn9 successful!");
    } catch (error) {
      console.error("txn9 failed:", error);
    }

    try {
      const txn10 = await token1.connect(signers.bob).bytesapprove(pairAddress, fhevmInstance1.bob.encrypt32(200000000));
      console.log("txn10 hash:", txn10.hash);
      await txn10.wait(1);
      console.log("txn10 successful!");
    } catch (error) {
      console.error("txn10 failed:", error);
    }

    try {
      const txn11 = await pair
        .connect(signers.bob)
        .addLiquidity(
          fhevmInstancePair.bob.encrypt32(100000000),
          fhevmInstancePair.bob.encrypt32(200000000),
          this.signers.bob.address,
          0,
        );
      console.log("txn11 hash:", txn11.hash);
      await txn11.wait(1);
      console.log("txn11 successful!");
    } catch (error) {
      console.error("txn11 failed:", error);
    }

    console.log("Bob submitted an addLiquidity order at tradingEpoch ", await pair.currentTradingEpoch());

    try {
      const txn12 = await token0.connect(signers.carol)
        .bytesapprove(pairAddress, fhevmInstance0.carol.encrypt32(200000000));
      console.log("txn12 hash:", txn12.hash);
      await txn12.wait(1);
      console.log("txn12 successful!");
    } catch (error) {
      console.error("txn12 failed:", error);
    }

    try {
      const txn13 = await token1.connect(signers.carol)
        .bytesapprove(pairAddress, fhevmInstance1.carol.encrypt32(400000000));
      console.log("txn13 hash:", txn13.hash);
      await txn13.wait(1);
      console.log("txn13 successful!");
    } catch (error) {
      console.error("txn13 failed:", error);
    }

    try {
      const txn14 = await pair
        .connect(signers.carol)
        .addLiquidity(
          fhevmInstancePair.carol.encrypt32(200000000),
          fhevmInstancePair.carol.encrypt32(400000000),
          this.signers.carol.address,
          0,
        );
      console.log("txn14 hash:", txn14.hash);
      await txn14.wait(1);
      console.log("txn14 successful!");
    } catch (error) {
      console.error("txn14 failed:", error);
    }

    console.log("Carol submitted an addLiquidity order at tradingEpoch ", await pair.currentTradingEpoch());

    try {
      const txn18 = await token0.connect(signers.dave).bytesapprove(pairAddress, fhevmInstance0.bob.encrypt32(100000000));
      console.log("txn18 hash:", txn18.hash);
      await txn18.wait(1);
      console.log("txn18 successful!");
    } catch (error) {
      console.error("txn18 failed:", error);
    }

    try {
      const txn19 = await token1.connect(signers.dave).bytesapprove(pairAddress, fhevmInstance1.bob.encrypt32(100000000));
      console.log("txn19 hash:", txn19.hash);
      await txn19.wait(1);
      console.log("txn19 successful!");
    } catch (error) {
      console.error("txn19 failed:", error);
    }

    try {
      const txn20 = await pair.connect(signers.dave).swapTokens(
        fhevmInstancePair.dave.encrypt32(100),
        fhevmInstancePair.dave.encrypt32(0),
        signers.dave.address,
        1);
      console.log("txn20 hash:", txn20.hash);
      await txn20.wait(1);
      console.log("txn20 successful!");
    } catch (error) {
      console.error("txn20 failed:", error);
    }

    console.log("Dave submitted a swap order at tradingEpoch ", await pair.currentTradingEpoch());

    try {
      const txn21 = await token0.connect(signers.eve).bytesapprove(pairAddress, fhevmInstance0.bob.encrypt32(100000000));
      console.log("txn21 hash:", txn21.hash);
      await txn21.wait(1);
      console.log("txn21 successful!");
    } catch (error) {
      console.error("txn21 failed:", error);
    }

    try {
      const txn22 = await token1.connect(signers.eve).bytesapprove(pairAddress, fhevmInstance1.bob.encrypt32(100000000));
      console.log("txn22 hash:", txn22.hash);
      await txn22.wait(1);
      console.log("txn22 successful!");
    } catch (error) {
      console.error("txn22 failed:", error);
    }

    try {
      const txn23 = await pair.connect(signers.eve).swapTokens(
        fhevmInstancePair.eve.encrypt32(0),
        fhevmInstancePair.eve.encrypt32(1000000),
        signers.eve.address,
        1);
      console.log("txn23 hash:", txn23.hash);
      await txn23.wait(1);
      console.log("txn23 successful!");
    } catch (error) {
      console.error("txn23 failed:", error);
    }

    console.log("Eve submitted a swap order at tradingEpoch ", await pair.currentTradingEpoch(), "\n");

    try {
      const txn24 = await pair.batchSettlement({gasLimit: 10000000});
      console.log("txn24 hash:", txn24.hash);
      await txn24.wait(1);
      console.log("txn24 successful!");
    } catch (error) {
      console.error("txn24 failed:", error);
    }

    console.log(
      "Batch Settlement was confirmed with threshold decryptions for tradingEpoch ",
      (await pair.currentTradingEpoch()) - 1n,
    );

    console.log("New reserves for tradingEpoch ", await pair.currentTradingEpoch(), " are now publicly revealed : ");
    let [reserve0, reserve1] = await pair.getReserves();
    console.log("Reserve token0 ", reserve0);
    console.log("Reserve token1 ", reserve1, "\n");

    try {
      const txn25 = await pair.claimSwap(0, signers.dave.address);
      console.log("txn25 hash:", txn25.hash);
      await txn25.wait(1);
      console.log("txn25 successful!");
    } catch (error) {
      console.error("txn25 failed:", error);
    }

    try {
      const txn26 = await pair.claimSwap(0, signers.eve.address);
      console.log("txn26 hash:", txn26.hash);
      await txn26.wait(1);
      console.log("txn26 successful!");
    } catch (error) {
      console.error("txn26 failed:", error);
    }
    
    try {
      const txn16 = await pair.claimMint(0, signers.bob.address);
      console.log("txn16 hash:", txn16.hash);
      await txn16.wait(1);
      console.log("txn16 successful!");
    } catch (error) {
      console.error("txn16 failed:", error);
    }

    try {
      const txn17 = await pair.claimMint(0, signers.carol.address);
      console.log("txn17 hash:", txn17.hash);
      await txn17.wait(1);
      console.log("txn17 successful!");
    } catch (error) {
      console.error("txn17 failed:", error);
    }

    console.log("Bob now owns a private balance of ", await pair.ebalanceOf(signers.bob.address, fhevmtokenpair.publicKey), " liquidity tokens");
    console.log("Carol now owns a private balance of ", await pair.ebalanceOf(signers.carol.address, fhevmtokenpair.publicKey), " liquidity tokens \n");

    console.log("New balances of market makers (Bob and Carol) : ");
    console.log(
      "Bob token0 bal - " +
        fhevmInstance0.alice.decrypt(
          token0Address,
          await token0.ebalanceOf(signers.dave.address, fhevmtoken0.publicKey),
        ),
    );
    console.log(
      "Bob token1 bal - " +
        fhevmInstance1.alice.decrypt(
          token1Address,
          await token1.ebalanceOf(signers.dave.address, fhevmtoken1.publicKey),
        ),
    );
    console.log(
      "Carol token0 bal - " +
        fhevmInstance0.alice.decrypt(
          token0Address,
          await token0.ebalanceOf(signers.eve.address, fhevmtoken0.publicKey),
        ),
    );
    console.log(
      "Carol token1 bal - " +
        fhevmInstance1.alice.decrypt(
          token1Address,
          await token1.ebalanceOf(signers.eve.address, fhevmtoken1.publicKey),
        ),
    );

  });


});