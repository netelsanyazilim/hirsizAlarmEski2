import React, { Component } from "react";
import {
    NativeModules, View, Text, Modal, TouchableOpacity, Platform, Alert,
    BackHandler, StyleSheet, ScrollView, KeyboardAvoidingView, ActivityIndicator
} from "react-native";
import { CommonActions } from '@react-navigation/native';
//import OptItemWithImage from "../Component/OptItemWithImage";
import OptItem from "../Component/OptItem";
import OptItem2 from "../Component/OptItem2";
import { observable, makeObservable, action } from "mobx";
import { observer } from "mobx-react";
import LeftIconButton from "../Component/LeftIconButton";
import LeftIconButtonNumeric from "../Component/LeftIconButtonNumeric";
import NetInfo from "@react-native-community/netinfo";
import ApiService from '../Utils/ApiService';
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
import { Icon, Button } from "react-native-elements";
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

/*var moduleTypes = [langObj.moduleDimmer, langObj.moduleSensor, langObj.moduleValve, langObj.moduleFlood,
langObj.moduleLED, langObj.moduleIR, langObj.modulePIR, langObj.moduleMagnetic, langObj.moduleRelay,
langObj.moduleOneRelay, langObj.moduleCurtain, langObj.moduleOneDimmer, langObj.moduleKeypad,];*/

var moduleConnectionTypes = [langObj.moduleConnTypeRF, langObj.moduleConnTypeWire];

@observer
class WirelessSettingList extends Component {

    @observable visibleSpinner = true;
    @observable visibleEmptyData = false;
    @observable loading = false;

