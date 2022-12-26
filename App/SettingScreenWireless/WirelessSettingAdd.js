import React, { Component } from "react";
import { NativeModules, StyleSheet, View, Text, TextInput, Platform, BackHandler } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CommonActions } from '@react-navigation/native';
import { observable, makeObservable, action } from "mobx";
import { observer } from "mobx-react";
import { Button } from "react-native-elements";
import ApiService from '../Utils/ApiService';
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
import * as TR from '../assets/tr.json';
import * as EN from '../assets/en.json';

var ApiCall = new ApiService();
var testIntervalID = null;

let enable = false;

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


function click() {
    if (!enable) {
        enable = true;
    } else {
        enable = false;
    }
}

@observer
class WirelessSettingAdd extends Component {

    @observable timer = 58;
    @observable showTimer = false;

    constructor(props) {
        super(props);
        makeObservable(this);
        this.state = { 
            zoneNumber: ""
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
        if ((this.timer != 60) && (this.timer != 0) && (this.timer % 3 == 0)) {
            clearInterval(testIntervalID);
        }

        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    }

    onBackPress = async () => {
        if ((this.timer != 60) && (this.timer != 0) && (this.timer % 3 == 0)) {
            clearInterval(testIntervalID);
        }

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

    sendRfListen() {
        ApiCall.startRFListen(this.state.zoneNumber).then(() => {
            console.log("Start RF")
            this.startCountdown();
        });
    }

    @action
    startCountdown() {
        testIntervalID = setInterval(() => {
            this.showTimer = true;
            this.timer = this.timer - 1;

            if ((this.timer != 60) && (this.timer != 0) && (this.timer % 3 == 0)) {
                ApiCall.rfAddStatusCheck().then((x) => {
                    if (x) {
                        if (x.data[3] == 2) {
                            this.timer = 58;
                            this.showTimer = false;
                            Toast.show(langObj.moduleAdded, Toast.SHORT);
                            clearInterval(testIntervalID);

                            this.props.navigation.dispatch(
                                CommonActions.navigate({
                                    name: 'WirelessSettings'
                                })
                            );
                        }
                    }
                });
            }

            if (this.timer == 0) {
                this.timer = 58;
                this.showTimer = false;
                if (testIntervalID != undefined && testIntervalID != null) {
                    Toast.show(langObj.moduleCantAdded, Toast.SHORT);
                    clearInterval(testIntervalID);
                }
            }
        }, 1000);
    }

    render() {
        return (
            <KeyboardAwareScrollView extraHeight={140} enableOnAndroid={false} style={{ flex: 1, backgroundColor: "white" }}>
                <View style={{ flex: 1, marginTop: 10, alignItems: 'center' }} >
                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <Text style={{ fontSize: 16, textAlign: 'center', backgroundColor: 'transparent', fontWeight: 'bold', color: 'gray', marginBottom: 20 }}>
                            {langObj.addSensorToZone}
                        </Text>
                        <TextInput style={styles.textInput2}
                            textAlign={'center'}
                            autoCapitalize={"none"}
                            autoCorrect={false}
                            value={this.state.zoneNumber.toString()}
                            onChangeText={(text) => {
                                const parsedQty = Number.parseInt(text);
                                if (!Number.isNaN(parsedQty) && text != "" && text != null) {
                                    if ((parsedQty < 33) && (parsedQty > 0)) {
                                        this.setState({ zoneNumber: parsedQty.toString() });
                                    } else {
                                        this.setState({ zoneNumber: "" });
                                        Toast.show(langObj.minAndMaxValue4, Toast.LONG);
                                    }
                                } else {
                                    this.setState({ zoneNumber: "" });
                                }
                            }}
                            maxLength={2}
                            placeholder={langObj.zoneNumber}
                            keyboardType={'numeric'}
                            underlineColorAndroid={"black"}
                            placeholderTextColor={"rgba(0,0,0,0.4)"}
                            selectionColor={"black"}
                            returnKeyType={'done'}
                        />
                        {this.showTimer && <Text style={{ fontSize: 20, textAlign: 'center', backgroundColor: 'transparent', fontWeight: 'bold', color: 'green', marginTop: 10 }}>
                            {this.timer}
                        </Text>}
                        <Text style={{ fontSize: 10, textAlign: 'center', backgroundColor: 'transparent', fontWeight: 'bold', color: 'gray', marginTop: 10 }}>
                            {langObj.addSensorToZoneSub}
                        </Text>
                        <Button 
                            disabled={enable}
                            borderRadius={4}
                            buttonStyle={{ backgroundColor: "#cc1e18", marginRight: 10, marginLeft: 10, width: 150, marginTop: 10 }}
                            fontWeight='bold'
                            title={langObj.addSensor}
                            onPress={() => {
                                if (this.state.zoneNumber != null && this.state.zoneNumber != ""){
                                    click();
                                    this.forceUpdate();
                                    this.sendRfListen();

                                    setTimeout(() => {
                                        click();
                                        this.forceUpdate();
                                    }, 66000);
                                }
                                    
                                else
                                    Toast.show(langObj.cantBeEmpty, Toast.LONG);
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
                marginTop: 5
            }
        }),
    }
});

export default WirelessSettingAdd;