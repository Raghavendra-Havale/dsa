import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";
const { web3, deployments, waffle } = hre;
const { provider, deployContract } = waffle;
import chai from "chai";
import { solidity } from "ethereum-waffle";

chai.use(solidity);

import expectEvent from "../scripts/expectEvent";
import layerDeployContract from "../scripts/deployContract";

import { Contract, Signer } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Address } from "hardhat-deploy/dist/types";
import BigNumber from "bignumber.js";

describe("LayerIndex", function () {
  const addr_zero = ethers.constants.AddressZero;

  let layerIndex: Contract,
    layerList: Contract,
    layerAccountProxy: Contract,
    layerDefaultAccountV2: Contract,
    layerConnectors: Contract,
    layerAccountTestV3: Contract,
    layerAccountTestV4: Contract;

  let masterSigner: Signer;
  let deployer: SignerWithAddress,
    signer: SignerWithAddress,
    newMaster: SignerWithAddress;

  const wallets = provider.getWallets();
  let [wallet0, wallet1, wallet2, wallet3] = wallets;
  let setBasicsArgs: [string, string, string, string];
  let versionCount = 0;
  let masterAddress: Address;
  let dsaWallet0: Contract;

  before(async () => {
    await hre.network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            // @ts-ignore
            jsonRpcUrl: hre.config.networks.hardhat.forking.url,
            blockNumber: 15010000,
          },
        },
      ],
    });

    [deployer, signer, newMaster] = await ethers.getSigners();
    const deployerAddress = deployer.address;
    masterAddress = deployerAddress;

    console.log(`\tDeployer Address: ${deployerAddress}`);

    layerIndex = await layerDeployContract("LayerIndex", []);

    layerList = await layerDeployContract("LayerList", [layerIndex.address]);

    layerAccountProxy = await layerDeployContract("LayerAccount", [
      layerIndex.address,
    ]);

    layerAccountTestV3 = await layerDeployContract("LayerAccountTestV3", []);

    layerAccountTestV4 = await layerDeployContract("LayerAccountTestV4", []);


    layerDefaultAccountV2 = await layerDeployContract(
      "LayerDefaultImplementation",
      [layerIndex.address]
    );

    layerConnectors = await layerDeployContract("LayerConnectors", [
      layerIndex.address,
    ]);

    setBasicsArgs = [
      deployerAddress,
      layerList.address,
      layerAccountProxy.address,
      layerConnectors.address,
    ];

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [masterAddress],
    });

    masterSigner = ethers.provider.getSigner(masterAddress);
  });

  it("should have the contracts deployed", async function () {
    expect(!!layerIndex.address).to.be.true;
    expect(!!layerList.address).to.be.true;
    expect(!!layerAccountProxy.address).to.be.true;
    expect(!!layerConnectors.address).to.be.true;
  });

  it("should set the basics", async function () {
    const tx = await layerIndex.setBasics(...setBasicsArgs);
    const txDetails = await tx.wait();
    expect(!!txDetails.status).to.be.true;
    versionCount++;
  });

  it("should revert on setting the basics again", async function () {
    setBasicsArgs = [
      masterAddress,
      layerList.address,
      layerAccountProxy.address,
      layerConnectors.address,
    ];
    await expect(layerIndex.setBasics(...setBasicsArgs)).to.be.revertedWith(
      "already-defined"
    );
  });

  it("should check the state", async function () {
    expect(await layerIndex.master()).to.be.equal(masterAddress);
    console.log("\tMaster set...");
    expect(await layerIndex.list()).to.be.equal(layerList.address);
    console.log("\tList registry module set...");
    let versionCount = await layerIndex.versionCount();
    expect(versionCount).to.be.equal(versionCount);
    console.log("\tVersion count set...");
    expect(await layerIndex.connectors(versionCount)).to.be.equal(
      layerConnectors.address
    );
    console.log("\tConnectors Registry Module set...");
    expect(await layerIndex.account(versionCount)).to.be.equal(
      layerAccountProxy.address
    );
    console.log("\tAccount module set...");
    expect(await layerIndex.check(versionCount)).to.be.equal(addr_zero);
    console.log("\tCheck module set to 0x00...");
  });

  describe("Only Master", function () {
    describe("Change Master", function () {
      it("should revert if calling method with non-master signer", async function () {
        await expect(
          layerIndex.connect(signer).changeMaster(newMaster.address)
        ).to.be.revertedWith("not-master");
      });

      it("should revert if new master is same as master", async function () {
        await expect(
          layerIndex.connect(masterSigner).changeMaster(masterAddress)
        ).to.be.revertedWith("already-a-master");
      });

      it("should revert if new master is zero address", async function () {
        await expect(
          layerIndex.connect(masterSigner).changeMaster(addr_zero)
        ).to.be.revertedWith("not-valid-address");
      });

      it("should change newMaster", async function () {
        const tx = await layerIndex
          .connect(masterSigner)
          .changeMaster(newMaster.address);
        const txDetails = await tx.wait();
        expect(!!txDetails.status).to.be.true;
        let args = {
          master: newMaster.address,
        };
        expectEvent(
          txDetails,
          (await deployments.getArtifact("LayerIndex")).abi,
          "LogNewMaster",
          args
        );
        console.log("\tLogNewMaster event fired...");
        expect(await layerIndex.master()).to.be.equal(masterAddress);
        await expect(
          layerIndex.connect(newMaster).changeMaster(masterAddress)
        ).to.be.revertedWith("not-master");
      });

      it("should revert setting the newMaster to already newMaster address", async function () {
        await expect(
          layerIndex.connect(masterSigner).changeMaster(newMaster.address)
        ).to.be.revertedWith("already-a-new-master");
      });
    });

    describe("Update Master", function () {
      it("should revert calling with non-new-master", async function () {
        await expect(
          layerIndex.connect(masterSigner).updateMaster()
        ).to.be.revertedWith("not-master");
      });

      it("should update the master to new master", async function () {
        const tx = await layerIndex.connect(newMaster).updateMaster();
        let txDetails = await tx.wait();
        expect(!!txDetails.status).to.be.true;
        let args = {
          master: newMaster.address,
        };
        expectEvent(
          txDetails,
          (await deployments.getArtifact("LayerIndex")).abi,
          "LogUpdateMaster",
          args
        );
        console.log("\tLogUpdateMaster event fired...");
        expect(await layerIndex.master()).to.be.equal(newMaster.address);
      });

      it("should revert updating master without changing", async function () {
        await expect(
          layerIndex.connect(newMaster).updateMaster()
        ).to.be.revertedWith("not-valid-address");
      });
    });

    describe("Add new account module", function () {
      it("should revert if calling method with non-master signer", async function () {
        await expect(
          layerIndex
            .connect(signer)
            .addNewAccount(
              layerDefaultAccountV2.address,
              layerConnectors.address,
              addr_zero
            )
        ).to.be.revertedWith("not-master");
      });

      it("should revert when adding zero-address-account", async function () {
        await expect(
          layerIndex
            .connect(newMaster)
            .addNewAccount(addr_zero, layerConnectors.address, addr_zero)
        ).to.be.revertedWith("not-valid-address");
      });

      it("should add new module with connectors and zero-check address", async function () {
        const tx = await layerIndex
          .connect(newMaster)
          .addNewAccount(
            layerDefaultAccountV2.address,
            layerConnectors.address,
            addr_zero
          );
        let txDetails = await tx.wait();
        expect(!!txDetails.status).to.be.true;
        versionCount++;
        let accountArgs = {
          _newAccount: layerDefaultAccountV2.address,
          _connectors: layerConnectors.address,
          _check: addr_zero,
        };
        expectEvent(
          txDetails,
          (await deployments.getArtifact("LayerIndex")).abi,
          "LogNewAccount",
          accountArgs
        );
        console.log("\tLogNewAccount event fired...");
      });

      it("should add new module with no connector registry and zero-check address", async function () {
        const tx = await layerIndex
          .connect(newMaster)
          .addNewAccount(layerAccountTestV3.address, addr_zero, addr_zero);
        let txDetails = await tx.wait();
        expect(!!txDetails.status).to.be.true;
        versionCount++;
        let accountArgs = {
          _newAccount: layerAccountTestV3.address,
          _connectors: addr_zero,
          _check: addr_zero,
        };
        expectEvent(
          txDetails,
          (await deployments.getArtifact("LayerIndex")).abi,
          "LogNewAccount",
          accountArgs
        );
        console.log("\tLogNewAccount event fired...");
      });

      it("should add new module with connector registry and check module", async function () {
        let check_addr = "0x8a5419CfC711B2343c17a6ABf4B2bAFaBb06957F";
        const tx = await layerIndex
          .connect(newMaster)
          .addNewAccount(
            layerAccountTestV4.address,
            layerConnectors.address,
            check_addr
          );
        let txDetails = await tx.wait();
        expect(!!txDetails.status).to.be.true;
        versionCount++;
        let accountArgs = {
          _newAccount: layerAccountTestV4.address,
          _connectors: layerConnectors.address,
          _check: check_addr,
        };
        expectEvent(
          txDetails,
          (await deployments.getArtifact("LayerIndex")).abi,
          "LogNewAccount",
          accountArgs
        );
        console.log("\tLogNewAccount event fired...");
      });

      it("should check the versionCount for new module", async function () {
        expect(await layerIndex.versionCount()).to.be.equal(versionCount);
      });

      it("should revert on re-adding same check module to same version", async function () {
        let check_addr = await layerIndex.check(1); //check module address for version 1
        await expect(
          layerIndex.connect(newMaster).changeCheck(1, check_addr)
        ).to.be.revertedWith("already-a-check");
      });

      it("should change check module address", async function () {
        let check_addr = "0x8a5419CfC711B2343c17a6ABf4B2bAFaBb06957F"; //checking for a dummy check address
        let tx = await layerIndex.connect(newMaster).changeCheck(1, check_addr);
        let txDetails = await tx.wait();
        expect(!!txDetails.status).to.be.true;
        let args = {
          accountVersion: "1",
          check: check_addr,
        };
        expectEvent(
          txDetails,
          (await deployments.getArtifact("LayerIndex")).abi,
          "LogNewCheck",
          args
        );
        console.log("\tLogNewCheck event fired...");
      });

      it("can add same check module to multiple versions", async function () {
        let check_addr = "0x8a5419CfC711B2343c17a6ABf4B2bAFaBb06957F"; //checking for a dummy check address
        let tx = await layerIndex.connect(newMaster).changeCheck(2, check_addr);
        let txDetails = await tx.wait();
        expect(!!txDetails.status).to.be.true;
        expectEvent(
          txDetails,
          (await deployments.getArtifact("LayerIndex")).abi,
          "LogNewCheck",
          {
            accountVersion: "2",
            check: check_addr,
          }
        );
        console.log("\tLogNewCheck event fired...");
      });
    });

    describe("Build DSA", function () {
      let accounts_before: any,
        accounts_after: any,
        userLink_before: any,
        userLink_after: any,
        userList_before: any,
        userList_after: any,
        accountLink_before: any,
        accountLink_after: any,
        accountList_before: any,
        accountList_after: any,
        dsaWallet1: Contract;
      it("should check if account module is clone", async function () {
        expect(await layerIndex.isClone(1, layerAccountProxy.address)).to.be.false;
      });

      it("should revert with incorrect account version", async function () {
        await expect(
          layerIndex.connect(wallet0).build(wallet0.address, 0, addr_zero)
        ).to.be.revertedWith("not-valid-account");
        await expect(
          layerIndex
            .connect(wallet0)
            .build(wallet0.address, versionCount + 1, addr_zero)
        ).to.be.revertedWith("not-valid-account");
      });

      it("should get account count and list links before building DSA", async function () {
        accounts_before = await layerList.accounts();
        console.log("\tPrevious Account ID: ", accounts_before);
        userLink_before = await layerList.userLink(wallet0.address);
        expect(userLink_before.first).to.be.equal(new BigNumber(0).toString());
        expect(userLink_before.last).to.be.equal(new BigNumber(0).toString());
        expect(userLink_before.count).to.be.equal(new BigNumber(0).toString());
        userList_before = await layerList.userList(
          wallet0.address,
          new BigNumber(accounts_before.toString()).plus(1).toString()
        );
        expect(userList_before.prev).to.be.equal(new BigNumber(0).toString());
        expect(userList_before.next).to.be.equal(new BigNumber(0).toString());
        accountLink_before = await layerList.accountLink(
          new BigNumber(accounts_before.toString()).plus(1).toString()
        );
        expect(accountLink_before.first).to.be.equal(addr_zero);
        expect(accountLink_before.last).to.be.equal(addr_zero);
        expect(accountLink_before.count).to.be.equal(
          new BigNumber(0).toString()
        );
        accountList_before = await layerList.accountList(
          new BigNumber(accounts_before.toString()).plus(1).toString(),
          wallet0.address
        );
        expect(accountList_before.prev).to.be.equal(addr_zero);
        expect(accountList_before.next).to.be.equal(addr_zero);
      });

      it("should build DSA v2", async function () {
        let tx = await layerIndex
          .connect(wallet0)
          .build(wallet0.address, 2, wallet0.address);
        let txDetails = await tx.wait();
        expect(!!txDetails.status).to.be.true;
        dsaWallet0 = await ethers.getContractAt(
          (
            await deployments.getArtifact("LayerAccount")
          ).abi,
          txDetails.events[1].args.account
        );
        expectEvent(
          txDetails,
          (await deployments.getArtifact("LayerDefaultImplementation")).abi,
          "LogEnableUser",
          {
            user: wallet0.address,
          }
        );
        console.log("\tLogEnable event fired...");
        expectEvent(
          txDetails,
          (await deployments.getArtifact("LayerIndex")).abi,
          "LogAccountCreated",
          {
            sender: wallet0.address,
            owner: wallet0.address,
            account: dsaWallet0.address,
            origin: wallet0.address,
          }
        );
        console.log("\tLogAccountCreated event fired...");
      });

      it("should increment the account ID", async function () {
        accounts_after = await layerList.accounts();
        expect(accounts_after).to.be.equal(
          new BigNumber(accounts_before.toString()).plus(1).toString()
        );
      });

      it("should add account to the list registry", async function () {
        expect(await layerList.accountID(dsaWallet0.address)).to.be.equal(
          accounts_after
        );
        console.log("\tAccount address to ID mapping updated...");
        expect(await layerList.accountAddr(accounts_after)).to.be.equal(
          dsaWallet0.address
        );
        console.log("\tAccount ID to address mapping updated...");
      });
      
      it("should update account links in list registry", async function () {
        userLink_after = await layerList.userLink(wallet0.address);
        expect(userLink_after.first).to.be.equal(accounts_after);
        expect(userLink_after.last).to.be.equal(accounts_after);
        expect(userLink_after.count).to.be.equal(new BigNumber(1).toString());
        console.log("\tUserLink updated...");
        userList_after = await layerList.userList(
          wallet0.address,
          new BigNumber(accounts_after.toString()).toString()
        );
        expect(userList_after.prev).to.be.equal(new BigNumber(0).toString());
        expect(userList_after.next).to.be.equal(new BigNumber(0).toString());
        console.log("\tUserList updated...");
        accountLink_after = await layerList.accountLink(accounts_after);
        expect(accountLink_after.first).to.be.equal(wallet0.address);
        expect(accountLink_after.last).to.be.equal(wallet0.address);
        expect(accountLink_after.count).to.be.equal(
          new BigNumber(1).toString()
        );
        console.log("\tAccountLink updated...");
        accountList_after = await layerList.accountList(
          accounts_after,
          wallet0.address
        );
        expect(accountList_after.prev).to.be.equal(addr_zero);
        expect(accountList_after.next).to.be.equal(addr_zero);
        console.log("\tAccountList updated...");
      });

      it("should check DSA is clone of account module v1", async function () {
        expect(await layerIndex.isClone(2, dsaWallet0.address)).to.be.true;
      });

      it("should build dsa v2 with owner not same as sender", async function () {
        let tx = await layerIndex
          .connect(wallet1)
          .build(wallet0.address, 2, wallet0.address);
        let txDetails = await tx.wait();
        expect(!!txDetails.status).to.be.true;
        dsaWallet1 = await ethers.getContractAt(
          (
            await deployments.getArtifact("LayerAccount")
          ).abi,
          txDetails.events[1].args.account
        );

        expectEvent(
          txDetails,
          (await deployments.getArtifact("LayerDefaultImplementation")).abi,
          "LogEnableUser",
          {
            user: wallet0.address,
          }
        );
        console.log("\tLogEnable event fired...");
        expectEvent(
          txDetails,
          (await deployments.getArtifact("LayerIndex")).abi,
          "LogAccountCreated",
          {
            sender: wallet1.address,
            owner: wallet0.address,
            account: dsaWallet1.address,
            origin: wallet0.address,
          }
        );
        console.log("\tLogAccountCreated event fired...");
      });
    });
  });
});
