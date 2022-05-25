import React from "react";
import { Link } from "react-router-dom";
import { Auth } from 'aws-amplify';

export default function Nav({signOut}){
    signOut = () => {
        Auth.signOut()
        .then(data => console.log(data))
        .catch(err => console.log(err));
      }
  return(
        <div className="navbar">
          <div className="logo">Conference Room Reservation</div>
           <ul className="nav-links">
              <Link to="/">Booking</Link>
              <Link to="/rooms">Rooms</Link>
              <Link to="/users">Users</Link>
           </ul>
           <div className="nav__item" style={{flexDirection: "row", justifyContent: "flex-end", cursor: "pointer" }}><a style={{color:"white"}}onClick={signOut} className="nav__link">SignOut</a></div>
        </div>
        
  );

}