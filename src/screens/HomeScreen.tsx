import React, { useState, useEffect, useContext, FC, useCallback } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, FlatList, Modal} from 'react-native';

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

const DeviceModalListItem: FC<DeviceModalListItemProps> = props => {
  const { item, connectToPeripheral, closeModal } = props;

  const connectAndCloseModal = useCallback(() => {
    connectToPeripheral(item.item);
    closeModal();
  }, [closeModal, connectToPeripheral, item.item]);

  return (
    <TouchableOpacity
      onPress={connectAndCloseModal}
      style={globalStyles.ctaButton}>
      <Text style={globalStyles.ctaButtonText}>{item.item.name}</Text>
    </TouchableOpacity>
  );
};

const DeviceModal: FC<DeviceModalProps> = props => {
  const { devices, visible, connectToPeripheral, closeModal } = props;

  const renderDeviceModalListItem = useCallback(
    (item: ListRenderItemInfo<Device>) => {
      return (
        <DeviceModalListItem
          item={item}
          connectToPeripheral={connectToPeripheral}
          closeModal={closeModal}
        />
      );
    },
    [closeModal, connectToPeripheral],
  );

  return (
    <Modal
      style={globalStyles.container}
      animationType="slide"
      transparent={false}
      visible={visible}>
      <SafeAreaView style={globalStyles.container}>
        <Text style={globalStyles.modalTitleText}>
          Tap on a device to connect
        </Text>
        <FlatList
          contentContainerStyle={globalStyles.modalFlatlistContiner}
          data={devices}
          renderItem={renderDeviceModalListItem}
        />

        <TouchableOpacity
          onPress={closeModal}
          style={globalStyles.ctaButton}>
          <Text style={globalStyles.ctaButtonText}>
            {"Home Screen"}
          </Text>
        </TouchableOpacity>
      </SafeAreaView>
    </Modal>
  );
};

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
