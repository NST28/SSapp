import React, { useState, useEffect, useContext, FC, useCallback } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View, FlatList, Modal, PermissionsAndroid, Platform} from 'react-native';
import {PERMISSIONS, requestMultiple} from 'react-native-permissions';
import DeviceInfo from 'react-native-device-info';

import { atob, btoa } from 'react-native-quick-base64';
import { BleManager, Device } from 'react-native-ble-plx';

import { DataContext } from '../Context';
import { useNavigation } from '@react-navigation/native';
import { globalStyles } from '../constants/globalStyles';
import CheckBox from '@react-native-community/checkbox';

//Setup variables
let dataArray = [0];
let firstTemp = 0;
let lastTemp = 0;
let queue = '';
let count = 0;
let average = 0;
type VoidCallback = (result: boolean) => void;

// Setup global array contain pressure sensor's data
function appendData(array, newData) {
  const lastValue = array[array.length - 1];

  if (newData !== lastValue) {
    array.push(newData);
  }
  
  return array;
}

function StringToBool(input: String) {
  if (input == '1') {
    return true;
  } else {
    return false;
  }
}

// Convert box value from Bool type to String type
function BoolToString(input: boolean) {
  if (input == true) {
    return '1';
  } else {
    return '0';
  }
}

// Setup BLE manager class
const BLTManager = new BleManager();

// Modify ID base on device datasheet
const BLE_UUID = 'FFE0';
const BLE_CHARACTERISTIC = 'FFE1';

