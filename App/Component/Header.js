import React from 'react';
import { Image, Dimensions, View, Text } from 'react-native';
var en = Dimensions.get('window').width;

export default function Header(props) {
  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      <View style={{ flex: 0.5, alignSelf: 'center', alignItems: 'flex-start', }}>
        <Image
          style={{
            alignSelf: 'center', backgroundColor: 'transparent',
            height: '40%'
          }}
          resizeMode="contain"
          source={
            require('../assets/Logo5.png')
          }
        />
      </View>
      <View style={{ flex: 2, alignSelf: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: '600', alignSelf: 'center' }}>{props.title}</Text>
      </View>
      <View style={{ flex: 1, alignSelf: 'center', alignItems: 'flex-end' }}>
        <Image
          source={require('../assets/netelsan.png')}
          style={{ width: en * 0.25 }}
          resizeMode="contain"
        />
      </View>
    </View>
  );
}