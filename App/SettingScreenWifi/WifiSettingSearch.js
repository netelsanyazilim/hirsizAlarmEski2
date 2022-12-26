import React, { Component } from "react";
import {
    NativeModules, StyleSheet, View, Text, TextInput,
    Platform, BackHandler, TouchableOpacity, Modal
} from "react-native";
import { CommonActions } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";
import ApiService from '../Utils/ApiService';
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
import { Button } from "react-native-elements";
import { observable, makeObservable, action } from "mobx";
import { observer } from "mobx-react";
import Spinner from "react-native-spinkit";
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

//---------------------------------------------

//BU SAYFA WifiSettings SAYFASI ALTINA TAŞINDI!

//---------------------------------------------

@observer
class WifiSettingSearch extends Component {

    @observable visibleSpinner = true;
    @observable networks = [];

    constructor(props) {
        super(props);
        makeObservable(this);
        this.state = {
            showPasswordModal: false,
            password: "",
            selectedWifi: ""
        };
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
                name: 'WifiSettings'
            })
        );
        setTimeout(() => { }, 500);
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
        this.getLanguage();
        this.getWifiNetworks();
    }

    handlePassword = (text) => {
        this.setState({ password: text })
    }

    decimalToUTF8(stringArray) {
        let flagName = "";
        let stringDecimalArray = stringArray.split(",");
        if (stringDecimalArray[0] != "0") {
            for (let index = 0; index < stringDecimalArray.length; index++) {
                if (parseInt(stringDecimalArray[index]) != 0) {
                    flagName += String.fromCharCode(parseInt(stringDecimalArray[index]));
                } else
                    break;
            }
        } else
            flagName = "";

        return flagName;
    }

    @action
    getWifiNetworks() {
        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                this.visibleSpinner = true;
                ApiCall.searchWifiNetworks().then(() => {
                    setTimeout(() =>
                        ApiCall.getWifiNetworks().then((x) => {
                            console.log("x " + x);
                            if (x) {
                                if (x.wifiCount != undefined && x.wifiCount != null) {
                                    let flagWifiNetworks = [];
                                    for (let index = 0; index < x.wifiCount; index++) {
                                        let flagWifiName = "";
                                        flagWifiName = this.decimalToUTF8(x.wifiNetworks[index].wifiName);
                                        flagWifiNetworks.push({ label: flagWifiName, index: index, signalQuality: x.wifiNetworks[index].signalQuality });
                                    }

                                    this.networks = flagWifiNetworks;
                                    this.visibleSpinner = false;
                                } else {
                                    this.networks = [];
                                    this.visibleSpinner = false;
                                    Toast.show(langObj.cantFindWifi, Toast.LONG);
                                }
                            }
                            else {
                                this.networks = [];
                                this.visibleSpinner = false;
                                Toast.show(langObj.cantFindWifi, Toast.LONG);
                            }
                        }), 4000);
                });
            }
            else {
                this.networks = [];
                this.visibleSpinner = true;
                Toast.show(langObj.internetConnFail, Toast.LONG);
            }
        });
    }

    setWifiSettings() {
        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                ApiCall.setWifiSettings(this.state.selectedWifi, this.state.password).then(() => {
                    this.props.navigation.dispatch(
                        CommonActions.navigate({
                            name: 'WifiSettings'
                        })
                    );
                    setTimeout(() => { }, 500);
                });
            }
            else
                Toast.show(langObj.internetConnFail, Toast.LONG);
        });
    }

    render() {
        const wifiListRender = this.networks.map((data) => {
            return (
                <TouchableOpacity style={{ marginTop: 10, elevation: 5 }}
                    onPress={() => {
                        this.setState({ selectedWifi: data.label, showPasswordModal: true });
                    }}>
                    <View style={{ flexDirection: "row", alignSelf: "center", width: '100%', justifyContent: "space-between" }}>
                        <Text style={{ fontWeight: "bold", margin: 10, color: 'black', fontSize: 18 }}>{data.label + " - %" + data.signalQuality}</Text>
                    </View>
                    <View style={{ height: 2, width: '100%', backgroundColor: 'gainsboro', marginTop: 5 }} ></View>
                </TouchableOpacity>
            )
        });

        return (
            <View style={{ backgroundColor: 'white', flex: 1 }}>
                {this.visibleSpinner &&
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#ffa000" }}>
                        <Spinner size={100} type={'Pulse'} color={"#FFFFFF"} />
                        <Text style={{ marginTop: 10, color: "white" }}>{langObj.searchWifi}</Text>
                    </View>
                }

                {!this.visibleSpinner && (this.networks.length > 0) && <View style={{ backgroundColor: 'white', flex: 1 }}>
                    <View style={{ height: 2, width: '100%', backgroundColor: 'gainsboro' }} ></View>
                    {wifiListRender}

                    <Modal visible={this.state.showPasswordModal} animationType={"fade"}
                        onRequestClose={() => {
                            this.setState({ showPasswordModal: false })
                        }} transparent={true}>
                        <View style={{ flex: 1, justifyContent: "center", alignItems: "center", marginTop: 22 }}>
                            <View style={{
                                margin: 50, backgroundColor: "white", borderRadius: 20, padding: 20, paddingTop: 10, alignItems: "center",
                                shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.25, shadowRadius: 4, elevation: 5
                            }}>
                                <TextInput style={styles.input}
                                    placeholderTextColor={"rgba(0,0,0,0.4)"}
                                    selectionColor={"black"}
                                    onChangeText={this.handlePassword}
                                    value={this.state.password}
                                    placeholder={langObj.inPassword}
                                    secureTextEntry={true} />
                                <View style={{ flexDirection: 'row', marginTop: 10 }}>
                                    <TouchableOpacity style={{ elevation: 8, backgroundColor: "#d5d8dc", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}
                                        onPress={() => {
                                            this.setState({
                                                showPasswordModal: false,
                                                password: ""
                                            })
                                        }}>
                                        <Text style={{ fontSize: 14, backgroundColor: 'transparent', fontWeight: 'bold', color: 'black', alignSelf: "center", textTransform: "uppercase" }}>{langObj.close}</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity style={{ marginLeft: 20, elevation: 8, backgroundColor: "#009688", borderRadius: 10, paddingVertical: 10, paddingHorizontal: 12 }}
                                        onPress={() => {
                                            if (this.state.password != "") {
                                                this.setWifiSettings();
                                            } else Toast.show(langObj.cantBeEmpty, Toast.LONG);
                                        }}>
                                        <Text style={{ fontSize: 14, color: "#fff", backgroundColor: 'transparent', fontWeight: 'bold', alignSelf: "center", textTransform: "uppercase" }}>{langObj.connect}</Text>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
                }

                {!this.visibleSpinner && (this.networks.length == 0) &&
                    <View style={{ flexDirection: 'row', justifyContent: 'center', marginBottom: 10, marginTop: 10 }}>
                        <View style={{
                            borderWidth: 1, borderRadius: 6, width: '90%', alignItems: 'center',
                            justifyContent: 'space-between', borderBottomWidth: 0,
                            backgroundColor: 'gray', borderColor: 'gray'
                        }} >
                            <Text style={{ color: 'white', fontSize: 18, fontWeight: "bold", marginTop: 20, marginBottom: 15 }}>
                                {langObj.cantFindWifi}</Text>
                            <Button borderRadius={4}
                                buttonStyle={{ backgroundColor: "green", width: 200, marginTop: 10, marginBottom: 10 }}
                                fontWeight='bold' title={langObj.searchWifiAgain}
                                onPress={() => {
                                    this.getWifiNetworks();
                                }} />
                        </View>
                    </View>
                }
            </View>
        );
    }
}

const styles = StyleSheet.create({
    input: {
        height: 40,
        margin: 12,
        padding: 10,
        width: 200
    }
});

export default WifiSettingSearch;