import React, {useEffect, useState} from 'react';
import {
  NativeModules,
  Text,
  TouchableOpacity,
  View,
  Platform,
  Image,
  Dimensions,
  BackHandler,
  PermissionsAndroid,
  Alert
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import Geolocation from 'react-native-geolocation-service';
import LeftIconButton from './Component/LeftIconButton';
import NetInfo from '@react-native-community/netinfo';
import {Button} from 'react-native-elements';
import SharedPrefs from './Utils/SharedPrefs';
import Toast from 'react-native-simple-toast';
import * as TR from './assets/tr.json';
import * as EN from './assets/en.json';
import Crypto from './Utils/crypto';
import FCM from 'react-native-fcm';
import A from './Utils/crypto';

const url = 'http://37.148.211.144:3000';//'http://37.148.212.48:3000';//
//'http://www.uks.netelsan.com.tr:3000'; //'http://192.168.1.155:3000'; //'http://37.148.212.48:3000';  //'http://37.148.211.144:3000' nuralsunucusu // netelsan sunucu 'http://www.uks.netelsan.com.tr:3000'

let enable = false;

var langObj;
if (Platform.OS === 'android') {
  locale = NativeModules.I18nManager.localeIdentifier;
} else {
  locale =
    NativeModules.SettingsManager.settings.AppleLocale ||
    NativeModules.SettingsManager.settings.AppleLanguages[0];
}

if (locale.includes('en')) {
  langObj = EN;
} else {
  langObj = TR;
}

function click() {
  if (!enable) {
    enable = true;
  } else {
    enable = false;
  }
}

function Index1(props) {
  const [logged, setLogged] = useState(false);
  const [mail, setMail] = useState('');
  const [pass, setPass] = useState('');
  const [, updateState] = React.useState();
  const forceUpdateSc = React.useCallback(() => updateState({}), []);
  var emailInputRef;
  let a = false;

  //BackHandler.addEventListener("hardwareBackPress", BackHandler.exitApp());
  useEffect(() => {
    getLanguage();

    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        Toast.show(langObj.internetConnFail, Toast.LONG);
      }
    });

    if (Platform.OS === 'android') {
      try {
        const granted = PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: langObj.locationPermissionRequest,
            message: langObj.locationPermissionDescription,
            buttonNegative: langObj.cancel,
            buttonPositive: langObj.ok,
          },
        );
      } catch (err) {
        console.warn(err);
      }
    } else if (Platform.OS === 'ios') {
      const auth = Geolocation.requestAuthorization('whenInUse');
      if (auth === 'granted') {
        console.log('permission request done');
      }
    }

    //BackHandler.addEventListener('hardwareBackPress', () => true);
    //FCM.requestPermissions({ badge: false, sound: "../assets/sounds/outdoor.wav", alert: true }).then(() =>
    FCM.requestPermissions({badge: false, sound: true, alert: true})
      .then(() => console.log('granted'))
      .catch(() => console.log('notification permission rejected'));
    FCM.getInitialNotification().then((notif) => {});
    FCM.setBadgeNumber(0);

    getToken();


    const bacAction = () => {
      Alert.alert(langObj.warning, langObj.askShutDown,
        [
          {
            text: langObj.cancel,
            onPress: () => null,
            style: "cancel"
          },
          {
            text: langObj.out, onPress: () => BackHandler.exitApp()
          }
        ]);
      return true;
    };
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      bacAction
    );


    return () => backHandler.remove();
    // return () =>
    //   BackHandler.removeEventListener('hardwareBackPress', () => true);
  }, []);

  const encryptData = (data) => {
    return new Promise((resolve, reject) => {
      try {
        let a = Crypto.decrypt(data);
        resolve(JSON.parse(a));
      } catch (err) {
        reject();
      }
    });
  };

  const getLanguage = async () => {
    try {
      var locale = null;
      if (Platform.OS === 'android') {
        locale = NativeModules.I18nManager.localeIdentifier;
      } else {
        locale =
          NativeModules.SettingsManager.settings.AppleLocale ||
          NativeModules.SettingsManager.settings.AppleLanguages[0];
      }

      const a = await SharedPrefs.getLang();

      if (a != undefined && a != null) {
        if (a == 1) {
          langObj = EN;
        } else {
          langObj = TR;
        }
      } else {
        if (locale.includes('en')) {
          langObj = EN;
        } else {
          langObj = TR;
        }
      }
    } catch (error) {
      if (locale.includes('en')) {
        langObj = EN;
      } else {
        langObj = TR;
      }
    }

    forceUpdateSc();
  };

  const encryptbody = (body) => {
    try {
      let a = Crypto.encrypt(JSON.stringify(body));
      return a;
    } catch (err) {
      return false;
    }
  };

  const loggin = (mail, pass, fcmtoken) => {
    let datas =
      fcmtoken == null
        ? {
            mail: mail.toString(),
            password: pass.toString(),
          }
        : {
            mail: mail.toString(),
            password: pass.toString(),
            gcmToken: fcmtoken.toString(),
          };
    let data = {data: encryptbody(datas)};
    fetch(url + '/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data),
    })
      .then((response) => response.text())
      .then((responseText) => encryptData(responseText))
      .then(async (responseJson) => {
        if (
          responseJson.status == 200 &&
          responseJson.message == 'not activated'
        ) {
          Toast.show(langObj.loginFailActivate, Toast.SHORT);
        } else if (responseJson.status == 200 && responseJson.message) {
          //uygulama her açılışında ayarlar kısmında master şifreyi istemeli
          global.deviceLoggedin = false;
          SharedPrefs.saveloginData(
            responseJson.user.mail,
            responseJson.token,
            pass,
            responseJson.user.name,
            responseJson.user.deviceId,
            responseJson.user.deviceName,
            responseJson.user.notifsettings,
          );
          if (responseJson.user.deviceId.length > 1) {
            props.navigation.navigate('ChooseDevice');
          } else {
            let dbDeviceName = responseJson.user.deviceName;
            if (
              dbDeviceName == undefined ||
              dbDeviceName == null ||
              dbDeviceName.length < 1
            ) {
              global.deviceName = 'Netelsan-1';
            } else {
              global.deviceName = dbDeviceName[0];
            }
            global.deviceId = responseJson.user.deviceId[0];
            props.navigation.navigate('SettingsTab');
          }
        } else {
          Toast.show(langObj.loginFail, Toast.SHORT);
        }
      })
      .catch((err) => {
        console.log('err login' + err);
        Toast.show(langObj.connFail, Toast.SHORT);
      });
  };

  const checkToken = (mail, token, pass) => {
    console.log("hsnfey geldiiiiiiiiiiii")
    let datas = {mail: mail};
    let data = {data: encryptbody(datas)};
    fetch(url + '/api/v1/getUser', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'x-access-token': token,
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.text())
      .then((responseText) => encryptData(responseText))
      .then(async (responseJson) => {
        global.deviceLoggedin = false;
        SharedPrefs.saveloginData(
          responseJson.user.mail,
          token,
          pass,
          responseJson.user.name,
          responseJson.user.deviceId,
          responseJson.user.deviceName,
          responseJson.user.notifsettings,
        );
        if ((responseJson.status == 200) & responseJson.message) {
          if (responseJson.user.deviceId.length > 1) {
            console.log("response message:" +JSON.stringify(responseJson))
            props.navigation.navigate('ChooseDevice');
          } else {
            let dbDeviceName = responseJson.user.deviceName;
            if (
              dbDeviceName == undefined ||
              dbDeviceName == null ||
              dbDeviceName.length < 1
            ) {
              global.deviceName = 'Netelsan-1';
            } else {
              global.deviceName = dbDeviceName[0];
              global.deviceId = responseJson.user.deviceId[0];
            }
            props.navigation.navigate('SettingsTab');
          }
        } else {
          setLogged(false);
        }
      })
      .catch((err) => {
        console.log('err checkToken' + JSON.stringify(err));
        setLogged(false);
      });
  };

  const getToken = async () => {
    try {
      const a = await SharedPrefs.getlogindata();
      if (a !== undefined && a.token !== null) {
        setMail(a.mail);
        setPass(a.pass);
        checkToken(a.mail, a.token, a.pass);
      }
    } catch (error) {
      console.log('get token error ', error);
    }
  };

  const validateEmail = (email) => {
    //clear whitespace endofstr
    setMail(mail.replace(/\s*$/, ''));
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
  };

  const login = () => {
    NetInfo.fetch().then((state) => {
      if (!state.isConnected) {
        Toast.show(langObj.internetConnFail, Toast.LONG);
      } else {
        if (mail && pass) {
          if (validateEmail(mail) && pass.length < 2) {
            Toast.show(langObj.validateMailPass, Toast.SHORT);
          } else {
            //props.navigation.setParams({reset: false});
            /*FCM.on(FCMEvent.RefreshToken, (newToken) => {
                // incase token not available on first load.
                //ApiCall.login(mail, pass, null);
                loggin(mail,pass,null);
            });*/
            //uygulama her açılışında ayarlar için yeniden şifre istemeli
            FCM.getFCMToken()
              .then((token) => {
                loggin(mail, pass, token);
              })
              .catch(() => {
                loggin(mail, pass, null);
              });
            /*FCM.getFCMToken().then((token) => {
              // store fcm token in your server
              ApiCall.login(this.mail, this.pass, token);
            });*/
          }
        } else {
          Toast.show(langObj.validateFillAll, Toast.SHORT);
        }
      }
    });
  };

  return (
    <KeyboardAwareScrollView
      extraHeight={20}
      enableOnAndroid={false}
      style={{
        flex: 1,
        backgroundColor: 'white',
      }}>
      <View
        style={{
          height: Dimensions.get('window').height,
          backgroundColor: 'black',
        }}>
        <View
          style={{
            height: Dimensions.get('window').height,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <View style={{height: '50%'}}>
            <Image
              style={{
                width: Dimensions.get('window').width,
                flex: 1,
                alignSelf: 'flex-start',
                height: 100,
              }}
              resizeMode="contain"
              source={require('./assets/Logo4.png')}
            />
            <Image
              style={{
                width: Dimensions.get('window').width,
                flex: 1,
                alignSelf: 'flex-start',
                height: 100,
              }}
              resizeMode="contain"
              source={require('./assets/Logo2.png')}
            />
          </View>
          <View
            style={{
              height: '50%',
              width: '100%',
              justifyContent: 'space-between',
            }}>
            <View style={{alignItems: 'center'}}>
              <LeftIconButton // LeftIconButton
                //iconname={"Kullanıcı adı"}

                iconname={langObj.inUserName}
                placeholder={langObj.email}
                type={'ip'}
                placeholderTextColor={'rgba(255,255,255,0.4)'}
                onTextChange={(t) => setMail(t)}
                textColor={'white'}
                value={mail}
                returnKeyType="next"
                selectionColor={'#cc1e18'}
                onSubmitEditing={() => emailInputRef.focus()}
              />
              <View
                style={{width: '100%', marginTop: 10, alignItems: 'center'}}>
                <LeftIconButton
                  textColor={'white'}
                  selectionColor={'#cc1e18'}
                  iconname={langObj.inPassword}
                  ref={(ref) => (emailInputRef = ref)}
                  placeholder={langObj.phPass}
                  type={'password'}
                  value={pass}
                  placeholderTextColor={'rgba(255,255,255,0.4)'}
                  onTextChange={(t) => setPass(t)}
                  onSubmitEditing={() => login()}
                />
              </View>
            </View>
            <View style={{width: '100%'}}>
              <Button //hsn
                disabled={enable}
                borderRadius={4}
                buttonStyle={{
                  backgroundColor: '#cc1e18',
                  marginLeft: 15,
                  marginRight: 15,
                }}
                fontWeight="bold"
                title={langObj.login}
                onPress={() => {
                  click();
                  forceUpdateSc();

                  login();

                  setTimeout(() => {
                    click();
                    forceUpdateSc();
                  }, 3000);
                }}
              />
            </View>

            <TouchableOpacity
              style={{marginTop: 5}}
              onPress={() => {
                props.navigation.navigate('ResetPassword');
              }}>
              <Text style={{color: 'white', alignSelf: 'center'}}>
                {langObj.forgotPass}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                marginBottom: 40,
                alignItems: 'center',
                alignSelf: 'center',
              }}
              onPress={() => {
                props.navigation.navigate('CreateAccount');
              }}>
              <View style={{flexDirection: 'row', alignSelf: 'flex-end'}}>
                <Text style={{color: 'white'}}>{langObj.checkAccount}</Text>
                <Text style={{color: '#cc1e18', fontWeight: '600'}}>
                  {langObj.createAccount}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}

export default Index1;
