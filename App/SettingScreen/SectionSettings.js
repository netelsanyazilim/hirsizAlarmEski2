import React, { Component } from "react";
import {
  Text, NativeModules, View, TouchableOpacity,
  BackHandler, Platform, Switch
} from "react-native";
import { CommonActions } from '@react-navigation/native';
import ApiService from '../Utils/ApiService';
import SharedPrefs from '../Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
import DeviceLogin from '../Component/DeviceLogin';
import NetInfo from "@react-native-community/netinfo";
import { observable, makeObservable, action } from "mobx";
import { observer } from "mobx-react";
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
class SectionSettings extends Component {

  @observable loading = false;
  @observable psd = !global.deviceLoggedin;
  @observable visibleSpinner = false;

  constructor(props) {
    super(props);
    makeObservable(this);
    this.state = ({
      isEnabled: [false, false, false, false]
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
    let flagBolgeAktif = [false, false, false, false];
    if (global.statusData != undefined && global.statusData != null && global.statusData.data.bolgeAktif1 != undefined && global.statusData.data.bolgeAktif1 != null) {
      flagBolgeAktif[0] = (global.statusData.data.bolgeAktif1 == 1) ? true : false;
      flagBolgeAktif[1] = (global.statusData.data.bolgeAktif2 == 1) ? true : false;
      flagBolgeAktif[2] = (global.statusData.data.bolgeAktif3 == 1) ? true : false;
      flagBolgeAktif[3] = (global.statusData.data.bolgeAktif4 == 1) ? true : false;
    }
    this.setState({
      isEnabled: flagBolgeAktif
    });
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
  toggleSwitch(index) {
    let flagIsEnabled = this.state.isEnabled.slice();
    let testFlagIsEnabled = this.state.isEnabled.slice();
    testFlagIsEnabled[index] = !testFlagIsEnabled[index];

    let flagCount = 0;
    for (let index = 0; index < testFlagIsEnabled.length; index++) {
      if (testFlagIsEnabled[index])
        flagCount = flagCount + 1;
    }

    if (flagCount != 0) {
      NetInfo.fetch().then(state => {
        if (state.isConnected) {
          this.loading = true;
          this.visibleSpinner = true;
          ApiCall.setPartition(index, testFlagIsEnabled[index]).then((x) => {
            this.loading = false;
            if (x) {
              if (index == 0)
                global.statusData.data.bolgeAktif1 = flagIsEnabled[index];
              else if (index == 1)
                global.statusData.data.bolgeAktif2 = flagIsEnabled[index];
              else if (index == 2)
                global.statusData.data.bolgeAktif3 = flagIsEnabled[index];
              else if (index == 3)
                global.statusData.data.bolgeAktif4 = flagIsEnabled[index];

              this.visibleSpinner = false;
              flagIsEnabled[index] = testFlagIsEnabled[index];
              this.setState({ isEnabled: flagIsEnabled });
            }
          }, y => {
            setTimeout(() => {
              this.loading = false;
              this.visibleSpinner = false;
              this.setState({ isEnabled: flagIsEnabled });
            }, 5000);
          })
        }
        else {
          this.loading = false;
          this.visibleSpinner = false;
          this.setState({ isEnabled: flagIsEnabled });
          Toast.show(langObj.internetConnFail, Toast.LONG);
        }
      });
    } else {
      this.loading = false;
      this.visibleSpinner = false;
      this.setState({ isEnabled: flagIsEnabled });
      Toast.show(langObj.atLeastOnePartition, Toast.LONG);
    }
  }

  renderChild(title, index) {
    let flagIsEnabled = this.state.isEnabled;
    return (
      <View>
        <TouchableOpacity disabled style={{ marginTop: 10, elevation: 5 }}>
          <View style={{ flexDirection: "row", alignSelf: "center", width: '100%', justifyContent: "space-between" }}>
            <View>
              <Text style={{ fontWeight: "bold", margin: 10, marginLeft: 20, color: 'black', fontSize: 18 }}>{title}</Text>
            </View>
            <View style={{ flexDirection: "row", alignSelf: "center", justifyContent: "space-between" }}>
              <View>
                {flagIsEnabled[index] && <Text style={{ fontWeight: "bold", margin: 10, marginLeft: 20, color: 'black', fontSize: 18 }}>{langObj.active}</Text>}
                {!flagIsEnabled[index] && <Text style={{ fontWeight: "bold", margin: 10, marginLeft: 20, color: 'black', fontSize: 18 }}>{langObj.passive}</Text>}
              </View>
              <View style={{ marginRight: 30, marginTop: 5, marginBottom: 5 }}>
                <Switch
                  trackColor={{ false: "#767577", true: "#81b0ff" }}
                  ios_backgroundColor="#3e3e3e"
                  onValueChange={() => this.toggleSwitch(index)}
                  value={flagIsEnabled[index]}
                />
              </View>
            </View>
          </View>
          <View style={{ height: 2, width: '100%', backgroundColor: 'gainsboro', marginTop: 5 }} ></View>
        </TouchableOpacity>
      </View>
    );
  }

  render() {
    return (
      <View style={{ backgroundColor: 'white', flex: 1 }}>
        <DeviceLogin loading={this.psd} close={() => { this.psd = false }} back={() => { this.props.navigation.goBack(); }} />
        {this.visibleSpinner &&
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: "#ffa000" }}>
            <Spinner size={100} type={'Wave'} color={"#FFFFFF"} />
            <Text style={{ marginTop: 10, color: "white" }}>{langObj.loading}</Text>
          </View>}

        {!this.visibleSpinner && <View>
          {this.renderChild(langObj.section1, 0)}
          {this.renderChild(langObj.section2, 1)}
          {this.renderChild(langObj.section3, 2)}
          {this.renderChild(langObj.section4, 3)}
        </View>}
      </View>
    );
  }
}

export default SectionSettings;