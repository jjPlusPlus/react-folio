import React, { Component } from 'react';
import { Redirect } from "react-router-dom";

import { connect } from 'react-redux';

import SignInForm from 'components/SignInForm';

class Admins extends Component {

  render() {
    const profile = this.props.auth.email;
    return (
      <div className="page--container">
        <div className="page">
          <div className="page--header">
            <h1 className="page--title">I am JJ</h1>
          </div>
          <div className="page--content">
            { profile
              ? <Redirect to='/admin/dashboard' />
              : <SignInForm />
            }
          </div>
        </div>
      </div>
    );
  }
}

const enhance = connect(
  ({ firebase: { auth, profile } }) => ({
    auth,
    profile
  })
)

export default enhance(Admins);
