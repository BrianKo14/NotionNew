
/* --- IMPORTS --- */

import { useState, useEffect, useRef, useCallback } from 'react';

// Media imports
import static_navigationbar_right from './media/static-navigationbar-right.png';
import static_navigationbar_left from './media/static-navigationbar-left.png';
import page_icon from './media/page-icon.png';
import add_button from './media/add-button.png';
import drag_button from './media/drag-button.png';
import image_buttons from './media/image_buttons.png';
import FONTS from './fonts.json';
import TEMPLATE from './template.json';

// Additional imports
import './css/App.css';
import Menu from './Menu';
import QRWindow from './QRWindow';
const { cancelDrawingRequest } = require('./client.js');


/* --- GLOBAL VARIABLES --- */

/** Distance from the block proper where the side handle still shows. */
const MOUSE_HOVER_OFFSET = 120;

/** The index for the block that is currently selected. */
var selectedIndex = 4;

/** The height position of the cursor as a percentage of the screen height.
 * Used to flip menu when it's too close to the top. */
var positionFromTop = 0;

/** Stores semi-transperent clone that appears when dragging. */
var dragClone = null;

/** Element index that is currently being hovered over, while dragging. */
var currentlyHovering = -1;

/** Element index that is currently being dragged. */
var currentlyDragging = -1;


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

  // Update selection when 'blocks' is updated
  useEffect(() => {
    const selectedBlock = document.querySelectorAll(".block")[selectedIndex].querySelector("textarea");
    selectedBlock.focus();
    selectedBlock.selectionStart = selectedBlock.value.length;
    selectedBlock.selectionEnd = selectedBlock.value.length;
  }, [blocks]);

  return (
    <div id="document">
      {/* Header */}
      <img id="page-icon" src={page_icon} />

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

  // Control "side handle" visibility with mouse position
  const [isHovering, setIsHovering] = useState(false);
  const ref = useRef(null);
  const mousePos = useMousePosition(ref.current);
  useEffect(() => {
    controlSideHandle(ref.current.children[0], mousePos, setIsHovering);

    if (dragClone) {
      dragClone.style.top = mousePos.y - 14 + "px";
      dragClone.style.left = mousePos.x + 14 + "px";
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
    { props.showMenu && props.index === selectedIndex ? 
      <Menu setShowMenu={props.setShowMenu} positionFromTop={positionFromTop}
        setShowQR={props.setShowQR} />
    : null }

    {/* QR Window */}
    { props.showQR && props.index === selectedIndex ? 
      <QRWindow setShowQR={props.setShowQR} positionFromTop={positionFromTop}
        blocks={props.blocks} setBlocks={props.setBlocks} index={props.index}
        insertImage={insertImage} /> 
    : null }

  </div>
}

function InputBox(props) {

  // Height of block changes with number of lines
  const ref = useRef(null);
  useEffect(() => {
      const height = ref.current.scrollHeight - 7;
      props.setBoxHeight(height);
  });

  return <textarea type="text"

    // className="hover-line"
  
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

      selectedIndex = props.index;
      positionFromTop = e.target.getBoundingClientRect().top / window.innerHeight;

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


/* --- AUXILIARIES --- */

/* - CHANGING BLOCKS - */

/** Adds a new block */
function addBlock(setBlocks, index) {
  setBlocks(prev => [...prev.slice(0, index + 1), {"type": "paragraph", "text": ""}, ...prev.slice(index + 1)]);
  selectedIndex = index + 1;
}

/** Deletes an existing block */
function deleteBlock(setBlocks, index) {

  setBlocks(prev => {
    if (prev.length === 2) return prev;

    const tmp = [...prev];
    tmp.splice(index, 1);

    selectedIndex = index - 1;
    while (tmp[selectedIndex].type === "image") selectedIndex--;

    return tmp;
  });
}

/** Replaces current block with an image block */
async function insertImage(setBlocks, index, image) {
  setBlocks(prev => {
    const tmp = [...prev];
    tmp.splice(index, 1, {"type": "image", "image": image})

    selectedIndex = index - 1;
    while (tmp[selectedIndex].type === "image") selectedIndex--;

    return tmp;
  });
}

/** Move block from 'index1' to after 'index2' */
function moveBlock(setBlocks, index1, index2) {
  setBlocks(prev => {
    const tmp = [...prev];
    const [removed] = tmp.splice(index1, 1);
    const insertIndex = index1 < index2 ? index2 - 1 : index2;
    tmp.splice(insertIndex + 1, 0, removed);

    selectedIndex = index2;
    while (tmp[selectedIndex].type === "image") selectedIndex--;

    return tmp;
  });
}

function handleDragStart(e, index, setBlocks) {
  if (dragClone) return;

  // Create semi-transparent version of block to be displayed while dragging
  const block = e.target.closest('.block');
  const dragImage = block.cloneNode(true);

  dragImage.removeChild(dragImage.getElementsByClassName("block-side-handle")[0]);
  dragImage.style.position = "fixed";
  dragImage.style.top = "-10000px";
  dragImage.style.left = "-10000px";
  dragImage.children[0].style.width = block.children[0].offsetWidth + "px";
  dragImage.style.opacity = 0.5;
  dragClone = dragImage;
  document.body.appendChild(dragImage); 

  // Pass on index of block to be moved
  currentlyDragging = index;
  window.addEventListener("mouseup", () => handleDragEnd(setBlocks));
  console.log(window.scrollY);
}

function handleDragEnd(setBlocks) {
  if (!dragClone) return;
  console.log(window.scrollY);

  dragClone.remove();
  dragClone = null;

  window.removeEventListener("mouseup", handleDragEnd);

  if (currentlyHovering !== currentlyDragging && currentlyHovering !== -1) {
    moveBlock(setBlocks, currentlyDragging, currentlyHovering);
  }
}


/* - CONTROL - */

/**
 * Controls the placeholder of the input block.
 * For paragraphs: it shows only when empty and selected.
 * For headings: it shows always when empty.
 * 
 * TODO: headings' placeholders should stay put, but implementing this proved unnecessary complicated
 * because it requires some state management acrobatics over the current implementation of blocks.
*/
function controlPlaceholder(selected, target, placeholder) {
  if (selected && target.value === "") {
    target.placeholder = placeholder;
  } else if (!placeholder.includes("Heading")) {
    target.placeholder = "";
  } else {
    target.placeholder = "";
  }
}

/** When the menu appears, window-wide scrolling should be disabled. */
function toggleMenu(show, setShowMenu) {
  setShowMenu(show);

  if (show) {
    // Disable scrolling
    const x = window.scrollX, y = window.scrollY;
    window.onscroll = () => window.scrollTo(x, y);
  } else {
    // Enable scrolling
    window.onscroll = null;
  }
}

/** Handles specific keys pressed at input box */
function handleKeyPress(e, blocks, setBlocks, index) {
  
  // Add new block on Shift + Enter
  if (e.key === "Enter" && e.shiftKey
      && e.target.selectionStart !== e.target.value.length) { 
    e.preventDefault();
    addBlock(setBlocks, index);
  }
  // Add new block on Enter if end of line is selected
  else if (e.key === "Enter" && !e.shiftKey
      && e.target.selectionStart === e.target.selectionEnd && e.target.selectionStart === e.target.value.length) {
    e.preventDefault();
    addBlock(setBlocks, index);
  }
  // Delete block on Backspace
  else if (e.key === "Backspace" && e.target.value === "" && index !== 0) {
    e.preventDefault();
    deleteBlock(setBlocks, index);
  }

  // Delete last image/callout on Backspace if cursor is at the beginning of the line
  if (e.key === "Backspace" && e.target.selectionStart == 0 && index !== 0
    && blocks[index - 1].type === "image" || blocks[index - 1].type === "callout") {
      deleteBlock(setBlocks, index - 1);
  }
}


/* - MOUSE - */

/** Decides when to show side handle */
function controlSideHandle(el, mousePos, setIsHovering) {
  const rect = el.getBoundingClientRect();
  setIsHovering(mousePos.x > rect.left - MOUSE_HOVER_OFFSET &&
                mousePos.x < rect.left + rect.width + MOUSE_HOVER_OFFSET &&
                mousePos.y > rect.top &&
                mousePos.y < rect.top + rect.height);
}

/** Decides over to which block will the current selection be dragged to */
function getCurrentlyHovered(el, mousePos, index) {
  const rect = el.getBoundingClientRect();
  const isCurrentlyHovering = mousePos.x > rect.left - MOUSE_HOVER_OFFSET &&
                              mousePos.x < rect.left + rect.width + MOUSE_HOVER_OFFSET &&
                              mousePos.y > rect.top + rect.height - 20 &&
                              mousePos.y < rect.top + rect.height + 20;

  currentlyHovering = isCurrentlyHovering ? index : currentlyHovering;

  if (currentlyHovering === index) {
    el.parentElement.classList.add("hover-line");
  } else {
    el.parentElement.classList.remove("hover-line");
  } 
}

/** Gets mouse position to detect hovering for the BlockSideHandle.
 * By doing this in JS instead of CSS I can easily add an artifical offset to the hover area. */
function useMousePosition() {
  const [position, setPosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    function handleMouseMove(event) {
      setPosition({ x: event.clientX, y: event.clientY });
    }

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return position;
}

export default App;
