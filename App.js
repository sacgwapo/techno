import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
  ImageBackground,
  Animated,
  Modal,
  TouchableWithoutFeedback,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import * as FileSystem from 'expo-file-system';

const App = () => {
  const [addedItems, setAddedItems] = useState([]);
  const [itemName, setItemName] = useState('');
  const [itemQuantity, setItemQuantity] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [animatedValue] = useState(new Animated.Value(0));
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [text, setText] = useState('Not yet scanned');
  const [isScannerVisible, setScannerVisible] = useState(false);
  const [notificationText, setNotificationText] = useState('');
  const [isNotificationVisible, setNotificationVisible] = useState(false);
  const [isModalVisible, setModalVisible] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const showNotification = (text) => {
    setNotificationText(text);
    setNotificationVisible(true);

    // Automatically hide the notification after 2 seconds
    setTimeout(() => {
      setNotificationVisible(false);
      setNotificationText('');
    }, 4000);
  };

  const askForCameraPermission = async () => {
    const { status } = await BarCodeScanner.requestPermissionsAsync();
    setHasPermission(status === 'granted');
  };

  useEffect(() => {
    askForCameraPermission();
  }, []);

  useEffect(() => {
    Animated.loop(
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 50000,
        useNativeDriver: false,
      })
    ).start();
  }, []);

  const backgroundTranslateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const handleBarCodeScanned = ({ type, data }) => {
    setScanned(true);
    setText(data);

    // Add the scanned data as a new item with a default quantity of 1 and price
    setAddedItems((prevItems) => [
      ...prevItems,
      { name: `Scanned Item - ${data}`, quantity: 1, price: 5.0 },
    ]);

    // Show a notification when a barcode is scanned
    showNotification(`Scanned Item: ${data}`);
  };

  const toggleScanner = () => {
    setScannerVisible(!isScannerVisible);
    setScanned(false);
  };

  const handleAddItem = () => {
    if (itemName.trim() !== '' && itemQuantity.trim() !== '' && itemPrice.trim() !== '') {
      const newItem = {
        name: itemName,
        quantity: parseInt(itemQuantity, 10),
        price: parseFloat(itemPrice),
      };

      setAddedItems((prevItems) => [...prevItems, newItem]);

      // Show a notification when an item is added
      showNotification(
        `Product Name: ${itemName} (Quantity: ${itemQuantity}, Price: ${itemPrice})`
      );

      setItemName('');
      setItemQuantity('');
      setItemPrice('');
    }
  };

  const handleRemoveItem = (index) => {
    const updatedItems = [...addedItems];
    updatedItems.splice(index, 1);
    setAddedItems(updatedItems);
  };

  const handleDownloadPdf = async (item) => {
    const itemName = item.name;
    const itemQuantity = item.quantity;
    const itemPrice = item.price;
    const pdfContent = generatePdfContent(itemName, itemQuantity, itemPrice);

    try {
      const uri = FileSystem.cacheDirectory + 'downloadedFile.pdf';
      await FileSystem.writeAsStringAsync(uri, pdfContent, { encoding: FileSystem.EncodingType.UTF8 });
      showNotification(`Downloaded ${itemName} (Quantity: ${itemQuantity}, Price: ${itemPrice})`);
    } catch (error) {
      console.error('Error downloading file:', error);
      showNotification('Error downloading file');
    }
  };

  const generatePdfContent = (itemName, itemQuantity, itemPrice) => {
    // Customize this function to generate the PDF content based on the item data
    return `Product Name: ${itemName}\nQuantity: ${itemQuantity}\nPrice: $${itemPrice}\n\nThis is the content of the PDF.`;
  };

  const calculateTotalPrice = () => {
    const total = addedItems.reduce((acc, item) => acc + item.quantity * item.price, 0);
    setTotalPrice(total);
  };

  useEffect(() => {
    calculateTotalPrice();
  }, [addedItems]);

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer}>
      <ImageBackground
        source={require('./123.jpg')}
        style={{ flex: 1, transform: [{ rotate: '0deg' }] }}
      >
        <View style={styles.notificationContainer}>
          <TouchableWithoutFeedback onPress={() => showNotification('New Notification')}>
            <View style={styles.bellContainer}>
              <Text style={styles.bell}>🔔</Text>
              {isNotificationVisible && (
                <View style={styles.notificationBubble}>
                  <Text style={styles.notificationBubbleText}>{notificationText}</Text>
                </View>
              )}
            </View>
          </TouchableWithoutFeedback>
        </View>
        <View style={styles.container}>
          <Button
            title={isScannerVisible ? 'Hide Scanner' : 'Show Scanner'}
            onPress={toggleScanner}
            color={isScannerVisible ? 'tomato' : 'green'}
          />

          {isScannerVisible && (
            <View>
              <View style={styles.barcodebox}>
                <BarCodeScanner
                  onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                  style={{ height: 400, width: 400 }}
                />
              </View>
              <Text style={styles.maintext}>{text}</Text>
              {scanned && (
                <Button
                  title={'Scan again?'}
                  onPress={() => setScanned(false)}
                  color="tomato"
                />
              )}
            </View>
          )}

          <View style={styles.inputContainer}>
            <TextInput
              style={styles.input}
              placeholder="Item name"
              value={itemName}
              onChangeText={(text) => setItemName(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Quantity"
              keyboardType="numeric"
              value={itemQuantity}
              onChangeText={(text) => setItemQuantity(text)}
            />
            <TextInput
              style={styles.input}
              placeholder="Price"
              keyboardType="numeric"
              value={itemPrice}
              onChangeText={(text) => setItemPrice(text)}
            />
            <View style={styles.buttonContainer}>
              <Button title="Add Item" onPress={handleAddItem} />
            </View>
          </View>

          <Button title="Show Result" onPress={toggleModal} />

          <Modal
            animationType="slide"
            transparent={true}
            visible={isModalVisible}
            onRequestClose={() => {
              setModalVisible(!isModalVisible);
            }}
          >
            <View style={styles.modalContainer}>
              <ScrollView style={styles.modalContent}>
                <Text style={styles.modalHeader}>Added Products:</Text>
                {addedItems.map((item, index) => (
                  <View key={index} style={styles.modalItemContainer}>
                    <Text style={styles.modalItemText}>
                      Product Name: {item.name}{'\n'}
                      Quantity: {item.quantity}{'\n'}
                      Price: ${item.price.toFixed(2)}
                    </Text>
                    <View style={styles.buttonContainer}>
                      <Button title="Download" onPress={() => handleDownloadPdf(item)} />
                      <Button title="Remove" onPress={() => handleRemoveItem(index)} />
                    </View>
                  </View>
                ))}
                <Text style={styles.modalHeader}>Total Price: ${totalPrice.toFixed(2)}</Text>
                <Button title="Close" onPress={toggleModal} />
              </ScrollView>
            </View>
          </Modal>
        </View>
      </ImageBackground>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.7)',
  },
  notificationContainer: {
    flexDirection: 'column',
    alignItems: 'flex-end',
    marginBottom: 20,
  },
  bellContainer: {
    position: 'relative',
  },
  bell: {
    fontSize: 24,
    marginRight: 10,
  },
  notificationBubble: {
    position: 'absolute',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    padding: 10,
    top: -5,
    right: -5,
  },
  notificationBubbleText: {
    color: 'white',
    fontSize: 14,
  },
  inputContainer: {
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: 'gray',
    borderWidth: 1,
    marginBottom: 10,
    paddingHorizontal: 10,
    backgroundColor: 'white',
  },
  maintext: {
    fontSize: 16,
    margin: 20,
  },
  barcodebox: {
    alignItems: 'center',
    justifyContent: 'center',
    height: 300,
    width: 300,
    overflow: 'hidden',
    borderRadius: 30,
    backgroundColor: 'white',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 10,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    maxHeight: '80%',
    width: '80%',
  },
  modalHeader: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalItemContainer: {
    marginBottom: 10,
  },
  modalItemText: {
    fontSize: 16,
  },
  downloadButtonContainer: {
    marginTop: 5,
  },
});

export default App;
