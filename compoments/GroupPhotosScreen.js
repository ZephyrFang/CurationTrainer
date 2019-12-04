import React, { Component } from 'react';
import { Image, ImageBackground, ScrollView, Text, Button, View, TouchableHighlight, TouchableOpacity, Alert, Platform, Dimensions } from 'react-native';
import styles from './styles';
//import uuid from 'react-native-uuid';
//import AsyncStorage from '@react-native-community/async-storage';
//import {AsyncStorage} from 'react-native';

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
    cover_id: 0,
    group_id: 0,
    //uploaded: false,
  }

  cloud_add_photos = (group_id, photos, email) => {
    /* Add new photos to existing group */

    const db = firebase.firestore();
    var group_ref = db.collection('users').doc(email).collection('photo_groups').doc(group_id);
    group_ref.get()
    .then(function(doc){
      if(doc.exists){
        let count = doc.data().count;
        count = count + photos.length;
        group_ref.update({ count:count }); 
      }
    })
    .catch(function(error){
      console.log('Error in clound_add_photos: ', error);
    })

    var i;
    let self = this;
    for (i=0; i < photos.length; i++){
      photo = photos[i];
      var new_photo_ref = group_ref.collection('photos').doc();
      

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
        console.log('Error adding photo: ', error);
      })
      cloud_upload_photo(photo, group_id, new_photo_ref.id, email, global.target_size);

    }
  }
 
  fetchData = () => {
    console.log('In GroupPhotosScreen fetchData method.')

    const { navigation } = this.props;

    var photos = navigation.getParam('photos', []);
    //console.log('photos.length from navigation: ', photos.length);
    //console.log('photos: ', photos);
     const cover_id = navigation.getParam('cover_id', 0);
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
       /* Adding new photos to an existing group */
      
       this.cloud_add_photos(group_id, photos, global.email);
       console.log('Adding(pushing) new photos to existing group');
       global.photos.push(...photos);
       this.setState({'photos': global.photos});
       let index = global.groups.findIndex(g=>{
         return g.id == group_id;
       })
       if (index>-1){
         let group = global.groups[index];
         group.count = global.photos.length;
       }

     }
     else{
       global.photos = [];
     
       if (group_id){
         /* Showing an existing group */
         console.log('***** In GroupPhotosScreen fetchData function, group_id is true, invoke fatch_photos_from_cloud function.******');
        this.fetch_photos_from_cloud(global.email, group_id);
       }     
       else{
         /* Creating a new group */
        console.log('***** In GroupPhotosScreen fetchData function, group_id is false, invoke savNewGroup function.*******');
         this.saveNewGroup(photos);         
       }  
     }

     if (group_id && cover_id ){        
       
         this.setState({'cover_id': cover_id});       
     }
  }

  fetch_photos_from_cloud = async (email, group_id) => {
    /* Fetching photos of a given group from Firebase */

    console.log('**** In GroupPhotosScreen fetch_photos_from_cloud function *****');
    var storage = firebase.storage();    
    const db = firebase.firestore();
    let self = this;
    //let photos = [];

    /* Fetching photo documents from FireStore */
    db.collection('users').doc(email).collection('photo_groups').doc(group_id).collection('photos').orderBy('addedAt').onSnapshot(function(querySnapshot){
      console.log('...onSnapshopt of fetch_photos_from_cloud...');
        querySnapshot.forEach(function(doc){
            //console.log(doc.id, ' => ', doc.data());  
            console.log('...forEach snapshot of fetch_photos_from_cloud...'); 
            if (doc.data().uploaded){
              /* if the photo has uploaded to Fire Storage, assembly photo uri with url from Fire Storage */
              var ref = storage.ref().child('CurationTrainer/' + email + '/' + group_id + '/' + doc.id);     
              ref.getDownloadURL()
              .then(function(url){
                  console.log('photo_url', url);
                  self._set_photos_state(doc.id, url, doc.data().width, doc.data().height, self); 
                  
              })
              .catch(function(error){
                console.error('Error in fetch_photos_from_cloud function: ', error);
              })
            } 
            else{
              /* if the photo has not yet uploaded to Fire Storage, assembly photo uri with local uri ( assume the photo is in current device ) */
              self._set_photos_state(doc.id, doc.data().local_uri, doc.data().width, doc.data().height, self);            
            }           
        })      
    })    
  }

  _set_photos_state = (id, uri, width, height, self) => {
    /* Check whether the photo is already in global.photos. If not, add it in and setState. */
    console.log('****** In GroupPhotosScreen _set_photos_state function. ****** ');

    let index = global.photos.findIndex(p=>{
      return p.id == id;
    })
    if (index == -1) {
      let photo = {
        id: id,
        uri: uri,
        width: width,
        height: height,
      }
      global.photos.unshift(photo);
      //photos.unshift(photo);
      self.setState({photos: global.photos});
      //global.photos = photos;
    }
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
            //StoreData('groups', groups);
            cloud_delete_group( this.state.group_id, global.email );
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


  renderCover = (id) => {
    //if ( global.cover == uri){
    //if ( uri == this.state.cover ){
    if (id == this.state.cover_id ){
      return (
      <View style={{ ...styles.countBadge, backgroundColor: 'none' }}>
      <Image source={require('./images/gold-medal.png')} 
            style={{width:30, height:30}} />
    </View>  
      )   
    }    
  }

  saveNewGroup = (photos) => {
    /* Save new photo group to Firebase ( Firestore and Storage ) and Set state and global values. */
    console.log('****** In saveNewGroup function ******');

    const db = firebase.firestore();

    /* Add new group to firestore */
    var new_photo_group_ref = db.collection('users').doc(global.email).collection('photo_groups').doc();    
    var cover_ref = new_photo_group_ref.collection('photos').doc();

    const group_id = new_photo_group_ref.id;
    const cover_id = cover_ref.id;
    const group_timestamp = firebase.firestore.FieldValue.serverTimestamp();
    let self = this;

    new_photo_group_ref.set({
      user: global.email,
      cover_id: cover_id,
      cover_local_uri: photos[0].uri,
      count: photos.length,     
      addedAt: group_timestamp,  

    })                     
    .then(function(){        
       

    })
    .catch(function(error){
        console.error('Error adding group: ', error);
    });   

    /* Add photos documents to Firestore and upload photos to Firebase Storage */
    var i;
    var photo_id;
    var photo_ref;
    for (i=0; i<photos.length; i++){
      let p = photos[i];
      const local_uri = photos[i].uri;
      if ( i == 0){        
        photo_ref = cover_ref;
      }
      else{
        photo_ref = new_photo_group_ref.collection('photos').doc();        
      }
      
      photo_id = photo_ref.id;
      p.id = photo_id;

      cloud_upload_photo(p, group_id, photo_id, email, global.target_size);
      /* Have to put this out of .then(). Otherwise some photos will not uploaded to storage. */

      let photo_size = get_photo_size(p, global.target_size);
      const timestamp = firebase.firestore.FieldValue.serverTimestamp();
      
        console.log('photo uploaded. i: ', i, ' photo_id: ', photo_id);
        photo_ref.set({
          user: email,
          group_id: group_id,
          width: photo_size[0],
          height: photo_size[1],
          addedAt: timestamp,
          local_uri: local_uri,
          uploaded: false,
        }) 
        .then(function(){
          //cloud_upload_photo(p, group_id, photo_id, email, global.target_size);
        })
        .catch(function(error){
          console.log('Error adding photo: ', error);
        })        
    
      } 

       /* setState and set global.groups and global.photos. photos use local photos for better performance.  */

        //console.log('New group written with ID: ', group_id);

        self.setState({
          group_id: group_id,
          //cover: photos[0].uri,
          cover_id: photos[0].id,
          photos: photos
        });

        let group = {
          id: group_id,
          //cover: photos[0].uri,
          cover_id: photos[0].id,
          cover_uri: photos[0].uri,
          count: photos.length,          
        }
        //global.groups.unshift(group);
        global.groups.splice(1, 0, group);
        global.photos = photos;

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
    
    console.log('*** In GroupPhotosScreen render method.*** ');
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
                                  cover_id: this.state.cover_id,
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
                                      {this.renderCover(p.id)}                                     
                                  </View>                               
                                </TouchableHighlight>  
                         
                          );
                      })}
                      <TouchableHighlight  onPress={() => this.props.navigation.push('SelectPhotos', 
                      { 'add_photos': true, 
                      'group_id': this.state.group_id,
                      'cover_id': this.state.cover_id,
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