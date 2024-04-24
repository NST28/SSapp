import React, { useState, useEffect, useContext } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View} from 'react-native';
import { useNavigation } from '@react-navigation/native';

import DeviceModal from './DeviceConnectionModal';
import useBLE from '../useBLE';
import { DataContext } from '../Context';
import { globalStyles } from '../constants/globalStyles';

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
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.heartRateTitleWrapper}>
        {connectedDevice ? (
          <>
            {/* <DataIndicator /> */}
            <Text style={globalStyles.heartRateTitleText}>Current Data:</Text>
            <Text style={globalStyles.heartRateText}>{heartRate}</Text>
          </>
        ) : (
          <Text style={globalStyles.heartRateTitleText}>
            Please Connect to a Bluetooth device
          </Text>
        )}
      </View> 
        
      {/* Connect or disconnect device */}
      <TouchableOpacity
        onPress={connectedDevice ? disconnectFromDevice : openModal}
        style={globalStyles.ctaButton}>
        <Text style={globalStyles.ctaButtonText}>
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

export default Home;
