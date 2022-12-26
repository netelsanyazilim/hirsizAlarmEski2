import React, { Component } from "react";
import { NativeModules, StyleSheet, View, TextInput, Text, Platform, BackHandler } from "react-native";
import { CommonActions } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";
import { Button } from "react-native-elements";
import ApiService from '../Utils/ApiService';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { observable, makeObservable, action } from "mobx";
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

class UserPassword extends Component {

    @observable passwords = [];

    constructor(props) {
        super(props);
        makeObservable(this);
        this.state = {
            userNumber: "",
            newPassword: ""
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
                name: 'Password'
            })
        );
        setTimeout(() => { }, 500);
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
        this.getLanguage();
        this.getAllPasswords();
    }

    @action
    getAllPasswords() {
        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                ApiCall.getAllPassNew().then((x) => {
                    if (x) {
                        if (x != undefined && x != null) {
                            this.passwords = x;
                        } else {
                            this.passwords = [];
                        }
                    }
                    else {
                        this.passwords = [];
                    }
                });
            }
            else {
                this.passwords = [];
            }
        });
    }

    render() {
        return (
            <KeyboardAwareScrollView extraHeight={140} enableOnAndroid={false} style={{ flex: 1, backgroundColor: "white" }}>
                <View style={{ flex: 1, marginTop: 10, alignItems: 'center' }} >
                    <View style={{ width: '100%', alignItems: 'center' }}>
                        <Text style={{ fontSize: 20, textAlign: 'center', backgroundColor: 'transparent', fontWeight: 'bold', color: 'gray' }}>
                            {langObj.changeUserPasswordPage}
                        </Text>
                        <TextInput style={styles.textInput2}
                            textAlign={'center'}
                            autoCapitalize={"none"}
                            autoCorrect={false}
                            value={this.state.userNumber.toString()}
                            onChangeText={(text) => {
                                const parsedQty = Number.parseInt(text);
                                if (!Number.isNaN(parsedQty) && text != "" && text != null) {
                                    if ((parsedQty < 31) && (parsedQty > 0)) {
                                        this.setState({ userNumber: parsedQty.toString() });
                                    } else {
                                        this.setState({ userNumber: "" });
                                        Toast.show(langObj.maxUserNumber, Toast.LONG);
                                    }
                                } else {
                                    this.setState({ userNumber: "" });
                                }
                            }}
                            maxLength={2}
                            placeholder={langObj.whichUser}
                            keyboardType={'numeric'}
                            underlineColorAndroid={"black"}
                            placeholderTextColor={"rgba(0,0,0,0.4)"}
                            selectionColor={"black"}
                            returnKeyType={'done'}
                        />
                        <TextInput style={styles.textInput2}
                            textAlign={'center'}
                            autoCapitalize={"none"}
                            autoCorrect={false}
                            value={this.state.newPassword.toString()}
                            onChangeText={(text) => { this.setState({ newPassword: text }); }}
                            maxLength={4}
                            placeholder={langObj.newPassword}
                            keyboardType={'numeric'}
                            underlineColorAndroid={"black"}
                            placeholderTextColor={"rgba(0,0,0,0.4)"}
                            selectionColor={"black"}
                            returnKeyType={'done'}
                        />
                        <Text style={{ fontSize: 10, textAlign: 'center', backgroundColor: 'transparent', fontWeight: 'bold', color: 'gray' }}>
                            {langObj.resetPasswordWithZero}
                        </Text>
                        <Button borderRadius={4}
                            buttonStyle={{ backgroundColor: "#cc1e18", marginRight: 10, marginLeft: 10, width: 150, marginTop: 10 }}
                            fontWeight='bold'
                            title={langObj.changePassword}
                            onPress={() => {
                                NetInfo.fetch().then(state => {
                                    if (!(this.passwords.includes(this.state.newPassword)) || (this.state.newPassword == "0000")) {
                                        if (state.isConnected) {
                                            ApiCall.setPassword(2, this.state.userNumber, this.state.newPassword).then((x) => {
                                                if (x) {
                                                    this.getAllPasswords();
                                                    this.setState({ userNumber: "", newPassword: "" });
                                                }
                                            });
                                        }
                                        else { Toast.show(langObj.internetConnFail, Toast.LONG); }
                                    } else {
                                        Toast.show(langObj.passwordUsed, Toast.LONG);
                                    }
                                });
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

export default UserPassword;