import React, { Component } from "react";
import { Text, NativeModules, View, BackHandler, Alert, Platform } from "react-native";
import { CommonActions } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";
import { observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import DeviceLogin from '../Component/DeviceLogin';
import { Button } from "react-native-elements";
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
import ApiService from '../Utils/ApiService';
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

class ResetAllSystem extends Component {

    @observable loading = false;
    @observable psd = !global.deviceLoggedin;

    constructor(props) {
        super(props);
        makeObservable(this);
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
                name: 'ResetDevice'
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
            <View style={{ justifyContent: 'space-between', flex: 1, backgroundColor: 'white' }} >
                <Text style={{ margin: 20, fontWeight: '400', fontSize: 20 }} >
                    {langObj.resetAllSystemText}
                </Text>
                <View style={{ marginTop: 10 }} >
                    <Button
                        borderRadius={4}
                        buttonStyle={{ backgroundColor: "#cc1e18", marginBottom: 20, marginLeft: 10, marginRight: 10 }}
                        title={langObj.resetAllSystem}
                        onPress={
                            () => {
                                Alert.alert(langObj.sure, '',
                                    [{
                                        text: langObj.reset, onPress: () => {
                                            NetInfo.fetch().then(state => {
                                                if (state.isConnected) {
                                                    this.loading = true;
                                                    ApiCall.resetDeviceNew(3).then((x) => {
                                                        this.loading = false;
                                                        if (x) Alert.alert(langObj.logInfo, langObj.success);
                                                        else Alert.alert(langObj.logErr2, langObj.fail);
                                                    }, y => {
                                                        setTimeout(() => {
                                                            this.loading = false;
                                                        }, 5000);
                                                    })
                                                }
                                                else
                                                    Toast.show(langObj.internetConnFail, Toast.LONG);
                                            });
                                        }
                                    },
                                    { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' }],
                                    { cancelable: false }
                                );
                            }}
                    />
                </View>
            </View>
        );
    }
}

export default ResetAllSystem;