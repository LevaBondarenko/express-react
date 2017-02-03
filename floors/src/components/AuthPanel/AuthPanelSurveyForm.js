/**
 * Authorization Panel Survey Form component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

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
import FormControl from 'react-bootstrap/lib/FormControl';

class AuthPanelSurveyForm extends Component {
  static propTypes = {
    field: PropTypes.string,
    title: PropTypes.string,
    question: PropTypes.string
  };

  constructor(props) {
    super(props);
    this.state = {
      result: ''
    };
  }

  submit(e) {
    UserActions.surveySubmit(this.props.field, this.state.result);
    e.preventDefault();
  }

  dont(e) {
    UserActions.surveyDont(this.props.field);
    e.preventDefault();
  }

  later(e) {
    UserActions.surveyLater(this.props.field);
    e.preventDefault();
  }

  handleChange(event) {
    this.setState({
      [event.target.dataset.name]: event.target.value
    });
  }

  render() {
    return (
        <form
          className="auth-from"
          autoComplete='off'
          onSubmit={this.submit.bind(this)}
        >
            <Row>
                <Col xs={12}><h4>{this.props.title}</h4></Col>
            </Row>
            <Row>
                <Col xs={12}>
                    <FormControl
                      type='text'
                      placeholder={this.props.question}
                      ref='result'
                      data-name='result'
                      required='on'
                      onChange={this.handleChange.bind(this)}
                      value={this.state.result}
                      style={{marginBottom: '6px'}}
                    />
                </Col>
            </Row>
            <Row style={{marginTop: '12px'}}>
                <Col xs={4}>
                    <Button type='Submit' bsStyle='primary'>Сохранить</Button>
                </Col>
                <Col xs={4}>
                    <Button
                      type='Button'
                      bsStyle='default'
                      onClick={this.later.bind(this)}>
                        Позже
                    </Button>
                </Col>
                <Col xs={4}>
                    <Button
                      type='Button'
                      bsStyle='warning'
                      onClick={this.dont.bind(this)}>
                        Не спрашивать
                    </Button>
                </Col>
            </Row>
        </form>
    );
  }
}

export default AuthPanelSurveyForm;
