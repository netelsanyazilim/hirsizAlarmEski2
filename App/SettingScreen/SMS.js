import React, { Component } from "react";
import {
  StyleSheet, Text, NativeModules, View, Platform,
  TextInput, BackHandler, Alert
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import { CommonActions } from '@react-navigation/native';
import { action, observable, makeObservable, toJS } from "mobx";
import { observer } from "mobx-react";
import { Icon, Button } from "react-native-elements";
import ApiService from '../Utils/ApiService';
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
import DeviceLogin from '../Component/DeviceLogin';
import Spinner from "react-native-spinkit";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
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
class SMS extends Component {

  @observable newPhone = new Array(40);
  @observable sectionNumbers = new Array(40);
  @observable loading = false;
  @observable psd = !global.deviceLoggedin;
  @observable visibleSpinner = true;

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

  @action
  getAllPhone() {
    NetInfo.fetch().then(state => {
      if (state.isConnected) {
        this.loading = true;
        ApiCall.getSMSPhones().then((x) => {
          if (x) {
            let flgPhoneObject = toJS(ApiCall.smsPhoneData);
            let flgPhones = [];
            let flgSectionNumbers = [];
            for (let index = 0; index < flgPhoneObject.length; index++) {
              flgPhones.push(flgPhoneObject[index].phone);
              flgSectionNumbers.push(flgPhoneObject[index].partition);
            }
            this.newPhone = flgPhones;
            this.sectionNumbers = flgSectionNumbers;
            this.loading = false;
            this.visibleSpinner = false;
          }
          else {
            this.loading = false;
            this.visibleSpinner = false;
            Alert.alert(
              langObj.connErr,
              langObj.phoneLoadErr,
              [{ text: langObj.tryAgain, onPress: () => this.getAllPhone() },
              { text: langObj.cancel }],
              { cancelable: false }
            )
          }
        });
      }
      else {
        this.visibleSpinner = false;
        Toast.show(langObj.internetConnFail, Toast.LONG);
        this.props.navigation.dispatch(
          CommonActions.navigate({
            name: 'SettingsTab'
          })
        );
      }
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
    this.getAllPhone();
  }

  @action
  setPhone() {
    let p = [];
    p.push(...this.newPhone);
    for (let i = 0; i < 40; i++) {
      if (p[i].length == 0)
        p[i] = 'FFFFFFFFFFFFFF';
      else if (p[i].length < 14) {
        p[i] = p[i] + new Array((15 - this.newPhone[i].length)).join('f');
      }
    }

    NetInfo.fetch().then(state => {
      if (state.isConnected)
        ApiCall.setSMSPhones(p, this.sectionNumbers);
      else
        Toast.show(langObj.internetConnFail, Toast.LONG);
    });
  }

  renderChildNew(i) {
    return (
      <View >
        <View style={{
          flexDirection: "row", justifyContent: "space-between", alignItems: "center", backgroundColor: "whitesmoke",
          borderColor: "gainsboro", borderBottomWidth: 1
        }}>
          <Icon containerStyle={{ width: 40, margin: 5 }} name="message" type="material-icons" color="#cc1e18" size={30} />
          <TextInput
            style={styles.textInput}
            onChangeText={(text) => this.newPhone[i] = text}
            autoCapitalize={"none"}
            value={this.newPhone[i] == undefined ? this.newPhone[i] : this.newPhone[i].replace(/[#f]/g, '')}
            maxLength={14}
            autoCorrect={false}
            placeholder={langObj.smsNo + " " + (i + 1)}
            underlineColorAndroid={"black"}
            placeholderTextColor={"rgba(0,0,0,0.4)"}
            keyboardType={'numeric'}
            selectionColor={"black"}
            returnKeyType={'done'}
            onSubmitEditing={() => this.setPhone()}
          />
        </View>
      </View>
    );
  }

  render() {
    return (
      <View style={{ flex: 1 }}>
        <DeviceLogin loading={this.psd} close={() => { this.psd = false }} back={() => { this.props.navigation.goBack(); }} />

        {this.visibleSpinner &&
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#ffa000" }}>
            <Spinner size={100} type={'Wave'} color={"#FFFFFF"} />
            <Text style={{ marginTop: 10, color: "white" }}>{langObj.fetchingData}</Text>
          </View>
        }

        {!this.visibleSpinner && <View>
          <KeyboardAwareScrollView enableOnAndroid={true} style={{ marginTop: 5, backgroundColor: "white" }}>
            {this.renderChildNew(0)}
            {this.renderChildNew(1)}
            {this.renderChildNew(2)}
            {this.renderChildNew(3)}
            {this.renderChildNew(4)}
            {this.renderChildNew(5)}
            {this.renderChildNew(6)}
            {this.renderChildNew(7)}
            {this.renderChildNew(8)}
            {this.renderChildNew(9)}
            {this.renderChildNew(10)}
            {this.renderChildNew(11)}
            {this.renderChildNew(12)}
            {this.renderChildNew(13)}
            {this.renderChildNew(14)}
            {this.renderChildNew(15)}
            {this.renderChildNew(16)}
            {this.renderChildNew(17)}
            {this.renderChildNew(18)}
            {this.renderChildNew(19)}
            {this.renderChildNew(20)}
            {this.renderChildNew(21)}
            {this.renderChildNew(22)}
            {this.renderChildNew(23)}
            {this.renderChildNew(24)}
            {this.renderChildNew(25)}
            {this.renderChildNew(26)}
            {this.renderChildNew(27)}
            {this.renderChildNew(28)}
            {this.renderChildNew(29)}
            {this.renderChildNew(30)}
            {this.renderChildNew(31)}
            {this.renderChildNew(32)}
            {this.renderChildNew(33)}
            {this.renderChildNew(34)}
            {this.renderChildNew(35)}
            {this.renderChildNew(36)}
            {this.renderChildNew(37)}
            {this.renderChildNew(38)}
            {this.renderChildNew(39)}
            <View style={{ height: 80 }} ></View>
          </KeyboardAwareScrollView>
          <View style={{
            position: "absolute", display: "flex", bottom: 0, right: 0,
            left: 0, height: 80, borderColor: "red", borderTopWidth: 2, backgroundColor: "white"
          }}>
            <Button
              borderRadius={4} buttonStyle={{ backgroundColor: "#cc1e18", marginBottom: 20, marginTop: 20, marginLeft: 10, marginRight: 10 }}
              title={langObj.submit} onPress={() => { this.setPhone(); }}
            />
          </View>
        </View>}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "space-around"
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "white"
  },
  innerContainer: {
    alignItems: "center"
  },
  textContainer: {
    borderBottomWidth: 2,
    borderColor: 'gray',
  },
  textInput: {
    marginLeft: 10,
    margin: 5,
    flex: 1,
    marginRight: 20,
    fontSize: 17,
    ...Platform.select({
      ios: {
        borderBottomWidth: 2,
        borderBottomColor: "gray",
        marginBottom: 20,
        marginTop: 20
      }
    }),
  }
});

export default SMS;