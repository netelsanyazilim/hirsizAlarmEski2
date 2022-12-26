import React, { Component } from "react";
import { Text, NativeModules, View, BackHandler, Alert, FlatList, Platform } from "react-native";
import { CommonActions } from '@react-navigation/native';
import { action, observable, makeObservable } from "mobx";
import NetInfo from "@react-native-community/netinfo";
import { observer } from "mobx-react";
import { Icon } from "react-native-elements";
import ApiService from '../Utils/ApiService';
import DeviceLogin from '../Component/DeviceLogin';
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
class DeviceUsers extends Component {

    @observable arr = [];
    @observable loading = false;
    @observable user = {};
    @observable psd = !global.deviceLoggedin;

    constructor(props) {
        super(props);
        makeObservable(this);
        this.getCurrentUser();
        this.loading = true;
        this.getData();
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

    @action
    async getCurrentUser() {
        this.user = await SharedPrefs.getlogindata();
    }

    @action
    getData() {
        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                ApiCall.getDeviceUsers().then((x) => {
                    this.loading = false;
                    if (x) { this.arr = x.users; }
                    else Alert.alert(
                        langObj.connErr,
                        langObj.userLoadErr,
                        [
                            { text: langObj.tryAgain, onPress: () => this.getData() },
                            { text: langObj.cancel, onPress: () => this.props.navigation.goBack() },
                        ],
                        { cancelable: false }
                    )
                }, y => {
                    setTimeout(() => {
                        this.loading = false;
                    }, 5000);
                });
            }
            else
                Toast.show(langObj.internetConnFail, Toast.LONG);
        });
    }

    componentWillUnmount() {
        BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
    }

    onBackPress = async () => {
        this.props.navigation.dispatch(
            CommonActions.navigate({
                name: 'SettingsTab'
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
                <DeviceLogin loading={this.psd} close={() => { this.psd = false }} back={() => { this.props.navigation.goBack(); }} />
                {this.renderUser()}
            </View>
        );
    }

    renderUser() {
        return (
            <FlatList
                data={this.arr}
                renderItem={this._renderItem}
                numColumns={"1"}
                keyExtractor={(item, index) => index}
            />
        );
    }

    _renderItem = ({ item, index }) => {
        return (
            <View style={{ justifyContent: 'space-between', alignItems: 'center', marginTop: 5 }}>
                <View style={{
                    margin: 10,
                    borderWidth: 1,
                    borderRadius: 6,
                    width: '95%',
                    borderColor: '#ddd',
                    borderBottomWidth: 0,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.8,
                    shadowRadius: 10,
                    elevation: 3,
                    alignSelf: 'center',
                    backgroundColor: 'white'
                }} >
                    <View style={{ flex: 1, justifyContent: 'space-between', flexDirection: 'row' }} >
                        <View style={{ flexDirection: 'row', width: '100%' }} >
                            <Icon containerStyle={{ marginLeft: 10, flex: 0.2, marginTop: 7 }} name={"mail"} color="#cc1e18" size={20} />
                            <Text style={{ margin: 10, fontSize: 11, flex: 0.6 }} >{item}</Text>
                            {this.user.mail != item && <Icon
                                containerStyle={{ marginLeft: 10, flex: 0.2, marginTop: 7 }}
                                name={"delete"}
                                onPress={() => {
                                    Alert.alert(
                                        langObj.sure,
                                        '',
                                        [{
                                            text: langObj.delete, onPress: () => {
                                                NetInfo.fetch().then(state => {
                                                    if (state.isConnected) {
                                                        ApiCall.removeDevice(item, this.user.token, this.user.deviceId).then((x) => {
                                                            if (x) {
                                                                Toast.show(langObj.userRemoved, Toast.SHORT);
                                                                this.getData();
                                                            }
                                                            else {
                                                                Toast.show(langObj.userRemoveFail, Toast.SHORT);
                                                            }
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
                                color="#cc1e18"
                                size={20}
                            />}
                        </View>
                    </View>
                </View>
            </View>
        )
    };
}

export default DeviceUsers;