import axiosConn from './client'

export function listReservations() {
  return axiosConn.get('/api/v1/reservations?page=0')
  .then(res => res.data)
  .catch(error => {
    console.error('There was an error to featch reservations list!', error);
});
}

  export function postReservation(roomId, event) {
    const body = {
        "event_id": (new Date()).getTime(),
        "title": event.title,
        "description": event.Description,
        "start": event.start,
        "end": event.end,
        "status": "active",
        "room":{
            "room_id": Number(roomId)
        },
        "user":{
            "user_id": Number(event.user_id)
        }
      };

    return axiosConn.post('/api/v1/reservations', body)
    .then(res => res.data)
    .catch(error => {
        console.error('There was an error to post reservation data!', error);
    });
  }


  export function listReservationByRoomsId(roomId, start, end) {
    return axiosConn.get(`/api/v1/reservations/booked/room/${roomId}?page=0&startDate=${start}&endDate=${end}`)
    .then(res => res.data.content)
    .catch(error => {
        console.error('There was an error to featch room reservations data!', error);
    });    
  }

  export function updateReservation(reservation_id, oldEvent, newEvent) {
    const body = {
        "event_id": newEvent.event_id,
        "title": newEvent.title,
        "description": newEvent.Description,
        "start": newEvent.start,
        "end": newEvent.end,
        "status":oldEvent.status,
        "room":{
            "room_id": Number(oldEvent.room_id)
        },
        "user":{
            "user_id": Number(newEvent.user_id)
        }
      };

    return axiosConn.put(`/api/v1/reservations/${reservation_id}`, body)
    .then(res => res.data)
    .catch(error => {
        console.error('There was an error to update reservation data!', error);
    });
  }

  export function deleteReservations(reservationId) {
    return axiosConn.delete(`/api/v1/reservations/${reservationId}`)
    .then(res => res.data)
    .catch(error => {
      console.error('There was an error to delete reservation data', error);
  });
  }

   