import React, { useEffect, useState } from 'react';
import { View, ImageBackground, Image, StyleSheet, Text, Alert } from 'react-native';
import { RectButton } from 'react-native-gesture-handler';
import { Feather as Icon } from '@expo/vector-icons'
import { useNavigation } from '@react-navigation/native';
import RNPickerSelect from 'react-native-picker-select';
import axios from   'axios';

interface IBGE_UF{
  sigla: string
}
interface IBGE_CITY{
  nome: string
}
interface Item{
  label: string,
  value: string
}

const Home = () =>{
    const navigation = useNavigation();
    
    const placeholderUf = {
      label: 'Selecione um Estado...',
      value: null,
      color: '#6C6C80',
    };
    const placeholderCity = {
      label: 'Selecione uma Cidade...',
      value: null,
      color: '#6C6C80',
    };

    const [selectedUf, setSelectedUf] = useState(placeholderUf.label);
    const [selectedCity, setSelectedCity] = useState(placeholderCity.label);

    const [ufsItem, setUfsItem] = useState<Item[]>([]);
    const [citiesItem, setCitiesItem] = useState<Item[]>([]);


    function handleNavigateToPoints(){
        navigation.navigate('Points', { uf: selectedUf, city: selectedCity });
    }

    useEffect(()=>{
      axios.get<IBGE_UF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
      .then(response=>{
          const ufInitials = response.data.map(uf => uf.sigla);
          const ufsItemAux: Item[] = [];

          ufInitials.map(uf=>{
              ufsItemAux.push({ label: uf, value: uf })
          });
          setUfsItem(ufsItemAux);
      })
    }, []);
    useEffect(()=>{
      if(selectedUf === placeholderUf.label)
      return;

      axios.get<IBGE_CITY[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
      .then(response=>{
          const cityNames = response.data.map(city => city.nome);
          const citiesItemAux: Item[] = [];

          cityNames.map(uf=>{
            citiesItemAux.push({ label: uf, value: uf })
          });
          setCitiesItem(citiesItemAux);
      })
    }, [selectedUf]);

    return (
        <ImageBackground 
            source={require('../../assets/home-background.png')} 
            style={styles.container}
            imageStyle={{width:274, height:368}}
            >
                <View style={styles.main}>
                    <Image source={require('../../assets/logo.png')} />
                    <Text style={styles.title}>Seu marketplace de coleta de resíduos.</Text>
                    <Text style={styles.description}>Ajudamos pessoas a encontrarem pontos de coleta de forma eficiente..</Text>
                </View>

                <View style={styles.footer}>
                    <View>
                        <RNPickerSelect
                          placeholder={placeholderUf}
                          onValueChange={(value)=>{setSelectedUf(value)}}
                          items={ufsItem}
                        />
                        <RNPickerSelect
                          placeholder={placeholderCity}
                          onValueChange={(value)=>{setSelectedCity(value)}}
                          items={citiesItem}
                        /> 
                    </View>
                    <RectButton style={styles.button} onPress={handleNavigateToPoints}>
                        <View style={styles.buttonIcon}>
                            <Text>
                                <Icon name="arrow-right" color="#FFF" size={24}/>
                            </Text>
                        </View>
                        <Text style={styles.buttonText}>Entrar</Text>
                    </RectButton>
                </View>
        </ImageBackground>
    );
}

const styles = StyleSheet.create({
    container: {
      flex: 1,
      padding: 32,
    },
  
    main: {
      flex: 1,
      justifyContent: 'center',
    },
  
    title: {
      color: '#322153',
      fontSize: 32,
      fontFamily: 'Ubuntu_700Bold',
      maxWidth: 260,
      marginTop: 64,
    },
  
    description: {
      color: '#6C6C80',
      fontSize: 16,
      marginTop: 16,
      fontFamily: 'Roboto_400Regular',
      maxWidth: 260,
      lineHeight: 24,
    },
  
    footer: {},
  
    select: {},
  
    input: {
      height: 60,
      backgroundColor: '#FFF',
      borderRadius: 10,
      marginBottom: 8,
      paddingHorizontal: 24,
      fontSize: 16,
    },
  
    button: {
      backgroundColor: '#34CB79',
      height: 60,
      flexDirection: 'row',
      borderRadius: 10,
      overflow: 'hidden',
      alignItems: 'center',
      marginTop: 8,
    },
  
    buttonIcon: {
      height: 60,
      width: 60,
      backgroundColor: 'rgba(0, 0, 0, 0.1)',
      justifyContent: 'center',
      alignItems: 'center'
    },
  
    buttonText: {
      flex: 1,
      justifyContent: 'center',
      textAlign: 'center',
      color: '#FFF',
      fontFamily: 'Roboto_500Medium',
      fontSize: 16,
    }
  });

export default Home;