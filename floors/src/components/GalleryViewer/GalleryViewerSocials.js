import React, {PropTypes} from 'react';

import {getApiMediaUrl} from '../../utils/mediaHelpers';
import {canUseDOM} from 'fbjs/lib/ExecutionEnvironment';
import SocialButton from '../../shared/SocialButton';
import {size, clone} from 'lodash';

const GalleryViewerSocials = (props) => {
  const {item, gaEvent, description} = props;
  const {user_data: {i, city}, photo, hash} = item;
  const fileName = (/.*\/(.*)$/).exec(photo);
  const {origin, pathname} = canUseDOM ? window.location : {};
  const path = (/^\/([^\/]*)\/.*\/*$/).exec(pathname);
  const thumb = getApiMediaUrl('320240', 'media/gallery', fileName[1], 2);
  const mock = canUseDOM ? {
    href: `${origin}/${path[1]}/${hash}/`,
    title: `${i}, ${city}`,
    picture: `https:${thumb}`,
    caption: origin,
    description: description ? description :
      'Поддержите моих друзей в новогоднем конкурсе "Всей семьёй к Деду Морозу", проголосовав за фотографию по ссылке. %23этажи_новыйгод %23отправляемся_в_сказку %23встретимся_в_устюге', //eslint-disable-line max-len
    titlePrfx: 'Поделиться с друзьями',
    gaEvent: gaEvent
  } : {};
  const mockForFb = clone(mock);

  size(mock) &&
    (mockForFb.description = mockForFb.description.replace(/\%23/g, '#'));

  return (
    <div>
      <SocialButton type='fb' data={mockForFb}/>
      <SocialButton type='vk' data={mock}/>
      <SocialButton type='ok' data={mock}/>
    </div>
  );
};

GalleryViewerSocials.propTypes = {
  item: PropTypes.object,
  gaEvent: PropTypes.string,
  description: PropTypes.string
};

export default GalleryViewerSocials;
