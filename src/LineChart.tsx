import React from "react";
import { View, Text, StyleSheet } from "react-native";
import LineChart from "./components/LineChart";
import { testData } from "./data";

const LineCharts = () => {
    console.log("Test data lenght: ", testData.length);
    return (
        <View style={style.container}>
            <Text>LineChart</Text>
            <LineChart 
                data={testData}
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
            />
        </View>
    )
}

const style = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    }
})

export default LineCharts;