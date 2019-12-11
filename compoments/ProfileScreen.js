import React, { Component } from 'react';
import { Alert, Image, ScrollView, Text, Button, StyleSheet, View, TouchableHighlight } from 'react-native';
import styles from './styles';
//import AsyncStorage from '@react-native-community/async-storage';
import { AsyncStorage } from 'react-native';
import * as firebase from 'firebase';
import '@firebase/firestore';


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
    first_name: '',
    last_name: '',
  }

  componentWillMount(){
    console.log('In Profile screen componentWillMount');

    this.get_user_info();

 
      this.props.navigation.setParams({SignOut: this._signOut,});      
  }  

  get_user_info = () => {

    let self = this;
    firebase.firestore().collection('users').doc(firebase.auth().currentUser.uid).get()
    .then(function(doc){
      self.setState({
        email: doc.data().email,
        first_name: doc.data().first_name,
        last_name: doc.data().last_name,
      })            
    })
    .catch(function(error){
      console.log('Error in get_user_info function: ', error);
    })

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
                //global.email = '';
                //global.userId = 0;
  
                navigation.push('Login');
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
         <Text style={styles.profile_text}>{this.state.first_name}</Text>
         <Text style={styles.profile_text}>{this.state.last_name}</Text>
      </View>
    );
  }
}

export default ProfileScreen;