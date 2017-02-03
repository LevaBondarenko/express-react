/**
 * Order widget class
 *
 * @ver 0.0.1
 * @author tatarchuk
 */

import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars
import {map, size, orderBy, forEach} from 'lodash';
import ga from '../../utils/ga';
import ReactCssTransitionGroup from 'react-addons-css-transition-group';

/*global data*/
class RatingParameters extends Component {

  static engArr = {
    'Местоположение': 'location',
    'Инфраструктура': 'infrastructure',
    'Информация о доме': 'house',
    'Квартира': 'flat',
    'Готовность к сделке': 'deal',
  };

  constructor(props) {
    super(props);

    const {rating: objRating, info: {ratings}} = data.object;
    let objRatingMap = objRating;
    let secondRating = JSON.parse(ratings);

    if(Object.keys(secondRating).length > 6) {
      secondRating =  {
        0: secondRating[0],
        7: secondRating[7],
        177: secondRating[180],
        178: secondRating[179],
        179: secondRating[177],
        180: secondRating[178],
        181: secondRating[181]
      };
      objRatingMap = {
        0: objRating[0],
        7: objRating[7],
        177: objRating[180],
        178: objRating[179],
        179: objRating[177],
        180: objRating[178],
        181: objRating[181]
      };
    }else if(Object.keys(secondRating).length === 5) {
      secondRating =  {
        0: secondRating[0],
        1: secondRating[7],
        2: secondRating[1],
        5: secondRating[2],
        7: secondRating[5],
      };
      objRatingMap = {
        0: objRating[0],
        1: objRating[7],
        2: objRating[1],
        5: objRating[2],
        7: objRating[5],
      };
    }else if(Object.keys(secondRating).length === 6) {
      secondRating =  {
        0: secondRating[0],
        28: secondRating[28],
        29: secondRating[29],
        30: secondRating[30],
        31: secondRating[31],
        32: secondRating[32],
        177: secondRating[180],
        178: secondRating[179],
        179: secondRating[177],
        180: secondRating[178],
        181: secondRating[181],
      };
      objRatingMap = {
        0: objRating[0],
        28: objRating[28],
        29: objRating[29],
        30: objRating[30],
        31: objRating[31],
        32: objRating[32],
        177: objRating[180],
        178: objRating[179],
        179: objRating[177],
        180: objRating[178],
        181: objRating[181],
      };
    }else if (Object.keys(secondRating).length < 6) {
      secondRating = secondRating;
      objRatingMap = objRatingMap;
    }
    const secondRatingCopy = {};
    const objRatingMapCopy = {};

    forEach(secondRating, (val, key) => {
      if (val) {
        secondRatingCopy[key] = val;
      }
    });
    forEach(objRatingMap, (val, key) => {
      if (val) {
        objRatingMapCopy[key] = val;
      }
    });

    this.state = {
      rating: secondRatingCopy,
      parameters: objRating ? objRatingMapCopy : null,
      show: {},
      showParams: {},
      heights: {}
    };
  }


  handleClock = (event) => {
    const catNum = event.currentTarget.dataset.type;
    const {show} = this.state;

    show[catNum] = show[catNum] ? false : true;

    const txtGa = RatingParameters.engArr[this.state.rating[catNum].name];

    if (txtGa) {
      ga('button', `site_rating_about_${txtGa}_${show[catNum] ? 'show' : 'hide'}`); //eslint-disable-line
    }

    this.setState(() => ({
      show: show
    }));
  }



  handleClockParams = (event) => {
    const catNum = event.currentTarget.dataset.params;
    const {showParams} = this.state;

    showParams[catNum] = showParams[catNum] ? false : true;

    this.setState(() => ({
      showParams: showParams
    }));
  }

