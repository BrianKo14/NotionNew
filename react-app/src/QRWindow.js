
import { useState, useEffect } from 'react';

import './css/QRWindow.css';
import QRCode from 'qrcode';
import { getUniqueID, startPolling, getDrawing } from './client';

function QRWindow(props) {

	const [qrCodeDataUri, setQRCodeDataUri] = useState('');

	useEffect(() => {
		async function generateQRCode() {

			const uniqueId = await getUniqueID();
			// const url = `http://notionnew.us-east-1.elasticbeanstalk.com/drawing?id=${uniqueId}`;
			const url = `http://192.168.0.146:3001/drawing?id=${uniqueId}`; // DEBUG: debug in local network
			console.log(url); // FIXME: makes two requests to server

			try {
				const dataUri = await QRCode.toDataURL(url, { 
					width: 256, 
					height: 256, 
					margin: 0,
					color: { dark: '#000000', light: '#F7F7F5'}
				});
				setQRCodeDataUri(dataUri);

				startPolling(() => getDrawingAfterPolling(props));
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
			<div className="qrwindow-header">Scan this QR code with your <br /><span>mobile device</span> and make a drawing!</div>
			<img className="qrwindow-img" src={qrCodeDataUri}></img>
		</div>
	);
}

async function getDrawingAfterPolling(props) {
	const dataURL = await getDrawing();

	if (dataURL !== null)
		props.insertImage(props.textBoxes, props.setTextBoxes, props.index, dataURL);
}

export default QRWindow;