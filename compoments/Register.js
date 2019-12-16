import React, { Component } from 'react';
import { AsyncStorage, Alert, Button, View } from 'react-native'
//import { IText, Button, View, TouchableHighlight, FlatList, TouchableOpacity, Alert, Platform, Dimensions } from 'react-native';
import { Item, Form, Input, Label, Container, Text } from 'native-base';
import { Button as NBButton } from 'native-base';

import * as firebase from 'firebase';
import '@firebase/firestore';

import styles from './styles';

//import { RetrieveData, StoreData } from './helpers.js'

class RegisterScreen extends Component{  

    state = {
        email: '',
        password: '',
        first_name: '',
        last_name: ''
    } 

    register = ( email, password, first_name, last_name ) => {
        const { navigation } = this.props;
        firebase.auth().createUserWithEmailAndPassword(email, password)
        .catch(function(error){
            console.log('Error on RegisterScreen when register: ', error);
            //alert(error);
            Alert.alert(
                'Error',
                error.message,
                [                             
                  { text: 'OK', onPress: () => console.log('OK Pressed') },
                ],
                { cancelable: false }
              );
        })
        
        firebase.auth().onAuthStateChanged(function(user){
            firebase.firestore().collection('users').doc(user.uid).set({
                first_name: first_name,
                last_name: last_name,
                email: email,
            })   
            .then(function(){
                /* Set local device storage userId */
                return AsyncStorage.setItem('userId', JSON.stringify(user.uid));
            })      
            .then(function(){
                //global.email = email;
                //global.userId = user.uid;
                navigation.push('Groups'); 
            })  
            .catch((error)=>{
                alert(error);                
                console.error('Error on Rigister Screen: ', error);
                //alert(error);
            })
        })       
                
    }

    render() {
        return (
            <Container style={styles.authentication_container}>
                <Form>
                <Item>
                        <Label>First Name</Label>
                        <Input autoCapitalize='none'
                               autoCorrect={false}
                               onChangeText={first_name => this.setState({first_name})}                               
                        />
                    </Item>

                    <Item>
                        <Label>Last Name</Label>
                        <Input autoCapitalize='none'
                               autoCorrect={false}
                               onChangeText={last_name => this.setState({last_name})}                               
                        />
                    </Item>

                    <Item floatingLabel>
                        <Label>Email</Label>
                        <Input autoCapitalize='none'
                               autoCorrect={false} 
                               onChangeText={email => this.setState({email})}
                        />
                    </Item>

                    <Item>
                        <Label>Password</Label>
                        <Input secureTextEntry={true}
                               autoCapitalize='none'
                               autoCorrect={false}
                               onChangeText={password => this.setState({password})}                               
                        />
                    </Item> 
                        
                    <NBButton full rounded success style={{ marginTop: 20 }}
                            onPress={() => this.register( this.state.email, this.state.password, this.state.first_name, this.state.last_name )}                            
                    >
                        <Text>Register</Text>
                    </NBButton>
                </Form>
            </Container>
        );
    }
}

export default RegisterScreen;