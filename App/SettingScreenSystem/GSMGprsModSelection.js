import React, { Component } from "react";
import { StyleSheet, Text, NativeModules, View, BackHandler, Platform } from "react-native";
import RadioForm, { RadioButton } from 'react-native-simple-radio-button';
import { CommonActions } from '@react-navigation/native';
import { Button } from "react-native-elements";
import NetInfo from "@react-native-community/netinfo";
import { action, observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import ApiService from '../Utils/ApiService';
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
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

@observer
class GSMGprsModSelection extends Component {

    @observable visibleSpinner = true;

    constructor(props) {
        super(props);
        makeObservable(this);
        this.state = {
            languages: [
                { label: langObj.onlyGPRSConnection, value: 0 },
                { label: langObj.onlyGSMCall, value: 1 },
                { label: langObj.gprsAndGSMConnection, value: 2 }
            ],
            value1Index: 0,
            flagSettings: null
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
                name: 'System'
            })
        );
        setTimeout(() => { }, 500);
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
        this.getLanguage();
        this.getSettings();
    }

    @action
    getSettings() {
        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                ApiCall.getSettings().then((x) => {
                    if (x) {
                        this.setState({
                            value1Index: (x.gprsModulMod - 1),
                            flagSettings: x
                        });

                        this.visibleSpinner = false;
                    } else {
                        this.props.navigation.dispatch(
                            CommonActions.navigate({
                                name: 'System'
                            })
                        );
                    }
                });
            } else {
                Toast.show(langObj.internetConnFail, Toast.LONG);
                this.props.navigation.dispatch(
                    CommonActions.navigate({
                        name: 'System'
                    })
                );
            }
        });
    }

    render() {
        return (
            <View style={{ flex: 1 }}>

                {this.visibleSpinner &&
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#ffa000" }}>
                        <Spinner size={100} type={'Wave'} color={"#FFFFFF"} />
                        <Text style={{ marginTop: 10, color: "white" }}>{langObj.fetchingData}</Text>
                    </View>
                }

                {!this.visibleSpinner && <View style={{ justifyContent: 'space-between', flex: 1, backgroundColor: 'white' }} >
                    <View>
                        <Text style={{ fontWeight: "bold", alignSelf: "center", margin: 10, color: 'gray', fontSize: 20 }}>
                            {langObj.gsmGprsModSelection}
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
                        <Button borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginTop: 10, marginBottom: 20, marginLeft: 10, marginRight: 10 }}
                            title={langObj.submit} onPress={() => {
                                NetInfo.fetch().then(state => {
                                    if (state.isConnected) {
                                        let flagSettings = {};
                                        flagSettings.girisSuresi1 = this.state.flagSettings.girisSuresi1;
                                        flagSettings.girisSuresi2 = this.state.flagSettings.girisSuresi2;
                                        flagSettings.girisSuresi3 = this.state.flagSettings.girisSuresi3;
                                        flagSettings.girisSuresi4 = this.state.flagSettings.girisSuresi4;
                                        flagSettings.cikisSuresi1 = this.state.flagSettings.cikisSuresi1;
                                        flagSettings.cikisSuresi2 = this.state.flagSettings.cikisSuresi2;
                                        flagSettings.cikisSuresi3 = this.state.flagSettings.cikisSuresi3;
                                        flagSettings.cikisSuresi4 = this.state.flagSettings.cikisSuresi4;
                                        flagSettings.sirenSuresi = this.state.flagSettings.sirenSuresi;
                                        flagSettings.alarmTekrarSayisi = this.state.flagSettings.alarmTekrarSayisi;
                                        flagSettings.aramaHatSecimi = this.state.flagSettings.aramaHatSecimi;
                                        flagSettings.gprsModulMod = (this.state.value1Index + 1);
                                        flagSettings.smsBildirim = this.state.flagSettings.smsBildirim;
                                        flagSettings.aramaTekrarSayisi = this.state.flagSettings.aramaTekrarSayisi;
                                        flagSettings.telCalmaSayisi = this.state.flagSettings.telCalmaSayisi;
                                        flagSettings.sifresizKurulum = this.state.flagSettings.sifresizKurulum;
                                        flagSettings.yanginZonTipi = this.state.flagSettings.yanginZonTipi;
                                        flagSettings.sesliGeriBildirim = this.state.flagSettings.sesliGeriBildirim;
                                        flagSettings.santralBuzzer = this.state.flagSettings.santralBuzzer;
                                        flagSettings.sirenHataKontrol = this.state.flagSettings.sirenHataKontrol;

                                        ApiCall.changeSettings(flagSettings).then((x) => {
                                            if (x) {
                                                this.getSettings();
                                            }
                                        });
                                    }
                                    else Toast.show(langObj.internetConnFail, Toast.LONG);
                                });
                            }}
                        />
                    </View>
                </View>}

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

export default GSMGprsModSelection;