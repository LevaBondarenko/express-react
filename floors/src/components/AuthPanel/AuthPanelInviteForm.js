/**
 * Authorization Panel Invite Form component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars

/**
 * React/Flux entities
 */
import userStore from '../../stores/UserStore';

import AuthPanelRegisterForm from './AuthPanelRegisterForm';

class AuthPanelInviteForm extends Component {

  constructor(props) {
    super(props);
    this.state = {
      phone: '',
      password: ''
    };
  }

  render() {
    const text = userStore.get('invite').text;

    return (
      <div>
        <div className="lk-promo-text"
             dangerouslySetInnerHTML={{__html: text}} />
        <div className="lk-auth-block">
          <AuthPanelRegisterForm {...this.props}/>
        </div>
      </div>
    );
  }
}

export default AuthPanelInviteForm;
