import { useState, useEffect } from 'react';

import static_navigationbar_right from './media/static-navigationbar-right.png';
import static_navigationbar_left from './media/static-navigationbar-left.png';
import page_icon from './media/page-icon.png';

import add_button from './media/add-button.png';
import drag_button from './media/drag-button.png';

import './App.css';

const FONTS = {
  'paragraph': {'size': '16px', 'weight': 'normal', 'margin': '0px'},
  'heading1': {'size': '1.875em', 'weight': '600', 'margin': '2em'},
  'heading2': {'size': '1.5em', 'weight': '600', 'margin': '1.8em'},
  'heading3': {'size': '1.25em', 'weight': '600', 'margin': '1em'},
  'title': {'size': '40px', 'weight': '700', 'margin': '0'}
};

const MOUSE_HOVER_OFFSET = 120;


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

function BlockSideHandle() {
  return (
    <div className="block-side-handle">
      <img src={add_button}/>
      <img src={drag_button}/>
    </div>
  );
}

function TextBox(props) {

  const [isHovering, setIsHovering] = useState(false);
  const mousePos = useMousePosition();

  return <div className="textbox"
      
      style={{
        height: FONTS[props.size].size,
        marginTop: FONTS[props.size].margin,
      }}
      
      // Show side handle when hovering over textbox + offset
      ref={el => {
        if (el) {
          const rect = el.getBoundingClientRect();
          setIsHovering(mousePos.x > rect.left - MOUSE_HOVER_OFFSET && mousePos.x < rect.left + rect.width + MOUSE_HOVER_OFFSET &&
                        mousePos.y > rect.top && mousePos.y < rect.top + rect.height);
        }
      }}>

    { isHovering && props.size != "title" ? <BlockSideHandle /> : null }

    <input type="text" defaultValue={props.text}
      style={{ 
        fontSize: FONTS[props.size].size,
        fontWeight: FONTS[props.size].weight,
      }} />

  </div>
}

function Document() {
  return (
    <div id="document">
      {/* Header */}
      <img id="page-icon" src={page_icon} />
      <TextBox size="title" text="Job Application Projects" />

      {/* Body */}
      <TextBox size="heading2" text="Example" />
      <TextBox size="paragraph" text="Some paragraph text" selected={true} />
      <TextBox size="paragraph" text="More paragraph text" selected={true} />
      <TextBox size="heading1" text="Heading1" selected={true} />
    </div>
  );
}


/* APP */

function App() {
  return (
    <div className="App">
      <Document />
      <NavigationBar />
    </div>
  );
}

export default App;
