import React, { useContext, useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import LineChart from "./components/LineChart";
import { testData } from "./data";
import { DataContext } from "./Context";

const LineCharts = () => {
    const [testDataSelf, setTestDataSelf] = useState([
        {
            month: "Jan",
            value: 0,
        },
    ]);

    // Get live data from BLE 
    const liveData = useContext(DataContext);
    var liveDataObj = liveData.liveData; 

    // console.log(`Last value in Line chart: ${liveDataObj[Object.keys(liveDataObj).length - 1]}, array length: ${Object.keys(liveDataObj).length}`);
    
    const data_strim = 200;
  
    useEffect(() => {
        const interval = setInterval(() => {
            setTestDataSelf(prevData => {
                const newMonth = getNewMonthName();
                const newValue = liveDataObj[Object.keys(liveDataObj).length - 1];
                const newValueMap = newValue * 100 / 4096;
                const newData = [...prevData, { month: newMonth, value: newValueMap}];

                if (newData.length > data_strim) {
                    newData.splice(0, newData.length - data_strim);
                }
                return newData;
            });
        }, 0); // Set time interval
    
        return () => clearInterval(interval);
    }, []);
    
    const getNewMonthName = () => {
        const months = ['Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        return months[Math.floor(Math.random() * months.length)];
    };

    return (
        <View style={styles.container}>
            <Text>LineChart</Text>
            <LineChart 
                data={Object.keys(testDataSelf).length > 1 ? testDataSelf : testData}
                // data={testDataSelf}
                onPressItem={item => console.log(item)}
                backgroundColor="transparent"
                svgbackgroundColor="transparent"
                useGradientBackground={true} 
                gradient_background_config={{
                    stop1:{
                        offset: 0,
                        stopColor: '#6491d9',
                        stopOpacity: 0.4,
                    },
                    stop2:{
                        offset: 1,
                        stopColor: '#35578f',
                        stopOpacity: 0.8,
                    },
                }}
                curve={false} 
                showHorizontalLines = {true}
                horizontalLineOpacity = {0.2}
                showVerticalLines = {false}
                verticalLineOpacity = {0.2}
            />
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ctaButton: {
        backgroundColor: 'purple',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 25,
        marginBottom: 10,
        borderRadius: 8,
        padding: 10,
      },
      ctaButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginHorizontal: 20,
      },
})

export default LineCharts;