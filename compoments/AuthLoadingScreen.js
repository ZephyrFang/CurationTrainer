//import React from 'react';
import React, { Component } from 'react';
import { ActivityIndicator, AsyncStorage, StatusBar, StyleSheet, View } from 'react-native';
import * as firebase from 'firebase';

class AuthLoadingScreen extends Component {
    componentDidMount() {
        this._bootstrapAsync();
    }

    _bootstrapAsync = async () => {

        /* Fetch the token from storage then navigate to our appropriate place */
        const userId_from_device = await AsyncStorage.getItem('userId');
        alert('userId from device: ', userId_from_device);

        const { navigation } = this.props;

        if (userId_from_device){
            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    AsyncStorage.setItem('userId', JSON.stringify(user.uid)).then(() => {
                        console.log('userId_from_device fetched. user.email: ', user.email);
                        global.email = user.email;
                        global.userId = user.uid;
                        //navigation.push('Groups');  
                        navigation.navigate('App');
                    })           
                      .catch((error) => {
                        console.log('Error in _bootstrapAsync: ', error);
                      })                             
                }
              })
        }
        
        navigation.navigate('Auth');
        

         /* This will switch to the App screen or Auth screen and this loading screen will be unmounted and thrown away. */
         //this.props.navigation.navigate(userId ? 'App' : 'Auth');
    }

    render() {
        return (
            <View>
                <ActivityIndicator />
                <StatusBar barStyle='default' />
            </View>
        )
    }
}

export default AuthLoadingScreen;