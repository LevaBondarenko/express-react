/**
 * shared Social button component
 *
 * @ver 0.0.1
 * @author o.e.kurgaev@it.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import ReactDOM from 'react-dom';
import request from 'superagent';
import {isEmpty} from 'lodash';
import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';
import ga from '../utils/ga';

const isMounted = (component) => {
  // exceptions for flow control
  try {
    ReactDOM.findDOMNode(component);
    return true;
  } catch (e) {
    // Error
    return false;
  }
};

/*global FB, data*/
class SocialButton extends Component {
  static propTypes = {
    type: PropTypes.string,
    data: PropTypes.object
  };

  constructor(props) {
    super(props);
  }

  render() {
    return (
      <div>
        {this.props.type === 'fb' ?
          <FbButton {...this.props.data} /> :
          (this.props.type === 'vk' ?
            (<div>
              <div id="vk_api_transport"></div>
              <VkButton {...this.props.data} />
            </div>) :
            <OkButton {...this.props.data} />)
        }
      </div>

    );
  }
}

export default SocialButton;


class FbButton extends Component {
  static propTypes = {
    href: PropTypes.string,
    titlePrfx: PropTypes.string,
    gaEvent: PropTypes.string
  };

  static defaultProps = {
    titlePrfx: 'Опубликовать статью'
  };

  constructor(props) {
    super(props);

    this.state = {
      response: false
    };
  }

  componentWillMount() {
    if (this.props.href) {
      this.getShares(this.props);
    }
  }

  componentDidMount() {
    window.fbAsyncInit = function() {
      FB.init({
        appId: '1029903423712283',
        xfbml: true,
        version: 'v2.6'
      });
    };
    (function(d, s, id) {
      var js, fjs = d.getElementsByTagName(s)[0];

      if (d.getElementById(id)) {return;}
      js = d.createElement(s); js.id = id;
      js.src = '//connect.facebook.net/en_US/sdk.js';
      fjs.parentNode.insertBefore(js, fjs);
    }(document, 'script', 'facebook-jssdk'));
  }

  componentWillReceiveProps = (nextProps) => {
    if(!isEmpty(nextProps)) {
      this.getShares(nextProps);
    }
  }

  getShares = (daProps) => {
    const href = daProps.href;

    request // wp-content/plugins/etagi/core/ajax.php
      .post('/backend/')
      .send({
        action: 'social_share_count',
        href: href,
        social: 'FB'
      })
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
      .end((err, res) => {
        const resParsed = res ? JSON.parse(res.text) : false;

        if(err) {
          isMounted(this) && this.setState({
            response: err
          });
        } else {
          isMounted(this) && this.setState({
            response: resParsed
          });
        }
      });
  }

  handleShare = (event) => {
    const {gaEvent}  = this.props;

    gaEvent && gaEvent.length && ga('button', `${gaEvent}_facebook`);
    FB.ui({
      method: 'share',
      ...this.props
    });

    event.preventDefault();
  }

  render() {
    const {response} = this.state;
    const show = data && data.options && data.options.socialNetworks &&
     data.options.socialNetworks.facebookSb ?
      data.options.socialNetworks.facebookSb :
      null;
    const {titlePrfx} = this.props;

    return (
      <div>
        {show ?
          (<div className='socialBC'>
            <div className='socialBC--button'>
              <OverlayTrigger
                trigger={['hover', 'focus', 'click']} rootClose
                placement='bottom'
                overlay={
                  <Popover id='FBshareId'>
                    {`${titlePrfx} в Facebook`}
                  </Popover>
                }>
                  <a className='ico-soc ico-soc--fb'
                   onClick={this.handleShare} />
              </OverlayTrigger>
            </div>
            {response && response.shares ?
              (<div className='blog-inline-block'>
                <div className='socArrow'>
                  <div className='socArrow--outer'/>
                  <div className='socArrow--inner'/>
                </div>
                <div className='socialBC--counter'>
                  <p>{response.shares}</p>
                </div>
              </div>) :
              null
            }
          </div>) :
          null
        }
      </div>
    );
  }
}

class VkButton extends Component {
  static propTypes = {
    title: PropTypes.string,
    href: PropTypes.string,
    picture: PropTypes.string,
    description: PropTypes.string,
    titlePrfx: PropTypes.string,
    gaEvent: PropTypes.string
  };

  static defaultProps = {
    titlePrfx: 'Опубликовать статью'
  };

  constructor(props) {
    super(props);

    this.state = {
      response: false
    };
  }

