import React from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import {DisplayBounty} from './Submissions'
import ErrorMsg from './ErrorMsg';

export default class SubmissionAdd extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null,
		}
		this.handleCreate = this.handleCreate.bind(this);
	}
	handleCreate(event, bid, web3, account, contract) {
		event.preventDefault();
		var err = [];
		this.setState({
			error: null
		})

		let description = event.target[0].value;

		if(!description) err.push("Description cannot be empty.");

		if(err.length) {
			this.setState({
				error: err
			})	
			return;
		}

		return contract.addSubmissionToBounty(bid, description, {from: account}).then((result) => {
			this.setState({
				redirect: true
			})
		}).catch((err) => {
			this.setState({
				error: [err.message]
			})
			console.log(this.state);
		})
	  }
  	render() {	  
		if (this.state.redirect) {
            return (
                <Redirect to={"/"+this.props.bid+"/submissions"} push />
            );
        } 
		return (
			<div>
				<h2>Create new submission</h2>
				<ErrorMsg error={this.state.error}/>	
				<DisplayBounty bounty={this.state.bounty}/>		
				<Form onSubmit={(event) => this.handleCreate(event, this.props.bid, this.props.web3, this.props.account,this.props.contract)}>
					<FormGroup>
						<Label for="description">Submission description</Label>
						<Input type="description" name="description" id="bountyDescription" placeholder="Bounty description" />
					</FormGroup>
					<Button color="primary">Add submission</Button>
				</Form>
			</div>
		);
  }
}