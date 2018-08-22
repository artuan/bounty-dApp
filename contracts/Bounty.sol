 pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

/// @title Final project for ConsenSys Academy 2018
/// @author Miha Perosa
/// @notice 
/// @dev 
contract Bounty is Ownable {

    /* bountiesCount = number of bounties */
    uint public funds;
    uint private bountiesCount;

    /* Mapping the markets based on the id */
    mapping(uint => Job) public bounties;
    // mapping(address => uint) public addressStore;
    
    // address[16] public adopters;

    enum BountyStatus { Open, Close }
    enum SubmissionStatus { UnderReview, Approved, Rejected }

    /* Bounty */
    struct Job {
        address owner;
        uint bid;
        string name;
        string description;
        uint amount;
        BountyStatus status;
        uint submissionCount;
        mapping (uint => Submission) submissions;
    }

	/* Bounty Submission */
    struct Submission {
        address owner;
        uint sid;
        string description;
        SubmissionStatus status;
    }

    /* Events */
    event BountyCreated(uint bid);
    event SubmissionCreated(uint sid);
    event NewSubmissionAddedToBounty(uint sid);
    event SubmissionRejected(uint bid, uint sid);
    event SubmissionApproved(uint bid, uint sid);
    event MoneyTransfaredAfterApprovedBounty(uint bid);
    event SubmissionStatusUpdated(uint bid, uint sid);
    event SubmissionDeleted(uint bid, uint sid);	

    /* Modifiers */

    /// @notice Explain to a user what a function does
    /// @dev Explain to a developer any extra details
    /// @param _bid Bounty id
    /// @return return if the bounty owner is not the sender

    modifier onlyBountyOwner(uint _bid) {
        require(bounties[_bid].owner == msg.sender, "Bounty owner error");
        _;
    }

    modifier onlyIfBountyExists(uint _bid) {
        require(bounties[_bid].owner != 0, "Bounty required");
        _;
    }

	modifier onlyIfBountyStatusNotClosed(uint _bid) {
        require(bounties[_bid].status != BountyStatus.Close, "Bounty is closed.");
        _;
    }

    modifier onlyIfSubmissionExists(uint _bid, uint _sid) {
        require(bounties[_bid].owner != 0, "Bounty required");
        require(bounties[_bid].submissions[_sid].owner != 0, "Submission required");
        _;
    }

    modifier onlySubmissionOwner(uint _bid, uint _sid) {
        require(bounties[_bid].submissions[_sid].owner == msg.sender, "Submission owner error");
        _;
    }

    // Constructor,
    constructor() public {       
    }

    function createBounty(string _name, string _description)
        // noStoreYet(msg.sender)
        public 
		payable
    {
        funds += msg.value;
		bounties[bountiesCount] = Job({owner: msg.sender, bid: bountiesCount, name: _name, description: _description, amount: msg.value, status: BountyStatus.Open, submissionCount: 0 });
        emit BountyCreated(bountiesCount);
        bountiesCount = bountiesCount + 1;
    }	

    /* Get bounty info */
    function getBounty(uint _bid) 
		onlyIfBountyExists(_bid)
		public view returns (address owner, uint bid, string name, string description, uint amount, BountyStatus status) 
	{
        owner = bounties[_bid].owner;
        bid = bounties[_bid].bid;
        name = bounties[_bid].name;
        description = bounties[_bid].description;
        amount = bounties[_bid].amount;
        status = bounties[_bid].status;		
        return (owner, bid, name, description, amount, status);
    }

	/* Get bounties Count */
    function getBountiesCount() public view returns (uint count) {
        count = bountiesCount;
        return (count);
    }

	/* Get item to bounty */
    function updateSubmissionStatus(uint _bid, uint _sid, SubmissionStatus _status)
		onlyIfSubmissionExists(_bid, _sid)
		onlyIfBountyStatusNotClosed(_bid)
		onlyBountyOwner(_bid)
        public 
    {
        bounties[_bid].submissions[_sid].status = _status;
        emit SubmissionStatusUpdated(_bid, _sid);
    }

    function rejectSubmission(uint _bid, uint _sid)
		onlyIfSubmissionExists(_bid, _sid)
		onlyIfBountyStatusNotClosed(_bid)
		onlyBountyOwner(_bid)
        public 
    {
        bounties[_bid].submissions[_sid].status = SubmissionStatus.Rejected;
        emit SubmissionRejected(_bid, _sid);
    }

		/* Get item to bounty */
    function acceptSubmission(uint _bid, uint _sid)
		onlyIfSubmissionExists(_bid, _sid)
		onlyIfBountyStatusNotClosed(_bid)
		onlyBountyOwner(_bid)
        public 
    {
        uint length = bounties[_bid].submissionCount;
        bounties[_bid].status = BountyStatus.Close;
        for (uint i=0; i < length; i++) {
            if(i == _sid) {
                bounties[_bid].submissions[i].status = SubmissionStatus.Approved;
                emit SubmissionApproved(_bid, _sid);
			} else {
                bounties[_bid].submissions[i].status = SubmissionStatus.Rejected;
			}
        }
        address receiver = bounties[_bid].submissions[_sid].owner;
        uint amount = bounties[_bid].amount;

        if(funds >= amount) {
            funds = funds - amount;
            receiver.transfer(amount);
		}

		
		
        emit MoneyTransfaredAfterApprovedBounty(_bid);
    }

	/* Add submission to bounty */
    function addSubmissionToBounty(uint _bid, string _description)
		onlyIfBountyExists(_bid)
        public 
    {
        uint index = bounties[_bid].submissionCount;
        bounties[_bid].submissions[index] = Submission({owner: msg.sender, sid: index, description: _description, status: SubmissionStatus.UnderReview});
        bounties[_bid].submissionCount = index + 1;
        emit NewSubmissionAddedToBounty(_bid);
    }

	/* Get bounties Count */
    function getSubmissionStatus(uint _bid, uint _sid) public view returns (SubmissionStatus status) {
        status = bounties[_bid].submissions[_sid].status;
        return (status);
    }

	/* Get bounties Count */
    function getSubmissionCount(uint _bid) public view returns (uint count) {
        count = bounties[_bid].submissionCount;
        return (count);
    }

    /* Get bounty info */
    function getSubmission(uint _bid, uint _sid) public view returns (address owner, uint sid, string description, SubmissionStatus status) {
        owner = bounties[_bid].submissions[_sid].owner;
        sid = bounties[_bid].submissions[_sid].sid;
        description = bounties[_bid].submissions[_sid].description;
        status = bounties[_bid].submissions[_sid].status;
        return (owner, sid, description, status);
    }
}