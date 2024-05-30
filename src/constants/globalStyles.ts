// Styles for global use
import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

export const globalStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f2f2f2',
      justifyContent: 'center',
      alignItems: 'center',
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

    //chart
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
    chartContainer: {
        marginBottom: 20,
    },    

    // Button
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

    // BLE modal
    modalFlatlistContiner: {
        flex: 1,
        justifyContent: 'center',
    },
    modalCellOutline: {
        borderWidth: 1,
        borderColor: 'black',
        alignItems: 'center',
        marginHorizontal: 20,
        paddingVertical: 15,
        borderRadius: 8,
    },
    modalTitleText: {
        marginTop: 40,
        fontSize: 30,
        color: 'black',
        fontWeight: 'bold',
        marginHorizontal: 20,
        textAlign: 'center',
    },
});
