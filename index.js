import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent wires the app for both native (AppRegistry) and web
// (mounts into the #root element). Without it, the web bundle loads but never
// mounts, leaving a blank page.
registerRootComponent(App);
