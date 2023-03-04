
import { useState, useEffect } from 'react';

import '../css/QRWindow.css';
import QRCode from 'qrcode';
const { getUniqueID, startPolling, getDrawing, serverURL } = require('../client.js');

function QRWindow(props) {

	const [qrCodeDataUri, setQRCodeDataUri] = useState('');

	useEffect(() => {
		async function generateQRCode() {

			// Get ID
			const uniqueId = await getUniqueID();
			if (uniqueId[0] !== 200) {
				alertError(uniqueId[1]);
				props.setShowQR(false);
				return;
			}

			// Construct URL
			const url = `${serverURL}/drawing?id=${uniqueId[1]}`;

			try {
				// Generate QR code
				const dataUri = await QRCode.toDataURL(url, { 
					width: 256, 
					height: 256, 
					margin: 0,
					color: { dark: '#000000', light: '#F7F7F5'}
				});
				setQRCodeDataUri(dataUri);

				// Start polling
				startPolling(
					// Accept drawing
					() => getDrawingAfterPolling(props),

					// Or cancel request
					() => {
						alertError('CANCEL');
						props.setShowQR(false);
						return;
					}
				);

			} catch (error) {
				console.error(error);
			}
		}

		generateQRCode();
	}, []);
	
	return (
		<div className="qrwindow"
			style={{
				top: window.positionFromTop > 0.5 ? '0' : '350px',
				transform: window.positionFromTop > 0.5 ? 'translate(2%, -105%)' : 'translate(2%, -90%)'
			}}
		>
			<div className="qrwindow-header">Scan this QR code with your <br /><span>mobile device</span> and make a drawing!</div>
			<img className="qrwindow-img" src={qrCodeDataUri}></img>
		</div>
	);
}

async function getDrawingAfterPolling(props) {
	const dataURL = await getDrawing();

	if (dataURL !== null) props.insertImage(props.setBlocks, props.index, dataURL);
	else alertError('NULL_IMG');
}

function alertError(errorCode) {
	switch (errorCode) {
		case 'FULL':
			alert('The server appears to have reached its maximum capacity. Please try again later.');
			break;
		case 'MAX_IP':
			alert('You have reached the maximum number of concurrent requests for your IP.')
			break;
		case 'CANCEL':
			alert('The request has been cancelled.');
			break;
		default:
			alert('There was a problem with the request. Please try again later.');
			break;
	}
}

export default QRWindow;