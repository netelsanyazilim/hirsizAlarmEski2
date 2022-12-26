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
class ExitDelayTimer extends Component {

    @observable visibleSpinner = true;

    constructor(props) {
        super(props);
        makeObservable(this);
        this.state = {
            exitDelayTimer1: "1",
            exitDelayTimer2: "1",
            exitDelayTimer3: "1",
            exitDelayTimer4: "1",
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
                            exitDelayTimer1: x.cikisSuresi1,
                            exitDelayTimer2: x.cikisSuresi2,
                            exitDelayTimer3: x.cikisSuresi3,
                            exitDelayTimer4: x.cikisSuresi4,
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
                                {langObj.exitDelayTimerTitle1}
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
                                        if ((Number.parseInt(this.state.exitDelayTimer1) + 1) < 256) {
                                            this.setState({ exitDelayTimer1: (Number.parseInt(this.state.exitDelayTimer1) + 1).toString() });
                                        } else {
                                            this.setState({ exitDelayTimer1: "255" });
                                            Toast.show(langObj.maxValue, Toast.LONG);
                                        }
                                    }}
                                />
                                <TextInput style={styles.textInput} textAlign={'center'} autoCapitalize={"none"} autoCorrect={false}
                                    value={this.state.exitDelayTimer1.toString()} onChangeText={(text) => {
                                        const parsedQty = Number.parseInt(text);
                                        if (!Number.isNaN(parsedQty) && text != "" && text != null) {
                                            if ((parsedQty < 256) && (parsedQty > 0)) {
                                                this.setState({ exitDelayTimer1: parsedQty.toString() });
                                            } else {
                                                this.setState({ exitDelayTimer1: "1" });
                                                Toast.show(langObj.minAndMaxValue, Toast.LONG);
                                            }
                                        } else {
                                            this.setState({ exitDelayTimer1: "" });
                                        }
                                    }}
                                    maxLength={3} keyboardType={'numeric'} underlineColorAndroid={"black"} placeholderTextColor={"rgba(0,0,0,0.4)"}
                                    selectionColor={"black"}
                                />
                                <Icon size={18} name="minus" type="font-awesome" color="gray"
                                    containerStyle={Platform.OS === 'ios' ? { marginTop: 10 } : { marginTop: 20 }}
                                    onPress={() => {
                                        if ((Number.parseInt(this.state.exitDelayTimer1) - 1) > 0) {
                                            this.setState({ exitDelayTimer1: (Number.parseInt(this.state.exitDelayTimer1) - 1).toString() });
                                        } else {
                                            this.setState({ exitDelayTimer1: "1" });
                                            Toast.show(langObj.minValue, Toast.LONG);
                                        }
                                    }}
                                />
                                <Text style={{ alignSelf: 'center', marginLeft: 10 }} >{langObj.system1Unit}</Text>
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
                                                flagSettings.cikisSuresi1 = this.state.exitDelayTimer1;
                                                flagSettings.cikisSuresi2 = this.state.flagSettings.cikisSuresi2;
                                                flagSettings.cikisSuresi3 = this.state.flagSettings.cikisSuresi3;
                                                flagSettings.cikisSuresi4 = this.state.flagSettings.cikisSuresi4;
                                                flagSettings.sirenSuresi = this.state.flagSettings.sirenSuresi;
                                                flagSettings.alarmTekrarSayisi = this.state.flagSettings.alarmTekrarSayisi;
                                                flagSettings.aramaHatSecimi = this.state.flagSettings.aramaHatSecimi;
                                                flagSettings.gprsModulMod = this.state.flagSettings.gprsModulMod;
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
                        </View>
                    </View>

