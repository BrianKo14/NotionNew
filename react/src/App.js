import { useState, useEffect } from 'react';

import static_navigationbar_right from './media/static-navigationbar-right.png';
import static_navigationbar_left from './media/static-navigationbar-left.png';
import page_icon from './media/page-icon.png';

import add_button from './media/add-button.png';
import drag_button from './media/drag-button.png';

import './App.css';
import Menu from './Menu';

const FONTS = {
  'paragraph': {'size': '16px', 'weight': 'normal', 'margin': '0px', 'placeholder': "Type '/' for commands"},
  'heading1': {'size': '1.875em', 'weight': '600', 'margin': '2em', 'placeholder': "Heading 1"},
  'heading2': {'size': '1.5em', 'weight': '600', 'margin': '1.8em', 'placeholder': "Heading 2"},
  'heading3': {'size': '1.25em', 'weight': '600', 'margin': '1em', 'placeholder': "Heading 3"},
  'title': {'size': '40px', 'weight': '700', 'margin': '0', 'placeholder': ""}
};

const MOUSE_HOVER_OFFSET = 120;

/** The index for the block that is currently selected. */
var selectedIndex = 4;

/** The height position of the cursor as a percentage of the screen height.
 * Used to flip menu when it's too close to the top. */
var positionFromTop = 0;

/** Buffer stores scroll value when page-wide scroll gets blocked.
 * Used when showing menu. */
var lastScrollValue = [0, 0];


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
  
  const [textBoxes, setTextBoxes] = useState([
    {"size": "title", "text": "Job Application Projects"},
    {"size": "heading2", "text": "Example"},
    {"size": "paragraph", "text": "Some paragraph text"},
    {"size": "paragraph", "text": "More paragraph text. Lorem ipsum blah blah blah."},
    {"size": "heading1", "text": "Awesome demo 🙌"}
  ]);
  
  const [showMenu, setShowMenu] = useState(false);

  // Update selection when textBoxes is updated
  useEffect(() => {
    const selectedBlock = document.querySelectorAll(".textbox")[selectedIndex].querySelector("input");
    selectedBlock.focus();
  }, [textBoxes]);

  return (
    <div id="document">
      {/* Header */}
      <img id="page-icon" src={page_icon} />

      {/* Body */} {
        textBoxes.map((box, index) => {
          return <TextBox index={index} size={box.size} text={box.text}
                          textBoxes={textBoxes} setTextBoxes={setTextBoxes}
                          showMenu={showMenu} setShowMenu={setShowMenu} />;
        }) }
    </div>
  );
}


/* TEXTBOX */

function TextBox(props) {

  // Control side handle visibility with mouse position
  const [isHovering, setIsHovering] = useState(false);
  const mousePos = useMousePosition();

  return <div className="textbox"
      
        style={{
          height: FONTS[props.size].size,
          marginTop: FONTS[props.size].margin,
        }}
        
        // Show side handle when hovering over textbox + offset
        ref={el => { if (el) controlSideHandle(el, mousePos, setIsHovering) }}>


    {/* Side handle */}
    { isHovering && props.size !== "title" ? 
      <BlockSideHandle textBoxes={props.textBoxes} setTextBoxes={props.setTextBoxes} index={props.index} />
    : null }

    {/* Input */}
    <InputBox size={props.size} text={props.text} index={props.index} 
      textBoxes={props.textBoxes} setTextBoxes={props.setTextBoxes}
      setShowMenu={props.setShowMenu} />

    {/* Menu */}
    { props.showMenu && props.index === selectedIndex ? 
      <Menu setShowMenu={props.setShowMenu} positionFromTop={positionFromTop} />
    : null }

  </div>
}

function InputBox(props) {

  return <input type="text"
  
    value={props.text}

    style={{ 
      fontSize: FONTS[props.size].size,
      fontWeight: FONTS[props.size].weight,
    }} 

    // Deselects this block
    onBlur={e => {
      controlPlaceholder(false, e.target, FONTS[props.size].placeholder);
    }}

    // Selects this block
    onFocus={e => {
      controlPlaceholder(true, e.target, FONTS[props.size].placeholder);

      selectedIndex = props.index;
      positionFromTop = e.target.getBoundingClientRect().top / window.innerHeight;

      toggleMenu(false, props.setShowMenu);
    }}

    onChange={e => {
      controlPlaceholder(true, e.target, FONTS[props.size].placeholder);

      // Update text in state
      const tmp = [...props.textBoxes];
      tmp[props.index].text = e.target.value;
      props.setTextBoxes(tmp);

      // Show menu if user types '/'
      toggleMenu(e.target.value[0] === '/', props.setShowMenu);
    }}

    onKeyDown={e => handleKeyPress(e, props.textBoxes, props.setTextBoxes, props.index)}
  />

}

function BlockSideHandle(props) {
  return (
    <div className="block-side-handle">
      <img src={add_button} onClick={() => addTextBox(props.textBoxes, props.setTextBoxes, props.index)} />
      <img src={drag_button} />
    </div>
  );
}


/* AUXILIARIES */

/** Adds a new block */
function addTextBox(textBoxes, setTextBoxes, index) {
  const tmp = [...textBoxes];
  tmp.splice(index + 1, 0, {"size": "paragraph", "text": ""})
  setTextBoxes(tmp);

  selectedIndex = index + 1;
}

/** Delete an existing block */
function deleteTextBox(textBoxes, setTextBoxes, index) {
  if (textBoxes.length === 2) return;

  const tmp = [...textBoxes];
  tmp.splice(index, 1);
  setTextBoxes(tmp);

  selectedIndex = index - 1;
}

/**
 * Controls the placeholder of the input textbox.
 * For paragraphs: it shows only when empty and selected.
 * For headings: it shows always when empty.
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
    window.onscroll= () => window.scrollTo(x, y);
  } else {
    // Enable scrolling
    window.onscroll = null;
  }
}

/** Handles specific keys pressed at input box */
function handleKeyPress(e, textBoxes, setTextBoxes, index) {
  if (e.key === "Enter" && e.target.selectionEnd === e.target.value.length) { 
    addTextBox(textBoxes, setTextBoxes, index);
  }
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