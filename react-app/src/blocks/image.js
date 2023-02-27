import {useEffect, useRef } from 'react';
import image_buttons from '../media/image_buttons.png';

function ImageBox(props) {

  // Set height of block to height of image
  const ref = useRef(null);
  useEffect(() => {
    const height = ref.current.offsetHeight;
    props.setBoxHeight(height);
  });

  return (
    <div className="image-container" ref={ref}>
      <img className="imagebox" src={props.image} />

      <img className="image-buttons" src={image_buttons}/>

      <div className="resizer-container">
        <div className="image-resizer" />
      </div>
      <div className="resizer-container" style={{ right: 0 }}>
        <div className="image-resizer" />
      </div>
    </div>
  );
}

export default ImageBox;
