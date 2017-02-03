import React, {PropTypes, Component} from 'react'; //eslint-disable-line no-unused-vars
import s from './Sprite.scss';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import {getApiMediaUrl} from '../../utils/mediaHelpers';
import {each, size} from 'lodash';

class MiniSprite extends Component {

  static propTypes = {
    blockId: PropTypes.string,
    flat: PropTypes.object,
    height: PropTypes.number,
    house: PropTypes.object,
    styles: PropTypes.object,
    toggleLayout: PropTypes.func,
    image: PropTypes.string,
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
    const self = this;

    const canvas = document.querySelector(`#${this.props.blockId}`);

    canvas.onclick = () => {
      self.props.toggleLayout('layoutFloor');
    };
  }

  draw() {
    const canvas = document.querySelector(`#${this.props.blockId}`);
    const img = new Image();
    const ctx = canvas.getContext('2d');
    const {flat} = this.props;
    const {styles} = this.state;

    // получаем изображение планировки. Начинаем обрисовку после загрузки
    img.src = `https:${getApiMediaUrl('640480',
      'layouts', this.props.image)}`;

    img.onload = () => {
      // получаем коэффициент сжатия изображения
      // от него зависят координаты точек планировки и указателя мыши
      const ratio = this.props.height ?
      img.height / this.props.height : 1;

      // расчитываем новые ширину и высоту canvas
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

      each(flats, fl => {
        if (size(fl.layout_sprite.percent)) {
          let fillStyle;

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

          // задаем стили отображения
          if (fl.id !== flat.id) {
            fillStyle = styles.fillColor;
          } else {
            fillStyle = styles.fillColorSelected;
          }

          ctx.fillStyle = fillStyle;
          ctx.fill();
        }
      });
    };
  }

  componentDidUpdate() {
    this.draw();
  }

  render() {
    return (
      <div className={s.minisprite}>
        <canvas className={s.minispriteCanvas} id={this.props.blockId} />
        <a
          onClick={(e) => {
            e.preventDefault;
            this.props.toggleLayout('layoutFloor');
          }}
          href="#">
          Перейти на план этажа
        </a>
      </div>
    );
  }

}

export default withStyles(s)(MiniSprite);
