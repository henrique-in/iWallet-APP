import React,{useContext, useState, useEffect} from 'react';
import {AuthContext} from '../../contexts/auth';
import HistoricoList from '../../components/HistoricoList';
import firebase from '../../service/firebaseConnection';
import { format } from 'date-fns';

import {Background, Container, Nome, Saldo, Title, List, Logo  } from './style';

export default function Home() {
  const [historico , setHistorico] = useState([]);
  const [saldo, setSaldo] = useState(0);

  const {user} = useContext(AuthContext);
  const uid = user && user.uid;

  useEffect(( ) => {
      async function loadList(){
       await firebase.database().ref('users').child(uid).on('value', (snapshot) => {
          setSaldo(snapshot.val().saldo);
        });
        await firebase.database().ref('historico')
        .child(uid)
        .orderByChild('date').equalTo(format(new Date, 'dd/MM/yy'))
        .limitToLast(10).on('value',(snapshot)=>{
          setHistorico([]);
          
          snapshot.forEach((childItem)=>{
            let list = {
              key: childItem.key,
              tipo: childItem.val().tipo,
              valor: childItem.val().valor
            };
            setHistorico(oldArray => [...oldArray, list].reverse());
          })
        })
      }
     loadList(); 
  },[]);

 return (
  <Background>
    
   <Logo source={require('../../assets/logocad.png')}/>
  
    <Container>
        <Nome>{user && user.nome} </Nome>
        <Saldo>R$ {saldo.toFixed(2).replace(/(\d)(?=(\d{3})+(?!\d))/g, '$1.')}</Saldo>
        </Container>
        
        <Title>Ultimas movimentações</Title>

        <List
          showsVerticalScrollIndicator={false}
          data={historico}
          keyExtractor={item => item.key}
          renderItem={ ({ item })=> (<HistoricoList data={item}/>)}

        />
  </Background>
  );
}