    constructor(props) {
        super(props);
        makeObservable(this);
        this.state = {
            selectedSensor: null,
            selectedSensorInfo: null,
            sensors: [],
            selectedSensorId: 0,
            selectedSensorName: "",
            selectedSensorZonNumber: "",
            selectedSensorGroupNumber: ""
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

    decimalToUTF8(stringArray, index) {
        let flagName = "";
        let stringDecimalArray = stringArray.split(",");
        if (stringDecimalArray[0] != "0") {
            for (let index = 0; index < stringDecimalArray.length; index++) {
                if (parseInt(stringDecimalArray[index]) != 0) {
                    flagName += String.fromCharCode(parseInt(stringDecimalArray[index]));
                } else
                    break;
            }
        } else
            flagName = langObj.relay + " " + index;

        return flagName;
    }

    onBackPress = async () => {
        this.props.navigation.dispatch(
            CommonActions.navigate({
                name: 'WirelessSettings'
            })
        );
        setTimeout(() => { }, 500);
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
        this.getLanguage();
        this.getRFList();
    }

    @action
    getRFList() {
        this.getLanguage();
        NetInfo.fetch().then(state => {
            if (state.isConnected) {
                ApiCall.getRFModulList().then((x) => {
                    if (x) {
                        let flagModulesText = "";
                        for (let index = 0; index < x.length; index++) {
                            flagModulesText += x[index];
                        }

                        let flagModules = flagModulesText.split('{(Q#');
                        let modules = [];
                        let flagIndex = 0;

                        for (let index = 2; index < flagModules.length - 1; index++) {
                            let flagModule = flagModules[index].substring(0, flagModules[index].length - 3);
                            let test = flagModule.split('#');

                            let moduleConnectionType = "";
                            if (test[1] > 30)
                                moduleConnectionType = moduleConnectionTypes[1];
                            else
                                moduleConnectionType = moduleConnectionTypes[0];

                            let moduleLabel = "";
                            let moduleIcon = "";
                            let status = "";

                            var moduleTypes = [langObj.moduleDimmer, langObj.moduleSensor, langObj.moduleValve, langObj.moduleFlood,
                            langObj.moduleLED, langObj.moduleIR, langObj.modulePIR, langObj.moduleMagnetic, langObj.moduleRelay,
                            langObj.moduleOneRelay, langObj.moduleCurtain, langObj.moduleOneDimmer, langObj.moduleKeypad,];

                            //#region Modül Tipi ve Icon Belirleme
                            if (test[1] == "1") {
                                moduleLabel = moduleTypes[0];
                                moduleIcon = "av-timer";
                            } else if (test[1] == "2") {
                                moduleLabel = moduleTypes[1];
                                moduleIcon = "temperature-celsius";  //cast-connected
                            } else if (test[1] == "3") {
                                moduleLabel = moduleTypes[2];
                                moduleIcon = "valve";   //settings
                            } else if (test[1] == "4") {
                                moduleLabel = moduleTypes[3];
                                moduleIcon = "pipe-leak";  //gradient
                            } else if (test[1] == "5") {
                                moduleLabel = moduleTypes[4];
                                moduleIcon = "flare";
                            } else if (test[1] == "6") {
                                moduleLabel = moduleTypes[5];
                                moduleIcon = "blur-on";
                            } else if (test[1] == "7") {
                                moduleLabel = moduleTypes[6];
                                moduleIcon = "motion-sensor";   //directions-run
                                if (test[5] == 1)
                                    status = langObj.motionDetected;
                                else
                                    status = langObj.noMotionDetected;
                            } else if (test[1] == "8") {
                                moduleLabel = moduleTypes[7];
                                moduleIcon = "magnet";   //pie-chart
                                if (test[5] == 1)
                                    status = langObj.contactOpen;
                                else
                                    status = langObj.contactClose;
                            } else if (test[1] == "9") {
                                moduleLabel = moduleTypes[8];
                                moduleIcon = "electric-switch";   //swipe
                            } else if (test[1] == "10") {
                                moduleLabel = moduleTypes[9];
                                moduleIcon = "electric-switch";    // swipe
                            } else if (test[1] == "11") {
                                moduleLabel = moduleTypes[10];
                                moduleIcon = "pipe-leak";  //view-array
                            } else if (test[1] == "12") {
                                moduleLabel = moduleTypes[11];
                                moduleIcon = "av-timer";
                            } else if (test[1] == "15") {
                                moduleLabel = moduleTypes[12];
                                moduleIcon = "keyboard";
                            }
                            //#endregion

                            let lastDataTime = "";
                            const parsedQty = Number.parseInt(test[12]);
                            if (!Number.isNaN(parsedQty) && parsedQty != "") {
                                let minutes = parsedQty % 60;
                                let flagMinutes = minutes.toString().length == 1 ? ('0' + minutes) : (minutes);
                                let hours = Math.floor(parsedQty / 60);
                                let flagHours = hours.toString().length == 1 ? ('0' + hours) : (hours);

                                lastDataTime = flagHours + ":" + flagMinutes;
                            } else {
                                lastDataTime = "";
                            }

                            if (test[12] == "0") lastDataTime = "00:00";

                            let rfPower = 0;
                            parsedQty = Number.parseInt(test[10]);
                            if (!Number.isNaN(parsedQty) && parsedQty != "") {
                                rfPower = parsedQty * (6.67);
                            } else {
                                rfPower = 0;
                            }
                            if (test[10] == "0") rfPower = 100;
                            rfPower = "%" + Number.parseInt(rfPower);

                            let batteryPower = 0;
                            parsedQty = Number.parseInt(test[9]);

                            if (!Number.isNaN(parsedQty) && parsedQty != "") {
                                batteryPower = 262 / parsedQty;
                            } else {
                                batteryPower = 0;
                            }
                            if (test[9] == "0") batteryPower = 0;
                            batteryPower = batteryPower.toFixed(2) + " V";

                            modules.push({
                                index: flagIndex,
                                id: test[0],
                                modulId: test[1],
                                label: moduleLabel,
                                icon: moduleIcon,
                                name: test[11],
                                zonNo: test[2],
                                groupNo: test[3],
                                connectionType: moduleConnectionType,
                                batteryPower: batteryPower,
                                rfPower: rfPower,
                                lastDataTime: lastDataTime,
                                status: status
                            });

                            flagIndex = flagIndex + 1;
                        }

                        this.setState({
                            sensors: modules
                        });
                        this.visibleSpinner = false;
                    }
                    else {
                        this.props.navigation.dispatch(
                            CommonActions.navigate({
                                name: 'WirelessSettings'
                            })
                        );
                    }
                });
            }
            else {
                Toast.show(langObj.internetConnFail, Toast.LONG);
                this.props.navigation.dispatch(
                    CommonActions.navigate({
                        name: 'WirelessSettings'
                    })
                );
            }
        });
    }

    render() {

        //TODO: Modüllerin fotoğrafları çekildikten sonra OptItemWithImage içerisindeki görsellere göre liste yeniden şekillenecek.  
        const sensorListRender = this.state.sensors.map((data) => {
            this.visibleEmptyData = true;
            return (
                <TouchableOpacity disabled style={{ marginTop: 5, marginBottom: 5, elevation: 5 }}>
                    <View style={{ flexDirection: "row", alignSelf: "center", width: '100%', justifyContent: "space-between" }}>
                        <View style={{ flex: 1 }}>
                            {/*<OptItemWithImage disabled={true} imgName={data.imgName} title={data.label} subtitle={"Test sensör adı" + "\n" + "Test sensör değerleri"} />*/}


                            <OptItem2 disabled={true} iconname={data.icon} title={data.label} subtitle={data.name + "\n" + data.status} />
                        </View>
                        <View style={{ flexDirection: "row", alignSelf: "center", justifyContent: "space-between" }}>
                            <Icon containerStyle={{ width: 40, margin: 5 }} name="info" size={28} color="#18c6cc"
                                onPress={() => { this.setState({ selectedSensorInfo: data.index }) }}
                            />
                            <Icon containerStyle={{ width: 40, margin: 5, marginRight: 10 }} name="settings" size={28} color="#cc1e18"
                                onPress={() => {
                                    this.setState({
                                        selectedSensor: data.index,
                                        selectedSensorId: data.id,
                                        selectedSensorName: data.name,
                                        selectedSensorZonNumber: data.zonNo,
                                        selectedSensorGroupNumber: data.groupNo
                                    });
                                }}
                            />
                        </View>
                    </View>
                    <View style={{ height: 2, width: '100%', backgroundColor: 'gainsboro', marginTop: 5 }} ></View>
                </TouchableOpacity>
            )
        });

        return (
            <View style={{ backgroundColor: 'white', flex: 1 }}>
                <View style={{ height: 2, width: '100%', backgroundColor: 'gainsboro' }} ></View>

                {this.visibleSpinner &&
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#ffa000" }}>
                        <Spinner size={100} type={'Wave'} color={"#FFFFFF"} />
                        <Text style={{ marginTop: 10, color: "white" }}>{langObj.loading}</Text>
                    </View>}

                {!this.visibleSpinner &&
                    <ScrollView style={{ marginTop: 5, backgroundColor: "white" }}>

                        {!this.visibleEmptyData && <Text style={{ marginLeft: '8%', marginTop: '10%', fontSize: 20 }}> {langObj.sensorList}  </Text>}


                        {sensorListRender}
                    </ScrollView>}

                {(this.state.selectedSensor != null) && <Modal visible={(this.state.selectedSensor != null)} animationType={"slide"} onRequestClose={() => this.setState({ selectedSensor: null })} transparent={true}>
                    <KeyboardAvoidingView style={styles.modalContainer} keyboardShouldPersistTaps={'handled'}>
                        <ScrollView style={{ height: '60%' }}>
                            <Text style={{ margin: 10, marginTop: 20, fontSize: 20, color: "#cc1e18", fontWeight: 'bold', textAlign: 'center' }} >
                                {this.state.sensors[this.state.selectedSensor].label}
                            </Text>
                            <Text style={{ textAlign: 'center', fontWeight: "bold", marginTop: 10, fontSize: 18, color: 'gray' }} >{langObj.modulNameInput}</Text>
                            <View style={styles.innerContainer2}>
                                <View style={{ alignItems: "center" }}>
                                    <LeftIconButton
                                        textColor={'black'} iconname={""} underlineColor={'red'}
                                        type={'ip'} value={this.state.selectedSensorName != "" ? this.state.selectedSensorName : ""}
                                        placeholderTextColor={'rgba(0,0,0,0.4)'} onTextChange={(t) => {
                                            this.setState({ selectedSensorName: t });
                                        }} maxLength={20}
                                    />
                                </View>
                            </View>
                            <Text style={{ textAlign: 'center', fontWeight: "bold", marginTop: 10, fontSize: 18, color: 'gray' }} >{langObj.modulZoneInput}</Text>
                            <View style={styles.innerContainer2}>
                                <View style={{ alignItems: "center" }}>
                                    <LeftIconButtonNumeric
                                        textColor={'black'} iconname={""} underlineColor={'red'}
                                        type={'ip'} value={this.state.selectedSensorZonNumber != "" ? this.state.selectedSensorZonNumber.toString() : ""}
                                        onTextChange={(text) => {
                                            const parsedQty = Number.parseInt(text);
                                            if (!Number.isNaN(parsedQty) && text != "" && text != null) {
                                                if ((parsedQty < 33) && (parsedQty > 0)) {
                                                    this.setState({ selectedSensorZonNumber: parsedQty.toString() });
                                                } else {
                                                    this.setState({ selectedSensorZonNumber: "1" });
                                                    Toast.show(langObj.minAndMaxValue4, Toast.LONG);
                                                }
                                            } else {
                                                this.setState({ selectedSensorZonNumber: "" });
                                            }
                                        }} maxLength={2}
                                    />
                                </View>
                            </View>
                            <Text style={{ textAlign: 'center', fontWeight: "bold", marginTop: 10, fontSize: 18, color: 'gray' }} >{langObj.modulGroupInput}</Text>
                            <View style={styles.innerContainer2}>
                                <View style={{ alignItems: "center" }}>
                                    <LeftIconButtonNumeric
                                        textColor={'black'} iconname={""} underlineColor={'red'}
                                        type={'ip'} value={this.state.selectedSensorGroupNumber != "" ? this.state.selectedSensorGroupNumber.toString() : ""}
                                        onTextChange={(text) => {
                                            const parsedQty = Number.parseInt(text);
                                            if (!Number.isNaN(parsedQty) && text != "" && text != null) {
                                                if ((parsedQty < 256) && (parsedQty > -1)) {
                                                    this.setState({ selectedSensorGroupNumber: parsedQty.toString() });
                                                } else {
                                                    this.setState({ selectedSensorGroupNumber: "0" });
                                                    Toast.show(langObj.minAndMaxValue6, Toast.LONG);
                                                }
                                            } else {
                                                this.setState({ selectedSensorGroupNumber: "" });
                                            }
                                        }} maxLength={3}
                                    />
                                </View>
                            </View>

                            {!this.loading &&

                                <View style={{ borderWidth: 3, borderColor: "#cc1e18", borderRadius: 5, marginTop: 10, marginLeft: 10, marginRight: 10 }}>
                                    <Text style={{ fontSize: 10, textAlign: 'center', backgroundColor: 'transparent', fontWeight: 'bold', color: 'gray', marginTop: 10 }}>
                                        {langObj.delModuleDescription}
                                    </Text>
                                    <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 5, alignSelf: 'center' }} >
                                        <Button title={langObj.delModule} buttonStyle={{ backgroundColor: "#cc1e18", width: 305, marginRight: 5, marginBottom: 10 }}
                                            onPress={
                                                () => {
                                                    Alert.alert(langObj.delModuleHeader, langObj.delModuleDescriptionConfirm,
                                                        [{ text: langObj.cancel, onPress: () => console.log('Cancel Pressed'), style: 'cancel' },
                                                        {
                                                            text: langObj.delModule, onPress: () => {
                                                                NetInfo.fetch().then(state => {
                                                                    if (state.isConnected) {
                                                                        ApiCall.delRfModule(this.state.selectedSensorId).then(() => {
                                                                            this.setState({
                                                                                selectedSensor: null
                                                                            });
                                                                            this.visibleSpinner = true;
                                                                            this.getRFList();
                                                                        });
                                                                    }
                                                                    else
                                                                        Toast.show(langObj.internetConnFail, Toast.LONG);
                                                                });
                                                            }
                                                        }],
                                                        { cancelable: false }
                                                    );
                                                }} />
                                    </View>
                                </View>}
                        </ScrollView>


                        {!this.loading && <View style={{ marginBottom: 10 }}>
                            <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 5, alignSelf: 'center' }} >
                                <Button title={langObj.cancel} buttonStyle={{ backgroundColor: "#18c6cc", width: 150, marginRight: 5 }}
                                    onPress={() =>
                                        this.setState({
                                            selectedSensor: null
                                        })
                                    } />
                                <Button title={langObj.submit} buttonStyle={{ backgroundColor: "#18c6cc", width: 150, marginLeft: 5 }}
                                    onPress={() => {
                                        NetInfo.fetch().then(state => {
                                            if (state.isConnected) {
                                                let flagRf = {};
                                                let stringTopla = "";
                                                var A;
                                                for (let index = 0; index < this.state.selectedSensorName.length; index++) {
                                                    A = this.state.selectedSensorName.charCodeAt(index);
                                                    if (A >= 97 && A < 123) {
                                                        A = A - 32;
                                                    }

                                                    if (String.fromCharCode(A) == 'Ş' || String.fromCharCode(A) == 'ş') {
                                                        stringTopla = stringTopla + 'S';
                                                    }
                                                    else if (String.fromCharCode(A) == 'Ğ' || String.fromCharCode(A) == 'ğ') {
                                                        stringTopla = stringTopla + 'G';
                                                    }
                                                    else if (String.fromCharCode(A) == 'ı') {
                                                        stringTopla = stringTopla + 'I';
                                                    }
                                                    else {
                                                        stringTopla = stringTopla + String.fromCharCode(A);
                                                    }

                                                }
                                                // Toast.show('stringtopla  ' + stringTopla, Toast.LONG);


                                                //flagRf.rfName = this.state.selectedSensorName;
                                                flagRf.rfName = stringTopla;
                                                flagRf.zonNumber = this.state.selectedSensorZonNumber;
                                                flagRf.groupNumber = this.state.selectedSensorGroupNumber;

                                                ApiCall.setRfSettings((this.state.selectedSensor + 1), flagRf).then((x) => {
                                                    if (x) {
                                                        this.setState({
                                                            selectedSensorName: "",
                                                            selectedSensorZonNumber: "",
                                                            selectedSensorGroupNumber: "",
                                                            selectedSensor: null
                                                        });
                                                    }
                                                    this.visibleSpinner = true;
                                                    this.getRFList();
                                                });
                                            }
                                            else
                                                Toast.show(langObj.internetConnFail, Toast.LONG);
                                        });
                                    }}
                                />
                            </View>

                        </View>}
                        {this.loading && <View style={{ flexDirection: 'row', marginTop: 20, marginBottom: 5, alignSelf: 'center' }} >
                            <ActivityIndicator animating={true} />
                        </View>}
                    </KeyboardAvoidingView>
                </Modal>}

