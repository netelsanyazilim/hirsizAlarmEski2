import React, { Component } from "react";
import {
    StyleSheet, Text, NativeModules, TouchableOpacity, ScrollView,
    View, Modal, BackHandler, Platform
} from "react-native";
import { CommonActions } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";
import { action, observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { Icon, Button } from "react-native-elements";
import SharedPrefs from "../Utils/SharedPrefs";
import Toast from 'react-native-simple-toast';
import DatePicker from 'react-native-datepicker';
import DateTimePicker from '@react-native-community/datetimepicker';
import ApiService from '../Utils/ApiService';
import DeviceLogin from '../Component/DeviceLogin';
import RadioForm from 'react-native-simple-radio-button';
import Spinner from 'react-native-loading-spinner-overlay';
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

kurulumprops = [
    { label: langObj.away, value: 4 },
    { label: langObj.home, value: 5 },
];

@observer
class Program extends Component {

    @observable selectedIndex = null;
    @observable selectedDate = ["00:00", "00:00", "00:00", "00:00", "00:00", "00:00"];

    @observable selectedSectionIndex = null;
    @observable selectedSectionModalIndex = null;

    //4 harici 5 dahili
    @observable selectedMode = [4, 4, 4]
    @observable psd = !global.deviceLoggedin;
    @observable loading = false;

    constructor(props) {
        super(props);
        makeObservable(this);
        this.state = {
            menu: [],
            flagProgSettings: null,
            visible: false,
            visibleForSection: false
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

        kurulumprops = [{ label: langObj.away, value: 4 }, { label: langObj.home, value: 5 }];
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

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
        this.getLanguage();
        this.psd = !global.deviceLoggedin;
        let flagDeviceId = global.deviceId;
        let result = flagDeviceId.substring(10).substring(0, 8);
        if (result == "00000000") flagDeviceId = flagDeviceId.substring(0, 6) + flagDeviceId.substring(18);

        if (result == "00000000") {
            this.getProgSettings();
        } else {
            if (global.statusData.data.programayar != undefined) {
                this.selectedDate[0] = global.statusData.data.programayar.haftaiciprogrami.timestring.split("-")[0].replace(/ +/g, "");
                this.selectedDate[1] = global.statusData.data.programayar.haftaiciprogrami.timestring.split("-")[1].replace(/ +/g, "");
                this.selectedDate[2] = global.statusData.data.programayar.cumartesiprogrami.timestring.split("-")[0].replace(/ +/g, "");
                this.selectedDate[3] = global.statusData.data.programayar.cumartesiprogrami.timestring.split("-")[1].replace(/ +/g, "");
                this.selectedDate[4] = global.statusData.data.programayar.pazarprogrami.timestring.split("-")[0].replace(/ +/g, "");
                this.selectedDate[5] = global.statusData.data.programayar.pazarprogrami.timestring.split("-")[1].replace(/ +/g, "");
                this.selectedMode[0] = global.statusData.data.programayar.haftaiciprogrami.kurulummodu;
                this.selectedMode[1] = global.statusData.data.programayar.cumartesiprogrami.kurulummodu;
                this.selectedMode[2] = global.statusData.data.programayar.pazarprogrami.kurulummodu;
            }
        }
    }

    @action
    getProgSettings() {
        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                ApiCall.getStatusForPartition(global.deviceId).then((x) => {
                    if (x) {
                        let flagAktifBolge = [];
                        if (x.bolgeAktif1 == 1) flagAktifBolge.push(true); else flagAktifBolge.push(false);
                        if (x.bolgeAktif2 == 1) flagAktifBolge.push(true); else flagAktifBolge.push(false);
                        if (x.bolgeAktif3 == 1) flagAktifBolge.push(true); else flagAktifBolge.push(false);
                        if (x.bolgeAktif4 == 1) flagAktifBolge.push(true); else flagAktifBolge.push(false);

                        ApiCall.getProgSettings().then((x) => {
                            if (x) {
                                this.setState({
                                    flagProgSettings: x
                                });
                            } else {
                                this.props.navigation.dispatch(
                                    CommonActions.navigate({
                                        name: 'SettingsTab'
                                    })
                                );
                            }
                        });

                        this.setState({ menu: flagAktifBolge });
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

    renderChild(title, subtitle, mod, index) {
        let modStr = "";
        if (mod == 4)
            modStr = langObj.away;
        if (mod == 5)
            modStr = langObj.home;
        return (
            <View style={{ marginTop: 10, elevation: 5 }}>
                <View style={{ flexDirection: "row", alignSelf: "center", width: '100%', justifyContent: "space-between" }}>
                    <View style={{ marginLeft: 20 }} >
                        <Text style={{ fontWeight: "bold", marginBottom: 10, color: 'black', fontSize: 20 }}>{title}</Text>
                        <Text>{subtitle}</Text>
                        <Text>{modStr}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignSelf: "center", width: '50%', justifyContent: "space-between" }}>
                        <View>
                            <Button onPress={() => {
                                if (index == 0) {
                                    this.selectedDate[0] = "00:00";
                                    this.selectedDate[1] = "00:00";
                                    this.selectedMode[0] = 4;
                                } else if (index == 1) {
                                    this.selectedDate[2] = "00:00";
                                    this.selectedDate[3] = "00:00";
                                    this.selectedMode[1] = 4;
                                } else if (index == 2) {
                                    this.selectedDate[4] = "00:00";
                                    this.selectedDate[5] = "00:00";
                                    this.selectedMode[2] = 4;
                                }

                                let a = {
                                    "data": {
                                        "programayar": {
                                            "haftaiciprogrami":
                                            {
                                                "kurulumsaati": this.selectedDate[0] == "00:00" ? 0 : this.selectedDate[0].split(':')[0], "kurulumdk": this.selectedDate[0] == "00:00" ? 0 : this.selectedDate[0].split(':')[1], "kapatmasaati": this.selectedDate[1] == "00:00" ? 0 : this.selectedDate[1].split(':')[0], "kapatmadk": this.selectedDate[1] == "00:00" ? 0 : this.selectedDate[1].split(':')[1],
                                                "kurulummodu": this.selectedMode[0]
                                            },
                                            "cumartesiprogrami":
                                            {
                                                "kurulumsaati": this.selectedDate[2] == "00:00" ? 0 : this.selectedDate[2].split(':')[0], "kurulumdk": this.selectedDate[2] == "00:00" ? 0 : this.selectedDate[2].split(':')[1], "kapatmasaati": this.selectedDate[3] == "00:00" ? 0 : this.selectedDate[3].split(':')[0], "kapatmadk": this.selectedDate[3] == "00:00" ? 0 : this.selectedDate[3].split(':')[1],
                                                "kurulummodu": this.selectedMode[1]
                                            },
                                            "pazarprogrami":
                                            {
                                                "kurulumsaati": this.selectedDate[4] == "00:00" ? 0 : this.selectedDate[4].split(':')[0], "kurulumdk": this.selectedDate[4] == "00:00" ? 0 : this.selectedDate[4].split(':')[1], "kapatmasaati": this.selectedDate[5] == "00:00" ? 0 : this.selectedDate[5].split(':')[0], "kapatmadk": this.selectedDate[5] == "00:00" ? 0 : this.selectedDate[5].split(':')[1],
                                                "kurulummodu": this.selectedMode[2]
                                            }
                                        }
                                    }
                                }
                                setTimeout(() => { this.setState({ visible: false }) }, 5000);
                                this.setState({
                                    visible: true
                                });
                                ApiCall.setProgramSettings(a).then((x) => {
                                    if (x) {
                                        ApiCall.getStatus(global.deviceId).then(() => {
                                            this.setState({
                                                visible: false
                                            });
                                        });
                                    }
                                    else
                                        console.log('hata');
                                });
                            }} icon={<Icon name="close" size={20} color="red" />} type="outline" title={langObj.deleteProgram} titleStyle={{ color: "black" }} />
                        </View>
                        <View style={{ marginRight: 10 }}>
                            <Button onPress={() => {
                                this.selectedIndex = index;
                                if (this.selectedIndex == 0) {
                                    if (global.statusData.data.programayar.haftaiciprogrami.timestring == '00 : 00 - 00 : 00') {
                                        this.selectedDate[0] = "00:00";
                                        this.selectedDate[1] = "00:00";
                                    } else {
                                        this.selectedDate[0] = global.statusData.data.programayar.haftaiciprogrami.timestring.split("-")[0].replace(/ +/g, "");
                                        this.selectedDate[1] = global.statusData.data.programayar.haftaiciprogrami.timestring.split("-")[1].replace(/ +/g, "");
                                    }
                                } else if (this.selectedIndex == 1) {
                                    if (global.statusData.data.programayar.cumartesiprogrami.timestring == '00 : 00 - 00 : 00') {
                                        this.selectedDate[2] = "00:00";
                                        this.selectedDate[3] = "00:00";
                                    } else {
                                        this.selectedDate[2] = global.statusData.data.programayar.cumartesiprogrami.timestring.split("-")[0].replace(/ +/g, "");
                                        this.selectedDate[3] = global.statusData.data.programayar.cumartesiprogrami.timestring.split("-")[1].replace(/ +/g, "");
                                    }
                                } else if (this.selectedIndex == 2) {
                                    if (global.statusData.data.programayar.pazarprogrami.timestring == '00 : 00 - 00 : 00') {
                                        this.selectedDate[4] = "00:00";
                                        this.selectedDate[5] = "00:00";
                                    } else {
                                        this.selectedDate[4] = global.statusData.data.programayar.pazarprogrami.timestring.split("-")[0].replace(/ +/g, "");
                                        this.selectedDate[5] = global.statusData.data.programayar.pazarprogrami.timestring.split("-")[1].replace(/ +/g, "");
                                    }
                                }
                            }} icon={<Icon name="edit" size={20} color="green" />} type="outline" title={langObj.editProgram} titleStyle={{ color: "black" }} />
                        </View>
                    </View>
                </View>
                <View style={{ height: 2, width: '100%', backgroundColor: 'gainsboro', marginTop: 10 }} ></View>
            </View>
        );
    }

    renderChild2(title, index) {
        let modStr = "";
        let subtitle = "";
        let mod = "";

        if (index == 0) {
            subtitle = this.state.flagProgSettings[this.selectedSectionIndex].haftaiciProgrami.timeString == '00 : 00 - 00 : 00' ? langObj.notProgrammed : this.state.flagProgSettings[this.selectedSectionIndex].haftaiciProgrami.timeString;
            mod = this.state.flagProgSettings[this.selectedSectionIndex].haftaiciProgrami.kurulumModu;
        }
        else if (index == 1) {
            subtitle = this.state.flagProgSettings[this.selectedSectionIndex].cumartesiProgrami.timeString == '00 : 00 - 00 : 00' ? langObj.notProgrammed : this.state.flagProgSettings[this.selectedSectionIndex].cumartesiProgrami.timeString;
            mod = this.state.flagProgSettings[this.selectedSectionIndex].cumartesiProgrami.kurulumModu;
        }
        else if (index == 2) {
            subtitle = this.state.flagProgSettings[this.selectedSectionIndex].pazarProgrami.timeString == '00 : 00 - 00 : 00' ? langObj.notProgrammed : this.state.flagProgSettings[this.selectedSectionIndex].pazarProgrami.timeString;
            mod = this.state.flagProgSettings[this.selectedSectionIndex].pazarProgrami.kurulumModu;
        }

        if (mod == 4)
            modStr = langObj.away;
        if (mod == 5)
            modStr = langObj.home;

        return (
            <View style={{ marginTop: 10, elevation: 5 }}>
                <View style={{ flexDirection: "row", alignSelf: "center", width: '100%', justifyContent: "space-between" }}>
                    <View style={{ marginLeft: 20 }} >
                        <Text style={{ fontWeight: "bold", marginBottom: 10, color: 'black', fontSize: 20 }}>{title}</Text>
                        <Text>{subtitle}</Text>
                        <Text>{modStr}</Text>
                    </View>
                    <View style={{ flexDirection: "row", alignSelf: "center", width: '50%', justifyContent: "space-between" }}>
                        <View>
                            <Button onPress={() => {
                                if (this.state.flagProgSettings[this.selectedSectionIndex].haftaiciProgrami.timeString == '00 : 00 - 00 : 00') {
                                    this.selectedDate[0] = "00:00";
                                    this.selectedDate[1] = "00:00";
                                } else {
                                    this.selectedDate[0] = this.state.flagProgSettings[this.selectedSectionIndex].haftaiciProgrami.timeString.split("-")[0].replace(/ +/g, "");
                                    this.selectedDate[1] = this.state.flagProgSettings[this.selectedSectionIndex].haftaiciProgrami.timeString.split("-")[1].replace(/ +/g, "");
                                }
                                if (this.state.flagProgSettings[this.selectedSectionIndex].cumartesiProgrami.timeString == '00 : 00 - 00 : 00') {
                                    this.selectedDate[2] = "00:00";
                                    this.selectedDate[3] = "00:00";
                                } else {
                                    this.selectedDate[2] = this.state.flagProgSettings[this.selectedSectionIndex].cumartesiProgrami.timeString.split("-")[0].replace(/ +/g, "");
                                    this.selectedDate[3] = this.state.flagProgSettings[this.selectedSectionIndex].cumartesiProgrami.timeString.split("-")[1].replace(/ +/g, "");
                                }
                                if (this.state.flagProgSettings[this.selectedSectionIndex].pazarProgrami.timeString == '00 : 00 - 00 : 00') {
                                    this.selectedDate[4] = "00:00";
                                    this.selectedDate[5] = "00:00";
                                } else {
                                    this.selectedDate[4] = this.state.flagProgSettings[this.selectedSectionIndex].pazarProgrami.timeString.split("-")[0].replace(/ +/g, "");
                                    this.selectedDate[5] = this.state.flagProgSettings[this.selectedSectionIndex].pazarProgrami.timeString.split("-")[1].replace(/ +/g, "");
                                }

                                if (index == 0) {
                                    this.selectedDate[0] = "00:00";
                                    this.selectedDate[1] = "00:00";
                                    this.selectedMode[0] = 4;
                                } else if (index == 1) {
                                    this.selectedDate[2] = "00:00";
                                    this.selectedDate[3] = "00:00";
                                    this.selectedMode[1] = 4;
                                } else if (index == 2) {
                                    this.selectedDate[4] = "00:00";
                                    this.selectedDate[5] = "00:00";
                                    this.selectedMode[2] = 4;
                                }

                                let a = {
                                    "programAyar": {
                                        "haftaiciProgrami":
                                        {
                                            "kurulumSaati": this.selectedDate[0] == "00:00" ? 0 : this.selectedDate[0].split(':')[0],
                                            "kurulumDk": this.selectedDate[0] == "00:00" ? 0 : this.selectedDate[0].split(':')[1],
                                            "kapatmaSaati": this.selectedDate[1] == "00:00" ? 0 : this.selectedDate[1].split(':')[0],
                                            "kapatmaDk": this.selectedDate[1] == "00:00" ? 0 : this.selectedDate[1].split(':')[1],
                                            "kurulumModu": this.selectedMode[0]
                                        },
                                        "cumartesiProgrami":
                                        {
                                            "kurulumSaati": this.selectedDate[2] == "00:00" ? 0 : this.selectedDate[2].split(':')[0],
                                            "kurulumDk": this.selectedDate[2] == "00:00" ? 0 : this.selectedDate[2].split(':')[1],
                                            "kapatmaSaati": this.selectedDate[3] == "00:00" ? 0 : this.selectedDate[3].split(':')[0],
                                            "kapatmaDk": this.selectedDate[3] == "00:00" ? 0 : this.selectedDate[3].split(':')[1],
                                            "kurulumModu": this.selectedMode[1]
                                        },
                                        "pazarProgrami":
                                        {
                                            "kurulumSaati": this.selectedDate[4] == "00:00" ? 0 : this.selectedDate[4].split(':')[0],
                                            "kurulumDk": this.selectedDate[4] == "00:00" ? 0 : this.selectedDate[4].split(':')[1],
                                            "kapatmaSaati": this.selectedDate[5] == "00:00" ? 0 : this.selectedDate[5].split(':')[0],
                                            "kapatmaDk": this.selectedDate[5] == "00:00" ? 0 : this.selectedDate[5].split(':')[1],
                                            "kurulumModu": this.selectedMode[2]
                                        }
                                    }
                                }

                                // setTimeout(() => { this.setState({ visibleForSection: false }) }, 5000);
                                // this.setState({
                                //     visibleForSection: true
                                // });

                                ApiCall.setProgSettingsNew(this.selectedSectionIndex, a).then((x) => {
                                    if (x) {
                                        ApiCall.getStatus(global.deviceId).then(() => {
                                            if (x) {
                                                this.getProgSettings();
                                            }
                                            else
                                                console.log('hata');
                                        });
                                    }
                                    else
                                        console.log('hata');
                                });
                            }} icon={<Icon name="close" size={20} color="red" />} type="outline" title={langObj.deleteProgram} titleStyle={{ color: "black" }} />
                        </View>
                        <View style={{ marginRight: 10 }}>
                            <Button onPress={() => {
                                this.selectedSectionModalIndex = index;
                                if (this.state.flagProgSettings[this.selectedSectionIndex].haftaiciProgrami.timeString == '00 : 00 - 00 : 00') {
                                    this.selectedDate[0] = "00:00";
                                    this.selectedDate[1] = "00:00";
                                } else {
                                    this.selectedDate[0] = this.state.flagProgSettings[this.selectedSectionIndex].haftaiciProgrami.timeString.split("-")[0].replace(/ +/g, "");
                                    this.selectedDate[1] = this.state.flagProgSettings[this.selectedSectionIndex].haftaiciProgrami.timeString.split("-")[1].replace(/ +/g, "");
                                }
                                if (this.state.flagProgSettings[this.selectedSectionIndex].cumartesiProgrami.timeString == '00 : 00 - 00 : 00') {
                                    this.selectedDate[2] = "00:00";
                                    this.selectedDate[3] = "00:00";
                                } else {
                                    this.selectedDate[2] = this.state.flagProgSettings[this.selectedSectionIndex].cumartesiProgrami.timeString.split("-")[0].replace(/ +/g, "");
                                    this.selectedDate[3] = this.state.flagProgSettings[this.selectedSectionIndex].cumartesiProgrami.timeString.split("-")[1].replace(/ +/g, "");
                                }
                                if (this.state.flagProgSettings[this.selectedSectionIndex].pazarProgrami.timeString == '00 : 00 - 00 : 00') {
                                    this.selectedDate[4] = "00:00";
                                    this.selectedDate[5] = "00:00";
                                } else {
                                    this.selectedDate[4] = this.state.flagProgSettings[this.selectedSectionIndex].pazarProgrami.timeString.split("-")[0].replace(/ +/g, "");
                                    this.selectedDate[5] = this.state.flagProgSettings[this.selectedSectionIndex].pazarProgrami.timeString.split("-")[1].replace(/ +/g, "");
                                }
                            }} icon={<Icon name="edit" size={20} color="green" />} type="outline" title={langObj.editProgram} titleStyle={{ color: "black" }} />
                        </View>
                    </View>
                </View>
                <View style={{ height: 2, width: '100%', backgroundColor: 'gainsboro', marginTop: 10 }} ></View>
            </View>
        );
    }

    renderChildNew(title, index) {
        return (
            <View>
                <TouchableOpacity onPress={() => { this.selectedSectionIndex = index; }} style={{ marginTop: 10, elevation: 5 }}>
                    <View style={{ flexDirection: "row", alignSelf: "center", width: '100%', justifyContent: "space-between" }}>
                        <View>
                            <Text style={{ fontWeight: "bold", margin: 10, marginLeft: 20, color: 'black', fontSize: 18 }}>{title}</Text>
                        </View>
                        <View style={{ marginRight: 10 }}>
                            <Icon containerStyle={{ width: 40, margin: 5 }} name="edit" size={28} color="gray"
                                onPress={() => {
                                    this.selectedSectionIndex = index;
                                }}
                            />
                        </View>
                    </View>
                    <View style={{ height: 2, width: '100%', backgroundColor: 'gainsboro', marginTop: 5 }} ></View>
                </TouchableOpacity>
            </View>
        );
    }

    render() {
        let flagDeviceId = global.deviceId;
        let result = flagDeviceId.substring(10).substring(0, 8);
        if (result == "00000000") flagDeviceId = flagDeviceId.substring(0, 6) + flagDeviceId.substring(18);

        if (result == "00000000") {
            return (
                <View style={{ flex: 1 }}>
                    <DeviceLogin loading={this.psd} close={() => { this.psd = false }} back={() => { this.props.navigation.goBack(); }} />
                    <ScrollView style={{ backgroundColor: 'white', flex: 1 }}>
                        <View style={{ flex: 1 }} >
                            {(this.state.menu[0] != undefined && this.state.menu[0]) && this.renderChildNew(langObj.section1, 0)}
                            {(this.state.menu[1] != undefined && this.state.menu[1]) && this.renderChildNew(langObj.section2, 1)}
                            {(this.state.menu[2] != undefined && this.state.menu[2]) && this.renderChildNew(langObj.section3, 2)}
                            {(this.state.menu[3] != undefined && this.state.menu[3]) && this.renderChildNew(langObj.section4, 3)}
                        </View>

                        {this.state.flagProgSettings != null && this.selectedSectionIndex != null && <Modal
                            animationType={'none'}
                            visible={this.selectedSectionIndex != null}
                            onRequestClose={() => {
                                this.selectedSectionIndex = null;
                            }}>
                            <Modal
                                transparent={true}
                                animationType={'none'}
                                visible={this.selectedSectionModalIndex != null}
                                onRequestClose={() => {
                                    this.selectedSectionModalIndex = null;
                                }}>
                                <View style={styles.modalBackground}>
                                    <View style={styles.activityIndicatorWrapper}>
                                        {Platform.OS === 'android' &&
                                            <View>
                                                <Text style={{ fontWeight: "bold", alignSelf: 'center' }}>{langObj.setAlarmSystem}</Text>
                                                <DatePicker
                                                    style={{ width: 250, borderColor: "transparent", borderWidth: 0, alignSelf: 'center', marginRight: 20 }}
                                                    date={this.selectedDate[this.selectedSectionModalIndex * 2]}
                                                    placeholder={langObj.selectStartTime}
                                                    androidMode="spinner"
                                                    mode="time"
                                                    format="HH:mm"
                                                    is24Hour={true}
                                                    showIcon={true}
                                                    confirmBtnText="Confirm"
                                                    cancelBtnText="Cancel"
                                                    customStyles={{
                                                        dateIcon: { position: "absolute", left: 0, top: 4, marginLeft: 0 },
                                                        dateInput: { marginLeft: 36, borderWidth: 0 }
                                                    }}
                                                    onDateChange={(date) => { this.selectedDate[this.selectedSectionModalIndex * 2] = date; }}
                                                />
                                                <Text style={{ fontWeight: "bold", alignSelf: 'center' }}>{langObj.cancelAlarmSystem}</Text>
                                                <DatePicker
                                                    style={{ width: 250, borderColor: "transparent", borderWidth: 0, alignSelf: 'center', marginRight: 20 }}
                                                    date={this.selectedDate[this.selectedSectionModalIndex * 2 + 1]}
                                                    placeholder={langObj.selectEndTime}
                                                    androidMode="spinner"
                                                    mode="time"
                                                    format="HH:mm"
                                                    is24Hour={true}
                                                    showIcon={true}
                                                    confirmBtnText="Confirm"
                                                    cancelBtnText="Cancel"
                                                    customStyles={{
                                                        dateIcon: { position: "absolute", left: 0, top: 4, marginLeft: 0 },
                                                        dateInput: { marginLeft: 36, borderWidth: 0 }
                                                    }}
                                                    onDateChange={(date) => { this.selectedDate[this.selectedSectionModalIndex * 2 + 1] = date; }}
                                                />
                                            </View>}
                                        {Platform.OS === 'ios' &&
                                            <View style={{ alignItems: 'center', justifyContent: 'space-between', width: "100%" }}>
                                                <Text style={{ fontWeight: "bold", alignSelf: 'center' }}>
                                                    {langObj.setAlarmSystem}
                                                </Text>
                                                <DateTimePicker
                                                    testID="dateTimePicker1"
                                                    style={{ width: 100, alignItems: "center" }}
                                                    value={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), this.selectedDate[this.selectedSectionModalIndex * 2].split(":")[0], this.selectedDate[this.selectedSectionModalIndex * 2].split(":")[1], 0)}
                                                    mode="time"
                                                    is24Hour={true}
                                                    display="inline"
                                                    onChange={(event, selectedDate) => {
                                                        const currentDate = selectedDate || date;
                                                        var d = currentDate,
                                                            h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
                                                            m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
                                                        this.selectedDate[this.selectedSectionModalIndex * 2] = h + ':' + m;
                                                    }}
                                                />
                                                <Text style={{ fontWeight: "bold", marginRight: 15, marginLeft: 10 }}>
                                                    {langObj.cancelAlarmSystem}
                                                </Text>
                                                <DateTimePicker
                                                    testID="dateTimePicker2"
                                                    style={{ width: 100, alignItems: "center" }}
                                                    value={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), this.selectedDate[this.selectedSectionModalIndex * 2 + 1].split(":")[0], this.selectedDate[this.selectedSectionModalIndex * 2 + 1].split(":")[1], 0)}
                                                    mode="time"
                                                    is24Hour={true}
                                                    display="inline"
                                                    onChange={(event, selectedDate) => {
                                                        const currentDate = selectedDate || date;
                                                        var d = currentDate,
                                                            h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
                                                            m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
                                                        this.selectedDate[this.selectedSectionModalIndex * 2 + 1] = h + ':' + m;
                                                    }}
                                                />
                                            </View>}
                                        <View>
                                            <Text style={{ fontWeight: "bold", marginBottom: 15 }} >{langObj.armMode}</Text>
                                            <RadioForm
                                                radio_props={kurulumprops}
                                                initial={0}
                                                style={{ width: '100%', backgroundColor: 'transparent', alignItems: 'flex-start' }}
                                                wrapStyle={{ width: 70, alignSelf: 'flex-start' }}
                                                buttonColor={"#cc1e18"}
                                                selectedButtonColor={"#cc1e18"}
                                                onPress={(value) => { this.selectedMode[this.selectedSectionModalIndex] = value }}
                                            />
                                        </View>
                                        <View style={{ flexDirection: 'row', marginLeft: 30, marginRight: 30 }} >
                                            <Button borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18" }} title={langObj.cancel} onPress={() => { this.selectedSectionModalIndex = null; }} />
                                            <Button borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginLeft: 20 }} title={langObj.ok}
                                                onPress={() => {
                                                    NetInfo.fetch().then(state => {
                                                        if (state.isConnected) {
                                                            let b = {
                                                                "programAyar": {
                                                                    "haftaiciProgrami":
                                                                    {
                                                                        "kurulumSaati": this.selectedDate[0] == "00:00" ? 0 : this.selectedDate[0].split(':')[0],
                                                                        "kurulumDk": this.selectedDate[0] == "00:00" ? 0 : this.selectedDate[0].split(':')[1],
                                                                        "kapatmaSaati": this.selectedDate[1] == "00:00" ? 0 : this.selectedDate[1].split(':')[0],
                                                                        "kapatmaDk": this.selectedDate[1] == "00:00" ? 0 : this.selectedDate[1].split(':')[1],
                                                                        "kurulumModu": this.selectedMode[0]
                                                                    },
                                                                    "cumartesiProgrami":
                                                                    {
                                                                        "kurulumSaati": this.selectedDate[2] == "00:00" ? 0 : this.selectedDate[2].split(':')[0],
                                                                        "kurulumDk": this.selectedDate[2] == "00:00" ? 0 : this.selectedDate[2].split(':')[1],
                                                                        "kapatmaSaati": this.selectedDate[3] == "00:00" ? 0 : this.selectedDate[3].split(':')[0],
                                                                        "kapatmaDk": this.selectedDate[3] == "00:00" ? 0 : this.selectedDate[3].split(':')[1],
                                                                        "kurulumModu": this.selectedMode[1]
                                                                    },
                                                                    "pazarProgrami":
                                                                    {
                                                                        "kurulumSaati": this.selectedDate[4] == "00:00" ? 0 : this.selectedDate[4].split(':')[0],
                                                                        "kurulumDk": this.selectedDate[4] == "00:00" ? 0 : this.selectedDate[4].split(':')[1],
                                                                        "kapatmaSaati": this.selectedDate[5] == "00:00" ? 0 : this.selectedDate[5].split(':')[0],
                                                                        "kapatmaDk": this.selectedDate[5] == "00:00" ? 0 : this.selectedDate[5].split(':')[1],
                                                                        "kurulumModu": this.selectedMode[2]
                                                                    }
                                                                }
                                                            }

                                                            // setTimeout(() => { this.setState({ visible: false }) }, 5000);
                                                            // this.setState({
                                                            //     visible: true
                                                            // });

                                                            ApiCall.setProgSettingsNew(this.selectedSectionIndex, b).then((x) => {
                                                                if (x) {
                                                                    this.getProgSettings();
                                                                }
                                                                else
                                                                    console.log('hata');
                                                            });
                                                            this.selectedSectionModalIndex = null;
                                                        }
                                                        else
                                                            Toast.show(langObj.internetConnFail, Toast.LONG);
                                                    });
                                                }}
                                            />
                                        </View>
                                    </View>
                                </View>
                            </Modal>

                            <View style={{ flex: 1, justifyContent: 'space-between', backgroundColor: 'white', ...Platform.select({ ios: { marginTop: 40 } }) }} >
                                <Spinner visible={this.state.visibleForSection} textContent={langObj.loading} textStyle={styles.spinnerTextStyle} />
                                <View style={{ marginTop: 10 }} >
                                    {this.renderChild2(langObj.weekday, 0)}
                                    {this.renderChild2(langObj.saturday, 1)}
                                    {this.renderChild2(langObj.sunday, 2)}
                                </View>
                                <View style={{ width: '100%' }}>
                                    <Button borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginBottom: 20, marginRight: 10, marginLeft: 10 }} title={langObj.close}
                                        onPress={() => {
                                            this.selectedSectionIndex = null;
                                            this.setState({ visibleForSection: false });
                                            // NetInfo.fetch().then(state => {
                                            //     if (state.isConnected) {
                                            //         setTimeout(() => { this.setState({ visibleForSection: false }) }, 5000);
                                            //         this.setState({
                                            //             visibleForSection: true
                                            //         });
                                            //         ApiCall.getStatus(global.deviceId);
                                            //         ApiCall.setArmP(3).then(x => {
                                            //             this.loading = false;
                                            //             this.setState({
                                            //                 visible: false
                                            //             });
                                            //         });
                                            //     }
                                            //     else
                                            //         Toast.show(langObj.internetConnFail, Toast.LONG);
                                            // });
                                        }}
                                    />
                                </View>
                            </View>
                        </Modal>}
                    </ScrollView>
                </View>
            );
        }
        else {
            return (
                <View style={{ flex: 1, justifyContent: 'space-between', backgroundColor: 'white' }} >
                    <Spinner visible={this.state.visible} textContent={langObj.loading} textStyle={styles.spinnerTextStyle} />
                    <DeviceLogin loading={this.psd} close={() => { this.psd = false }} back={() => { this.props.navigation.goBack(); }} />
                    <View style={{ marginTop: 10 }} >
                        {this.renderChild(langObj.weekday, global.statusData.data.programayar.haftaiciprogrami.timestring == '00 : 00 - 00 : 00' ? langObj.notProgrammed : global.statusData.data.programayar.haftaiciprogrami.timestring, global.statusData.data.programayar.haftaiciprogrami.kurulummodu, 0)}
                        {this.renderChild(langObj.saturday, global.statusData.data.programayar.cumartesiprogrami.timestring == '00 : 00 - 00 : 00' ? langObj.notProgrammed : global.statusData.data.programayar.cumartesiprogrami.timestring, global.statusData.data.programayar.cumartesiprogrami.kurulummodu, 1)}
                        {this.renderChild(langObj.sunday, global.statusData.data.programayar.pazarprogrami.timestring == '00 : 00 - 00 : 00' ? langObj.notProgrammed : global.statusData.data.programayar.pazarprogrami.timestring, global.statusData.data.programayar.pazarprogrami.kurulummodu, 2)}
                    </View>
                    <View style={{ width: '100%' }}>
                        <Button borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginBottom: 20, marginRight: 10, marginLeft: 10 }} title={langObj.armProgrammed}
                            onPress={() => {
                                NetInfo.fetch().then(state => {
                                    if (state.isConnected) {
                                        setTimeout(() => { this.setState({ visible: false }) }, 5000);
                                        this.setState({
                                            visible: true
                                        });
                                        ApiCall.getStatus(global.deviceId);
                                        ApiCall.setArmP(3).then(x => {
                                            this.loading = false;
                                            this.setState({
                                                visible: false
                                            });
                                        });
                                    }
                                    else
                                        Toast.show(langObj.internetConnFail, Toast.LONG);
                                });
                            }}
                        />
                    </View>
                    <Modal
                        transparent={true}
                        animationType={'none'}
                        visible={this.selectedIndex != null}>
                        <View style={styles.modalBackground}>
                            <View style={styles.activityIndicatorWrapper}>
                                {Platform.OS === 'android' &&
                                    <View>
                                        <Text style={{ fontWeight: "bold", alignSelf: 'center' }}>
                                            {langObj.setAlarmSystem}
                                        </Text>
                                        <DatePicker
                                            style={{ width: 250, borderColor: "transparent", borderWidth: 0, alignSelf: 'center', marginRight: 20 }}
                                            date={this.selectedDate[this.selectedIndex * 2]}
                                            placeholder={langObj.selectStartTime}
                                            androidMode="spinner"
                                            mode="time"
                                            format="HH:mm"
                                            is24Hour={true}
                                            showIcon={true}
                                            confirmBtnText="Confirm"
                                            cancelBtnText="Cancel"
                                            customStyles={{
                                                dateIcon: {
                                                    position: "absolute",
                                                    left: 0,
                                                    top: 4,
                                                    marginLeft: 0
                                                },
                                                dateInput: {
                                                    marginLeft: 36,
                                                    borderWidth: 0
                                                }
                                            }}
                                            onDateChange={(date) => { this.selectedDate[this.selectedIndex * 2] = date; }}
                                        />
                                        <Text style={{ fontWeight: "bold", alignSelf: 'center' }}>
                                            {langObj.cancelAlarmSystem}
                                        </Text>
                                        <DatePicker
                                            style={{ width: 250, borderColor: "transparent", borderWidth: 0, alignSelf: 'center', marginRight: 20 }}
                                            date={this.selectedDate[this.selectedIndex * 2 + 1]}
                                            placeholder={langObj.selectEndTime}
                                            androidMode="spinner"
                                            mode="time"
                                            format="HH:mm"
                                            is24Hour={true}
                                            showIcon={true}
                                            confirmBtnText="Confirm"
                                            cancelBtnText="Cancel"
                                            customStyles={{
                                                dateIcon: {
                                                    position: "absolute",
                                                    left: 0,
                                                    top: 4,
                                                    marginLeft: 0
                                                },
                                                dateInput: {
                                                    marginLeft: 36,
                                                    borderWidth: 0
                                                }
                                            }}
                                            onDateChange={(date) => { this.selectedDate[this.selectedIndex * 2 + 1] = date; }}
                                        />
                                    </View>
                                }

                                {Platform.OS === 'ios' &&
                                    <View style={{ alignItems: 'center', justifyContent: 'space-between', width: "100%" }}>
                                        <Text style={{ fontWeight: "bold", alignSelf: 'center' }}>
                                            {langObj.setAlarmSystem}
                                        </Text>
                                        <DateTimePicker
                                            testID="dateTimePicker1"
                                            style={{ width: 100, alignItems: "center" }}
                                            value={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), this.selectedDate[this.selectedIndex * 2].split(":")[0], this.selectedDate[this.selectedIndex * 2].split(":")[1], 0)}
                                            mode="time"
                                            is24Hour={true}
                                            display="inline"
                                            onChange={(event, selectedDate) => {
                                                const currentDate = selectedDate || date;
                                                var d = currentDate,
                                                    h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
                                                    m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
                                                this.selectedDate[this.selectedIndex * 2] = h + ':' + m;
                                            }}
                                        />
                                        <Text style={{ fontWeight: "bold", marginRight: 15, marginLeft: 10 }}>
                                            {langObj.cancelAlarmSystem}
                                        </Text>
                                        <DateTimePicker
                                            testID="dateTimePicker2"
                                            style={{ width: 100, alignItems: "center" }}
                                            value={new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate(), this.selectedDate[this.selectedIndex * 2 + 1].split(":")[0], this.selectedDate[this.selectedIndex * 2 + 1].split(":")[1], 0)}
                                            mode="time"
                                            is24Hour={true}
                                            display="inline"
                                            onChange={(event, selectedDate) => {
                                                const currentDate = selectedDate || date;
                                                var d = currentDate,
                                                    h = (d.getHours() < 10 ? '0' : '') + d.getHours(),
                                                    m = (d.getMinutes() < 10 ? '0' : '') + d.getMinutes();
                                                this.selectedDate[this.selectedIndex * 2 + 1] = h + ':' + m;
                                            }}
                                        />
                                    </View>
                                }
                                <View>
                                    <Text style={{ fontWeight: "bold", marginBottom: 15 }} >{langObj.armMode}</Text>
                                    <RadioForm
                                        radio_props={kurulumprops}
                                        initial={0}
                                        style={{ width: '100%', backgroundColor: 'transparent', alignItems: 'flex-start' }}
                                        wrapStyle={{ width: 70, alignSelf: 'flex-start' }}
                                        buttonColor={"#cc1e18"}
                                        selectedButtonColor={"#cc1e18"}
                                        onPress={(value) => { this.selectedMode[this.selectedIndex] = value }}
                                    />
                                </View>
                                <View style={{ flexDirection: 'row', marginLeft: 30, marginRight: 30 }} >
                                    <Button borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18" }} title={langObj.cancel} onPress={() => { this.selectedIndex = null; }} />
                                    <Button borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginLeft: 20 }} title={langObj.ok}
                                        onPress={() => {
                                            NetInfo.fetch().then(state => {
                                                if (state.isConnected) {
                                                    let b = {
                                                        "data": {
                                                            "programayar": {
                                                                "haftaiciprogrami":
                                                                {
                                                                    "kurulumsaati": this.selectedDate[0] == "00:00" ? 0 : this.selectedDate[0].split(':')[0], "kurulumdk": this.selectedDate[0] == "00:00" ? 0 : this.selectedDate[0].split(':')[1], "kapatmasaati": this.selectedDate[1] == "00:00" ? 0 : this.selectedDate[1].split(':')[0], "kapatmadk": this.selectedDate[1] == "00:00" ? 0 : this.selectedDate[1].split(':')[1],
                                                                    "kurulummodu": this.selectedMode[0]
                                                                },
                                                                "cumartesiprogrami":
                                                                {
                                                                    "kurulumsaati": this.selectedDate[2] == "00:00" ? 0 : this.selectedDate[2].split(':')[0], "kurulumdk": this.selectedDate[2] == "00:00" ? 0 : this.selectedDate[2].split(':')[1], "kapatmasaati": this.selectedDate[3] == "00:00" ? 0 : this.selectedDate[3].split(':')[0], "kapatmadk": this.selectedDate[3] == "00:00" ? 0 : this.selectedDate[3].split(':')[1],
                                                                    "kurulummodu": this.selectedMode[1]
                                                                },
                                                                "pazarprogrami":
                                                                {
                                                                    "kurulumsaati": this.selectedDate[4] == "00:00" ? 0 : this.selectedDate[4].split(':')[0], "kurulumdk": this.selectedDate[4] == "00:00" ? 0 : this.selectedDate[4].split(':')[1], "kapatmasaati": this.selectedDate[5] == "00:00" ? 0 : this.selectedDate[5].split(':')[0], "kapatmadk": this.selectedDate[5] == "00:00" ? 0 : this.selectedDate[5].split(':')[1],
                                                                    "kurulummodu": this.selectedMode[2]
                                                                }
                                                            }
                                                        }
                                                    }
                                                    setTimeout(() => { this.setState({ visible: false }) }, 5000);
                                                    this.setState({
                                                        visible: true
                                                    });
                                                    ApiCall.setProgramSettings(b).then((x) => {
                                                        console.log(x);
                                                        if (x) {
                                                            ApiCall.getStatus(global.deviceId).then(() => {
                                                                this.setState({
                                                                    visible: false
                                                                });
                                                            });
                                                        }
                                                        else
                                                            console.log('hata');
                                                    });
                                                    this.selectedIndex = null;
                                                }
                                                else
                                                    Toast.show(langObj.internetConnFail, Toast.LONG);
                                            });
                                        }}
                                    />
                                </View>
                            </View>
                        </View>
                    </Modal>
                </View>
            );
        }
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#fff",
        justifyContent: "space-between"
    },
    modalContainer: {
        flex: 1,
        marginTop: 10,
        backgroundColor: 'white',
        alignItems: "center",
    },
    innerContainer: {
        alignItems: "center",
        marginTop: 10,
        marginBottom: 10,
        width: '100%',
        backgroundColor: 'gainsboro'
    },
    modalBackground: {
        flex: 1,
        alignItems: 'center',
        flexDirection: 'column',
        justifyContent: 'space-around',
        backgroundColor: '#00000040',
    },
    activityIndicatorWrapper: {
        backgroundColor: '#FFFFFF',
        height: 300,
        width: 300,
        borderRadius: 10,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-around'
    },
    spinnerTextStyle: {
        color: '#FFF'
    }
});

export default Program;