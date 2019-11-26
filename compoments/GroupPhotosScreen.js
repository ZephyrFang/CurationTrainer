import React, { Component } from 'react';
import { Image, ImageBackground, ScrollView, Text, Button, View, TouchableHighlight, TouchableOpacity, Alert, Platform, Dimensions } from 'react-native';
import styles from './styles';
import uuid from 'react-native-uuid';
//import AsyncStorage from '@react-native-community/async-storage';
import {AsyncStorage} from 'react-native';

import * as firebase from 'firebase';
import '@firebase/firestore';

//import * as GLOBAL from './global.js';
import { RetrieveData, StoreData, cloud_delete_group, cloud_upload_photo, cloud_upload_photo_group, get_photo_size } from './helpers.js';


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

        <View style={{flex: 0.1, flexDirection:'row' }}>
          <TouchableHighlight style={{width: 50}} onPress={navigation.getParam('DeleteGroup')}>
            <Image source={require('./images/delete_red.png')} style={{width:25, height:25}} />
          </TouchableHighlight>  
          <TouchableHighlight style={{width: 50}} onPress={() => navigation.navigate('Profile')}>
            <Image source={require('./images/user.png')} style={{width:25, height:25}} />
          </TouchableHighlight> 
        </View>

      ),
    };
  }

  state = {
    photos: [],
    cover: 0,
    group_id: 0,
    //uploaded: false,
  }

  cloud_add_photos = (group_id, photos, email) => {
    const db = firebase.firestore();
    var group_ref = db.collection('users').doc(email).collection('photo_groups').doc(group_id);
    var i;
    let self = this;
    for (i=0; i < photos.length; i++){
      photo = photos[i];
      var new_photo_ref = group_ref.collection('photos').doc();
      cloud_upload_photo(photo, group_id, new_photo_ref.id, email, global.target_size);

      const photo_size = get_photo_size(photo, global.target_size);      
      const timestamp = firebase.firestore.FieldValue.serverTimestamp();
      new_photo_ref.set({
        user: email,
        group_id: group_id,
        width: photo_size[0],
        height: photo_size[1],
        addedAt: timestamp,
      })
      .then(function(){
        console.log('New photo added to Group. ID: ', new_photo_ref.id);
        //self.fetch_photos_from_cloud(email, group_id);
      })
      .catch(function(error){
        console.log('Error adding cover photo: ', error);
      })

    }
  }

 
  cloud_upload_group = (group_id, photos, cover, email) => {
    /* Upload photos in the group to Cloud (Firebase Storage) */

    console.log(' *** In uploadPhotos method.*********');

    //const group_id = this.state.group_id;
    //let photos = global.photos;
    //const cover = this.state.cover;
 
    var i;
    for ( i=0; i< photos.length; i++ ) {
      let p = photos[i];
      let is_cover = false;
      if ( p.uri == cover ){
        is_cover = true;
      }
      let result = cloud_upload_photo(p, group_id, is_cover, email);
      if ( !result ) {
        return;
      }
    }
  } 

  fetchData = () => {
    console.log('In fetchData method.')

    const { navigation } = this.props;

    var photos = navigation.getParam('photos', []);
    //console.log('photos.length from navigation: ', photos.length);
    //console.log('photos: ', photos);
     const cover = navigation.getParam('cover', 0);
     //const uploaded = navigation.getParam('uploaded', 0);
     var group_id = navigation.getParam('group_id', 0);
     //const new_group = navigation.getParam('new_group', false);
     const add_photos = navigation.getParam('add_photos', false);
     console.log('add_photos: ', add_photos);

     this.setState({
       'group_id': group_id,
       //uploaded: uploaded,
      });

     if (add_photos){
       //var ps = this.state.photos;
       
       /*console.log('add_photos is true, global.photos.length before push: ', global.photos.length);
       //ps.push(...photos);
       global.photos.push(...photos);

       // Upload added photos to cloud 
       this.cloud_upload_group(group_id, photos, 0, global.email);

       console.log('ps.length after push: ', global.photos.length);
       //his.setState({photos: ps });
       this.updateGroup();*/
       this.cloud_add_photos(group_id, photos, global.email);

     }
     else{
       /*if ( photos.length > 0 ){
         console.log('setState photos');
        //this.setState({photos: photos});
        global.photos = photos;
       }       */
       if (group_id){
        this.fetch_photos_from_cloud(global.email, group_id);
       }       
     }

     if (group_id == 0){
       // New Group
       this.saveNewGroup(photos);
     }
     else{
       
       if (cover != 0 ){
         this.setState({'cover': cover});
       }
     }
  }

  fetch_photos_from_cloud = (email, group_id) => {
    console.log('Fetching photos from cloud...');
    var storage = firebase.storage();    
    const db = firebase.firestore();
    let self = this;
    let photos = [];
    db.collection('users').doc(email).collection('photo_groups').doc(group_id).collection('photos').orderBy('addedAt').get().then(function(querySnapshot){
        querySnapshot.forEach(function(doc){
            console.log(doc.id, ' => ', doc.data());            
            
            var ref = storage.ref().child('CurationTrainer/' + email + '/' + group_id + '/' + doc.id);
            ref.getDownloadURL().then(function(url){
                console.log('photo_url', url);
                photo_url = url;
                let photo = {
                    id: doc.id,                    
                    uri: photo_url,                    
                    user: email,
                    width: doc.data().width,
                    height: doc.data().height,
                  }
                //global.photos.unshift(photo);
                photos.unshift(photo);
                
                self.setState({ photos: photos, });
            })
           
        })
        //console.log('1.global.groups: ', global.groups);

    })
    
  }

  componentWillMount(){
    // this.setGlobalState();
    this.fetchData();
    this.props.navigation.setParams({DeleteGroup: this._deleteGroup,});   
    //this.props.navigation.setParams({UploadGroup: this.cloud_upload_group,});     
}

