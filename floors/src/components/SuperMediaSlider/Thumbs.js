/**
 * Thumbs stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React from 'react';
import {map} from 'lodash';
import {getFilename} from '../../utils/mediaHelpers';
/**
 *  styles
 */
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Thumbs.scss';

const Thumbs = ({activeView, getThumbImageUrl, imgSrc, ...props}) => {
  const typeMedia = activeView === 'layouts' ? 'layouts' :
    (activeView === 'demos' ? 'demoflats' : 'photos');
  let tkey = props.thumbKey;

  return (<div>
    {map(props.filteredMedia, (slide, key) => {
      tkey = props.thumbKey !== undefined ? tkey + 1 : key;
      imgSrc = activeView === 'tours' ? (slide.filename2 ? (props.mediaSource ?
        getThumbImageUrl(slide.filename2, '3d_tours') :
        `https://ries3.etagi.com/3d_tours/${getFilename(slide.filename2)}`) : '') : imgSrc;

      return (<div
          key={`thumb${activeView}${tkey}`}
          className={tkey === props.activeSlideIndex ?
            s.thumb__active : s.thumb}
          onClick={props.toSlide}>
          <img src={imgSrc || getThumbImageUrl(slide.filename, typeMedia)}
            data-thumb={tkey}
          />
        </div>
      );
    })}
  </div>);
};

Thumbs.propTypes = {
  filteredMedia: React.PropTypes.array,
  activeSlideIndex: React.PropTypes.number,
  thumbKey: React.PropTypes.number,
  mediaSource: React.PropTypes.number,
  activeView: React.PropTypes.string,
  imgSrc: React.PropTypes.string,
  toSlide: React.PropTypes.func,
  getThumbImageUrl: React.PropTypes.func,
};

export default withStyles(s)(Thumbs);
