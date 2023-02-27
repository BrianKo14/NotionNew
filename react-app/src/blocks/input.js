
import { useEffect, useRef } from 'react';

import { controlPlaceholder, handleKeyPress, toggleMenu } from '../utils.js';
import { cancelDrawingRequest } from '../client.js';
import FONTS from '../data/fonts.json';

function InputBox(props) {

  // Height of block changes with number of lines
  const ref = useRef(null);
  useEffect(() => {
      const height = ref.current.scrollHeight - 7;
      props.setBoxHeight(height);
  });

  return <textarea type="text"

    value={props.text}

    ref={ref}

    style={{ 
      height: props.boxHeight,
      fontSize: FONTS[props.type].size,
      fontWeight: FONTS[props.type].weight,
      lineHeight: FONTS[props.type].lineHeight,
    }} 

    // Deselects this block
    onBlur={e => {
      controlPlaceholder(false, e.target, FONTS[props.type].placeholder);
    }}

    // Selects this block
    onFocus={e => {
      controlPlaceholder(true, e.target, FONTS[props.type].placeholder);

      window.selectedIndex = props.index;
      window.positionFromTop = e.target.getBoundingClientRect().top / window.innerHeight;

      toggleMenu(false, props.setShowMenu);

      props.setShowQR(false);
      cancelDrawingRequest();
    }}

    onChange={e => {
      controlPlaceholder(true, e.target, FONTS[props.type].placeholder);

      // Update text in state
      props.setBlocks(prev => {
        const tmp = [...prev];
        tmp[props.index].text = e.target.value;
        return tmp;
      });

      // Show menu if user types '/'
      toggleMenu(e.target.value[0] === '/', props.setShowMenu);
    }}

    onKeyDown={e => handleKeyPress(e, props.blocks, props.setBlocks, props.index)}
  />

}

export default InputBox;