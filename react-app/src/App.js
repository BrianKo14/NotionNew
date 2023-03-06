
/* --- IMPORTS --- */

import { useState, useEffect, useRef, useCallback } from 'react';

// Media imports
import static_navigationbar_right from './media/static-navigationbar-right.png';
import static_navigationbar_left from './media/static-navigationbar-left.png';
import page_icon from './media/page-icon.png';
import add_button from './media/add-button.png';
import drag_button from './media/drag-button.png';
import header_button_1 from './media/header_button_1.png';
import header_button_2 from './media/header_button_2.png';

// Default data imports
import FONTS from './data/fonts.json';
import TEMPLATE from './data/template.json';

// Block imports
import InputBox from './blocks/input';
import ImageBox from './blocks/image';
import Callout from './blocks/callout';

// Menu imports
import Menu from './menus/Menu';
import QRWindow from './menus/QRWindow';

// Additional imports
import './css/App.css';
import { 
  useMousePosition, controlSideHandle, getCurrentlyHovered,
  addBlock, insertImage, handleDragStart 
} from './utils.js';


/* --- GLOBAL VARIABLES --- */

/** The index for the block that is currently selected. */
window.selectedIndex = 4;

/** The height position of the cursor as a percentage of the screen height.
 * Used to flip menu when it's too close to the top. */
window.positionFromTop = 0;

/** Stores semi-transperent clone that appears when dragging. */
window.dragClone = null;


/* --- APP --- */

function App() {
  return (
    <div className="App">
      <Document />
      <NavigationBar />
    </div>
  );
}


/* --- NAVIGATION BAR --- */

function NavigationBar() {
  return (
    <div id="navigation-bar">
      <img id="right" src={static_navigationbar_right} />
      <img id="left" src={static_navigationbar_left} />
    </div>
  );
}


/* --- DOCUMENT --- */

function Document() {
  
  const [blocks, setBlocks] = useState(TEMPLATE);

  const [showMenu, setShowMenu] = useState(false);
  const [showQR, setShowQR] = useState(false);
  const [showHeaderButtons, setShowHeaderButtons] = useState(true);

  // Update selection when 'blocks' is updated
  useEffect(() => {
    const selectedBlock = document.querySelectorAll(".block")[window.selectedIndex].querySelector("textarea");
    selectedBlock.focus();
  }, [blocks]);

  return (
    <div id="document">
      {/* Header */}
      <div id="page-header"
          onMouseEnter={() => setShowHeaderButtons(true)}
          onMouseLeave={() => setShowHeaderButtons(false)}
      >
        <img id="page-icon" src={page_icon} />

        { showHeaderButtons ? 
          <div id="header-buttons">
            <img id="header-button-1" src={header_button_1} />
            <img id="header-button-2" src={header_button_2} />
          </div>
        : null }
      </div>

      {/* Body */} {
        blocks.map((box, index) => {
          return <Block index={index} key={index} type={box.type} content={box}
                          blocks={blocks} setBlocks={setBlocks}
                          showMenu={showMenu} setShowMenu={setShowMenu}
                          showQR={showQR} setShowQR={setShowQR} />;
        }) }
    </div>
  );
}


/* --- BLOCK --- */

function Block(props) {

  // Height of block changes with number of lines
  const [boxHeight, setBoxHeight] = useState(0);

  // Mouse position updates
  const [isHovering, setIsHovering] = useState(false);
  const ref = useRef(null);
  const mousePos = useMousePosition(ref.current);
  useEffect(() => {
    controlSideHandle(ref.current.children[0], mousePos, setIsHovering);

    if (window.dragClone) {
      window.dragClone.style.top = mousePos.y - 14 + "px";
      window.dragClone.style.left = mousePos.x + 14 + "px";
      getCurrentlyHovered(ref.current.children[0], mousePos, props.index);
    } else {
      ref.current.children[0].parentElement.classList.remove("hover-line"); 
    }
  });

  // Stuff that goes inside the block goes in here.
  // The significant elements (the input box, the image, etc.) must go on top, to be accessed using children[0].
  return <div className="block"

        ref={ref}
      
        style={{
          height: boxHeight || "",
          marginTop: FONTS[props.type].margin,
        }}
      >

    {/* Input */}
    { props.type !== "image" && props.type !== "callout" ?
      <InputBox type={props.type} text={props.content.text} index={props.index} 
      blocks={props.blocks} setBlocks={props.setBlocks}
      setShowMenu={props.setShowMenu}
      showQR={props.showQR} setShowQR={props.setShowQR}
      boxHeight={boxHeight} setBoxHeight={setBoxHeight} />
    : null }

    {/* Image */}
    { props.type === "image" ?
      <ImageBox image={props.content.image}
        boxHeight={boxHeight} setBoxHeight={setBoxHeight} />
    : null }

    {/* Callout */}
    { props.type === "callout" ?
      <Callout text={props.content.text} link={props.content.link} image={props.content.image}
        boxHeight={boxHeight} setBoxHeight={setBoxHeight} />
    : null }



    {/* Side handle */}
    { isHovering && props.type !== "title" ? 
      <BlockSideHandle blocks={props.blocks} setBlocks={props.setBlocks} index={props.index}
        type={props.type} />
    : null }

    {/* Menu */}
    { props.showMenu && props.index === window.selectedIndex ? 
      <Menu setShowMenu={props.setShowMenu} setShowQR={props.setShowQR} />
    : null }

    {/* QR Window */}
    { props.showQR && props.index === window.selectedIndex ? 
      <QRWindow setShowQR={props.setShowQR} index={props.index}
        blocks={props.blocks} setBlocks={props.setBlocks} 
        insertImage={insertImage} /> 
    : null }

  </div>
}

function BlockSideHandle(props) {

  // Dynamically adjusting horizontal position of handle
  // This makes sure the handle is right next to the block even if the block doesn't have width 100%
  const ref = useRef(null);
  const [leftDist, setLeftDist] = useState(0);
  useEffect(() => {
    const sibling = ref.current.parentElement.children[0].getBoundingClientRect().left;
    const parent = ref.current.parentElement.getBoundingClientRect().left;
    setLeftDist(sibling - parent - 45);
  }, []);

  const dragStartCallback = useCallback((e) => {
    handleDragStart(e, props.index, props.setBlocks);
  }, [props.index, props.blocks, props.setBlocks]);

  return (
    <div className="block-side-handle" ref={ref} 
      style={{
        left: leftDist + 'px',
        top: `calc((${FONTS[props.type].size} + 0.5em) / 2)`
      }}
    >
      <img src={add_button} onClick={() => addBlock(props.setBlocks, props.index)} />
      <img src={drag_button} onMouseDown={dragStartCallback} />
    </div>
  );
}

export default App;
