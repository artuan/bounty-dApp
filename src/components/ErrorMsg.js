import React from 'react'
import { Alert } from 'reactstrap';

const ErrorMsg = ({ error }) => {
	if (error) {
	  return (
		<Alert color="danger">
			{
				error.map(err => (
      				<div key={err}>{err}</div>
				))
			}
		</Alert>
	  );
	}
	return (<div></div>
	);
};
   
export default ErrorMsg;