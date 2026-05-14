const { expect } = require("chai");
const { ethers } = require("hardhat");
const { mine } = require("@nomicfoundation/hardhat-network-helpers");

// Gas benchmarks — thresholds are generous but flag any regression
const GAS_LIMITS = {
  tokenDeploy:    3_500_000,
  timelockDeploy: 3_000_000,
  governorDeploy: 5_000_000,
  vaultDeploy:    1_500_000,
  delegate:         150_000,
  propose:          300_000,
  castVote:         150_000,
  queueProposal:    200_000,
  executeProposal:  350_000,
  dispenseFunds:    100_000,
  updateGrant:       80_000,
  sendEthToVault:    50_000,
};

// ─── Shared setup ─────────────────────────────────────────────────────────────
async function setup() {
  const [deployer, voter1, voter2, voter3, recipient] = await ethers.getSigners();

  const Token = await ethers.getContractFactory("DAOToken");
  const tokenTx = await Token.getDeployTransaction();
  const token = await Token.deploy();
  const tokenReceipt = await token.deploymentTransaction().wait();

  const Timelock = await ethers.getContractFactory("TimelockController");
  const timelock = await Timelock.deploy(0, [], [], deployer.address);
  const timelockReceipt = await timelock.deploymentTransaction().wait();

  const Governor = await ethers.getContractFactory("DAOGovernor");
  const governor = await Governor.deploy(await token.getAddress(), await timelock.getAddress());
  const governorReceipt = await governor.deploymentTransaction().wait();

  const Vault = await ethers.getContractFactory("CommunityVault");
  const vault = await Vault.deploy(await timelock.getAddress());
  const vaultReceipt = await vault.deploymentTransaction().wait();

  // Grant roles
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  const CANCELLER_ROLE = await timelock.CANCELLER_ROLE();
  const TIMELOCK_ADMIN_ROLE = await timelock.TIMELOCK_ADMIN_ROLE();
  await timelock.grantRole(PROPOSER_ROLE, await governor.getAddress());
  await timelock.grantRole(EXECUTOR_ROLE, await governor.getAddress());
  await timelock.grantRole(CANCELLER_ROLE, await governor.getAddress());
  await timelock.revokeRole(TIMELOCK_ADMIN_ROLE, deployer.address);

  // Distribute tokens & delegate
  for (const v of [voter1, voter2, voter3]) {
    await token.transfer(v.address, ethers.parseEther("1000"));
    await token.connect(v).delegate(v.address);
  }
  await token.delegate(deployer.address);
  await mine(1);

  // Fund vault
  await deployer.sendTransaction({ to: await vault.getAddress(), value: ethers.parseEther("10") });

  return {
    token, timelock, governor, vault,
    deployer, voter1, voter2, voter3, recipient,
    receipts: {
      token: tokenReceipt,
      timelock: timelockReceipt,
      governor: governorReceipt,
      vault: vaultReceipt
    }
  };
}

