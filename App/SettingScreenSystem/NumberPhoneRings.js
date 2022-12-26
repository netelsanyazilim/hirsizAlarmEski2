import React, { Component } from "react";
import {
    StyleSheet, Text, NativeModules, View, ScrollView,
    TextInput, BackHandler, Platform
} from "react-native";
import { CommonActions } from '@react-navigation/native';
import { Icon, Button } from "react-native-elements";
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
class NumberPhoneRings extends Component {

    @observable visibleSpinner = true;

    constructor(props) {
        super(props);
        makeObservable(this);
        this.state = {
            numberPhoneRings: "1",
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
                            numberPhoneRings: x.telCalmaSayisi,
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

                {!this.visibleSpinner && <ScrollView style={{ flex: 1, backgroundColor: "white" }}>
                    <View>
                        <View style={{
                            flexDirection: "row", alignSelf: "center", backgroundColor: "transparent", width: "100%",
                            justifyContent: "space-between"
                        }}>
                            <Text style={{ fontWeight: "bold", alignSelf: "center", margin: 10, color: 'gray', fontSize: 20 }}>
                                {langObj.numberPhoneRings}
                            </Text>
                        </View>
                        <View style={{
                            flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: 'whitesmoke',
                            borderColor: "gainsboro", borderBottomWidth: 1, width: "100%"
                        }}>
                            <View style={{ flexDirection: 'row', marginLeft: 15, }}>
                                <Icon size={18} name="plus" color="gray" type="font-awesome"
                                    containerStyle={Platform.OS === 'ios' ? { marginTop: 10 } : { marginTop: 20 }}
                                    onPress={() => {
                                        if ((Number.parseInt(this.state.numberPhoneRings) + 1) < 31) {
                                            this.setState({ numberPhoneRings: (Number.parseInt(this.state.numberPhoneRings) + 1).toString() });
                                        } else {
                                            this.setState({ numberPhoneRings: "30" });
                                            Toast.show(langObj.maxRingLimit, Toast.LONG);
                                        }
                                    }}
                                />
                                <TextInput style={styles.textInput} textAlign={'center'} autoCapitalize={"none"} autoCorrect={false}
                                    value={this.state.numberPhoneRings.toString()} onChangeText={(text) => {
                                        const parsedQty = Number.parseInt(text);
                                        if (!Number.isNaN(parsedQty) && text != "" && text != null) {
                                            if ((parsedQty < 31) && (parsedQty > 0)) {
                                                this.setState({ numberPhoneRings: parsedQty.toString() });
                                            } else {
                                                this.setState({ numberPhoneRings: "1" });
                                                Toast.show(langObj.minAndMaxValue3, Toast.LONG);
                                            }
                                        } else {
                                            this.setState({ numberPhoneRings: "" });
                                        }
                                    }}
                                    maxLength={2} keyboardType={'numeric'} underlineColorAndroid={"black"} placeholderTextColor={"rgba(0,0,0,0.4)"}
                                    selectionColor={"black"}
                                />
                                <Icon size={18} name="minus" type="font-awesome" color="gray"
                                    containerStyle={Platform.OS === 'ios' ? { marginTop: 10 } : { marginTop: 20 }}
                                    onPress={() => {
                                        if ((Number.parseInt(this.state.numberPhoneRings) - 1) > 0) {
                                            this.setState({ numberPhoneRings: (Number.parseInt(this.state.numberPhoneRings) - 1).toString() });
                                        } else {
                                            this.setState({ numberPhoneRings: "1" });
                                            Toast.show(langObj.minValue, Toast.LONG);
                                        }
                                    }}
                                />
                                <Text style={{ alignSelf: 'center', marginLeft: 10 }} >{langObj.system4Unit}</Text>
                            </View>
                            <View>
                                <Button borderRadius={4} buttonStyle={{ margin: 10, backgroundColor: "#cc1e18" }} title={langObj.submit}
                                    onPress={() => {
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
                                                flagSettings.gprsModulMod = this.state.flagSettings.gprsModulMod;
                                                flagSettings.smsBildirim = this.state.flagSettings.smsBildirim;
                                                flagSettings.aramaTekrarSayisi = this.state.flagSettings.aramaTekrarSayisi;
                                                flagSettings.telCalmaSayisi = this.state.numberPhoneRings;
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
                        </View>
                    </View>

                    <View style={{ height: 30 }} ></View>
                </ScrollView>}

            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "transparent",
        alignItems: "center",
        justifyContent: "space-around"
    },
    modalContainer: {
        flex: 1,
        justifyContent: 'center',
        backgroundColor: "rgba(0,0,0,0.4)"
    },
    innerContainer: {
        marginLeft: 50, marginRight: 50,
        alignItems: "center",
        alignSelf: 'center',
        backgroundColor: 'white', borderWidth: 2, borderColor: 'gainsboro', borderBottomWidth: 0,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 3,
    },
    textInput: {
        margin: 5,
        width: 50,
        fontSize: 20,
        fontWeight: '600',
        ...Platform.select({
            ios: {
                borderBottomWidth: 2,
                borderColor: 'gray',
            }
        }),
    }
});

export default NumberPhoneRings;