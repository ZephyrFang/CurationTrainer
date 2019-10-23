import { AsyncStorage, Alert } from 'react-native'
import * as firebase from 'firebase';
//import Resizer from 'react-image-file-resizer';
//import ImageResizer from 'react-native-image-resizer';
import * as ImageManipulator from 'expo-image-manipulator';


export async function RetrieveData (id){

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

  export async function StoreData (id, item) {
    console.log(' *** In helpers.js storeData method.');
    
    try {
      await AsyncStorage.setItem(
        id, JSON.stringify(item)
      );
      //console.log('data stored on device: ', item);
    }
    catch(err){
      // Error saving data
    }
  }

  export function get_id_from_uri(uri) {
    var id;
    const n1 = uri.search("id=") + 3;
    console.log('n1: ', n1);

    const n2 = uri.search("&ext");
    console.log('n2: ', n2);

    var id = uri.substring(n1, n2);
    //id = id + '?is_cover=' + is_cover;
    console.log('id: ', id);
    return id;
  }

  export async function cloud_delete_photo (uri, group_id, is_cover, email) {
    /* Delete one photo from Cloud (Firebase Storage) */
    
    var id = get_id_from_uri(uri);

    var photo_name = id + '?is_cover=' + is_cover; 

    var ref = firebase.storage().ref().child('CurationTrainer/' + email + '/' + group_id + '/' + photo_name);
    ref.delete().then(() => {
      console.log('photo deleted from cloud.');
    })
    .catch((error) => {
      console.log('Error: ', error);
    })
  }

  export function cloud_delete_group (group_id, photos, cover, email ) {
    console.log('In cloud_delete_group function.');

    
    //let photos = global.photos;
    //const cover = this.state.cover;
    //const email = global.email;
 
    var i;
    for ( i=0; i< photos.length; i++ ) {
      let p = photos[i];
      let is_cover = false;
      if ( p.uri == cover ){
        is_cover = true;
      }
      let result = cloud_delete_photo(p.uri, group_id, is_cover, email);
      if ( !result ) {
        return;
      }
    }
  }

  export async function cloud_upload_photo (photo, group_id, is_cover, email) {
    /* Upload one photo to Cloud (Firebase Storage) */

    console.log('>>>>>In cloud_upload_photo function.<<<<');    
    //alert('In cloud_upload_photo, email is: ' + email);

    /* Resize the photo --> the short side is 1024 and presever aspect ratio */
    let size;
    if (photo.width < photo.length){
      size = { width: 1024};
    }
    else{
      size = { height: 1024};
    }

    ImageManipulator.manipulateAsync(
      photo.uri,
      //[{ resize: {width: 1024}}], // resize to width of 300 and presever aspect ratio
      [{ resize: size }],
      { compress: 0.7, format: 'jpeg'},
      
      ).then((resized_result) => 
      {        
            console.log('Resize photo success!!!!, resized_result.uri: ', resized_result.uri);

            fetch(
                resized_result.uri
                 ).then((fetched_result) => {
                   fetched_result.blob()
                          .then((blobed_result) => {                            
                                  var id = get_id_from_uri(photo.uri);
                                  var photo_name = id + '?is_cover=' + is_cover;
                                  console.log('photo_name: ', photo_name);

                                  var ref = firebase.storage().ref().child('CurationTrainer/' + email + '/' + group_id + '/' + photo_name);
                                  ref.put(blobed_result)
                                          .then((res) => {
                                                //console.log('Success: ', res);
                                                console.log('Success');
                                                })
                                          .catch((error) => {                                       
                                              console.log('Error when upload: ', error)
                                                }) 

                          })
                  });

      }).catch((err) => {
        console.log('err when resize photo. ', err);
      });

      /*

    const resizedPhoto = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: {width: 300}}], // resize to width of 300 and presever aspect ratio
        { compress: 0.7, format: 'jpeg'},
      ).then((result) => {
        console.log('Resize photo success!!!!, result: ', result.uri);

        const response = fetch(result.uri).then((response) => {
          response.blob().then( (blob) => {
            var id = get_id_from_uri(uri);
        var photo_name = id + '?is_cover=' + is_cover;
        console.log('photo_name: ', photo_name);
    
        var ref = firebase.storage().ref().child('CurationTrainer/' + email + '/' + group_id + '/' + photo_name);
        ref.put(blob).then((res) => {
          //console.log('Success: ', res);
          console.log('Success');
          return true;
        })
        .catch((error) => {
          console.log('Error: ', error)
          return false;
        }) 

          })
        });

      }).catch((err) => {
        console.log('err when resize photo. ', err);
      });
      */

      
      //console.log('resizedPhoto.uri: ', resizedPhoto.uri);
    
     /* const response = await fetch(resizedPhoto.uri);
     const blob = await response.blob();
    

    var id = get_id_from_uri(uri);
    var photo_name = id + '?is_cover=' + is_cover;
    console.log('photo_name: ', photo_name);

    var ref = firebase.storage().ref().child('CurationTrainer/' + email + '/' + group_id + '/' + photo_name);
    ref.put(blob).then((res) => {
      //console.log('Success: ', res);
      console.log('Success');
      return true;
    })
    .catch((error) => {
      console.log('Error: ', error)
      return false;
    }) */ 
  }

  export const AsyncAlert = async () => new Promise((resolve) => {
    Alert.alert(
      'info',
      'Message',
      [
        {
          text: 'ok',
          onPress: () => {
            resolve('YES');
          },
        },
      ],
      { cancelable: false },
    );
  });

  export async function ConfirmAlert ( alert_title, alert_text, cancel_text, ok_text) {

    console.log('In helper.ConfirmAlert function');
    var result;
    Alert.alert(
      alert_title,
      alert_text,
      [
        {
        text: cancel_text,
        onPress: () => {
          console.log('Cancel Pressed');
          result = false;          
        },
        style: 'cancel',
        },    
        {
          text: ok_text, 
          onPress: () => {
            console.log('Yes Pressed');
            result = true;             
          },
          style: 'destructive',
        },
      ],
      {cancelable: false},      
    ); 

    console.log('result before return: ', result);
    return result;
  }

  
