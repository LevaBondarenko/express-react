/**
 * Blog read later form component
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

import wss from '../../stores/WidgetsStateStore';
import WidgetsActions from '../../actions/WidgetsActions';


class BlogReadLaterForm extends Component {
  static propTypes = {
    userEml: PropTypes.string,
    posts: PropTypes.array,
    wssData: PropTypes.object,
    handleSubmit: PropTypes.func,
    handleTransitionEnd: PropTypes.func
  };

  constructor(props) {
    super(props);
    this.state = {
      readLater: false,
      readLaterEmlHelp: '',
      buttonLoader: false
    };
  }

  componentDidMount() {
    this.setState({
      userEml: this.props.userEml,
      wssData: wss.get()
    });
  }

  componentWillUnmount() {
    this.props.handleTransitionEnd();
  }

  hexToRgb = (hex) => {
    hex = hex.replace(/^#?([a-f\d])([a-f\d])([a-f\d])$/i, (m, r, g, b) => { // expanding shorthands (e.g. '03F') to full form ('0033FF')
      return r + r + g + g + b + b;
    });

    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

    return result ?
      `rgb(${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)})` : // eslint-disable-line max-len
      null;
  }

  readLaterSubmit = (event) => {
    const {userEml} = this.state;
    const {posts, wssData} = this.props;
    const selectedSite = wssData && wssData.selectedCity ?
     wssData.selectedCity.site : null;
    const link = `https://${selectedSite}${posts[0].post_name}`;

    this.setState({
      buttonLoader: true
    });

    if(testEmail(userEml)) {
      const modPostContent = posts[0].post_content
        .replace(/color: (#\w{3,6})/g, (match, matchColor) => {
          return `color: ${this.hexToRgb(matchColor)}`;
        })
        .replace(/\#\d+/g, '');

      request
      .post('/backend/')
      .send({
        action: 'send_blogpost',
        email: userEml,
        title: posts[0].post_title,
        blogpost: modPostContent,
        link: link
      })
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
      .end((err) => {
        if(err) {
          WidgetsActions.set('notify',[{
            msg: 'Ошибка отправки статьи. Попробуйте обновить страницу',
            type: 'dang'
          }]);
        } else {
          this.props.handleSubmit();
        }
      });
    } else {
      this.setState(() => ({
        readLaterEmlHelp: 'E-mail введен некорректно',
        readLaterState: 'error',
        buttonLoader: false
      }));
    }
    if (event) {
      event.target.blur();
    }
  }

  onKeyDown = (event) => {
    const {buttonLoader} = this.state;

    if (!buttonLoader && event.keyCode === 13) {
      this.readLaterSubmit();
    }

    event.stopPropagation();
  }

  handleChange = (event) => {
    let help, state;

    if(testEmail(event.target.value)) {
      help = '';
      state = 'success';
    }

    this.setState({
      readLaterEmlHelp: help,
      readLaterState: state,
      userEml: event.target.value
    });
  }

  render() {
    const {
      userEml,
      readLaterState,
      readLaterEmlHelp,
      buttonLoader
    } = this.state;

    return (
      <div className='readLaterForm' key='readLaterForm'>
        <div className='blogArrowUp' />
        <div className='readLaterSendform'>
          <div>Отправим материал вам на почту:</div>
          <FormGroup
           controlId='readLaterFGId'
           validationState={readLaterState}>
            <FormControl
              type='text'
              required='on'
              ref='readLaterInput'
              className='readLaterInput'
              placeholder='Введите Ваш e-mail...'
              onKeyDown={this.onKeyDown}
              value={userEml}
              onChange={this.handleChange} />
            <Button
              onClick={this.readLaterSubmit}
              className='readLaterConfirmButton'
              disabled={buttonLoader}>
              {buttonLoader ?
                (<div className="loader-inner ball-pulse">
                  <div />
                  <div />
                  <div />
                </div>) : 'Отправить'
              }
            </Button>
            <HelpBlock>{readLaterEmlHelp}</HelpBlock>
          </FormGroup>
        </div>
      </div>
    );
  }
}

export default BlogReadLaterForm;
