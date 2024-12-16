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
import { Float } from 'react-native/Libraries/Types/CodegenTypes';
import { inverse, Matrix } from 'ml-matrix';

//Setup variables
let dataArray = [0];
let firstTemp = 0;
let lastTemp = 0;
let queue = '';
let count = 0;
let average = 0;
let pressure_data = 0.0;
type VoidCallback = (result: boolean) => void;

let a0 = 0;
let a1 = 0;
let a2 = 0;
let a3 = 0;

let p0_rep = 0;
let p30_rep = 0;
let p60_rep = 0;
let p90_rep = 0;

const data_strim = 75;

let converted_angle_value = 0;

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

// ---------------------------------------------- Calib function ----------------------------------
function Interpolate(p0: Float, p30: Float, p60: Float, p90: Float, setIsCalibComplete: React.Dispatch<React.SetStateAction<S>>) {
    var A = new Matrix([
        [1, p0, p0*p0, p0*p0*p0],
        [1, p30, p30*p30, p30*p30*p30],
        [1, p60, p60*p60, p60*p60*p60],
        [1, p90, p90*p90, p90*p90*p90],
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

    setIsCalibComplete(true);
};

const CalibModal: FC<CalibModalProps> = props => {
  const {p0, p30, p60, p90, setP0, setP30, setP60, setP90, setIsCalibComplete, AnalogValve, visible, closeModal } = props;

  return (
    <Modal
      style={globalStyles.container}
      animationType="slide"
      transparent={false}
      visible={visible}>
      <SafeAreaView style={globalStyles.container}>
        <Text style={globalStyles.modalTitleText}>
          Calibration
        </Text>

        <View style={globalStyles.heartRateTitleWrapper}>
            <Text style={globalStyles.heartRateTitleText}>Current Data:</Text>
            <Text style={globalStyles.heartRateText}>{AnalogValve}</Text>
        </View>

        {/* Calibrate button */}
        <View style={globalStyles.ButtonLayout}>
          <TouchableOpacity
              onPress={() => 
                  setP0(AnalogValve)
              }
              style={globalStyles.calibButton}>
              <Text style={globalStyles.ctaButtonText}>
              {"0º"}
              </Text>
          </TouchableOpacity>

          <TouchableOpacity
              onPress={() => 
                  setP30(AnalogValve)
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
                  setP60(AnalogValve)
              }
              style={globalStyles.calibButton}>
              <Text style={globalStyles.ctaButtonText}>
              {"60º"}
              </Text>
          </TouchableOpacity>

          <TouchableOpacity
              onPress={() => 
                  setP90(AnalogValve)
              }
              style={globalStyles.calibButton}>
              <Text style={globalStyles.ctaButtonText}>
              {"90º"}
              </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
            onPress={() => 
                Interpolate(p0, p30, p60, p90, setIsCalibComplete)
            }
            style={globalStyles.ctaButton}>
            <Text style={globalStyles.ctaButtonText}>
            {"Calibrate"}
            </Text>
        </TouchableOpacity>              

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
}
// ---------------------------------------------- End of Calib function ---------------------------

const Home = () => {
  // *-----------------------* BLE devices list modal setup *------------------*
  const [isModalVisible, setIsModalVisible] = useState<boolean>(false);

  const hideModal = () => {
    setIsModalVisible(false);
  };

  const openModal = async () => {
    scanForDevices();
    setIsModalVisible(true);
  };

  // *-----------------------* Angle value *----------------------------*
  const [AngleValue, setAngleValue] = useState<Float>(0.0);
  
  // *-----------------------* BLE function setup *----------------------------*
  const [allDevices, setAllDevices] = useState<Device[]>([]);
  const [AnalogValve, setAnalogValve] = useState<Float>(0.0);

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
                  let converted = (popped[1].charCodeAt(0) - 48)*64 + popped[0].charCodeAt(0) - 48;
                  count += 1;
                  average += converted;
                  // console.log(`Data received: ${popped}, converted value: ${converted}`);
        
                  if(count % 15 === 0){
                    average = Math.ceil(average/15);
                    pressure_data = (average*3.3/4096 - 0.5126)*(1/0.2326);
                    pressure_data = Math.floor(pressure_data*1000)/1000;
                    setAnalogValve(pressure_data);

                    converted_angle_value = a0 + a1*pressure_data + a2*pressure_data*pressure_data + a3*pressure_data*pressure_data*pressure_data;
                    converted_angle_value = Math.floor(converted_angle_value*100)/100;
                    setAngleValue(converted_angle_value);
                    // console.log('connecting to Device 4096:', converted);
                    // console.log('average:', average);
                    // console.log('pressure:', pressure_data);
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
  var Array = appendData(dataArray, AngleValue);
  useEffect(() => {
    const interval = setInterval(() => {
      if (Array.length >= data_strim){
        Array.splice(0, Array.length - data_strim);
        setLiveData(Array);
      } else{
        setLiveData(Array);
      }
    }, 1);

    // Clean up interval
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
    console.log(`p0: ${p0_rep}, p30: ${p30_rep}, p60: ${p60_rep}, p90: ${p90_rep}`);
    console.log(`a0: ${a0}, a1: ${a1}, a2: ${a2}, a3: ${a3},`);
    console.log("======================================================");
    }, 1000);

    // Clean up interval
    return () => clearInterval(interval);
  }, []);

  //--------------------------------- Calibration modal -------------------------------------------
  const [isCalibModalVisible, setIsCalibModalVisible] = useState<boolean>(false);
  const [p0, setP0] = useState<Float>(0);
  const [p30, setP30] = useState<Float>(0);
  const [p60, setP60] = useState<Float>(0);
  const [p90, setP90] = useState<Float>(0);

  const [isCalibComplete, setIsCalibComplete] = useState<boolean>(false);

  const hideCalibModal = () => {
    setIsCalibModalVisible(false);
  };

  const openCalibModal = async () => {
    // scanForDevices();
    setIsCalibModalVisible(true);
  };
  // -------------------------------- End of Calibration modal ------------------------------------

  return (
    <SafeAreaView style={globalStyles.container}>
      <View style={globalStyles.heartRateTitleWrapper}>
        {isConnected ? (
          <>
            {/* <DataIndicator /> */}
            <Text style={globalStyles.heartRateTitleText}>Current Pressure Data:</Text>
            <Text style={globalStyles.heartRateText}>{AnalogValve}</Text>
          </>
        ) : (
          <Text style={globalStyles.heartRateTitleText}>
            Please Connect to a Bluetooth device
          </Text>
        )}
      </View> 

      <View style={globalStyles.heartRateTitleWrapper, {marginBottom: 150}}>
        {isCalibComplete ? (
          <>
            {/* <DataIndicator /> */}
            <Text style={globalStyles.heartRateTitleText}>Converted Angle Value:</Text>
            <Text style={globalStyles.heartRateText}>{AngleValue}º</Text>
          </>
        ) : (
          <Text style={globalStyles.heartRateTitleText}>
            Convert function not generated
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

      {/* Go to Calibrate screen */}  
      <TouchableOpacity
        onPress={openCalibModal}
        style={globalStyles.ctaButton}>
        <Text style={globalStyles.ctaButtonText}>
        {"Calibrate"}
        </Text>
      </TouchableOpacity>
        
      {/* Go to Datachart screen */}  
      <TouchableOpacity
        onPress={() => 
            navigation.navigate("Chart")
        }
        style={globalStyles.ctaButton}>
        <Text style={globalStyles.ctaButtonText}>
        {"Data Chart"}
        </Text>
      </TouchableOpacity>  

      {/* Connect or disconnect device */}
      <TouchableOpacity
        onPress={isConnected ? disconnectDevice : openModal}
        style={globalStyles.ctaButton}>
        <Text style={globalStyles.ctaButtonText}>
          {isConnected ? 'Disconnect' : 'Connect BLE Device'}
        </Text>
      </TouchableOpacity>

      <DeviceModal
        closeModal={hideModal}
        visible={isModalVisible}
        connectToPeripheral={connectDevice}
        devices={allDevices}
      />

      <CalibModal
        p0={p0}
        p30={p30}
        p60={p60}
        p90={p90}
        setP0={setP0}
        setP30={setP30}
        setP60={setP60}
        setP90={setP90}
        setIsCalibComplete={setIsCalibComplete}
        AnalogValve={AnalogValve}
        closeModal={hideCalibModal}
        visible={isCalibModalVisible}
      />
    </SafeAreaView>
  );
};

export default Home;
