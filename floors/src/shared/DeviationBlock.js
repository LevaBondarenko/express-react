import React, {Component, PropTypes} from 'react'; // eslint-disable-line no-unused-vars

import OverlayTrigger from 'react-bootstrap/lib/OverlayTrigger';
import Popover from 'react-bootstrap/lib/Popover';
import {map} from 'lodash';

class DeviationBlock extends Component {
  static propTypes = {
    deviation: PropTypes.number,
    randCol: PropTypes.array
  };

  render() {
    const {deviation, randCol} = this.props;
    const deviationTooltip = (
      <OverlayTrigger placement='right' overlay={
            (<Popover
              id={`deviationTooltip_${deviation}`}
              className="noticeFlat">
              <p>Отклонение в процентах показывает разницу между
        средней стоимостью <strong>&nbsp;1&nbsp;квадратного метра&nbsp;
        </strong> аналогичныхактивных и проданных объектов и стоимостью
        <strong>&nbsp;1&nbsp;квадратного метра</strong> данного объекта.
        Показатель может меняться в течение периода нахождения объекта на
        продаже.</p>
            </Popover>)}>
          <span className='tooltip_icon tooltip-icon__question
               tooltip-icon__mgLeftTop' />
      </OverlayTrigger>
    );
    const param = deviation <= 0 ? true : false;
    const classBlockInvert = `icon-diviationPic_col ${param ? 'green' : 'red'}`;
    const classBlock = `icon-diviationPic_col ${param ? 'red' : 'green'}`;

    const classNum = `block--diviations__prc ${param ?
                            'colorApple' : 'colorCrimson'}`;
    const numPercent = Math.abs(deviation);
    const text = `${param ? 'ниже' : 'выше' } средней цены по рынку`;
    const chartUp = map(randCol, (val, key) => {
      const classInv = val.height === '30%' && param ||
        val.height === '80%' && !param ? classBlock : classBlockInvert;

      return <div className={classInv} style={val} key={key} /> ;
    });

    return (
      <div className="block--diviations">
        <div className="icon-diviationPic">
          {chartUp}
        </div>
        <p className="block--diviations__text">на
                <span className={classNum}>
                  {` ${numPercent}%`}
                  {deviationTooltip}
                </span><br/>{text}
        </p>
      </div>);
  }
}

export default DeviationBlock;
