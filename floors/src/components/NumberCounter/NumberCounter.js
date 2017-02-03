/**
 * Created by tatarchuk on 8.12.15.
 */

import withinviewport from 'withinviewport/withinviewport';

import React, {Component} from 'react'; // eslint-disable-line no-unused-vars


class NumberCounter extends Component {

  constructor(props) {
    super(props);
  }

  componentDidMount() {
    const {id, number} = this.props;
    const currentNumber = 0;
    const elem = $(`#numbercounter_${id} .numberCounter--number`);
    const elemBottom = $(`#numbercounter_${id} .numberCounter--textDown`);
    const boolEl = withinviewport(elemBottom);
    let check = 1;
    const mm = () => {
      $({numberValue: currentNumber}).animate({numberValue: number}, {
        duration: 1500,
        easing: 'linear',
        step: function() {
          elem.text(Math.ceil(this.numberValue));
        },
        complete: () => {
          elem.text(number);
        }
      });
    };

    $(window).bind('scroll', () => {
      const boolEl = withinviewport(elemBottom);

      if (boolEl) {
        check = 0;
        mm();
        $(window).unbind();
      }
    });

    if (boolEl && check) {
      $(window).unbind();
      mm();
    }
  }

  render() {
    const {
      textUp,
      textDown
    } = this.props;

    const textDownVal = {__html: textDown};

    const textUpVal = textUp ?
      <p className="numberCounter--textUp">{textUp}</p> :
      <p className="numberCounter--textUp">&nbsp;</p>;

    return (
      <div className="numberCounter">
        <div className="numberCounter--blockNumber">
          {textUpVal}
          <p className="numberCounter--number"></p>
        </div>
        <p className="numberCounter--textDown"
           dangerouslySetInnerHTML={textDownVal} />
      </div>
    );
  }
}

NumberCounter.propTypes = {
  id: React.PropTypes.string,
  number: React.PropTypes.string,
  textUp: React.PropTypes.string,
  textDown: React.PropTypes.string
};

NumberCounter.defaultProps = {
  id: 'defaultId',
  number: '0',
  textUp: '',
  textDown: ''
};

export default NumberCounter;
