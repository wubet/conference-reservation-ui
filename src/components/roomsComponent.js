import MaterialTable from "material-table";
import AddBox from "@material-ui/icons/AddBox";
import ArrowDownward from "@material-ui/icons/ArrowDownward";
import tableIcons from "./MaterialTableIcons";
import React, {Component} from 'react';
import react, {useEffect, useState} from 'react'
import { alpha } from '@material-ui/core/styles'
import { createMuiTheme , ThemeProvider } from "@material-ui/core/styles";
import _ from "lodash";

const GET_USERS_URL = 'http://conferencereservation-env-2.eba-pjmr2epd.us-west-2.elasticbeanstalk.com/api/v1/rooms?'

export class RoomsComponent extends Component {

    state = {
        columns: [
            { title: 'Room Name', field: 'roomName' },
            { title: 'Room Number', field: 'roomNumber' },
            { title: 'Room Capacity', field: 'roomCapacity' },
            { title: 'Room Location', field: 'roomLocation' },
            { title: 'Room Type', field: 'roomType' },
            { title: 'Room Status', field: 'status' }
          ],
        data: []
      };
   render(){
    const GET_USERS_URL = 'http://conferencereservation-env-2.eba-pjmr2epd.us-west-2.elasticbeanstalk.com/api/v1/rooms?'
    const theme = createMuiTheme ({
      overrides: {
        MuiTableSortLabel: {
          root: {
            color: "#000000",
            "&:hover": {
              color: "#fff !important"
            }
          },
          active: {
            color: "#fff !important"
          }
        }
      }
    });


    return (
      <ThemeProvider theme={theme}>
      <MaterialTable
        title="Rooms Preview"
        columns={this.state.columns}
        options={{
          search: false,
          paging: false,

          headerStyle: {
            backgroundColor: "#DEDEDE",
            color: "white"
          }
        }}
        data={this.state.data}
        icons={tableIcons}
        editable={{
          onRowAdd: newData =>
            new Promise((resolve, reject) => {
                newData.updateDateTime = new Date(); 
                newData.createDateTime = new Date();
                let newRoom =[]
                const requestOptions = {               
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(newData)
                };
                let url = `http://conferencereservation-env-2.eba-pjmr2epd.us-west-2.elasticbeanstalk.com/api/v1/rooms`;
                console.debug(`request url: ${url}`);
  
                fetch(url, requestOptions)
                  .then((response) => response.json())
  
                  .then((result) => {
                      newRoom = result.content                  
                  });
  
                setTimeout(() => {
                    this.setState(
                        prevState => ({
                          data: [...prevState.data, newData]
                        }),
                        resolve()
                      );
                }, 0)
            }),
          onRowUpdate: (newData, oldData) =>         
            new Promise((resolve, reject) => {
              newData.updateDateTime = new Date(); 
              newData.reservations = null;
              let newRoom =[]
              const requestOptions = {               
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newData)
              };
              let roomId = newData.room_id;
              let url = `http://conferencereservation-env-2.eba-pjmr2epd.us-west-2.elasticbeanstalk.com/api/v1/rooms/${roomId}`;
              console.debug(`request url: ${url}`);

              fetch(url, requestOptions)
                .then((response) => response.json())
                .then((result) => {
                    newRoom = result.content                  
                });
              setTimeout(() => {
                const dataUpdate = [...this.state.data];
               // Get index of the row we are updating..
                const index = dataUpdate.indexOf(oldData);
                dataUpdate[index] = newData;
                //Update our state..
                this.setState({ data: dataUpdate }, () => resolve())
              }, 0)
            }),
          onRowDelete: oldData =>
            new Promise((resolve, reject) => {
                oldData.updateDateTime = new Date(); 
                oldData.createDateTime = new Date(); 
                const requestOptions = {               
                  method: 'DELETE',
                  headers: { 'Content-Type': 'application/json' },
                };
                let roomId = oldData.room_id;
                let url = `http://conferencereservation-env-2.eba-pjmr2epd.us-west-2.elasticbeanstalk.com/api/v1/rooms/${roomId}`;
                console.debug(`request url: ${url}`);
  
                fetch(url, requestOptions)
                  .then((response) => response.json())
  
                  .then((result) => {
                    //   newRoom = result.content                  
                  });
  
                setTimeout(() => {
                      const dataDelete = [...this.state.data];
                      if (dataDelete.length > 0) {
                         const lastIndex = dataDelete.length - 1;
                        this.setState({ data: dataDelete.filter((item, index) => index !== lastIndex) });
                      }
                      resolve()
                }, 0)
            }),
        }}
      />
      </ThemeProvider>
    )   
   }

   fetchData = async query => {
    let url = `${GET_USERS_URL}pageSize=${query.pageSize}&page=${query.page}`;

    fetch(url)
      .then((response) => response.json())
        .then((result) => {               
             this.setState({data:result.content})
              
            });
   };
   componentDidMount() {
    this.fetchData({pageSize:5, page:0});
   }
  }
  export default RoomsComponent;
  