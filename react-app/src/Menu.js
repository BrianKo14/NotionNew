
import './Menu.css';

import BLOCKS from './MenuItems.json';

// Import icons for each menu item
for (const section of Object.keys(BLOCKS)) {
	for (const item of BLOCKS[section]) item.icon = require('./media/menu/' + item.icon);
}


function Menu(props) {
 return (
	<div className="menu"
		style={{
			top: props.positionFromTop > 0.5 ? '0' : '350px',
			transform: props.positionFromTop > 0.5 ? 'translate(2%, -105%)' : 'translate(2%, -90%)'
		}}
	> 

		{ Object.keys(BLOCKS).map(section => ( <div>

			<div className="menu-section">{section}</div>

			{ BLOCKS[section].map((item, index) => (
				<div className="menu-item" key={index}>
					<img src={item.icon} />
					<div className="menu-item-text">
						<div className="menu-item-name">{item.name}</div>
						<div className="menu-item-description">{item.description}</div>
					</div>
				</div>
			)) }

		</div> )) }

	</div>
 );
}

export default Menu;