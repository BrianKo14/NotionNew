
import { useState, useEffect } from 'react';

import '../css/QRWindow.css';
import QRCode from 'qrcode';
const { getUniqueID, startPolling, getDrawing, serverURL } = require('../client.js');

function QRWindow(props) {

	const [qrCodeDataUri, setQRCodeDataUri] = useState('');

	useEffect(() => {
		async function generateQRCode() {

			const uniqueId = await getUniqueID();
			if (uniqueId === null) {
				alert('Server is currently unavailable. Please try again later.');
				props.setShowQR(false);
				return;
			}

			const url = `${serverURL}/drawing?id=${uniqueId}`;

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

	if (dataURL !== null)
		props.insertImage(props.setBlocks, props.index, dataURL);
}

export default QRWindow;