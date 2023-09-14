import { expect } from "chai";
import hre from "hardhat";
import { ethers } from "hardhat";
const { web3, deployments, waffle } = hre;
const { provider, deployContract } = waffle;

import expectEvent from "../scripts/expectEvent";
import layerDeployContract from "../scripts/deployContract";
import abis from "../scripts/constant/abis";

import { Contract, Signer } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { Address } from "hardhat-deploy/dist/types";
import BigNumber from "bignumber.js";

import deployConnector from "../scripts/deployConnector";

import {
  ConnectV2Auth__factory,
  LayerDefaultImplementationV2__factory,
  ConnectV2EmitEvent__factory,
  NFTTest__factory,
  TokenTest__factory,
} from "../typechain";
import addresses from "../scripts/constant/addresses";
import encodeSpells from "../scripts/encodeSpells";
import { Contracts } from "@openzeppelin/upgrades";
import deployContracts from "../scripts/deployContracts";
import getMasterSigner from "../scripts/getMasterSigner";
import { encode } from "punycode";

describe("LayerAccount V2", function () {
  let masterSigner: Signer,
    chief1: Signer,
    chief2: Signer,
    ichief1: SignerWithAddress,
    ichief2: SignerWithAddress;

  let dsaWallet1: Contract,
    dsaWallet2: Contract,
    dsaWallet3: Contract,
    dsaWallet4: Contract,
    dsaWallet0: Contract,
    dsa1: Signer,
    dsa2: Signer,
    walletv20: any,
    walletv21: any;

  let deployer: SignerWithAddress, signer: SignerWithAddress;
  let masterAddress: Address;
  let setBasicsArgs: any;

  let layerAuthV2: Contract, layerEventV2: Contract;

  let layerIndex: Contract,
    layerList: Contract,
    layerAccount: Contract,
    layerConnectorsTest: Contract,
    layerConnectorsV2: Contract,
    layerConnectorsV2Test: Contract,
    implementationsMapping: Contract,
    layerAccountV2Proxy: Contract,
    layerAccountV2ImplM1: Contract,
    layerAccountV2ImplM2: Contract,
    layerAccountV2ImplM0: Contract,
    layerAccountV2DefaultImpl: Contract,
    layerAccountV2DefaultImplV2: Contract;

  const addr_zero = ethers.constants.AddressZero;
  const maxValue = ethers.constants.MaxUint256;
  const ethAddr = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";
  const daiAddr = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const usdcAddr = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";

  const wallets = provider.getWallets();
  let [wallet0, wallet1, wallet2, wallet3] = wallets;

  //implementations' sigs
  const layerAccountV2DefaultImplSigs = [
    "implementationVersion()",
    "layerIndex()",
    "version()",
    "isAuth(address)",
    "isBeta()",
    "enable",
    "disable",
    "toggleBeta()",
    "onERC721Received(address,address,uint256,bytes)",
    "onERC1155Received(address,address,uint256,uint256,bytes)",
    "onERC1155BatchReceived(address,address,uint256[],uint256[],bytes)",
  ].map((a) => web3.utils.keccak256(a).slice(0, 10));

  const layerAccountV2DefaultImplV2Sigs = [
    "isAuth(address)",
    "switchShield(bool)",
    "editCheckMapping(address,bool)",
    "enable",
    "disable",
    "shield()",
    "receiveEther()",
  ].map((a) => web3.utils.keccak256(a).slice(0, 10));

  const layerAccountV2ImplM1Sigs = [
    "connectorsM1()",
    "cast(string[],bytes[],address)",
  ].map((a) => web3.utils.keccak256(a).slice(0, 10));

  const layerAccountV2ImplM2Sigs = [
    "connectorsM2()",
    "castWithFlashloan(string[],bytes[],address)",
  ].map((a) => web3.utils.keccak256(a).slice(0, 10));

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
    [deployer, signer, ichief1, ichief2] = await ethers.getSigners();
    const deployerAddress = deployer.address;
    masterAddress = deployerAddress;

    layerIndex = await layerDeployContract("LayerIndex", []);
    layerList = await layerDeployContract("LayerList", [layerIndex.address]);
    layerAccount = await layerDeployContract("LayerAccount", [
      layerIndex.address,
    ]);
    layerConnectorsTest = await layerDeployContract("LayerConnectorsTest", [
      layerIndex.address,
    ]);

    layerConnectorsV2Test = await layerDeployContract("LayerConnectorsV2Test", [
      layerIndex.address,
    ]);

    layerConnectorsV2 = await layerDeployContract("LayerConnectorsV2", [
      layerIndex.address,
    ]);

    implementationsMapping = await layerDeployContract("LayerImplementations", [
      layerIndex.address,
    ]);
    layerAccountV2Proxy = await layerDeployContract("LayerAccountV2", [
      implementationsMapping.address,
    ]);
    layerAccountV2DefaultImpl = await layerDeployContract(
      "LayerDefaultImplementation",
      [layerIndex.address]
    );
    layerAccountV2ImplM1 = await layerDeployContract("LayerImplementationM1", [
      layerIndex.address,
      layerConnectorsV2Test.address,
    ]);
    layerAccountV2ImplM2 = await layerDeployContract("LayerImplementationM2", [
      layerIndex.address,
      layerConnectorsV2.address,
    ]);

    layerAccountV2ImplM0 = await layerDeployContract(
      "LayerImplementationM0Test",
      [layerIndex.address]
    );

    setBasicsArgs = [
      deployerAddress,
      layerList.address,
      layerAccount.address,
      layerConnectorsTest.address,
    ];

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [masterAddress],
    });

    masterSigner = ethers.provider.getSigner(masterAddress);

    layerAccountV2DefaultImplV2 = await layerDeployContract(
      "LayerDefaultImplementationV2",
      []
    );

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [ichief1.address],
    });

    chief1 = ethers.provider.getSigner(ichief1.address);

    await hre.network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [ichief2.address],
    });

    chief2 = ethers.provider.getSigner(ichief2.address);
  });

  async function buildDSAv2(owner: any, abi: any) {
    const tx = await layerIndex.build(owner, 2, owner);
    const receipt = await tx.wait();
    const event = receipt.events.find(
      (a: { event: string }) => a.event === "LogAccountCreated"
    );
    return await ethers.getContractAt(abi, event.args.account);
  }

  it("should have the contracts deployed", async function () {
    expect(!!layerConnectorsV2.address).to.be.true;
    expect(!!implementationsMapping.address).to.be.true;
    expect(!!layerAccountV2DefaultImpl.address).to.be.true;
    expect(!!layerAccountV2DefaultImplV2.address).to.be.true;
    expect(!!layerAccountV2Proxy.address).to.be.true;
    expect(!!layerAccountV2ImplM1.address).to.be.true;
    expect(!!layerAccountV2ImplM2.address).to.be.true;
  });

  it("should set the basics", async function () {
    const tx = await layerIndex.setBasics(...setBasicsArgs);
    const txDetails = await tx.wait();
    expect(!!txDetails.status).to.be.true;
  });

  describe("Account Proxy ", function () {
    it("should revert if no method not found in implementation and no default implementation added", async function () {
      await expect(
        layerIndex
          .connect(masterSigner)
          .addNewAccount(
            layerAccountV2Proxy.address,
            layerConnectorsV2.address,
            addr_zero
          )
      ).to.be.revertedWith("LayerAccountV2: No implementation found for the given signature");
    });

    it("should send ether", async function () {
      const txn = await signer.sendTransaction({
        to: layerAccountV2Proxy.address,
        value: ethers.utils.parseEther("2"),
      });
      expect(!!(await txn.wait()).status).to.be.true;
    });

    it("should add ImplementationM1 to mappings", async function () {
      let tx = await implementationsMapping
        .connect(masterSigner)
        .addImplementation(
          layerAccountV2ImplM1.address,
          layerAccountV2ImplM1Sigs
        );
      let txDetails = await tx.wait();
      expect(!!txDetails.status).to.be.true;

      expect(txDetails.events[0].event).to.be.equal("LogAddImplementation");
      expect(txDetails.events[0].args.implementation).to.be.equal(
        layerAccountV2ImplM1.address
      );
      txDetails.events[0].args.sigs.forEach((a: any, i: string | number) => {
        expect(a).to.be.equal(layerAccountV2ImplM1Sigs[i]);
      });

      tx = await implementationsMapping
        .connect(masterSigner)
        .setDefaultImplementation(layerAccountV2DefaultImpl.address);
      await tx.wait();
    });
  });

  describe("Setup", function () {
    it("should add AccountV2 to index registry", async function () {
      let tx = await layerIndex
        .connect(masterSigner)
        .addNewAccount(
          layerAccountV2Proxy.address,
          layerConnectorsV2Test.address,
          addr_zero
        );
      let txDetails = await tx.wait();

      expect(await layerIndex.account(2)).to.be.equal(
        layerAccountV2Proxy.address
      );
    });

    it("Should build DSAs", async () => {
      //builds DSA and adds wallet0 as auth
      dsaWallet0 = await buildDSAv2(
        wallet0.address,
        (
          await deployments.getArtifact("LayerImplementationM0Test")
        ).abi
      );
      expect(!!dsaWallet0.address).to.be.true;

      walletv20 = await ethers.getSigner(dsaWallet0.address);
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [walletv20.address],
      });
      dsa1 = ethers.provider.getSigner(walletv20.address);

      let defaultM1abi = (
        await deployments.getArtifact("LayerDefaultImplementation")
      ).abi;

      dsaWallet1 = await ethers.getContractAt(defaultM1abi, dsaWallet0.address);
      expect(!!dsaWallet1.address).to.be.true;

      const tx = await layerIndex.build(wallet1.address, 1, wallet1.address);
      const receipt = await tx.wait();
      const event = receipt.events.find(
        (a: { event: string }) => a.event === "LogAccountCreated"
      );
      dsaWallet2 = await ethers.getContractAt(
        (
          await deployments.getArtifact("LayerAccount")
        ).abi,
        event.args.account
      );
      expect(!!dsaWallet2.address).to.be.true;

      dsaWallet3 = await ethers.getContractAt(
        (
          await deployments.getArtifact("LayerImplementationM1")
        ).abi,
        dsaWallet0.address
      );

      expect(!!dsaWallet3.address).to.be.true;
    });

    it("Should set balances", async () => {
      await wallet3.sendTransaction({
        to: dsaWallet0.address,
        value: ethers.utils.parseEther("10"),
      });

      await wallet3.sendTransaction({
        to: dsaWallet1.address,
        value: ethers.utils.parseEther("10"),
      });
      await wallet3.sendTransaction({
        to: dsaWallet2.address,
        value: ethers.utils.parseEther("10"),
      });
      await wallet3.sendTransaction({
        to: dsaWallet3.address,
        value: ethers.utils.parseEther("10"),
      });
    });

    it("should send ether with method call | AccountProxy: receive()", async function () {
      const txn = await layerAccountV2ImplM0
        .connect(signer)
        .handlePayment(layerAccountV2Proxy.address, {
          value: ethers.utils.parseEther("2"),
        });
      expect(!!(await txn.wait()).status).to.be.true;

      expectEvent(
        await txn.wait(),
        (await deployments.getArtifact("LayerImplementationM0Test")).abi,
        "LogPayEther",
        {
          amt: ethers.utils.parseEther("2"),
        }
      );
    });
  });

  describe("Default Implementation ERC tests", function () {
    let nft: Contract;
    it("should deploy ERC721 token and mint", async function () {
      nft = await deployContract(signer, NFTTest__factory, []);
      expect(!!nft.address).to.be.true;
    });

    it("should transfer ERC721 to dsaWallet", async function () {
      let tx = await nft.connect(signer).transferNFT(dsaWallet3.address);
      expect(!!(await tx.wait())).to.be.true;
      expect(await nft.balanceOf(dsaWallet3.address)).to.be.equal("1");

      expectEvent(
        await tx.wait(),
        (await deployments.getArtifact("NFTTest")).abi,
        "LogTransferERC721",
        {
          from: signer.address,
          to: dsaWallet3.address,
          tokenId: "1",
        }
      );
    });

    it("should deploy ERC721 token and mint", async function () {
      nft = await deployContract(signer, TokenTest__factory, []);
      expect(!!nft.address).to.be.true;
    });

    it("should transfer ERC1155 to dsaWallet", async function () {
      let tx = await nft.connect(signer).transfer1155(dsaWallet3.address, 0, 1);
      expect(!!(await tx.wait())).to.be.true;
      expect(await nft.balanceOf(dsaWallet3.address, 0)).to.be.equal("1");

      expectEvent(
        await tx.wait(),
        (await deployments.getArtifact("TokenTest")).abi,
        "LogTransferERC1155",
        {
          from: signer.address,
          to: dsaWallet3.address,
          tokenId: "0",
          amount: "1",
        }
      );
    });

    it("should transfer ERC1155 batch to dsaWallet", async function () {
      let tx = await nft
        .connect(signer)
        .transferBatch1155(
          dsaWallet3.address,
          ["0", "1"],
          ["1", ethers.utils.parseEther("2").toString()]
        );
      expect(!!(await tx.wait())).to.be.true;

      let balance = await nft.balanceOfBatch(
        [dsaWallet3.address, dsaWallet3.address],
        [0, 1]
      );
      expect(balance[0]).to.be.equal("2");
      expect(balance[1]).to.be.equal(
        new BigNumber(2).multipliedBy(1e18).toString()
      );

      expectEvent(
        await tx.wait(),
        (await deployments.getArtifact("TokenTest")).abi,
        "LogTransferBatchERC1155",
        {
          from: signer.address,
          to: dsaWallet3.address,
        }
      );
    });
  });

  describe("Cast", function () {
    it("should revert casting spell for not enabled connector", async function () {
      await expect(
        dsaWallet3.connect(wallet0).cast(["authV2"], ["0x"], wallet0.address)
      ).to.be.revertedWith("target-invalid");

      await expect(
        dsaWallet2.connect(wallet1).cast([addr_zero], ["0x"], wallet1.address)
      ).to.be.revertedWith("target-invalid");
    });
  });
});
