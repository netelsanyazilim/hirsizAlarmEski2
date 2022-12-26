import React, { useState, useEffect, useRef, Component } from 'react';
import { Text, StyleSheet, NativeModules, BackHandler, useWindowDimensions, Platform } from 'react-native';
import { TabView, TabBar } from 'react-native-tab-view';
import Settings from './SettingScreen/Settings';
import MyAccount from './SettingScreen/MyAccount';
import SharedPrefs from './Utils/SharedPrefs';
import { Icon } from 'react-native-elements';
import * as TR from './assets/tr.json';
import * as EN from './assets/en.json';
import Dashboard from './SettingScreen/Dashboard';

import { observable, makeObservable, action } from "mobx";
import { observer } from 'mobx-react-lite';




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
let routes = [{ index: 0, key: 'first', title: langObj.profile, icon: 'person' },
{ index: 1, key: 'second', title: langObj.device, icon: 'apps' },
{ index: 2, key: 'third', title: langObj.settings, icon: 'settings' }];


function SettingsTab(props) {
  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const willMount = useRef(true);

  const backAction = () => {
    if (index !== 1) {
      setIndex(1);
    } else if (index === 1) {
      BackHandler.exitApp();
    }
    return true;
  };

  useEffect(() => {
    getLanguage();
    const backHandler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => backHandler.remove();
  });

  const renderScene = ({ route }) => {
    if (willMount.current) {
      setIndex(1);
      willMount.current = false;
    }

    SharedPrefs.settingsTab("hasn");
    switch (route.key) {
      case 'first':
        return <MyAccount {...props} jump={handleIndexChange} />;
      case 'second':
        return <Dashboard {...props} index={index} />;
      case 'third':
        return <Settings {...props} />;
      default:
        return null;
    }
  }

  const getLanguage = async () => {
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

    routes = [{ index: 0, key: 'first', title: langObj.profile, icon: 'person' },
    { index: 1, key: 'second', title: langObj.device, icon: 'apps' },
    { index: 2, key: 'third', title: langObj.settings, icon: 'settings' }];
  }

  const getTabBarIcon = (props) => {
    const { route } = props;
    return (
      <Icon name={route.icon} size={route.index == index ? 30 : 26} color={route.index == index ? 'black' : 'gainsboro'} />
    )
  }

  const handleIndexChange = index => {
    setIndex(index);
  }

  return (
    <TabView
      style={styles.container}
      tabBarPosition={'bottom'}
      navigationState={{ index, routes }}
      renderScene={renderScene}
      renderTabBar={props =>
        <TabBar
          {...props}
          renderIcon={
            props => getTabBarIcon(props)
          }
          tabStyle={styles.tab}
          renderLabel={({ route }) => (
            <Text style={styles.textStyle}>
              {route.title}
            </Text>
          )}
        />
      }
      onIndexChange={handleIndexChange}
      initialLayout={{ width: layout.width }}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  tab: {
    opacity: 1,
    backgroundColor: 'white'
  },
  textStyle: {
    fontSize: 11,
    margin: 0,
    fontWeight: 'bold',
    color: '#222',
    ...Platform.select({
      ios: {
        marginBottom: 10
      },
      android: {
        marginBottom: 0
      }
    }),
  }
});

export default SettingsTab;