// This pieces of code generate a global array which store data value from pressure sensor, hence act as database for visualising on graph.

import React, { createContext, useState } from "react";
import { Float } from "react-native/Libraries/Types/CodegenTypes";

export const DataContext = createContext();

export const DataContextProvider = ({ children}) => {
    const [liveData, setLiveData] = useState([0]);

    return (
        <DataContext.Provider value={{ liveData, setLiveData }}>
          {children}
        </DataContext.Provider>
      );
}