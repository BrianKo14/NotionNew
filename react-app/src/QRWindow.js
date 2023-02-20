
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
				const dataUri = await QRCode.toDataURL(url, { width: 256, height: 256 });
				setQRCodeDataUri(dataUri);

				// insertImage(props.textBoxes, props.setTextBoxes, props.index);
				startPolling(() => insertImage(props.textBoxes, props.setTextBoxes, props.index));
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

async function insertImage(textBoxes, setTextBoxes, index) {
	const dataURL = await getDrawing();
	console.log(dataURL);
	// const dataURL = "https://s3.us-west-2.amazonaws.com/secure.notion-static.com/95c277ff-70ab-404b-8672-c41aacdee956/IMG_1278.jpg?X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Credential=AKIAT73L2G45EIPT3X45%2F20230219%2Fus-west-2%2Fs3%2Faws4_request&X-Amz-Date=20230219T195105Z&X-Amz-Expires=86400&X-Amz-Signature=d50fd351b58b43a89ee73ed2e2c5daff7cd5f570b8d4ee9f52c89239e8d86d48&X-Amz-SignedHeaders=host&response-content-disposition=filename%3D%22IMG_1278.JPG.jpg%22&x-id=GetObject";

	const tmp = [...textBoxes];
	tmp.splice(index + 1, 0, {"size": "image", "text": dataURL})
	setTextBoxes(tmp);
}

export default QRWindow;