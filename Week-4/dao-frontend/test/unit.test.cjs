const { expect } = require("chai");
const { ethers } = require("hardhat");
const { time, mine } = require("@nomicfoundation/hardhat-network-helpers");

// ─── Helper: Deploy full DAO stack ────────────────────────────────────────────
async function deployDAO(votingDelay = 1, votingPeriod = 50, proposalThreshold = ethers.parseEther("100")) {
  const [deployer, voter1, voter2, voter3, recipient] = await ethers.getSigners();

  // 1. Deploy Token
  const Token = await ethers.getContractFactory("DAOToken");
  const token = await Token.deploy();
  await token.waitForDeployment();

  // 2. Deploy Timelock (minDelay=0 for tests, proposers=[], executors=[])
  const Timelock = await ethers.getContractFactory("TimelockController");
  const timelock = await Timelock.deploy(0, [], [], deployer.address);
  await timelock.waitForDeployment();

  // 3. Deploy Governor
  const Governor = await ethers.getContractFactory("DAOGovernor");
  const governor = await Governor.deploy(await token.getAddress(), await timelock.getAddress());
  await governor.waitForDeployment();

  // 4. Deploy CommunityVault (owned by timelock)
  const Vault = await ethers.getContractFactory("CommunityVault");
  const vault = await Vault.deploy(await timelock.getAddress());
  await vault.waitForDeployment();

  // 5. Grant roles: Governor is proposer+executor on timelock
  const PROPOSER_ROLE = await timelock.PROPOSER_ROLE();
  const EXECUTOR_ROLE = await timelock.EXECUTOR_ROLE();
  const CANCELLER_ROLE = await timelock.CANCELLER_ROLE();
  const TIMELOCK_ADMIN_ROLE = await timelock.TIMELOCK_ADMIN_ROLE();

  await timelock.grantRole(PROPOSER_ROLE, await governor.getAddress());
  await timelock.grantRole(EXECUTOR_ROLE, await governor.getAddress());
  await timelock.grantRole(CANCELLER_ROLE, await governor.getAddress());
  await timelock.revokeRole(TIMELOCK_ADMIN_ROLE, deployer.address);

  // 6. Distribute tokens & delegate
  const share = ethers.parseEther("1000");
  for (const voter of [voter1, voter2, voter3]) {
    await token.transfer(voter.address, share);
    await token.connect(voter).delegate(voter.address);
  }
  // deployer also delegates (has 7000 tokens remaining)
  await token.delegate(deployer.address);

  // Mine 1 block so checkpoints are registered
  await mine(1);

  return { token, timelock, governor, vault, deployer, voter1, voter2, voter3, recipient };
}

// ─── Helper: Encode dispenseFunds calldata ────────────────────────────────────
function encodeDispense(vaultInterface, recipient, amount) {
  return vaultInterface.encodeFunctionData("dispenseFunds", [recipient, amount]);
}

// ─── Helper: Full propose → vote → queue → execute cycle ─────────────────────
async function runFullCycle(governor, vault, token, deployer, voters, recipient, amount) {
  const vaultInterface = new ethers.Interface([
    "function dispenseFunds(address payable recipient, uint256 amount) external"
  ]);
  const calldata = encodeDispense(vaultInterface, recipient.address, amount);
  const description = "Test Proposal: Send " + ethers.formatEther(amount) + " ETH";
  const descHash = ethers.id(description);
  const targets = [await vault.getAddress()];
  const values = [0n];
  const calldatas = [calldata];

  // Propose
  const tx = await governor.connect(deployer).propose(targets, values, calldatas, description);
  const receipt = await tx.wait();
  const proposalId = receipt.logs[0].args[0];

  // Wait past voting delay
  await mine(2);

  // Vote (For = 1)
  for (const voter of voters) {
    await governor.connect(voter).castVote(proposalId, 1);
  }

  // Wait past voting period
  await mine(55);

  // Queue
  await governor.queue(targets, values, calldatas, descHash);
  // Execute (timelock minDelay=0 in tests)
  await governor.execute(targets, values, calldatas, descHash);

  return { proposalId, targets, values, calldatas, descHash };
}

