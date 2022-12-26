import React, { Component } from 'react';
import {
    NativeModules, View, TouchableOpacity, Text, Alert, FlatList,
    Dimensions, StyleSheet, LayoutAnimation, Platform, UIManager
} from "react-native";
import { Icon } from "react-native-elements";
import SharedPrefs from '../Utils/SharedPrefs';
import { observable, makeObservable, action } from "mobx";
import { observer } from "mobx-react";
import ZonView from './ZonView2';
import ApiService from '../Utils/ApiService';
import NetInfo from "@react-native-community/netinfo";
import * as TR from '../assets/tr.json';
import * as EN from '../assets/en.json';

var ApiCall = new ApiService();
let deviceWidth = Dimensions.get('window').width;
let deviceHeigth = Dimensions.get('window').height * 0.14;

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
class Accordian extends Component {

    @observable zonName = new Array(32);
    @observable zonTipi = new Array(32);
    @observable zonDurum = new Array(32);

    constructor(props) {
        super(props);
        makeObservable(this);
        this.state = {
            zoneTest: [{ state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 },
            { state: 0, tip: 0, Hata: 0, Alarm: 0 }],
            zones: props.zones,
            status: props.bolgeStatus,
            alarm: props.bolgeAlarm,
            program: props.programAyar,
            haftaninGunu: props.haftaninGunu,
            fireAlarm: props.fireAlarm,
            index: props.index,
            expanded: false,
            programTime: ""
        }
        this.getLanguage();
        this.getZon();
        if (Platform.OS === 'android') {
            UIManager.setLayoutAnimationEnabledExperimental(true);
        }
    }

    @action
    async getZon() {
        let zoneIndexes = [];
        let flagZoneTest = [];

        for (let index = 0; index < 32; index++) {
            if (this.state.zones[index].partition == this.state.index) {
                zoneIndexes.push(index);
                flagZoneTest.push({ state: 0, tip: 0, Hata: 0, Alarm: 0 });
            }
        }

        this.setState({ zoneTest: flagZoneTest });

        for (let index = 0; index < zoneIndexes.length; index++) {
            let stringZoneName = this.decimalToUTF8(this.state.zones[zoneIndexes[index]].zonAdi, index + 1);
            this.zonName[index] = stringZoneName;
            this.zonTipi[index] = this.state.zones[zoneIndexes[index]].zonTipi;
            this.zonDurum[index] = this.state.zones[zoneIndexes[index]].durum;
        }

        if (this.state.haftaninGunu < 6) {
            this.setState({ programTime: this.state.program[this.state.index].haftaiciProgrami.timeString });
        } else if (this.state.haftaninGunu == 6) {
            this.setState({ programTime: this.state.program[this.state.index].cumartesiProgrami.timeString });
        } else if (this.state.haftaninGunu == 7) {
            this.setState({ programTime: this.state.program[this.state.index].pazarProgrami.timeString });
        }
    }

    decimalToUTF8(stringArray, index) {
        let flagZoneName = "";
        let stringDecimalArray = stringArray.split(",");
        if (stringDecimalArray[0] != "0") {
            for (let index = 0; index < stringDecimalArray.length; index++) {
                if (parseInt(stringDecimalArray[index]) != 0) {
                    flagZoneName += String.fromCharCode(parseInt(stringDecimalArray[index]));
                }
            }
        } else
            flagZoneName = langObj.zon + " " + index;

        return flagZoneName;
    }

    @action
    componentDidMount() {
        if (this.state.index == 0) this.setState({ expanded: true });
        this.getLanguage();
        this.getZon();
    }

