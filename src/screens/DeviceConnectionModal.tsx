import React, {FC, useCallback} from 'react';
import {
  FlatList,
  ListRenderItemInfo,
  Modal,
  SafeAreaView,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import {Device} from 'react-native-ble-plx';
import { globalStyles } from '../constants/globalStyles';

type DeviceModalListItemProps = {
  item: ListRenderItemInfo<Device>;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
};

type DeviceModalProps = {
  devices: Device[];
  visible: boolean;
  connectToPeripheral: (device: Device) => void;
  closeModal: () => void;
};

const DeviceModalListItem: FC<DeviceModalListItemProps> = props => {
  const {item, connectToPeripheral, closeModal} = props;

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
  const {devices, visible, connectToPeripheral, closeModal} = props;

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

export default DeviceModal;
