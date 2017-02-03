/**
 * Blog subscribe form component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import request from 'superagent';
import {testEmail} from '../../utils/Helpers';

import Button from 'react-bootstrap/lib/Button';
import FormControl from 'react-bootstrap/lib/FormControl';
import FormGroup from 'react-bootstrap/lib/FormGroup';
import HelpBlock from 'react-bootstrap/lib/HelpBlock';
import userStore from '../../stores/UserStore';
import wss from '../../stores/WidgetsStateStore';
import WidgetsActions from '../../actions/WidgetsActions';

class BlogSubscribeForm extends Component {
  static propTypes = {
    subscribeClassName: PropTypes.string,
    confirmEmailPath: PropTypes.string,
    confirmEmailTemplate: PropTypes.string,
    handleTransitionEnd: PropTypes.func,
    handleSubscribe: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      isLoading: true,
      isAuthorized: false,
      userEml: '',
      subscribeEmlHelp: '',
      buttonLoader: false
    };
  }

  componentDidMount() {
    const isAuthorized = userStore.get('isAuthorized');
    let userEml = '';

    if(isAuthorized) {
      const userInfo = userStore.get('userInfo');

      userEml = userInfo.email;
    }

    this.setState({
      userEml: userEml,
      wssData: wss.get()
    });
  }

  componentWillUnmount() {
    this.props.handleTransitionEnd();
  }

  subscribeSubmit = (event) => {
    const {userEml, wssData} = this.state;
    const {confirmEmailPath, confirmEmailTemplate} = this.props;
    const selectedSite = wssData ? wssData.selectedCity : null;
    const {protocol, host} = window.location;

    this.setState({
      buttonLoader: true
    });

    if(selectedSite && testEmail(userEml)) {
      request
      .post('/backend/')
      .send({
        action: 'blog_subscribe',
        email: userEml,
        blogCity: selectedSite.city_id,
        blogCityName: selectedSite.name_prepositional,
        baseurl: `${protocol}//${host}${confirmEmailPath}#`,
        confirmEmailTemplate: confirmEmailTemplate
      })
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
      .end((err, res) => {
        const resParsed = JSON.parse(res.text);
        const alreadySubscribed = resParsed.response === 'subscribed' ? true :
         false;

        if(err) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка оформления подписки. Попробуйте обновить страницу',
            type: 'dang'
          }]);
        } else {
          this.props.handleSubscribe(alreadySubscribed);
        }
      });
    } else {
      this.setState(() => ({
        subscribeEmlHelp: 'E-mail введен некорректно',
        subscribeState: 'error',
        buttonLoader: false
      }));
    }
    event.target.blur();
  }

  handleChange = (event) => {
    let help, state;

    if(testEmail(event.target.value)) {
      help = '';
      state = 'success';
    }

    this.setState({
      subscribeEmlHelp: help,
      subscribeState: state,
      userEml: event.target.value
    });
  }

  render() {
    const {
      userEml,
      subscribeState,
      subscribeEmlHelp,
      buttonLoader
    } = this.state;
    const {
      subscribeClassName
    } = this.props;

    return (
      <div className={subscribeClassName} key={'subscribe'}>
        <div>
          <h3><b>ПОДПИШИТЕСЬ НА БЛОГ</b></h3>
          <p>и не пропустите ни одной статьи!</p>
        </div>
        <div>
          <FormGroup
           controlId='subscribeFGId'
           validationState={subscribeState}>
            <FormControl
              type='text'
              required='on'
              ref='subscribeInput'
              className='readLaterInput'
              placeholder='Введите Ваш e-mail'
              value={userEml}
              onChange={this.handleChange} />
            <Button
              onClick={this.subscribeSubmit}
              className='readLaterConfirmButton'
              disabled={buttonLoader}>
              {buttonLoader ?
                (<div className="loader-inner ball-pulse">
                  <div />
                  <div />
                  <div />
                </div>) : 'Подписаться'
              }
            </Button>
            <HelpBlock>{subscribeEmlHelp}</HelpBlock>
          </FormGroup>
        </div>
      </div>
    );
  }
}

export default BlogSubscribeForm;