    @action
    componentDidUpdate(props) {
        let zoneIndexes = [];

        let flagZoneList = JSON.parse(JSON.stringify(props.zones));

        if (flagZoneList.length == 32) {
            for (let index = 0; index < 32; index++) {
                if (flagZoneList[index].partition == this.state.index) {
                    zoneIndexes.push(index);
                }
            }

            for (let index = 0; index < zoneIndexes.length; index++) {
                let stringZoneName = this.decimalToUTF8(flagZoneList[zoneIndexes[index]].zonAdi, index + 1);
                this.zonName[index] = stringZoneName;
                this.zonTipi[index] = flagZoneList[zoneIndexes[index]].zonTipi;
                this.zonDurum[index] = flagZoneList[zoneIndexes[index]].durum;
            }
        }
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
    _renderItem = ({ item, index }) => {
        let zColor = ['#f1c40f', "#c0392b", '#f1c40f', '#f1c40f'];  //sarı, sarı, sarı, kırmızı
        let errorInfo = [langObj.zonStatusNormal, langObj.lineAlarmed, langObj.lineBrokenOrShortCircuit, langObj.lineBrokenOrShortCircuit];

        if (this.zonTipi[index] == 0) {
            return (<ZonView
                color={"white"}
                text={this.zonName[index]}
                blink={true}
            />)
        }
        else if (this.zonDurum[index] > 0) {
            return (
                <View >
                    <TouchableOpacity
                        onPress={() => {
                            Alert.alert(
                                langObj.errorInfo, errorInfo[this.zonDurum[index]],
                                [{ text: langObj.close, onPress: () => console.log('OK Pressed') }],
                                { cancelable: false }
                            );
                        }} >
                        <ZonView
                            color={zColor[this.zonDurum[index]]}
                            text={this.zonName[index]}
                            blink={true}
                        />
                    </TouchableOpacity>
                </View>
            )
        }
        else return (
            <ZonView
                color={"#27ae60"}
                text={this.zonName[index]}
                blink={true}
            />);
    }

    //hata ve alarm noktalarını kontrol et kurmadan önce
    checkErrorAndWarnings() {
        for (let a = 0; a < 4; a++) {
            if (ApiCall.ZonStateAlarmNoktasi[a + 9] > 0) { return true }
        }
        ApiCall.ZonStateHataNoktasi.map((entry) => {
            if (entry > 0) {
                return true;
            }
            else return false
        })
    }

    render() {
        let alarmInfo = ["", langObj.statusAlarmWillSound, langObj.statusAlarmEmergency, langObj.statusAlarmSudden, langObj.statusAlarmSilent,
            langObj.statusAlarmPanic, langObj.statusAlarmSounded, langObj.statusAlarmEmergencySounded, langObj.statusAlarmSuddenSounded,
            langObj.statusAlarmSilentSounded, langObj.statusAlarmPanicSounded, langObj.statusAlarmSoundEnd];

        let statusInfo = [langObj.disabled, langObj.outsideArmed, langObj.insideArmed, langObj.programmed, langObj.programOutsideArmed,
        langObj.programInsideArmed];

        let statusBackgroundColor = ['#cc1e18', 'green', 'blue', "#1abc9c", "#1abc9c", "#1abc9c"];  //kırmızı, yeşil, mavi, açık yeşil, aç...

        return (
            <View>
                <View style={{ height: 1, color: '#ffffff', width: '100%' }} />
                <TouchableOpacity style={styles.row} onPress={() => this.toggleExpand()}>
                    <Text style={[styles.title]}>{this.props.title}</Text>
                    <Icon name={this.state.expanded ? 'keyboard-arrow-up' : 'keyboard-arrow-down'} size={30} color={'#5E5E5E'} />
                </TouchableOpacity>
                {this.state.expanded && <View style={{ borderRadius: 6, marginTop: 5 }} >
                    <View style={{
                        width: deviceWidth, height: deviceHeigth - 30, backgroundColor: 'white', flexDirection: 'row', alignItems: 'center', borderWidth: 1,
                        borderRadius: 2, borderColor: '#ddd', borderBottomWidth: 0, borderRightWidth: 0, shadowColor: '#ddd',
                        shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.8, shadowRadius: 2, elevation: 4, marginBottom: 10
                    }} >
                        <TouchableOpacity style={{ flex: 1 }}
                            onPress={() => {
                                if (this.checkErrorAndWarnings())
                                    Alert.alert(
                                        langObj.sure,
                                        langObj.alarmWillSound,
                                        [
                                            { text: langObj.arm, onPress: () => { this.htmlSetupColor = "#2962ff"; ApiCall.setArmP(3); } },
                                            { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                        ],
                                        { cancelable: false }
                                    );
                                else {
                                    this.htmlSetupColor = "#2962ff";
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
                                }
                            }} >
                            <View style={{
                                flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', alignItems: 'center',
                                backgroundColor: this.state.status[this.state.index] == 3 ? '#1abc9c' : 'transparent'
                            }}>
                                <Icon
                                    containerStyle={{ marginLeft: 10, marginRight: 5, width: 40 }}
                                    name="calendar-clock"
                                    type="material-community"
                                    color={this.state.status[this.state.index] == 3 ? 'white' : '#30363b'}
                                    size={28}
                                />
                                <Text style={{ color: this.state.status[this.state.index] == 3 ? 'white' : '#30363b' }} >{langObj.programming}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1 }}
                            onPress={() => {
                                if (this.checkErrorAndWarnings())
                                    Alert.alert(
                                        langObj.sure,
                                        langObj.alarmWillSound,
                                        [
                                            { text: langObj.arm, onPress: () => { this.htmlSetupColor = "#2962ff"; ApiCall.setArm(2); } },
                                            { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                        ],
                                        { cancelable: false }
                                    );
                                else {
                                    this.htmlSetupColor = "#2962ff"; ApiCall.setArm(2);
                                }
                            }} >
                            <View style={{
                                flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', alignItems: 'center',
                                backgroundColor: this.state.status[this.state.index] == 2 ? 'blue' : 'transparent'
                            }}>
                                <Icon
                                    containerStyle={{ marginLeft: 10, marginRight: 5, width: 40 }}
                                    name="home"
                                    color={this.state.status[this.state.index] == 2 ? 'white' : '#30363b'}
                                    size={28}
                                />
                                <Text style={{ color: this.state.status[this.state.index] == 2 ? 'white' : '#30363b' }} >{langObj.home}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => {
                            if (this.checkErrorAndWarnings())
                                Alert.alert(
                                    langObj.sure,
                                    langObj.alarmWillSound,
                                    [
                                        { text: langObj.arm, onPress: () => { this.htmlSetupColor = "green"; ApiCall.setArm(1); } },
                                        { text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                    ],
                                    { cancelable: false }
                                )
                            else {
                                this.htmlSetupColor = "green";
                                ApiCall.setArm(1);
                            }
                        }} >
                            <View style={{
                                flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', alignItems: 'center',
                                backgroundColor: this.state.status[this.state.index] == 1 ? 'green' : 'transparent'
                            }}>
                                <Icon
                                    containerStyle={{ marginLeft: 10, marginRight: 5, width: 40 }}
                                    name="verified-user"
                                    size={28}
                                    color={this.state.status[this.state.index] == 1 ? 'white' : '#30363b'}
                                />
                                <Text style={{ color: this.state.status[this.state.index] == 1 ? 'white' : '#30363b' }} >{langObj.away}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity style={{ flex: 1 }} onPress={() => { this.htmlSetupColor = "#d32f2f"; ApiCall.disarmSystem(); }}
                            delayLongPress={300} onLongPress={() => { this.disarmSystemAlert = true; }} >
                            <View style={{ flex: 1, height: '100%', alignItems: 'center', justifyContent: 'center', backgroundColor: this.state.status[this.state.index] == 0 ? '#cc1e18' : 'transparent' }}>
                                <Icon
                                    containerStyle={{ width: 40, alignSelf: 'center' }}
                                    name="clear"
                                    color={this.state.status[this.state.index] == 0 ? 'white' : '#30363b'}
                                    size={28}
                                />
                                <Text style={{ color: this.state.status[this.state.index] == 0 ? 'white' : '#30363b' }} >{langObj.disable}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>

                    {(!this.state.fireAlarm) && <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <View style={{
                            borderWidth: 1, borderRadius: 6, width: '90%', height: 40, flexDirection: 'row', alignItems: 'center',
                            justifyContent: 'space-between', borderBottomWidth: 0,
                            borderColor: this.state.status[this.state.index] == 0 ? 'gray' : statusBackgroundColor[this.state.status[this.state.index]],
                            backgroundColor: this.state.status[this.state.index] == 0 ? 'gray' : statusBackgroundColor[this.state.status[this.state.index]],
                        }}>
                            {(this.state.status[this.state.index] > 2) && <Text style={{ marginLeft: 10, color: 'white', fontSize: 13 }}>{this.state.programTime}</Text>}
                            {(this.state.status[this.state.index] <= 2) && <Text style={{ marginLeft: 10, color: 'white', fontSize: 13 }}>{alarmInfo[this.state.alarm[this.state.index]]}</Text>}
                            <Text style={{ marginRight: 10, color: 'white', fontSize: 13 }}>{langObj.status + ": " + statusInfo[this.state.status[this.state.index]]}</Text>
                        </View>
                    </View>}

                    {(this.state.fireAlarm) && <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
                        <View style={{
                            borderWidth: 1, borderRadius: 6, width: '90%', height: 40, flexDirection: 'row', alignItems: 'center',
                            justifyContent: 'space-between', borderBottomWidth: 0,
                            borderColor: "#cc1e18",
                            backgroundColor: "#cc1e18"
                        }}>
                            <Icon containerStyle={{ marginLeft: 10, width: 30 }} name="local-fire-department" color='white' size={30} />
                            <Text style={{ color: 'white', fontSize: 13 }}>{langObj.statusAlarmFire}</Text>
                            <Text style={{ marginRight: 10, color: 'white', fontSize: 13 }}>{langObj.status + ": " + statusInfo[this.state.status[this.state.index]]}</Text>
                        </View>
                    </View>}

                    <View style={{ alignItems: 'center' }}>
                        <FlatList
                            data={this.state.zoneTest}
                            renderItem={this._renderItem}
                            numColumns={4}
                            keyExtractor={(item, index) => index}
                            columnWrapperStyle={{ margin: 5 }}
                        />
                    </View>
                </View>
                }

            </View>
        )
    }

    toggleExpand = () => {
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        this.setState({ expanded: !this.state.expanded })
    }

}

const styles = StyleSheet.create({
    container: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    title: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#5E5E5E',
    },
    row: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        height: 56,
        paddingLeft: 25,
        paddingRight: 18,
        alignItems: 'center',
        backgroundColor: '#ececec',
    }
});

export default Accordian;