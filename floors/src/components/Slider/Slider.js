/**
 * Slider widget class
 *
 * @ver 0.0.1
 */

/**
* devDependencies
*/
import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import {toArray} from 'lodash';
import Col from 'react-bootstrap/lib/Col';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import {priceFormatter, declOfNum} from '../../utils/Helpers';
import Image from '../../shared/Image';
import Price from '../../shared/Price';
import createFragment from 'react-addons-create-fragment';
import withCondition from '../../decorators/withCondition';
import ContextType from '../../utils/contextType';
/*eslint camelcase: [2, {properties: "never"}]*/
const bxSlider = canUseDOM ? require('bxslider/dist/jquery.bxslider') : {}; // eslint-disable-line no-unused-vars

/*global data*/

@withCondition()
class Slider extends Component {
  static childContextTypes = ContextType;

  getChildContext() {
    return this.props.context;
  }

  constructor(props) {
    super(props);
    this.state = {
      minSlides: props.show_count_slide,
      maxSlides: props.show_count_slide,
      showNotice: props.show_notice,
      moveSlides: props.scroll_count_slide,
      autoScroll: parseInt(props.auto_scroll) === 1 ? true : false,
      loop: true,
      pager: parseInt(props.slider_type) === 0 ? true : false,
      autoHover: true,
      autoControls: false
    };
  }

  componentDidMount() {
    const state = this.state;
    const props = this.props;
    let widthSlide = 230, slideMargin = 20;

    if (props.slider_type === '0') {
      widthSlide = 1920;
      slideMargin = 0;
    } else if (props.slider_type === '8') {
      widthSlide = 475;
      slideMargin = 0;
    } else {
      switch (props.show_count_slide) {
      case '1':
        widthSlide = 980;
        break;
      case '2':
        widthSlide = 480;
        break;
      case '3':
        widthSlide = 314;
        slideMargin = 19;
        break;
      case '4':
        widthSlide = 230;
        break;
      case '5':
        widthSlide = 180;
        break;
      default:
        widthSlide = 230;
        props.show_count_slide = 4;
      }
    }

    const mode = props.slider_type === '8' ? 'fade' : 'horizontal';

    $(document).ready(() => {
      const photosMain = $(`.${props.mountNode}`).bxSlider({
        auto: state.autoScroll,
        autoControls: state.autoControls,
        minSlides: state.minSlides,
        maxSlides: state.maxSlides,
        slideWidth: widthSlide,
        mode: mode,
        moveSlides: state.moveSlides,
        pager: state.pager,
        autoHover: state.autoHover,
        loop: state.loop,
        slideMargin: slideMargin,
        onSlideBefore: () => {
          if (state.autoScroll) {
            photosMain.startAuto();
          }
        }
      });
    });

  }

