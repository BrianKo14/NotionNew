
import { useState, useEffect } from 'react';

import './css/QRWindow.css';
import QRCode from 'qrcode';

function QRWindow(props) {

	const url = `http://notionnew.us-east-1.elasticbeanstalk.com/drawing?user=0`;

	const [qrCodeDataUri, setQRCodeDataUri] = useState('');

	useEffect(() => {
		QRCode.toDataURL(url, { width: 256, height: 256 })
		.then(dataUri => setQRCodeDataUri(dataUri) )
		.catch(err => console.error(err) );
	}, []);
	
	return (
		<div className="qrwindow"
			style={{
				top: props.positionFromTop > 0.5 ? '0' : '350px',
				transform: props.positionFromTop > 0.5 ? 'translate(2%, -105%)' : 'translate(2%, -90%)'
			}}
		>
			<div className="qrwindow-header">Scan this QR code with your mobile device and make a drawing!</div>
			<img className="qrwindow-img" src={qrCodeDataUri}></img>
		</div>
	);
}

export default QRWindow;