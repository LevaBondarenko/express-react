/**
 * Blog unsubscribe component
 *
 * @ver 0.0.1
 * @author a.v.drozdov@nv.etagi.com
 */

/**
 * devDependencies
 */
import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {map, size} from 'lodash';
import request from 'superagent';
import Button from 'react-bootstrap/lib/Button';

import WidgetsActions from '../../actions/WidgetsActions';

/* global data */

class BlogUnsubscribe extends Component {
  constructor(props) {
    super(props);

    this.state = {
      unsubscribed: false,
      isLoading: false,
      toUnsubscribe: [],
      listLoading: true
    };
  }

  componentDidMount() {
    const locHash = window.location.hash.replace('#', '');
    const locHashParts = locHash.split('/');
    const email = atob(decodeURIComponent(locHashParts[1]));
    const cityId = atob(decodeURIComponent(locHashParts[2])).split(' ');

    this.setState({
      hash: locHashParts[0],
      email: email,
      cities: cityId,
      listLoading: false
    });
  }

  onClick = (event) => {
    const {toUnsubscribe, cities} = this.state;
    const position = toUnsubscribe.indexOf(cities[event.target.value]);
    const resArr = toUnsubscribe;

    if(position > -1) {
      resArr.splice(position, 1);
    } else {
      resArr.push(cities[event.target.value]);
    }

    this.setState({
      toUnsubscribe: resArr
    });
  }

  handleSubmit = () => {
    const {email, hash, toUnsubscribe} = this.state;

    if(!size(toUnsubscribe)) {
      WidgetsActions.set('notify',[{
        msg: 'Не выбрано ни одного города',
        type: 'info'
      }]);
    } else {
      this.setState({
        isLoading: true
      });

      request
        .post('/backend/')
        .send({
          action: 'blog_unsubscribe',
          email: email,
          hash: hash,
          cities: toUnsubscribe
        })
        .set({
          Accept: 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
        })
        .end((err, res) => {
          const resErr = JSON.parse(res.text);

          if(err || !resErr.ok) {
            this.setState({
              isLoading: false
            });
            WidgetsActions.set('notify',[{
              msg: 'Ошибка! Попробуйте обновить страницу',
              type: 'dang'
            }]);
          } else {
            this.setState({
              isLoading: false,
              unsubscribed: true
            });
          }
        });
    }
  }

  render() {
    const {unsubscribed, isLoading, cities, listLoading} = this.state;
    const dontLeaveDog = '//cdn-media.etagi.com/static/site/8/84/84fedde25a4719c7f22d9b5808a8ecebde285ceb.jpg'; // eslint-disable-line max-len
    const goodbyeDog = '//cdn-media.etagi.com/static/site/8/88/885c32a11dd91d5da1fdf656f8dafc7df3567cf5.jpg'; // eslint-disable-line max-len
    const citiesList = data.collections && data.collections.cities ?
      data.collections.cities : null;
    const cityObjects = map(cities, (cityId, key) => {
      return (
        <div key={key}>
          <input
            id={`uns_checkbox-${key}`}
            value={key}
            type='checkbox'
            onClick={this.onClick}
          />
          <label htmlFor={`uns_checkbox-${key}`}>
            <i />
            <span>{citiesList[cityId] ? citiesList[cityId].name : null}</span>
          </label>
        </div>
      );
    });

    return (
      <div className='blog-unsubscribe'>
        {!unsubscribed ?
          (<div>
            <div>
              <img src={dontLeaveDog}/>
            </div>
            <h3>Пожалуйста, выберите города блогов,
              от рассылок которых вы хотите отписаться:</h3>
            {listLoading ?
              (<div
                className='loader-inner ball-clip-rotate'>
                <div />
              </div>) :
              (<div>
                <div className='blog-unsubscribe--city-list'>
                  {cityObjects}
                </div>
                <div>
                  <Button
                    bsStyle='link'
                    className='blog-unsubscribe--button-back'
                    href='/'>
                    Перейти на сайт
                  </Button>
                  <Button
                    bsStyle='link'
                    className='blog-unsubscribe--button-confirm'
                    disabled={isLoading}
                    onClick={this.handleSubmit}>
                    {isLoading ?
                      (<div className="loader-inner ball-pulse">
                        <div />
                        <div />
                        <div />
                      </div>) : 'Подтвердить'
                    }
                  </Button>
                </div>
              </div>)
            }
          </div>) :
          (<div>
            <div>
              <img src={goodbyeDog}/>
            </div>
            <h3>
              <strong>Спасибо за то, что вы делаете нас лучше!</strong>
            </h3>
          </div>)
        }
      </div>
    );
  }
}

export default BlogUnsubscribe;
