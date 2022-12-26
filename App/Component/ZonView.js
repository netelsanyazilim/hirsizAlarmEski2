import React from 'react';
import { View, Text, Dimensions } from 'react-native';

export default function ZonView(props) {
  const { color, text } = props;
  return (
    <View style={{
      backgroundColor: color,
      width: Dimensions.get('window').width * 0.28,
      flexDirection: 'row',
      height: 40,
      borderWidth: 1,
      borderRadius: 20,
      borderColor: color,
      shadowColor: 'black',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.8,
      shadowRadius: 2,
      elevation: 4,
      alignItems: 'center', margin: 4, justifyContent: 'center'
    }}>
      <Text style={{
        textAlign: 'center', width: '100%', alignSelf: 'center',
        marginLeft: 5, fontSize: 10, fontWeight: '800',
        color: color == '#f1c40f' || color == 'white' ? 'black' : 'white'
      }} >
        {text}
      </Text>
    </View>
  )
}