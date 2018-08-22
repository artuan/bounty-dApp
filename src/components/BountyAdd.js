import React from 'react';
import { Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { Redirect } from 'react-router-dom';
import ErrorMsg from './ErrorMsg';

export default class BountyAdd extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			error: null,
		}
		this.handleCreate = this.handleCreate.bind(this);
	}
	handleCreate(event, web3, account, contract) {
		event.preventDefault();
		var err = [];
		this.setState({
			error: null
		})

		let bountyName = event.target[0].value;
		let bountyDesc = event.target[1].value;
		let bountyPrice = parseFloat(event.target[2].value);

		if(!bountyName) err.push("Bounty name cannot be empty.");
		if(!bountyDesc) err.push("Description cannot be empty.");
		if(!bountyPrice) err.push("Price is not valid.");

		if(err.length) {
			this.setState({
				error: err
			})	
			return;
		}
		let amount = web3.toWei(event.target[2].value, "ether");

		return contract.createBounty(bountyName, bountyDesc, {from: account, value: amount}).then((result) => {
			this.setState({
				redirect: true
			})
		}).catch((err) => {
			this.setState({
				error: [err.message]
			})
		})
	  }
  	render() {	  
		if (this.state.redirect) {
            return (
                <Redirect to={"/"} push />
            );
        } 
		return (
			<div>
				<h2>Add new bounty</h2>
				<ErrorMsg error={this.state.error}/>			
				<Form onSubmit={(event) => this.handleCreate(event, this.props.web3, this.props.account,this.props.contract)}>
					<FormGroup>
						<Label for="bountyName">Bounty name</Label>
						<Input type="bountyName" name="bountyName" id="bountyName" placeholder="Bounty name" />
					</FormGroup>
					<FormGroup>
						<Label for="bountyDescription">Bounty description</Label>
						<Input type="bountyDescription" name="bountyDescription" id="bountyDescription" placeholder="Bounty description" />
					</FormGroup>
					<FormGroup>
						<Label for="price">Price</Label>
						<Input type="price" name="price" id="price" placeholder="Price" />
					</FormGroup>
					<Button>Add bounty</Button>
				</Form>
			</div>
		);
  }
}