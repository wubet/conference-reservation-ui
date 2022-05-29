import axios from 'axios'
// import { rememberToken, getValidToken } from './token'


const baseURL = process.env.REACT_APP_API_BASE_URL_LOCAL

// const axiosConn  = axios.create()

// if (process.env.NODE_ENV === 'development') {
//   axiosConn.defaults.baseURL = process.env.REACT_APP_API_BASE_URL_LOCAL;            
// } else {
//   if(window.location.hostname === process.env.REACT_APP_DOMAIN_PROD) {
//     axiosConn.defaults.baseURL = process.env.REACT_APP_API_BASE_URL_DEV;
//   } else {
//     axiosConn.defaults.baseURL = process.env.REACT_APP_API_BASE_URL_TEST;
//   }          
// }

let headers={
  "Content-Type": "application/json"
}
if(localStorage.token){
  //headers.Authorization = `Bearer ${localStorage.token}`
}


// Create an axios instance
const axiosConn = axios.create({
  baseURL:'https://conferencereservation.us-west-2.elasticbeanstalk.com/',
  withCredentials: false,
  headers
})

// export function setToken(token) {
//   // saves token to local storage
//   rememberToken(token)
//   if (token) {
//     // Setting the Authorisation header for all future GET requests
//     axiosConn.defaults.headers.common['Authorization'] = `Bearer ${token}`
//   } else {
//     delete axiosConn.defaults.headers.common['Authorization']
//   }
// }

// Validates token, and removes it if it's invalid
// setToken(getValidToken())

export default axiosConn
