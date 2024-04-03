import React from "react";
import {View, Text, StyleSheet} from 'react-native';

import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import Home from "./HomeScreen";
import DataScreen from "./DataScreen";
import { DataContextProvider } from "./Context";
import LineCharts from "./LineChart";

const Stack = createNativeStackNavigator();

const Drawer = createDrawerNavigator();

const App = () => {
    return (
      <NavigationContainer>
        <DataContextProvider>
          <Drawer.Navigator>
            <Drawer.Screen name="Home" component={Home}/>
            <Drawer.Screen name="DataScreen" component={DataScreen} />
            <Drawer.Screen name="LineCharts" component={LineCharts} />
          </Drawer.Navigator>
        </DataContextProvider>
      </NavigationContainer>
    );
  };

export default App;




