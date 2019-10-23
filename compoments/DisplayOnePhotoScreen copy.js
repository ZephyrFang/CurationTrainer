import React, { Component } from 'react';
import { Image, ScrollView, Text, Button, StyleSheet, View, TouchableHighlight, Alert, Dimensions } from 'react-native';
import styles from './styles';
import {AsyncStorage} from 'react-native';

//import * as GLOBAL from './global.js';
//import  GLOBAL from './global.js';
import { RetrieveData, StoreData, ConfirmAlert, cloud_delete_photo, cloud_upload_photo } from './helpers.js'



class DisplayPhotoScreen extends Component{

  static navigationOptions = ({navigation}) => {
    const { params = {}} = navigation.state;
    return {
    title: navigation.getParam('dt', ''),
    headerLeft: (
      <Button onPress={navigation.getParam('backToGroupPhotos')}  title='Group Photos' />
    ),
    headerRight: (
      <View style={{ flex: 0.1, flexDirection:'row', }}>
          
        <TouchableHighlight style={{width: 50}} onPress={navigation.getParam('deletePhoto')}>
          <Image source={require('./images/delete.png')} style={{width:25, height:25}} />
        </TouchableHighlight>   
        <TouchableHighlight style={{width: 50}} onPress={navigation.getParam('setCover')}>
        <Image source={params.is_cover? require('./images/gold-medal.png') : require('./images/first.png')} 
            style={{width:30, height:30}} />
            </TouchableHighlight>

      </View>  

    ),
  };
}

  state = {
    group_id: 0,
    cover: 0,
    //photos: [],
    photo: null,
    is_cover: false,
    p_w: 100,
    p_h: 100,
    max_w: 200,
    max_h: 200,

  }

  _backToGroupPhotos = () => {
    console.log('In _backToGroupPhotos method.');

    this.props.navigation.push('GroupPhotos', {
      'group_id': this.state.group_id,
      'cover': this.state.cover,      
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
    });

  }

  componentWillMount () {

    console.log('In compomentWillMount method.');  

    const { navigation } = this.props;
    let photo = navigation.getParam('photo', []);  
    //console.log('In DisplayPhotoScreen, photo from navigation: ', photo);
    const cover = navigation.getParam('cover', 0);
    const group_id = navigation.getParam('group_id', 0);
    let is_cover = false;
    if ( photo.uri == cover ){
      is_cover = true;
    }

    this.setState({
      photo: photo,
      cover: cover,
      group_id: group_id,
      is_cover: is_cover,
    });
    this.props.navigation.setParams({'is_cover': is_cover});

    this.SetPhotoSize(photo);   
   
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
            let groups = global.groups;
            //let group_id = global.group_id;
            let empty_group = false;
            const group_id = this.state.group_id;
            if (group_id !== 0){
              console.log('group_id: ', group_id);
              let g_index = groups.findIndex( g => {
                console.log('g.id: ', g.id);
                return g.id == group_id;
              });
      
              console.log('%%% g_index :', g_index);
              
              if (g_index > -1){

                let group = groups[g_index];
                let photos = group.photos;

                //let photos = global.photos;
                //const uri = this.props.navigation.getParam('photo', []).uri;
                const uri = this.state.photo.uri;
                console.log('photos length from global, before delete: ', photos.length);
      
                const p_index = photos.findIndex(p => {
                  //console.log('p.uri: ', p.uri);
                  return p.uri == uri
                });      
            
                if (p_index > -1){
                  console.log('photo deleted.');
                  photos.splice(p_index, 1);          
                  
                  console.log('photos length from global, after delete: ', photos.length);          
                }  

                var is_cover = false;
                const email = global.email;

                if (photos.length == 0){
                  /* empty group should be deleted. */
                  groups.splice(g_index, 1);
                  empty_group = true;
                }
                else {
                  group.photos = photos;
                  //groups[g_index].cover = global.cover;
                  
                  
                  if ( this.state.cover == uri ){
                    /* Cover photo has been deleted, change cover to the first photo */                    

                    const first_uri = photos[0].uri;  
                    this.setState({'cover': first_uri });                            
                    group.cover = first_uri;

                    /* Sync with Cloud */
                    is_cover = true;
                    cloud_delete_photo(first_uri, group_id, false, email);
                    cloud_upload_photo(first_uri, group_id, true, email);                                        
                  }
                  
                  groups[g_index] = group;
                }       
                
                global.groups = groups;
                StoreData('groups', groups);

                /* Sync with Cloud */
                cloud_delete_photo(uri, group_id, is_cover, email); 
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
                'cover': this.state.cover,
                

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

  _setCover = () => {

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
      cloud_upload_photo(old_cover, group_id, false, email);
      cloud_delete_photo(uri, group_id, false, email);
      cloud_upload_photo(uri, group_id, true, email);

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

  SetPhotoSize = (photo) => {

    console.log('In SetPhotoSize method.')

    //GLOBAL.screen1State = this;
    const { width, height } = Dimensions.get('window')
    console.log('width: ', width);
    console.log('height: ', height);
    

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

    let w;
    let h;
    if (p_w < p_h){
      w = width;
      h = p_h/p_w * width;
    }
    else{
      h = height;
      w = p_w/p_h * height;
    }

    this.setState({
      p_w: p_w,
      p_h: p_h,
      max_w: width,
      max_h: height,
    });  
  } 


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
}

export default DisplayPhotoScreen;