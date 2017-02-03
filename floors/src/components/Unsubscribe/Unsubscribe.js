/**
 * Created by tatarchuk on 20.08.15.
 */


import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

import {map} from 'lodash';
import request from 'superagent';

/**
 * Bootstrap 3 elements
 */
import Col from 'react-bootstrap/lib/Col';
import Row from 'react-bootstrap/lib/Row';



class Unsubscribe extends Component {
  static propTypes = {
    dataUrl: PropTypes.array
  };

  constructor(props) {
    super(props);
    const getArr = {};

    map(props.dataUrl, (v) => {
      map(v, (val, key) => {
        getArr[key] = val;
      });
    });
    const id = getArr.id ? getArr.id : false;
    const email = getArr.email ? getArr.email : false;

    this.state = {
      clientId: id,
      email: email,
      why: '',
      text: '',
      stepFirst: ''
    };
  }

  handleSubmit(event) {
    event.preventDefault();

    const {clientId, email, why, text} = this.state;
    const self = this;

    if(clientId && email && (why || text)) {
      request
        .post('/backend/')
        .set({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        })
        .send({
          action: 'clients_unsubscribed_post',
          'client_id': clientId,
          email: email,
          why: why,
          text: text
        })
        .end((err, res) => {
          if(err) {
            throw(err, res);
          } else {
            if (res.body.success) {
              self.setState({
                error: 'Вы отписались от рассылки.'
              });
            } else {
              self.setState({
                error: 'Что пошло не так, повторите попытку позже.'
              });
            }
          }
        });
    }
  }

  handleChange(event) {
    this.setState({
      [event.target.dataset.name]: event.target.value
    });
  }

  subscribeChange(event) {
    event.preventDefault();

    const self = this;
    const {clientId, email, stepFirst} = this.state;

    if (stepFirst === '1') {
      request
        .post('/backend/')
        .set({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        })
        .send({
          action: 'clients_unsubscribed',
          id: clientId,
          email: email,
          'subscribe_to_newsletter': 1
        })
        .end((err, res) => {
          if(err) {
            throw(err, res);
          } else {
            const typeData = typeof res.body.data;

            if (typeData === 'object') {
              self.setState({
                lastVal: res.body.data.lastVal
              });
            } else {
              self.setState({
                error: res.body.data
              });
            }
          }
        });
    } else if (stepFirst === '0') {
      document.location.href = window.location.origin;
    }

    self.setState({
      submitStepFirst: stepFirst
    });
  }

