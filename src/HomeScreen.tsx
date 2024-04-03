import React, { useState, useEffect, useContext } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Button, AppRegistry } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import DeviceModal from './DeviceConnectionModal';
import useBLE from './useBLE';
import { DataContext } from './Context';

let dataArray = [0];


function appendData(array, newData) {
  const lastValue = array[array.length - 1];

  if (newData !== lastValue) {
    array.push(newData);
  }
  
  return array;
}

const Home = () => {
  const {
    requestPermissions,
    scanForPeripherals,
    allDevices,
    connectToDevice,
    connectedDevice,
    heartRate,
    disconnectFromDevice,
  } = useBLE();
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const scanForDevices = () => {
    requestPermissions(isGranted => {
      if (isGranted) {
        scanForPeripherals();
      }
    });
  };

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };

  const navigation = useNavigation()

  const {setLiveData} = useContext(DataContext);
  var Array = appendData(dataArray, heartRate);

  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(Array);
    }, 0);

    // Clean up interval
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.heartRateTitleWrapper}>
        {connectedDevice ? (
          <>
            {/* <DataIndicator /> */}
            <Text style={styles.heartRateTitleText}>Current Data:</Text>
            <Text style={styles.heartRateText}>{heartRate}</Text>
          </>
        ) : (
          <Text style={styles.heartRateTitleText}>
            Please Connect to a Bluetooth device
          </Text>
        )}
      </View> 
      
      {/* Go to the data screen */}
      {/* <TouchableOpacity
        onPress={() => 
          navigation.navigate("DataScreen")
        }
        style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>
          {"Data Screen"}
        </Text>
      </TouchableOpacity> */}
        
      {/* Connect or disconnect device */}
      <TouchableOpacity
        onPress={connectedDevice ? disconnectFromDevice : openModal}
        style={styles.ctaButton}>
        <Text style={styles.ctaButtonText}>
          {connectedDevice ? 'Disconnect' : 'Connect BLE Device'}
        </Text>
      </TouchableOpacity>

      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectToDevice}
        devices={allDevices}
      />
    </SafeAreaView>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f2f2',
  },
  heartRateTitleWrapper: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  heartRateTitleText: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    marginHorizontal: 20,
    color: 'black',
  },
  heartRateText: {
    fontSize: 25,
    marginTop: 15,
    color: 'black',
  },
  ctaButton: {
    backgroundColor: 'purple',
    justifyContent: 'center',
    alignItems: 'center',
    height: 50,
    marginHorizontal: 20,
    marginBottom: 5,
    borderRadius: 8,
    padding: 10,
  },
  ctaButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
  },
  chartContainer: {
    marginBottom: 20,
  },
});

export default Home;
