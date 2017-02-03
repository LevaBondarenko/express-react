/**
 * SlideVideo stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React from 'react';

const SlideVideo = ({...props}) => {
  return (props.activeSlideIndex === props.imgNumber ?
          <div
            key={props.activeView + props.imgNumber}>
            <iframe webkitAllowFullScreen mozallowfullscreen allowFullScreen
              width={props.width} height={props.height}
              src={`//video.etagi.com/embed/${props.riesId}/`} />
          </div> :
          <div />);
};

SlideVideo.propTypes = {
  activeView: React.PropTypes.string,
  riesId: React.PropTypes.string,
  height: React.PropTypes.number,
  width: React.PropTypes.number,
  imgNumber: React.PropTypes.number,
  activeSlideIndex: React.PropTypes.number,
};

export default SlideVideo;
