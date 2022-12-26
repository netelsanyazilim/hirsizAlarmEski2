import React, { Component } from "react";
import { Text, NativeModules, View, BackHandler, Dimensions, Platform } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { CommonActions } from '@react-navigation/native';
import { action, makeObservable, observable } from "mobx";
import { observer } from "mobx-react";
import LeftIconButton from "./Component/LeftIconButton";
import QrScanner from "./Component/QrScanner";
import { Icon, Button } from "react-native-elements";
import SharedPrefs from './Utils/SharedPrefs';
import ApiService from './Utils/ApiService';
import NetInfo from "@react-native-community/netinfo";
import Toast from 'react-native-simple-toast';
import RNRestart from 'react-native-restart';
import * as TR from './assets/tr.json';
import * as EN from './assets/en.json';

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
class AddDevice extends Component {

    @observable deviceId = '';
    @observable deviceName = '';
    @observable user = null;
    @observable showQr = false;
    @observable addOperateStart = false;

    constructor(props) {
        super(props);
        makeObservable(this);
        this.getUser();
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
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

    onBackPress = async () => {
        this.props.navigation.dispatch(
            CommonActions.navigate({
                name: 'SettingsTab'
            })
        );
        setTimeout(() => { }, 500);
    }

    add() {
        if (this.deviceId != '' && this.deviceName != '') {
            if (this.addOperateStart != true) {
                this.addOperateStart = true;
                if ((this.deviceId.length == 20) || (this.deviceId.length == 8)) {
                    NetInfo.fetch().then(state => {
                        if (state.isConnected) {
                            let flagAddedNewDeviceID = this.deviceId;
                            if (flagAddedNewDeviceID.length == 8) {
                                flagAddedNewDeviceID = this.deviceId.substring(0, 6) + "000000000000" + this.deviceId.substring(6, 8);
                            }
                            ApiCall.addDevice(this.user.mail, this.user.token, flagAddedNewDeviceID, this.deviceName, () => { }).then((x) => {
                                if (x) {
                                    this.props.navigation.navigate("SettingsTab");
                                    this.addOperateStart = false;
                                    let flagDeviceIds = [];
                                    let flagDeviceNames = [];
                                    flagDeviceIds.push(flagAddedNewDeviceID);
                                    flagDeviceNames.push(this.deviceName);
                                    global.deviceId = flagAddedNewDeviceID;
                                    global.deviceName = this.deviceName;
                                    if (this.user !== undefined && this.user.token !== null) {
                                        SharedPrefs.saveloginData(this.user.mail, this.user.token, this.user.pass, this.user.name, flagDeviceIds, flagDeviceNames, this.user.notifsettings);
                                    }
                                    //RNRestart.Restart();
                                }
                                else {
                                    this.addOperateStart = false;
                                }
                            });
                        }
                        else {
                            Toast.show(langObj.internetConnFail, Toast.LONG);
                        }
                    });
                } else {
                    Toast.show(langObj.deviceNameOrDeviceIdNotValid, Toast.LONG);
                }
            }
            else {
                Toast.show(langObj.awaitingDevice, Toast.SHORT);
            }
        }
        else {
            Toast.show(langObj.validateFillAll, Toast.SHORT);
        }
    }

    async getUser() {
        this.user = await SharedPrefs.getlogindata();
        console.log(JSON.stringify(this.user));
    }

    @action
    goCamera() {
        this.showQr = true;
    }

    @action
    back() {
        this.showQr = false;
    }

    @action
    onResult(data) {
        this.showQr = false;
        this.deviceId = data;
    }

    @action
    onTextChangeDeviceId(t) {
        this.deviceId = t;
    }

    @action
    onTextChangeDeviceName(t) {
        this.deviceName = t
    }

    render() {
        return (
            <KeyboardAwareScrollView extraHeight={80} enableOnAndroid={false} style={{ flex: 1, backgroundColor: "white" }}>
                <QrScanner back={() => { this.back(); }} showQr={this.showQr} onResult={(data) => { this.onResult(data); }} />
                <View style={{ height: Dimensions.get('window').height * 0.8, }}>
                    <View style={{ flex: 0.4, justifyContent: 'space-between', alignItems: 'center', marginTop: 40, }}>
                        <View style={{
                            margin: 10, borderWidth: 1, borderRadius: 6, width: '75%',
                            borderColor: '#ddd', borderBottomWidth: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                            shadowOpacity: 0.8, shadowRadius: 10, elevation: 3, alignSelf: 'center', backgroundColor: 'white'
                        }} >
                            <Text style={{ color: '#30363b', fontSize: 25, fontWeight: 'bold', margin: 10 }} >{langObj.methods}</Text>
                            <Text style={{ margin: 10 }}  >
                                {langObj.addDeviceText}
                            </Text>
                        </View>
                    </View>
                    <View style={{ flex: 0.6, height: '100%', justifyContent: "space-between", alignItems: 'center', marginBottom: 50, marginTop: 20 }} >
                        <View style={{ flexDirection: 'row', marginLeft: 35 }} >
                            <LeftIconButton
                                iconname={langObj.inDeviceCode}
                                textColor={'black'}
                                placeholder=""
                                type={'ip'}
                                value={this.deviceId}
                                underlineColor={'rgba(0,0,0,0.4)'}
                                onTextChange={(t) => this.onTextChangeDeviceId(t)}
                                ref={(ref) => this.kod = ref}
                                onSubmitEditing={() => this.name.focus()}
                            />
                            <Icon
                                containerStyle={{ marginLeft: 10, marginRight: 5, width: 40, alignSelf: 'flex-end' }}
                                name="qrcode"
                                type="font-awesome"
                                color='#30363b'
                                size={50}
                                onPress={() => { this.goCamera(); }}
                            />
                        </View>
                        <LeftIconButton
                            iconname={langObj.inDeviceName}
                            textColor={'black'}
                            placeholder={langObj.deviceName}
                            type={'ip'}
                            underlineColor={'rgba(0,0,0,0.4)'}
                            onTextChange={(t) => this.onTextChangeDeviceName(t)}
                            ref={(ref) => this.name = ref}
                            onSubmitEditing={() => this.add()}
                            returnKeyType={'done'}
                        />
                        <View style={{ width: '50%' }}>
                            <Button borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", margin: 10 }} title={langObj.add} onPress={() => { this.add(); }} />
                        </View>
                    </View>
                </View>
            </KeyboardAwareScrollView>
        );
    }
}

export default AddDevice;