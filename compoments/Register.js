import React, { Component } from 'react';
import { AsyncStorage, Alert, Button, View } from 'react-native'
//import { IText, Button, View, TouchableHighlight, FlatList, TouchableOpacity, Alert, Platform, Dimensions } from 'react-native';
import { Item, Form, Input, Label, Container, Text } from 'native-base';
import { Button as NBButton } from 'native-base';
import * as firebase from 'firebase';
import styles from './styles';

import { RetrieveData, StoreData } from './helpers.js'

class RegisterScreen extends Component{
  

    state = {
        email: '',
        password: ''
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
                            onPress={() => this.SignUp( this.state.email, this.state.password )}
                            
                    >
                        <Text>Register</Text>
                    </NBButton>
                </Form>
            </Container>
        );
    }
}

export default RegisterScreen;