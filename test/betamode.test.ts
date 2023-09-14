import { expect } from "chai";
import hre from "hardhat";
import deployContracts from "../scripts/deployContracts";
import deployConnector from "../scripts/deployConnector";
import encodeSpells from "../scripts/encodeSpells";
import getMasterSigner from "../scripts/getMasterSigner";
import addresses from "../scripts/constant/addresses";
import {
  LayerDefaultImplementationV2__factory,
  ConnectV2Beta__factory,
} from "../typechain";
const { ethers, web3, deployments, waffle } = hre;
const { provider, deployContract } = waffle;
import type { Signer, Contract } from "ethers";

describe("Betamode", function () {
  const address_zero = "0x0000000000000000000000000000000000000000";

  let layerConnectorsV2: Contract,
    implementationsMapping: Contract,
    layerAccountV2Proxy: Contract,
    layerAccountV2ImplM1: Contract,
    layerAccountV2ImplM2: Contract,
    layerAccountV2DefaultImpl: Contract,
    layerAccountV2DefaultImplV2: Contract,
    layerIndex: Contract,
    layerAccountV2ImplBeta: Contract;

  const layerAccountV2DefaultImplSigsV2 = [
    "enable(address)",
    "disable(address)",
    "isAuth(address)",
    "switchShield(bool)",
    "shield()",
    "isBeta() returns bool",
    "toogleBeta()",
  ].map((a) => web3.utils.keccak256(a).slice(0, 10));

  const layerAccountV2ImplM1Sigs = ["cast(string[],bytes[],address)"].map((a) =>
    web3.utils.keccak256(a).slice(0, 10)
  );

  const layerAccountV2ImplBetaSigs = ["castBeta(string[],bytes[],address)"].map(
    (a) => web3.utils.keccak256(a).slice(0, 10)
  );

  let masterSigner: Signer;

  let acountV2DsaM1Wallet0: Contract;
  let acountV2DsaDefaultWallet0: Contract;
  let acountV2DsaBetaWallet0: Contract;

  const wallets = provider.getWallets();
  let [wallet0] = wallets;
  before(async () => {
    await hre.network.provider.request({
      method: "hardhat_reset",
      params: [
        {
          forking: {
            // @ts-ignore
            jsonRpcUrl: hre.config.networks.hardhat.forking.url,
            blockNumber: 12068005,
          },
        },
      ],
    });
    const result = await deployContracts();
    layerAccountV2DefaultImpl = result.layerAccountV2DefaultImpl;
    layerIndex = result.layerIndex;
    layerConnectorsV2 = result.layerConnectorsV2;
    implementationsMapping = result.implementationsMapping;
    layerAccountV2Proxy = result.layerAccountV2Proxy;
    layerAccountV2ImplM1 = result.layerAccountV2ImplM1;
    layerAccountV2ImplM2 = result.layerAccountV2ImplM2;

    const LayerAccountV2ImplBeta = await ethers.getContractFactory(
      "LayerImplementationBetaTest"
    );
    layerAccountV2ImplBeta = await LayerAccountV2ImplBeta.deploy(
      layerIndex.address,
      layerConnectorsV2.address
    );
    masterSigner = await getMasterSigner();
    layerAccountV2DefaultImplV2 = await deployContract(
      masterSigner,
      LayerDefaultImplementationV2__factory,
      []
    );
  });

  it("Should have contracts deployed.", async function () {
    expect(!!layerConnectorsV2.address).to.be.true;
    expect(!!implementationsMapping.address).to.be.true;
    expect(!!layerAccountV2Proxy.address).to.be.true;
    expect(!!layerAccountV2ImplM1.address).to.be.true;
    expect(!!layerAccountV2ImplM2.address).to.be.true;
  });

  describe("Implementations", function () {
    it("Should add default implementation to mapping.", async function () {
      const tx = await implementationsMapping
        .connect(masterSigner)
        .setDefaultImplementation(layerAccountV2DefaultImpl.address);
      await tx.wait();
      expect(await implementationsMapping.defaultImplementation()).to.be.equal(
        layerAccountV2DefaultImpl.address
      );
    });

    it("Should add layerAccountV2ImplM1 sigs to mapping.", async function () {
      const tx = await implementationsMapping
        .connect(masterSigner)
        .addImplementation(
          layerAccountV2ImplM1.address,
          layerAccountV2ImplM1Sigs
        );
      await tx.wait();
      expect(
        await implementationsMapping.getSigImplementation(
          layerAccountV2ImplM1Sigs[0]
        )
      ).to.be.equal(layerAccountV2ImplM1.address);
      (
        await implementationsMapping.getImplementationSigs(
          layerAccountV2ImplM1.address
        )
      ).forEach((a: any, i: any) => {
        expect(a).to.be.eq(layerAccountV2ImplM1Sigs[i]);
      });
    });

    it("Should add layerAccountV2ImplBeta sigs to mapping.", async function () {
      const tx = await implementationsMapping
        .connect(masterSigner)
        .addImplementation(
          layerAccountV2ImplBeta.address,
          layerAccountV2ImplBetaSigs
        );
      await tx.wait();
      expect(
        await implementationsMapping.getSigImplementation(
          layerAccountV2ImplBetaSigs[0]
        )
      ).to.be.equal(layerAccountV2ImplBeta.address);
      (
        await implementationsMapping.getImplementationSigs(
          layerAccountV2ImplBeta.address
        )
      ).forEach((a, i) => {
        expect(a).to.be.eq(layerAccountV2ImplBetaSigs[i]);
      });
    });

    it("Should add LayerAccountV2 in Index.sol", async function () {
      const tx = await layerIndex
        .connect(masterSigner)
        .addNewAccount(layerAccountV2Proxy.address, address_zero, address_zero);
      await tx.wait();
      expect(await layerIndex.account(2)).to.be.equal(
        layerAccountV2Proxy.address
      );
    });

    it("Should add LayerDefaultImplementationV2 sigs to mapping.", async function () {
      const tx = await implementationsMapping
        .connect(masterSigner)
        .addImplementation(
          layerAccountV2DefaultImplV2.address,
          layerAccountV2DefaultImplSigsV2
        );
      await tx.wait();
      expect(
        await implementationsMapping.getSigImplementation(
          layerAccountV2DefaultImplSigsV2[0]
        )
      ).to.be.equal(layerAccountV2DefaultImplV2.address);
      (
        await implementationsMapping.getImplementationSigs(
          layerAccountV2DefaultImplV2.address
        )
      ).forEach((a, i) => {
        expect(a).to.be.eq(layerAccountV2DefaultImplSigsV2[i]);
      });
    });
  });

  describe("Beta-mode", function () {
    it("Should build DSA v2", async function () {
      const tx = await layerIndex
        .connect(wallet0)
        .build(wallet0.address, 2, wallet0.address);
      const dsaWalletAddress = "0xC13920c134d38408871E7AF5C102894CB5180B92";
      expect((await tx.wait()).events[1].args.account).to.be.equal(
        dsaWalletAddress
      );
      acountV2DsaM1Wallet0 = await ethers.getContractAt(
        "LayerImplementationM1",
        dsaWalletAddress
      );

      acountV2DsaDefaultWallet0 = await ethers.getContractAt(
        "LayerDefaultImplementation",
        dsaWalletAddress
      );
      acountV2DsaBetaWallet0 = await ethers.getContractAt(
        "LayerImplementationBetaTest",
        dsaWalletAddress
      );
    });

    it("Should deploy Beta connector", async function () {
      const connectorName = "betaV2";
      await deployConnector({
        connectorName,
        contract: "ConnectV2Beta",
        factory: ConnectV2Beta__factory,
      });
      expect(!!addresses.connectors["betaV2"]).to.be.true;
      const tx = await layerConnectorsV2
        .connect(masterSigner)
        .addConnectors(["betaV2"], [addresses.connectors["betaV2"]]);
      const receipt = await tx.wait();
      const events = receipt.events;
      expect(events[0].args.connectorNameHash).to.be.eq(
        web3.utils.keccak256(connectorName)
      );
      expect(events[0].args.connectorName).to.be.eq(connectorName);
    });

    it("Should enable/disable beta-mode", async function () {
      const spell0 = {
        connector: "betaV2",
        method: "enable",
        args: [],
      };
      const encodedSpells = encodeSpells([spell0]);
      const tx0 = await acountV2DsaM1Wallet0
        .connect(wallet0)
        .cast(encodedSpells[0], encodedSpells[1], wallet0.address);
      const receipt0 = await tx0.wait();

      let enabled = await acountV2DsaDefaultWallet0.connect(wallet0).isBeta();
      expect(enabled).to.equal(true);

      const spell1 = {
        connector: "betaV2",
        method: "disable",
        args: [],
      };
      const encodedSpell1 = encodeSpells([spell1]);
      const tx1 = await acountV2DsaBetaWallet0
        .connect(wallet0)
        .castBeta(encodedSpell1[0], encodedSpell1[1], wallet0.address);
      const receipt1 = await tx1.wait();

      enabled = await acountV2DsaDefaultWallet0.connect(wallet0).isBeta();
      expect(enabled).to.equal(false);
    });
  });
});
