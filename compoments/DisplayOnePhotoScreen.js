import React, { Component } from 'react';
import { Image, ScrollView, Text, Button, StyleSheet, View, TouchableHighlight, Alert, Dimensions, BackHandler } from 'react-native';
import * as firebase from 'firebase';
import '@firebase/firestore';

import styles from './styles';
//import {AsyncStorage} from 'react-native';
import Swiper from 'react-native-swiper';
import ImageZoom from 'react-native-image-pan-zoom';

//import * as GLOBAL from './global.js';
//import  GLOBAL from './global.js';
import { RetrieveData, StoreData, ConfirmAlert, cloud_delete_photo, cloud_upload_photo, cloud_delete_group } from './helpers.js'



class DisplayPhotoScreen extends Component{

  static navigationOptions = ({navigation}) => {
    const { params = {}} = navigation.state;

    return {
    title: navigation.getParam('dt', ''),
    headerLeft: (
      <Button onPress={navigation.getParam('backToGroupPhotos')}  title='Group Photos' />
    ),
    headerRight: (
      <View  style={{ flex: 0.1, flexDirection:'row', }}>
          
        <TouchableHighlight style={{width: 50}} onPress={navigation.getParam('deletePhoto')}>
          <Image source={require('./images/delete.png')} style={{width:25, height:25}} />
        </TouchableHighlight>   

        <TouchableHighlight style={{width: 50}} onPress={navigation.getParam('setCover')}>
          <Image  source={params.is_cover? require('./images/gold-medal.png') : require('./images/first.png')} 
            style={{width:30, height:30}} />
        </TouchableHighlight>

        <TouchableHighlight style={{width: 50}} onPress={() => navigation.navigate('Profile')}>
            <Image source={require('./images/user.png')} style={{width:25, height:25}} />
        </TouchableHighlight>

      </View>  

    ),
  };
}

  state = {
    group_id: 0,
    cover_id: 0,
    photos: [],
    photo: null,
    //photo_id: 0,
    is_cover: false,
    p_w: 100,
    p_h: 100,
    max_w: 200,
    max_h: 200,
    //index: 0,
    //p_i: 0,   

  }

  _backToGroupPhotos = () => {
    console.log('In _backToGroupPhotos method, this.state.cover_id: ', this.state.cover_id);

    this.props.navigation.push('GroupPhotos', {
      'group_id': this.state.group_id,
      'cover_id': this.state.cover_id,      
    })
  }

  componentDidMount () {
    this.props.navigation.setParams({
      //is_cover: this.state.is_cover, 
      deletePhoto: this._deletePhoto,
      //uploadPhoto: this.uploadImage, 
      setCover: this._setCover,
      backToGroupPhotos: this._backToGroupPhotos,
      //render_cover_icon: this._render_cover_icon(),
      //photo_id: this.state.photo_id,
      icon_path: './images/star.png',
    });
  }

  componentWillMount () {

    console.log('In compomentWillMount method.'); 
    
    BackHandler.addEventListener('hardwareBackPress', this.onBackPress);

    const { navigation } = this.props;
    let photo = navigation.getParam('photo', []);  
    console.log('>>>>>>>>> In DisplayPhotoScreen, photo from navigation: ', photo);
    const cover_id = navigation.getParam('cover_id', 0);
    const group_id = navigation.getParam('group_id', 0);

    let is_cover = false;
    //if ( photo.uri == cover ){
    if (photo.id == cover_id){
      is_cover = true;
    }

    const index = navigation.getParam('index', 0);

    let photos = navigation.getParam('photos', [])

    this.setState({
      photo: photo,
      //photo_id: photo.id,
      cover_id: cover_id,
      group_id: group_id,
      is_cover: is_cover,
      index: index,
      photos: photos,
    });
    this.props.navigation.setParams({'is_cover': is_cover});

    this.SetPhotoSize(photo);   
   
  }

  componentWillUnmount() {
    console.log('unmount dashboard');
    BackHandler.removeEventListener('hardwareBackPress', this.onBackPress);
  }

