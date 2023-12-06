// AddedItemsScreen.js

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const AddedItemsScreen = ({ route }) => {
  const { addedItems } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Added Items</Text>
      {addedItems.map((item, index) => (
        <View key={index} style={styles.itemContainer}>
          <Text style={styles.itemText}>
            Product Name: {item.name}{'\n'}
            Quantity: {item.quantity}{'\n'}
            Price: ${item.price.toFixed(2)}
          </Text>
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'white', // Set your background color
  },
  header: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  itemContainer: {
    marginBottom: 10,
    backgroundColor: '#eee', // Set your item background color
    padding: 10,
    borderRadius: 5,
  },
  itemText: {
    fontSize: 16,
  },
});

export default QRCodeScreen;
