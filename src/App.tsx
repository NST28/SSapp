import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { NavigationContainer } from '@react-navigation/native';

import Home from "./screens/HomeScreen";
import { DataContextProvider } from "./Context";
import LineCharts from "./screens/LineChart";

const Drawer = createDrawerNavigator();

const App = () => {
    return (
      <NavigationContainer>
        <DataContextProvider>
          <Drawer.Navigator>
            <Drawer.Screen name="Home" component={Home}/>
            <Drawer.Screen name="Chart" component={LineCharts} />
          </Drawer.Navigator>
        </DataContextProvider>
      </NavigationContainer>
    );
  };

export default App;




