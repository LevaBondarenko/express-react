import {red} from './placemarkImg';

const imgSymbols = red.toString().substr(0, 2);
const balloon = (layout, content) => {
  return {
    balloonShadow: false,
    balloonLayout: layout,
    balloonContentLayout: content,
    balloonPanelMaxMapArea: 0,
    iconLayout: 'default#image',
    iconImageHref: `//cdn-media.etagi.com/content/media/site/${imgSymbols[0]}/${imgSymbols}/${red}.png`, // eslint-disable-line max-len
    iconImageSize: [31, 39],
    iconImageOffset: [-16, -45],
    zIndex: 1,
    draggable: false
  };
};

export default balloon;