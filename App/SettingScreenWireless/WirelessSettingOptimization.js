import React, { Component } from "react";
import { NativeModules, StyleSheet, View, Text, Platform, BackHandler } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CommonActions } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";
import { Button } from "react-native-elements";
import ApiService from '../Utils/ApiService';
import SharedPrefs from '../Utils/SharedPrefs';
import * as TR from '../assets/tr.json';
import * as EN from '../assets/en.json';

var ApiCall = new ApiService();

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

class WirelessSettingOptimization extends Component {

    constructor(props) {
        super(props);
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

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    }

    onBackPress = async () => {
        this.props.navigation.dispatch(
            CommonActions.navigate({
                name: 'WirelessSettings'
            })
        );
        setTimeout(() => { }, 500);
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
        this.getLanguage();
    }

    render() {
        return (
            <KeyboardAwareScrollView extraHeight={140} enableOnAndroid={false} style={{ flex: 1, backgroundColor: "white" }}>
                <View style={{ flex: 1, marginTop: 10, alignItems: 'center' }} >
                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, textAlign: 'center', backgroundColor: 'transparent', fontWeight: 'bold', color: 'gray', marginBottom: 10 }}>
                            {langObj.rfOptimizationSub}
                        </Text>
                        <Button borderRadius={4}
                            buttonStyle={{ backgroundColor: "#cc1e18", marginRight: 10, marginLeft: 10, width: 150, marginTop: 10 }}
                            fontWeight='bold'
                            title={langObj.rfOptimization}
                            onPress={() => {
                                ApiCall.startRfOptimize();
                            }} />
                        <View style={{ marginTop: 20, height: 2, backgroundColor: 'gainsboro', width: '100%' }} ></View>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        );
    }
}

const styles = StyleSheet.create({
    textInput: {
        margin: 5,
        width: 150,
        fontWeight: '600',
        alignSelf: 'center',
        ...Platform.select({
            ios: {
                marginBottom: 20,
                marginTop: 20,
                borderBottomWidth: 2,
                borderBottomColor: "gray"
            },
            android: {
                marginBottom: 0,
                marginTop: 0
            }
        }),
    },
    textInput2: {
        margin: 15,
        width: 150,
        fontWeight: '600',
        alignSelf: 'center',
        ...Platform.select({
            ios: {
                marginBottom: 20,
                marginTop: 20,
                borderBottomWidth: 2,
                borderBottomColor: "gray"
            },
            android: {
                marginBottom: 0,
                marginTop: 5
            }
        }),
    }
});

export default WirelessSettingOptimization;