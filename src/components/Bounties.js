import React from 'react';
import { Table } from 'reactstrap';
import {ButtonViewBountySubmissions, BountyStatusToText} from './Global';
import { Redirect } from 'react-router-dom';

export default class Bounties extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			bounties: [],
			web3: this.props.web3,
			account: this.props.account,
			contract: this.props.contract 
		};
		this.viewBounty = this.viewBounty.bind(this)
	}

	loadData = () => {
		this.props.contract.getBountiesCount({from: this.props.account}).then((result) => {
			for (var i = 0; i < result.toNumber(); i++) { 
					this.props.contract.getBounty(i,{from: this.props.account}).then((result) => {
						let amo = String(this.state.web3.fromWei(result[4], 'ether'));
						let tmp = this.state.bounties;						
						tmp.push({owner: result[0], id: result[1], name: result[2], description: result[3], amount: amo, status: result[5].toNumber()});
						this.setState({
							bounties: tmp
						})
					})
			}
		});	
	}
	
	componentDidMount() {
		this.loadData();
	}

	viewBounty(bid){
		this.setState({
			bountyDetails: bid
		})
	}

  	render() {
		// const handleClick = this.handleClick;   
		const id = this.state.bountyDetails;
		if (id) {
            return (
                <Redirect to={"/"+id.toNumber()+"/submissions"} push />
            );
        }     
		return (
			<div>
				<h2>Bounties</h2>			
				<Table>
					<thead>
						<tr>
							<th>#</th>
							<th>Name</th>
							<th>Description</th>
							<th>Price(Ether)</th>
							<th>Status</th>
							<th></th>
						</tr>
					</thead>
				<tbody>
				{this.state.bounties.map(function(item, key) {     
					return (
					<tr key={key}>
						<td>{key + 1}</td>
						<td>{item.name}</td>
						<td>{item.description}</td>
						<td>{item.amount}</td>
						<td><BountyStatusToText status={item.status} /></td>
						<td><ButtonViewBountySubmissions id={item.id} itemAddress={item.address} contractAddress={this.state.address}  parentRef={this}></ButtonViewBountySubmissions></td>
					</tr>
					)
				},this)} 
				</tbody>
				</Table>
			</div>
		);
  }
}