  render() {
    const {email, submitStepFirst, lastVal, error} = this.state;
    const notice = `Ваш e-mail адрес: ${email} был удален из листа рассылки.`;
    const orderChange = this.handleChange.bind(this);
    const subscribeChange = this.subscribeChange.bind(this);
    const firstPuppy = '//cdn-media.etagi.com/static/site/8/84/84fedde25a4719c7f22d9b5808a8ecebde285ceb.jpg'; // eslint-disable-line max-len
    const secondPuppy = '//cdn-media.etagi.com/static/site/1/16/167187236ad43335c75ab50aa4a201dc764577f6.jpg'; // eslint-disable-line max-len
    const thirdPuppy = '//cdn-media.etagi.com/static/site/8/88/885c32a11dd91d5da1fdf656f8dafc7df3567cf5.jpg'; // eslint-disable-line max-len

    const subscribeStep1 =
      (<div className="container-wide">
        <Row className="unsubscribeBlock">
          <Col md={3} mdOffset={2} className='unsubscribeLeftBlock2'>
            <img src={firstPuppy}
                 alt="" />
          </Col>
          <Col md={6} className='unsubscribeRightBlock3'>
            <p className='unsubscribeDesc'>
              <strong>Вы уверены, что хотите отписаться от
                рассылки компании «Этажи»?:</strong>
            </p>
            <form onSubmit={subscribeChange}>
              <p>
                <input type="radio"
                       onChange={orderChange}
                       data-name='stepFirst'
                       name="stepFirst"
                       value='0'
                       id="b3" />
                <label htmlFor="b3">Нет, я передумал</label>
              </p>
              <p>
                <input type="radio"
                       onChange={orderChange}
                       data-name='stepFirst'
                       name="stepFirst"
                       value='1'
                       id="b4" />
                <label htmlFor="b4">Да, отписаться</label>
              </p>
              <br/>
              <br/>
              <br/>
              <p>
                <a href="/" className='btn btn-border-green'>Перейти на сайт</a>
                <input type="submit"
                       className='btn btn-green'
                       value="Сохранить" />
              </p>
            </form>
          </Col>
        </Row>
      </div>);

    const formUnsubscribe =
      (<div className="container-wide">
        <Row className="unsubscribeBlock">
          <Col md={3} mdOffset={2} className='unsubscribeLeftBlock'>
            <img src={secondPuppy}
                 alt="" />
          </Col>
          <Col md={6} className='unsubscribeRightBlock'>
            <form onSubmit={this.handleSubmit.bind(this)}>
              <p className='notice'>{notice}</p>
              <br/>
              <p className='unsubscribeDesc'>
                <strong>
                  Для повышения качества нашего сервиса, пожалуйста,
                  расскажите нам причины отказа от получения рассылок:
                </strong>
              </p>
              <p>
                <input type="radio"
                       onChange={orderChange}
                       data-name='why'
                       name='why'
                       value='manyLetters'
                       id="a1" />
                <label htmlFor="a1">
                  Я получаю слишком большое количество писем
                </label>
              </p>
              <p>
                <input type="radio"
                       onChange={orderChange}
                       data-name='why'
                       name="why"
                       value='iDontSendLetters'
                       id="a2" />
                <label htmlFor="a2">
                  Я не хочу больше получать ваши рассылки
                </label>
              </p>
              <p>
                <input type="radio"
                       onChange={orderChange}
                       data-name='why'
                       name="why"
                       value='iDontSign'
                       id="a3" />
                <label htmlFor="a3">Я не подписывался на ваши рассылки</label>
              </p>
              <p>
                <input type="radio"
                       onChange={orderChange}
                       data-name='why'
                       name="why"
                       value='itsSpam'
                       id="a4" />
                <label htmlFor="a4">
                  Получаемые мной письма являются спамом
                </label>
              </p><br/>
              <p>
                <input type="radio"
                       onChange={orderChange}
                       data-name='why'
                       name="why"
                       value='otherReason'
                       id="a5" />
                <label htmlFor="a5">Другая причина:</label>
              </p>
              <p>
                <textarea name="text"
                          onChange={orderChange}
                          data-name='text'
                          id="a6"
                          cols="30"
                          rows="5"
                          placeholder="Текст"></textarea>
              </p>
              <br/>
              <p>
                <input type="submit"
                       className='btn btn-green'
                       value="Подтвердить" />
              </p>
            </form>
          </Col>
        </Row>
      </div>);

    const subscribe =
      (<div className="container-wide">
        <Row className="unsubscribeBlock">
          <Col md={4} mdOffset={2} className='unsubscribeLeftBlock2'>
            <img src={thirdPuppy}
                 alt="" />
          </Col>
          <Col md={6} className='unsubscribeRightBlock2'>
            <p className='notice'>Вы уже отписались!</p>
            <p>
              <a href="/" className='btn btn-border-green'>Перейти на сайт</a>
            </p>
          </Col>
        </Row>
      </div>);

    const errorBlock =
      (<div className="container-wide">
        <Row className="unsubscribeBlock">
          <Col md={4} mdOffset={2} className='unsubscribeLeftBlock2'>
            <img src={thirdPuppy}
                 alt="" />
          </Col>
          <Col md={6} className='unsubscribeRightBlock2'>
            <p className='notice'>{error}</p>
            <p className='unsubscribeDesc'>
              <strong>Спасибо за то, что вы делаете нас лучше!</strong>
            </p>
            <p>
              <a href="/" className='btn btn-border-green'>Перейти на сайт</a>
            </p>
          </Col>
        </Row>
      </div>);

    const show = submitStepFirst === '1' ? (
      error ? errorBlock :
        (lastVal === 'nothing' ? subscribe :
          (lastVal === 'not_set' ? formUnsubscribe :
            <br />))) : subscribeStep1;

    return (
      show
    );
  }
}

export default Unsubscribe;
