import React, { Component } from 'react';
import { AsyncStorage, Alert, Button, View } from 'react-native'
//import { IText, Button, View, TouchableHighlight, FlatList, TouchableOpacity, Alert, Platform, Dimensions } from 'react-native';
import { Item, Form, Input, Label, Container, Text } from 'native-base';
import { Button as NBButton } from 'native-base';
import * as firebase from 'firebase';
import styles from './styles';
//import { Image, ScrollView, View, TouchableHighlight, FlatList, TouchableOpacity, Alert, Platform, Dimensions } from 'react-native';


class LoginScreen extends Component{
    static navigationOptions = ({ navigation }) => {
        return {
        title: 'Login',    
    
        headerRight: (
          <View style={{flex: 0.1, flexDirection:'row' }}> 
             <Button                     
                    onPress={() => {navigation.navigate('Register')}}
                    title='Register'
                />
          </View>
          )  
        };
      }

    state = {
        email: '',
        password: ''
    }

    SignIn = ( email, password ) => {

        const { navigation } = this.props;
        firebase.auth().signInWithEmailAndPassword(email, password)
        .catch(function(error){
            if (error.code === 'auth/wrong-password'){
                alert('Wrong passord');
            }
            else{
                alert(error.message);
            }
            console.log('Error on LoginScreen when login: ', error);
        })

        firebase.auth().onAuthStateChanged(function(user){
            if (user){
                AsyncStorage.setItem('userId', JSON.stringify(user.uid))
                .then(() => {
                    navigation.push('Groups');
                })
                .catch((error) => {
                    console.log('Error when set uid on device after user Login: ', error);
                })
            }
        })
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

                    <NBButton full rounded onPress={ () => this.SignIn(this.state.email, this.state.password)}
                    
                    >
                                 <Text>Login</Text>
                    </NBButton>                   
                        
                </Form>
            </Container>
        );
    }
}

export default LoginScreen;