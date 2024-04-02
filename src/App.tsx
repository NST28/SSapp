import React from "react";
import {View, Text, StyleSheet} from 'react-native';

import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from "./HomeScreen";
import DataScreen from "./DataScreen";
import { DataContextProvider } from "./Context";

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

export default App;




