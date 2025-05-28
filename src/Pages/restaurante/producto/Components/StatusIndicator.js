import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const StatusIndicator = () => {
  return (
    <View style={styles.container}>
      <View style={styles.circle} />
      <Text style={styles.textContainer}>
        <Text style={styles.text}>No disponible por </Text>
        <Text style={styles.textBold}>11 horas</Text>
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  circle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'red',
    marginRight: 4,
  },
  textContainer: {
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  text: {
    fontSize: 10,
  },
  textBold: {
    fontSize: 10,
    fontWeight: 'bold',
  },
});

export default StatusIndicator;
