import { useState, useEffect, useRef } from 'react';

// Media imports
import static_navigationbar_right from './media/static-navigationbar-right.png';
import static_navigationbar_left from './media/static-navigationbar-left.png';
import page_icon from './media/page-icon.png';
import add_button from './media/add-button.png';
import drag_button from './media/drag-button.png';
import image_buttons from './media/image_buttons.png';
import TEMPLATE from './template.json';

// Additional imports
import './css/App.css';
import Menu from './Menu';
import QRWindow from './QRWindow';
import { cancelDrawingRequest } from './client';

const FONTS = {
  'paragraph': {'size': '16px', 'weight': 'normal', 'margin': '0px', 'lineHeight': '1.5', 'placeholder': "Type '/' for commands"},
  'heading1': {'size': '1.875em', 'weight': '600', 'margin': '1em', 'lineHeight': '1.3', 'placeholder': "Heading 1"},
  'heading2': {'size': '1.5em', 'weight': '600', 'margin': '1.8em', 'lineHeight': '1.3', 'placeholder': "Heading 2"},
  'heading3': {'size': '1.25em', 'weight': '600', 'margin': '0.5em', 'lineHeight': '1.3', 'placeholder': "Heading 3"},
  'title': {'size': '40px', 'weight': '700', 'margin': '0', 'lineHeight': '1.2', 'placeholder': ""},
  'image': {'size': '16px', 'weight': 'normal', 'margin': '0', 'lineHeight': '0', 'placeholder': ""},
};

/** Distance from the block proper where the side handle still shows. */
const MOUSE_HOVER_OFFSET = 120;

/** The index for the block that is currently selected. */
var selectedIndex = 4;

/** The height position of the cursor as a percentage of the screen height.
 * Used to flip menu when it's too close to the top. */
var positionFromTop = 0;


/* APP */

function App() {
  return (
    <div className="App">
      <Document />
      <NavigationBar />
    </div>
  );
}


/* NAVIGATION BAR */

function NavigationBar() {
  return (
    <div id="navigation-bar">
      <img id="right" src={static_navigationbar_right} />
      <img id="left" src={static_navigationbar_left} />
    </div>
  );
}


/* DOCUMENT */

function Document() {
  
  const [textBoxes, setTextBoxes] = useState(TEMPLATE);
  
  const [showMenu, setShowMenu] = useState(false);
  const [showQR, setShowQR] = useState(false);

  // Update selection when textBoxes is updated
  useEffect(() => {
    const selectedBlock = document.querySelectorAll(".textbox")[selectedIndex].querySelector("textarea");
    selectedBlock.focus();
  }, [textBoxes]);

  return (
    <div id="document">
      {/* Header */}
      <img id="page-icon" src={page_icon} />

      {/* Body */} {
        textBoxes.map((box, index) => {
          return <TextBox index={index} type={box.type} content={box.content}
                          textBoxes={textBoxes} setTextBoxes={setTextBoxes}
                          showMenu={showMenu} setShowMenu={setShowMenu}
                          showQR={showQR} setShowQR={setShowQR} />;
        }) }
    </div>
  );
}


/* TEXTBOX */

function TextBox(props) {

  // Height of block changes with number of lines
  const [boxHeight, setBoxHeight] = useState(0);

  // Control side handle visibility with mouse position
  const [isHovering, setIsHovering] = useState(false);
  const mousePos = useMousePosition();
  const ref = useRef(null);
  useEffect(() => {
    controlSideHandle(ref.current.children[0], mousePos, setIsHovering);
  }, [mousePos]);

  // Stuff that goes inside the block goes in here.
  // The significant elements (the input, the image, etc.) must go on top, to be accesed using children[0].
  return <div className="textbox"

        ref={ref}
      
        style={{
          height: boxHeight,
          marginTop: FONTS[props.type].margin,
        }}

      >

    {/* Input */}
    { props.type !== "image" ?
      <InputBox type={props.type} content={props.content} index={props.index} 
      textBoxes={props.textBoxes} setTextBoxes={props.setTextBoxes}
      setShowMenu={props.setShowMenu}
      showQR={props.showQR} setShowQR={props.setShowQR}
      boxHeight={boxHeight} setBoxHeight={setBoxHeight} />
    : null }

    {/* Image */}
    { props.type === "image" ?
      <ImageBox content={props.content} />
    : null }

    {/* Side handle */}
    { isHovering && props.type !== "title" ? 
      <BlockSideHandle textBoxes={props.textBoxes} setTextBoxes={props.setTextBoxes} index={props.index}
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
        textBoxes={props.textBoxes} setTextBoxes={props.setTextBoxes} index={props.index}
        insertImage={insertImage} /> 
    : null }

  </div>
}

