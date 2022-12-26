import React, { Component } from "react";
import { NativeModules, View, Text, Platform, BackHandler, ScrollView } from "react-native";
import BouncyCheckbox from "react-native-bouncy-checkbox";
import { CommonActions } from '@react-navigation/native';
import { observable, makeObservable, action } from "mobx";
import { observer } from "mobx-react";
import NetInfo from "@react-native-community/netinfo";
import { Button } from "react-native-elements";
import ApiService from '../Utils/ApiService';
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
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

@observer
class SectionSelectionTelephone extends Component {

    @observable telephones = [];

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
                name: 'SectionSelectionSettings'
            })
        );
        setTimeout(() => { }, 500);
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
        this.getLanguage();
        this.getTelephonePart();
    }

    @action
    getTelephonePart() {
        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                ApiCall.getTelPart(global.deviceId).then((x) => {
                    if (x) {
                        if (x != undefined && x != null) {
                            let flagTelephones = [];
                            for (let index = 0; index < x.length; index++) {
                                let base2 = (x[index]).toString(2);
                                base2 = new Array((5 - base2.length)).join("0") + base2;
                                base2 = base2.split("").reverse().join("");
                                flagTelephones.push(base2);
                            }
                            this.telephones = flagTelephones;
                        } else {
                            this.telephones = [];
                        }
                    } else {
                        this.props.navigation.dispatch(
                            CommonActions.navigate({
                                name: 'SettingsTab'
                            })
                        );
                    }
                });
            } else {
                Toast.show(langObj.internetConnFail, Toast.LONG);
                this.props.navigation.dispatch(
                    CommonActions.navigate({
                        name: 'SettingsTab'
                    })
                );
            }
        });
    }

    replaceAt(text, index, replacement) {
        return text.substr(0, index) + replacement + text.substr(index + replacement.length);
    }

    renderChild(index) {
        return (
            <View style={{ marginTop: 10, elevation: 5 }}>
                <View style={{ flexDirection: "row", alignSelf: "center", width: '100%', justifyContent: "space-between" }}>
                    <View>
                        <Text style={{ fontWeight: "bold", margin: 10, marginLeft: 20, color: 'black', fontSize: 18 }}>{langObj.phoneHeader + " " + index}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignSelf: "center", marginTop: 5, marginBottom: 5, justifyContent: "space-between" }}>
                        <Text style={{ marginRight: 5, color: 'black', fontSize: 16, fontWeight: "bold" }}>1</Text>
                        <BouncyCheckbox
                            fillColor="green"
                            unfillColor="#FFFFFF"
                            isChecked={(this.telephones[index - 1].charAt(0) == "1") ? true : false}
                            onPress={() => {
                                if ((this.telephones[index - 1].charAt(0) == "1"))
                                    this.telephones[index - 1] = this.replaceAt(this.telephones[index - 1], 0, "0");
                                else
                                    this.telephones[index - 1] = this.replaceAt(this.telephones[index - 1], 0, "1");
                            }}
                        />
                        <Text style={{ marginRight: 5, color: 'black', fontSize: 16, fontWeight: "bold" }}>2</Text>
                        <BouncyCheckbox
                            fillColor="green"
                            unfillColor="#FFFFFF"
                            isChecked={(this.telephones[index - 1].charAt(1) == "1") ? true : false}
                            onPress={() => {
                                if ((this.telephones[index - 1].charAt(1) == "1"))
                                    this.telephones[index - 1] = this.replaceAt(this.telephones[index - 1], 1, "0");
                                else
                                    this.telephones[index - 1] = this.replaceAt(this.telephones[index - 1], 1, "1");
                            }}
                        />
                        <Text style={{ marginRight: 5, color: 'black', fontSize: 16, fontWeight: "bold" }}>3</Text>
                        <BouncyCheckbox
                            fillColor="green"
                            unfillColor="#FFFFFF"
                            isChecked={(this.telephones[index - 1].charAt(2) == "1") ? true : false}
                            onPress={() => {
                                if ((this.telephones[index - 1].charAt(2) == "1"))
                                    this.telephones[index - 1] = this.replaceAt(this.telephones[index - 1], 2, "0");
                                else
                                    this.telephones[index - 1] = this.replaceAt(this.telephones[index - 1], 2, "1");
                            }}
                        />
                        <Text style={{ marginRight: 5, color: 'black', fontSize: 16, fontWeight: "bold" }}>4</Text>
                        <BouncyCheckbox
                            fillColor="green"
                            unfillColor="#FFFFFF"
                            isChecked={(this.telephones[index - 1].charAt(3) == "1") ? true : false}
                            onPress={() => {
                                if ((this.telephones[index - 1].charAt(3) == "1"))
                                    this.telephones[index - 1] = this.replaceAt(this.telephones[index - 1], 3, "0");
                                else
                                    this.telephones[index - 1] = this.replaceAt(this.telephones[index - 1], 3, "1");
                            }}
                        />
                    </View>
                </View>
                <View style={{ height: 2, width: '100%', backgroundColor: 'gainsboro', marginTop: 5 }} ></View>
            </View>
        );
    }

    render() {
        return (
            <View>
                {(this.telephones.length > 0) && <View>
                    <ScrollView style={{ marginTop: 5, backgroundColor: "white" }}>
                        {this.renderChild(1)}
                        {this.renderChild(2)}
                        {this.renderChild(3)}
                        {this.renderChild(4)}
                        {this.renderChild(5)}
                        {this.renderChild(6)}
                        {this.renderChild(7)}
                        {this.renderChild(8)}
                        {this.renderChild(9)}
                        {this.renderChild(10)}
                        {this.renderChild(11)}
                        {this.renderChild(12)}
                        {this.renderChild(13)}
                        {this.renderChild(14)}
                        {this.renderChild(15)}
                        {this.renderChild(16)}
                        {this.renderChild(17)}
                        {this.renderChild(18)}
                        {this.renderChild(19)}
                        {this.renderChild(20)}
                        {this.renderChild(21)}
                        {this.renderChild(22)}
                        {this.renderChild(23)}
                        {this.renderChild(24)}
                        {this.renderChild(25)}
                        {this.renderChild(26)}
                        {this.renderChild(27)}
                        {this.renderChild(28)}
                        {this.renderChild(29)}
                        {this.renderChild(30)}
                        {this.renderChild(31)}
                        {this.renderChild(32)}
                        {this.renderChild(33)}
                        {this.renderChild(34)}
                        {this.renderChild(35)}
                        {this.renderChild(36)}
                        {this.renderChild(37)}
                        {this.renderChild(38)}
                        {this.renderChild(39)}
                        {this.renderChild(40)}
                        <View style={{ height: 80 }} ></View>
                    </ScrollView>
                    <View style={{
                        position: "absolute", display: "flex", bottom: 0, right: 0,
                        left: 0, height: 80, borderColor: "red", borderTopWidth: 2, backgroundColor: "white"
                    }}>
                        <Button
                            borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginBottom: 20, marginTop: 20, marginLeft: 10, marginRight: 10 }}
                            title={langObj.submit} onPress={() => {
                                NetInfo.fetch().then(state => {
                                    if (state.isConnected) {
                                        let flagData = [];
                                        for (let index = 0; index < this.telephones.length; index++) {
                                            flagData.push(parseInt(this.telephones[index].split("").reverse().join(""), 2));
                                        }
                                        ApiCall.setTelPart(flagData).then((x) => {
                                            if (x) {
                                                this.getTelephonePart();
                                            }
                                        });
                                    }
                                    else { Toast.show(langObj.internetConnFail, Toast.LONG); }
                                });
                            }}
                        />
                    </View>
                </View>}
            </View>
        );
    }
}

export default SectionSelectionTelephone;