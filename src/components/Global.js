import React from 'react'
import { Button } from 'reactstrap';

export const ButtonViewBountySubmissions = ({id,itemAddress,contractAddress,parentRef}) => { 
	if (itemAddress === contractAddress) {
	  	return (
				<Button onClick={ () => parentRef.viewBounty(id) } color="primary">View submissions</Button>
		  );
	}
	return (<div></div>);
};

export const ButtonAcceptSubmission = ({bountyStatus,bountyAddress,contractAddress,parentRef,bid,sid,status}) => { 
	if (bountyAddress === contractAddress) {
		if(status === 0) {
			return (
				<Button onClick={ () => parentRef.acceptSubmission(bid,sid) } color="success">Accept</Button>
			);
		}
	}
	return (<div>/</div>);
};

export const ButtonRejectSubmission = ({bountyStatus,bountyAddress,contractAddress,parentRef,bid,sid,status}) => { 
	if (bountyAddress === contractAddress) {
		if(status === 0) {
			return (
				<Button onClick={ () => parentRef.rejectSubmission(bid,sid) } color="danger">Reject</Button>
			);
		}
	}
	return (<div>/</div>);
};
   
export const ButtonAddSubmissions = ({bounty, bid, parentRef}) => { 
	if(bounty){
		if(!bounty.status){
			return (
				<Button onClick={ () => parentRef.addSubmissionForBountyWithId(bid) } color="primary">New submission</Button>
			);
		} else {
			return (
				<div></div>
			);
		}
	} else {
		return (
			<div></div>
		);
	}
};

export const BountyStatusToText = ({status}) => { 
	if(status === 0) {
		return (
			<div>
				Open
			</div>
		);
	} else {
		return (
			<div>
				Closed
			</div>
		);
	}
	
};

export const SubmissionsStatusToText = ({status}) => { 
	if(status === 0) {
		return (
			<div>
				Under review
			</div>
		);
	} else if(status === 1) {
		return (
			<div>
				Accepted
			</div>
		);
	} else {
		return (
			<div>
				Rejected
			</div>
		);
	}
	
};