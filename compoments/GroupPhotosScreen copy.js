import React, { Component } from 'react';
import { Image, ScrollView, Text, Button, View, TouchableHighlight, Alert } from 'react-native';
import styles from './styles';
import uuid from 'react-native-uuid';
//import AsyncStorage from '@react-native-community/async-storage';
import {AsyncStorage} from 'react-native';

//import * as GLOBAL from './global.js';
import { RetrieveData, StoreData, ConfirmAlert, AsyncAlert } from './helpers.js';


class GroupPhotosScreen extends Component {

  static navigationOptions = ({navigation}) => {
    return {      
      headerTitle: 'Group Photos',
      headerLeft: (
        <Button 
        onPress={() => navigation.push('Groups')}
        title='Groups'
        />
      ),
      headerRight: (
        <Button 
        onPress={() => navigation.push('SelectPhotos', { 'add_photos': true })}
        //onPress={() => navigation.push('SelectPhotos')}
        title='Add Photos'
        />
      ),
    };
  }

  saveNewGroup = () => {

    console.log(' *** In GroupPhotosScreen saveNewGroup method.*********');

    //const { navigation } = this.props;

    var group_id = uuid.v1();
    global.group_id = group_id;
    //var photos = this.state.photos;
    var photos = global.photos;
    var cover;
    if ( global.cover == 0){
      cover = photos[0].uri;
    }
    else{
      cover = global.cover;
    }
  
    
    let group = {
      id: group_id,
      photos: photos,
      cover: cover,
    }

    global.groups.unshift(group);

    
    RetrieveData('groups').then((result) => {
      let groups = []
      if ( result ){
        //console.log('@#@#@# retreve groups, result: ', result);
        groups = JSON.parse(result);
      }
      groups.unshift(group);
      StoreData('groups', groups).then(() => {
        this.props.navigation.push('Groups'); 
      }
        
      )
    })
  }



  DeleteGroup = () => {

    console.log('In DeleteGroup method.')

    /* const alert_title = 'Alert';
    const alert_text = 'Are you sure to delete this group?';
    const cancel_text = 'Cancel';
    const ok_text = 'Delete Group';    
    
    ConfirmAlert(alert_title, alert_text, cancel_text, ok_text).then(result) => {
      if (result){
        let groups = global.groups;
        var index = groups.findIndex(g => {
          return g.id == global.group_id;
        });
  
        if (index > -1){
          groups.splice(index, 1);
          global.groups = groups;
          StoreData('groups', groups);
          this.props.navigation.push('Groups');
        }    
      }
    }*/

    //console.log('delete group alert result: ', result);

    //onst userResponse = await AsyncAlert();
    //console.log('userResponse: ', userResponse);

    Alert.alert(
      'Alert',
      'Are you sure to delete this group?',
      [
        {
        text: 'Cancel',
        onPress: () => {
          console.log('Cancel Pressed');
                   
        },
        style: 'cancel',
        },    
        {
          text: 'Delete', 
          onPress: () => {
            console.log('Yes Pressed');
            let groups = global.groups;
            var index = groups.findIndex(g => {
            return g.id == global.group_id;
            });
  
            if (index > -1){
              groups.splice(index, 1);
              global.groups = groups;
              StoreData('groups', groups);
              this.props.navigation.push('Groups');
        }           
          },
          style: 'destructive',
        },
      ],
      {cancelable: false},      
    ); 

    console.log('I am here');
   
  }

  updateGroup = () => {

    console.log(' *** In GroupPhotosScreen updateGroup method.*********');

    let groups = global.groups;

    let index = groups.findIndex(g => {
      return g.id == global.group_id;
    })

    if (index > -1){
      let group = groups[index];
      group.photos = global.photos;
      groups[index] = group;
      StoreData('groups', groups);
    }
  }

  setGlobalState= () => {

    console.log('&&&&&In setGlobalState method.&&&&&&');
    //console.log('global.photos: ', global.photos);
    //this.updateState();
    const { navigation } = this.props;

    //const num = navigation.getParam('num', 0);

    var photos = navigation.getParam('photos', []);
    console.log('photos: ', photos);
     const cover = navigation.getParam('cover', 0);
    if (cover !== 0){     
      global.cover = cover;
    }
    var old_group_id = global.group_id;
    var group_id = navigation.getParam('group_id', 0);
    console.log('group_id: ', group_id);

    if (group_id == 0){ 
      // New group, hasn't set cover
      console.log('new group.');
      if (photos.length > 0){
        global.cover = photos[0].uri;
      }  
    }
    else{      
      global.group_id = group_id;     
    }
    
    var add_photos = navigation.getParam('add_photos', false);

    console.log('photos.length from navigation: ', photos.length);
    if (photos.length > 0 ){ 
      
      if ( global.group_id !== 0 && global.group_id == old_group_id && add_photos == true ){
        // Adding photos to an exist group.
        console.log('adding photos, global.photos.length before push: ');
        global.photos.push(...photos);
        this.updateGroup();
      }
      else{        
        global.photos = photos;      
      }            
    } 
  }

  renderButton = () => {

    console.log('In renderButton method. global.group_id: ', global.group_id );   

    if ( global.group_id == 0 ){
      return(
        <Button title='Save New Group' onPress={() => this.saveNewGroup() } />
      );
    }
    else{
      return (
        <Button title='Delete Group' onPress={() => this.DeleteGroup() }  />        
      );      
    }
  }

  renderCover = (uri) => {
    if ( global.cover == uri){
      return 'Cover'   
    }    
  }

  render() {
    
    console.log('In GroupPhotosScreen render method.');
    this.setGlobalState();

    //console.log('global photos: ', global.photos);
    return (
      <View style={styles.container} >
             
        <View style={{flex:0.9}} >
              <ScrollView >
                  <View style={styles.imageGrid}>
                      {global.photos.map((p,i) => {
                        
                          return (
                            
                                <TouchableHighlight onPress={() => {this.props.navigation.navigate('DisplayPhoto', {
                                  photo: p,
                                });
                                }} >
                                  <View>
                                    <Image key={i}
                                    style={styles.image}
                                    source={{ uri: p.uri}}
                                    />                 
                                      <Text>
                                 
                                 {this.renderCover(p.uri)}             
                               </Text> 
                               </View>
                                </TouchableHighlight>                     
                               
                             
            
                         
                          );
                      })}
                      
                  </View>
                  

              </ScrollView>
              </View>
              <View style={{flex: 0.1, flexDirection:'row' }}>
              {this.renderButton()}  
              </View>
       
      </View>
    );
  }
}

export default GroupPhotosScreen;