  render() {
    const props = this.props;
    const {
      'slider_title': sliderTitle,
      slides: slidesArr,
      mountNode,
      'slider_type': sliderType
    } = this.props;
    const showNotice = parseInt(this.state.showNotice);

    const slidesArray = toArray(slidesArr) || [];
    let slides, title;
    const classSlide = `${mountNode} clearfix`;
    const notice = showNotice === 1 ? (props.slider_notice ?
      <div className="newhousesSlider--notice container-wide">
        <i className="icon-info"></i>
        <span className="newhousesSlider--notice__notice">
          {props.slider_notice}
        </span>
      </div> :
      <div className="newhousesSlider--notice container-wide">
        <i className="icon-info"></i>
        <span className="newhousesSlider--notice__upper">
          Новостройки без комиссии!&nbsp;
        </span>
        <span>
          Комиссия =&nbsp;
          <span className="newhousesSlider--notice__crimson">
            0 руб.&nbsp;
          </span>
          Новостройки с «Этажами» по единой цене с застройщиками
        </span>
      </div>) :
      null;

    if (sliderType === '0') {
      title = sliderTitle ?
        <h2 className="slider--title">{sliderTitle}</h2> :
        '';
      slides = slidesArray.map((slide, key) => {
        return <MainSliderItem key={key} slide={slide} />;
      });

      const className = `pageSlider ${this.props.arrowsType}`;

      return (
        <div>
          {title}
          <div className={className}>
            <div className={ classSlide }>
              {slides}
            </div>
          </div>
        </div>
      );

    } else if (sliderType === '2' || sliderType === '6') {
      title = sliderTitle === ' ' ? '' : (
        <h2 className="slider--title">
          {sliderTitle || 'ипотека на новостройки'}
        </h2>
      );
      slides = slidesArray.map((slide, key) => {
        return (slide) ?
          <MortgageSliderItem key={key}
                              slide={slide}
                              pref={props.show_pref} /> :
          null;
      });

      const arrDeclBank = ['банк', 'банка', 'банков'];
      const declCountBank = declOfNum(props.countBank, arrDeclBank);
      const className = `ipotekaSlider ${this.props.arrowsType}`;

      return (
        <div>
          {title}
          <div className={className}>
              <div className={classSlide}>
                  {slides}
              </div>
              <a target="_blank"
                href="/ipoteka/"
                className="ipotekaSlider--notice container-wide">
                <span className="ipotekaSlider--notice__plus">+</span><br/>
                <span className="ipotekaSlider--notice__banks">
                  { `Еще ${props.countBank} ${declCountBank}`}
                </span>
              </a>
          </div>
        </div>
      );
    } else if (sliderType === '7') {
      title = sliderTitle === ' ' ? '' : (
        <h2 className="slider--title" style={{fontWeight: 'normal'}}>
          {sliderTitle || 'ипотека'}
        </h2>
      );
      slides = slidesArray.map((slide, key) => {
        return (slide) ?
          <MortgageSliderExtendItem key={key}
                                    slide={slide}
                                    pref={props.show_pref} /> :
          null;
      });

      const className = `ipotekaSlider ${this.props.arrowsType}`;

      return (
        <div>
          {title}
          <div className={className}>
            <div className={classSlide}>
              {slides}
            </div>
          </div>
        </div>
      );
    } else if (sliderType === '3') {
      title = sliderTitle === ' ' ? '' : (
        <h2 className="slider--title paddingFix">
          {sliderTitle || 'застройщики - партнеры'}
        </h2>
      );
      slides = slidesArray.map((slide, key) => {
        return <BuilderSlideItem key={key} slide={slide} />;
      });
      const className = `buildersSlider ${this.props.arrowsType}`;

      return (
        <div>
          {title}
          <div className={className}>
              <div className={classSlide}>
                  {slides}
              </div>
              {notice}
          </div>
        </div>
      );
    } else if (sliderType === '8') {
      title = sliderTitle ?
        <h2 className="slider--title">{sliderTitle}</h2> :
        '';
      slides = slidesArray.map((slide, key) => {
        return <ApartamentSliderItem key={key} slide={slide} />;
      });

      const className = `${this.props.arrowsType}`;

      return (
        <div>
          {title}
          <div className={className}>
            <div className={ classSlide }>
              {slides}
            </div>
          </div>
        </div>
      );

    }

  }
}

Slider.defaultProps = {
  slider_title: '',
  arrowsType: 'arrowsNormal',
  show_notice: '1'
};

class MainSliderItem extends Component {
  render() {
    const {content, image} = this.props.slide;
    const slideContent = content ? {__html: content} : {__html: ''};
    const divStyle = {background: `url(${image}) no-repeat center top`};

    return (
      <div className="post-list-item">
          <div className='pageSlederItem' style={ divStyle }>
            <div className='pageSlederHtml'
                 dangerouslySetInnerHTML={ slideContent } />
          </div>
      </div>
    );
  }
}

class ApartamentSliderItem extends Component {
  render() {
    const {content} = this.props.slide;
    const slideContent = content ? {__html: content} : {__html: ''};

    return (
      <div className="post-list-item">
        <div className='apartamentSlederItem'>
          <div className='apartamentSlederHtml'
               dangerouslySetInnerHTML={ slideContent } />
        </div>
      </div>
    );
  }
}

class MortgageSliderItem extends Component {
  render() {
    const {
      'bank_image': bankImage,
      'bank_id': bankId,
      'program_id': programId,
      'program_title': programTitle,
      percent,
      pref
    } = this.props.slide;

    const bankSearchId = data.collections.banks
    .find(item => item.id === bankId.toString());
    const bankUrl = `/ipoteka/${bankSearchId.name_tr}/`;
    const programUrl = `/ipoteka-programs/${programId}.html`;
    const percentVal = percent || '';
    const programTitleVar = programTitle || '';

    const prefPercent = pref ?
      +(parseFloat(percentVal) - parseFloat(pref)).toFixed(2) : percentVal;

    const imageProps = {
      image: bankImage,
      visual: 'banks',
      width: 240,
      height: 160
    };

    const countPercent = this.props.pref === '1' && pref ? (
      <div className="ipotekaPercent">
        Ипотека от
        <span className="ipotekaOldPerсent">{`${percentVal}%`}</span>
          <span className="ipotekaPerсentVal">
            <a target="_blank" href={programUrl}>
              {`${prefPercent}%`}
            </a>
          </span>
      </div>
    ) : (
      <div className="ipotekaPercent">
        Ипотека от
        <span className="ipotekaPerсentVal">
          <a target="_blank" href={programUrl}>
            {`${prefPercent}%`}
          </a>
        </span>
      </div>
    );

    return (
      <div className="ipotekaSliderItem">
          <div className="ipotekaSliderLogo text-center">
              <a target="_blank" href={bankUrl}>
                <Image {...imageProps}/>
              </a>
          </div>
          {countPercent}
          <div className="ipotekaText">
            <table>
              <tbody>
                <tr>
                  <td>
                    <a target="_blank" href={programUrl}>
                      {programTitleVar}
                    </a>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
      </div>
    );
  }
}

