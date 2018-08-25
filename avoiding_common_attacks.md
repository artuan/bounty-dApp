## Avoiding common attacks

### Reentrancy calls


1. All internal variables are called before calling transfare.
2. Reentrancy is not possible due to```onlyIfBountyStatusNotClosed``` modifier.

acceptSubmission:

```solidity
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
```

### Integer Arithmetic Overflow

All integer variables are handled internally by contract logic and cannot be modified direclty by contract user.


