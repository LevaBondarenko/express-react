/**
 * Authorization Panel Wrong Password Form component
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
import UserActions from '../../actions/UserActions';

/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';
import Button from 'react-bootstrap/lib/Button';

class AuthPanelWrongForm extends Component {

  constructor(props) {
    super(props);
  }

  login(e) {
    UserActions.showLogin();
    e.preventDefault();
  }

  register(e) {
    UserActions.showRegister();
    e.preventDefault();
  }

  restore(e) {
    UserActions.showRestore();
    e.preventDefault();
  }

  render() {
    return (
        <div>
            <Row>
                <Col xs={12}><h4>Неверный логин или пароль</h4></Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <p>Введенные логин или пароль не верны.</p>
                </Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <Button bsStyle='primary' onClick={this.login.bind(this)}>
                      Еще раз
                    </Button>
                </Col>
            </Row>
            <Row style={{marginTop: '12px'}}>
                <Col xs={6} style={{padding: '0 4px 0 4px'}}>
                  <a href="#auth-register" onClick={this.register.bind(this)}>
                    Регистрация
                  </a>
                </Col>
                <Col xs={6} style={{padding: '0 4px 0 4px'}}>
                  <a href="#auth-restore" onClick={this.restore.bind(this)}>
                    Забыли пароль?
                  </a>
                </Col>
            </Row>
        </div>
    );
  }
}

export default AuthPanelWrongForm;
