import axiosConn from './client'


export function listRooms() {
    return axiosConn.get("/api/v1/rooms?page=0")
    .then(res => res.data)
    .catch(error => {
        console.error('There was an error to featch romms list!', error);
    });
}


   