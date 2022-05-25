// import logo from './logo.svg';
// import './App.css';
import { Scheduler } from "@aldabil/react-scheduler";
import { EVENTS } from "./events";
import { CUSTOM_DATA } from "./data";
import React, { Component } from 'react';

import { Link } from 'react-router-dom'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
  Routes
} from 'react-router-dom'
// import Moment from 'react-moment';
// import moment from "moment"
import { parseISO, parse, format } from 'date-fns';
import Select from 'react-select';
import 'bootstrap/dist/css/bootstrap.min.css';
import { listRooms} from "./api/rooms";
import { listUsers, postUser } from "./api/users";
import { postReservation, listReservationByRoomsId } from "./api/reservations";
import { Amplify, Auth, Hub, Logger } from 'aws-amplify';
import { Authenticator } from '@aws-amplify/ui-react';
import { withAuthenticator } from '@aws-amplify/ui-react';
import awsExports from './aws-exports';
import Nav from './components/Nav'
import RoomsComponent from './components/roomsComponent'
import UsersComponent from './components/usersComponent'
import '@aws-amplify/ui-react/styles.css';
import './styles.css'

var roomOptions = [];
// var isRoomSelected = false;
Amplify.configure(awsExports);
const logger = new Logger('Logger', 'INFO');

class App extends React.Component {  

  state = {
    selectedOption: null,
    roomData: null,
    userData: null,
    currentUserData: null,
    loading: false,
    signedIn: false,
    dateQuery: null,
    events:[]
  };

  render() {
    Hub.listen('auth', (data) => {
      switch (data.payload.event) {
        case 'signIn':
          logger.info('user signed in');
          this.getCurrentUser(data);
          break;
        case 'signUp':
          logger.info('user signed up');
          this.registoreSignUpUser(data);
          break;
        case 'signOut':
          logger.info('user signed out');
          this.clearDataStorage();
          break;
        case 'signIn_failure':
          logger.info('user sign in failed');
          break;
        case 'configured':
          logger.info('the Auth module is configured');
          break;
        default:
          logger.error('Something went wrong, look at data object', data);
      }       
    })

    const { selectedOption } = this.state;
    const current = new Date();
    var year = current.getFullYear();
    var day = current.getDate();
    var month = current.getMonth();
    const customStyles = {
      option: (provided, state) => ({
        ...provided,
        borderBottom: '1px dotted pink',
        color: state.isSelected ? 'red' : 'blue',
        padding: 20,
      }),
      control: () => ({
        // none of react-select's styles are passed to <Control />
        width: 500,
      }),
      singleValue: (provided, state) => {
        const opacity = state.isDisabled ? 0.5 : 1;
        const transition = 'opacity 300ms';
    
        return { ...provided, opacity, transition };
      }
    }

    return (
      <Router>
        <div className="App">
          <Nav screenProps={{...this.props}} navigation={this.props.navigation}/>
          <Routes>  
            <Route path="/" exact    
             element= {
               <div>
                  <div className="top">         
                      <h6 style={{padding: 6}}><b>Rooms:</b></h6>
                      <Select
                      styles={customStyles}
                      // menuPlacement="auto"
                      // menuPosition="fixed"
                      value={selectedOption}
                      onChange={this.handleChange}
                      options={roomOptions}/> 
                   
                  </div>
                  <Scheduler
                  view="week"
                  events={this.state.events}
                  selectedDate={new Date(year, month, day)}
                  fields={CUSTOM_DATA}
                  remoteEvents={this.fetchRemote}
                  onConfirm={this.handleConfirm}
                  onDelete={this.handleDelete}/>
              </div>}/>
            <Route exact  path="/rooms" element={<RoomsComponent/>} />
            <Route exact  path="/users" element={<UsersComponent/>} />
          </Routes>
        </div>
      </Router>
    );
  } 

  setCurrentUser = async (data) => {
    if(data){
        try{
           let user = Auth.currentAuthenticatedUser();
         
        } catch(err){
          console.log(err);
        }        
    }
  }

