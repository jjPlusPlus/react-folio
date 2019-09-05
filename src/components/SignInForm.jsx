import React, { Component } from 'react';
import { firebaseConnect } from 'react-redux-firebase'

class SignInForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      email: "",
      password: ""
    }
    this.authenticate = this.authenticate.bind(this)
  }

  inputChange = field => event => {
    this.setState({
      [field]: event.target.value
    })
  }

  authenticate(event) {
    event.preventDefault();
    const credentials = {
      email: this.state.email,
      password: this.state.password
    }
    this.props.firebase.login(credentials).then(result => {
      alert("Good job, we knew it was you!");
    }).catch(error => {
      alert("Nice try!");
    });
  }

  render() {
    return (
      <div className="sign-in-form">
        <p>Prove it.</p>
        <form onSubmit={this.authenticate}>
          <input type="text" value={this.state.email} onChange={this.inputChange('email')} />
          <input type="password" value={this.state.password} onChange={this.inputChange('password')} />
          <button type="submit"> lets do eit. </button>
        </form>
      </div>
    )
  }
}

export default firebaseConnect()(SignInForm);
