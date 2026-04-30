# Jammming - Spotify Playlist Creator

A React web application that allows users to search for songs on Spotify and create custom playlists.

## Setup Instructions

### 1. Spotify Developer Account
1. Go to [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Create a new app
3. Note your Client ID
4. Add `http://127.0.0.1:3000` as a redirect URI in your app settings

### 2. Environment Variables
Create a `.env` file in the root directory:
```
REACT_APP_SPOTIFY_CLIENT_ID=your_client_id_here
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Start the Application
```bash
npm start
```

The app will open at `http://localhost:3000`

## Features

- Search for songs on Spotify
- Add/remove tracks to/from a playlist
- Save playlists to your Spotify account
- User authentication with Spotify OAuth

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

### `npm test`

Launches the test runner in the interactive watch mode.

### `npm run build`

Builds the app for production to the `build` folder.

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