// ══════════════════════════════════════════════════════════════════════════════
//  GAS OPTIMIZATION & PERFORMANCE TESTS
// ══════════════════════════════════════════════════════════════════════════════
describe("Gas Optimization & Performance", function () {

  let ctx;
  before(async () => { ctx = await setup(); });

  // ── 1. Deployment Gas ────────────────────────────────────────────────────
  describe("1. Deployment Gas Costs", () => {
    it(`DAOToken deploy ≤ ${GAS_LIMITS.tokenDeploy.toLocaleString()} gas`, async () => {
      const gas = ctx.receipts.token.gasUsed;
      console.log(`   DAOToken deploy: ${gas.toLocaleString()} gas`);
      expect(gas).to.be.lte(GAS_LIMITS.tokenDeploy);
    });

    it(`TimelockController deploy ≤ ${GAS_LIMITS.timelockDeploy.toLocaleString()} gas`, async () => {
      const gas = ctx.receipts.timelock.gasUsed;
      console.log(`   Timelock deploy: ${gas.toLocaleString()} gas`);
      expect(gas).to.be.lte(GAS_LIMITS.timelockDeploy);
    });

    it(`DAOGovernor deploy ≤ ${GAS_LIMITS.governorDeploy.toLocaleString()} gas`, async () => {
      const gas = ctx.receipts.governor.gasUsed;
      console.log(`   Governor deploy: ${gas.toLocaleString()} gas`);
      expect(gas).to.be.lte(GAS_LIMITS.governorDeploy);
    });

    it(`CommunityVault deploy ≤ ${GAS_LIMITS.vaultDeploy.toLocaleString()} gas`, async () => {
      const gas = ctx.receipts.vault.gasUsed;
      console.log(`   Vault deploy:    ${gas.toLocaleString()} gas`);
      expect(gas).to.be.lte(GAS_LIMITS.vaultDeploy);
    });
  });

  // ── 2. Token Operation Gas ────────────────────────────────────────────────
  describe("2. Token Operations", () => {
    it(`delegate() ≤ ${GAS_LIMITS.delegate.toLocaleString()} gas`, async () => {
      const { token, deployer } = ctx;
      // Re-delegate to measure
      const tx = await token.connect(deployer).delegate(deployer.address);
      const receipt = await tx.wait();
      console.log(`   delegate: ${receipt.gasUsed.toLocaleString()} gas`);
      expect(receipt.gasUsed).to.be.lte(GAS_LIMITS.delegate);
    });
  });

  // ── 3. Governance Lifecycle Gas ───────────────────────────────────────────
  describe("3. Governance Lifecycle", () => {
    let proposalId, targets, values, calldatas, descHash;

    it(`propose() ≤ ${GAS_LIMITS.propose.toLocaleString()} gas`, async () => {
      const { governor, vault } = ctx;
      const desc = "Gas Test Proposal";
      descHash = ethers.id(desc);
      targets = [await vault.getAddress()];
      values = [0n];
      calldatas = ["0x"];

      const tx = await governor.connect(ctx.deployer).propose(targets, values, calldatas, desc);
      const receipt = await tx.wait();
      proposalId = receipt.logs[0].args[0];
      console.log(`   propose: ${receipt.gasUsed.toLocaleString()} gas`);
      expect(receipt.gasUsed).to.be.lte(GAS_LIMITS.propose);
    });

    it(`castVote() ≤ ${GAS_LIMITS.castVote.toLocaleString()} gas`, async () => {
      const { governor, voter1, voter2, voter3 } = ctx;
      await mine(2); // pass voting delay
      const tx = await governor.connect(voter1).castVote(proposalId, 1);
      const receipt = await tx.wait();
      // Let others vote too for quorum
      await governor.connect(voter2).castVote(proposalId, 1);
      await governor.connect(voter3).castVote(proposalId, 1);
      console.log(`   castVote: ${receipt.gasUsed.toLocaleString()} gas`);
      expect(receipt.gasUsed).to.be.lte(GAS_LIMITS.castVote);
    });

    it(`queue() ≤ ${GAS_LIMITS.queueProposal.toLocaleString()} gas`, async () => {
      const { governor } = ctx;
      await mine(55); // pass voting period
      const tx = await governor.queue(targets, values, calldatas, descHash);
      const receipt = await tx.wait();
      console.log(`   queue: ${receipt.gasUsed.toLocaleString()} gas`);
      expect(receipt.gasUsed).to.be.lte(GAS_LIMITS.queueProposal);
    });

    it(`execute() ≤ ${GAS_LIMITS.executeProposal.toLocaleString()} gas`, async () => {
      const { governor } = ctx;
      const tx = await governor.execute(targets, values, calldatas, descHash);
      const receipt = await tx.wait();
      console.log(`   execute: ${receipt.gasUsed.toLocaleString()} gas`);
      expect(receipt.gasUsed).to.be.lte(GAS_LIMITS.executeProposal);
    });
  });

  // ── 4. Vault Operations Gas ───────────────────────────────────────────────
  describe("4. Vault Operations", () => {
    it(`sendETH to vault (receive) ≤ ${GAS_LIMITS.sendEthToVault.toLocaleString()} gas`, async () => {
      const { vault, deployer } = ctx;
      const tx = await deployer.sendTransaction({ to: await vault.getAddress(), value: 1n });
      const receipt = await tx.wait();
      console.log(`   receive ETH: ${receipt.gasUsed.toLocaleString()} gas`);
      expect(receipt.gasUsed).to.be.lte(GAS_LIMITS.sendEthToVault);
    });
  });

  // ── 5. Compiler Optimization Validation ──────────────────────────────────
  describe("5. Optimizer Sanity", () => {
    it("governor should have bytecode size within EIP-170 limit (24KB)", async () => {
      const { governor } = ctx;
      const code = await ethers.provider.getCode(await governor.getAddress());
      const sizeBytes = (code.length - 2) / 2; // remove 0x prefix, 2 hex chars = 1 byte
      const sizeKB = (sizeBytes / 1024).toFixed(2);
      console.log(`   Governor bytecode: ${sizeKB} KB`);
      expect(sizeBytes).to.be.lte(24 * 1024); // EIP-170: 24,576 bytes max
    });

    it("vault should have bytecode size within EIP-170 limit (24KB)", async () => {
      const { vault } = ctx;
      const code = await ethers.provider.getCode(await vault.getAddress());
      const sizeBytes = (code.length - 2) / 2;
      const sizeKB = (sizeBytes / 1024).toFixed(2);
      console.log(`   Vault bytecode: ${sizeKB} KB`);
      expect(sizeBytes).to.be.lte(24 * 1024);
    });

    it("DAOToken should have bytecode size within EIP-170 limit (24KB)", async () => {
      const { token } = ctx;
      const code = await ethers.provider.getCode(await token.getAddress());
      const sizeBytes = (code.length - 2) / 2;
      const sizeKB = (sizeBytes / 1024).toFixed(2);
      console.log(`   Token bytecode: ${sizeKB} KB`);
      expect(sizeBytes).to.be.lte(24 * 1024);
    });
  });

  // ── 6. View Function Performance ─────────────────────────────────────────
  describe("6. View Functions (zero-gas reads)", () => {
    it("governor settings are readable without gas", async () => {
      const { governor } = ctx;
      const [delay, period, threshold] = await Promise.all([
        governor.votingDelay(),
        governor.votingPeriod(),
        governor.proposalThreshold()
      ]);
      expect(delay).to.equal(1n);
      expect(period).to.equal(50n);
      expect(threshold).to.equal(ethers.parseEther("100"));
    });

    it("vault balance is readable without gas", async () => {
      const { vault } = ctx;
      const bal = await vault.getVaultBalance();
      expect(bal).to.be.gt(0n);
    });
  });
});
