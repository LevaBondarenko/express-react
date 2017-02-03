/**
 * LK SurveyBlock component
 *
 * @ver 0.0.1
 * @author denis.zemlyanov@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {map} from 'lodash';
import classNames from 'classnames';
/**
 * Bootstrap 3 elements
 */
import Button from 'react-bootstrap/lib/Button';
/**
 * React/Flux entities
 */
import UserActions from '../../actions/UserActions';
import WidgetsActions from '../../actions/WidgetsActions';
/* global data */ // eslint-disable-line no-unused-vars

class LKSurvey extends Component {
  static propTypes = {
    user: React.PropTypes.object,
    survey: React.PropTypes.object,
    isAuthorized: React.PropTypes.bool
  };
  constructor(props) {
    super(props);
    let surveyRequested = false;

    if(props.isAuthorized) {
      const fields = UserActions.fieldsWeights;
      let maxWeight = 0, field = '';

      for(const i in fields) {
        if(fields[i] && !props.user[i] && maxWeight < fields[i]) {
          maxWeight = fields[i];
          field = i;
        }
      }
      UserActions.get('survey', field ? {field: field} : {});
      surveyRequested = true;
    }
    this.state = {
      showSurvey: true,
      answer: '',
      surveyRequested: surveyRequested
    };
  }

  componentWillReceiveProps(nextProps) {
    if(nextProps.isAuthorized && !this.state.surveyRequested) {
      const fields = UserActions.fieldsWeights;
      let maxWeight = 0, field = '';

      for(const i in fields) {
        if(fields[i] && !nextProps.user[i] && maxWeight < fields[i]) {
          maxWeight = fields[i];
          field = i;
        }
      }
      UserActions.get('survey', field ? {field: field} : {});
      this.setState(() => ({surveyRequested: true}));
    }
  }

  surveyClose() {
    this.setState(() => ({showSurvey: false}));
  }

  surveyAnswer(e) {
    const {user, survey} = this.props;
    const ufio = user.i ? user.i + (user.o ? ` ${user.o}` : '') : user.f;
    let elm = e.target, answer = elm.dataset.answer;

    while(!answer) {elm = elm.parentNode; answer = elm.dataset.answer;}
    UserActions.create(
      {
        id: survey.id,
        result: answer
      },
      'survey'
    );
    if(survey.field) {
      UserActions.updateUser({[survey.field]: answer});
    }
    WidgetsActions.set('notify',[{
      msg: `Спасибо за Ваш ответ, ${ufio}. Он очень важен для нас`,
      type: 'info'
    }]);
    this.setState(() => ({answer: ''}));
  }

  surveyNext() {
    UserActions.get('survey');
    this.setState(() => ({answer: ''}));
  }

  handleAnswerChange(e) {
    const value = e.target.value;

    this.setState(() => ({
      answer: value
    }));
  }

  render() {
    const {isAuthorized, survey} = this.props;
    const {showSurvey, answer} = this.state;
    const surveyParams = survey.params || {};
    const {color} = survey;
    const {descr1, descr2, background} = surveyParams;
    let surveyBlock;

    switch(surveyParams.field_type) {
    case 'text' :
      surveyBlock =
        (<div className='lkbody-survey-answer'>
          <input
            type='text'
            ref='answerValue'
            className='form-control'
            value={answer}
            onChange={this.handleAnswerChange.bind(this)} />
          <Button
            data-answer={answer}
            type='button'
            bsStyle='default'
            bsSize='small'
            onClick={this.surveyAnswer.bind(this)}>
            ГОТОВО
          </Button>
        </div>);
      break;
    case 'radio' :
      const answers = map(surveyParams.values, (value, key) => {
        return (
          <div key={`survey${survey.id}key${key}`}>
            <input
              type="radio"
              name={`survey${survey.id}[]`}
              id={`survey${survey.id}key${key}`}
              value={key}
              data-answer={key}
              onClick={this.surveyAnswer.bind(this)} />
            <label htmlFor={`survey${survey.id}key${key}`}>{value}</label>
          </div>
        );
      });

      surveyBlock =
        <div className='lkbody-survey-answer'>{answers}</div>;
      break;
    default :
      surveyBlock = null;
    }

    return (
      <div
        className={classNames(
            'lkbody-survey',
            {[`survey-${color}`]: color !== undefined}
        )}
        style={{
          display:
            showSurvey && isAuthorized && survey.title ? 'block' : 'none',
          backgroundImage: background ? `url(${background})` : null
        }}>
        <span className='lkbody-survey-next'
          onClick={this.surveyNext.bind(this)}>
          пока пропустить
        </span>
        <div className='lkbody-survey-question'>
          {survey.title}
        </div>
        <div className='lkbody-survey-descr1'>
          {descr1 ? descr1 : ''}
        </div>
        <div className='lkbody-survey-descr2'>
          {descr2 ? descr2 : ''}
        </div>
        {surveyBlock}
      </div>
    );
  }
}

export default LKSurvey;
