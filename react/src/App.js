import static_navigationbar_right from './media/static-navigationbar-right.png';
import static_navigationbar_left from './media/static-navigationbar-left.png';
import page_icon from './media/office-building_1f3e2.png';

import './App.css';

// Fonts: paragraph (0), headings (1, 2, 3), title (4)
const fontSizes = ['16px', '1.875em', '1.5em', '1.25em', '40px'];
const fontWeights = ['normal', '600', '600', '600', '700'];
const fontMargins = ['0px', '2em', '1.4em', '1em', '0px']


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

function TextBox(props) {

  return (
    <div className="textbox">
      <input type="text" defaultValue={props.text} style={{ 
        fontSize: fontSizes[props.size],
        fontWeight: fontWeights[props.size],
        marginTop: fontMargins[props.size]
      }} />
    </div>
  );
}

function Document() {
  return (
    <div id="document">
      {/* Header */}
      <img id="page-icon" src={page_icon} />
      <TextBox size={4} text="Job Application Projects" />

      {/* Body */}
      <TextBox size={2} text="Example" />
      <TextBox size={0} text="Some paragraph text" />
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