                    <View>
                        <View style={{
                            flexDirection: "row", alignSelf: "center", backgroundColor: "transparent", width: "100%",
                            justifyContent: "space-between"
                        }}>
                            <Text style={{ fontWeight: "bold", alignSelf: "center", margin: 10, color: 'gray', fontSize: 20 }}>
                                {langObj.exitDelayTimerTitle2}
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
                                        if ((Number.parseInt(this.state.exitDelayTimer2) + 1) < 256) {
                                            this.setState({ exitDelayTimer2: (Number.parseInt(this.state.exitDelayTimer2) + 1).toString() });
                                        } else {
                                            this.setState({ exitDelayTimer2: "255" });
                                            Toast.show(langObj.maxValue, Toast.LONG);
                                        }
                                    }}
                                />
                                <TextInput style={styles.textInput} textAlign={'center'} autoCapitalize={"none"} autoCorrect={false}
                                    value={this.state.exitDelayTimer2.toString()} onChangeText={(text) => {
                                        const parsedQty = Number.parseInt(text);
                                        if (!Number.isNaN(parsedQty) && text != "" && text != null) {
                                            if ((parsedQty < 256) && (parsedQty > 0)) {
                                                this.setState({ exitDelayTimer2: parsedQty.toString() });
                                            } else {
                                                this.setState({ exitDelayTimer2: "1" });
                                                Toast.show(langObj.minAndMaxValue, Toast.LONG);
                                            }
                                        } else {
                                            this.setState({ exitDelayTimer2: "" });
                                        }
                                    }}
                                    maxLength={3} keyboardType={'numeric'} underlineColorAndroid={"black"} placeholderTextColor={"rgba(0,0,0,0.4)"}
                                    selectionColor={"black"}
                                />
                                <Icon size={18} name="minus" type="font-awesome" color="gray"
                                    containerStyle={Platform.OS === 'ios' ? { marginTop: 10 } : { marginTop: 20 }}
                                    onPress={() => {
                                        if ((Number.parseInt(this.state.exitDelayTimer2) - 1) > 0) {
                                            this.setState({ exitDelayTimer2: (Number.parseInt(this.state.exitDelayTimer2) - 1).toString() });
                                        } else {
                                            this.setState({ exitDelayTimer2: "1" });
                                            Toast.show(langObj.minValue, Toast.LONG);
                                        }
                                    }}
                                />
                                <Text style={{ alignSelf: 'center', marginLeft: 10 }} >{langObj.system1Unit}</Text>
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
                                                flagSettings.cikisSuresi2 = this.state.exitDelayTimer2;
                                                flagSettings.cikisSuresi3 = this.state.flagSettings.cikisSuresi3;
                                                flagSettings.cikisSuresi4 = this.state.flagSettings.cikisSuresi4;
                                                flagSettings.sirenSuresi = this.state.flagSettings.sirenSuresi;
                                                flagSettings.alarmTekrarSayisi = this.state.flagSettings.alarmTekrarSayisi;
                                                flagSettings.aramaHatSecimi = this.state.flagSettings.aramaHatSecimi;
                                                flagSettings.gprsModulMod = this.state.flagSettings.gprsModulMod;
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
                        </View>
                    </View>

                    <View>
                        <View style={{
                            flexDirection: "row", alignSelf: "center", backgroundColor: "transparent", width: "100%",
                            justifyContent: "space-between"
                        }}>
                            <Text style={{ fontWeight: "bold", alignSelf: "center", margin: 10, color: 'gray', fontSize: 20 }}>
                                {langObj.exitDelayTimerTitle3}
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
                                        if ((Number.parseInt(this.state.exitDelayTimer3) + 1) < 256) {
                                            this.setState({ exitDelayTimer3: (Number.parseInt(this.state.exitDelayTimer3) + 1).toString() });
                                        } else {
                                            this.setState({ exitDelayTimer3: "255" });
                                            Toast.show(langObj.maxValue, Toast.LONG);
                                        }
                                    }}
                                />
                                <TextInput style={styles.textInput} textAlign={'center'} autoCapitalize={"none"} autoCorrect={false}
                                    value={this.state.exitDelayTimer3.toString()} onChangeText={(text) => {
                                        const parsedQty = Number.parseInt(text);
                                        if (!Number.isNaN(parsedQty) && text != "" && text != null) {
                                            if ((parsedQty < 256) && (parsedQty > 0)) {
                                                this.setState({ exitDelayTimer3: parsedQty.toString() });
                                            } else {
                                                this.setState({ exitDelayTimer3: "1" });
                                                Toast.show(langObj.minAndMaxValue, Toast.LONG);
                                            }
                                        } else {
                                            this.setState({ exitDelayTimer3: "" });
                                        }
                                    }}
                                    maxLength={3} keyboardType={'numeric'} underlineColorAndroid={"black"} placeholderTextColor={"rgba(0,0,0,0.4)"}
                                    selectionColor={"black"}
                                />
                                <Icon size={18} name="minus" type="font-awesome" color="gray"
                                    containerStyle={Platform.OS === 'ios' ? { marginTop: 10 } : { marginTop: 20 }}
                                    onPress={() => {
                                        if ((Number.parseInt(this.state.exitDelayTimer3) - 1) > 0) {
                                            this.setState({ exitDelayTimer3: (Number.parseInt(this.state.exitDelayTimer3) - 1).toString() });
                                        } else {
                                            this.setState({ exitDelayTimer3: "1" });
                                            Toast.show(langObj.minValue, Toast.LONG);
                                        }
                                    }}
                                />
                                <Text style={{ alignSelf: 'center', marginLeft: 10 }} >{langObj.system1Unit}</Text>
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
                                                flagSettings.cikisSuresi3 = this.state.exitDelayTimer3;
                                                flagSettings.cikisSuresi4 = this.state.flagSettings.cikisSuresi4;
                                                flagSettings.sirenSuresi = this.state.flagSettings.sirenSuresi;
                                                flagSettings.alarmTekrarSayisi = this.state.flagSettings.alarmTekrarSayisi;
                                                flagSettings.aramaHatSecimi = this.state.flagSettings.aramaHatSecimi;
                                                flagSettings.gprsModulMod = this.state.flagSettings.gprsModulMod;
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
                        </View>
                    </View>

                    <View>
                        <View style={{
                            flexDirection: "row", alignSelf: "center", backgroundColor: "transparent", width: "100%",
                            justifyContent: "space-between"
                        }}>
                            <Text style={{ fontWeight: "bold", alignSelf: "center", margin: 10, color: 'gray', fontSize: 20 }}>
                                {langObj.exitDelayTimerTitle4}
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
                                        if ((Number.parseInt(this.state.exitDelayTimer4) + 1) < 256) {
                                            this.setState({ exitDelayTimer4: (Number.parseInt(this.state.exitDelayTimer4) + 1).toString() });
                                        } else {
                                            this.setState({ exitDelayTimer4: "255" });
                                            Toast.show(langObj.maxValue, Toast.LONG);
                                        }
                                    }}
                                />
                                <TextInput style={styles.textInput} textAlign={'center'} autoCapitalize={"none"} autoCorrect={false}
                                    value={this.state.exitDelayTimer4.toString()} onChangeText={(text) => {
                                        const parsedQty = Number.parseInt(text);
                                        if (!Number.isNaN(parsedQty) && text != "" && text != null) {
                                            if ((parsedQty < 256) && (parsedQty > 0)) {
                                                this.setState({ exitDelayTimer4: parsedQty.toString() });
                                            } else {
                                                this.setState({ exitDelayTimer4: "1" });
                                                Toast.show(langObj.minAndMaxValue, Toast.LONG);
                                            }
                                        } else {
                                            this.setState({ exitDelayTimer4: "" });
                                        }
                                    }}
                                    maxLength={3} keyboardType={'numeric'} underlineColorAndroid={"black"} placeholderTextColor={"rgba(0,0,0,0.4)"}
                                    selectionColor={"black"}
                                />
                                <Icon size={18} name="minus" type="font-awesome" color="gray"
                                    containerStyle={Platform.OS === 'ios' ? { marginTop: 10 } : { marginTop: 20 }}
                                    onPress={() => {
                                        if ((Number.parseInt(this.state.exitDelayTimer4) - 1) > 0) {
                                            this.setState({ exitDelayTimer4: (Number.parseInt(this.state.exitDelayTimer4) - 1).toString() });
                                        } else {
                                            this.setState({ exitDelayTimer4: "1" });
                                            Toast.show(langObj.minValue, Toast.LONG);
                                        }
                                    }}
                                />
                                <Text style={{ alignSelf: 'center', marginLeft: 10 }} >{langObj.system1Unit}</Text>
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
                                                flagSettings.cikisSuresi4 = this.state.exitDelayTimer4;
                                                flagSettings.sirenSuresi = this.state.flagSettings.sirenSuresi;
                                                flagSettings.alarmTekrarSayisi = this.state.flagSettings.alarmTekrarSayisi;
                                                flagSettings.aramaHatSecimi = this.state.flagSettings.aramaHatSecimi;
                                                flagSettings.gprsModulMod = this.state.flagSettings.gprsModulMod;
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

export default ExitDelayTimer;