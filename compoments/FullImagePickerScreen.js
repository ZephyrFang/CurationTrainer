import * as React from 'react';
import { Button, Image, View } from 'react-native';
import * as ImagePicker from 'react-native-full-image-picker';
import Constants from 'expo-constants';
import * as Permissions from 'expo-permissions';
import styles from './styles';

export default class FullImagePicker extends React.Component {
  state = {
    //image: null,
    photos: [],
  };

  render() {
    let { photos } = this.state;

    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
        <Button
          title="Pick images from camera roll"
          onPress={this._pickImage}
        />
        {photos &&
          <ScrollView >
          <View style={styles.imageGrid}>
              {photos.map((p,i) => {
                
                  return (
                    
                        <TouchableHighlight onPress={() => {this.props.navigation.navigate('DisplayPhoto', {
                          p_uri: p,
                        });
                        }} >
                            <Image key={i}
                            style={styles.image}
                            source={{ uri: p}}
                            />

                        </TouchableHighlight>
                     
    
                 
                  );
              })}
              
          </View>
          

      </ScrollView>
          
        }
      </View>
    );
  }

  componentDidMount() {
    this.getPermissionAsync();
  }

  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const { status } = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }
    }
  }

  _pickImage = async () => {
    ImagePicker.getAlbum({
        maxSize: 9,
        callback: (data) => {
            console.log(data);
               
            this.setState({ photos:  data});
        
    }
    });

    console.log(result);

  };
}