import React, {useEffect, useState, ChangeEvent, FormEvent} from 'react';
import { Map, TileLayer, Marker} from 'react-leaflet';
import './styles.css';
import logo from '../../assets/logo.svg';
import {Link, useHistory} from 'react-router-dom';
import {FiArrowLeft} from 'react-icons/fi';
import axios from 'axios';
import api from '../../services/api';
import { LeafletMouseEvent } from 'leaflet';

interface Item{
    id: number,
    title: string,
    image_url: string
}
interface IBGE_UF{
    sigla: string
}
interface IBGE_CITY{
    nome: string
}

const CreatePoint = () =>{
    const [items, setItems] = useState<Item[]>([]);

    const [ufs, setUfs] = useState<string[]>([]);
    const [cities, setCities] = useState<string[]>([]);

    const [selectedUf, setSelectedUf] = useState('0');
    const [selectedCity, setSelectedCity] = useState('0');
    const [selectedPosition, setSelectedPosition] = useState<[number,number]>([0,0]);
    const [selectedItems, setSelectedItems] = useState<number[]>([]);

    const [inicialPosition, setInicialPosition] = useState<[number,number]>([0,0]);

    const [formData, setFormData] = useState({
        name:'',
        email:'',
        whatsapp:''
    });

    function handleSelectedUf(event: ChangeEvent<HTMLSelectElement>){
        const uf = (event.target.value);
        setSelectedUf(uf);
    }
    function handleSelectedCity(event: ChangeEvent<HTMLSelectElement>){
        const city = (event.target.value);
        setSelectedCity(city);
    }
    function handleMapClick(event: LeafletMouseEvent){
        const {lat, lng} = event.latlng;
        setSelectedPosition([lat,lng]);
    }
    function handleInputChange(event: ChangeEvent<HTMLInputElement>){
        const {name, value} = event.target;
        setFormData({...formData, [name]:value})
    }
    function handleSelectItem(id: number){
        const alreadySelected = selectedItems.findIndex(item => item === id);

        if(alreadySelected >= 0 ){
            const filteredItems = selectedItems.filter(item => item !== id);
            setSelectedItems(filteredItems);
            console.log(selectedItems);
        }else{
            setSelectedItems([...selectedItems, id]);
        }
    }
    const history = useHistory();
    async function handleSubmit(event: FormEvent){
        event.preventDefault();

        const {name, email, whatsapp} = formData;
        const uf = selectedUf;
        const city = selectedCity;
        const [latitude, longitude] = selectedPosition;
        const items = selectedItems;

        const data = {
            name,
            email,
            whatsapp,
            uf,
            city,
            latitude,
            longitude,
            items
        };

        await api.post('/points', data);
        alert('Ponto cadastrado com sucesso!');
        history.push('/');
    }
    useEffect(()=>{
        navigator.geolocation.getCurrentPosition(position =>{
            const {latitude, longitude} = position.coords;
            setInicialPosition([latitude, longitude]);   
        })
    }, []);

    useEffect(()=>{
        if(selectedUf === '0')
        return;

        axios.get<IBGE_CITY[]>(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios`)
        .then(response=>{
            const cityNames = response.data.map(city => city.nome);
            setCities(cityNames);
        })
    }, [selectedUf]);

    useEffect(()=>{
        api.get('items').then(response=>{
            setItems(response.data);
        })
    }, []);

    useEffect(()=>{
        axios.get<IBGE_UF[]>('https://servicodados.ibge.gov.br/api/v1/localidades/estados')
        .then(response=>{
            const ufInitials = response.data.map(uf => uf.sigla);
            setUfs(ufInitials);
        })
    }, []);

    return (
        <div id="page-create-point">
            <div className="content">
                <header>
                    <img src={logo} alt="Ecoleta"/>
                    <Link to="/"><FiArrowLeft/>Voltar para home</Link>
                </header>
                <form onSubmit={handleSubmit}>
                    <h1>Cadastro do<br/> ponto de coleta</h1>
                    <fieldset>
                        <legend>
                            <h2>Dados</h2>
                        </legend>

                        <div className="field">
                            <label htmlFor="name">Nome da entidade</label>
                            <input type="text" name="name" id="name" onChange={handleInputChange}/>
                        </div>

                        <div className="field-group">
                            <div className="field">
                                <label htmlFor="email">E-mail</label>
                                <input type="email" name="email" id="email" onChange={handleInputChange}/>
                            </div>
                            <div className="field">
                                <label htmlFor="whatsapp">WhatsApp</label>
                                <input type="text" name="whatsapp" id="whatsapp" onChange={handleInputChange}/>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>
                            <h2>Endereço</h2>
                            <span>Selecione o endereço no mapa</span>
                        </legend>

                        <Map center={inicialPosition} zoom={15} onclick={handleMapClick}>
                            <TileLayer
                                attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <Marker position={selectedPosition}/>
                        </Map>

                        <div className="field-group">
                            <div className="field">
                                <label htmlFor="uf">Estado</label>
                                <select name="uf" id="uf" value={selectedUf} onChange={handleSelectedUf}>
                                    <option value='0'>Selecione um Estado</option>
                                    {ufs.map(uf => (
                                        <option key={uf} value={uf}>{uf}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="field">
                                <label htmlFor="city">Cidade</label>
                                <select name="city" id="city" value={selectedCity} onChange={handleSelectedCity}>
                                    <option value="0">Selecione uma Cidade</option>
                                    {cities.map(city => (
                                        <option key={city} value={city}>{city}</option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </fieldset>
                    <fieldset>
                        <legend>
                            <h2>Ítens de Coleta</h2>
                            <span>Selecione um ou mais ítens abaixo</span>
                        </legend>

                        <ul className="items-grid">
                            {items.map(item => (
                                <li 
                                    key={item.id} 
                                    onClick={() => handleSelectItem(item.id)}
                                    className={selectedItems.includes(item.id) ? 'selected' : ''}
                                    >
                                        <img src={item.image_url} alt={item.title}/>
                                        <span>{item.title}</span>
                                </li>
                            ))}
                        </ul>
                    </fieldset>

                    <button type="submit">Cadastrar ponto de coleta</button>
                </form>
            </div>
        </div>
    );
}
export default CreatePoint;