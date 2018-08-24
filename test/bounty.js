var Bounty = artifacts.require("./Bounty.sol");

const UnderReview = 0;
const Approved = 1;
const Rejected = 2;
  
contract('Bounty', function(accounts) {

	const owner = accounts[0]
	const anonim  = accounts[1];
	const alice = accounts[2];
	const bob   = accounts[3];
	const carol = accounts[4];
	const dan   = accounts[5];
	const erin  = accounts[6];

	/// @notice Checks is bounty is correctly created and the amount ether on the contract is correct.
	it("should create two bounties from second and third account", async () => {
		const bounty = await Bounty.deployed();

		await bounty.createBounty("Bounty name 1", "Bounty description 1", {from: alice, value: 5});
		await bounty.createBounty("Bounty name 2", "Bounty description 2", {from: bob, value: 10});

		const firstBountyName = await bounty.getBounty(0,{from: alice});
		assert.equal(firstBountyName[2], "Bounty name 1", "Bounty name 1 doesn't match");

		const secondtBountyName = await bounty.getBounty(0,{from: alice});
		assert.equal(secondtBountyName[2], "Bounty name 1", "Bounty name 2 doesn't match");		

		assert.equal(await bounty.getBountiesCount({from: alice}), 2, "Number of bounties in contract does not match");
		
		assert.equal(await bounty.funds(), 15, "Amount of funds on contract is different than sum of send");
	});

	/// @notice Checks is function for submission is working correclty.
	it("should add three submissions to first and second bounty", async () => {
		const bounty = await Bounty.deployed();
		
		await bounty.addSubmissionToBounty(0, "Bounty 0 Submission 1 description", {from: carol});
		await bounty.addSubmissionToBounty(0, "Bounty 0 Submission 2 description", {from: dan});
		await bounty.addSubmissionToBounty(0, "Bounty 0 Submission 3 description", {from: erin});
		assert.equal(await bounty.getSubmissionCount(0), 3, "Number of submission in bounty 1 does not match");

		await bounty.addSubmissionToBounty(1, "Bounty 1 Submission 1 description", {from: carol});
		await bounty.addSubmissionToBounty(1, "Bounty 1 Submission 2 description", {from: dan});
		await bounty.addSubmissionToBounty(1, "Bounty 1 Submission 3 description", {from: erin});
		assert.equal(await bounty.getSubmissionCount(0), 3, "Number of submission in bounty 1 does not match");
	});

	/// @notice Rejecting a submission sschould change the status to Rejected.
	it("should reject first submission in first bounty", async () => {
		const bounty = await Bounty.deployed();

		await bounty.rejectSubmission(0, 0, {from: alice});
		assert.equal(await bounty.getSubmissionStatus(0,0), Rejected, "Status should be 1");
	});

		
	/// @notice It is imporatant that accepting a submission rejects all other submissions inside bount.
	it("should approve first submission in second bounty and reject other submissions", async () => {
		const bounty = await Bounty.deployed();		

		await bounty.acceptSubmission(1, 0, {from: bob});

		assert.equal(await bounty.getSubmissionStatus(1,0), Approved, "Status should be 1");
		assert.equal(await bounty.getSubmissionStatus(1,1), Rejected, "Status should be 2");
		assert.equal(await bounty.getSubmissionStatus(1,2), Rejected, "Status should be 2");
	});

	/// @notice Tests check if the the contract is coreclty distributing the ethers.
	it("should check if the amount of ether on the contract after approval is submission is 5", async () => {
		const bounty = await Bounty.deployed();		
		const funds = await bounty.funds();
		assert.equal(await bounty.funds(), 5, "Amount of funds on contract is wrong", funds);
	});	
});
