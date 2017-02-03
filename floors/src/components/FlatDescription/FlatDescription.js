import React, {Component} from 'react'; // eslint-disable-line no-unused-vars
import GeminiScrollbar from 'react-gemini-scrollbar';
import withCondition from '../../decorators/withCondition';
import ReactDOM from 'react-dom';

@withCondition()
class FlatDescription extends Component {

  componentDidMount() {
    const root = ReactDOM.findDOMNode(this.refs.descr);
    const trueHeight = $(root).find('.gm-scrollbar-container').height();

    $(root).find('.gm-scroll-view').css('height', trueHeight);
  }

  render() {
    /* global data */
    const flat = data.object.info;
    const props = this.props;
    const showDescription = parseInt(props.showDescription) === 2 ?
      true : false;
    const showOptional = parseInt(props.showOptional) === 2 ? true : false;
    const mainTitle = props.mainTitle ? props.mainTitle : 'Описание квартиры';
    const mainTitleComponent = showDescription &&
        (flat.notes && flat.notes !== '0') ? (
      <h4 className='flat-description-title flat-description-title_first'>
        {mainTitle}
      </h4>
    ) : '';
    const description = flat.notes && flat.notes !== '0' ?
      {__html: flat.notes} :
      {__html: ''};
    const descriptionComponent = showDescription ? (
      <div className="builder-description"
           dangerouslySetInnerHTML={ description }></div>
    ) : '';
    const optTitle = props.optTitle ? props.optTitle : 'А так же';
    const optTitleComponent = props.optTitle ? (
      <h4 className='flat-description-title'>
        {optTitle}
      </h4>
    ) : '';
    const has = flat.has ? flat.has
      .replace(/([{}"])/g, '')
      .replace(/[,]/g, ', ') : false;
    const has2 = flat.has2 ? flat.has2
      .replace(/([{}"])/g, '')
      .replace(/[,]/g, ', ') : false;
    const has5 = flat.has5 ? flat.has5
      .replace(/([{}"])/g, '')
      .replace(/[,]/g, ', ') : false;
    let allowed = flat.allowed_ru ? flat.allowed_ru
      .replace(/([{}"])/g, '')
      .replace(/[,]/g, ', ') : false;
    let territory = flat.territory ? flat.territory
      .replace(/([{}"])/g, '')
      .replace(/[,]/g, ', ') : false;
    let waterline = flat.waterline_ru ? flat.waterline_ru
      .replace(/([{}"])/g, '')
      .replace(/[,]/g, ', ') : false;
    let heating = flat.heating_ru && flat.heating_ru !== '0' ? flat.heating_ru
      .replace(/([{}"])/g, '')
      .replace(/[,]/g, ', ') : false;
    let kanalizacija = flat.kanalizacija_ru && flat.kanalizacija_ru !== '0' ?
      flat.kanalizacija_ru
      .replace(/([{}"])/g, '')
      .replace(/[,]/g, ', ') : false;
    const windows = flat.windows_ru && flat.windows_ru !== '0' ? (
      <div><b>Окна: </b>{flat.windows_ru}</div>
    ) : '';
    const managementCompanyName = data.object.info.management_company_name;
    const company = managementCompanyName ? (
      <div>
        <b>Управляющая компания:&nbsp; </b>
          {managementCompanyName}
      </div>
    ) : null;
    let flatHas;
    let landHas;
    let keep;
    let info;
    let objTypeText;
    let walls;

    switch (flat.type) {
    case 'cottage':
      objTypeText = 'В доме есть: ';
      break;
    case 'house':
      objTypeText = 'В доме есть: ';
      break;
    case 'garden':
      objTypeText = 'В доме есть: ';
      break;
    case 'land':
      objTypeText = 'В доме есть: ';
      break;
    default:
      objTypeText = 'В квартире есть: ';
      break;
    }

    if ((has || has2) && showOptional) {
      flatHas = (
        <div>
          <b>{objTypeText}</b>
          {has ? has + (has2 ? `, ${has2}` : '') : has2}
        </div>
      );
    }

    if (has5 && showOptional) {
      landHas = (
        <div><b>На участке есть: </b>{has5}</div>
      );
    }

    if (territory) {
      territory = (
        <div>
          <b>Характеристика дома и придомовой территории: </b>
          {territory}
        </div>
      );
    }

    if (waterline) {
      waterline = (
        <div>
          <b>Водопровод: </b>
          {waterline}
        </div>
      );
    }

    if (heating) {
      heating = (
        <div>
          <b>Отопление: </b>
          {heating}
        </div>
      );
    }

    if (kanalizacija) {
      kanalizacija = (
        <div>
          <b>Канализация: </b>
          {kanalizacija}
        </div>
      );
    }

    if (flat.keep_ru && flat.keep_ru !== '0') {
      keep = (
        <div>
          <b>Ремонт: </b>
          {flat.keep_ru}
        </div>
      );
    }

    if (flat.walls && flat.walls !== '' && props.walls === '2') {
      walls = (
        <div>
          <b>Стены: </b>
          {flat.walls}
        </div>
      );
    }

    flat.walls ?
     (<tr className='object_house_params'>
      <td>Стены</td>
      <td className='object_params_value'>{flat.walls}</td>
    </tr>) : '';

    allowed = allowed ? `${allowed}, ` : '';
    allowed += flat.duration === 'week' || flat.duration === 'month' ?
      'заселение на короткий срок' : '';

    if (allowed) {
      allowed = (
        <div>
          <b>В квартире разрешено: </b>
          {allowed}
        </div>
      );
    }

    if ((has     || has2 || territory ||
         windows || keep || waterline ||
         heating || kanalizacija || allowed) && showOptional) {
      info = (
        <div>
          {optTitleComponent}
          {windows}
          {territory}
          {allowed}
          {waterline}
          {heating}
          {kanalizacija}
          {keep}
          {flatHas}
          {landHas}
          {company}
          {walls}
        </div>
      );
    }

    const height = props.height ? props.height : 317;

    return (
      <div ref='descr'
        className={props.height ?
        'flat-description-wrapper__custom' :
        'flat-description-wrapper'}
        style={{height: `${height}px`}}>
        <GeminiScrollbar>
          {mainTitleComponent}
          {descriptionComponent}
          {info}
        </GeminiScrollbar>
      </div>
    );
  }
}

export default FlatDescription;
