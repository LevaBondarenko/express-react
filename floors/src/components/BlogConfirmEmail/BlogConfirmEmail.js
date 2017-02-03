/**
 * Blog confirm e-mail component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import request from 'superagent';


class BlogConfirmEmail extends Component {
  constructor(props) {
    super(props);

    this.state = {
      responseConfirm: false
    };
  }

  componentDidMount() {
    const locHash = window.location.hash.replace('#', '');
    const locHashParts = locHash.split('/');
    const email = atob(locHashParts[1]);
    const cityId = atob(locHashParts[2]);

    request
      .post('/backend/')
      .send({
        action: 'blog_subscribe_confirm',
        cityId: cityId,
        email: email,
        hash: locHashParts[0]
      })
      .set({
        Accept: 'application/json',
        'Content-Type': 'application/x-www-form-urlencoded'
      })
      .end((err, res) => {
        const resErr = JSON.parse(res.text);

        if(err || !resErr.ok) {
          this.setState({
            responseConfirm: 'error'
          });
        } else {
          this.setState({
            responseConfirm: 'ok'
          });
        }
      });
  }

  render() {
    const {responseConfirm} = this.state;

    return (
      <div className='blog-confirm-email'>
        {!responseConfirm ?
          (<div>
            <i className='fa fa-spinner fa-pulse fa-5x'/>
          </div>) :
          (responseConfirm === 'ok' ?
            (<div>
              <h2>Ваш адрес электронной почты подтвержден!</h2>
              <p>Спасибо за подписку! Скоро вы получите статью по почте</p>
            </div>) :
            (<div>
              <h2>Ошибка: Ссылка не действительна или устарела!</h2>
            </div>))
        }
      </div>
    );
  }
}

export default BlogConfirmEmail;
