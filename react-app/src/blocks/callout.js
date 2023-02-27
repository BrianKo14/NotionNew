import { useEffect, useRef } from 'react';
import FONTS from '../data/fonts.json';

function Callout(props) {

  // Set height of block to height of callout
  const ref = useRef(null);
  useEffect(() => {
    const height = ref.current.offsetHeight;
    props.setBoxHeight(height);
  });

  return (
    <div className="callout" ref={ref}

      style={{ 
        fontSize: FONTS["callout"].size,
        fontWeight: FONTS["callout"].weight,
        lineHeight: FONTS["callout"].lineHeight,
      }} 
    >
      <img src={props.image} />
      <a href={props.link} target="_blank">{props.text}</a>
    </div>
  )
}

export default Callout;