function InputBox(props) {

  const ref = useRef(null);

  useEffect(() => {
      const height = ref.current.scrollHeight - 7;
      props.setBoxHeight(height);
  });

  return <textarea type="text"
  
    value={props.content}

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
      const tmp = [...props.textBoxes];
      tmp[props.index].content = e.target.value;
      props.setTextBoxes(tmp);

      // Show menu if user types '/'
      toggleMenu(e.target.value[0] === '/', props.setShowMenu);
    }}

    onKeyDown={e => handleKeyPress(e, props.textBoxes, props.setTextBoxes, props.index)}
  />

}

function ImageBox(props) {
  return (
    <div className="image-container">
      <img className="imagebox" src={props.content} />

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

  return (
    <div className="block-side-handle" ref={ref} 
      style={{
        left: leftDist + 'px',
        top: `calc((${FONTS[props.type].size} + 0.5em) / 2)`
      }}
    >
      <img src={add_button} onClick={() => addTextBox(props.textBoxes, props.setTextBoxes, props.index)} />
      <img src={drag_button} />
    </div>
  );
}


/* AUXILIARIES */

/** Adds a new block */
function addTextBox(textBoxes, setTextBoxes, index) {
  const tmp = [...textBoxes];
  tmp.splice(index + 1, 0, {"type": "paragraph", "content": ""})
  setTextBoxes(tmp);

  selectedIndex = index + 1;
}

/** Deletes an existing block */
function deleteTextBox(textBoxes, setTextBoxes, index) {
  if (textBoxes.length === 2) return;

  const tmp = [...textBoxes];
  tmp.splice(index, 1);
  setTextBoxes(tmp);

  selectedIndex = index - 1;
  while (textBoxes[selectedIndex].type === "image") selectedIndex--;
}

/** Replaces current block with an image block */
async function insertImage(textBoxes, setTextBoxes, index, image) {
  console.log(image);
	const tmp = [...textBoxes];
	tmp.splice(index, 1, {"type": "image", "content": image})
	setTextBoxes(tmp);

	selectedIndex = index - 1;
	while (textBoxes[selectedIndex].type === "image") selectedIndex--;
}

/**
 * Controls the placeholder of the input textbox.
 * For paragraphs: it shows only when empty and selected.
 * For headings: it shows always when empty.
 * 
 * FIXME: changes to "type '/' for commands" on header blur
*/
function controlPlaceholder(selected, target, placeholder) {
  if (selected && target.value === "") {
    target.placeholder = placeholder;
  } else if (!placeholder.includes("Heading")) {
    target.placeholder = "";
  } else {
    target.placeholder = "Type '/' for commands";
  }
}

function controlSideHandle(el, mousePos, setIsHovering) {
  const rect = el.getBoundingClientRect();
  setIsHovering(mousePos.x > rect.left - MOUSE_HOVER_OFFSET &&
                mousePos.x < rect.left + rect.width + MOUSE_HOVER_OFFSET &&
                mousePos.y > rect.top &&
                mousePos.y < rect.top + rect.height);
}

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
function handleKeyPress(e, textBoxes, setTextBoxes, index) {
  
  // Add new block on Shift + Enter
  if (e.key === "Enter" && e.shiftKey
      && e.target.selectionStart !== e.target.value.length) { 
    e.preventDefault();
    addTextBox(textBoxes, setTextBoxes, index);
  }
  // Add new block on Enter if end of line is selected
  else if (e.key === "Enter" && !e.shiftKey
      && e.target.selectionStart === e.target.selectionEnd && e.target.selectionStart === e.target.value.length) {
    e.preventDefault();
    addTextBox(textBoxes, setTextBoxes, index);
  }
  // Delete block on Backspace
  else if (e.key === "Backspace" && e.target.value === "" && index !== 0) {
    e.preventDefault();
    deleteTextBox(textBoxes, setTextBoxes, index);
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
