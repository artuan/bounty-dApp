 pragma solidity ^0.4.24;

import 'openzeppelin-solidity/contracts/ownership/Ownable.sol';

/*
 @title Bounty - Decentlized app for creating bounties or job offers 
 payed in Ether.
 @author Miha Perosa
 @notice This contract is was written for ConsenSys Academy’s 2018 Developer Program final project.
 @dev the contract ownership can be transfared
*/
contract Bounty is Ownable {

    /// @dev We keep track of the Ether that the contract has.
    uint public funds;
    /// @dev Store the number of bounties.
    uint private bountiesCount;

    /// @dev Mapping function that maps id of the bounty/job to a bounty item. 
    mapping(uint => Job) public bounties;

    /// @dev Bounty can have Open and Close status.
    enum BountyStatus { Open, Close }
    /// @dev Submission can have UnderReview, Approved and Rejected status.
    enum SubmissionStatus { UnderReview, Approved, Rejected }

    /// @dev Structure that containing the bounty data. The structure name is Job because the main contract was named Bounty.
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

	/// @dev Submission structure
    struct Submission {
        address owner;
        uint sid;
        string description;
        SubmissionStatus status;
    }

    /// @dev Events related to bounty.
    event BountyCreated(uint bid);
    event MoneyTransfaredAfterApprovedBounty(uint bid);
    /// @dev Submission events related to bounty.
    event SubmissionCreated(uint sid);
    event NewSubmissionAddedToBounty(uint sid);
    event SubmissionRejected(uint bid, uint sid);
    event SubmissionApproved(uint bid, uint sid);

    /// @notice Modifier that checks if the interacting user is the owner of the bounty.
    /// @param _bid Bounty id.
    /// @return return if the bounty owner is not the sender.
    modifier onlyBountyOwner(uint _bid) {
        require(bounties[_bid].owner == msg.sender, "Bounty owner error");
        _;
    }

    /// @notice Modifier that checks if bounty exists.
    /// @param _bid Bounty id.
    modifier onlyIfBountyExists(uint _bid) {
        require(bounties[_bid].owner != 0, "Bounty required");
        _;
    }

    /// @notice Modifier that checks if bounty is open.
    /// @param _bid Bounty id.
    modifier onlyIfBountyStatusNotClosed(uint _bid) {
        require(bounties[_bid].status != BountyStatus.Close, "Bounty is closed.");
        _;
    }

    /// @notice Modifier that checks if submission exisits.
    /// @param _bid Bounty id.
    /// @param _sid Submission id.
    modifier onlyIfSubmissionExists(uint _bid, uint _sid) {
        require(bounties[_bid].owner != 0, "Bounty required");
        require(bounties[_bid].submissions[_sid].owner != 0, "Submission required");
        _;
    }

    /// @notice Constructor.
    constructor() public {
        funds = 0;
        bountiesCount = 0;
    }

    /// @notice Create a bounty.
    /// @dev The function is payable.
    /// @param _name Bounty name.
    /// @param _description Bounty description.
    function createBounty(string _name, string _description)
        public 
		payable
    {
        funds += msg.value;
        bounties[bountiesCount] = Job(
            {owner: msg.sender, bid: bountiesCount, name: _name,
            description: _description, amount: msg.value, status: BountyStatus.Open, 
            submissionCount: 0 
            }
        );
        emit BountyCreated(bountiesCount);
        bountiesCount = bountiesCount + 1;
    }	

    /// @notice Get bounty with id.
    /// @param _bid Bounty id.
    /// @return owner, bid, name, description, amount, status
    function getBounty(uint _bid) 
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

    /// @notice Function for getting the number of bounties.
    /// @dev This is a helper function for iterating over bounties.
    /// @return count
    function getBountiesCount() public view returns (uint count) {
        count = bountiesCount;
        return (count);
    }

    /// @notice Function for rejecting a submission.
    /// @param _bid Bounty id.
    /// @param _sid Submission id.
    function rejectSubmission(uint _bid, uint _sid)
		onlyIfSubmissionExists(_bid, _sid)
		onlyIfBountyStatusNotClosed(_bid)
		onlyBountyOwner(_bid)
        public 
    {
        bounties[_bid].submissions[_sid].status = SubmissionStatus.Rejected;
        emit SubmissionRejected(_bid, _sid);
    }

    /// @notice Function for accepting a submission.
    /// @dev Function updates the status of bounty to close and rejects all other submissions.
    /// @param _bid Bounty id.
    /// @param _sid Submission id.
    function acceptSubmission(uint _bid, uint _sid)
		onlyIfSubmissionExists(_bid, _sid)
		onlyIfBountyStatusNotClosed(_bid)
		onlyBountyOwner(_bid)
        public 
    {
        bounties[_bid].status = BountyStatus.Close;
        uint length = bounties[_bid].submissionCount;
        for (uint i = 0; i < length; i++) {
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
            emit MoneyTransfaredAfterApprovedBounty(_bid);
		}
    }

    /// @notice Add a submission to bounty.
    /// @param _bid Bounty id.
    /// @param _description Submission description.
    function addSubmissionToBounty(uint _bid, string _description)
		onlyIfBountyExists(_bid)
        public 
    {
        uint index = bounties[_bid].submissionCount;
        bounties[_bid].submissions[index] = Submission({owner: msg.sender, sid: index, description: _description, status: SubmissionStatus.UnderReview});
        bounties[_bid].submissionCount = index + 1;
        emit NewSubmissionAddedToBounty(_bid);
    }

    /// @notice Function for getting the status of a submission.
    /// @dev This is a helper function for tests.
    /// @param _bid Bounty id.
    /// @param _sid Submission id.
    /// @return status
    function getSubmissionStatus(uint _bid, uint _sid) public view returns (SubmissionStatus status) {
        status = bounties[_bid].submissions[_sid].status;
        return (status);
    }

    /// @notice Function for getting the number of a submission.
    /// @dev This is a helper function for iterating over submissions.
    /// @param _bid Bounty id.
    /// @return count
    function getSubmissionCount(uint _bid) public view returns (uint count) {
        count = bounties[_bid].submissionCount;
        return (count);
    }

    /// @notice Get submission with id.
    /// @param _bid Bounty id.
    /// @param _sid Submission id
    /// @return owner, sid, description, status
    function getSubmission(uint _bid, uint _sid) public view returns (address owner, uint sid, string description, SubmissionStatus status) {
        owner = bounties[_bid].submissions[_sid].owner;
        sid = bounties[_bid].submissions[_sid].sid;
        description = bounties[_bid].submissions[_sid].description;
        status = bounties[_bid].submissions[_sid].status;
        return (owner, sid, description, status);
    }
}