  render() {
    const {rating, parameters, show, showParams} = this.state;
    const handleClick = this.handleClock.bind(this);
    const handleClickParams = this.handleClockParams.bind(this);
    const params = rating ? map(rating, (val, key) => {
      let numFormat = Math.round(parseFloat(val.value) * 10) / 10;
      const showBlock = show && show[key];

      numFormat = numFormat >= 0 ?
        numFormat.toString().replace('.', ',') : '—';

      const arr1 = [];
      const arr2 = [];
      const arr3 = [];
      const arr4 = [];
      let increment = 0;

      showBlock && parameters[key][2] &&
        map(parameters[key][2], (paramName, keyParam) => {
          let valParameter = '0';
          /* свойства элемента рейтинга*/

          paramName[1] = orderBy(paramName[1],  item => {
            return item[1];
          }, ['desc']);
          const itemProperties = map(paramName[1], (property, keyProperty) => {
            if (property[2]) {
              valParameter = parseInt(valParameter) >= property[1] ?
                valParameter : property[1];
            }
            //remove this block after
            let parameterName = property[0] ?
              property[0].toString().split('-') : '';

            if(size(parameterName) === 2) {
              parameterName[0] = parseFloat(parameterName[0]);
              parameterName[1] = parseFloat(parameterName[1]);
              if(!isNaN(parameterName[0]) && !isNaN(parameterName[1])) {
                if(parameterName[0] === parameterName[1]) {
                  parameterName = parameterName[0];
                }else if ((parameterName[1] > parameterName[0]) &&
                 (parameterName[1] < 1000 && parameterName[0] < 1000) &&
                 (parameterName[1] - parameterName[0]) > 40) {
                  parameterName = `${parameterName[0]}+`;
                }else {
                  parameterName = property[0];
                }
              } else {
                parameterName = property[0];
              }
            } else {
              parameterName = property[0];
            }
            keyProperty = keyProperty.toString().split('-');

            return (
              <div className="ratingParametersItemValue" key={keyProperty[0]}>
                <div className="ratingParametersItemValue-name">
                  {parameterName}
                </div>
                <div className="ratingParametersItemValue-val">
                  {property[1]}
                </div>
                {property[2] ?
                  <i className="fa fa-check ratingPropertyCheck" /> :
                  null}
                <div className="ratingParametersItemValue-rating">
                  <div className="ratingParametersItemValue-ratingActive"
                       style={{width: `${property[1] * 10}%`}} />
                </div>
              </div>
            );
          });
          const valParameterStr = parseInt(valParameter) > -1 ?
            `${valParameter}/10` : valParameter;
          const classActive = `ratingParametersItem-name ${
            showParams[keyParam] ? 'ratingParametersItem-active' : null}`;
          const paramsElement =
            (<div className="ratingParametersItem" key={keyParam}>
            <div className="ratingParametersItem-header"
                 data-params={keyParam}
                 onClick={handleClickParams}>
              <div className="ratingParametersItem-value">
                {valParameterStr}
              </div>
              <div className={classActive}>
                <span>{paramName[0]}</span>
              </div>
              <div className="ratingParametersItem-arrow">
                {
                  showParams[keyParam] ?
                      <i className="fa fa-caret-up" /> :
                      <i className="fa fa-caret-down" />
                }
              </div>
            </div>
              <ReactCssTransitionGroup
                transitionName='ratingGroup'
                transitionEnter={true}
                transitionLeave={true}
                transitionEnterTimeout={1000}
                transitionLeaveTimeout={500}
                component='div'>
              {!!showParams[keyParam] ? (
                <div>{itemProperties}</div>
              ) : null}
            </ReactCssTransitionGroup>
          </div>);

          increment += 1;

          if (increment == 1) {
            arr1.push(paramsElement);
          } else if (increment == 2) {
            arr2.push(paramsElement);
          } else if (increment == 3) {
            arr3.push(paramsElement);
          } else if (increment == 4) {
            arr4.push(paramsElement);
            increment = 0;
          }
        });

      /* eslint-disable max-len, no-trailing-spaces */
      return key > 0 ? (
        <div key={key} className="ratingParametersList">
          <div className="ratingParametersList-header"
               onClick={handleClick}
               data-type={key}>
            <div className="ratingParametersList-number">{numFormat}</div>
            <div className="ratingParametersList-title">{val.name}</div>

            {parameters[key][2] || val.name === 'Ликвидность' ?
              <div className="ratingParametersList-toggle">
                {showBlock ? 'Свернуть ' : 'Развернуть '}
                {showBlock ?
                  <i className="fa fa-caret-up" /> :
                  <i className="fa fa-caret-down" />}
              </div> : null}
          </div>
            <ReactCssTransitionGroup
              transitionName='ratingGroup'
              transitionEnter={true}
              transitionLeave={true}
              transitionEnterTimeout={500}
              transitionLeaveTimeout={500}
              component='div'>
          {(showBlock && arr1.length > 0) ? (
              <div className="ratingParametersList-items">
                <div className="ratingParametersItemWrapper">{arr1}</div>
                <div className="ratingParametersItemWrapper">{arr2}</div>
                <div className="ratingParametersItemWrapper">{arr3}</div>
                <div className="ratingParametersItemWrapper">{arr4}</div>
              </div>
            ) : (showBlock && val.name === 'Ликвидность') ? (
            <div className="ratingParametersList-items">
              <p>
                Ликвидность — способность объекта недвижимости быть быстро
                проданным по цене, близкой к рыночной. Чем привлекательнее для
                потенциального покупателя характеристики объекта, включая цену,
                тем выше ликвидность. Процент ликвидности определяется на основе
                следующих характеристик объекта:
              </p>
              <ul className="liquidityRatingText">
                <li>отклонение цены объекта от рыночной;</li>
                <li>доступность объекта по полной цене;</li>
                <li>популярность района объекта;</li>
                <li>востребованность площади объекта;</li>
                <li>возраст дома объекта.</li>
              </ul>
              <p>
                При расчете процента учитывается ряд дополнительных факторов вроде наличия обременения, которые ухудшают ликвидность объекта.
              </p>
            </div>
          ) : null}
            </ReactCssTransitionGroup>
        </div>
      ) :
      null;
    }) :
      <p>Данный объект не обсчитан по рейтингу</p>;

    /* eslint-enable */

    return (
      <div className="ratingParametersWrapper">
        {params}
      </div>);
  }
}


export default RatingParameters;
