import React, { Component } from 'react';
import { Image, ScrollView, Text, Button, View, TouchableHighlight, FlatList, TouchableOpacity, Alert, Platform, Dimensions } from 'react-native';
import styles from './styles';
//import AsyncStorage from '@react-native-community/async-storage';
import { AsyncStorage } from 'react-native';
import { RetrieveData, StoreData, cloud_delete_group } from './helpers.js';
import * as GLOBAL from './global.js';

import * as firebase from 'firebase';

class GroupsScreen extends Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: 'Photo Groups, ' + global.email,
            headerLeft: (
                <Button 
                    onPress={navigation.getParam('removeGroups')}
                    title='Remove All'
                />
              ),

            headerRight: (
                <Button                 
                onPress={() => {
                    firebase.auth().signOut();
                    AsyncStorage.removeItem('userId').then(() =>{
                        /* Clear up global properties. Otherwise the next signed In user will see the previous user's photo groups. */
                        global.photos = [];
                        global.groups = [];
                        global.email = '';
                        global.userId = 0;

                        navigation.push('SignIn');
                    }); 
                    //navigation.push('AuthLoading');
                }}
                title='Sign Out'
            />

            )
        };
    }

    state = {
        //groupsCopy: [],
        groups: [],
        user_email: '',
    }

    componentWillMount(){
        /*var user = firebase.auth().currentUser;;
        if (user == null ){
          this.props.navigation.push('Authentication');    
        }*/

        /*const { navigation } = this.props;

        firebase.auth().onAuthStateChanged(function(user) {
            if (!user) {
                navigation.push('Authentication');                
            } 
            else{
                name = user.displayName;
                email = user.email;
                alert(email);
            }
          });*/

  
    }

    componentDidMount(){
        console.log('In GroupsScreen compomentDidMount method. ');

        this.props.navigation.setParams({
            newGroup: this._newGroup, 
            removeGroups: this._removeGroups,            
        });

        this.setState({
            user_email: global.email,
        });
        
        this.getGroups();        
    }

    getGroups = () => {
        /* Get groups from Device or Global.groups and set State.groups */

        let groups = [];
        let groupsCopy;
        if (global.groups.length == 0){
            /* Get groups from device. */
            console.log('global.groups.length is 0');
            RetrieveData('groups').then((result) => {
                
                if (result ){
                    console.log('****** Groups retrieved. *****');
                    //console.log('result: ', result);
                    
                    groups = JSON.parse(result);
                    //console.log('groups: ', groups);   

                    var current_user_groups = groups.filter(g => {
                        return g.userId == global.userId;
                    });                    
                   
                    console.log('current user groups lenth: ', current_user_groups.length);
                    
                    global.groups = current_user_groups;
                    //global.groups = groups;
                    this.setState({ groups: current_user_groups, });
                    //this.setState({ groups: groups, });
                }               
            })  
            .catch((error) => {
                console.log('Error in getGroups function in GroupsScreen: ', error);
              })              
        }
        else{
            /* Get groups from global.groups. */
            groups = global.groups;
            console.log('get groups from global.groups, length is: ', groups.length);   

            this.setState({ groups: groups, });
        }
    }

    _newGroup = () => {
        /* Add new group */
        console.log('#### In _newGroup function.');
        //global.group_id = 0;
        this.props.navigation.navigate('SelectPhotos', {
            //new_group: true, 
            //group_id: 0,
        });
    }

    _removeGroups = () => {
        /* Remove all current user's groups from device */

        console.log('@@@@@ In __clearGroups function.');

        Alert.alert(
            'Alert',
            'Are you sure to remove all groups?',
            [
              {
              text: 'Cancel',
              onPress: () => {
                console.log('Cancel Pressed');
                         
              },
              style: 'cancel',
              },    
              {
                text: 'Remove all', 
                onPress: () => {
                  console.log('Yes Pressed');
                  //AsyncStorage.removeItem('groups');
                  
                  var groups = [];
                  RetrieveData('groups').then((result) => {
                      //console.log('after remove groups: ', result);
                
                    if (result ){
                        //console.log('****** Groups retrieved. *****');
                        
                        groups = JSON.parse(result);
                        //console.log('groups lenth: ', groups.length);
                        var other_groups = groups.filter(function(g){
                            return g.userId != global.userId;
                        });
                        AsyncStorage.removeItem('groups').then(() => {
                            StoreData('groups', other_groups);
                        })
                        .catch((error) => {
                            console.log('Error when removeItem in removeGroups function : ', error);
                          })     
                       
                    }               
                })
                .catch((error) => {
                    console.log('Error when retrieveData in removeGroups function: ', error);
                  })     

                  /* Clone array without reference */
                  var current_user_groups = JSON.parse(JSON.stringify(global.groups));  
                  const email = global.email;                

                  var i;
                  for ( i=0; i< current_user_groups.length; i++){
                      let g = current_user_groups[i];
                      cloud_delete_group(g.id, g.photos, g.cover, email);
                  }
                  global.groups = [];
                  this.props.navigation.push('Groups');
                          
                },
                style: 'destructive',
              },
            ],
            {cancelable: false},      
          );         
    }    
 
  
    render (){
        console.log('In GroupsScreen render method. ')

    /* Insert 'New Group' to the begin of the groups array to display Add Group icon in the Flatlist */
    let groups = this.state.groups;    
    let groupsCopy = [...groups];
    groupsCopy.unshift("New Group");
 
     return(
      <View style={styles.albums_container}>                   
        
          <FlatList style={styles.list} 
                    contentContainerStyle={styles.listContainer}
                    data={groupsCopy} 
                    horizontal={false} 
                    numColumns={2} 
                    keyExtractor={(item) => { return item.id; }}
                    ItemSeparatorComponent={() => { 
                        return ( <View style={styles.separator} /> 
                            )}} 
                    renderItem={(post) => {
                        const item = post.item; 
                        if (item.cover){
                            return (
                                <View style={ styles.card }>
                                    <View style={ styles.imageContainer }>
                                        <TouchableHighlight onPress={() => this.props.navigation.push('GroupPhotos', {
                                            group_id: item.id,
                                            photos: item.photos,
                                            add_photos: false,
                                            cover: item.cover,
                                            //uploaded: item.uploaded,
                                             })}>
                                          <Image source={{uri:item.cover}} style={ styles.cardImage } />
                                        </TouchableHighlight>
                                    </View>
                                    <View style={styles.cardContent}>
                                      <Text style={styles.count}>({item.photos.length})</Text>
                                     
                                    </View>
                               
                                </View>
                            )
                        }
                        else {
                            return (
                                <View style={ styles.card }>
                                    <View style={ styles.imageContainer }>
                                    <TouchableHighlight onPress={() => this.props.navigation.push('SelectPhotos', { 
                                        'new_group': true,
                                        'group_id': 0,
                                        })}>
                                            <Image style={styles.cardImage} source={require('./images/add.png')}/>
                                    </TouchableHighlight>
                                        
                                    </View>
                                    <View style={styles.cardContent}>
                                      <Text style={styles.count}>New Group</Text>
                                    </View>
                               
                                </View>
                            )
                        }                       
                       
                    }}
          />

      </View>
  );
  }
}

export default GroupsScreen;