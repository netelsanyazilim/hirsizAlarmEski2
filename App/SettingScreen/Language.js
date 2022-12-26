import React, { Component } from "react";
import { StyleSheet, Text, NativeModules, View, BackHandler, Alert, Platform } from "react-native";
import RadioForm, { RadioButton } from 'react-native-simple-radio-button';
import { CommonActions } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
import { Button } from "react-native-elements";
//import RNExitApp from 'react-native-exit-app';
import RNRestart from 'react-native-restart';
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

class Language extends Component {

    constructor(props) {
        super(props);
        this.state = {
            languages: [
                { label: langObj.turkish, value: 0 },
                { label: langObj.english, value: 1 }
            ],
            value1Index: 0,
            user: null
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

            let flagUser = await SharedPrefs.getlogindata();
            this.setState({ user: flagUser });

            if (a != undefined && a != null)
                if (a == 1)
                    langObj = EN;
                else
                    langObj = TR;
            else {
                if (locale.includes("en")) {
                    langObj = EN;
                }
                else {
                    langObj = TR;
                }
            }

            if (langObj == TR) this.setState({ value1Index: 0 });
            else this.setState({ value1Index: 1 });

        } catch (error) {
            console.log('Language error ', error);
            if (locale.includes("en")) {
                langObj = EN;
            }
            else {
                langObj = TR;
            }

            if (langObj == TR) this.setState({ value1Index: 0 });
            else this.setState({ value1Index: 1 });
        }

        this.setState({
            languages: [
                { label: langObj.turkish, value: 0 },
                { label: langObj.english, value: 1 }
            ]
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
                <View>
                    <Text style={{ margin: 20, fontWeight: '400', fontSize: 20 }} >
                        {langObj.changeLanguageDescription}
                    </Text>
                    <View style={{ margin: 20 }}>
                        <RadioForm>
                            {this.state.languages.map((obj, i) => {
                                var is_selected = this.state.value1Index == i;
                                return (
                                    <View key={i} style={styles.radioButtonWrap}>
                                        <RadioButton
                                            isSelected={is_selected}
                                            obj={obj}
                                            index={i}
                                            buttonColor={"#cc1e18"}
                                            style={[i !== this.state.languages.length - 1 && styles.radioStyle]}
                                            onPress={(value, index) => {
                                                this.setState({ value1Index: index });
                                            }}
                                        />
                                    </View>
                                )
                            })}
                        </RadioForm>
                    </View>
                </View>
                <View style={{ marginTop: 10 }} >
                    <Button
                        borderRadius={4}
                        buttonStyle={{ backgroundColor: "#cc1e18", marginBottom: 20, marginLeft: 10, marginRight: 10 }}
                        title={langObj.changeLanguage}
                        onPress={
                            () => {
                                Alert.alert(langObj.changeLanguageDescriptionConfirm, '',
                                    [{
                                        text: langObj.changeLanguage, onPress: () => {
                                            let flagLangCode = "0";
                                            let languageCode = "TR";
                                            let userMail = "";
                                            if (this.state.value1Index == 1) { flagLangCode = "1"; languageCode = "EN"; userMail = this.state.user.mail.toString(); }
                                            else { flagLangCode = "0"; languageCode = "TR"; userMail = this.state.user.mail.toString(); }
                                            NetInfo.fetch().then(state => {
                                                if (state.isConnected) {
                                                    ApiCall.updateUserLanguage(userMail, languageCode).then(() => {
                                                        SharedPrefs.saveLang(flagLangCode).then(() => {
                                                            //RNExitApp.exitApp();  //normalde kullanıcıdan çıkıp tekrar girmesi istenecekti.
                                                            RNRestart.Restart();
                                                        });
                                                    });
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

const styles = StyleSheet.create({
    radioStyle: {
        paddingRight: 10
    },
    radioButtonWrap: {
        marginRight: 5
    }
});

export default Language;