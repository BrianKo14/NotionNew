
# ✍️ Notion New

This project is a small replica of Notion that includes a new feature for making drawings with your phone and adding them to your projects. I built it as a demonstration to showcase my skills and interest in working at Notion.

<br />
<img src="https://notionnew-images.s3.amazonaws.com/mindmap.png">
<br />
Check out the live version here: <a href="http://notionnew.us-east-1.elasticbeanstalk.com/" target="_blank">http://notionnew.us-east-1.elasticbeanstalk.com/</a>

<br />

## Development instructions

`react-app` is the front-end for the desktop part, the actual Notion replica. It needs to be compiled and put inside the `public` directory of the server.

### Scripts: `react-app`

- `npm run start`: Runs the app on port 3000. Use for debugging.
- `npm run build`: Builds the app and moves the build to the `server/public`.
- `npm run deploy`: For deploying the app in GitHub Pages. I used this for testing at the beginning.

### Scripts: `server`

- `npm run start`: Runs `node app.js`, i.e. starts the server on port 3001.
- `npm run build`: Zips the `server` directory for uploading in AWS Elastic Beanstalk.