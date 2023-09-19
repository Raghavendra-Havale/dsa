import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";
const { web3, deployments, waffle } = hre;
const { provider, deployContract } = waffle;

import expectEvent from "../scripts/expectEvent";
import layerDeployContract from "../scripts/deployContract";

import { Contract, Signer } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Address } from "hardhat-deploy/dist/types";
import BigNumber from "bignumber.js";

describe("LayerList", function () {
  const addr_zero = ethers.constants.AddressZero;

  let layerIndex: Contract,
    layerList: Contract,
    layerAccountProxy: Contract,
    layerDefaultAccountV2: Contract,
    layerConnectors: Contract;

  let masterSigner: Signer;
  let dsaV1: any;
  let dsaV2: any;
  let deployer: SignerWithAddress, signer: SignerWithAddress;

  const wallets = provider.getWallets();
  let [wallet0, wallet1, wallet2, wallet3] = wallets;
  let setBasicsArgs: [string, string, string, string];
  let masterAddress: Address;
  let dsaWalletv1: Contract,
    dsaWalletv2: Contract,
    dsaWalletv3: Contract,
    dsaWalletv0: Contract;
  let walletv1: any, walletv2: any;

  let accounts: any;

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

    [deployer, signer] = await ethers.getSigners();
    const deployerAddress = deployer.address;
    masterAddress = deployerAddress;

    console.log(`\tDeployer Address: ${deployerAddress}`);

    layerIndex = await layerDeployContract("LayerIndex", []);

    layerList = await layerDeployContract("LayerList", [layerIndex.address]);

    layerAccountProxy = await layerDeployContract("LayerAccount", [
      layerIndex.address,
    ]);

    layerConnectors = await layerDeployContract("LayerConnectors", [
      layerIndex.address,
    ]);

    layerDefaultAccountV2 = await layerDeployContract(
      "LayerDefaultImplementation",
      [layerIndex.address]
    );

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
  });

  async function getVersionAbi(version: any) {
    if (version === 1)
      return (await deployments.getArtifact("LayerAccount")).abi;
    else
      return (await deployments.getArtifact("LayerDefaultImplementation")).abi;
  }

  async function buildDSA(owner: any, version: any) {
    const tx = await layerIndex.build(owner, version, owner);
    const receipt = await tx.wait();
    const event = receipt.events.find(
      (a: { event: string }) => a.event === "LogAccountCreated"
    );
    return await ethers.getContractAt(
      await getVersionAbi(version),
      event.args.account
    );
  }

  it("should check state", async function () {
    expect(await layerList.layerIndex()).to.be.equal(layerIndex.address);
    accounts = await layerList.accounts();
    expect(accounts.toString()).to.be.equal(new BigNumber(0).toString());
  });

  it("should add v2 module to index", async function () {
    const tx = await layerIndex
      .connect(masterSigner)
      .addNewAccount(
        layerDefaultAccountV2.address,
        layerConnectors.address,
        addr_zero
      );
    let txDetails = await tx.wait();
    expect(!!txDetails.status).to.be.true;
  });

  it("Should build DSAs", async () => {
    dsaWalletv1 = await buildDSA(wallet0.address, 2);
    expect(!!dsaWalletv1.address).to.be.true;
    walletv1 = await ethers.getSigner(dsaWalletv1.address);
    dsaWalletv2 = await buildDSA(wallet0.address, 2);
    expect(!!dsaWalletv2.address).to.be.true;
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [walletv1.address],
    });
    dsaV1 = ethers.provider.getSigner(walletv1.address);
    walletv2 = await ethers.getSigner(dsaWalletv2.address);
    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [walletv2.address],
    });
    dsaV2 = ethers.provider.getSigner(walletv2.address);

    dsaWalletv0 = await buildDSA(wallet1.address, 2);
    expect(!!dsaWalletv0.address).to.be.true;
  });

  it("Should set balances", async () => {
    await wallet0.sendTransaction({
      to: dsaWalletv1.address,
      value: ethers.utils.parseEther("10"),
    });
    await wallet0.sendTransaction({
      to: dsaWalletv2.address,
      value: ethers.utils.parseEther("10"),
    });

    await hre.network.provider.send("hardhat_setBalance", [
      walletv1.address,
      ethers.utils.parseEther("10").toHexString(),
    ]);
    await hre.network.provider.send("hardhat_setBalance", [
      walletv2.address,
      ethers.utils.parseEther("10").toHexString(),
    ]);
  });

  describe("List init", function () {
    it("should have accounts added on build", async function () {
      accounts = await layerList.accounts();
      expect(accounts.toString()).to.be.equal(new BigNumber(3).toString());
      expect(await layerList.accountID(dsaWalletv1.address)).to.be.equal(
        new BigNumber(1).toString()
      );
      expect(await layerList.accountID(dsaWalletv2.address)).to.be.equal(
        new BigNumber(2).toString()
      );
      expect(
        await layerList.accountAddr(new BigNumber(1).toString())
      ).to.be.equal(dsaWalletv1.address);
      expect(
        await layerList.accountAddr(new BigNumber(2).toString())
      ).to.be.equal(dsaWalletv2.address);
    });

    it("should revert on list init with non-index sender", async function () {
      await expect(
        layerList.connect(signer).init(wallet1.address)
      ).to.be.revertedWith("not-index");
      await expect(
        layerList.connect(signer).init(dsaWalletv1.address)
      ).to.be.revertedWith("not-index");
    });
  });

  describe("DSA Auths", async function () {
    it("should revert on adding auth to non-dsa i.e sender is EOA", async function () {
      await expect(
        layerList.connect(wallet1).addAuth(wallet0.address)
      ).to.be.revertedWith("not-account");
    });

    it("should revert on adding non-owner account as auth: must be enabled via DSA first", async function () {
      expect(await dsaWalletv1.isAuth(wallet1.address)).to.be.false;
      await expect(
        layerList.connect(dsaV1).addAuth(wallet1.address)
      ).to.be.revertedWith("not-owner");
    });
  });

  describe("Enable/Disable and add/remove auths", function () {
    let userList1: any,
      userLink1: any,
      userList2: any,
      userLink2: any,
      accountLink1: any,
      accountList1: any,
      accountLink2: any,
      accountList2: any,
      dsaV1Id: any,
      dsaV2Id: any;
    // addAccount
    // if (userLink[_owner].first == 0) ---> covered with buildDSA v1
    // if (userLink[_owner].last != 0) ---> covered with buildDSA v2

    // addUser
    // if (accountLink[_account].first == address(0)) ---> covered with buildDSA v1,v2
    // if (accountLink[_account].last != address(0)) ---> cover with enabling wallet1 to dsaWalletv1

    it("should check previous user lists and links", async function () {
      dsaV1Id = await layerList.accountID(dsaWalletv1.address);
      dsaV2Id = await layerList.accountID(dsaWalletv2.address);
      userList1 = await layerList.userList(wallet0.address, dsaV1Id);
      userList2 = await layerList.userList(wallet0.address, dsaV2Id);
      userLink1 = await layerList.userLink(wallet0.address);
      userLink2 = await layerList.userLink(wallet1.address);
      expect(userLink1.first).to.be.equal(dsaV1Id);
      expect(userLink1.last).to.be.equal(dsaV2Id);
      expect(userLink1.count).to.be.equal(new BigNumber(2).toString());
      expect(userLink2.first).to.be.equal(new BigNumber(3).toString());
      expect(userLink2.last).to.be.equal(new BigNumber(3).toString());
      expect(userLink2.count).to.be.equal(new BigNumber(1).toString());
      expect(userList1.prev).to.be.equal(new BigNumber(0).toString());
      expect(userList1.next).to.be.equal(dsaV2Id);
      expect(userList2.prev).to.be.equal(dsaV1Id);
      expect(userList2.next).to.be.equal(new BigNumber(0).toString());
    });

    it("should check previous account lists and links", async function () {
      accountList1 = await layerList.accountList(dsaV1Id, wallet0.address);
      accountList2 = await layerList.accountList(dsaV2Id, wallet0.address);
      accountLink1 = await layerList.accountLink(dsaV1Id);
      accountLink2 = await layerList.accountLink(dsaV2Id);
      expect(accountLink1.first).to.be.equal(wallet0.address);
      expect(accountLink1.last).to.be.equal(wallet0.address);
      expect(accountLink1.count).to.be.equal(new BigNumber(1).toString());
      expect(accountLink2.first).to.be.equal(wallet0.address);
      expect(accountLink2.last).to.be.equal(wallet0.address);
      expect(accountLink2.count).to.be.equal(new BigNumber(1).toString());
      expect(accountList1.prev).to.be.equal(addr_zero);
      expect(accountList1.next).to.be.equal(addr_zero);
      expect(accountList2.prev).to.be.equal(addr_zero);
      expect(accountList2.next).to.be.equal(addr_zero);
    });

    it("should enable the EOA as owner via DSA and add auth", async function () {
      expect(await dsaWalletv1.isAuth(wallet1.address)).to.be.false;
      //tests for layerAccount.enable in v1 tests
      let tx = await dsaWalletv1.connect(dsaV1).enable(wallet1.address);
      let txDetails = await tx.wait();
      expect(!!txDetails.status).to.be.true;
      expectEvent(
        txDetails,
        (await deployments.getArtifact("LayerDefaultImplementation")).abi,
        "LogEnableUser",
        {
          user: wallet1.address,
        }
      );
    });

    it("should build dsa with wallet1 as auth", async function () {
      dsaWalletv3 = await buildDSA(wallet1.address, 2);
      expect(!!dsaWalletv3.address).to.be.true;
    });

    it("should have updated user lists and links", async function () {
      userList1 = await layerList.userList(wallet0.address, dsaV1Id);
      userList2 = await layerList.userList(wallet0.address, dsaV2Id);
      userLink1 = await layerList.userLink(wallet0.address);
      userLink2 = await layerList.userLink(wallet1.address);
      expect(userLink1.first).to.be.equal(dsaV1Id);
      expect(userLink1.last).to.be.equal(dsaV2Id);
      expect(userLink1.count).to.be.equal(new BigNumber(2).toString());
      expect(userLink2.first).to.be.equal("3");
      expect(userLink2.last).to.be.equal("4");
      expect(userLink2.count).to.be.equal(new BigNumber(3).toString());
      expect(userList1.prev).to.be.equal(new BigNumber(0).toString());
      expect(userList1.next).to.be.equal(dsaV2Id);
      expect(userList2.prev).to.be.equal(dsaV1Id);
      expect(userList2.next).to.be.equal(new BigNumber(0).toString());
      userList1 = await layerList.userList(wallet1.address, dsaV1Id);
      expect(userList1.prev).to.be.equal(new BigNumber("3").toString());
      expect(userList1.next).to.be.equal(new BigNumber("4").toString());
      userList1 = await layerList.userList(wallet0.address, dsaV1Id);
      expect(userList1.prev).to.be.equal(new BigNumber(0).toString());
      expect(userList1.next).to.be.equal(new BigNumber(2).toString());
    });

    it("should have updated account lists and links", async function () {
      accountList1 = await layerList.accountList(dsaV1Id, wallet0.address);
      accountList2 = await layerList.accountList(dsaV2Id, wallet0.address);
      accountLink1 = await layerList.accountLink(dsaV1Id);
      accountLink2 = await layerList.accountLink(dsaV2Id);
      expect(accountLink1.first).to.be.equal(wallet0.address);
      expect(accountLink1.last).to.be.equal(wallet1.address);
      expect(accountLink1.count).to.be.equal(new BigNumber(2).toString());
      expect(accountLink2.first).to.be.equal(wallet0.address);
      expect(accountLink2.last).to.be.equal(wallet0.address);
      expect(accountLink2.count).to.be.equal(new BigNumber(1).toString());
      expect(accountList1.prev).to.be.equal(addr_zero);
      expect(accountList1.next).to.be.equal(wallet1.address);
      expect(accountList2.prev).to.be.equal(addr_zero);
      expect(accountList2.next).to.be.equal(addr_zero);
      accountList1 = await layerList.accountList(dsaV1Id, wallet1.address);
      expect(accountList1.prev).to.be.equal(wallet0.address);
      expect(accountList1.next).to.be.equal(addr_zero);
    });

    it("should revert disabling auth if not been removed from _auth mapping of account", async function () {
      expect(await dsaWalletv1.isAuth(wallet1.address)).to.be.true;
      await expect(
        layerList.connect(dsaV1).removeAuth(wallet1.address)
      ).to.be.revertedWith("already-owner");
    });

    it("should enable a DSA as owner of DSA and add auth", async function () {
      expect(await dsaWalletv1.isAuth(dsaWalletv2.address)).to.be.false;
      //tests for layerAccount.enable in v1 tests
      let tx = await dsaWalletv1.connect(dsaV1).enable(dsaWalletv2.address);
      let txDetails = await tx.wait();
      expect(!!txDetails.status).to.be.true;
      expectEvent(
        txDetails,
        (await deployments.getArtifact("LayerDefaultImplementation")).abi,
        "LogEnableUser",
        {
          user: dsaWalletv2.address,
        }
      );
    });

    it("should have updated user lists and links", async function () {
      userList1 = await layerList.userList(wallet0.address, dsaV1Id);
      userList2 = await layerList.userList(wallet0.address, dsaV2Id);
      userLink1 = await layerList.userLink(wallet0.address);
      userLink2 = await layerList.userLink(wallet1.address);
      expect(userLink1.first).to.be.equal(dsaV1Id);
      expect(userLink1.last).to.be.equal(dsaV2Id);
      expect(userLink1.count).to.be.equal(new BigNumber(2).toString());
      expect(userLink2.first).to.be.equal("3");
      expect(userLink2.last).to.be.equal("4");
      expect(userLink2.count).to.be.equal(new BigNumber(3).toString());
      expect(userList1.prev).to.be.equal(new BigNumber(0).toString());
      expect(userList1.next).to.be.equal(dsaV2Id);
      expect(userList2.prev).to.be.equal(dsaV1Id);
      expect(userList2.next).to.be.equal(new BigNumber(0).toString());
      userList1 = await layerList.userList(wallet1.address, dsaV1Id);
      expect(userList1.prev).to.be.equal(new BigNumber("3").toString());
      expect(userList1.next).to.be.equal(new BigNumber("4").toString());
      userList1 = await layerList.userList(dsaWalletv2.address, dsaV1Id);
      expect(userList1.prev).to.be.equal(new BigNumber(0).toString());
      expect(userList1.next).to.be.equal(new BigNumber(0).toString());
      userLink1 = await layerList.userLink(dsaWalletv2.address);
      expect(userLink1.first).to.be.equal(dsaV1Id);
      expect(userLink1.last).to.be.equal(dsaV1Id);
      expect(userLink1.count).to.be.equal(new BigNumber(1).toString());
    });

    it("should have updated account lists and links", async function () {
      accountList1 = await layerList.accountList(dsaV1Id, wallet0.address);
      accountList2 = await layerList.accountList(dsaV2Id, wallet0.address);
      accountLink1 = await layerList.accountLink(dsaV1Id);
      accountLink2 = await layerList.accountLink(dsaV2Id);
      expect(accountLink1.first).to.be.equal(wallet0.address);
      expect(accountLink1.last).to.be.equal(dsaWalletv2.address);
      expect(accountLink1.count).to.be.equal(new BigNumber(3).toString());
      expect(accountLink2.first).to.be.equal(wallet0.address);
      expect(accountLink2.last).to.be.equal(wallet0.address);
      expect(accountLink2.count).to.be.equal(new BigNumber(1).toString());
      expect(accountList1.prev).to.be.equal(addr_zero);
      expect(accountList1.next).to.be.equal(wallet1.address);
      expect(accountList2.prev).to.be.equal(addr_zero);
      expect(accountList2.next).to.be.equal(addr_zero);
      accountList1 = await layerList.accountList(dsaV1Id, wallet1.address);
      expect(accountList1.prev).to.be.equal(wallet0.address);
      expect(accountList1.next).to.be.equal(dsaWalletv2.address);
      accountList1 = await layerList.accountList(dsaV1Id, dsaWalletv2.address);
      expect(accountList1.prev).to.be.equal(wallet1.address);
      expect(accountList1.next).to.be.equal(addr_zero);
    });

    it("should disable the EOA as owner via DSA and add auth", async function () {
      expect(await dsaWalletv1.isAuth(wallet1.address)).to.be.true;
      let tx = await dsaWalletv1.connect(dsaV1).disable(wallet1.address);
      let txDetails = await tx.wait();
      expect(!!txDetails.status).to.be.true;
      expectEvent(
        txDetails,
        (await deployments.getArtifact("LayerDefaultImplementation")).abi,
        "LogDisableUser",
        {
          user: wallet1.address,
        }
      );
      expect(await dsaWalletv1.isAuth(wallet1.address)).to.be.false;
    });

    it("should check the user lists and links", async function () {
      userList1 = await layerList.userList(wallet0.address, dsaV1Id);
      userList2 = await layerList.userList(wallet0.address, dsaV2Id);
      userLink1 = await layerList.userLink(wallet0.address);
      userLink2 = await layerList.userLink(wallet1.address);
      expect(userLink1.first).to.be.equal(dsaV1Id);
      expect(userLink1.last).to.be.equal(dsaV2Id);
      expect(userLink1.count).to.be.equal(new BigNumber(2).toString());
      expect(userLink2.first).to.be.equal("3");
      expect(userLink2.last).to.be.equal("4");
      expect(userLink2.count).to.be.equal(new BigNumber(2).toString());
      expect(userList1.prev).to.be.equal(new BigNumber(0).toString());
      expect(userList1.next).to.be.equal(dsaV2Id);
      expect(userList2.prev).to.be.equal(dsaV1Id);
      expect(userList2.next).to.be.equal(new BigNumber(0).toString());
      userList1 = await layerList.userList(wallet1.address, dsaV1Id);
      expect(userList1.prev).to.be.equal(new BigNumber(0).toString());
      expect(userList1.next).to.be.equal(new BigNumber(0).toString());
      userList1 = await layerList.userList(dsaWalletv2.address, dsaV1Id);
      expect(userList1.prev).to.be.equal(new BigNumber(0).toString());
      expect(userList1.next).to.be.equal(new BigNumber(0).toString());
      userLink1 = await layerList.userLink(dsaWalletv2.address);
      expect(userLink1.first).to.be.equal(dsaV1Id);
      expect(userLink1.last).to.be.equal(dsaV1Id);
      expect(userLink1.count).to.be.equal(new BigNumber(1).toString());
    });

    it("should have updated account lists and links", async function () {
      accountList1 = await layerList.accountList(dsaV1Id, wallet0.address);
      accountList2 = await layerList.accountList(dsaV2Id, wallet0.address);
      accountLink1 = await layerList.accountLink(dsaV1Id);
      accountLink2 = await layerList.accountLink(dsaV2Id);
      expect(accountLink1.first).to.be.equal(wallet0.address);
      expect(accountLink1.last).to.be.equal(dsaWalletv2.address);
      expect(accountLink1.count).to.be.equal(new BigNumber(2).toString());
      expect(accountLink2.first).to.be.equal(wallet0.address);
      expect(accountLink2.last).to.be.equal(wallet0.address);
      expect(accountLink2.count).to.be.equal(new BigNumber(1).toString());
      expect(accountList1.prev).to.be.equal(addr_zero);
      expect(accountList1.next).to.be.equal(dsaWalletv2.address);
      expect(accountList2.prev).to.be.equal(addr_zero);
      expect(accountList2.next).to.be.equal(addr_zero);
      accountList1 = await layerList.accountList(dsaV1Id, dsaWalletv2.address);
      expect(accountList1.prev).to.be.equal(wallet0.address);
      expect(accountList1.next).to.be.equal(addr_zero);
    });

    it("should disable wallet0 as auth", async function () {
      expect(await dsaWalletv1.isAuth(wallet0.address)).to.be.true;
      let tx = await dsaWalletv1.connect(dsaV1).disable(wallet0.address);
      let txDetails = await tx.wait();
      expect(!!txDetails.status).to.be.true;
      expectEvent(
        txDetails,
        (await deployments.getArtifact("LayerDefaultImplementation")).abi,
        "LogDisableUser",
        {
          user: wallet0.address,
        }
      );
      expect(await dsaWalletv1.isAuth(wallet0.address)).to.be.false;
    });

    it("should enable wallet0 as owner of DSA and add auth", async function () {
      expect(await dsaWalletv1.isAuth(wallet0.address)).to.be.false;
      let tx = await dsaWalletv1.connect(dsaV1).enable(wallet0.address);
      let txDetails = await tx.wait();
      expect(!!txDetails.status).to.be.true;
      expectEvent(
        txDetails,
        (await deployments.getArtifact("LayerDefaultImplementation")).abi,
        "LogEnableUser",
        {
          user: wallet0.address,
        }
      );
    });

    it("should disable wallet0 as auth", async function () {
      expect(await dsaWalletv1.isAuth(wallet0.address)).to.be.true;
      let tx = await dsaWalletv1.connect(dsaV1).disable(wallet0.address);
      let txDetails = await tx.wait();
      expect(!!txDetails.status).to.be.true;
      expectEvent(
        txDetails,
        (await deployments.getArtifact("LayerDefaultImplementation")).abi,
        "LogDisableUser",
        {
          user: wallet0.address,
        }
      );
      expect(await dsaWalletv1.isAuth(wallet0.address)).to.be.false;
    });

    it("should revert disabling if sender is not DSA", async function () {
      await expect(
        layerList.connect(signer).removeAuth(wallet1.address)
      ).to.be.revertedWith("not-account");
    });
  });
});