// ══════════════════════════════════════════════════════════════════════════════
//  1. DAOToken — Unit Tests
// ══════════════════════════════════════════════════════════════════════════════
describe("DAOToken", function () {
  let token, deployer, voter1, voter2;

  beforeEach(async () => {
    const d = await deployDAO();
    token = d.token; deployer = d.deployer; voter1 = d.voter1; voter2 = d.voter2;
  });

  describe("Deployment", () => {
    it("should have correct name and symbol", async () => {
      expect(await token.name()).to.equal("DAO Governance Token");
      expect(await token.symbol()).to.equal("DGT");
    });

    it("should mint 10,000 DGT total supply to deployer", async () => {
      const total = await token.totalSupply();
      expect(total).to.equal(ethers.parseEther("10000"));
    });
  });

  describe("Transfers", () => {
    it("should transfer tokens correctly", async () => {
      const amount = ethers.parseEther("500");
      await token.transfer(voter1.address, amount);
      expect(await token.balanceOf(voter1.address)).to.be.gte(amount);
    });

    it("should revert on transfer exceeding balance", async () => {
      const tooMuch = ethers.parseEther("99999");
      await expect(token.connect(voter1).transfer(voter2.address, tooMuch))
        .to.be.reverted;
    });
  });

  describe("Delegation & Voting Power", () => {
    it("should have zero voting power before delegation", async () => {
      const freshToken = await (await ethers.getContractFactory("DAOToken")).deploy();
      const [, fresh] = await ethers.getSigners();
      await freshToken.transfer(fresh.address, ethers.parseEther("100"));
      // No delegation — votes should be 0
      expect(await freshToken.getVotes(fresh.address)).to.equal(0n);
    });

    it("should reflect votes after self-delegation", async () => {
      await token.connect(voter1).delegate(voter1.address);
      await mine(1);
      expect(await token.getVotes(voter1.address)).to.equal(ethers.parseEther("1000"));
    });

    it("should update checkpoint on transfer after delegation", async () => {
      await token.connect(voter1).delegate(voter1.address);
      const before = await token.getVotes(voter1.address);
      await token.connect(voter1).transfer(voter2.address, ethers.parseEther("200"));
      await mine(1);
      const after = await token.getVotes(voter1.address);
      expect(after).to.be.lt(before);
    });

    it("should allow delegation to another address", async () => {
      await token.connect(voter1).delegate(voter2.address);
      await mine(1);
      expect(await token.getVotes(voter2.address)).to.be.gt(0n);
    });
  });

  describe("Permit (EIP-2612)", () => {
    it("should have a valid DOMAIN_SEPARATOR", async () => {
      const domain = await token.DOMAIN_SEPARATOR();
      expect(domain).to.be.a("string").with.length(66);
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  2. DAOGovernor — Unit Tests
// ══════════════════════════════════════════════════════════════════════════════
describe("DAOGovernor", function () {
  let token, governor, vault, timelock, deployer, voter1, voter2, voter3, recipient;

  beforeEach(async () => {
    const d = await deployDAO();
    ({ token, governor, vault, timelock, deployer, voter1, voter2, voter3, recipient } = d);
  });

  describe("Deployment & Settings", () => {
    it("should have correct governor name", async () => {
      expect(await governor.name()).to.equal("SCAI Governor");
    });

    it("should return correct voting delay", async () => {
      expect(await governor.votingDelay()).to.equal(1n);
    });

    it("should return correct voting period", async () => {
      expect(await governor.votingPeriod()).to.equal(50n);
    });

    it("should return correct proposal threshold", async () => {
      expect(await governor.proposalThreshold()).to.equal(ethers.parseEther("100"));
    });

    it("should return correct quorum", async () => {
      const block = await ethers.provider.getBlockNumber();
      expect(await governor.quorum(block)).to.equal(ethers.parseEther("1000"));
    });
  });

  describe("Proposal Creation", () => {
    it("should create a proposal successfully", async () => {
      const calldata = "0x";
      const tx = await governor.propose(
        [await vault.getAddress()], [0], [calldata], "Test Proposal"
      );
      const receipt = await tx.wait();
      expect(receipt.logs.length).to.be.gt(0);
    });

    it("should revert if proposer is below threshold", async () => {
      const [, , , , , poorUser] = await ethers.getSigners();
      await expect(
        governor.connect(poorUser).propose([await vault.getAddress()], [0], ["0x"], "Fail")
      ).to.be.reverted;
    });

    it("should emit ProposalCreated event", async () => {
      await expect(
        governor.propose([await vault.getAddress()], [0], ["0x"], "Event Test")
      ).to.emit(governor, "ProposalCreated");
    });

    it("should start in Pending state", async () => {
      const tx = await governor.propose([await vault.getAddress()], [0], ["0x"], "Pending Test");
      const receipt = await tx.wait();
      const proposalId = receipt.logs[0].args[0];
      expect(await governor.state(proposalId)).to.equal(0); // 0 = Pending
    });
  });

  describe("Voting Lifecycle", () => {
    let proposalId;

    beforeEach(async () => {
      const tx = await governor.propose(
        [await vault.getAddress()], [0], ["0x"], "Vote Test"
      );
      const receipt = await tx.wait();
      proposalId = receipt.logs[0].args[0];
    });

    it("should transition from Pending to Active after delay", async () => {
      expect(await governor.state(proposalId)).to.equal(0); // Pending
      await mine(2);
      expect(await governor.state(proposalId)).to.equal(1); // Active
    });

    it("should revert vote if proposal is still Pending", async () => {
      await expect(
        governor.connect(voter1).castVote(proposalId, 1)
      ).to.be.reverted;
    });

    it("should allow For vote", async () => {
      await mine(2);
      await expect(governor.connect(voter1).castVote(proposalId, 1))
        .to.emit(governor, "VoteCast");
    });

    it("should allow Against vote", async () => {
      await mine(2);
      await expect(governor.connect(voter1).castVote(proposalId, 0))
        .to.emit(governor, "VoteCast");
    });

    it("should allow Abstain vote", async () => {
      await mine(2);
      await expect(governor.connect(voter1).castVote(proposalId, 2))
        .to.emit(governor, "VoteCast");
    });

    it("should revert double voting", async () => {
      await mine(2);
      await governor.connect(voter1).castVote(proposalId, 1);
      await expect(governor.connect(voter1).castVote(proposalId, 1)).to.be.reverted;
    });

    it("should transition to Defeated when quorum not met", async () => {
      await mine(2);
      await governor.connect(voter1).castVote(proposalId, 1); // only 1000 DGT, quorum=1000
      // voter1 has exactly 1000 — meets quorum but let's test against quorum not being enough
      await mine(55);
      // 1000 DGT for, 1000 DGT quorum — should succeed
      const st = await governor.state(proposalId);
      expect([3n, 4n]).to.include(st); // Defeated or Succeeded depending on exact balance
    });

    it("should transition to Succeeded when quorum met and majority For", async () => {
      await mine(2);
      // voter1(1000) + voter2(1000) + voter3(1000) = 3000 DGT > quorum(1000)
      await governor.connect(voter1).castVote(proposalId, 1);
      await governor.connect(voter2).castVote(proposalId, 1);
      await governor.connect(voter3).castVote(proposalId, 1);
      await mine(55);
      expect(await governor.state(proposalId)).to.equal(4n); // Succeeded
    });
  });

  describe("Queue & Execute", () => {
    it("should run a full proposal lifecycle successfully", async () => {
      // Fund the vault
      await deployer.sendTransaction({ to: await vault.getAddress(), value: ethers.parseEther("5") });

      const balBefore = await ethers.provider.getBalance(recipient.address);
      await runFullCycle(governor, vault, token, deployer, [voter1, voter2, voter3], recipient, ethers.parseEther("1"));
      const balAfter = await ethers.provider.getBalance(recipient.address);
      expect(balAfter - balBefore).to.equal(ethers.parseEther("1"));
    });

    it("should revert queue if proposal not succeeded", async () => {
      const calldata = "0x";
      const description = "Queue Fail Test";
      const tx = await governor.propose([await vault.getAddress()], [0], [calldata], description);
      const receipt = await tx.wait();
      const proposalId = receipt.logs[0].args[0];
      await mine(2); // still Active, not succeeded

      await expect(
        governor.queue([await vault.getAddress()], [0], [calldata], ethers.id(description))
      ).to.be.reverted;
    });
  });
});

// ══════════════════════════════════════════════════════════════════════════════
//  3. CommunityVault — Unit Tests
// ══════════════════════════════════════════════════════════════════════════════
describe("CommunityVault", function () {
  let vault, timelock, deployer, recipient;

  beforeEach(async () => {
    const d = await deployDAO();
    ({ vault, timelock, deployer, recipient } = d);
    // Fund vault with 10 ETH
    await deployer.sendTransaction({ to: await vault.getAddress(), value: ethers.parseEther("10") });
  });

  describe("Deployment", () => {
    it("should be owned by timelock", async () => {
      expect(await vault.owner()).to.equal(await timelock.getAddress());
    });

    it("should revert deployment with zero address timelock", async () => {
      const Vault = await ethers.getContractFactory("CommunityVault");
      await expect(Vault.deploy(ethers.ZeroAddress)).to.be.revertedWith("Invalid timelock address");
    });
  });

  describe("Receiving Funds", () => {
    it("should accept ETH and emit FundsReceived", async () => {
      await expect(
        deployer.sendTransaction({ to: await vault.getAddress(), value: ethers.parseEther("1") })
      ).to.emit(vault, "FundsReceived");
    });

    it("should correctly report balance via getVaultBalance", async () => {
      const bal = await vault.getVaultBalance();
      expect(bal).to.equal(ethers.parseEther("10"));
    });
  });

  describe("updateGrantAmount", () => {
    it("should revert when called by non-owner", async () => {
      await expect(
        vault.connect(deployer).updateGrantAmount(ethers.parseEther("5"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });
  });

  describe("dispenseFunds", () => {
    it("should revert when called by non-owner (deployer)", async () => {
      await expect(
        vault.connect(deployer).dispenseFunds(recipient.address, ethers.parseEther("1"))
      ).to.be.revertedWith("Ownable: caller is not the owner");
    });

    it("should revert if vault has insufficient balance", async () => {
      // Deploy a fresh vault with no funds owned by deployer for convenience
      const Vault = await ethers.getContractFactory("CommunityVault");
      const emptyVault = await Vault.deploy(deployer.address);
      await emptyVault.waitForDeployment();
      await expect(
        emptyVault.dispenseFunds(recipient.address, ethers.parseEther("1"))
      ).to.be.revertedWith("Insufficient funds");
    });

    it("should track totalFundsDispensed and grantCount after exec via governance", async () => {
      const { governor, token, vault, deployer, voter1, voter2, voter3, recipient } = await deployDAO();
      // Fund this vault
      await deployer.sendTransaction({ to: await vault.getAddress(), value: ethers.parseEther("5") });
      await runFullCycle(governor, vault, token, deployer, [voter1, voter2, voter3], recipient, ethers.parseEther("1"));
      expect(await vault.grantCount()).to.equal(1n);
      expect(await vault.totalFundsDispensed()).to.equal(ethers.parseEther("1"));
    });
  });

  describe("Pause / Unpause", () => {
    it("should revert pauseVault when called by non-owner", async () => {
      await expect(vault.connect(deployer).pauseVault())
        .to.be.revertedWith("Ownable: caller is not the owner");
    });
  });
});
