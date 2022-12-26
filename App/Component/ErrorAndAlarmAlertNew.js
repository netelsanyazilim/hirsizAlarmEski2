import React, { Component } from 'react';
import { StyleSheet, View, NativeModules, Modal, Text, TouchableOpacity, Platform } from 'react-native';
import SharedPrefs from '../Utils/SharedPrefs';
import { Icon } from "react-native-elements";
import * as TR from '../assets/tr.json';
import * as EN from '../assets/en.json';

var langObj;
if (Platform.OS === 'android')
    locale = NativeModules.I18nManager.localeIdentifier;
else
    locale = NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0];

if (locale.includes("en")) {
    langObj = EN;
} else {
    langObj = TR;
}

class DisarmAlert extends Component {

    componentDidMount() {
        this.getLanguage();
    }

    async getLanguage() {
        try {
            var locale = null;
            if (Platform.OS === 'android')
                locale = NativeModules.I18nManager.localeIdentifier;
            else
                locale = NativeModules.SettingsManager.settings.AppleLocale || NativeModules.SettingsManager.settings.AppleLanguages[0];

            const a = await SharedPrefs.getLang();

            if (a != undefined && a != null) {
                if (a == 1)
                    langObj = EN;
                else
                    langObj = TR;
            }
            else {
                if (locale.includes("en")) {
                    langObj = EN;
                }
                else {
                    langObj = TR;
                }
            }
        } catch (error) {
            if (locale.includes("en")) {
                langObj = EN;
            }
            else {
                langObj = TR;
            }
        }

        this.forceUpdate();
    }

    render() {
        const { show, close } = this.props;
        return (
            <Modal visible={show} animationType={"fade"} onRequestClose={() => close()} transparent={true}>
                <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'center', width: '100%', backgroundColor: "rgba(0,0,0,0.4)" }}>
                    <View style={styles.innerContainer}>
                        <Text style={{ margin: 10, fontSize: 20, color: "#cc1e18", fontWeight: 'bold' }} >
                            {langObj.faultSymbol}
                        </Text>
                        {this.renderError()}
                        <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 10, width: '80%', marginBottom: 10 }}  >
                            <TouchableOpacity style={styles.appButtonContainerCancel} onPress={() => close()}>
                                <Text style={styles.appButtonTextCancel}>{langObj.close}</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                </View>
            </Modal>
        );
    }

    renderError() {
        let errorIcons = [
            { logo: "volume-off", type: 'material-community' },
            { logo: "plug", type: 'font-awesome' },
            { logo: "battery-quarter", type: 'font-awesome' },
            { logo: "battery-alert", type: 'material-community' },
            { logo: "door-open", type: 'material-community' },
            { logo: "phone-off", type: 'material-community' },
            { logo: "keyboard-off", type: 'material-community' },
            { logo: "wifi-off", type: 'material-community' }
        ];

        let errorText = [langObj.faultSiren, langObj.faultElectricity, langObj.faultBattery,
        langObj.noBattery, langObj.centralDoorOpen, langObj.noPhoneLine, langObj.keypadError, langObj.jammerError];

        return errorIcons.map((data, index) => {
            if (1)
                return (
                    <View key={index} style={{ width: '100%' }} >
                        {index == 0 && <View style={{ height: 1, backgroundColor: 'gray', width: '100%' }} ></View>}
                        <View style={{ flexDirection: 'row', justifyContent: "space-between", width: '100%' }} >
                            <Icon
                                containerStyle={{ width: 40, alignSelf: 'center', margin: 5, marginLeft: 40 }}
                                name={data.logo}
                                type={data.type}
                                color={'#2c3e50'}
                                size={26}
                            />
                            <Text style={{ alignSelf: "center", marginRight: 40 }}>{errorText[index]}</Text>
                        </View>
                        <View style={{ height: 1, backgroundColor: 'gray', width: '100%' }} ></View>
                    </View>
                )
        });
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "space-around"
    },
    modalContainer: {
        flex: 1,
        backgroundColor: "white"
    },
    innerContainer: {
        marginLeft: 20,
        marginRight: 20,
        alignItems: "center",
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'gray',
        borderBottomWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 3,
    },
    appButtonContainerCancel: {
        alignItems: 'flex-end',
        elevation: 8,
        backgroundColor: "#DDDDDD",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginTop: 10,
        marginBottom: 10,
        justifyContent: 'center',
        width: '100%'
    },
    appButtonTextCancel: {
        fontSize: 14,
        color: "#c0392b",
        fontWeight: "bold",
        alignSelf: "center",
        textTransform: "uppercase"
    }
});

export default DisarmAlert;