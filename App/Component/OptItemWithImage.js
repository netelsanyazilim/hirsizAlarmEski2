import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';

export default function OptItemWithImage(props) {
  const { title, imgName, subtitle, onPress, disabled } = props;
  const color = 'rgba(0,0,0,0.4)';
  return (
    <View style={{
      alignItems: 'center', height: 80
    }}>
      <TouchableOpacity disabled={disabled} onPress={onPress} style={{ flexDirection: 'row', }} >
        <View style={{ flex: 0.2, alignItems: 'center' }} >
          {imgName == "dimmer" &&
            <Image style={{ width: 100, flex: 1, alignSelf: 'flex-start', height: 100 }}
              resizeMode="contain" source={require('../assets/dimmer.png')}
            />}
          {imgName == "vana" &&
            <Image style={{ width: 100, flex: 1, alignSelf: 'flex-start', height: 100 }}
              resizeMode="contain" source={require('../assets/vana.png')}
            />}
          {imgName == "role" &&
            <Image style={{ width: 100, flex: 1, alignSelf: 'flex-start', height: 100 }}
              resizeMode="contain" source={require('../assets/role.png')}
            />}
          {imgName == "perde" &&
            <Image style={{ width: 100, flex: 1, alignSelf: 'flex-start', height: 100 }}
              resizeMode="contain" source={require('../assets/perde.png')}
            />}
        </View>
        <View style={{ flex: 0.8 }} >
          <Text style={{ marginTop: 5, marginLeft: 50, fontSize: 19 }}>{title}</Text>
          <Text style={{ marginTop: 5, marginLeft: 50, color: color, fontSize: 15 }}>{subtitle}</Text>
        </View>
      </TouchableOpacity>
    </View>
  )
}