// Styles for global use
import { StyleSheet } from 'react-native';
import { Dimensions } from 'react-native';

export const globalStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#f2f2f2'
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
        textAlign: 'center',
    },
    calibProcessText: {
        fontSize: 16,
        marginTop: 15,
        color: 'black',
        textAlign: 'left',
        backgroundColor:'#f2f2f2',
        borderRadius: 10,
        marginHorizontal: 30,
        borderWidth: 2,
        
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
        backgroundColor: '#1f386e',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 30,
        marginBottom: 15,
        borderRadius: 8,
        padding: 10,
    },
    ctaButtonText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: 'white',
        marginHorizontal: 20,
    },
    calibButton: {
        backgroundColor: '#1f386e',
        justifyContent: 'center',
        alignItems: 'center',
        marginHorizontal: 20,
        marginBottom: 0,
        borderRadius: 8,
        padding: 10,
        width: 150,
        height: 50,
    },
    ButtonLayout: {
        margin: 10,
        marginHorizontal: 10,
        flexDirection: 'row',
        justifyContent: 'center',
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
    rowView: {
        justifyContent: 'space-around',
        alignItems: 'flex-start',
        flexDirection: 'row',
        color: 'black',
      },
});
