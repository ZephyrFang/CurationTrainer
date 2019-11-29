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
            title: 'Photo Groups',
            headerLeft: (
                <Button 
                    onPress={navigation.getParam('removeGroups')}
                    title='Remove All'
                />
              ),
              headerRight: (

                <View style={{flex: 0.1, flexDirection:'row' }}>
 
                  <TouchableHighlight style={{width: 50}} onPress={() => {navigation.navigate('Profile')}}>
                    <Image source={require('./images/user.png')} style={{width:25, height:25}} />
                  </TouchableHighlight> 
                </View>
        
              ),

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
        
        //this.getGroups();       
        this.fetch_groups_from_cloud(global.email); 
    }

    fetch_groups_from_cloud = async (email) => {
        console.log('***** In Fetching groups from cloud function **** ');
        var storage = firebase.storage();
        global.groups = [];
        this.setState({ groups: global.groups });
        const db = firebase.firestore();
        let self = this;
        db.collection('users').doc(email).collection('photo_groups').orderBy('addedAt', 'desc').onSnapshot(function(querySnapshot){
            console.log('*** Get snap shot of photo groups *** ');
            querySnapshot.forEach(function(doc){
                console.log('*** foreEach snap shot of photo groups *** ');
                //console.log(doc.id, ' => ', doc.data());
                let cover_id = doc.data().cover;
                console.log('cover_id: ', cover_id);
                //let cover_ref = doc.collection('photos').doc(cover_id);
                let cover_ref = db.collection('users').doc(email).collection('photo_groups').doc(doc.id).collection('photos').doc(cover_id);
                
                cover_ref.get().then(function(cover){

                    if (cover.data().uploaded){
                        var ref = firebase.storage().ref().child('CurationTrainer/' + email + '/' + doc.id + '/' + cover_id);
                        ref.getDownloadURL().then(function(url){
                            console.log('cover_url', url);
                            cover_url = url;
                            let group = {
                                id: doc.id,                    
                                cover: cover_url,
                                //uploaded: false,
                                user: email,
                                count: doc.data().count,
                              }
                            global.groups.unshift(group);
                            
                            self.setState({ groups: global.groups, });
                        })
                    }
                    else{
                        let group = {
                            id: doc.id,
                            cover: cover.data.local_uri,
                            user: email,
                            count: doc.data().count,
                        }
                        global.groups.unshift(group);
                        self.setState({ groups: global.groups});
                    }
                })

               
            })
            //console.log('1.global.groups: ', global.groups);

        })
        
      }

    getGroups = () => {
        /* Get groups from Device or Global.groups and set State.groups */

        let groups = [];
        let groupsCopy;
        if (global.groups.length == 0){
            
            //console.log('2.global.groups: ', global.groups);

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
                                      <Text style={styles.count}>({item.count})</Text>
                                     
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