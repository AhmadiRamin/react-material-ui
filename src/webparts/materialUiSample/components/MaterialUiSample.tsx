import * as React from 'react';
import styles from './MaterialUiSample.module.scss';
import { IMaterialUiSampleProps } from './IMaterialUiSampleProps';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableFooter from '@material-ui/core/TableFooter';
import TablePagination from '@material-ui/core/TablePagination';
import TableRow from '@material-ui/core/TableRow';
import TableHead from '@material-ui/core/TableHead';
import Paper from '@material-ui/core/Paper';
import IMaterialUiSampleState from './IMaterialUiSampleState';
import TablePaginationActions from '@material-ui/core/TablePagination/TablePaginationActions';
import { withStyles } from '@material-ui/core/styles';
import InputBase from '@material-ui/core/InputBase';
import IconButton from '@material-ui/core/IconButton';
import SearchIcon from '@material-ui/icons/Search';
import DetailsDialog from './DetailsDialog/DetailsDialog';
require("@pnp/logging");
require("@pnp/common");
require("@pnp/odata");
import { sp} from "@pnp/sp";
import BookListItem from './BookListItem';

const CustomTableCell = withStyles(theme => ({
  head: {
    backgroundColor: "#E31F2D",
    color: theme.palette.common.white,
  },
  body: {
    fontSize: 14,
  },
}))(TableCell);

export default class MaterialUiSample extends React.Component<IMaterialUiSampleProps, IMaterialUiSampleState> {

  constructor(props) {
    super(props);
    this.state = {
      searchValue:'',
      rows: [],
      page: 0,
      rowsPerPage: 5,
      showDetailsDialog: false,
      book:{
        Title:'',
        AuthorName:'',
        Image:'',
        Id:0,
        Details:''
      }
    };
    this.getItems().then(items => {
      console.log(items);
      this.setState({
        rows: items
      });
    });
    this.onInputChange=this.onInputChange.bind(this);
  }
  public render(): React.ReactElement<IMaterialUiSampleProps> {
    const { rows, rowsPerPage, page } = this.state;
    const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

    return (
      <div className={styles.materialUiSample}>
        <Paper className={styles.searchContainer}>
          <InputBase onChange={(e)=>this.onInputChange(e.target.value)} value={this.state.searchValue} className={styles.input} placeholder="Search..." />
          <IconButton className={styles.iconButton} aria-label="Search">
            <SearchIcon />
          </IconButton>
        </Paper>

        <Paper className={styles.root}>
          <div className={styles.tableWrapper}>
            <Table className={styles.table}>
              <TableHead>
                <TableRow>
                  <CustomTableCell>Image</CustomTableCell>
                  <CustomTableCell>Title</CustomTableCell>
                  <CustomTableCell>Author</CustomTableCell>
                  <CustomTableCell>Details</CustomTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {rows.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map(row => (
                  <TableRow key={row.Id}>
                    <TableCell component="th" scope="row">
                      <img src={row.Image.Url} className={styles.image}></img>
                    </TableCell>
                    <TableCell component="th" scope="row">
                      {row.Title}
                    </TableCell>
                    <TableCell>
                      {row.AuthorName}
                    </TableCell>
                    <TableCell>
                      <a className={styles.moreDetailsLink} onClick={()=>this.handleClickOpen(row)}>More details...</a>
                    </TableCell>
                  </TableRow>
                ))}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 48 * emptyRows }}>
                    <TableCell colSpan={6} />
                  </TableRow>
                )}
              </TableBody>
              <TableFooter>
                <TableRow>
                  <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    colSpan={3}
                    count={rows.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    SelectProps={{
                      native: true,
                    }}
                    onChangePage={this.handleChangePage}
                    onChangeRowsPerPage={this.handleChangeRowsPerPage}
                    ActionsComponent={TablePaginationActions}
                  />
                </TableRow>
              </TableFooter>
            </Table>
          </div>
        </Paper>

        <DetailsDialog open={this.state.showDetailsDialog} book={this.state.book} handleClose={this.handleClose}/>
      </div>
    );
  }

  private onInputChange(value:string){
    const books = this.state.rows;
    this.setState(prevState=>({
      searchValue: value,
      rows: books.filter(book=>book.Title.indexOf(value)!=-1 || book.AuthorName.indexOf(value)!=-1)
    }));
  }
  /**
  * Gets the items from the list
  */
  private getItems(): Promise<BookListItem[]> {

    // here we are using the getAs operator so that our returned value will be typed
    return sp.web.lists.getByTitle("Books").items.select("Id", "Title", "AuthorName", "Image", "Details").get<BookListItem[]>();
  }

  private handleChangePage = (event, page) => {
    this.setState({ page });
  }

  private handleChangeRowsPerPage = event => {
    this.setState({ page: 0, rowsPerPage: event.target.value });
  }

  private handleClickOpen = (book:BookListItem) => {
    this.setState({
      showDetailsDialog: true,
      book
    });
  }

  private handleClose = () => {
    this.setState({ showDetailsDialog: false });
  }

}