class MortgageSliderExtendItem extends Component {
  render() {
    const {
      'bank_image': bankImage,
      'program_id': programId,
      'program_title': programTitle,
      'avanse_min': avanseMin,
      'years_min': yearsMin,
      percent,
      pref
    } = this.props.slide;

    const programUrl = `/ipoteka-programs/${programId}.html`;

    const percentVal = percent || '';
    const programTitleVar = programTitle || '';
    const programTitleVarText = programTitle ?
      ((programTitle.length > 65) ?
        `${programTitle.substr(0, 65).trim()}...` :
        programTitle) : '';

    let prefPercent = pref ?
      +(parseFloat(percentVal) - parseFloat(pref)).toFixed(2) : percentVal;

    prefPercent = `${prefPercent}%`;
    const imageProps = {
      image: bankImage,
      visual: 'banks',
      width: 240,
      height: 160
    };

    const countPercent = (
        <tr>
          <th className="width30 red">
            {prefPercent}
          </th>
          <td className="width70">{`Ставка от ${prefPercent}`}</td>
        </tr>);

    const countAvanseMin = (
        <tr>
          <th className="width30">
            {`${avanseMin}%`}
          </th>
          <td className="width70">{`Первоначальный взнос от ${avanseMin}%`}</td>
        </tr>);

    const countYearsMin = (
        <tr>
          {yearsMin === 1 ?
          <th className="width30 font-normal">от <strong>1</strong> года</th> :
          <th className="width30 font-normal">
            от <strong>{yearsMin}</strong> лет
          </th>
          }
          <td className="width70">Срок кредитования</td>
        </tr>);

    return (
      <div className="ipotekaLandingSliderItem">
        <div className="ipotekaLandingSliderLogo text-center">
          <a target="_blank" href={programUrl}>
            <Image {...imageProps}/>
          </a>
        </div>
        <div className="ipotekaSliderContent">
          <a target="_blank" href={programUrl}
             title={programTitleVar.replace(/"/g,'')}
             className="ipotekaSliderTitle">
            {programTitleVarText}
          </a>
          <table>
            <tbody>
              {countPercent}
              {countAvanseMin}
              {countYearsMin}
            </tbody>
          </table>
          <a target="_blank" href={programUrl} className="btn-lightgreen">
            Узнать подробнее
          </a>
        </div>
      </div>
    );
  }
}

class BuilderSlideItem extends Component {
  render() {
    const props = this.props;
    let outputLogo;

    const url = props.slide.slugUrl ?
      props.slide.slugUrl : `/zastr/builder/?id=${props.slide.builder}`;

    const imageProps = {
      image: props.slide.logo,
      visual: 'builders',
      width: 240,
      height: 160
    };


    if (props.slide.logo === '') {
      outputLogo = createFragment({
        outputLogo:
          <div className="sliderLog-builderName">
            {props.slide.name}
          </div>
      });
    } else {
      outputLogo = createFragment({
        outputLogo:
          <Image {...imageProps}/>
      });
    }

    return (
      <div className="buildersSliderItem">
          <div className="buildersSliderLogo text-center">
            <a target="_blank" href={url}>
              {outputLogo}
            </a>
          </div>
          <div className="buildersSliderCounts clearfix">
            <Col xs={4}>
              <Price price={Math.round(props.slide.m2)}/>
            </Col>
            <Col xs={4}>
              {props.slide.count}
            </Col>
            <Col xs={4}>
              {priceFormatter(Math.round(props.slide.area))}
            </Col>
          </div>
          <div className="buildersSliderDescription clearfix">
            <Col xs={4}>Средняя цена за м<sup>2</sup></Col>
            <Col xs={4}>В продаже квартир</Col>
            <Col xs={4}>В продаже м<sup>2</sup></Col>
          </div>
      </div>
    );
  }
}

MortgageSliderExtendItem.propTypes = {
  slide: React.PropTypes.object
};

ApartamentSliderItem.propTypes = {
  slide: React.PropTypes.object
};

MainSliderItem.propTypes = {
  slide: React.PropTypes.object
};

MortgageSliderItem.propTypes = {
  slide: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object
  ]),
  pref: React.PropTypes.string
};

Slider.propTypes = {
  'show_count_slide': React.PropTypes.string,
  'scroll_count_slide': React.PropTypes.string,
  'auto_scroll': React.PropTypes.string,
  'mountNode': React.PropTypes.string,
  'slider_title': React.PropTypes.string,
  'slider_type': React.PropTypes.string,
  'arrowsType': React.PropTypes.string,
  'show_notice': React.PropTypes.string,
  slides: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object
  ]),
  'show_pref': React.PropTypes.string,
  context: React.PropTypes.shape(ContextType).isRequired,
};

export default Slider;
