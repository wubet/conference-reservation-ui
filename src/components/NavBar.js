import React from 'react'
import { Link } from 'react-router-dom'

function NavBar({
  signOut,
  loadMyBookings,
  user
}) {
  return (
    <nav className="nav">
      <ul className="nav__list">
        <li className="nav__item"><Link to="/roomComponent" className="nav__link">Conference Rooms</Link></li>
        <li className="nav__item"><a onClick={signOut} className="nav__link">Logout</a></li>
      </ul>
    </nav>
  )
}

export default NavBar