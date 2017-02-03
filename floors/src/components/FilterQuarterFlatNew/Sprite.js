import React, {PropTypes, Component} from 'react'; //eslint-disable-line no-unused-vars
import s from './Sprite.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {getApiMediaUrl} from '../../utils/mediaHelpers';
import FilterQuarterActions from '../../actions/FilterQuarterActions';
import FilterQuarterStore from '../../stores/FilterQuarterStore';

/** Для ипотеки */
import {setNhObjectPrice} from '../../utils/mortgageHelpers';
import wss from '../../stores/WidgetsStateStore';
import WidgetsActions from '../../actions/WidgetsActions';

import {each, size} from 'lodash';
import ga from '../../utils/ga';

class Sprite extends Component {

  static propTypes = {
    blockId: PropTypes.string,
    dependentBlockId: PropTypes.string,
    flat: PropTypes.object,
    height: PropTypes.number,
    object: PropTypes.object,
    house: PropTypes.object,
    showHint: PropTypes.bool,
    styles: PropTypes.object,
    toggleLayout: PropTypes.func,
    trackFloor: PropTypes.func
  }

  static hintTexts = {
    common: 'Кликните, чтобы переключиться на выбранную квартиру',
    chosen: 'Кликните еще раз, чтобы посмотреть дополнительную информацию о квартире' //eslint-disable-line max-len
  }

  static defaultProps = {
    styles: {
      fillColor: 'rgba(89, 85, 98, 0.3)',
      fillColorSelected: 'rgba(73, 189, 59, 0.5)',
      strokeColor: 'rgba(89, 85, 98, 1)',
      strokeColorSelected: 'rgba(73, 189, 59, 1)'
    }
  }

  constructor(props) {
    super(props);
    this.state = {
      showHint: false,
      hintText: 'common',
      styles: {
        fillColor: props.styles.fillColor ?
          props.styles.fillColor : 'rgba(89, 85, 98, 0.3)',
        fillColorSelected: props.styles.fillColorSelected ?
          props.styles.fillColorSelected : 'rgba(73, 189, 59, 0.5)',
        strokeColor: props.styles.strokeColor ?
          props.styles.strokeColor : 'rgba(89, 85, 98, 1)',
        strokeColorSelected: props.styles.strokeColorSelected ?
          props.styles.strokeColorSelected : 'rgba(73, 189, 59, 1)',
      }
    };
  }

  componentDidMount() {
    this.draw();

    const canvas = document.querySelector(`#${this.props.blockId}`);

    canvas.onmousemove = e => {
      const rect = canvas.getBoundingClientRect(),
        x = (e.clientX - rect.left) / rect.width * 100,
        y = (e.clientY - rect.top) / rect.height * 100;

      this.mouseX = x;
      this.mouseY = y;
      this.clientX = e.clientX;
      this.clientY = e.clientY;
      this.draw(x, y);
    };

    canvas.onclick = e => {
      const rect = canvas.getBoundingClientRect(),
        x = (e.clientX - rect.left) / rect.width * 100,
        y = (e.clientY - rect.top) / rect.height * 100;

      this.draw(x, y, true);
    };

    canvas.onmouseout = () => {
      const hintElement = document.getElementById(`${this.props.blockId}_hint`);

      hintElement.style.display = 'none';
    };
  }

  componentDidUpdate() {
    this.draw(this.mouseX, this.mouseY);
  }

  trackFloor = () => {
    this.props.trackFloor ?
    ga('button', 'zastr_popup_podrobnee_o_kvartire_Vybor_kvartiry_v_etage') :
    ga('button', 'zastr_object_Vybor_kvartiry_v_etage');
  }

