import axiosConn from './client'

export function listUsers() {
  return axiosConn.get('/api/v1/users?page=0').then(res => res.data)
}

export function postUser(data) {
  const body = {
      "firstName": ".",
      "lastName": ".",
      "userName": data.payload.data.user.username,
      "emailId": data.payload.data.codeDeliveryDetails.Destination,
      "phoneNumber": ".",
      "updateDateTime": new Date(),
      "createDateTime": new Date(),    
    };

  return axiosConn.post('/api/v1/users', body)
  .then(res => res.data)
  .catch(error => {
      console.error('There was an error to post user data!', error);
  });
}

export function getUserByUserName(username) {
  return axiosConn.get(`/api/v1/users/check/${username}`).then(res => res.data)
}

export function putUser(id, body) {
 
  return axiosConn.put(`/api/v1/users/${id}`, body)
  .then(res => res.data)
  .catch(error => {
      console.error('There was an error to put user data!', error);
  });
}