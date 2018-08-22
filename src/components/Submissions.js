import React from 'react';
import { Table } from 'reactstrap';
import {ButtonAcceptSubmission, ButtonRejectSubmission, ButtonAddSubmissions, SubmissionsStatusToText} from './Global';
import { Redirect } from 'react-router-dom';
import ErrorMsg from './ErrorMsg';

export const DisplayBounty = ({bounty}) => { 
	if (bounty) {
	  	return (
			<div>
				<h6>Bounty: {bounty.name} <br></br> Description: {bounty.description} <br></br>Price: {bounty.amount}(Ether)</h6>				
			</div>
		  );
	}
	return (<div></div>);
};
   

export default class Submissions extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null,
			bounty: null,
			submissions: [],
			web3: this.props.web3,
			account: this.props.account,
			contract: this.props.contract,
			bid: this.props.bid,
			addSubmission: null
		};
		this.acceptSubmission = this.acceptSubmission.bind(this)		
		this.rejectSubmission = this.rejectSubmission.bind(this)		
	}
	
	loadData = () => { 
		const bid = this.props.bid;
		this.props.contract.getBounty(bid, {from: this.props.account}).then((result) => {
			let amo = String(this.state.web3.fromWei(result[4], 'ether'));
			let tmp = this.state.bounty;	
			tmp = {owner: result[0], id: result[1], name: result[2], description: result[3], amount: amo, status: result[5].toNumber()}
			this.setState({
				bounty: tmp
			})
			console.log(this.state.bounty);
			this.props.contract.getSubmissionCount(bid, {from: this.props.account}).then((result) => {
				for (var i = 0; i < result.toNumber(); i++) { 
						this.props.contract.getSubmission(bid, i, {from: this.props.account}).then((result) => {
							let tmp = this.state.submissions;					
							tmp.push({owner: result[0], sid: result[1].toNumber(), description: result[2], status: result[3].toNumber()});
							this.setState({
								submissions: tmp
							})
						})
				}
			});	
		});
	}

	componentDidMount() {
		this.loadData();		
	}

	acceptSubmission(bid,sid){
		this.props.contract.acceptSubmission(bid, sid, {from: this.props.account}).then((result) => {
			this.setState({
				submissions: []
			})
			this.loadData();
		}).catch((err) => {
			this.setState({
				error: [err.message]
			})
		});
	}

	rejectSubmission(bid,sid){
		this.props.contract.rejectSubmission(bid, sid, {from: this.props.account}).then((result) => {
			this.setState({
				submissions: []
			})
			this.loadData();
		}).catch((err) => {
			this.setState({
				error: [err.message]
			})
		});
	}

	addSubmissionForBountyWithId(bid){
		this.setState({
			addSubmission: bid
		})
	}

  	render() {
		const bid = this.state.bid;
		if (this.state.addSubmission) {
            return (
                <Redirect to={"/"+bid+"/submissions/add"} push />
            );
        }     
		return (
			<div>
				<h2>Submissions</h2>	
				<ErrorMsg error={this.state.error}/>	
				<div>
				<DisplayBounty bounty={this.state.bounty}/>
				<ButtonAddSubmissions  bounty={this.state.bounty} bid={this.state.bid} parentRef={this}></ButtonAddSubmissions>		
					
				</div>
				<br></br>		
				<Table>
					<thead>
						<tr>
							<th>#</th>
							<th>Description</th>
							<th>Status</th>
							<th>Action</th>
							<th></th>
						</tr>
					</thead>
				<tbody>
				{this.state.submissions.map(function(item, key) {     
					return (
					<tr key={key}>
						<td>{key + 1}</td>
						<td>{item.description}</td>
						<td><SubmissionsStatusToText status={item.status} /></td>
						<td><ButtonAcceptSubmission bountyStatus={this.state.bounty.status} bid={this.state.bid} sid={item.sid} status={item.status} bountyAddress={this.state.bounty.address} contractAddress={this.state.address}  parentRef={this}></ButtonAcceptSubmission></td>
						<td><ButtonRejectSubmission bountyStatus={this.state.bounty.status} bid={this.state.bid} sid={item.sid} status={item.status} bountyAddress={this.state.bounty.address} contractAddress={this.state.address}  parentRef={this}></ButtonRejectSubmission></td>
					</tr>
					)
				},this)} 
				</tbody>
				</Table>
			</div>
		);
  }
}