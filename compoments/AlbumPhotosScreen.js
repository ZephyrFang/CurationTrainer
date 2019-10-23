import React, { Component } from 'react';
import { Image, ImageBackground, ScrollView, Text, Button, View, TouchableHighlight, FlatList } from 'react-native';
import CameraRoll from "@react-native-community/cameraroll";
import styles from './styles';
import PhotoTile from './PhotoTile';


class AlbumPhotosScreen extends Component{

  static navigationOptions = ({navigation}) => {
    return {
      title: navigation.getParam('group_name', 'Album Photos'),
      headerRight: (
        <Button 
        onPress={() => navigation.navigate('GroupPhotos', { 
          photos: navigation.getParam('selected_photos'),
        })
       
        } 
        title='Done'
        />
      ),
    };

  }
  
  state = { 
    photos: [],
    selected: [],
    after: null,
    hasNextPage: true,
    badgeColor: '#007aff',
  }

  componentDidMount() {

    console.log('*** In CompomentDidMount method. ***')
    this.getPhotos();
    
  }
    
  selectImage = (index) => {
    let newSelected = Array.from(this.state.selected)

    if (newSelected.indexOf(index) === -1) {
      newSelected.push(index)
    } else {
      const deleteIndex = newSelected.indexOf(index)
      newSelected.splice(deleteIndex, 1)
    }

    if (newSelected.length > this.props.max) return
    if (newSelected.length === 0) newSelected = []

    console.log('******** selected photos: ', newSelected);

    this.setState({ selected: newSelected })
    this.props.navigation.setParams({ selected_photos: this.state.selected });
  }

  getPhotos = () => {
    const { navigation} = this.props;
    const group_name = navigation.getParam('group_name', 'nothing');
    console.log('In AlbumPhotosScreen getPhotos method.');
    console.log('Group name: ', group_name);
    //var photos = [];
    
    CameraRoll.getPhotos({
        first: 20,
        assetType: 'Photos',
        groupName: group_name,
        groupTypes: 'Album',

        
      })
      .then(r => {
        this.setState({ photos: r.edges });
        //photos = r.edges;
        console.log('Album photos: ', this.state.photos);
      })
      .catch((err) => {
         //Error Loading Images
      });
  }

  renderImageTile = ({ item, index }) => {
    const selected = this.state.selected.indexOf(index) !== -1
    const selectedItemCount = this.state.selected.indexOf(index) + 1

    return (
      <PhotoTile
        item={item}
        selectedItemCount={selectedItemCount}
        index={index}
        camera={false}
        selected={selected}
        selectImage={this.selectImage}
        badgeColor={this.state.badgeColor}
      />
    )
  }

  renderPhotoTile = ({ item }) => {
    const selected = this.state.selected.indexOf(item.node.image.uri) !== -1
    const selectedItemCount = this.state.selected.indexOf(item.node.image.uri) + 1

    return (
      <PhotoTile
        item={item}
        selectedItemCount={selectedItemCount}
        //index={index}
        camera={false}
        selected={selected}
        selectImage={this.selectImage}
        badgeColor={this.state.badgeColor}
      />
    )
  }

  renderImages = () => {
    return (
      <FlatList
        contentContainerStyle={{ flexGrow: 1 }}
        data={this.state.photos}
        numColumns={3}
        //renderItem={this.renderImageTile}
        renderItem={this.renderPhotoTile}
        keyExtractor={(_, index) => index}
        onEndReached={() => { this.getPhotos() }}
        onEndReachedThreshold={0.5}
        //ListEmptyComponent={this.renderEmpty}
        //initialNumToRender={24}
        //getItemLayout={this.getItemLayout}
      />
    )
  }

  render(){
 

    return(
      <View style={styles.album_container}>
      
      {this.renderImages()}
    </View>

    );
  }
}

export default AlbumPhotosScreen;