import React, {PropTypes} from 'react';
import createFragment from 'react-addons-create-fragment';
import Row from 'react-bootstrap/lib/Row';
import Col from 'react-bootstrap/lib/Col';
import {map, size, find} from 'lodash';
import {declOfNum} from '../../utils/Helpers';
import {getMortageParamsNames} from '../../utils/mortgageHelpers';
import Price from '../../shared/Price';
import PriceUnit from '../../shared/PriceUnit';
import s from './MortgageParamsForm.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';

const MortgageParamsForm = (props) => {
  const {mortgageParams, perc, pref, programTitle} = props;
  const paramsNames = [
    'program_types',
    'price',
    'avanse',
    'credit',
    'years',
    'bankProject',
    'program_types_strict',
    'incomeAmount',
    'employment'
  ];
  let fields = map(paramsNames, item => {
    const param = getMortageParamsNames(item, mortgageParams[item]);

    if(param) {
      let value = '';
      let title = param.title;

      switch(param.valueType) {
      case 'currency':
        value = (
          <Price price={param.value}> <PriceUnit/></Price>
        );
        break;
      case 'percentAvanse':
        const avanseAmount =
          Math.round(mortgageParams.price * param.value / 100);
        const titleParsed = title.match(/(.*)(\%)(.*)/);

        title = (
          <span>
            {titleParsed[1]}
            <span className={s.percentBlock}>{titleParsed[2]}</span>
            {titleParsed[3]}
          </span>
        );
        value = (
          <span>
            <Price price={avanseAmount}> <PriceUnit/></Price>&nbsp;
            (<span className={s.percentBlock}>{param.value}%</span>)
          </span>
        );
        break;
      case 'years':
        value = `${param.value} ${declOfNum(param.value, ['год', 'года', 'лет'])}`; //eslint-disable-line max-len
        break;
      case 'collection':
        const collsValue = find(mortgageParams.collections, {id: param.value});

        value = collsValue ? collsValue.name : 'Не выбрано';
        break;
      default:
        value = param.value;
      }

      return (
        <Col xs={2} className={s.paramItem}>
          <div className={s.paramName}>
            {title}
          </div>
          <div className={s.paramValue}>
            {value}
          </div>
        </Col>
      );
    } else {
      return null;
    }
  });

  fields = size(fields) > 0 ?
    createFragment({fields: fields}) :
    createFragment({fields: <div/>});

  return (
    <div>
      <div className={s.formHeader}>
        Процентная ставка для Вас.
      </div>
      <div className={s.formDescription}>
        <span>
          Процентная ставка по программе "{programTitle}"
          для Вас: <strong>{perc}%</strong>.
        </span>
        {pref > 0 ? (
          <span>
            Ставка предложена с учетом скидки {perc - pref}%
            для клиентов компании "Этажи".
          </span>
        ) : null}
        <span>
          Так же на процентную ставку по ипотеке влияют и данные в вашем
          поисковом запросе.
        </span>
      </div>
      <Row className={s.paramsTable}>
        {fields}
      </Row>
    </div>
  );
};

MortgageParamsForm.propTypes = {
  mortgageParams: PropTypes.object,
  perc: PropTypes.number,
  pref: PropTypes.number,
  programTitle: PropTypes.string
};

export default withStyles(s)(MortgageParamsForm);
