import React, { Component } from 'react';
import { Alert, Image, ScrollView, Text, Button, StyleSheet, View, TouchableHighlight } from 'react-native';
import styles from './styles';
//import AsyncStorage from '@react-native-community/async-storage';
import { AsyncStorage } from 'react-native';
import * as firebase from 'firebase';


class ProfileScreen extends Component {

  static navigationOptions = ({ navigation }) => {
    return {
    title: 'Profile',    

    headerRight: (
      <View style={{flex: 0.1, flexDirection:'row' }}> 
            <TouchableHighlight style={{width: 50}} onPress={navigation.getParam('SignOut')}>
              <Image source={require('./images/logout.png')} style={{width:25, height:25}} />
            </TouchableHighlight> 
      </View>
      )  
    };
  }

  state = {
    email: '',
  }

  componentWillMount(){
    console.log('In Profile screen componentWillMount');

      this.setState({email: global.email});
      this.props.navigation.setParams({SignOut: this._signOut,});      
    }  
    
  _signOut = () => {
    const { navigation} = this.props;

    Alert.alert(
      'Alert',
      'Are you sure to Sign out?',
      [
        {
        text: 'Cancel',
        onPress: () => {
          console.log('Cancel Pressed');
                   
        },
        style: 'cancel',
        },    
        {
          text: 'Sign Out', 
          onPress: () => {
            console.log('Yes Pressed');
            firebase.auth().signOut();
            AsyncStorage.removeItem('userId').then(() =>{
                /* Clear up global properties. Otherwise the next signed In user will see the previous user's photo groups. */
                global.photos = [];
                global.groups = [];
                global.email = '';
                global.userId = 0;
  
                navigation.push('SignIn');
            });    
              
          },
          style: 'default',
        },
      ],
      {cancelable: false},      
    ); 

  }  
 
  render (){
    //const {navigate} = this.props.navigation;
   
    return(
      <View style={styles.container}>
         <Text style={styles.profile_text}>{this.state.email}</Text>

      </View>
    );
  }
}

export default ProfileScreen;