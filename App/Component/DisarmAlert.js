import React, { Component } from 'react';
import {
    StyleSheet, View, NativeModules, Modal, Platform,
    Text, TouchableOpacity, TouchableWithoutFeedback
} from 'react-native';
import SharedPrefs from '../Utils/SharedPrefs';
import * as TR from '../assets/tr.json';
import * as EN from '../assets/en.json';

import Toast from 'react-native-simple-toast';

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

export default class DisarmAlert extends Component {

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
        const { show, close, silent, panic, normal } = this.props;
        return (
            <Modal visible={show} animationType={"fade"} onRequestClose={() => { close() }} transparent={true}>
                <TouchableWithoutFeedback onPress={() => { close() }}>
                    <View style={{
                        flex: 1, alignSelf: 'flex-end', justifyContent: 'center',
                        width: '100%',
                        backgroundColor: "rgba(0,0,0,0.4)"
                    }}>
                        <View style={styles.innerContainer}>
                            <Text style={{ margin: 10, fontSize: 20, color: "#cc1e18", fontWeight: 'bold' }} >
                                {langObj.disableAlert}
                            </Text>
                            <Text style={{ margin: 10, }}>
                                {langObj.disableAlertText}
                            </Text>
                            <View style={{ flexDirection: 'row', justifyContent: 'space-between', width: '90%', marginTop: 10, marginBottom: 10 }}  >
                                <TouchableOpacity style={styles.appButtonContainerSilent} onPress={() => silent()}>
                                    <Text style={styles.appButtonText}>{langObj.silent}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.appButtonContainerPanic} onPress={() => panic()}>
                                    <Text style={styles.appButtonText}>{langObj.disableAlertPanic}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.appButtonContainerNormal} onPress={() => normal()}>
                                    <Text style={styles.appButtonText}>{langObj.normal}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity style={styles.appButtonContainerCancel} onPress={() => close()}>
                                    <Text style={styles.appButtonTextCancel}>{langObj.cancel}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
            </Modal>
        )
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        width: '100%',
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "space-around"
    },
    modalContainer: {
        flex: 1,
        width: '100%',
        backgroundColor: "white"
    },
    innerContainer: {
        marginLeft: 25,
        marginRight: 25,
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
    appButtonContainerSilent: {
        elevation: 8,
        backgroundColor: "#f1c40f",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 7
    },
    appButtonContainerPanic: {
        elevation: 8,
        marginLeft: 5,
        backgroundColor: "#c0392b",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 7
    },
    appButtonContainerNormal: {
        elevation: 8,
        marginLeft: 5,
        backgroundColor: "#009688",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 7
    },
    appButtonContainerCancel: {
        elevation: 8,
        marginLeft: 5,
        marginRight: 5,
        backgroundColor: "#DDDDDD",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 7
    },
    appButtonText: {
        fontSize: 14,
        color: "#fff",
        fontWeight: "bold",
        alignSelf: "center",
        textTransform: "uppercase"
    },
    appButtonTextCancel: {
        fontSize: 14,
        color: "#c0392b",
        fontWeight: "bold",
        alignSelf: "center",
        textTransform: "uppercase"
    }
});