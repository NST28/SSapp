import React, {useState, useEffect, useContext, PureComponent} from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Dimensions, useWindowDimensions } from 'react-native';

import Svg, { Path, G, Line } from 'react-native-svg';
import * as d3 from 'd3';
import { useNavigation} from '@react-navigation/native';
import { DataContext } from './Context';
import { Colors } from 'react-native/Libraries/NewAppScreen';

const LiveChart = ({ data1, data2, width, height }) => {
  const margin = {top: 0, right: 0, bottom: 30, left: 0 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  // const xScale = d3.scaleLinear().domain([0, data.length - 1]).range([0, innerWidth]);
  // const yScale = d3.scaleLinear().domain([0, Math.max(d3.max(data1), d3.max(data2))]).range([innerHeight, 0]);
  // const xAxis = d3.axisBottom(xScale).ticks(data.length);
  // const yAxis = d3.axisLeft(yScale);
  // const line = d3.line().x((d, i) => xScale(i)).y(yScale);

  const xScale = d3.scaleLinear().domain([0, Math.max(data1.length, data2.length) - 1]).range([0, innerWidth]);
  const yScale = d3.scaleLinear().domain([0, innerHeight]).range([innerHeight, 0]);
  const line1 = d3.line().x((d, i) => xScale(i)).y(d => yScale(d));
  const line2 = d3.line().x((d, i) => xScale(i)).y(d => yScale(d));

  return (
    <View style={styles.chart}>
      <Svg width={width} height={height}>
        <G>
          <Line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="black" />
          <Line x1={0} y1={0} x2={0} y2={innerHeight} stroke="black" />
          {yScale.ticks().map((tick, i) => (
            <Text style={{color: 'black'}} key={`y-label-${i}`}  x={10} y={yScale(tick)+ 50} fontSize="12" textAnchor="end" alignmentBaseline="middle">{tick}</Text>
          ))}
          <Path d={line1(data1)} fill="none" stroke="green" strokeWidth={2} />
          <Path d={line2(data2)} fill="none" stroke="blue" strokeWidth={2} />
        </G>
      </Svg>
    </View>
  );
};

const LiveChart_test = ({ data1, data2 }) => {
  var width = 350;
  var height = 300;
  const margin = { top: 0, right: 0, bottom: 0, left: 30 };
  const innerWidth = width - margin.left - margin.right;
  const innerHeight = height - margin.top - margin.bottom;
  
  const xScale = d3.scaleLinear().domain([0, data.length - 1]).range([0, innerWidth]);
  const yScale = d3.scaleLinear().domain([0, innerHeight]).range([innerHeight, 0]);
  const xAxis = d3.axisBottom(xScale).ticks(data.length);
  const yAxis = d3.axisLeft(yScale);
  const line = d3.line().x((d, i) => xScale(i)).y(yScale);

  return (
    <View style={styles.container}>
      <Svg width={width} height={height}>
        <G transform={`translate(${margin.left},${margin.top})`}>
          <Line x1={0} y1={innerHeight} x2={innerWidth} y2={innerHeight} stroke="black" />
          <Line x1={0} y1={0} x2={0} y2={innerHeight +20} stroke="black" />
          {/* {data.map((_, i) => (
            <Text key={`x-label-${i}`} x={xScale(i)} y={innerHeight + 20} fontSize="12" textAnchor="middle">{i}</Text>
          ))} */}
          {yScale.ticks().map((tick, i) => (
            <Text style={{color: 'black'}} key={`y-label-${i}`} x={-10} y={yScale(tick)} fontSize="12" textAnchor="end" alignmentBaseline="middle">{tick}</Text>
          ))}
          <Path d={line(data)} fill="none" stroke="green" strokeWidth={2} />
        </G>
      </Svg>
    </View>
  );
};

const DataScreen = () => {
  const [heartRateData1, setHeartRateData1] = useState([0]);
  const [heartRateData2, setHeartRateData2] = useState([0]);

  const {height, width} = useWindowDimensions();

  const addValue = () => {
    setHeartRateData2(prevData => [...prevData, prevData[prevData.length - 1] + 50]);
  };

  const navigation = useNavigation()

  // Get sensor datas
  const liveData = useContext(DataContext);
  var liveDataObj = liveData.liveData;

  // Set newData for BLE
  var newData1 = 25;

  // Set newData test
  var newData2 = 50;

  useEffect(() => {
    const interval = setInterval(() => {
      // Data from BLE
      setHeartRateData1(prevData => {        
        newData1 = liveDataObj[Object.keys(liveDataObj)[Object.keys(liveDataObj).length - 1]] * 0.4 + 25;
        // newData = Math.random() * 100;
        const chartData1 = [...prevData, newData1];
        return chartData1.slice(-200)
      });

      // Test data
      setHeartRateData2(prevData => {        
        // newData = liveDataObj[Object.keys(liveDataObj)[Object.keys(liveDataObj).length - 1]] * 0.4;
        // newData = Math.random() * 100;
        const chartData2 = [...prevData, newData2];
        return chartData2.slice(-200)
      });
    }, 50); // Set time interval

    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.container}>

        {/* // Display Live chart */}
        <Text style={styles.chartName}>
          {"Signal chart"}
        </Text>

        <LiveChart data1={heartRateData1} data2={heartRateData2} width={width - 50} height={height - 150} />

        {/* Resemble data received button */}
        <TouchableOpacity
          onPress={addValue}
          style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>
            {"Add Value"}
          </Text>
        </TouchableOpacity>

        {/* Navigate to home screen button */}
        {/* <TouchableOpacity
          onPress={() => navigation.navigate("Home")}
          style={styles.ctaButton}>
          <Text style={styles.ctaButtonText}>
            {"Home Screen"}
          </Text>
        </TouchableOpacity> */}
      </View>   
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  chart: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 25,
  },
  chartName:{
    // justifyContent: 'center',
    alignItems: 'center',
    color: 'black',
    fontSize: 18,
    fontWeight: 'bold',
    marginHorizontal: 20,
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
});

export default DataScreen;