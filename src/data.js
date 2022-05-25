
// function getOptions(){
//   return opt = 
// }
export function geUserOptions(props){

  return   {
    name: "user_id",
    type: "select",

    
    // Should provide options with type:"select"
    options: [
      { id: 1, text: "John", value: 1 },
      { id: 2, text: "Mark", value: 2 }
    ],
    // options: opt
    config: { label: "User", required: true, errMsg: "Plz Select User" }
  }

}

export const CUSTOM_DATA = [
  // {
  //   getUserOptions();
  // },
  {
    name: "user_id",
    type: "select",

    
    // Should provide options with type:"select"
    options: [
      { id: 1, text: "Wube", value: 1 },
      { id: 2, text: "Elzabet", value: 2 }
    ],
    // options: opt
    config: { label: "User", required: true, errMsg: "Plz Select User" }
  },
  {
    name: "Description",
    type: "input",
    default: "Default Value...",
    config: { label: "Details", multiline: true, rows: 4 }
  }
  // {
  //   name: "anotherdate",
  //   type: "date",
  //   config: {
  //     label: "Other Date",
  //     md: 6,
  //     modalVariant: "dialog",
  //     type: "datetime"
  //   }
  // }
  ];