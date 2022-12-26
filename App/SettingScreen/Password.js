import React, { Component } from "react";
import { NativeModules, StyleSheet, View, TextInput, Platform, BackHandler, ScrollView } from "react-native";
import { CommonActions } from '@react-navigation/native';
import { action, observable, makeObservable } from "mobx";
import NetInfo from "@react-native-community/netinfo";
import { observer } from "mobx-react";
import { Button } from "react-native-elements";
import DeviceLogin from '../Component/DeviceLogin';
import ApiService from '../Utils/ApiService';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
import OptItem from "../Component/OptItem";
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
class Password extends Component {

    @observable loading = false;
    @observable psd = !global.deviceLoggedin;
    @observable loadingRetry = false;
    @observable passData = null;
    @observable name = 0;
    @observable k2sifresi = 0;
    @observable k3sifresi = 0;
    @observable k4sifresi = 0;
    @observable k5sifresi = 0;
    @observable sessizsifresi = 0;
    @observable paniksifresi = 0;
    @observable mastersifresi = 0;

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
                name: 'SettingsTab'
            })
        );
        setTimeout(() => { }, 500);
    }

    @action
    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
        this.getLanguage();
        this.psd = !global.deviceLoggedin;
        if (global.deviceLoggedin !== undefined)
            if (global.deviceLoggedin)
                this.getAllPass();
    }

    @action
    async getAllPass() {
        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                this.loading = true;
                ApiCall.getAllPass().then((x) => {
                    if (x) {
                        this.loading = false;
                        this.passData = x;
                    }
                    //TODO: Buradaki ifade değişmeli; bildirim değil, şifreler çekilemedi. Kullanıcıya ne yansıtılmalı?
                    else {
                        //     Alert.alert(
                        //         langObj.connErr, langObj.notifLoadErr,
                        //         [{ text: langObj.tryAgain, onPress: () => this.getAllPass() }, { text: langObj.cancel, onPress: () => this.props.navigation.goBack() }],
                        //         { cancelable: false }
                        //     );
                        console.log("Şifreler getirilemedi.");
                    }
                });
            }
            else
                Toast.show(langObj.internetConnFail, Toast.LONG);
        });
    }

    @action
    onChangePassText(whichOne, text) {
        if (whichOne === "name")
            this.name = text;
        else if (whichOne === "k2sifresi")
            this.k2sifresi = text;
        else if (whichOne === "k3sifresi")
            this.k3sifresi = text;
        else if (whichOne === "k4sifresi")
            this.k4sifresi = text;
        else if (whichOne === "k5sifresi")
            this.k5sifresi = text;
        else if (whichOne === "sessizsifresi")
            this.sessizsifresi = text;
        else if (whichOne === "paniksifresi")
            this.paniksifresi = text;
        else if (whichOne === "mastersifresi")
            this.mastersifresi = text;
    }

    render() {
        let flagDeviceId = global.deviceId;
        let result = flagDeviceId.substring(10).substring(0, 8);
        if (result == "00000000") flagDeviceId = flagDeviceId.substring(0, 6) + flagDeviceId.substring(18);

        if (result == "00000000") {
            return (
                <ScrollView style={{ backgroundColor: 'white' }}>
                    <DeviceLogin loading={this.psd} close={() => { this.psd = false }} back={() => { this.props.navigation.goBack(); }} />
                    <View style={{ flex: 1, marginTop: 10 }} >
                        <OptItem disabled={false} iconname={"admin-panel-settings"} title={langObj.deviceMasterPassword} subtitle={langObj.changeDeviceMasterPassword}
                            onPress={() => {
                                if (global.statusData != undefined)
                                    this.props.navigation.navigate("DeviceMasterPassword");
                            }} />
                        <OptItem disabled={false} iconname={"person"} title={langObj.userPassword} subtitle={langObj.changeUserPassword}
                            onPress={() => {
                                if (global.statusData != undefined)
                                    this.props.navigation.navigate("UserPassword");
                            }} />
                        <OptItem disabled={false} iconname={"notification-important"} title={langObj.sectionPanicPassword} subtitle={langObj.changeSectionPanicPassword}
                            onPress={() => {
                                if (global.statusData != undefined)
                                    this.props.navigation.navigate("SectionPanicPassword");
                            }} />
                        <OptItem disabled={false} iconname={"notifications-off"} title={langObj.sectionSilentPassword} subtitle={langObj.changeSectionSilentPassword}
                            onPress={() => {
                                if (global.statusData != undefined)
                                    this.props.navigation.navigate("SectionSilentPassword");
                            }} />
                        {/*<OptItem disabled={false} iconname={"miscellaneous-services"} title={langObj.sectionMasterPassword} subtitle={langObj.changeSectionMasterPassword}
                            onPress={() => {
                                if (global.statusData != undefined)
                                    this.props.navigation.navigate("SectionMasterPassword");
                            }} />*/}
                        <OptItem disabled={false} iconname={"laptop-chromebook"} title={langObj.pcRemotePassword} subtitle={langObj.changePCRemotePassword}
                            onPress={() => {
                                if (global.statusData != undefined)
                                    this.props.navigation.navigate("PCRemotePassword");
                            }} />
                    </View>
                </ScrollView>
            );
        }
        else {
            return (
                <KeyboardAwareScrollView extraHeight={140} enableOnAndroid={false} style={{ flex: 1, backgroundColor: "white" }}>
                    <View style={{ flex: 1, marginTop: 10, alignItems: 'center' }} >
                        <DeviceLogin loading={this.psd} close={() => { this.psd = false; this.getAllPass() }} back={() => { this.props.navigation.goBack(); }} />
                        <View style={{ width: '100%' }}>
                            <TextInput style={styles.textInput}
                                textAlign={'center'}
                                autoCapitalize={"none"}
                                autoCorrect={false}
                                value={this.name}
                                onChangeText={(text) => this.onChangePassText("name", text)}
                                maxLength={4}
                                placeholder={langObj.pass1}
                                keyboardType={'numeric'}
                                underlineColorAndroid={"black"}
                                placeholderTextColor={"rgba(0,0,0,0.4)"}
                                selectionColor={"black"}
                                returnKeyType={'done'}
                                ref={(ref) => this.k1 = ref}
                                onSubmitEditing={() => this.k2.focus()}
                            />
                            <Button borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginRight: 10, marginLeft: 10 }} fontWeight='bold' title={langObj.pass1Text}
                                onPress={() => {
                                    this.passData.data.kullanıcı1sifresi = this.name;
                                    if (this.name.length > 3) {
                                        NetInfo.fetch().then(state => {
                                            if (state.isConnected) {
                                                ApiCall.setAllPass(this.passData).then((x) => {
                                                    if (x) {
                                                        ApiCall.getStatus(global.deviceId);
                                                    }
                                                    else
                                                        console.log('şifre güncelleme başarısız ');
                                                });
                                            }
                                            else
                                                Toast.show(langObj.internetConnFail, Toast.LONG);
                                        });
                                    }
                                }} />
                        </View>
                        <View style={{ marginTop: 10, height: 2, backgroundColor: 'gainsboro', width: '100%' }} ></View>
                        <View style={{ width: '100%' }}>
                            <TextInput
                                style={styles.textInput}
                                textAlign={'center'}
                                autoCapitalize={"none"}
                                autoCorrect={false}
                                value={this.k2sifresi}
                                onChangeText={(text) => this.onChangePassText("k2sifresi", text)}
                                maxLength={4}
                                placeholder={langObj.pass2}
                                keyboardType={'numeric'}
                                underlineColorAndroid={"black"}
                                placeholderTextColor={"rgba(0,0,0,0.4)"}
                                selectionColor={"black"}
                                returnKeyType={'done'}
                                ref={(ref) => this.k2 = ref}
                                onSubmitEditing={() => this.k3.focus()}
                            />
                            <Button borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginRight: 10, marginLeft: 10 }} fontWeight='bold' title={langObj.pass2Text}
                                onPress={() => {
                                    this.passData.data.kullanıcı2sifresi = this.k2sifresi;
                                    if (this.k2sifresi.length > 3) {
                                        NetInfo.fetch().then(state => {
                                            if (state.isConnected) {
                                                ApiCall.setAllPass(this.passData).then((x) => {
                                                    if (x) {
                                                        ApiCall.getStatus(global.deviceId);
                                                    }
                                                    else
                                                        console.log('şifre güncelleme başarısız ')
                                                });
                                            }
                                            else
                                                Toast.show(langObj.internetConnFail, Toast.LONG);
                                        });
                                    }
                                }} />
                        </View>
                        <View style={{ marginTop: 10, height: 2, backgroundColor: 'gainsboro', width: '100%' }} ></View>
                        <View style={{ width: '100%' }}>
                            <TextInput
                                style={styles.textInput}
                                textAlign={'center'}
                                autoCapitalize={"none"}
                                autoCorrect={false}
                                value={this.k3sifresi}
                                onChangeText={(text) => this.onChangePassText("k3sifresi", text)}
                                maxLength={4}
                                placeholder={langObj.pass3}
                                keyboardType={'numeric'}
                                underlineColorAndroid={"black"}
                                placeholderTextColor={"rgba(0,0,0,0.4)"}
                                selectionColor={"black"}
                                returnKeyType={'done'}
                                ref={(ref) => this.k3 = ref}
                                onSubmitEditing={() => this.k4.focus()}
                            />
                            <Button borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginRight: 10, marginLeft: 10 }} fontWeight='bold' title={langObj.pass3Text}
                                onPress={() => {
                                    this.passData.data.kullanıcı3sifresi = this.k3sifresi;
                                    if (this.k3sifresi.length > 3) {
                                        NetInfo.fetch().then(state => {
                                            if (state.isConnected)
                                                ApiCall.setAllPass(this.passData).then((x) => {
                                                    if (x) {
                                                        ApiCall.getStatus(global.deviceId);
                                                    }
                                                    else
                                                        console.log('şifre güncelleme başarısız ')
                                                });
                                            else
                                                Toast.show(langObj.internetConnFail, Toast.LONG);
                                        });
                                    }
                                }} />
                        </View>
                        <View style={{ marginTop: 10, height: 2, backgroundColor: 'gainsboro', width: '100%' }} ></View>
                        <View style={{ width: '100%' }}>
                            <TextInput style={styles.textInput}
                                textAlign={'center'}
                                autoCapitalize={"none"}
                                autoCorrect={false}
                                value={this.k4sifresi}
                                onChangeText={(text) => this.onChangePassText("k4sifresi", text)}
                                maxLength={4}
                                placeholder={langObj.pass4}
                                keyboardType={'numeric'}
                                underlineColorAndroid={"black"}
                                placeholderTextColor={"rgba(0,0,0,0.4)"}
                                selectionColor={"black"}
                                returnKeyType={'done'}
                                ref={(ref) => this.k4 = ref}
                                onSubmitEditing={() => this.k5.focus()}
                            />
                            <Button borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginRight: 10, marginLeft: 10 }} fontWeight='bold' title={langObj.pass4Text}
                                onPress={() => {
                                    this.passData.data.kullanıcı4sifresi = this.k4sifresi;
                                    if (this.k4sifresi.length > 3)
                                        ApiCall.setAllPass(this.passData).then((x) => {
                                            if (x) {
                                                ApiCall.getStatus(global.deviceId);
                                            }
                                            else
                                                console.log('şifre güncelleme başarısız ')
                                        })
                                }} />
                        </View>
                        <View style={{ marginTop: 10, height: 2, backgroundColor: 'gainsboro', width: '100%' }} ></View>
                        <View style={{ width: '100%' }}>
                            <TextInput style={styles.textInput}
                                textAlign={'center'}
                                autoCapitalize={"none"}
                                autoCorrect={false}
                                value={this.k5sifresi}
                                onChangeText={(text) => this.onChangePassText("k5sifresi", text)}
                                maxLength={4}
                                placeholder={langObj.pass5}
                                keyboardType={'numeric'}
                                underlineColorAndroid={"black"}
                                placeholderTextColor={"rgba(0,0,0,0.4)"}
                                selectionColor={"black"}
                                returnKeyType={'done'}
                                ref={(ref) => this.k5 = ref}
                                onSubmitEditing={() => this.ks.focus()}
                            />
                            <Button borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginRight: 10, marginLeft: 10 }} fontWeight='bold' title={langObj.pass5Text}
                                onPress={() => {
                                    this.passData.data.kullanıcı5sifresi = this.k5sifresi;
                                    if (this.k5sifresi.length > 3)
                                        ApiCall.setAllPass(this.passData).then((x) => {
                                            if (x) {
                                                ApiCall.getStatus(global.deviceId);
                                            }
                                            else
                                                console.log('şifre güncelleme başarısız ')
                                        });
                                }} />
                        </View>
                        <View style={{ marginTop: 10, height: 2, backgroundColor: 'gainsboro', width: '100%' }} ></View>
                        <View style={{ width: '100%' }}>
                            <TextInput style={styles.textInput}
                                textAlign={'center'}
                                autoCapitalize={"none"}
                                autoCorrect={false}
                                value={this.sessizsifresi}
                                onChangeText={(text) => this.onChangePassText("sessizsifresi", text)}
                                maxLength={4}
                                placeholder={langObj.pass6}
                                keyboardType={'numeric'}
                                underlineColorAndroid={"black"}
                                placeholderTextColor={"rgba(0,0,0,0.4)"}
                                selectionColor={"black"}
                                returnKeyType={'done'}
                                ref={(ref) => this.ks = ref}
                                onSubmitEditing={() => this.kp.focus()}
                            />
                            <Button borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginRight: 10, marginLeft: 10 }} fontWeight='bold' title={langObj.pass6Text}
                                onPress={() => {
                                    this.passData.data.sessizsifre = this.sessizsifresi;
                                    if (this.sessizsifresi.length > 3) {
                                        NetInfo.fetch().then(state => {
                                            if (state.isConnected)
                                                ApiCall.setAllPass(this.passData).then((x) => {
                                                    if (x) {
                                                        ApiCall.getStatus(global.deviceId);
                                                    }
                                                    else
                                                        console.log('şifre güncelleme başarısız ')
                                                });
                                            else
                                                Toast.show(langObj.internetConnFail, Toast.LONG);
                                        });
                                    }
                                }} />
                        </View>
                        <View style={{ marginTop: 10, height: 2, backgroundColor: 'gainsboro', width: '100%' }} ></View>
                        <View style={{ width: '100%' }}>
                            <TextInput style={styles.textInput}
                                textAlign={'center'}
                                autoCapitalize={"none"}
                                autoCorrect={false}
                                value={this.paniksifresi}
                                onChangeText={(text) => this.onChangePassText("paniksifresi", text)}
                                maxLength={4}
                                placeholder={langObj.pass7}
                                keyboardType={'numeric'}
                                underlineColorAndroid={"black"}
                                placeholderTextColor={"rgba(0,0,0,0.4)"}
                                selectionColor={"black"}
                                returnKeyType={'done'}
                                ref={(ref) => this.kp = ref}
                                onSubmitEditing={() => this.km.focus()}
                            />
                            <Button borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginRight: 10, marginLeft: 10 }} fontWeight='bold' title={langObj.pass7Text}
                                onPress={() => {
                                    this.passData.data.paniksifre = this.paniksifresi;
                                    if (this.paniksifresi.length > 3) {
                                        NetInfo.fetch().then(state => {
                                            if (state.isConnected)
                                                ApiCall.setAllPass(this.passData).then((x) => {
                                                    if (x) {
                                                        ApiCall.getStatus(global.deviceId);
                                                    }
                                                    else
                                                        console.log('şifre güncelleme başarısız ')
                                                });
                                            else
                                                Toast.show(langObj.internetConnFail, Toast.LONG);
                                        });
                                    }
                                }} />
                        </View>
                        <View style={{ marginTop: 10, height: 2, backgroundColor: 'gainsboro', width: '100%' }} ></View>
                        <View style={{ width: '100%' }}>
                            <TextInput style={styles.textInput}
                                textAlign={'center'}
                                autoCapitalize={"none"}
                                autoCorrect={false}
                                value={this.mastersifresi}
                                onChangeText={(text) => this.onChangePassText("mastersifresi", text)}
                                maxLength={4}
                                placeholder={langObj.pass8}
                                keyboardType={'numeric'}
                                underlineColorAndroid={"black"}
                                placeholderTextColor={"rgba(0,0,0,0.4)"}
                                selectionColor={"black"}
                                ref={(ref) => this.km = ref}
                                onSubmitEditing={() => this.km.focus()}
                            />
                            <Button borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginRight: 10, marginLeft: 10 }} fontWeight='bold' title={langObj.pass8Text}
                                onPress={() => {
                                    this.passData.data.mastersifre = this.mastersifresi;
                                    if (this.mastersifresi.length > 3) {
                                        NetInfo.fetch().then(state => {
                                            if (state.isConnected)
                                                ApiCall.setAllPass(this.passData).then((x) => {
                                                    if (x) {
                                                        console.log('şifre güncellendi')
                                                        ApiCall.getStatus(global.deviceId);
                                                    }
                                                    else
                                                        console.log('şifre güncelleme başarısız ')
                                                });
                                            else
                                                Toast.show(langObj.internetConnFail, Toast.LONG);
                                        });
                                    }
                                }} />
                        </View>
                        <View style={{ marginTop: 10, height: 2, backgroundColor: 'gainsboro', width: '100%' }} ></View>
                    </View>
                </KeyboardAwareScrollView>
            );
        }
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

export default Password;