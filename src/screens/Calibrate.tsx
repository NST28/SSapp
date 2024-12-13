import React, { useContext, useEffect, useState } from "react";
import {SafeAreaView, View, Text, TouchableOpacity } from "react-native";
import { DataContext } from "../Context";
import { useNavigation } from '@react-navigation/native';
import { globalStyles } from "../constants/globalStyles";
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import { inverse, Matrix } from 'ml-matrix';

let a0 = 0;
let a1 = 0;
let a2 = 0;
let a3 = 0;

let p0_rep = 0;
let p30_rep = 0;
let p60_rep = 0;
let p90_rep = 0;

function Interpolate(p0: Float, p30: Float, p60: Float, p90: Float) {
    var A = new Matrix([
        [1, p0, p0^2, p0^3],
        [1, p30, p30^2, p30^3],
        [1, p60, p60^2, p60^3],
        [1, p90, p90^2, p90^3],
    ]);
    var Ainv = inverse(A);
    var C = new Matrix([
        [0],
        [30],
        [60],
        [90],
    ]);
    var B = Ainv.mmul(C);
    a0 = B.get(0, 0);
    a1 = B.get(1, 0);
    a2 = B.get(2, 0);
    a3 = B.get(3, 0);

    p0_rep = p0;
    p30_rep = p30;
    p60_rep = p60;
    p90_rep = p90;

};

const Calibrate = () => {

    const [p0, setP0] = useState<Float>(0);
    const [p30, setP30] = useState<Float>(0);
    const [p60, setP60] = useState<Float>(0);
    const [p90, setP90] = useState<Float>(0);

    const [pressureData, setPressureData] = useState<Float>(0);

    const navigation = useNavigation();

    // Get live data from BLE 
    const liveData = useContext(DataContext);
    var liveDataObj = liveData.liveData; 

    useEffect(() => {
        const interval = setInterval(() => {
            setPressureData(liveDataObj[Object.keys(liveDataObj).length - 1]);
        }, 0); // Set time interval
    
        return () => clearInterval(interval);
    }, []);

    // Logging data for debugging
    useEffect(() => {
        const interval = setInterval(() => {
            console.log(`pressure data: ${liveDataObj[Object.keys(liveDataObj).length - 1]}`);
            console.log(`a0: ${a0}, a1: ${a1}, a2: ${a2}, a3: ${a3}`);
            console.log(`p0: ${p0_rep}, p30: ${p30_rep}, p60: ${p60_rep}, p90: ${p90_rep}`);
            console.log("========================================");
        }, 1000); // Set time interval
    
        return () => clearInterval(interval);
    }, []);

    return (
        <SafeAreaView style={globalStyles.container}>

            <View style={globalStyles.heartRateTitleWrapper}>
                <Text style={globalStyles.heartRateTitleText}>Current Data:</Text>
                <Text style={globalStyles.heartRateText}>{pressureData}</Text>
            </View>

            {/* Calibrate button */}
            <View style={globalStyles.ButtonLayout}>
                <TouchableOpacity
                    onPress={() => 
                        setP0(liveDataObj[Object.keys(liveDataObj).length - 1])
                    }
                    style={globalStyles.calibButton}>
                    <Text style={globalStyles.ctaButtonText}>
                    {"0º"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => 
                        setP30(liveDataObj[Object.keys(liveDataObj).length - 1])
                    }
                    style={globalStyles.calibButton}>
                    <Text style={globalStyles.ctaButtonText}>
                    {"30º"}
                    </Text>
                </TouchableOpacity>
            </View>                   

            <View style={globalStyles.ButtonLayout}>
                <TouchableOpacity
                    onPress={() => 
                        setP60(liveDataObj[Object.keys(liveDataObj).length - 1])
                    }
                    style={globalStyles.calibButton}>
                    <Text style={globalStyles.ctaButtonText}>
                    {"60º"}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    onPress={() => 
                        setP90(liveDataObj[Object.keys(liveDataObj).length - 1])
                    }
                    style={globalStyles.calibButton}>
                    <Text style={globalStyles.ctaButtonText}>
                    {"90º"}
                    </Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity
                onPress={() => 
                    Interpolate(p0, p30, p60, p90)
                }
                style={globalStyles.ctaButton}>
                <Text style={globalStyles.ctaButtonText}>
                {"Calibrate"}
                </Text>
            </TouchableOpacity>                   

            <TouchableOpacity
                onPress={() => 
                    navigation.navigate("Home")
                }
                style={globalStyles.ctaButton}>
                <Text style={globalStyles.ctaButtonText}>
                {"Home Screen"}
                </Text>
            </TouchableOpacity>
        </SafeAreaView>
    )
}

export default Calibrate;