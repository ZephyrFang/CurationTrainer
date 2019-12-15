import React, { Component } from 'react';
import { Image, ScrollView, Text, Button, View, TouchableHighlight, FlatList, TouchableOpacity, Alert, Platform, Dimensions } from 'react-native';
import styles from './styles';
//import AsyncStorage from '@react-native-community/async-storage';
import { AsyncStorage } from 'react-native';
import { RetrieveData, StoreData, cloud_delete_group, delete_group_from_memory, get_column_number } from './helpers.js';
import * as GLOBAL from './global.js';

import * as firebase from 'firebase';

class GroupsScreen extends Component {

    static navigationOptions = ({navigation}) => {
        return {
            title: 'Photo Groups',
          
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
        groups: [],
        //user_email: '',
        column: 3,
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

          this.getGroups();  
          let column = get_column_number(Dimensions, 150);
          console.log('<<<<<< On GroupsScreen, column: ', column);
          this.setState({ column: column });  
    }

    componentDidMount(){
        console.log('In GroupsScreen compomentDidMount method. ');

        this.props.navigation.setParams({
            newGroup: this._newGroup, 
            removeGroups: this._removeGroups,            
        });

        this.setState({
            //user_email: global.email,
        });
        
             
        //this.fetch_groups_from_cloud(global.email); 
    }

    fetch_groups_from_cloud = () => {
        console.log('***** In GroupsScreen fetch_groups_from_cloud function **** ');
        let user_id = firebase.auth().currentUser.uid;
        console.log('... current user id: ', user_id);
        
        //var storage = firebase.storage();
        global.groups = [];
        this.setState({ groups: global.groups });
        const db = firebase.firestore();
        let self = this;
        
        db.collection('users').doc(user_id).collection('photo_groups')
        //.where('uid', '==', user_id)
        .orderBy('addedAt', 'desc').onSnapshot(function(querySnapshot){

            querySnapshot.docChanges().forEach(function(change){
                // To sync different devices when group deleted.
                if (change.type == 'removed'){
                    console.log('fetch_groupss_from_cloud function, onSnapshot, group removed: ', change.doc.id);
                    delete_group_from_memory(change.doc.id, self);
                }
            })

            console.log('*** Get snap shot of photo groups *** ');
            querySnapshot.forEach(function(doc){
                console.log('*** foreEach snap shot of photo groups *** ');
                //console.log(doc.id, ' => ', doc.data());
                let cover_id = doc.data().cover_id;
                //console.log('cover_id: ', cover_id);
                //let cover_ref = doc.collection('photos').doc(cover_id);
                let cover_ref = db.collection('users').doc(user_id).collection('photo_groups').doc(doc.id).collection('photos').doc(cover_id);   
                
                cover_ref.onSnapshot(function(cover){        
                    // Use onSnapshot instead of get to enable user login on different devices updates new group cover automatically 

                    if ( !cover.exists) return;                    
                    console.log('cover_ref.onSnapshot, cover.data().uploaded: ', cover.data().uploaded);
                    if (cover.data().uploaded){
                        var ref = firebase.storage().ref().child('CurationTrainer/' + user_id + '/' + doc.id + '/' + cover_id);
                        ref.getDownloadURL()
                        .then(function(url){
                            self._set_groups_state(doc.id, cover_id, url, doc.data().count, doc.data().addedAt, self, true);
                            //console.log('cover_url', url);                          
                        })
                    }
                    else{
                        self._set_groups_state(doc.id, cover_id, cover.data().local_uri, doc.data().count, doc.data().addedAt, self, false);  
                    }
                }, function(error){
                    console.log('Error on GroupsScreen onSnapshot of cover: ', error);
                    
                })
            })
            //console.log('1.global.groups: ', global.groups);
        }, function(error){
            console.log('Error on GroupsScreen onSnapshot of groups: ', error);
        }) 
      }

    _set_groups_state = (id, cover_id, cover_uri, count, addedAt, self, cover_uploaded) => {
        /* Check whether the group is already in global.groups. If not, add it in and setState. */

        //console.log('****** In GroupsScreen _set_groups_state function. ****** ');
        let index = global.groups.findIndex(g => {
            return g.id == id;
        })
        //console.log('_set_groups_state, index: ', index);
        if (index == -1){
            let group = {
                id: id,
                cover_id: cover_id,
                cover_uri: cover_uri,
                //user: email,
                count: count,
                addedAt: addedAt,
                }
            //global.groups.unshift(group);    
            global.groups.splice(1, 0, group);                     
            self.setState({ groups: global.groups});
            //console.log('<<<<<< <<<<<<<<<<<<<<<<<<<<<<<<< group added into global and state, group cover using local uri.');
        }  
        else{
            if (cover_uploaded){
                let group = global.groups[index];
                if(group.cover_uri != cover_uri){
                    group.cover_uri = cover_uri; // change photo uri from local uri to cloud url if photo has uploaded to cloud 
                    group.cover_id = cover_id; // When group cover changed, Sync different devices on GroupPhotos Screen.
                    self.setState({ groups: global.groups });
                }
            }
        }
    }

    getGroups = () => {
        /* Get groups from Cloud or Global.groups and set State.groups */
       
        /* Get groups from global.groups */            
        console.log('In GroupsScreen getGroups function, global.groups.length is: ', global.groups.length);   
        this.setState({ groups: global.groups });        

        if (global.groups.length <= 0 ) {
            /* Global.groups is empty, there is only a 'New Group' string in it. Get groups from Cloud */
            console.log('fetching groups from cloud ...');
            this.fetch_groups_from_cloud();            
        }
    }

    getGroups0 = () => {
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
        /* Remove all current user's groups from device NOT IN USE */

        /*console.log('@@@@@ In __clearGroups function.');

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

                  // Clone array without reference 
                  var current_user_groups = JSON.parse(JSON.stringify(global.groups));  
                  const email = global.email;                

                  var i;
                  for ( i=0; i< current_user_groups.length; i++){
                      let g = current_user_groups[i];

                      // Todo:
                      cloud_delete_group(g.id, g.photos, g.cover_id, email);
                  }
                  global.groups = [];
                  this.props.navigation.push('Groups');
                          
                },
                style: 'destructive',
              },
            ],
            {cancelable: false},      
          );   */      
    }     
  
    render (){      

    /* Insert 'New Group' to the begin of the groups array to display Add Group icon in the Flatlist */
    let groups = this.state.groups;  
    console.log('***** In GroupsScreen render method. this.state.groups.length: ', this.state.groups.length); 
    
    groups.sort((a,b) => (a.addedAt < b.addedAt)? 1: -1 ); 
    let groupsCopy = [...groups];
    groupsCopy.unshift("New Group");
    console.log('groupsCopy.length: ', groupsCopy.length);   
 
     return(
      <View style={styles.albums_container1}>                   
        
          <FlatList style={styles.list1} 
                    contentContainerStyle={styles.listContainer1}
                    data={groupsCopy} 
                    horizontal={false} 
                    numColumns={this.state.column} 
                    keyExtractor={(item) => { return item.id; }}
                    ItemSeparatorComponent={() => { 
                        return ( <View style={styles.separator1} /> 
                            )}} 
                    renderItem={(post) => {
                        const item = post.item; 
                        if (item.cover_id){
                            return (
                                <View style={ styles.card }>
                                    <View style={ styles.imageContainer }>
                                        <TouchableHighlight onPress={() => this.props.navigation.push('GroupPhotos', {
                                            group_id: item.id,
                                            photos: item.photos,
                                            add_photos: false,
                                            cover_id: item.cover_id,
                                            //uploaded: item.uploaded,
                                             })}>
                                          <Image source={{uri:item.cover_uri}} style={ styles.cardImage } />
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