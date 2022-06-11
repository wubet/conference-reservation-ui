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
import { listUsers, postUser, getUserByUserName, putUser } from "./api/users";
import { postReservation, listReservationByRoomsId, updateReservation, deleteReservations } from "./api/reservations";
import { Amplify, Auth, Hub, Logger } from 'aws-amplify';
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
          this.setCurrentUser(data);
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

  updateCurrentUser = async (registoredUser) => {
    try{
      const userId = registoredUser.user_id;
      const newUser = await putUser(userId, registoredUser);
    }catch(err){
      console.log("unaple to push registore user data", err)
     
    }   
  }

  setCurrentUser = async (data) => {
    if(data){
        try{
           let user_name = data.payload.data.username;
           let registoredUser = await getUserByUserName(user_name);
           let userId;
           if(registoredUser){
             registoredUser.firstName = data.payload.data.attributes.given_name
             registoredUser.lastName = data.payload.data.attributes.family_name
             registoredUser.emailId = data.payload.data.attributes.email
             registoredUser.phoneNumber = data.payload.data.attributes.phone_number
             registoredUser.reservations = null;
           }
        const user =  await this.updateCurrentUser(registoredUser);

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

  editReservations = async (event) =>{
    var roomId = null;
    try{
      const oldEvent = this.state.events.find(e => e.event_id === event.event_id);
      const reservation_id = oldEvent.reservation_id;
      const updatedReservation = await updateReservation(reservation_id, oldEvent, event);
      this.setState(prevState => {
        const currentEvents = [...prevState.events];
        const index = currentEvents.findIndex(e => e.event_id === event.event_id);  
        currentEvents[index] = event;  
        return { currentEvents };
      });
    }catch(err){
      console.log( err)
    }   
  }

  deleteReservations = async (deletedId) =>{
    try{
      const oldEvent = this.state.events.find(e => e.event_id === deletedId);
      const reservation_id = oldEvent.reservation_id;
      const newReservation = await deleteReservations(reservation_id);
      const oldEvents = [...this.state.events];
      this.setState({ events: oldEvents.filter((event) => event.event_id !== deletedId) });

    }catch(err){
      console.log(err)
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
            event_id: r.event_id,
            reservation_id:r.reservation_id,
            title: r.title,
            status: r.status,
            room_id: r.room.room_id,
            user_id: r.user.user_id,
            start: parseISO(r.start, "YYYY MM DD HH:MM"),
            end: parseISO(r.end, "YYYY MM DD HH:MM")
          }
        })
        this.setState({events:events})
        return new Promise(resolve => resolve(EVENTS));
       
      }     

    }catch(err){
      console.log("error feaching data", err)
      this.setState({ events: undefined });
    }
  }; 

  handleConfirm = async (event, action) => {
    console.log(event, action);
    if (action === "edit") {
      this.editReservations(event)
     
    } else if (action === "create") {
      
      this.createReservations(event)
    }

    return new Promise((res, rej) => {
        res({
          ...event,
          event_id: event.event_id
        });
    });
  };

  handleDelete = async (deletedId) => {
    this.deleteReservations(deletedId)
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

