import { StyleSheet } from 'react-native';

export default styles = StyleSheet.create({
  container: {
    //marginTop: 10,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',    
  },
  authentication_container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
  },
  photo_container: {
    flex: 1,
    backgroundColor: '#F6AE2D',
  },
  content: {
    marginTop: 15,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  text: {
    fontSize: 16,
    alignItems: 'center',
    color: '#fff',
  },
  bold: {
    fontWeight: 'bold',
  },
  info: {
    fontSize: 12,
  },

  imageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    
  },
  image: {
    width: 100,
    height: 100,
    margin: 5,
    
  },

  singleImage: {
    height: 300,
    width: 300,
  },

/*********  Albums **************/

  albums_container:{
    flex:1,
    marginTop:20,
  },
  list: {
    paddingHorizontal: 10,
  },
  listContainer:{
    alignItems:'center'
  },
  separator: {
    marginTop: 10,
  },
  /******** card **************/
  card:{
    marginVertical: 8,
    backgroundColor:"white",
    flexBasis: '45%',
    marginHorizontal: 10,
  },
  cardContent: {
    paddingVertical: 17,
    justifyContent: 'space-between',
    flexDirection: 'row',
  },
  cardImage:{
    flex: 1,
    height: 150,
    width: null,
  },


  imageContainer:{
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.32,
    shadowRadius: 5.46,

    elevation: 9,
  },
  /******** card components **************/
  title:{
    fontSize:18,
    flex:1,
    color:"#778899"
  },
  count:{
    fontSize:18,
    flex:1,
    color:"#B0C4DE"
  },

  countBadge: {
    paddingHorizontal: 8.6,
    paddingVertical: 5,
    borderRadius: 50,
    position: 'absolute',
    right: 3,
    bottom: 3,
    justifyContent: 'center'
  },
  countBadgeText: {
    color: '#fff',
    fontWeight: 'bold',
    alignSelf: 'center',
    padding: 'auto'
  },

  /******** Swiper *******/

    dotStyle: {
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
    },
    activeDotStyle: {
      backgroundColor: 'black',
    },
    wrapper: {},

    slide_container: {
      //marginTop: 10,
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      borderColor: 'white', 
      borderRightWidth: 2, 
      borderLeftWidth: 2     
    },

    slide1: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#5c77a9',
    },
    slide2: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#5ca1a9',
    },
    slide3: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#69a95c',
    },
    swiper_text: {
      color: '#fff',
      fontSize: 30,
      fontWeight: 'bold',
    },
  
});  