  /**
   * @param {float} x - х координата указателя мыши в процентах от ширины
   * @param {float} y - y координата указателя мыши в процентах от высоты
   * @param {bool} click - событие
   * @returns {void}
   */
  draw = (x, y, click = false) => {
    const canvas = document.querySelector(`#${this.props.blockId}`);
    const img = new Image();
    const ctx = canvas.getContext('2d');
    const {flat} = this.props;
    const {styles} = this.state;
    const hintElement = document.getElementById(`${this.props.blockId}_hint`);
    let hoveredFlat;

    // получаем изображение планировки. Начинаем обрисовку после загрузки
    img.src = `https:${getApiMediaUrl('640480',
      'layouts', this.props.image)}`;
    img.onload = () => {

      // получаем коэффициент сжатия изображения
      // от него зависят координаты точек планировки и указателя мыши
      const ratio = this.props.height ?
        img.height / this.props.height : 1;

      // расчитываем новые ширину и высоту canvas
      //TODO: добавить возможность изменения размеров изображения по ширине или по высоте
      const width = img.width / ratio;
      const height = img.height / ratio;

      canvas.width = width;
      canvas.height = height;
      canvas.style.width = `${canvas.width}px`;
      ctx.drawImage(img, 0, 0, width, height);

      // получаем квартиры из хранилища
      const flats = this.props.house
        .sections[flat.section]
        .floors[flat.floor].flats;

      // пересчитываем координаты указателя мыши из процентов в пиксели, относительно изображения планировки
      if (x && y) {
        x = width / 100 * x;
        y = height / 100 * y;
      }

      // отрисовываем планировку каждой квартиры на этаже
      each(flats, fl => {

        if (size(fl.layout_sprite.percent)) {
          let fillStyle, strokeStyle, lineWidth;

          const coords = fl.layout_sprite.percent;
          const newCoords = [];

          // пересчет координат из процентов в пиксели относительно изображения планировки
          for (let k = 0; k < coords.length; k++) {
            const coord = coords[k];

            newCoords.push([
              width / 100 * coord[0],
              height / 100 * coord[1]
            ]);
          }

          // обрисовка
          ctx.beginPath();
          ctx.moveTo(newCoords[0][0], newCoords[0][1]);

          for (let i = 1; i < newCoords.length; i++) {
            if (i !== newCoords.length - 1) {
              ctx.lineTo(newCoords[i][0], newCoords[i][1]);
            } else {
              ctx.lineTo(newCoords[0][0], newCoords[0][1]);
            }
          }

          // если указатель мыши оказался внутри обрисованной области
          if (ctx.isPointInPath(x, y)) {
            lineWidth = 3;
            hoveredFlat = fl;

            // при повторном клике на квартиру открываем окно с подробной инф-ей
            if (click && fl.id === flat.id && ratio !== 1) {
              document.querySelector('.hiddenLink').click();
              setTimeout(() => {
                hintElement.style.display = 'none';
              }, 0);
              this.mouseX = 0;
              this.mouseY = 0;
            } else if (click && fl.id !== flat.id) {
              // если квартира еще не выбрана, выбираем ее
              FilterQuarterActions.setFlat(fl, fl.layout_floor);

              // если на странице есть калькулятор ипотеки,
              // то при клике на квартиру в шахматке нужно менять значения в калькуляторе
              setNhObjectPrice(fl, FilterQuarterStore, wss, WidgetsActions);

            }

            if (click && fl.id === flat.id && ratio === 1) {
              if (this.props.toggleLayout) {
                this.props.toggleLayout('layout2d');
              }
            }
            // если наводим на выбранную квартиру, то показываем подсказку
            if (fl.id === flat.id && this.props.showHint) {
              const dependentBlockId = `#${this.props.dependentBlockId}`;

              if (ratio === 1) {
                const modalRect = document.querySelector('.modal-content')
                  .getBoundingClientRect();
                const hintLeft = this.clientX - modalRect.left + 20;
                const hintTop = this.clientY - modalRect.top + 20;

                hintElement.innerText = Sprite.hintTexts.common;
                hintElement.style.display = 'block';
                hintElement.style.left = `${hintLeft}px`;
                hintElement.style.top = `${hintTop}px`;
              } else if (!document.querySelector(dependentBlockId)) {
                hintElement.innerText = Sprite.hintTexts.chosen;
                hintElement.style.display = 'block';
                hintElement.style.left = `${this.clientX + 20}px`;
                hintElement.style.top = `${this.clientY + 20}px`;
              }
            } else {
              hintElement.style.display = 'none';
            }

          } else {
            if (!hoveredFlat) {
              hintElement.style.display = 'none';
            }
          }

          // задаем стили отображения
          if (fl.id !== flat.id) {
            fillStyle = styles.fillColor;
            strokeStyle = styles.strokeColor;
          } else {
            fillStyle = styles.fillColorSelected;
            strokeStyle = styles.strokeColorSelected;
          }

          ctx.fillStyle = fillStyle;
          ctx.fill();

          if (ctx.isPointInPath(x, y)) {
            ctx.lineWidth = lineWidth;
            ctx.strokeStyle = strokeStyle;
            ctx.stroke();
          }
        }

      });
    };
  }

  render() {
    return (
      <div className={s.root}>
        <canvas
        onClick={this.trackFloor}
        className="nh-flat-sprite-canvas"
        id={this.props.blockId}/>
        <div
          id={`${this.props.blockId}_hint`}
          style={{display: 'none'}}
          className="nh-sprite-hint"></div>
      </div>
    );
  }
};

Sprite.propTypes = {
  image: PropTypes.string
};

export default withStyles(s)(Sprite);
