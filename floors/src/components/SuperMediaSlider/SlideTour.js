/**
 * SlideTour stateless functional component
 *
 * @ver 0.0.1
 * @author a.d.permin@72.etagi.com
 */

/*eslint camelcase: [2, {properties: "never"}]*/
/**
 * devDependencies
 */
import React from 'react';

const SlideTour = ({...props}) => {
  return (props.activeSlideIndex === props.imgNumber ?
    <div
      key={props.activeView + props.imgNumber}>
      {props.kind === 'html5' ?
        (<iframe
          height={props.height}
          width={props.width}
          src={props.imgSrc}
        />) :
        (<object
          classID="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"
          codebase="https://download.macromedia.com/pub/shockwave/cabs/flash/swflash.cab#version=6,0,29,0"
          width={props.width}
          height={props.height}>
            <param name="movie" value={props.imgSrc} />
            <param name="quality" value="high" />
            <param name="menu" value="true" />
            <param name="allowfullscreen" value="true" />
            <param name="wmode" value="transparent" />
            <embed
              src={props.imgSrc}
              wmode="transparent"
              quality="high"
              menu="false"
              pluginspage="https://www.macromedia.com/go/getflashplayer"
              type="application/x-shockwave-flash"
              width={props.width}
              height={props.height} />
        </object>)
      }
    </div> :
    <div />
  );
};

SlideTour.propTypes = {
  activeView: React.PropTypes.string,
  imgSrc: React.PropTypes.string,
  kind: React.PropTypes.string,
  activeSlideIndex: React.PropTypes.number,
  imgNumber: React.PropTypes.number,
  width: React.PropTypes.number,
  height: React.PropTypes.number
};

export default SlideTour;