                {(this.state.selectedSensorInfo != null) && <Modal visible={(this.state.selectedSensorInfo != null)} animationType={"slide"} onRequestClose={() => this.setState({ selectedSensorInfo: null })} transparent={true}>
                    <View style={{ flex: 1, alignSelf: 'center', justifyContent: 'center', width: '100%', backgroundColor: "rgba(0,0,0,0.4)" }}>
                        <View style={styles.innerContainer}>
                            <Text style={{ margin: 10, fontSize: 20, color: "#cc1e18", fontWeight: 'bold' }} >
                                {this.state.sensors[this.state.selectedSensorInfo].label}
                            </Text>
                            <View style={{ width: '100%' }}>
                                <View style={{ height: 1, backgroundColor: 'gray', marginTop: 5, marginBottom: 5, width: '100%' }} ></View>
                                <View style={{ flexDirection: 'row', justifyContent: "space-between", width: '100%' }} >
                                    <Text style={{ alignSelf: "center", fontWeight: "bold", fontSize: 16, marginLeft: 20 }}>{langObj.sensorID + ":"}</Text>
                                    <Text style={{ alignSelf: "center", fontSize: 16, marginRight: 20 }}>{this.state.sensors[this.state.selectedSensorInfo].id}</Text>
                                </View>
                                <View style={{ height: 1, backgroundColor: 'gray', marginTop: 5, marginBottom: 5, width: '100%' }} ></View>
                                <View style={{ flexDirection: 'row', justifyContent: "space-between", width: '100%' }} >
                                    <Text style={{ alignSelf: "center", fontWeight: "bold", fontSize: 16, marginLeft: 20 }}>{langObj.modulType + ":"}</Text>
                                    <Text style={{ alignSelf: "center", fontSize: 16, marginRight: 20 }}>{this.state.sensors[this.state.selectedSensorInfo].label}</Text>
                                </View>
                                <View style={{ height: 1, backgroundColor: 'gray', marginTop: 5, marginBottom: 5, width: '100%' }} ></View>
                                <View style={{ flexDirection: 'row', justifyContent: "space-between", width: '100%' }} >
                                    <Text style={{ alignSelf: "center", fontWeight: "bold", fontSize: 16, marginLeft: 20 }}>{langObj.modulName + ":"}</Text>
                                    <Text style={{ alignSelf: "center", fontSize: 16, marginRight: 20 }}>{this.state.sensors[this.state.selectedSensorInfo].name}</Text>
                                </View>
                                <View style={{ height: 1, backgroundColor: 'gray', marginTop: 5, marginBottom: 5, width: '100%' }} ></View>
                                <View style={{ flexDirection: 'row', justifyContent: "space-between", width: '100%' }} >
                                    <Text style={{ alignSelf: "center", fontWeight: "bold", fontSize: 16, marginLeft: 20 }}>{langObj.zoneNo + ":"}</Text>
                                    <Text style={{ alignSelf: "center", fontSize: 16, marginRight: 20 }}>{this.state.sensors[this.state.selectedSensorInfo].zonNo}</Text>
                                </View>
                                <View style={{ height: 1, backgroundColor: 'gray', marginTop: 5, marginBottom: 5, width: '100%' }} ></View>
                                <View style={{ flexDirection: 'row', justifyContent: "space-between", width: '100%' }} >
                                    <Text style={{ alignSelf: "center", fontWeight: "bold", fontSize: 16, marginLeft: 20 }}>{langObj.groupNo + ":"}</Text>
                                    <Text style={{ alignSelf: "center", fontSize: 16, marginRight: 20 }}>{this.state.sensors[this.state.selectedSensorInfo].groupNo}</Text>
                                </View>
                                <View style={{ height: 1, backgroundColor: 'gray', marginTop: 5, marginBottom: 5, width: '100%' }} ></View>
                                <View style={{ flexDirection: 'row', justifyContent: "space-between", width: '100%' }} >
                                    <Text style={{ alignSelf: "center", fontWeight: "bold", fontSize: 16, marginLeft: 20 }}>{langObj.connectionType + ":"}</Text>
                                    <Text style={{ alignSelf: "center", fontSize: 16, marginRight: 20 }}>{this.state.sensors[this.state.selectedSensorInfo].connectionType}</Text>
                                </View>
                                <View style={{ height: 1, backgroundColor: 'gray', marginTop: 5, marginBottom: 5, width: '100%' }} ></View>
                                <View style={{ flexDirection: 'row', justifyContent: "space-between", width: '100%' }} >
                                    <Text style={{ alignSelf: "center", fontWeight: "bold", fontSize: 16, marginLeft: 20 }}>{langObj.batteryPower + ":"}</Text>
                                    <Text style={{ alignSelf: "center", fontSize: 16, marginRight: 20 }}>{this.state.sensors[this.state.selectedSensorInfo].batteryPower}</Text>
                                </View>
                                <View style={{ height: 1, backgroundColor: 'gray', marginTop: 5, marginBottom: 5, width: '100%' }} ></View>
                                <View style={{ flexDirection: 'row', justifyContent: "space-between", width: '100%' }} >
                                    <Text style={{ alignSelf: "center", fontWeight: "bold", fontSize: 16, marginLeft: 20 }}>{langObj.rfPower + ":"}</Text>
                                    <Text style={{ alignSelf: "center", fontSize: 16, marginRight: 20 }}>{this.state.sensors[this.state.selectedSensorInfo].rfPower}</Text>
                                </View>
                                <View style={{ height: 1, backgroundColor: 'gray', marginTop: 5, marginBottom: 5, width: '100%' }} ></View>
                                <View style={{ flexDirection: 'row', justifyContent: "space-between", width: '100%' }} >
                                    <Text style={{ alignSelf: "center", fontWeight: "bold", fontSize: 16, marginLeft: 20 }}>{langObj.lastDataTime + ":"}</Text>
                                    <Text style={{ alignSelf: "center", fontSize: 16, marginRight: 20 }}>{this.state.sensors[this.state.selectedSensorInfo].lastDataTime}</Text>
                                </View>
                                <View style={{ height: 1, backgroundColor: 'gray', marginTop: 5, marginBottom: 5, width: '100%' }} ></View>
                                <View style={{ flexDirection: 'row', justifyContent: "space-between", width: '100%' }} >
                                    <Text style={{ alignSelf: "center", fontWeight: "bold", fontSize: 16, marginLeft: 20 }}>{langObj.status + ":"}</Text>
                                    <Text style={{ alignSelf: "center", fontSize: 16, marginRight: 20 }}>{this.state.sensors[this.state.selectedSensorInfo].status}</Text>
                                </View>
                                <View style={{ height: 1, backgroundColor: 'gray', marginTop: 5, width: '100%' }} ></View>
                            </View>
                            <View style={{ flexDirection: 'row', marginLeft: 10, marginRight: 10, width: '60%', marginBottom: 10, marginTop: 10 }}  >
                                <TouchableOpacity style={styles.appButtonContainerCancel} onPress={() => this.setState({ selectedSensorInfo: null })}>
                                    <Text style={styles.appButtonTextCancel}>{langObj.close}</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </View>
                </Modal>}
            </View>
        );
    }
}

