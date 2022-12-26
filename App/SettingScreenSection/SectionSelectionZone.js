import React, { Component } from "react";
import { NativeModules, View, Alert, Text, Platform, BackHandler, ScrollView } from "react-native";
import RadioForm, { RadioButton, RadioButtonInput, RadioButtonLabel } from 'react-native-simple-radio-button';
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

var sections = [
    { label: "1", value: 0 },
    { label: "2", value: 1 },
    { label: "3", value: 2 },
    { label: "4", value: 3 }
];

@observer
class SectionSelectionZone extends Component {

    @observable zones = [];

    constructor(props) {
        super(props);
        makeObservable(this);
        this.state = ({
            selectedSections: []
        });
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
        this.getZonePart();
    }

    @action
    getZonePart() {
        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                ApiCall.getZonePart(global.deviceId).then((x) => {
                    if (x) {
                        if (x != undefined && x != null) {
                            this.zones = x;
                        } else {
                            this.zones = [];
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
                <View style={{ flexDirection: "row", margin: 5, alignSelf: "center", width: '100%', justifyContent: "space-between" }}>
                    <Text style={{ fontWeight: "bold", marginLeft: 20, color: 'black', fontSize: 18 }}>{langObj.zon + " " + (index + 1)}</Text>
                    <RadioForm style={{ marginRight: 20 }} formHorizontal={true}>
                        {sections.map((obj, i) => (
                            <RadioButton labelHorizontal={true} key={i} >
                                <RadioButtonInput
                                    obj={obj}
                                    index={i}
                                    borderWidth={1}
                                    isSelected={this.zones[index] === i}
                                    buttonInnerColor={'#cc1e18'}
                                    buttonOuterColor={"#cc1e18"}
                                    buttonSize={20}
                                    buttonOuterSize={25}
                                    buttonStyle={{}}
                                    buttonWrapStyle={{ marginLeft: 10 }}
                                    onPress={(value, index2) => {
                                        this.zones[index] = index2;
                                    }}
                                />
                                <RadioButtonLabel
                                    obj={obj}
                                    index={i}
                                    labelHorizontal={true}
                                    labelStyle={{ fontSize: 16, color: 'black' }}
                                    onPress={(value, index2) => {
                                        this.zones[index] = index2;
                                    }}
                                />
                            </RadioButton>
                        ))}
                    </RadioForm>
                </View>
                <View style={{ height: 2, width: '100%', backgroundColor: 'gainsboro', marginTop: 5 }}></View>
            </View>
        );
    }

    render() {
        return (
            <View>
                {(this.zones.length > 0) && <View>
                    <ScrollView style={{ marginTop: 5, backgroundColor: "white" }}>
                        {this.renderChild(0)}
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
                                        ApiCall.setZonePart(this.zones).then((x) => {
                                            if (x) {
                                                this.getZonePart();
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

export default SectionSelectionZone;