  componentWillMount() {
    if (this.props.href) {
      this.getShares(this.props);
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if(!isEmpty(nextProps)) {
      this.getShares(nextProps);
    }
  }

  getShares = (daProps) => {
    const href = daProps.href;

    request // wp-content/plugins/etagi/core/ajax.php
      .post('/backend/')
      .send({
        action: 'social_share_count',
        href: href,
        social: 'VK'
      })
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
      .end((err, res) => {
        const resParsed = res ?
          res.text.match(/^VK.Share.count\(1, (\d+)\);/) : false;

        if(err) {
          isMounted(this) && this.setState({
            response: err
          });
        } else {
          isMounted(this) && this.setState({
            response: resParsed && resParsed[1] ? resParsed[1] : false
          });
        }
      });
  }

  handleShare = (event) => {
    const {gaEvent}  = this.props;

    gaEvent && gaEvent.length && ga('button', `${gaEvent}_vk`);
    const VKLink = event.target.href;
    const newwindow = window.open(VKLink, 'Поделиться ВКонтакте',
      'height=400,width=400,left=400');

    if(window.focus) {
      newwindow.focus();
    }

    event.preventDefault();
  }

  render() {
    const {title, href, picture, description, titlePrfx} = this.props;
    const {response} = this.state;
    const VKLink = `http://vk.com/share.php?url=${href}&title=${title}&description=${description}&image=${picture}&noparse=true`;
    const show = data && data.options && data.options.socialNetworks &&
     data.options.socialNetworks.vkontakteSb ?
      data.options.socialNetworks.vkontakteSb :
      null;

    return (
      <div>
        {show ?
          (<div className='socialBC'>
            <div className='socialBC--button'>
              <OverlayTrigger
                trigger={['hover', 'focus', 'click']} rootClose
                placement='bottom'
                overlay={
                  <Popover id='VKshareId'>
                    {`${titlePrfx} во ВКонтакте`}
                  </Popover>
                }>
                  <a className='ico-soc ico-soc--vk' href={VKLink}
                    onClick={this.handleShare} />
              </OverlayTrigger>
            </div>
            {response !== false && parseInt(response) > 0 ?
              (<div className='blog-inline-block'>
                <div className='socArrow'>
                  <div className='socArrow--outer'/>
                  <div className='socArrow--inner'/>
                </div>
                <div className='socialBC--counter'>
                  <p>{response}</p>
                </div>
              </div>) :
              null
            }
          </div>) :
          null
        }
      </div>
    );
  }
}

class OkButton extends Component {
  static propTypes = {
    href: PropTypes.string,
    titlePrfx: PropTypes.string,
    gaEvent: PropTypes.string
  };

  static defaultProps = {
    titlePrfx: 'Опубликовать статью'
  };

  constructor(props) {
    super(props);

    this.state = {
      response: false
    };
  }

  componentWillMount() {
    if (this.props.href) {
      this.getShares(this.props);
    }
  }

  componentWillReceiveProps = (nextProps) => {
    if(!isEmpty(nextProps)) {
      this.getShares(nextProps);
    }
  }

  getShares = (daProps) => {
    const href = daProps.href;

    request // wp-content/plugins/etagi/core/ajax.php
      .post('/backend/')
      .send({
        action: 'social_share_count',
        href: href,
        social: 'OK'
      })
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
      .end((err, res) => {
        const resParsed = res &&
         (JSON.parse(res.text).count || JSON.parse(res.text).count === 0) ?
          JSON.parse(res.text).count :
          false;

        if(err) {
          isMounted(this) && this.setState({
            response: err
          });
        } else {
          isMounted(this) && this.setState({
            response: resParsed
          });
        }
      });
  }

  handleShare = (event) => {
    const {gaEvent}  = this.props;

    gaEvent && gaEvent.length && ga('button', `${gaEvent}_odnoklassniki`);
    const OKLink = event.target.href;
    const newwindow = window.open(OKLink, 'Поделиться в Одноклассниках',
      'height=700,width=700,left=400');

    if(window.focus) {
      newwindow.focus();
    }

    event.preventDefault();
  }

  render() {
    const {href, titlePrfx} = this.props;
    const {response} = this.state;
    const OKLink = `https://connect.ok.ru/offer?url=${href}`;
    const show = data && data.options && data.options.socialNetworks &&
     data.options.socialNetworks.odnoklassnikiSb ?
      data.options.socialNetworks.odnoklassnikiSb :
      null;

    return (
      <div>
        {show ?
          (<div className='socialBC'>
            <div className='socialBC--button'>
              <OverlayTrigger
                trigger={['hover', 'focus', 'click']} rootClose
                placement='bottom'
                overlay={
                  <Popover id='OKshareId'>
                    {`${titlePrfx} в Одноклассниках`}
                  </Popover>
                }>
                  <a className='ico-soc ico-soc--ok' href={OKLink}
                    onClick={this.handleShare} />
              </OverlayTrigger>
            </div>
            {response !== false && parseInt(response) > 0 ?
              (<div className='blog-inline-block'>
                <div className='socArrow'>
                  <div className='socArrow--outer'/>
                  <div className='socArrow--inner'/>
                </div>
                <div className='socialBC--counter'>
                  <p>{response}</p>
                </div>
              </div>) :
              null
            }
          </div>) :
          null
        }
      </div>
    );
  }
}