const styles = StyleSheet.create({
    innerContainer: {
        marginLeft: 20,
        marginRight: 20,
        alignItems: "center",
        backgroundColor: 'white',
        borderWidth: 1,
        borderColor: 'gray',
        borderBottomWidth: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.8,
        shadowRadius: 10,
        elevation: 3
    },
    appButtonContainerCancel: {
        alignItems: 'flex-end',
        elevation: 8,
        backgroundColor: "#DDDDDD",
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        marginTop: 10,
        marginBottom: 10,
        justifyContent: 'center',
        width: '100%'
    },
    appButtonTextCancel: {
        fontSize: 14,
        color: "#c0392b",
        fontWeight: "bold",
        alignSelf: "center",
        textTransform: "uppercase"
    },
    modalContainer: {
        flex: 1,
        marginTop: 5,
        backgroundColor: 'white',
        alignItems: "center",
        ...Platform.select({
            ios: {
                marginTop: 40
            }
        }),
    },
    innerContainer2: {
        alignItems: "center",
        width: '100%',
        backgroundColor: 'whitesmoke',
        borderBottomWidth: 1,
        borderColor: 'gainsboro'
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
    },
    dropdownBtnStyle: {
        width: "90%",
        height: 32,
        backgroundColor: "#444",
        borderRadius: 8,
    },
    dropdownBtnTxtStyle: {
        color: "#FFF",
        textAlign: "center",
        fontWeight: "bold",
    },
    dropdownDropdownStyle: { backgroundColor: "#444" },
    dropdownRowStyle: { backgroundColor: "#444", borderBottomColor: "#C5C5C5", height: 32 },
    dropdownRowTxtStyle: {
        color: "#FFF",
        textAlign: "center",
        fontWeight: "bold",
    }
});

export default WirelessSettingList;