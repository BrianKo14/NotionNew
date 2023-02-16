
import { useState, useEffect } from 'react';

import './css/QRWindow.css';
import QRCode from 'qrcode';
import { getUniqueID } from './client';

function QRWindow(props) {

	const [qrCodeDataUri, setQRCodeDataUri] = useState('');

	useEffect(() => {
		async function generateQRCode() {

			const uniqueID = await getUniqueID();
			const url = `http://notionnew.us-east-1.elasticbeanstalk.com/drawing?user=${uniqueID}`;
			console.log(url); // FIXME: makes two requests to server

			try {
				const dataUri = await QRCode.toDataURL(url, { width: 256, height: 256 });
				setQRCodeDataUri(dataUri);
			} catch (error) {
				console.error(error);
			}
		}

		generateQRCode();
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