// Nested modal screen displaying list of BLE devices
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
  // *--------------------* BLE devices list modal setup *--------------------*
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };
  
  // *--------------------* BLE function setup *--------------------*
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [AnalogValve, setAnalogValve] = useState<number>(0);

  //Is a device connected?
  const [isConnected, setIsConnected] = useState(false);

  //What device is connected?
  const [connectedDevice, setConnectedDevice] = useState<Device>();

  // Setup date to send back to cỉcuit
  const [boxvalue, setBoxValue] = useState(false);
  
  // Request permissions from devices
  async function requestPermissions(cb: VoidCallback) {
    if (Platform.OS === 'android') {
      const apiLevel = await DeviceInfo.getApiLevel();

      if (apiLevel < 31) {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Location Permission',
            message: 'Bluetooth Low Energy requires Location',
            buttonNeutral: 'Ask Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          },
        );
        cb(granted === PermissionsAndroid.RESULTS.GRANTED);
      } else {
        const result = await requestMultiple([
          PERMISSIONS.ANDROID.BLUETOOTH_SCAN,
          PERMISSIONS.ANDROID.BLUETOOTH_CONNECT,
          PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ]);

        const isGranted =
          result['android.permission.BLUETOOTH_CONNECT'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.BLUETOOTH_SCAN'] ===
            PermissionsAndroid.RESULTS.GRANTED &&
          result['android.permission.ACCESS_FINE_LOCATION'] ===
            PermissionsAndroid.RESULTS.GRANTED;

        cb(isGranted);
      }
    } else {
      cb(true);
    }
  }

  const scanForDevices = () => {
    requestPermissions(isGranted => {
      if (isGranted) {
        scanForPeripherals();
      }
    });
  };

  // Check duplicated devices
  const isDuplicteDevice = (devices: Device[], nextDevice: Device) =>
    devices.findIndex(device => nextDevice.id === device.id) > -1;

  // Scan for available devices
  const scanForPeripherals = () =>
    BLTManager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.log(error);
      }
      if (device && device.name !== null) {
        setAllDevices((prevState: Device[]) => {
          if (!isDuplicteDevice(prevState, device)) {
            return [...prevState, device];
          }
          return prevState;
        });
      }
    });

  //Connect the device and start monitoring characteristics
  async function connectDevice(device: Device) {
    console.log('connecting to Device:', device.name);

    device
      .connect()
      .then(device => {
        setConnectedDevice(device);
        setIsConnected(true);
        return device.discoverAllServicesAndCharacteristics();
      })
      .then(device => {
        //  Set what to do when DC is detected
        BLTManager.onDeviceDisconnected(device.id, (error, device) => {
          console.log('Device Disconected');
          setIsConnected(false);
        });

        //monitor values and update to graph
        device.monitorCharacteristicForService(
          BLE_UUID,
          BLE_CHARACTERISTIC,
          (error, characteristic) => {
            
            if (error) {
              console.log(error);
              return -1;
            } else if (!characteristic?.value) {
              console.log('No Data was recieved');
              return -1;
            }
        
            const rawData = atob(characteristic.value);
            const rawDataSplit = rawData.split('\n');
            const dataLenght = rawDataSplit.length;
        
            for ( var i = 0; i < dataLenght; i++ ) {
              // Create timestampt when receive first sample
              if (rawDataSplit[i] === 'Start'){
                firstTemp = Date.now();
              } else if (rawDataSplit[i] === 'Stop'){ // Calculate time spent for receiving data
                lastTemp = Date.now();
                console.log(`First: ${firstTemp}, Last: ${lastTemp}, Time interval between: ${lastTemp - firstTemp} ms`);
                queue = '';
                count = 0;
              } else { // Push data to buffer and decode
                queue += rawDataSplit[i];
        
                while(queue !== ''){
                  if (queue.length === 1){
                    break;
                  }
                  // Pop 2 characters from queue to get the encoded data
                  let popped = queue.slice(0,2);
                  queue = queue.slice(2);
        
                  // Decode data
                  let converted = (popped[0].charCodeAt(0) - 48)*64 + popped[1].charCodeAt(0) - 48;
                  count += 1;
                  average += converted;
        
                  if(count % 15 === 0){
                    average = Math.ceil(average/15);
                    setAnalogValve(average);
                    average = 0;
                  }
                  // console.log(`Data: ${popped}, Converted: ${converted}`);
                };
              };
            };
          },
          'messagetransaction',
        );

        // //BoxValue
        // device.monitorCharacteristicForService(
        //   BLE_UUID,
        //   CALIBRATE_UUID,
        //   (error, characteristic) => {
        //     if (characteristic?.value != null) {
        //       setBoxValue(StringToBool(atob(characteristic?.value)));
        //       console.log(
        //         'Box Value update received: ',
        //         atob(characteristic?.value),
        //       );
        //     }
        //   },
        //   'boxtransaction',
        // );

        console.log('Connection established');
      });
  }

  // handle the device disconnection (poorly)
  async function disconnectDevice() {
    console.log('Disconnecting start');

    if (connectedDevice != null) {
      const isDeviceConnected = await connectedDevice.isConnected();
      if (isDeviceConnected) {
        BLTManager.cancelTransaction('messagetransaction');

        BLTManager.cancelDeviceConnection(connectedDevice.id).then(() =>
          console.log('End connection session'),
        );
      }

      const connectionStatus = await connectedDevice.isConnected();
      if (!connectionStatus) {
        setIsConnected(false);
      }
    }
  }

  //Function to send data to circuit
  async function sendBoxValue(value: boolean) {
    BLTManager.writeCharacteristicWithResponseForDevice(
      connectedDevice.id,
      BLE_UUID,
      BLE_CHARACTERISTIC,
      btoa(BoolToString(value)),
      // value.toString(),
    ).then(characteristic => {
      console.log('Box value changed to :', value, 'Msgs sent: ', BoolToString(value), 'Base64 type: ', btoa(BoolToString(value)));
    });
  }

  // Setup manager for connection route between screens 
  const navigation = useNavigation();

  // Push fresh data to global array
  const {setLiveData} = useContext(DataContext);
  var Array = appendData(dataArray, AnalogValve);
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveData(Array);
    }, 1);

    // Clean up interval
    return () => clearInterval(interval);
  }, []);

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.heartRateTitleWrapper}>
        {isConnected ? (
          <>
            {/* <DataIndicator /> */}
            <Text style={globalStyles.heartRateTitleText}>Current Data:</Text>
            <Text style={globalStyles.heartRateText}>{AnalogValve}</Text>
          </>
        ) : (
          <Text style={globalStyles.heartRateTitleText}>
            Please Connect to a Bluetooth device
          </Text>
        )}
      </View> 

      {/* Checkbox */}
      <View style={globalStyles.rowView}>
        <CheckBox
          disabled={false}
          onTintColor={'black'}
          value={boxvalue}
          onValueChange={newValue => {
            setBoxValue(newValue);
            sendBoxValue(newValue);
          }}
        />
      </View>
        
      {/* Connect or disconnect device */}
      <TouchableOpacity
        onPress={isConnected ? disconnectDevice : openModal}
        style={globalStyles.ctaButton}>
        <Text style={globalStyles.ctaButtonText}>
          {isConnected ? 'Disconnect' : 'Connect BLE Device'}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={() => 
            navigation.navigate("Chart")
        }
        style={globalStyles.ctaButton}>
        <Text style={globalStyles.ctaButtonText}>
        {"Data Chart"}
        </Text>
    </TouchableOpacity>

      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectDevice}
        devices={allDevices}
      />
    </SafeAreaView>
  );
};

export default Home;
