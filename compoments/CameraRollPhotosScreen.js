import React, { Component } from 'react';
import { Image, ScrollView, Text, Button, StyleSheet, View, TouchableHighlight, FlatList } from 'react-native';
import styles from './styles';
//import CameraRollPicker from 'react-native-camera-roll-picker';
//import { ImageBrowser } from 'expo-multiple-media-imagepicker';
import CameraRoll from "@react-native-community/cameraroll";
import R from 'ramda';

class CameraRollPhotosScreen extends Component {

  static navigationOptions = {
    title: 'Albums',
  };
  constructor(props) {
    super(props);

    this.state = {
      //howPhotoGallery: false,
      num: 0,
      selected: [],
      photoArray: [],
      albums: [],
    };

    this.getSelectedImages = this.getSelectedImages.bind(this);
    this.getPhotosFromGallery = this.getPhotosFromGallery.bind(this);
  }

  getPhotosFromGallery(){
    console.log('Get photos button clicked!');

    /*CameraRoll.getPhotos({ 
      first: 2000,
      assetType: 'Photos',
    })
    .then(res => {
      const groupNamesAr = R.map(
        (item) => { return item.node.group_name;}
      )(res.edges)
      let photoArray = res.edges;
      groupNames = R.countBy((i)=>i)(groupNamesAr);
      console.log('Album names: ', groupNames);
      this.setState({
        showPhotoGallery: true,
        photoArray: photoArray,

      })
    })*/

    CameraRoll.getPhotos({
      first: 2000,
      assetType: 'Photos',
      groupTypes: 'Album',
      //groupName: 'Favourites',
    })
    .then(r => {
      var photos = r.edges;
      //var result = photos.filter(p => () p.node.group_name);

      var album_name = '';
      var albums = [];
      photos.forEach(function (p) {
        if (album_name != p.node.group_name){
          album_name = p.node.group_name;
          console.log('***Album: ', album_name);
          albums.push(p);
        
        }
      });
      console.log('*****Albums: ', albums);
      this.setState({ 
        photoArray: r.edges,
        albums: albums,
      });
    })
    .catch((err) => {
       //Error Loading Images
    });
    
 
  }

  getSelectedImages(images, current) {
    var num = images.length;


    this.setState({
      num: num,
      selected: images,
    });

    console.log(current);
    console.log(this.state.selected);
  }

  _onPressButton = () => {
    //const {navigate} = this.props.navigation;
    console.log('OK button clicked. ');
    console.log(this.state.selected);
    //this.props.navigation.navigator('SelectedPhotos', {photos: this.state.selected});
 
  }
  render (){
    
      return (
     
        <View style={styles.photo_container}>
          <Button title='Get photos' onPress={() => this.getPhotosFromGallery()}>

          </Button>
          <ScrollView>
       {this.state.albums.map((p, i) => {
         console.log('group_name', p.node.group_name);
       return (
         <View>
         <Button title={p.node.group_name}>

         </Button>
         <TouchableHighlight onPress={() => this.props.navigation.navigate('AlbumPhotos', {
           group_name: p.node.group_name,
         })}>
          <Image
           key={i}
           style={{
             width: 100,
             height: 100,
             margin: 10,
           }}
           source={{ uri: p.node.image.uri }}
          />
         </TouchableHighlight>
        
</View>
         
       );
     })}
     </ScrollView>
        </View>
      )
    

  }
}


export default CameraRollPhotosScreen;