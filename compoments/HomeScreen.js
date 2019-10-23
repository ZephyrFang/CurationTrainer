import React, { Component } from 'react';
import { Image, ScrollView, Text, Button, StyleSheet, View, TouchableHighlight } from 'react-native';
import styles from './styles';
//import AsyncStorage from '@react-native-community/async-storage';
import { AsyncStorage } from 'react-native';


class HomeScreen extends Component {

  static navigationOptions = {
    title: 'Curation Data Training',
    headerRight: (
      <Button 
      onPress={() => navigation.navigate('Albums')} 
      title='New Group'
      />
    ),
  };

  state = {
    groups: [],
  }

  componentDidMount(){
    console.log('In Home screen componentDidMount');

    let groups = this._retrieveData('groups')
    //let groups = AsyncStorage.getItem('groups');
    if (groups.length){

      groups = JSON.parse(groups);
      console.log('**** Get groups from AsynStorage: ', groups);
      this.setState({groups: groups});
    }
  

  }
   
  _retrieveData = async (id) => {

    console.log('In Home screen retrieveData method.');
    
    try {
      let value = await AsyncStorage.getItem(id);
      if (value !== null){
        //console.log(value);
        return value;
      }
      
    }
    catch (err){
      // Error retrieving data;
    }
  }

  render (){
    //const {navigate} = this.props.navigation;

    if (this.state.groups.length == 0){
      return (
        <View style={styles.container}>
          <TouchableHighlight onPress={() => this.props.navigation.navigate('Albums')}>
            <Image source={require('./images/addPhoto480.png')} 
            style={{width:40, height:40}} />
          </TouchableHighlight>
  
        </View>
  
      );
    }

    return(
      <View style={styles.albums_container}>
          <FlatList style={styles.list} 
                    contentContainerStyle={styles.listContainer}
                    data={this.state.groups} 
                    horizontal={false} 
                    numColumns={2} 
                    keyExtractor={(item) => { return item.id; }}
                    ItemSeparatorComponent={() => { 
                        return ( <View style={styles.separator} /> 
                            )}} 
                    renderItem={(post) => {
                        const item = post.item; 
                        return (
                            <View style={ styles.card }>
                                <View style={ styles.imageContainer }>
                                    <TouchableHighlight onPress={() => this.props.navigation.navigate('GroupPhotos', {
                                        photos: item.photos, })}>
                                      <Image source={{uri:item.cover.uri}} style={ styles.cardImage } />
                                    </TouchableHighlight>
                                </View>
                                <View style={styles.cardContent}>
                                  <Text style={styles.count}>({item.photos.length})</Text>
                                </View>
                           
                            </View>
                        )
                       
                    }}
          />

      </View>
  );
  }
}

export default HomeScreen;