  getCurrentUser = async (data) => {
    if(data){
        try{
          localStorage.removeItem('userData');
          localStorage.setItem('userData', JSON.stringify(data.payload.data));
        } catch(err){
          console.log(err);
        }        
    }
  }

  registoreSignUpUser = async (data) => {
    if(data){
      
      try{
        const newUser = await postUser(data);
      }catch(err){
        console.log("unaple to push registore user data", err)
       
      }   
    }
  }

  clearDataStorage = () => {
    localStorage.removeItem('userData');
    this.setState({ signedIn: false })
  }

  handleChange = (selectedOption) => {
    this.setState({ isRoomSelected: true,  selectedOption});
    localStorage.setItem('roomSelected', JSON.stringify(selectedOption));
    const query =  localStorage.getItem('dateQuery');
    // isRoomSelected = true;
    this.fetchRemote(query, true);
  };

  createReservations = async (event) =>{
    var roomId = null;
    try{
      roomId = this.state.selectedOption.value;
      const newReservation = await postReservation(roomId, event);
    }catch(err){
      console.log("Please select room for the booking", err)
      alert("Please select room for the booking", err)
    }   
  }
  
  fetchRemote = async (query, isRoomSelected) => {
    console.log("Query: ", query);
    localStorage.setItem('dateQuery', query);   
    let reservation = null;
    let events = []
    try{
      if(isRoomSelected && query){
        const roomSelected =  JSON.parse(localStorage.getItem('roomSelected'));
        var roomId = roomSelected.value;
        const start = query.substring(query.indexOf("=") + 1, query.indexOf("&"));
        const end = query.substring(query.lastIndexOf("=") + 1);
        reservation =  await listReservationByRoomsId(roomId, start, end);
        events = reservation.map((r) => {
          return {

            event_id: r.event_id ?? (new Date()).getTime(),
            title: r.title,
            start: parseISO(r.start, "YYYY MM DD HH:MM"),
            end: parseISO(r.end, "YYYY MM DD HH:MM")
          }
        })
        this.setState({events:events})
        return new Promise(resolve => resolve(EVENTS));
       
      }     

    }catch(err){
      console.log("error feaching data", err)
    }
  }; 

  handleConfirm = async (event, action) => {
    console.log(event, action);
    if (action === "edit") {
     
    } else if (action === "create") {
      
      this.createReservations(event)
    }

    return new Promise((res, rej) => {
      setTimeout(() => {
        res({
          ...event,
          event_id: event.event_id || Math.random()
        });
      }, 1000);
    });
  };

  handleDelete = async (deletedId) => {
    return new Promise((res, rej) => {
      setTimeout(() => {
        res(deletedId);
      }, 1000);
    });
  };


  loadRooms = async () =>{    
    const room_details = await listRooms();
    const rooms = room_details.content.map(({reservations, ...rest}) => {
      return rest;
    });
    roomOptions =  rooms.map(rm => ({ value: rm.room_id, label: rm.roomName + "_No_" + rm.roomNumber + '_' + rm.roomLocation + '_' + rm.roomType}));
    this.setState({ roomData: rooms })
  }  

  loadUsers = async () =>{    
    const users_details = await listUsers();
    const users = users_details.content.map(({reservations, ...rest}) => {
      return rest;
    });
    const userOptions =  users.map(sr => ({ id: sr.user_id, text: sr.firstName + " " + sr.lastName}));
    CUSTOM_DATA.options = userOptions;
    this.setState({ userData: users })
  } 

  getLocalUserData = () => {
    let storedData = localStorage.getItem('userData');
    if (storedData) {
      const userData = JSON.parse(storedData);  
      this.setState({ signedIn: true })
      let sub = userData.attributes.sub;
    } 
  };

  async componentDidMount() {
    this.getLocalUserData();
    this.loadRooms();
    this.loadUsers();
    this.setState({ loading: true })
  }
  
  
  componentDidUpdate(prevProps, prevState) {

  }
}

export default withAuthenticator(App);

