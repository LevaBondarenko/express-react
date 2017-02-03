import React, {Component, PropTypes} from 'react';
import Image from '../../shared/Image';
import classNames from 'classnames';
import {throttle} from 'lodash';

class TransactionTextBlock extends Component {
  static propTypes = {
    item: PropTypes.object,
    fields: PropTypes.array
  };

  constructor(props) {
    super(props);

    this.state = {
      active: false,
      animation: false,
      prevElement: false
    };
  }

  componentDidMount() {
    window.addEventListener('scroll', throttle(this.onScroll, 400));
    this.onScroll();
  }

  componentWillUnmount() {
    window.removeEventListener('scroll', this.onScroll);
  }

  onScroll = () => {
    const {item} = this.props;
    const screenHeight = document.documentElement.clientHeight;
    const element = document.getElementById(`textBlock_${item.id}`);
    const elementRefs = this.refs.textBlock;
    const prevElement = elementRefs.previousElementSibling;

    if ((parseInt(screenHeight) / 2) >= element.getBoundingClientRect().top) {
      if (!prevElement) {
        this.setState(() => ({
          prevElement: true,
          active: true
        }));
      }else if(prevElement && prevElement.dataset.active === 'true') {
        setTimeout(() => {
          this.setState(() => ({
            prevElement: true,
            active: true
          }));
        }, 300);
      }
    }
  }

  imgBlock = (number, firstSrc, char = null, command = null) => {
    const arrayFirst = [];
    const {active} = this.state;
    let result;

    char = char ? (<p>{char}</p>) : null;

    for (let i = 0; i < number; i++) {
      arrayFirst[i] = firstSrc;
    }

    switch (command) {
    case 'fade':
      result = arrayFirst.map(item => {
        return (<Image key={item.id} ref='img' image={item}/>);
      });
      if (active) {
        setTimeout(() => {
          this.setState(() => ({
            animation: true
          }));
        }, 800);
      }
      break;
    default:
      result = arrayFirst.map(item => {
        return (<Image key={item.id} ref='img' image={item}/>);
      });
    }

    return (
      <span>
        <span>
          {result}
        </span>
        {char}
      </span>
    );
  }

  render() {
    const {item} = this.props;
    const {active, animation} = this.state;
    const text = {__html: item.title};
    const oddClass = parseInt(item.id) % 2 === 0 ?
     'left' : 'right';
    const count = item.count.split('|');
    const color = active ? 'red' : 'white';
    //gods forgives me
    const centerArrowStyle = item.title.length > 150 ? {top: '-15px'} :
     (item.title.length >= 130 ? {top: '-8px'} : null);

    return (
      <div ref='textBlock' data-active={active}>
        <div  id={`textBlock_${item.id}`} className='textId'>
          <div className={oddClass} style={centerArrowStyle}>
            <div className={classNames(
               'textBlock',
               `arrow-${oddClass}`,
               {'active': active ? true : false})}>
              <span dangerouslySetInnerHTML={text}></span>
            </div>
            <div className={classNames(
                  'img-block',
                  {'active': active ? true : false})}>
              <span>
                {animation && active ?
                  this.imgBlock(count[0], item.secondImg) :
                   this.imgBlock(count[0], item.firstImg,
                   null, 'fade')}
                {this.imgBlock(count[1], item.firstImg, count[2])}
              </span>
            </div>
          </div>
          <div className={classNames(
              `shapeBlock-${oddClass}`,
              {'active': active ? true : false})}>
           <span className={classNames(
             'circle',
             color,
             `${oddClass}Circle`)}></span>
           {parseInt(item.id) !== 0  ?
             (<span>
               <span className={classNames(
                 'line',
                 'down',
                 color,
                 `${oddClass}Line`)}></span>
               <span className={classNames(
                 'line',
                 'down',
                 color,
                 `${oddClass}Line`)}></span>
             </span>) : null}
          </div>
      </div>
      </div>
    );
  }
}

export default TransactionTextBlock;
