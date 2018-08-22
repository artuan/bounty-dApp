import React, { Component } from 'react'
import { Container, Row, Col } from 'reactstrap';
import Bounty from '../build/contracts/Bounty.json'
import getWeb3 from './utils/getWeb3'
import { Route, Switch } from 'react-router-dom';
import Navigation from './components/Navigation'
import Bounties from './components/Bounties'
import Submissions from './components/Submissions'
import SubmissionAdd from './components/SubmissionAdd'
import BountyAdd from './components/BountyAdd'

import './css/oswald.css'
import './css/open-sans.css'
import './css/pure-min.css'
import './App.css'

class BountiesRouter extends React.Component {
	constructor(props) {
	  super(props);
	  this.state = {
		web3: props.web3,
		account: props.account,
		contract: props.contract,
	  };
	}
	render() {
	  return (
		<div>
			<Switch> 
				{/* bid={this.state.bid} */}
			<Route exact path='/' render={props => <Bounties web3={this.state.web3} account={this.state.account} contract={this.state.contract} />} />
			<Route exact path='/add' render={props => <BountyAdd web3={this.state.web3} account={this.state.account} contract={this.state.contract} />} />
			<Route path='/:bid/submissions/add' render={props => <SubmissionAdd  web3={this.state.web3} account={this.state.account} contract={this.state.contract} bid={props.match.params.bid}/>} />
			<Route path='/:bid/submissions' render={props => <Submissions  web3={this.state.web3} account={this.state.account} contract={this.state.contract} bid={props.match.params.bid}/>} />
			</Switch>
		</div>
	  );
	}
}

class App extends Component {
  	constructor(props) {
    	super(props)
		this.state = {
			storageValue: 0,
			web3: null,
			account: null,
			contractInstance: null
		}
	}

	componentWillMount() {
		getWeb3
		.then(results => {
			this.setState({
				web3: results.web3
			})
		// Instantiate contract once web3 provided.
		this.instantiateContract()
		})
		.catch(() => {
		console.log('Error finding web3.')
		})
	}

	instantiateContract() {
		/*
		* SMART CONTRACT EXAMPLE
		*
		* Normally these functions would be called in the context of a
		* state management library, but for convenience I've placed them here.
		*/
		const contract = require('truffle-contract')
		const bounty = contract(Bounty)
		bounty.setProvider(this.state.web3.currentProvider)
		
		this.state.web3.eth.getAccounts((error, accounts) => {
			bounty.deployed().then((instance) => {
				// marketplaceInstance = instance
				let oldState = this.state
				oldState.account = accounts[0];
				oldState.contractInstance = instance;
				this.setState(oldState)
			});
		})
	}

   	render() {
	if(!this.state.contractInstance) return null;
	if (this.state.account) {
		return (
			<div> 
				<Navigation role={this.state.role}/>  		  	
			  	<Container>
				  	<Row>
					  	<Col>
					  {/* <Route path='/roster' component={this.state.account ? Roster:null}/> */}
						  {/* <Route path="/bounties" component={Bounties}/> */}
						  <Route path="/" render={(props) => ( <BountiesRouter web3={this.state.web3} account={this.state.account} contract={this.state.contractInstance}/> )} />
					  	</Col>
				  	</Row>
			  	</Container>
			</div>
	  	);		
	} else {
		return (
			<div>
				<Navigation role={this.state.role}/>  		  	
			  	<Container>
				  	<Row>
					  	<Col>
							<div className="p-3 mb-2 bg-danger text-white">Please login to metamask.</div>
					  	</Col>
				  	</Row>
			  	</Container>
			</div>
		)
	  }
    }
}


export default App
