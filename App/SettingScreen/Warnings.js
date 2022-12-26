import React, { Component } from "react";
import { Text, NativeModules, View, BackHandler, Alert, FlatList, Platform } from "react-native";
import { CommonActions } from '@react-navigation/native';
import NetInfo from "@react-native-community/netinfo";
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
import { action, observable, makeObservable } from "mobx";
import { observer } from "mobx-react";
import { Icon } from "react-native-elements";
import ApiService from '../Utils/ApiService'
import * as TR from '../assets/tr.json';
import * as EN from '../assets/en.json';

var ApiCall = new ApiService();
let ddate = null;

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
class Warnings extends Component {
    @observable arr = null;
    @observable loading = false;

    constructor(props) {
        super(props);
        makeObservable(this);
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

    translateLog(input) {
        if (langObj == EN) {
            for (var key in EN) {
                if (EN[key] == input) {
                    return langObj[key];
                }
            }
            for (var key in TR) {
                if (TR[key] == input) {
                    return langObj[key];
                }
            }
        }
        else {
            for (var key in TR) {
                if (TR[key] == input)
                    return langObj[key];
            }
            for (var key in EN) {
                if (EN[key] == input)
                    return langObj[key];
            }
        }

        return input;
    }

    translateLogUser(input) {
        if (input.includes("[")) {
            let userForLang = input.split('[');
            let flagArea;
            if (langObj == EN) {
                if (userForLang[1] != undefined)
                    flagUser = userForLang[1];
                if (userForLang[2] != undefined)
                    flagWho = userForLang[2];

                flagArea = flagUser.substr(1, 7);

                switch (flagArea) {
                    case "Bölge 1":
                        flagArea = "Partition 1"
                        break;
                    case "Bölge 2":
                        flagArea = "Partition 2"
                        break;
                    case "Bölge 3":
                        flagArea = "Partition 3"
                        break;
                    case "Bölge 4":
                        flagArea = "Partition 4"
                        break;

                }


                switch (flagUser.substr(9, 10)) {
                    case "1 numaralı":
                        flagUser = "1. "
                        break;
                    case "2 numaralı":
                        flagUser = "2. "
                        break;
                    case "3 numaralı":
                        flagUser = "3. "
                        break;
                    case "4 numaralı":
                        flagUser = "4. "
                        break;
                    case "5 numaralı":
                        flagUser = "5. "
                        break;
                    case "6 numaralı":
                        flagUser = "6. "
                        break;
                    case "7 numaralı":
                        flagUser = "7. "
                        break;
                    case "8 numaralı":
                        flagUser = "8. "
                        break;
                    case "9 numaralı":
                        flagUser = "9."
                        break;
                    case "10 numaral":
                        flagUser = "10."
                        break;
                    case "11 numaral":
                        flagUser = "11."
                        break;
                    case "12 numaral":
                        flagUser = "12."
                        break;
                    case "13 numaral":
                        flagUser = "13."
                        break;
                    case "14 numaral":
                        flagUser = "14."
                        break;
                    case "15 numaral":
                        flagUser = "15."
                        break;
                    case "16 numaral":
                        flagUser = "16."
                        break;
                    case "17 numaral":
                        flagUser = "17."
                        break;
                    case "18 numaral":
                        flagUser = "18."
                        break;
                    case "19 numaral":
                        flagUser = "19."
                        break;
                    case "20 numaral":
                        flagUser = "20."
                        break;
                    case "21 numaral":
                        flagUser = "21."
                        break;
                    case "Program otomatik kurulum":
                        flagUser = "the program was automatically established "
                        break;
                    case "Uzaktan kumanda":
                        flagUser = "Remote Control "
                        break;
                    default:
                        flagUser = "";
                        break;
                }

                switch (flagWho) {
                    case "zon":
                        flagWho = "Zone "
                        break;
                    case "yangın zonu":
                        flagWho = "Fire Zone "
                        break;
                    case "kullanıcı":
                        flagWho = "User "
                        break;
                    case "":
                        flagWho = " "
                        break;
                    case "developer":
                        flagWho = "developer "
                        break;
                    default:
                        if (flagWho.substr(0, 5) == "Modül") {
                            flagWho = "Modul " + flagWho.substr(6, flagWho.length);
                        }
                        if (flagWho.substr(13, 8) == "Manyetik") {
                            flagWho = "Modul " + flagWho.substr(6, 7) + " Magnetic Module" + flagWho.substr(28, flagWho.length);
                        }
                        else if (flagWho.substr(12, 8) == "Manyetik") {
                            flagWho = "Modul " + flagWho.substr(6, 6) + " Magnetic Module" + flagWho.substr(28, flagWho.length);
                        }
                        if (flagWho.substr(13, 6) == "Sensör") {
                            flagWho = "Modul " + flagWho.substr(6, 7) + " Sensor Module" + flagWho.substr(26, flagWho.length);
                        }
                        else if (flagWho.substr(12, 6) == "Sensör") {
                            flagWho = "Modul " + flagWho.substr(6, 6) + " Sensor Module" + flagWho.substr(26, flagWho.length);
                        }
                        if (flagWho.substr(13, 4) == "Vana") {
                            flagWho = "Modul " + flagWho.substr(6, 7) + " Valve Module" + flagWho.substr(24, flagWho.length);
                        }
                        else if (flagWho.substr(12, 6) == "Sensör") {
                            flagWho = "Modul " + flagWho.substr(6, 6) + " Sensor Module" + flagWho.substr(24, flagWho.length);
                        }
                        break;
                }

                return flagArea + " \n" + flagUser + " " + flagWho;
            }
            else {
                return input.split('[').join('');
            }
        } else {
            return input;
        }
    }

    @action
    getData() {
        this.getLanguage().then(() => {
            NetInfo.fetch().then(state => {
                if (state.isConnected) {
                    ApiCall.getEventLog().then((x) => {
                        this.loading = false;
                        if (x) {
                            let flagListData = [];
                            for (let index = 0; index < x.length; index++) {
                                if (JSON.parse(x[index]).title == "Alarm" || JSON.parse(x[index]).title == "Hata")
                                    flagListData.push(x[index]);
                            }

                            this.arr = flagListData;
                        }
                        else
                            Alert.alert(
                                langObj.connErr,
                                langObj.eventLoadErr,
                                [
                                    { text: langObj.tryAgain, onPress: () => this.getData() },
                                    { text: langObj.cancel, onPress: () => this.props.navigation.goBack() },
                                ],
                                { cancelable: false }
                            );
                    }, y => {
                        setTimeout(() => {
                            this.loading = false;
                        }, 5000);
                    });
                }
                else
                    Toast.show(langObj.internetConnFail, Toast.LONG);
            });
        });
    }

    @action
    getDate() {
        ApiCall.getStatus(global.deviceId).then((x) => {
            this.loading = false;
            if (x) {
                this.systemDate = global.statusData.data.gun + " " +
                    global.statusData.data.ay + " 20" +
                    global.statusData.data.yıl + " " +
                    global.statusData.data.saat + ":" +
                    global.statusData.data.dakika + ":" +
                    global.statusData.data.saniye;
                ddate = new Date();
                ddate.setUTCFullYear(global.statusData.data.yıl, global.statusData.data.ay, global.statusData.data.gun);
                ddate.setMinutes(global.statusData.data.dakika);
                ddate.setHours(global.statusData.data.saat);
                ddate.setSeconds(global.statusData.data.saniye);
            }
            else Alert.alert(
                langObj.connErr,
                langObj.eventLoadErr,
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
        })
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

    dateTR(date, type) {
        if (type == 'phone') {
            var date = new Date(date);
            let day = date.getDate();
            let month = date.getMonth() + 1;
            let year = date.getFullYear();
            let hours = date.getHours();
            let minutes = date.getMinutes();
            let seconds = date.getSeconds();
            if (month.toString().length == 1) { month = "0" + month; }
            if (day.toString().length == 1) { day = "0" + day; }
            if (hours.toString().length == 1) { hours = "0" + hours; }
            if (minutes.toString().length == 1) { minutes = "0" + minutes; }
            if (seconds.toString().length == 1) { seconds = "0" + seconds; }
            return hours + ':' + minutes + '  ' + day + '/' + month + '/' + year//+' '+dayNames[weekDay];
        }
        else return date;
    }

    componentDidMount() {
        BackHandler.addEventListener('hardwareBackPress', this.onBackPress);
    }

    render() {
        return (
            <View style={{ justifyContent: 'space-between', flex: 1, backgroundColor: 'white' }} >
                {this.renderZon()}
            </View>
        );
    }

    renderZon() {
        return (
            <FlatList
                data={this.arr}
                renderItem={this._renderItem}
                numColumns={"1"}
                keyExtractor={(item, index) => index.toString()}
            />
        )
    }

    _renderItem = ({ item, index }) => {

        //TODO: Bu sayfada biten akü, yerinden çıkarılan sensör vs. önemli bildirim ve uyarılar bu başlık altında görüntülenecek.

        item = JSON.parse(item);

        let type = "phone-iphone"
        if (item.type == "keypad")
            type = "keyboard"
        else if (item.type == "rf")
            type = "settings-remote"
        return (
            <View style={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <View style={{
                    margin: 10, borderWidth: 1, borderRadius: 6, width: '95%', borderColor: '#ddd',
                    borderBottomWidth: 0, shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.8, shadowRadius: 10, elevation: 3, alignSelf: 'center', backgroundColor: 'white'
                }} >
                    <View style={{ flex: 1, justifyContent: 'space-between', flexDirection: 'row' }} >
                        <View style={{ flexDirection: 'row' }} >
                            <Icon containerStyle={{ marginLeft: 10, marginTop: 7 }} name={type} color="#cc1e18" size={20} />
                            <Text style={{ margin: 10, fontSize: 11 }} >{this.translateLog(item.title)}</Text>
                        </View>
                        <Text style={{ margin: 10, fontSize: 11 }}>{this.dateTR(item.date, item.type)} </Text>
                    </View>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 5 }}>
                        <Text style={{ marginLeft: 10, fontSize: 10 }}>{this.translateLog(item.body)}</Text>
                        <Text style={{ marginRight: 10, fontSize: 10 }}>{this.translateLogUser(item.user).split('[').join('')}</Text>
                    </View>
                </View>
            </View>
        )
    };
}

export default Warnings;