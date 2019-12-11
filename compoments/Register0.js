import React, { Component } from 'react';
import { AsyncStorage, Alert, Button, View } from 'react-native'
//import { IText, Button, View, TouchableHighlight, FlatList, TouchableOpacity, Alert, Platform, Dimensions } from 'react-native';
import { Item, Form, Input, Label, Container, Text } from 'native-base';
import { Button as NBButton } from 'native-base';

import * as firebase from 'firebase';
import '@firebase/firestore';

import styles from './styles';

import { RetrieveData, StoreData } from './helpers.js'

class RegisterScreen extends Component{  

    state = {
        email: '',
        password: '',
        first_name: '',
        last_name: ''
    } 

    register = ( email, password, first_name, last_name ) => {
        const { navigation } = this.props;
        try {
            firebase.auth().createUserWithEmailAndPassword(email, password);

            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    AsyncStorage.setItem('userId', JSON.stringify(user.uid)).then(() => {

                        // Add new user to Firestore. 
                        const db = firebase.firestore();
                        /*db.collection('users').doc(email).set({
                            uid: user.uid,
                            first_name: first_name,
                            last_name: last_name,
                            email: email
                        })*/
                        db.collection('users').doc(user.uid).set({
                            //uid: user.uid,
                            first_name: first_name,
                            last_name: last_name,
                            email: email
                        })             
                        .then(function(docRef){
                            //console.log('Document written with email: ', docRef.email);
                        })
                        .catch(function(error){
                            console.error('Error adding document: ', error);

                        });

                        global.email = email;
                        global.userId = user.uid;
                        navigation.push('Groups');  
                    })           
                      .catch((error) => {
                        console.log('Error: ', error);
                        alert(error);
                      })                             
                } 

              });
        }
        catch (error) {
            console.log(error.toString(error));
            alert(error);
        }
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