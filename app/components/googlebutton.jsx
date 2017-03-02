import React from 'react';

export default class GoogleButton extends React.Component {
	render() {
		return (
			<a href="/auth/google"
				id="google-button"
				className="pure-button withshadow"
				style={{padding:'11px 8px',height:'40px'}}>
				
				<img style={{height:'18px',width:'18px'}}
					src={require('../assets/google-logo.png')} />
				
				<span style={{marginLeft:'24px',fontSize:'14px',position:'relative',top:'-4px'}}>
					
					Sign {this.props.preposition} with Google
				
				</span>
			</a>
		);
	}
}