  _deletePhoto = () => {

    console.log('****In DisplayOnePhotoScreen deletePhoto method.*****');

    Alert.alert(
      'Alert',
      'Are you sure to delete this photo?',
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
            //let groups = global.groups;
            
            let empty_group = false;
            const group_id = this.state.group_id;
            if (group_id !== 0){
              console.log('group_id: ', group_id);
              let g_index = global.groups.findIndex( g => {
                console.log('g.id: ', g.id);
                return g.id == group_id;
              });
      
              //console.log('%%% g_index :', g_index);
              
              if (g_index > -1){

                let group = groups[g_index];
                //let photos = group.photos;
                
                //const uri = this.state.photo.uri;
                const photo_id = this.state.photo.id;
                //console.log('photos length from global, before delete: ', photos.length);
      
                const p_index = global.photos.findIndex(p => {
                  //console.log('p.uri: ', p.uri);
                  //return p.uri == uri
                  return p.id == photo_id
                });      
            
                if (p_index > -1){                  
                  global.photos.splice(p_index, 1); 
                  console.log('photo deleted from global.photos.');         
                  
                  console.log('photos length from global, after delete: ', photos.length);          
                }  
                group.count = group.count - 1;

                var is_cover = false;
                const user_id = firebase.auth().currentUser.uid;

                if (group.count == 0){
                  /* empty group should be deleted. */
                  groups.splice(g_index, 1);
                  empty_group = true;                   
                  cloud_delete_group(group_id, user_id);
                }
                else {
                  group.photos = photos;
                  //groups[g_index].cover = global.cover;
                  
                  
                  //if ( this.state.cover == uri ){
                  if ( this.state.cover_id == photo_id){
                    /* Cover photo has been deleted, change cover to the first photo */                    

                    //const first_uri = photos[0].uri; 
                    photos.sort((a,b) => (a.addedAt > b.addedAt)? 1: -1);
                    const first_photo_id = photos[0].id;

                    this.setState({'cover_id': first_photo_id });                            
                    group.cover_id = first_photo_id;

                    /* Sync with Cloud */
                    is_cover = true;
                    //cloud_delete_photo(first_uri, group_id, false, email);
                    //cloud_upload_photo(first_photo, group_id, true, email); 
                  }                  
                  groups[g_index] = group;
                  
                  cloud_delete_photo(this.state.photo.id, group_id, user_id, is_cover);
                }       
                
                global.groups = groups;
                //StoreData('groups', groups);

                /* Sync with Cloud */
                //cloud_delete_photo(uri, group_id, is_cover, email); 
                
              }
            }  
      
            if ( empty_group == true ){
              console.log('$$$$$Empty group');
              this.props.navigation.push('Groups'); 
            }
            else{
              console.log('$$$$$ Not Empty group');
              this.props.navigation.push('GroupPhotos', {
                'group_id': this.state.group_id,
                'cover_id': this.state.cover_id,
                

              });
            }   
          },
          style: 'destructive',
        },
      ],
      {cancelable: false},      
    ); 
  
  }
 
  getTitle = (photo) => {
    /* Get photo's datetime as Title */
  
    let exif = photo.exif;
    //console.log('%%%% keys: ', Object.keys(exif));
    const dt = Object.values(exif)[3].DateTime;
    //console.log('**** values: ', Object.entries(exif));
    return dt;
  }

  onBackPress = () => {
    /* function for Swiper */
    
    if( this.props.currentRoute.index === 0) {
      BackHandler.exitApp();
      return false;
    }
    this.props.navigation.goBack(null);
    return true;
  }

  _setCover = () => {
    /* Set current photo as cover photo of its group */
    console.log('****In DisplayOnePhotoScreen setCover method.*****');

    if ( ! this.state.is_cover ){

      const new_cover_id = this.state.photo.id;      
      //const cover_id = this.state.cover_id;
      const group_id = this.state.group_id;

      this.props.navigation.setParams({'is_cover': true});
      this.setState({ 
        'is_cover': true,
        'cover_id': new_cover_id,
       });      

      let local_uri = '';
      if (this.state.photo.local_uri){
        local_uri = this.state.photo.local_uri;
      }
      else{
        if (this.state.photo.uri){
          local_uri = this.state.photo.uri;
        }
      }
      const cover_local_uri = local_uri;
      const user_id = firebase.auth().currentUser.uid;
      /* Update group document in Firestore */
      let group_ref = firebase.firestore().collection('users').doc(user_id).collection('photo_groups').doc(group_id);
      group_ref.update({
        'cover_id': new_cover_id,
        'cover_local_uri': cover_local_uri,
      })   
      .then(function(){
        console.log('setCover group_ref updated successfully.');
      })   
      .catch(function(error){
        console.error('setCover group_ref updated Error: ', error);
      })

      /* Update group in device memory: global.groups */
      let index = global.groups.findIndex(g=> {
        return g.id == group_id;
      })

      console.log('setCover function, group_id: ', group_id, 'index: ', index, 'new cover_id: ', new_cover_id);
      if (index > -1){
        global.groups[index].cover_id = new_cover_id;
        var ref = firebase.storage().ref().child('CurationTrainer/' + user_id + '/' + group_id + '/' + new_cover_id);
        ref.getDownloadURL()
        .then(function(url){
         global.groups[index].cover_uri = url; 

        })
        .catch(function(error){
          console.error('Error in _setCover function: ', error);
        })
        //global.groups[index].cover_local_uri = this.state.photo.local_uri;
      }
    }
  }

  _setCover0 = () => {

    console.log('****In DisplayOnePhotoScreen setCover method.*****');
    //let photo = this.props.navigation.getParam('photo', []);
    //let uri = photo.uri;
    

    if ( ! this.state.is_cover ){

      const uri = this.state.photo.uri;
      const group_id = this.state.group_id;

      /* Update the cover photo on Cloud (Firbase Storage) */
      const old_cover = this.state.cover;
      const email = global.email;
      cloud_delete_photo(old_cover, group_id, true, email);

      var old_cover_photo = global.photos.find((photo) => {
        if ( photo.uri == old_cover){
          return photo;
        }

      });
      cloud_upload_photo(old_cover_photo, group_id, false, email);

      cloud_delete_photo(uri, group_id, false, email);
      cloud_upload_photo(this.state.photo, group_id, true, email);

      //global.cover = uri;
      this.setState({ 
        'is_cover': true,
        'cover': uri,
       });

      this.props.navigation.setParams({'is_cover': true});

      let groups = global.groups;
      
  
      if (group_id !== 0 ){
        let index = groups.findIndex( g => {
          return g.id == group_id;        
        })
  
        if (index > -1){
  
          groups[index].cover = uri;
          global.groups = groups;  

          StoreData('groups', groups);  
        }    
      }   

      /*this.props.navigation.push('DisplayPhoto', {
        photo: photo,
        //dt : this.get_dt(p),
      });*/
    } 
  }

  PhotoSwiped = (e, state) => {
    //var photo = global.photos[state.index];
    var photo = this.state.photos[state.index];
    console.log('In PhotoSwiped function, photo swiped, index: ', state.index);
    console.log('photo.uri: ', photo.uri);
    


    let is_cover = false;
    //if ( photo.uri == this.state.cover ){
    if (photo.id == this.state.cover_id){
      is_cover = true;
    }

    this.setState({
      photo: photo,
      //photo_id: photo.id,
      is_cover: is_cover,
    });
    console.log('is cover?', is_cover);
 
    this.props.navigation.setParams({'is_cover': is_cover})
  }

  SetPhotoSize = (photo) => {

    console.log('(((((((((In SetPhotoSize method.)))))))')

    //GLOBAL.screen1State = this;
    const { width, height } = Dimensions.get('window')
    console.log('window_width: ', width);
    console.log('window_height: ', height);
    const window_ratio = width/height;
    

    //const { navigation} = this.props;
    //const p_uri = navigation.getParam('p_uri', '0');
    //let photo = navigation.getParam('photo', []);
    //console.log('photo data: ', photo);
    //let exif = photo.exif;
    //console.log('%%%% keys: ', Object.keys(exif));
    //const dt = Object.values(exif)[3].DateTime;
    //console.log('**** values: ', Object.values(exif)[3].DateTime);
  
    const p_w = photo.width;
    const p_h = photo.height;
    const photo_ratio = p_w/p_h;

    let w;
    let h;
    if (photo_ratio < window_ratio){
      /* Portrait */
      h = height;
      w = p_w/p_h * height;

      
    }
    else{
      /* Landscape */
      w = width;
      h = p_h/p_w * width;
      
    }

    this.setState({
      p_w: w,
      p_h: h,
      max_w: width,
      max_h: height,
    });  

    console.log('p_w: ', w);
    console.log('p_h: ', h);
    console.log('max_w: ', width);
    console.log('max_h: ', height);    
  } 


  /*
  render(){
    //GLOBAL.screen1State = this;
    console.log('In DisplayPhotoScreen render method.');

    const { navigation} = this.props;

    //let photo = navigation.getParam('photo', []);
    let photo = this.state.photo;
    //console.log('In DisplayOnePhotoScreen render method, photo from state: ', this.state.photo);
    const p_uri = photo.uri;
    
    
    console.log('Photo uri: ', photo.uri);
    //console.log('this.state: ', this.state);

    return(
      <View style={styles.container}>
        
        <Image source={{uri: p_uri}} resizeMode='contain'
        style={{maxHeight: this.state.max_h, maxWidth: this.state.max_w, width: this.state.p_w, height: this.state.p_h}} />     
                      
      </View>
    );
  }
  */

  /*hanleOnMomentumScroolEnd(e, state) {
    alert('handleOnMomentumScroolEnd, p_i: ' + state.index);
    this.setState({
      p_i: state.index,
    });
  }*/

  render () {
    //onsole.log('photos in DisplayOnePhotoScreen render function: ', this.state.photos);
    return (
        <Swiper style={styles.wrapper}                
                dotStyle={styles.dotStyle}
                loop={false}
                activeDotStyle={styles.activeDotStyle}
                index={this.state.index}

                onMomentumScrollEnd={this.PhotoSwiped.bind(this)}
        >
          {this.state.photos.map((photo, i) => {
            return (
              <View key={i} style={styles.container} >

                <ImageZoom cropWidth={this.state.max_w}
                           cropHeight={this.state.max_h -150 }
                           imageWidth={this.state.max_w - 10}
                           imageHeight={this.state.max_h}
                >              
                
                  <Image source={{uri: photo.uri}} resizeMode='contain'
                      style={{
                        maxHeight: this.state.max_h, maxWidth: this.state.max_w - 10, 
                        //width: this.state.p_w,                         
                        //height: this.state.p_h,
                        
                        width: photo.width,
                        height: photo.height,
                        //width: 200,
                        //height: 200,
                      }} 
                  />  
                </ImageZoom>
             </View>
            )
          })}
        </Swiper>

    );
  }
}

export default DisplayPhotoScreen;