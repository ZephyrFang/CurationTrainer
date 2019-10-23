import React, { Component } from 'react';
import { AsyncStorage, Alert } from 'react-native'
//import { IText, Button, View, TouchableHighlight, FlatList, TouchableOpacity, Alert, Platform, Dimensions } from 'react-native';
import { Item, Form, Input, Button, Label, Container, Text } from 'native-base';
import * as firebase from 'firebase';
import styles from './styles';

import { RetrieveData, StoreData } from './helpers.js'

class AuthenticationScreen extends Component{

    state = {
        email: '',
        password: ''
    }

    SignIn = ( email, password ) => {

        const { navigation } = this.props;

        try {
            firebase.auth().signInWithEmailAndPassword(email, password);
            /* firebase.auth().onAuthStateChanged(user => {
                alert(email);

                AsyncStorage.setItem('userId', JSON.stringify(user.uid)).then(() => {
                    this.props.navigation.push('Groups');  
                })           
                  .catch((error) => {
                    console.log('Error: ', error);
                  })
                
            })*/

            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    AsyncStorage.setItem('userId', JSON.stringify(user.uid)).then(() => {
                        global.email = email;
                        global.userId = user.uid;
                        navigation.push('Groups');  
                    })           
                      .catch((error) => {
                        console.log('Error: ', error);
                      })                             
                } 

              });
        }
        catch (error){
            console.log(error.toString(error));
        }
    }

    SignUp = ( email, password ) => {
        const { navigation } = this.props;
        try {
            firebase.auth().createUserWithEmailAndPassword(email, password);

            firebase.auth().onAuthStateChanged(function(user) {
                if (user) {
                    AsyncStorage.setItem('userId', JSON.stringify(user.uid)).then(() => {
                        global.email = email;
                        global.userId = user.uid;
                        navigation.push('Groups');  
                    })           
                      .catch((error) => {
                        console.log('Error: ', error);
                      })                             
                } 

              });
        }
        catch (error) {
            console.log(error.toString(error));
        }
    }

    render() {
        return (
            <Container style={styles.authentication_container}>
                <Form>
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

                    <Button full rounded onPress={ () => this.SignIn(this.state.email, this.state.password)}>
                        <Text>SignIn</Text>
                    </Button>
                    <Button full rounded success style={{ marginTop: 20 }}
                            onPress={() => this.SignUp( this.state.email, this.state.password )}
                    >
                        <Text>Signup</Text>
                    </Button>
                </Form>
            </Container>
        );
    }
}

export default AuthenticationScreen;