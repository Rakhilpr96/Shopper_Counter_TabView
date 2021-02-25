import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TextInput,
  Pressable,
  ScrollView,
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import Entypo from 'react-native-vector-icons/Entypo';
import {TypingAnimation} from 'react-native-typing-animation';
import base64 from 'react-native-base64';
import {BASE_URL} from '../helpers/user';
import AsyncStorage from '@react-native-async-storage/async-storage';

const windowHeight = Dimensions.get('window').height;
const windowWidth = Dimensions.get('window').width;

import firestore from '@react-native-firebase/firestore';

const LoginScreen = ({navigation}) => {
  const [typing_email, setTypingEmail] = useState(false);
  const [typing_password, setTypingPassword] = useState(false);
  const [Password, setPassword] = useState('');
  const [ShopId, setShopId] = useState('');
  const [error, setError] = useState('');

  const addShopId = (ShopId) => {
    // firestore()
    //   .collection('Shops')
    //   .doc(ShopId.toString())
    //   .get()
    //   .then((documentSnapshot) => {
    //     if (documentSnapshot.exists) {
    //       console.log('ShopID exist in firestore');
    //     } else {
    //       firestore()
    //         .collection('Shops')
    //         .doc(ShopId.toString())
    //         .set({
    //           depotCurrentLimit: 0,
    //           depotLimit: 0,
    //         })
    //         .then(() => {
    //           console.log('ShopId added!');
    //         });
    //     }
    //   });

    firestore()
      .collection('Shops')
      .doc(ShopId.toString())
      .set({
        depotCurrentLimit: '',
        depotLimit: '',
      })
      .then(() => {
        console.log('ShopId added!');
      });
  };

  const onSubmit = () => {
    Keyboard.dismiss();
    if (Password == '' || ShopId == '') {
      Alert.alert('Please fill all fields');
    } else {
      console.log('some data present');
      let headers = new Headers();
      headers.append(
        'Authorization',
        'Basic ' + base64.encode('apiuser:a22323212'),
      );
      headers.append('Content-Type', 'application/json');
      fetch(`${BASE_URL}/validateAuth`, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify({
          shopId: ShopId,
          password: Password,
        }),
      })
        .then((response) => response.json())
        .then(async (json) => {
          console.log(json);
          if (json.key) {
            console.log('jSON KEY :', json.key);
            await AsyncStorage.setItem('key', json.key);
            console.log(AsyncStorage.getItem('key'));
            addShopId(ShopId);
            navigation.navigate('Home', {ShopId: ShopId});
          } else {
            setError(json.message);
          }
        });
    }
  };

  return (
    <KeyboardAvoidingView
      keyboardVerticalOffset={-80}
      behavior={Platform.OS === 'ios' ? 'padding' : ''}
      style={{flex: 1}}>
      <View style={styles.mainContainer}>
        <LinearGradient
          colors={['#A5FECB', '#20BDFF', '#5433FF']}
          style={styles.container}>
          <View style={styles.iconContainer}>
            <Entypo
              style={styles.loginIcon}
              name="login"
              size={80}
              color="black"
            />
          </View>
        </LinearGradient>
        <ScrollView
          keyboardShouldPersistTaps="always"
          style={styles.whiteContainer}
          contentContainerStyle={{paddingBottom: 20}}>
          <Text style={styles.loginText}>Login</Text>

          <View style={styles.inputContainer}>
            <Text style={styles.fieldHeading}>Shop ID</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInputFied}
                placeholder="Enter shop ID"
                autoCapitalize="characters"
                onFocus={() => {
                  setTypingEmail(true);
                  setTypingPassword(false);
                }}
                onChangeText={(text) => {
                  setShopId(text);
                  setError('');
                }}
              />
              {/* {typing_email ? (
              <View style={{marginTop: -10}}>
                <TypingAnimation
                  dotColor="black"
                  dotMargin={5}
                  dotAmplitude={5}
                  dotSpeed={0.15}
                  dotRadius={4}
                  dotX={12}
                  dotY={6}
                />
              </View>
            ) : null} */}
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.fieldHeading}>Password</Text>
            <View style={styles.inputBox}>
              <TextInput
                style={styles.textInputFied}
                placeholder="Enter password"
                secureTextEntry={true}
                onFocus={() => {
                  setTypingPassword(true);
                  setTypingEmail(false);
                }}
                onChangeText={(text) => {
                  setPassword(text);
                  setError('');
                }}
              />
              {/* {typing_password ? (
              <View style={{marginTop: -10}}>
                <TypingAnimation
                  dotColor="#264099"
                  dotMargin={5}
                  dotAmplitude={5}
                  dotSpeed={0.15}
                  dotRadius={4}
                  dotX={12}
                  dotY={6}
                />
              </View>
            ) : null} */}
            </View>
          </View>

          {error != '' ? (
            <Text style={styles.errorMessage}>{error}</Text>
          ) : null}

          <View style={styles.loginButtonContainer}>
            <Pressable
              style={styles.loginButton}
              android_ripple={{color: 'rgba(0,0,0,0.2)'}}
              onPress={() => onSubmit()}>
              <Text style={styles.loginButtonText}>Login</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
  },
  container: {
    height: windowHeight * 0.45,
  },
  iconContainer: {
    width: '100%',
    height: windowHeight * 0.27,
    justifyContent: 'center',
    alignItems: 'center',
  },
  whiteContainer: {
    position: 'absolute',
    bottom: 0,
    height: windowHeight * 0.7,
    width: '100%',
    backgroundColor: '#fff',
    borderTopLeftRadius: 80,
    paddingVertical: 0,
    paddingHorizontal: 20,
  },
  loginText: {
    fontSize: 38,
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 20,
  },
  inputContainer: {
    marginHorizontal: 10,
    marginVertical: 10,
    // height: 100,
    borderRadius: 10,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.8,
    shadowRadius: 2,
    elevation: 5,
    paddingHorizontal: 15,
    paddingVertical: 15,
  },
  fieldHeading: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'rgba(0,0,0,0.6)',
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInputFied: {
    flex: 0.85,
    marginTop: 10,
    // backgroundColor: 'rgba(0,0,0,0.2)',
  },
  loginButtonContainer: {
    marginTop: 30,
  },
  loginButton: {
    marginHorizontal: 10,
    backgroundColor: '#264099',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 10,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
  },
  errorMessage: {
    fontSize: 16,
    color: 'red',
    alignSelf: 'center',
  },
});

export default LoginScreen;