_deleteGroup = () => {

  console.log('In DeleteGroup method.')
  
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
          //return g.id == global.group_id;
          return g.id == this.state.group_id;
          });

          if (index > -1){
            groups.splice(index, 1);
            global.groups = groups;
            StoreData('groups', groups);
            cloud_delete_group( this.state.group_id, global.photos, this.state.cover, global.email );
            this.props.navigation.push('Groups');
      }           
        },
        style: 'destructive',
      },
    ],
    {cancelable: false},      
  ); 

  //console.log('I am here');   
}



  /*renderButton = () => {

    console.log('In renderButton method. global.group_id: ', global.group_id );   

    if ( global.group_id == 0 ){
      return(
        <Button title='Save New Group' onPress={() => this.saveNewGroup() } />
      );
    }
    else{
      return (
        
        <TouchableHighlight onPress={() => this.DeleteGroup()}>
        <Image source={require('./images/rubbish-bin.png')} 
        style={{width:30, height:30}} />
      </TouchableHighlight>       
      );      
    }
  }*/


  renderCover = (uri) => {
    //if ( global.cover == uri){
    if ( uri == this.state.cover ){
      return (
      <View style={{ ...styles.countBadge, backgroundColor: 'none' }}>
      <Image source={require('./images/gold-medal.png')} 
            style={{width:30, height:30}} />
    </View>  
      )   
    }    
  }

  saveNewGroup = (photos) => {
    /* Save new photo group to Firebase ( Firestore and Storage ) */
    
    const db = firebase.firestore();
    var new_photo_group_ref = db.collection('users').doc(global.email).collection('photo_groups').doc();    
    var new_group_cover_photo_ref = new_photo_group_ref.collection('photos').doc();

    const group_id = new_photo_group_ref.id;
    const cover_id = new_group_cover_photo_ref.id;

    new_photo_group_ref.set({
      user: global.email,
      cover: cover_id,          

    })                     
    .then(function(){
        console.log('New group written with ID: ', group_id);
    })
    .catch(function(error){
        console.error('Error adding group: ', error);
    });

    /* Upload cover photo and save it to Firestore */
    const cover_photo = photos[0];
    let cover_size = get_photo_size(cover_photo, global.target_size);
    cloud_upload_photo(cover_photo, group_id, cover_id, email, global.target_size);
    console.log('cover_size: ', cover_size);
    const cover_timestamp = firebase.firestore.FieldValue.serverTimestamp();
    new_group_cover_photo_ref.set({
      user: email,
      group_id: group_id,   
      width: cover_size[0],
      height: cover_size[1],
      addedAt: cover_timestamp,
    })
    .then(function(){
      console.log('New Cover photo added. ID: ', cover_id);
    })
    .catch(function(error){
      console.log('Error adding cover photo: ', error);
    })


    /* Upload other photos to Firebase Storage and save them to Firestore */
    var i;
    var photo_id;
    for (i=1; i<photos.length; i++){
      var photo_ref = new_photo_group_ref.collection('photos').doc();
      photo_id = photo_ref.id;
      let p = photos[i];
      cloud_upload_photo(p, group_id, photo_id, email, global.target_size); 

      let photo_size = get_photo_size(p, global.target_size);
      const timestamp = firebase.firestore.FieldValue.serverTimestamp();      
        
        photo_ref.set({
        user: email,
        group_id: group_id,
        width: photo_size[0],
        height: photo_size[1],
        addedAt: timestamp,
      })
      .then(function(docRef){
        console.log('Photo document written with ID: ', photo_id);
        //photo_id = docRef.id;
        
      })
      .catch(function(error){
        console.error('Error adding photo to Firestore and Storage: ', error);
      })
         
      
    }
  }

  saveNewGroup0 = (photos) => {
    /* Save new group to the device and cloud */

    console.log(' *** In GroupPhotosScreen saveNewGroup method.*********');    

    //const group_id = uuid.v1();
    var group_id = uuid.v1();
 
    const cover = photos[0].uri;
    this.setState({
      group_id: group_id,
      cover: cover,
      //uploaded: false,
    });

        // Add new photo group to Firestore. 
        const db = firebase.firestore();
        var new_photo_group_ref = db.collection('users').doc(global.email).collection('photo_groups').doc();
        //.then(function(docRef){
        //  console.log('Document written with ID: ', docRef.id);
      //})
      //.catch(function(error){
      //    console.error('Error adding document: ', error);
      //});
        group_id = new_photo_group_ref.id;

        var new_group_cover_photo_ref = new_photo_group_ref.collection('photos').doc();
        /*.then(function(docRef){
          console.log('Document written with ID: ', docRef.id);
      })
      .catch(function(error){
          console.error('Error adding document: ', error);
      });*/
        var cover_id = new_group_cover_photo_ref.id;

        new_photo_group_ref.set({
          user: global.email,
          cover: new_group_cover_photo_ref.id,          

        })                     
        .then(function(docRef){
            console.log('Document written with ID: ', docRef.id);
        })
        .catch(function(error){
            console.error('Error adding document: ', error);
        });
    
    let group = {
      id: group_id,
      photos: photos,
      cover: cover,
      //uploaded: false,
      userId: global.userId,
    }
    
    global.groups.unshift(group);
    console.log('groups length in saveNewGroup: ', global.groups.length);

    //StoreData('groups', global.groups);
    //AsyncStorage.mergeItem('groups', JSON.stringify(group));
    var all_groups = [];
    /* RetrieveData('groups').then((result) => {
      //console.log('get groups result in saveNewGroup', result);
  
      if (result ){
          console.log('****** result is true. *****');
          
          all_groups = JSON.parse(result);
          all_groups.unshift(group);
          //console.log('groups lenth: ', groups.length);
          AsyncStorage.removeItem('groups').then(() => {
            StoreData('groups', all_groups);

          })
          .catch((error) => {
            console.log('Error: ', error);
          })  
         
      }
    else{

      //console.log('****** result is false,  save global.groups: ', global.groups);
      StoreData('groups', global.groups);
    }
  })
  .catch((error) => {
      console.log('Error when retrieveData in removeGroups function: ', error);
    })     */
    

    //this.cloud_upload_group(group_id, photos, cover, global.email);
    cloud_upload_photo_group(group_id, photos, cover, cover_id, email);
  } 


  updateGroup = () => {
    /* Update group photos */

    console.log(' *** In GroupPhotosScreen updateGroup method.*********');

    let groups = global.groups;

    let index = groups.findIndex(g => {
      //return g.id == global.group_id;
      return g.id == this.state.group_id;
    })

    if (index > -1){
      let group = groups[index];
      group.photos = global.photos;
      //group.photos = this.state.photos;
      //if (uploaded){
      //  group.uploaded = true;
      //}
      groups[index] = group;
      StoreData('groups', groups);
    }
  }

  render() {
    
    console.log('In GroupPhotosScreen render method.');
    //this.setGlobalState();

    //console.log('global photos: ', global.photos);
    let photos = this.state.photos; 
    return (
      <View style={styles.container} >
             
        <View style={{flex:0.9}} >
              <ScrollView >
                  <View style={styles.imageGrid}>
                      {photos.map((p,i) => {
                        
                          return (
                            
                                <TouchableHighlight key={p.uri} onPress={() => {this.props.navigation.push('DisplayPhoto', {
                                  photo: p,
                                  //title: this.getTitle(p),
                                  cover: this.state.cover,
                                  group_id: this.state.group_id,
                                  index: i,
                                  photos: photos,

                                });
                                }} >
                                  <View>
                                      <ImageBackground key={i}
                                                style={ styles.image }
                                                source={{ uri: p.uri }} >            
                                      </ImageBackground>  
                                      {this.renderCover(p.uri)}                                     
                                  </View>                               
                                </TouchableHighlight>  
                         
                          );
                      })}
                      <TouchableHighlight  onPress={() => this.props.navigation.push('SelectPhotos', 
                      { 'add_photos': true, 
                      'group_id': this.state.group_id,
                      'cover': this.state.cover,
                      })}>
                        <Image style={styles.image} source={ require('./images/add.png') } />
                      </TouchableHighlight>
                      
                  </View>                  

              </ScrollView>
              </View>        
       
      </View>
    );
  }
}

export default GroupPhotosScreen;