import 'react-native-gesture-handler'

import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';
import {LogBox} from 'react-native';
import App from './src/App';

LogBox.ignoreLogs(['new NativeEventEmitter']);

AppRegistry.registerComponent(appName, () => App);
