import MaterialTable from "material-table";
import _ from "lodash";
import AddBox from "@material-ui/icons/AddBox";
import { ArrowUpward } from "@material-ui/icons";
import React from "react";
import * as colors from "@material-ui/core/colors";
import { createMuiTheme , ThemeProvider } from "@material-ui/core/styles";

export default function UsersComponent() {
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
    <div className="UsersComponent">
      <ThemeProvider theme={theme}>
        <MaterialTable
          title="User Preview"
          columns={[
            { title: "First Name", field: "firstName" },
            { title: "Last Name", field: "lastName" },
            { title: "User Name", field: "userName" },
            { title: "Email Id", field: "emailId" },
            { title: "Phone Number", field: "phoneNumber" }
          ]}
          options={{
            search: false,
            paging: false,

            headerStyle: {
              backgroundColor: "#DEDEDE",
              color: "white"
            }
          }}
          icons={{
            SortArrow: React.forwardRef((props, ref) => (
              <span>
                <ArrowUpward
                  {...props}
                  ref={ref}
                  style={{ color: colors.grey[100] }}
                />
              </span>
            ))
          }}
          data={(query) =>
            new Promise((resolve, reject) => {
              let url = "http://conferencereservation-env-2.eba-pjmr2epd.us-west-2.elasticbeanstalk.com/api/v1/users?";
              url += "pageSize=" + query.pageSize;
              url += "&page=" + (query.page);
              console.debug(`request url: ${url}`);
              fetch(url)
                .then((response) => response.json())
                .then((result) => {
                  resolve({
                    data:
                      query.orderBy && query.orderDirection
                        ? _.orderBy(
                            result.content,
                            [query.orderBy.field],
                            [query.orderDirection]
                          )
                        : result.content,
                    page: result.pageable.page + 1,
                    totalCount: result.pageable.pageSize
                  });
                });
            })
          }
        />
      </ThemeProvider>
    </div>
  );
}
