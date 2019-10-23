import React, { Component } from 'react';
import { Image, ScrollView, Text, Button, StyleSheet, View, TouchableHighlight, FlatList } from 'react-native';
import styles from './styles';

import CameraRoll from "@react-native-community/cameraroll";

import { Permissions } from 'expo-permissions';
import { ImageBrowser } from 'expo-multiple-media-imagepicker';
//import R from 'ramda';

class SelectPhotosScreen extends Component {

  static navigationOptions = {
    title: 'Select Photos',
  };
  constructor(props) {
    super(props);

    this.state = {
   
      num: 0,
      selected: [],
      //photoArray: [],
      //albums: [],

      //imageBrowserOpen: false,
      photos: []
    };

  
  }

  async componentDidMount () {
    //Permissions.askAsync(Permissions.CAMERA_ROLL).then(d => console.log(d));

    const permission = await Permissions.getAsyn(Permissions.CAMERA_ROLL);
    if (permission.status !== 'granted') {
      console.log('**** Getting camera roll permission *****');
      const newPermission = await Permissions.askAsync(Permissions.CAMERA_ROLL);
    }
  }

  imageBrowserCallback = (callback) => {
    callback.then((photos) => {
      //console.log(photos)
      this.setState({
        //imageBrowserOpen: false,
        photos: photos,
      })
    }).catch((e) => console.log(e))
  }

  renderImage (item, i) {
    return (
      <Image
        style={{ height: 100, width: 100 }}
        source={{ uri: item.uri }}
        key={i}
      />
    )
  }


  render () {

    if (this.state.photos.length){
      //console.log('****** **** selected photos: ', this.state.photos);
      const { navigation } = this.props;
      const add_photos = navigation.getParam('add_photos', false);
      //var new_group = navigation.getParam('new_group', false);
      const group_id = navigation.getParam('group_id', 0);
      const cover = navigation.getParam('cover', 0);
      
      //return (
        navigation.push('GroupPhotos', { 
          photos: this.state.photos,
          add_photos: add_photos,
          //new_group: new_group,
          group_id: group_id,
          cover: cover,
        })
        
      //)
    }
    //if (this.state.imageBrowserOpen) {
      return (
        <ImageBrowser
        max={30} // Maximum number of pickable image. default is None
        //headerCloseText={'キャンセル'} // Close button text on header. default is 'Close'.
        //headerDoneText={'　　完了'} // Done button text on header. default is 'Done'.
        headerButtonColor={'#E31676'} // Button color on header.
        //headerSelectText={'枚の画像を選択中'} // Word when picking.  default is 'n selected'.
        //mediaSubtype={'screenshot'} // Only iOS, Filter by MediaSubtype. default is display all.
        badgeColor={'#E31676'} // Badge color when picking.
        emptyText={'Loading photos from your camera roll.'} // Empty Text
        callback={this.imageBrowserCallback} // Callback functinon on press Done or Cancel Button. Argument is Asset Infomartion of the picked images wrapping by the Promise.
          />
      )
    //}


 
 
  }
}


export default SelectPhotosScreen;