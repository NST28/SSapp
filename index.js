/**
 * @format
 */

import {AppRegistry} from 'react-native';
import {name as appName} from './app.json';

import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from './src/HomeScreen';
import DataScreen from './src/DataScreen';
import { DataContextProvider } from './src/Context';

const Stack = createNativeStackNavigator();

const App = () => {
    return (
      <NavigationContainer>
        <DataContextProvider>
          <Stack.Navigator>
            <Stack.Screen name="Home" component={Home}/>
            <Stack.Screen name="DataScreen" component={DataScreen} />
          </Stack.Navigator>
        </DataContextProvider>
      </NavigationContainer>
    );
  };

AppRegistry.registerComponent(appName, () => App);
