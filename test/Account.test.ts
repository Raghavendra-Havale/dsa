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
  ConnectAuth__factory,
  LayerDefaultImplementation2__factory,
  ConnectEmitEvent__factory,
  NFTTest__factory,
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

  let layerAuth: Contract, layerEvent: Contract;

  let layerIndex: Contract,
    layerList: Contract,
    layerConnectors: Contract,
    implementationsMapping: Contract,
    layerAccountProxy: Contract,
    layerAccountV2ImplM1: Contract,
    layerAccountV2ImplM2: Contract,
    layerAccountV2ImplM0: Contract,
    layerAccountV2DefaultImpl: Contract,
    layerAccount2DefaultImpl2: Contract;

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

  const layerAccount2DefaultImpl2Sigs = [
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

    layerConnectors = await layerDeployContract("LayerConnectors", [
      layerIndex.address,
    ]);
    implementationsMapping = await layerDeployContract("LayerImplementations", [
      layerIndex.address,
    ]);
    layerAccountProxy = await layerDeployContract("LayerAccount", [
      implementationsMapping.address,
    ]);
    layerAccountV2DefaultImpl = await layerDeployContract(
      "LayerDefaultImplementation",
      [layerIndex.address]
    );
    layerAccountV2ImplM1 = await layerDeployContract("LayerImplementationM1", [
      layerIndex.address,
      layerConnectors.address,
    ]);
    layerAccountV2ImplM2 = await layerDeployContract("LayerImplementationM2", [
      layerIndex.address,
      layerConnectors.address,
    ]);

    layerAccountV2ImplM0 = await layerDeployContract(
      "LayerImplementationM0Test",
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

    layerAccount2DefaultImpl2 = await layerDeployContract(
      "LayerDefaultImplementation2",
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
    expect(!!layerConnectors.address).to.be.true;
    expect(!!implementationsMapping.address).to.be.true;
    expect(!!layerAccountV2DefaultImpl.address).to.be.true;
    expect(!!layerAccount2DefaultImpl2.address).to.be.true;
    expect(!!layerAccountProxy.address).to.be.true;
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
            layerAccountProxy.address,
            layerConnectors.address,
            addr_zero
          )
      ).to.be.revertedWith("LayerAccountV2: No implementation found for the given signature");
    });

    it("should send ether", async function () {
      const txn = await signer.sendTransaction({
        to: layerAccountProxy.address,
        value: ethers.utils.parseEther("2"),
      });
      expect(!!(await txn.wait()).status).to.be.true;
    });
  });

  describe("Implementations Registry", function () {
    it("should check states", async function () {
      expect(await implementationsMapping.layerIndex()).to.be.equal(
        layerIndex.address
      );
      expect(await implementationsMapping.defaultImplementation()).to.be.equal(
        addr_zero
      );
      expect(await layerAccountProxy.implementations()).to.be.eq(
        implementationsMapping.address
      );
      expect(await layerAccountV2DefaultImpl.layerIndex()).to.be.eq(
        layerIndex.address
      );
      expect(await layerAccountV2DefaultImpl.isAuth(wallet0.address)).to.be
        .false;
      expect(await layerAccountV2ImplM1.connectorsM1()).to.be.eq(
        layerConnectors.address
      );
    });

    it("should revert setting default implementation via non-master", async function () {
      await expect(
        implementationsMapping
          .connect(signer)
          .setDefaultImplementation(layerAccountV2DefaultImpl.address)
      ).to.be.revertedWith("Implementations: not-master");
    });

    it("should revert setting default implementation to zero-address", async function () {
      await expect(
        implementationsMapping
          .connect(masterSigner)
          .setDefaultImplementation(addr_zero)
      ).to.be.revertedWith(
        "Implementations: _defaultImplementation address not valid"
      );
    });

    it("should set default implementation", async function () {
      let tx = await implementationsMapping
        .connect(masterSigner)
        .setDefaultImplementation(layerAccountV2DefaultImpl.address);
      let txDetails = await tx.wait();
      expect(!!txDetails.status).to.be.true;

      expectEvent(
        txDetails,
        (await deployments.getArtifact("LayerImplementations")).abi,
        "LogSetDefaultImplementation",
        {
          oldImplementation: addr_zero,
          newImplementation: layerAccountV2DefaultImpl.address,
        }
      );

      expect(await implementationsMapping.defaultImplementation()).to.be.equal(
        layerAccountV2DefaultImpl.address
      );
    });

    it("should revert adding same default implementation", async function () {
      await expect(
        implementationsMapping
          .connect(masterSigner)
          .setDefaultImplementation(layerAccountV2DefaultImpl.address)
      ).to.be.revertedWith(
        "Implementations: _defaultImplementation cannot be same"
      );
    });

    it("should revert adding implementation with invalid address", async function () {
      await expect(
        implementationsMapping
          .connect(masterSigner)
          .addImplementation(addr_zero, layerAccountV2ImplM1Sigs)
      ).to.be.revertedWith("Implementations: _implementation not valid.");
    });

    it("should revert if non-master account adds implementation", async function () {
      await expect(
        implementationsMapping
          .connect(signer)
          .addImplementation(
            layerAccountV2ImplM1.address,
            layerAccountV2ImplM1Sigs
          )
      ).to.be.revertedWith("Implementations: not-master");
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
    });

    it("should revert re-adding ImplementationM1 to mappings", async function () {
      await expect(
        implementationsMapping
          .connect(masterSigner)
          .addImplementation(
            layerAccountV2ImplM1.address,
            layerAccountV2ImplM1Sigs
          )
      ).to.be.revertedWith("Implementations: _implementation already added.");
    });

    it("should get the sigs for ImplementationM1", async function () {
      (
        await implementationsMapping.getImplementationSigs(
          layerAccountV2ImplM1.address
        )
      ).forEach((a: any, i: string | number) => {
        expect(a).to.be.equal(layerAccountV2ImplM1Sigs[i]);
      });
    });

    it("should get the implementation address for the sigs", async function () {
      for (let i = 0; i < implementationsMapping.length; i++) {
        expect(
          await implementationsMapping.getSigImplementation(
            implementationsMapping[i]
          )
        ).to.be.equal(layerAccountV2ImplM1.address);
      }
    });

    it("should give default implementation address", async function () {
      expect(
        await implementationsMapping.getImplementation(
          layerAccountV2DefaultImplSigs[1]
        )
      ).to.be.equal(layerAccountV2DefaultImpl.address);
      expect(
        await implementationsMapping.getImplementation(
          layerAccountV2ImplM1Sigs[1]
        )
      ).to.be.equal(layerAccountV2ImplM1.address);
      expect(
        await implementationsMapping.getSigImplementation(
          layerAccountV2DefaultImplSigs[1]
        )
      ).to.be.equal(addr_zero);
    });

    it("should revert adding implementations with atleast one same function", async function () {
      let test_sigs = ["connectorssM2()", "cast(string[],bytes[],address)"].map(
        (a) => web3.utils.keccak256(a).slice(0, 10)
      );

      await expect(
        implementationsMapping
          .connect(masterSigner)
          .addImplementation(layerAccountV2ImplM2.address, test_sigs)
      ).to.be.revertedWith("Implementations: _sig already added");
    });

    it("should add defaultImplementationM2 to mappings", async function () {
      const tx = await implementationsMapping
        .connect(masterSigner)
        .addImplementation(
          layerAccount2DefaultImpl2.address,
          layerAccount2DefaultImpl2Sigs
        );
      let receipt = await tx.wait();

      expect(receipt.events[0].event).to.be.equal("LogAddImplementation");
      expect(receipt.events[0].args.implementation).to.be.equal(
        layerAccount2DefaultImpl2.address
      );
      receipt.events[0].args.sigs.forEach((a: any, i: string | number) => {
        expect(a).to.be.equal(layerAccount2DefaultImpl2Sigs[i]);
      });

      expect(
        await implementationsMapping.getSigImplementation(
          layerAccount2DefaultImpl2Sigs[0]
        )
      ).to.be.equal(layerAccount2DefaultImpl2.address);
      (
        await implementationsMapping.getImplementationSigs(
          layerAccount2DefaultImpl2.address
        )
      ).forEach((a: any, i: string | number) => {
        expect(a).to.be.eq(layerAccount2DefaultImpl2Sigs[i]);
      });
    });

    it("should send ether with method call | AccountProxy: receive()", async function () {
      const txn = await layerAccountV2ImplM0
        .connect(signer)
        .handlePayment(layerAccountProxy.address, {
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

    it("should revert removing implementation with non-master account", async function () {
      await expect(
        implementationsMapping
          .connect(signer)
          .removeImplementation(layerAccount2DefaultImpl2.address)
      ).to.be.revertedWith("Implementations: not-master");
    });

    it("should revert removing invalid/non-existing implementation", async function () {
      await expect(
        implementationsMapping
          .connect(masterSigner)
          .removeImplementation(addr_zero)
      ).to.be.revertedWith("Implementations: _implementation not valid.");
      await expect(
        implementationsMapping
          .connect(masterSigner)
          .removeImplementation(layerAccountV2ImplM2.address)
      ).to.be.revertedWith("Implementations: _implementation not found.");
    });

    it("should remove defaultImplementationM2 from mapping", async function () {
      const tx = await implementationsMapping
        .connect(masterSigner)
        .removeImplementation(layerAccount2DefaultImpl2.address);
      let receipt = await tx.wait();

      expect(receipt.events[0].event).to.be.equal("LogRemoveImplementation");
      expect(receipt.events[0].args.implementation).to.be.equal(
        layerAccount2DefaultImpl2.address
      );
      receipt.events[0].args.sigs.forEach((a: any, i: string | number) => {
        expect(a).to.be.equal(layerAccount2DefaultImpl2Sigs[i]);
      });

      expect(
        await implementationsMapping.getSigImplementation(
          layerAccount2DefaultImpl2Sigs[0]
        )
      ).to.be.equal(addr_zero);

      (
        await implementationsMapping.getImplementationSigs(
          layerAccount2DefaultImpl2.address
        )
      ).forEach((a: any, i: string | number) => {
        expect(a).to.be.eq(0);
      });
    });

    it("should change default implementation", async function () {
      let tx = await implementationsMapping
        .connect(masterSigner)
        .setDefaultImplementation(layerAccount2DefaultImpl2.address);
      let txDetails = await tx.wait();
      expect(!!txDetails.status).to.be.true;

      expectEvent(
        txDetails,
        (await deployments.getArtifact("LayerImplementations")).abi,
        "LogSetDefaultImplementation",
        {
          oldImplementation: layerAccountV2DefaultImpl.address,
          newImplementation: layerAccount2DefaultImpl2.address,
        }
      );

      expect(await implementationsMapping.defaultImplementation()).to.be.equal(
        layerAccount2DefaultImpl2.address
      );
    });

    it("should return default implementation v2", async function () {
      expect(
        await implementationsMapping.getImplementation(
          layerAccount2DefaultImpl2Sigs[1]
        )
      ).to.be.equal(layerAccount2DefaultImpl2.address);
    });

    after(async () => {
      let tx = await implementationsMapping
        .connect(masterSigner)
        .addImplementation(
          layerAccountV2ImplM2.address,
          layerAccountV2ImplM2Sigs
        );
      await tx.wait();
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
          layerAccountProxy.address,
          layerConnectors.address,
          addr_zero
        );
      let txDetails = await tx.wait();

      expect(await layerIndex.account(2)).to.be.equal(
        layerAccountProxy.address
      );
    });

    it("Should build DSAs", async () => {
      //builds DSA and adds wallet0 as auth
      dsaWallet0 = await buildDSAv2(
        wallet0.address,
        (
          await deployments.getArtifact("LayerImplementationM1")
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
      let defaultM2abi = await deployments.getArtifact(
        "LayerDefaultImplementation2"
      );
      let implM2abi = await deployments.getArtifact("LayerImplementationM2");

      dsaWallet1 = await ethers.getContractAt(defaultM1abi, dsaWallet0.address);
      expect(!!dsaWallet1.address).to.be.true;
      dsaWallet2 = await ethers.getContractAt(
        implM2abi.abi,
        dsaWallet0.address
      );
      expect(!!dsaWallet2.address).to.be.true;
      dsaWallet3 = await ethers.getContractAt(
        defaultM2abi.abi,
        dsaWallet0.address
      );
      expect(!!dsaWallet3.address).to.be.true;

      walletv21 = await ethers.getSigner(dsaWallet2.address);
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [walletv21.address],
      });
      dsa2 = ethers.provider.getSigner(walletv21.address);
    });

    it("Should set balances", async () => {
      await wallet3.sendTransaction({
        to: dsaWallet0.address,
        value: ethers.utils.parseEther("10"),
      });
      await wallet3.sendTransaction({
        to: walletv20.address,
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
  });

  describe("Connector Registry", async function () {
    let connectorNames = ["auth", "emitEvent"];
    let authAddr = "0x351Bb32e90C35647Df7a584f3c1a3A0c38F31c68";

    it("should toggle chief", async function () {
      expect(await layerConnectors.layerIndex()).to.be.equal(
        layerIndex.address
      );
      expect(await layerConnectors.chief(ichief1.address)).to.be.false;

      let tx = await layerConnectors
        .connect(masterSigner)
        .toggleChief(ichief1.address);
      let txDetails = await tx.wait();

      expect(await layerConnectors.chief(ichief1.address)).to.be.true;

      expectEvent(
        txDetails,
        (await deployments.getArtifact("LayerConnectors")).abi,
        "LogController",
        {
          addr: ichief1.address,
          isChief: true,
        }
      );
    });

    it("should revert toggling chief with a chief", async function () {
      expect(await layerConnectors.chief(ichief1.address)).to.be.true;
      expect(await layerConnectors.chief(ichief2.address)).to.be.false;
      console.log(ichief1.address);
      console.log(masterAddress);
      await expect(
        layerConnectors.connect(chief1).toggleChief(ichief2.address)
      ).to.be.revertedWith("toggleChief: not-master");
    });

    it("should revert toggling chief with non-master", async function () {
      expect(await layerConnectors.chief(ichief2.address)).to.be.false;
      await expect(
        layerConnectors.connect(signer).toggleChief(ichief2.address)
      ).to.be.revertedWith("toggleChief: not-master");
    });

    it("should set toggle chief2 on-and-off", async function () {
      expect(await layerConnectors.chief(ichief2.address)).to.be.false;
      let tx = await layerConnectors
        .connect(masterSigner)
        .toggleChief(ichief2.address);
      let txDetails = await tx.wait();

      expect(await layerConnectors.chief(ichief2.address)).to.be.true;
      expect(txDetails.events[0].event).to.be.eq("LogController");
      expect(txDetails.events[0].args.addr).to.be.eq(ichief2.address);
      expect(txDetails.events[0].args.isChief).to.be.eq(true);

      tx = await layerConnectors
        .connect(masterSigner)
        .toggleChief(ichief2.address);
      txDetails = await tx.wait();

      expect(await layerConnectors.chief(ichief2.address)).to.be.false;
      expect(txDetails.events[0].event).to.be.eq("LogController");
      expect(txDetails.events[0].args.addr).to.be.eq(ichief2.address);
      expect(txDetails.events[0].args.isChief).to.be.eq(false);
    });

    it("should deploy Auth and EmitEvent connectors", async function () {
      await deployConnector(
        {
          connectorName: "auth",
          contract: "ConnectAuth",
          factory: ConnectAuth__factory,
        },
        [layerList.address]
      );
      expect(!!addresses.connectors["auth"]).to.be.true;
      layerAuth = await ethers.getContractAt(
        (
          await deployments.getArtifact("ConnectAuth")
        ).abi,
        addresses.connectors["auth"]
      );

      await deployConnector({
        connectorName: "emitEvent",
        contract: "ConnectEmitEvent",
        factory: ConnectEmitEvent__factory,
      });
      expect(!!addresses.connectors["emitEvent"]).to.be.true;
      layerEvent = await ethers.getContractAt(
        (
          await deployments.getArtifact("ConnectEmitEvent")
        ).abi,
        addresses.connectors["emitEvent"]
      );

      await deployConnector(
        {
          connectorName: "auth-a",
          contract: "ConnectAuth",
          factory: ConnectAuth__factory,
        },
        [layerList.address]
      );
      expect(!!addresses.connectors["auth-a"]).to.be.true;
    });

    it("should revert adding connectors via non-chief or non-master", async function () {
      expect(await layerConnectors.connectors("auth")).to.be.equal(
        addr_zero
      );

      await expect(
        layerConnectors
          .connect(signer)
          .addConnectors(["auth"], [layerAuth.address])
      ).to.be.revertedWith("not-an-chief");
    });

    it("should revert when name and address length not same", async function () {
      expect(await layerConnectors.connectors("emitEvent")).to.be.equal(
        addr_zero
      );
      expect(await layerConnectors.connectors("auth")).to.be.equal(
        addr_zero
      );

      await expect(
        layerConnectors
          .connect(chief1)
          .addConnectors(["auth", "emitEvent"], [layerAuth.address])
      ).to.be.revertedWith("addConnectors: not same length");
    });

    it("should revert with invalid connector addresses", async function () {
      expect(await layerConnectors.connectors("emitEvent")).to.be.equal(
        addr_zero
      );
      expect(await layerConnectors.connectors("auth")).to.be.equal(
        addr_zero
      );

      await expect(
        layerConnectors
          .connect(chief1)
          .addConnectors(["auth", "emitEvent"], [addr_zero, addr_zero])
      ).to.be.revertedWith("addConnectors: _connectors address not valid");

      await expect(
        layerConnectors
          .connect(chief1)
          .addConnectors(
            ["auth", "emitEvent"],
            [layerAuth.address, addr_zero]
          )
      ).to.be.revertedWith("addConnectors: _connectors address not valid");
    });

    it("should revert adding same name connectors", async function () {
      expect(await layerConnectors.connectors("emitEvent")).to.be.equal(
        addr_zero
      );
      expect(await layerConnectors.connectors("auth")).to.be.equal(
        addr_zero
      );

      await expect(
        layerConnectors
          .connect(chief1)
          .addConnectors(
            ["auth", "auth"],
            [layerAuth.address, layerEvent.address]
          )
      ).to.be.revertedWith("addConnectors: _connectorName added already");
    });

    it("should revert removing disabled connectors", async function () {
      expect(await layerConnectors.connectors("emitEvent")).to.be.equal(
        addr_zero
      );

      await expect(
        layerConnectors.connect(chief1).removeConnectors(["auth"])
      ).to.be.revertedWith(
        "removeConnectors: _connectorName not added to update"
      );
    });

    it("should add Auth connector", async function () {
      let tx = await layerConnectors
        .connect(chief1)
        .addConnectors(["auth"], [layerAuth.address]);
      let txDetails = await tx.wait();
      expect(!!txDetails.status).to.be.true;

      let events = txDetails.events;
      expect(events.length).to.be.equal(1);
      expect(events[0].args.connectorNameHash).to.be.equal(
        web3.utils.keccak256("auth")
      );
      expect(events[0].args.connectorName).to.be.equal("auth");
      expect(events[0].args.connector).to.be.equal(layerAuth.address);
      expect(await layerConnectors.connectors("auth")).to.be.eq(
        layerAuth.address
      );
    });

    it("should revert disabling connectors with non-chief or non-master", async function () {
      expect(await layerConnectors.connectors("auth")).to.be.equal(
        layerAuth.address
      );

      await expect(
        layerConnectors.connect(signer).removeConnectors(["auth"])
      ).to.be.revertedWith("not-an-chief");
    });

    it("should remove auth connector", async function () {
      let tx = await layerConnectors
        .connect(masterSigner)
        .removeConnectors(["auth"]);
      let receipt = await tx.wait();
      expect(!!receipt.status).to.be.true;

      let events = receipt.events;
      expect(events[0].args.connectorNameHash).to.be.equal(
        web3.utils.keccak256("auth")
      );
      expect(events[0].args.connectorName).to.be.equal("auth");
      expect(events[0].args.connector).to.be.equal(layerAuth.address);
      expect(await layerConnectors.connectors("auth")).to.be.equal(
        addr_zero
      );
    });

    it("should add multiple connectors", async function () {
      let address = [layerAuth.address, layerEvent.address];
      let tx = await layerConnectors
        .connect(chief1)
        .addConnectors(connectorNames, address);
      let txDetails = await tx.wait();
      expect(!!txDetails.status).to.be.true;

      txDetails.events.forEach((a: any, i: string | number) => {
        expect(a.event).to.be.equal("LogConnectorAdded");
        expect(a.args.connectorNameHash).to.be.eq(
          web3.utils.keccak256(connectorNames[i])
        );
        expect(a.args.connectorName).to.be.eq(connectorNames[i]);
        expect(a.args.connector).to.be.eq(address[i]);
      });
    });

    it("should check connectors enable status", async function () {
      let [ok, address] = await layerConnectors.isConnectors(connectorNames);
      expect(ok).to.be.true;
      address.forEach((a: any, i: string | number) => {
        expect(a).to.be.equal(addresses.connectors[connectorNames[i]]);
      });
    });

    it("should remove multiple connectors", async function () {
      let address = [layerAuth.address, layerEvent.address];
      let tx = await layerConnectors
        .connect(chief1)
        .removeConnectors(connectorNames);
      let receipt = await tx.wait();
      expect(!!receipt.status).to.be.true;

      receipt.events.forEach((a: any, i: string | number) => {
        expect(a.event).to.be.equal("LogConnectorRemoved");
        expect(a.args.connectorNameHash).to.be.eq(
          web3.utils.keccak256(connectorNames[i])
        );
        expect(a.args.connectorName).to.be.eq(connectorNames[i]);
        expect(a.args.connector).to.be.eq(address[i]);
      });

      let [ok] = await layerConnectors.isConnectors(connectorNames);
      expect(ok).to.be.false;

      for (let connector in connectorNames) {
        expect(await layerConnectors.connectors(connector)).to.be.equal(
          addr_zero
        );
      }
    });

    it("should revert updating not-enabled connectors", async function () {
      await expect(
        layerConnectors
          .connect(chief1)
          .updateConnectors(["auth"], [authAddr])
      ).to.be.revertedWith(
        "updateConnectors: _connectorName not added to update"
      );
    });

    it("can add same address to multiple connector names", async function () {
      connectorNames = ["auth", "emitEvent", "auth-a"];
      let connectors = [
        layerAuth.address,
        layerEvent.address,
        layerAuth.address,
      ];

      let tx = await layerConnectors
        .connect(masterSigner)
        .addConnectors(connectorNames, connectors);
      let receipt = await tx.wait();
      expect(!!receipt.status).to.be.true;

      receipt.events.forEach((a: any, i: string | number) => {
        expect(a.event).to.be.equal("LogConnectorAdded");
        expect(a.args.connectorNameHash).to.be.eq(
          web3.utils.keccak256(connectorNames[i])
        );
        expect(a.args.connectorName).to.be.eq(connectorNames[i]);
        expect(a.args.connector).to.be.eq(connectors[i]);
      });

      let [ok, address] = await layerConnectors.isConnectors(connectorNames);
      expect(ok).to.be.true;
      address.forEach((a: any, i: string | number) => {
        expect(a).to.be.equal(connectors[i]);
      });
    });

    it("should revert updating connector address to zero address", async function () {
      await expect(
        layerConnectors
          .connect(chief1)
          .updateConnectors(["auth", "auth-a"], [addr_zero, addr_zero])
      ).to.be.revertedWith("updateConnectors: _connector address is not valid");

      await expect(
        layerConnectors
          .connect(chief1)
          .updateConnectors(["auth", "auth-a"], [authAddr, addr_zero])
      ).to.be.revertedWith("updateConnectors: _connector address is not valid");
    });

    it("should revert with invalid name and address length", async function () {
      await expect(
        layerConnectors
          .connect(chief1)
          .updateConnectors(["auth", "auth-a"], [authAddr])
      ).to.be.revertedWith("updateConnectors: not same length");
    });

    it("should update the connector address", async function () {
      let tx = await layerConnectors
        .connect(chief1)
        .updateConnectors(["auth-a"], [authAddr]);
      let receipt = await tx.wait();
      expect(!!receipt.status).to.be.true;
      addresses.connectors["auth-a"] = authAddr;

      let [ok, connectors] = await layerConnectors.isConnectors(
        connectorNames
      );
      expect(ok).to.be.true;
      connectors.forEach((a: any, i: string | number) => {
        expect(a).to.be.eq(addresses.connectors[connectorNames[i]]);
      });
    });
  });

  describe("Cast spells", function () {
    let spell = [
      {
        connector: "auth",
        method: "add",
        args: [wallet1.address],
      },
    ];

    it("should revert cast if the msg sender is not auth of DSA", async function () {
      let [targets, data] = encodeSpells(spell);
      await expect(
        dsaWallet0.connect(signer).cast(targets, data, wallet0.address)
      ).to.be.revertedWith("1: permission-denied");
    });

    it("should revert if the length of targets is zero", async function () {
      await expect(
        dsaWallet0.connect(wallet0).cast([], [], wallet0.address)
      ).to.be.revertedWith("1: length-invalid");
    });

    it("should revert if length of datas and targets is unequal", async function () {
      let targets = ["auth"];
      await expect(
        dsaWallet0.connect(wallet0).cast(targets, [], wallet0.address)
      ).to.be.revertedWith("1: array-length-invalid");
    });

    it("it should revert on casting on invalid connectors", async function () {
      expect(await layerConnectors.connectors("auth-b")).to.be.equal(
        addr_zero
      );

      let target = ["auth-b"];

      spell = [
        {
          connector: "auth",
          method: "add",
          args: [wallet1.address],
        },
      ];
      let [, data] = encodeSpells(spell);

      await expect(
        dsaWallet0.connect(wallet0).cast(target, data, wallet0.address)
      ).to.be.revertedWith("1: not-connector");
    });

    describe("Auth and EmitEvent connector", function () {
      it("should add wallet1 as auth of dsaWallet0 | ImplementationsM1:Cast", async function () {
        expect(await dsaWallet1.isAuth(wallet1.address)).to.be.false;

        let spells = [
          {
            connector: "auth",
            method: "add",
            args: [wallet1.address],
          },
        ];
        let tx = await dsaWallet0
          .connect(wallet0)
          .cast(...encodeSpells(spells), wallet1.address);
        let receipt = await tx.wait();

        expect(await dsaWallet1.connect(wallet0).isAuth(wallet1.address)).to.be
          .true;
        expectEvent(
          receipt,
          (await deployments.getArtifact("LayerDefaultImplementation")).abi,
          "LogEnableUser",
          {
            user: wallet1.address,
          }
        );
        expectEvent(
          receipt,
          (await deployments.getArtifact("ConnectAuth")).abi,
          "LogAddAuth",
          {
            _msgSender: wallet0.address,
            _authority: wallet1.address,
          }
        );
        expectEvent(
          receipt,
          (await deployments.getArtifact("LayerImplementationM1")).abi,
          "LogCast",
          {
            origin: wallet1.address,
            sender: wallet0.address,
            value: "0",
          }
        );

        expect(receipt.events[2].args.targetsNames[0]).to.be.equal("auth");
        expect(receipt.events[2].args.targets[0]).to.be.equal(
          layerAuth.address
        );
        expect(receipt.events[2].args.eventNames[0]).to.be.equal(
          "LogAddAuth(address,address)"
        );
        expect(receipt.events[2].args.eventParams[0]).to.be.equal(
          ethers.utils.defaultAbiCoder.encode(
            ["address", "address"],
            [wallet0.address, wallet1.address]
          )
        );
      });

      it("should remove wallet1 as auth of dsaWallet0 | ImplementationsM1:Cast", async function () {
        expect(await dsaWallet1.connect(wallet0).isAuth(wallet1.address)).to.be
          .true;

        let userLink = await layerList.accountLink(
          await layerList.accountID(dsaWallet0.address)
        );
        expect(userLink.count).to.be.gte(2);
        console.log(userLink.count);

        let spells = [
          {
            connector: "auth",
            method: "remove",
            args: [wallet1.address],
          },
        ];
        let tx = await dsaWallet0
          .connect(wallet0)
          .cast(...encodeSpells(spells), wallet0.address);
        let receipt = await tx.wait();

        expectEvent(
          receipt,
          (await deployments.getArtifact("LayerDefaultImplementation")).abi,
          "LogDisableUser",
          {
            user: wallet1.address,
          }
        );
        expectEvent(
          receipt,
          (await deployments.getArtifact("ConnectAuth")).abi,
          "LogRemoveAuth",
          {
            _msgSender: wallet0.address,
            _authority: wallet1.address,
          }
        );
        expectEvent(
          receipt,
          (await deployments.getArtifact("LayerImplementationM1")).abi,
          "LogCast",
          {
            origin: wallet0.address,
            sender: wallet0.address,
            value: "0",
          }
        );

        expect(receipt.events[2].args.targetsNames[0]).to.be.equal("auth");
        expect(receipt.events[2].args.targets[0]).to.be.equal(
          layerAuth.address
        );
        expect(receipt.events[2].args.eventNames[0]).to.be.equal(
          "LogRemoveAuth(address,address)"
        );
        expect(receipt.events[2].args.eventParams[0]).to.be.equal(
          ethers.utils.defaultAbiCoder.encode(
            ["address", "address"],
            [wallet0.address, wallet1.address]
          )
        );
      });

      it("should revert disabling all auths", async function () {
        let spells = [
          {
            connector: "auth",
            method: "remove",
            args: [wallet0.address],
          },
        ];
        await expect(
          dsaWallet0
            .connect(wallet0)
            .cast(...encodeSpells(spells), wallet0.address)
        ).to.be.revertedWith("Removing-all-authorities");
      });

      it("should cast multiple spells for same connectors | ImplementationsM1:Cast", async function () {
        expect(await dsaWallet1.connect(wallet0).isAuth(wallet1.address)).to.be
          .false;
        let spells = [
          {
            connector: "auth",
            method: "add",
            args: [wallet1.address],
          },
          {
            connector: "auth",
            method: "remove",
            args: [wallet1.address],
          },
        ];
        let tx = await dsaWallet0
          .connect(wallet0)
          .cast(...encodeSpells(spells), wallet0.address);
        let receipt = await tx.wait();

        expect(await dsaWallet1.connect(wallet0).isAuth(wallet1.address)).to.be
          .false;

        expectEvent(
          receipt,
          (await deployments.getArtifact("LayerDefaultImplementation")).abi,
          "LogEnableUser",
          {
            user: wallet1.address,
          }
        );
        expectEvent(
          receipt,
          (await deployments.getArtifact("ConnectAuth")).abi,
          "LogAddAuth",
          {
            _msgSender: wallet0.address,
            _authority: wallet1.address,
          }
        );
        expectEvent(
          receipt,
          (await deployments.getArtifact("LayerDefaultImplementation")).abi,
          "LogDisableUser",
          {
            user: wallet1.address,
          }
        );
        expectEvent(
          receipt,
          (await deployments.getArtifact("ConnectAuth")).abi,
          "LogRemoveAuth",
          {
            _msgSender: wallet0.address,
            _authority: wallet1.address,
          }
        );
        expectEvent(
          receipt,
          (await deployments.getArtifact("LayerImplementationM1")).abi,
          "LogCast",
          {
            origin: wallet0.address,
            sender: wallet0.address,
            value: "0",
          }
        );
        let targetsNames = ["auth", "auth"];
        let targets = [layerAuth.address, layerAuth.address];
        let eventNames = [
          "LogAddAuth(address,address)",
          "LogRemoveAuth(address,address)",
        ];
        let eventParams = [
          ethers.utils.defaultAbiCoder.encode(
            ["address", "address"],
            [wallet0.address, wallet1.address]
          ),
          ethers.utils.defaultAbiCoder.encode(
            ["address", "address"],
            [wallet0.address, wallet1.address]
          ),
        ];
        receipt.events[4].args.targetsNames.forEach(
          (a: any, i: string | number) => {
            expect(a).to.be.equal(targetsNames[i]);
          }
        );
        receipt.events[4].args.targets.forEach((a: any, i: string | number) => {
          expect(a).to.be.equal(targets[i]);
        });
        receipt.events[4].args.eventNames.forEach(
          (a: any, i: string | number) => {
            expect(a).to.be.equal(eventNames[i]);
          }
        );
        receipt.events[4].args.eventParams.forEach(
          (a: any, i: string | number) => {
            expect(a).to.be.equal(eventParams[i]);
          }
        );
      });

      it("should cast multiple spells for different connectors | ImplementationsM1:Cast", async function () {
        expect(await dsaWallet1.connect(wallet0).isAuth(wallet1.address)).to.be;
        let spells = [
          {
            connector: "auth",
            method: "add",
            args: [wallet1.address],
          },
          {
            connector: "emitEvent",
            method: "emitEvent",
            args: [],
          },
        ];
        let tx = await dsaWallet0
          .connect(wallet0)
          .cast(...encodeSpells(spells), wallet0.address);
        let receipt = await tx.wait();

        expect(await dsaWallet1.connect(wallet0).isAuth(wallet1.address)).to.be
          .true;

        expectEvent(
          receipt,
          (await deployments.getArtifact("LayerDefaultImplementation")).abi,
          "LogEnableUser",
          {
            user: wallet1.address,
          }
        );
        expectEvent(
          receipt,
          (await deployments.getArtifact("ConnectAuth")).abi,
          "LogAddAuth",
          {
            _msgSender: wallet0.address,
            _authority: wallet1.address,
          }
        );
        expectEvent(
          receipt,
          (await deployments.getArtifact("ConnectEmitEvent")).abi,
          "LogEmitEvent",
          {
            dsaAddress: dsaWallet2.address,
            _sender: wallet0.address,
          }
        );

        expectEvent(
          receipt,
          (await deployments.getArtifact("LayerImplementationM1")).abi,
          "LogCast",
          {
            origin: wallet0.address,
            sender: wallet0.address,
            value: "0",
          }
        );

        let targetsNames = ["auth", "emitEvent"];
        let targets = [layerAuth.address, layerEvent.address];
        let eventNames = [
          "LogAddAuth(address,address)",
          "LogEmitEvent(address,address)",
        ];
        let eventParams = [
          ethers.utils.defaultAbiCoder.encode(
            ["address", "address"],
            [wallet0.address, wallet1.address]
          ),
          ethers.utils.defaultAbiCoder.encode(
            ["address", "address"],
            [dsaWallet2.address, wallet0.address]
          ),
        ];
        receipt.events[3].args.targetsNames.forEach(
          (a: any, i: string | number) => {
            expect(a).to.be.equal(targetsNames[i]);
          }
        );
        receipt.events[3].args.targets.forEach((a: any, i: string | number) => {
          expect(a).to.be.equal(targets[i]);
        });
        receipt.events[3].args.eventNames.forEach(
          (a: any, i: string | number) => {
            expect(a).to.be.equal(eventNames[i]);
          }
        );
        receipt.events[3].args.eventParams.forEach(
          (a: any, i: string | number) => {
            expect(a).to.be.equal(eventParams[i]);
          }
        );
      });

      it("should be able to call methods of implementationsM2 | LayerImplementationsM2: CastWithFlashLoan", async function () {
        let spells = [
          {
            connector: "emitEvent",
            method: "emitEvent",
            args: [],
          },
        ];

        let tx = await dsaWallet2
          .connect(wallet0)
          .castWithFlashloan(...encodeSpells(spells), wallet0.address);
        let receipt = await tx.wait();

        expectEvent(
          receipt,
          (await deployments.getArtifact("ConnectEmitEvent")).abi,
          "LogEmitEvent",
          {
            dsaAddress: dsaWallet2.address,
            _sender: wallet0.address,
          }
        );

        expectEvent(
          receipt,
          (await deployments.getArtifact("LayerImplementationM2")).abi,
          "LogCast",
          {
            origin: wallet0.address,
            sender: wallet0.address,
            value: "0",
          }
        );
        let targetsNames = ["emitEvent"];
        let targets = [layerEvent.address];
        let eventNames = ["LogEmitEvent(address,address)"];
        let eventParams = [
          ethers.utils.defaultAbiCoder.encode(
            ["address", "address"],
            [dsaWallet2.address, wallet0.address]
          ),
        ];
        receipt.events[1].args.targetsNames.forEach(
          (a: any, i: string | number) => {
            expect(a).to.be.equal(targetsNames[i]);
          }
        );
        receipt.events[1].args.targets.forEach((a: any, i: string | number) => {
          expect(a).to.be.equal(targets[i]);
        });
        receipt.events[1].args.eventNames.forEach(
          (a: any, i: string | number) => {
            expect(a).to.be.equal(eventNames[i]);
          }
        );
        receipt.events[1].args.eventParams.forEach(
          (a: any, i: string | number) => {
            expect(a).to.be.equal(eventParams[i]);
          }
        );
      });
    });

    describe("Default implementation", function () {
      it("should check state", async function () {
        expect(
          await dsaWallet1.connect(wallet0).implementationVersion()
        ).to.be.equal(1);
        expect(await dsaWallet1.connect(wallet0).layerIndex()).to.be.equal(
          layerIndex.address
        );
        expect(await dsaWallet1.connect(wallet0).version()).to.be.equal(2);
      });
      it("should check auth via default implementation", async function () {
        expect(await dsaWallet1.isAuth(wallet0.address)).to.be.true;
        expect(await dsaWallet1.isAuth(wallet1.address)).to.be.true;
      });
      it("should revert toggling beta mode from non dsa", async function () {
        await expect(
          dsaWallet1.connect(wallet0).toggleBeta()
        ).to.be.revertedWith("not-self");
      });
      it("should toggle beta mode", async function () {
        expect(await dsaWallet1.isBeta()).to.be.false;
        let tx = await dsaWallet1.connect(dsa1).toggleBeta();
        let receipt = await tx.wait();
        expect(!!receipt.status).to.be.true;

        expectEvent(
          receipt,
          (await deployments.getArtifact("LayerDefaultImplementation")).abi,
          "LogBetaMode"
        );
        expect(receipt.events[0].args.beta).to.be.true;
        expect(await dsaWallet1.isBeta()).to.be.true;

        tx = await dsaWallet1.connect(dsa1).toggleBeta();
        receipt = await tx.wait();
        expect(!!receipt.status).to.be.true;

        expectEvent(
          receipt,
          (await deployments.getArtifact("LayerDefaultImplementation")).abi,
          "LogBetaMode"
        );
        expect(receipt.events[0].args.beta).to.be.false;
        expect(await dsaWallet1.isBeta()).to.be.false;
      });

      it("should revert enabling wallet2 as auth via non dsa", async function () {
        await expect(
          dsaWallet1.connect(wallet0).enable(wallet2.address)
        ).to.be.revertedWith("not-self");
      });

      it("should revert enabling zero-address as auth", async function () {
        await expect(
          dsaWallet1.connect(dsa1).enable(addr_zero)
        ).to.be.revertedWith("not-valid");
      });

      it("should enable wallet2 as auth via default implementation", async function () {
        let tx = await dsaWallet1.connect(dsa1).enable(wallet2.address);
        let receipt = await tx.wait();
        expect(!!receipt.status).to.be.true;

        expect(await dsaWallet1.isAuth(wallet2.address)).to.be.true;

        expectEvent(
          receipt,
          (await deployments.getArtifact("LayerDefaultImplementation")).abi,
          "LogEnableUser",
          {
            user: wallet2.address,
          }
        );
      });

      it("should revert re-enabling enabled auth", async function () {
        await expect(
          dsaWallet1.connect(dsa1).enable(wallet2.address)
        ).to.be.revertedWith("already-enabled");
      });

      it("should revert disabling wallet2 as auth via non dsa", async function () {
        await expect(
          dsaWallet1.connect(wallet0).disable(wallet2.address)
        ).to.be.revertedWith("not-self");
      });

      it("should revert disabling zero-address as auth", async function () {
        await expect(
          dsaWallet1.connect(dsa1).disable(addr_zero)
        ).to.be.revertedWith("not-valid");
      });

      it("should disable wallet2 as auth via default implementation", async function () {
        let tx = await dsaWallet1.connect(dsa1).disable(wallet2.address);
        let receipt = await tx.wait();
        expect(!!receipt.status).to.be.true;

        expect(await dsaWallet1.isAuth(wallet2.address)).to.be.false;

        expectEvent(
          receipt,
          (await deployments.getArtifact("LayerDefaultImplementation")).abi,
          "LogDisableUser",
          {
            user: wallet2.address,
          }
        );
      });

      it("should revert re-disabling disabled auth", async function () {
        await expect(
          dsaWallet1.connect(dsa1).disable(wallet2.address)
        ).to.be.revertedWith("already-disabled");
      });
    });
  });
});
