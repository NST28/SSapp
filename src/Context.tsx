import React, { createContext, useState } from "react";

export const DataContext = createContext();

export const DataContextProvider = ({ children}) => {
    const [liveData, setLiveData] = useState([0]);

    return (
        <DataContext.Provider value={{ liveData, setLiveData }}>
          {children}
        </DataContext.Provider>
      );
}