import React, { Component } from 'react';
import { Image, ScrollView, Text, Button, StyleSheet, View, TouchableHighlight, FlatList } from 'react-native';
import styles from './styles';

import CameraRoll from "@react-native-community/cameraroll";

import { Permissions } from 'expo-permissions';
import { ImageBrowser } from 'expo-multiple-media-imagepicker';
//import R from 'ramda';

class AlbumsScreen extends Component {

  static navigationOptions = {
    title: 'Albums',
  };
  constructor(props) {
    super(props);

    this.state = {
   
      num: 0,
      selected: [],
      photoArray: [],
      albums: [],

      imageBrowserOpen: false,
      photos: []
    };

    //this.getSelectedImages = this.getSelectedImages.bind(this);
    this.getPhotosFromGallery = this.getPhotosFromGallery.bind(this);
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
        imageBrowserOpen: false,
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



  getPhotosFromGallery(){
    console.log('Get photos button clicked!');

    /*CameraRoll.getPhotos({ 
      first: 20000,
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
        //showPhotoGallery: true,
        photoArray: photoArray,

      })
    })*/

    CameraRoll.getPhotos({
      first: 1000,
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
          //console.log('***Album: ', album_name);
          albums.push(p);
        
        }
      });
      //console.log('*****Albums: ', albums);
      this.setState({ 
        photoArray: r.edges,
        albums: albums,
      });
    })
    .catch((err) => {
       //Error Loading Images
    });
    
 
  }

  /*render(){

    console.log('*** In Albums Screen render method. ****')
    this.getPhotosFromGallery();

      return(
          <View style={styles.albums_container}>
              <FlatList style={styles.list} 
                        contentContainerStyle={styles.listContainer}
                        data={this.state.albums} 
                        horizontal={false} 
                        numColumns={2} 
                        keyExtractor={(item) => { return item.node.timestamp; }}
                        ItemSeparatorComponent={() => { 
                            return ( <View style={styles.separator} /> 
                                )}} 
                        renderItem={(post) => {
                            const item = post.item; 
                            return (
                                <View style={ styles.card }>
                                    <View style={ styles.imageContainer }>
                                        <TouchableHighlight onPress={() => this.props.navigation.navigate('AlbumPhotos', {
                                            group_name: item.node.group_name, })}>
                                          <Image source={{uri:item.node.image.uri}} style={ styles.cardImage } />
                                        </TouchableHighlight>
                                    </View>
                                    <View style={ styles.cardContent }>
                                        <Text style={ styles.title }>{item.node.group_name}</Text>

                                    </View>
                                </View>
                            )
                           
                        }}
              />

          </View>
      );
  }*/

  render () {

    if (this.state.photos.length){
      //console.log('****** **** selected photos: ', this.state.photos);
      const { navigation } = this.props;
      var add_photos = navigation.getParam('add_photos', false);
      
      return (
        this.props.navigation.navigate('GroupPhotos', { 
          photos: this.state.photos,
          add_photos: add_photos,
        })
        
      )
    }
    //if (this.state.imageBrowserOpen) {
      return (
        <ImageBrowser
        max={10} // Maximum number of pickable image. default is None
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


export default AlbumsScreen;