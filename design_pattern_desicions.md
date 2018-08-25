## Design pattern

In the bounty dApp contract I used many modifiers that check almost every function before executing it. 

Contract modifiers:

```solidity
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
```

Example of use in rejectSubmission function:

```solidity
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
```