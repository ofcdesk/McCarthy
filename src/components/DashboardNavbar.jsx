import { Search } from "@mui/icons-material";
import CloseIcon from "@mui/icons-material/Close";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  styled,
  useMediaQuery,
} from "@mui/material";
import AppBar from "@mui/material/AppBar";
import Container from "@mui/material/Container";

import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import FormControl from "@mui/material/FormControl";
import InputBase from "@mui/material/InputBase";
import InputLabel from "@mui/material/InputLabel";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import Toolbar from "@mui/material/Toolbar";
import { FlexBox, FlexRowCenter } from "../components/flex-box";

import { useState } from "react";
import { useCookies } from "react-cookie";
import { useAppContext } from "../contexts/appContext";

import Toggle from "../components/icons/Toggle";

const DashboardNavbarRoot = styled(AppBar)(({ theme }) => ({
  zIndex: 11,
  paddingTop: "1rem",
  paddingBottom: "1rem",
  backgroundColor: "#ffffff",
  boxShadow: theme.shadows[2],
  color: theme.palette.text.primary,
}));

const StyledToolBar = styled(Toolbar)(() => ({
  "@media (min-width: 0px)": {
    paddingLeft: 0,
    paddingRight: 0,
    minHeight: "auto",
  },
}));
const ToggleWrapper = styled(FlexRowCenter)(({ theme }) => ({
  width: 40,
  height: 40,
  flexShrink: 0,
  cursor: "pointer",
  borderRadius: "8px",
  backgroundColor: theme.palette.grey[100],
}));
export const StyledInputBase = styled(InputBase)(({ theme }) => ({
  width: 300,
  padding: "5px 10px",
  borderRadius: "8px",
  color: theme.palette.grey[500],
  backgroundColor: theme.palette.grey[100],
  [theme.breakpoints.down("md")]: {
    display: "none",
  },
}));
const StyledSelect = styled(Select)(({ theme }) => ({
  width: 300,
  height: 50,
  padding: "5px 10px",
  borderRadius: "8px",
  color: theme.palette.grey[500],
})); // ===================================================================

const DashboardNavbar = (props) => {
  const { handleDrawerToggle } = props;

  const [cookies] = useCookies(["procore_token"]);

  const { state, dispatch } = useAppContext();

  const [isFetchingCompanies, setFetchingCompanies] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(
    state.selectedCompanyId ?? ""
  );
  const [isCompaniesSelectorOpen, setCompaniesSelectorOpen] = useState(false);
  const [isCompaniesSelectOpen, setCompaniesSelectOpen] = useState(false);
  const [companies, setCompanies] = useState(state.companies ?? []);
  const [searchCompany, setSearchCompany] = useState("");
  const downLg = useMediaQuery((theme) => theme.breakpoints.down("lg"));

  const handleSelectCompaniesClose = (event, reason) => {
    if (reason !== "backdropClick") {
      setCompaniesSelectorOpen(false);
      setFetchingCompanies(false);
    }
  };

  const handleCompanyChange = (event) => {
    const {
      target: { value },
    } = event;

    dispatch({
      type: "SET_SELECTED_COMPANY",
      payload: value,
    });

    fetch("http://localhost:3000/api/procore/getProjects?company_id=" + value)
      .then((res) => res.json())
      .then((data) => {
        dispatch({
          type: "COMPANY_PROJECTS_CHANGED",
          payload: data,
        });
      });

    setSelectedCompany(value);
  };

  const getCompaniesList = async (refresh) => {
    fetch("/api/procore/getCompanies", {
      headers: {
        Authorization: `Bearer ${cookies.procore_token}`,
      },
    })
      .then((res) => res.json())
      .then((data) => {
        setCompanies(data);
        dispatch({
          type: "COMPANIES_LIST_CHANGED",
          payload: data,
        });
        setFetchingCompanies(false);
      });

    // let companiesRes = "";

    // let URL = origin + "/api/procore/getCompanies";
    // if (refresh !== undefined) {
    //   URL += "?forceRefresh=true";
    // }
    // try {
    //   companiesRes = (await axios.get(URL, {
    //     headers: {
    //       Authorization: `Bearer ${cookies.procore_token}`,
    //     },
    //   })).data;
    // } catch (err) {
    //   companiesRes = "Unauthorized";
    // }
    // if (companiesRes === "Unauthorized") {
    //   await axios.get(origin + "/api/procore/refreshtoken");
    //   companiesRes = (await axios.get(URL)).data;
    // }

    // companiesRes.sort((a, b) =>
    //   a.attributes.name.slice(0, 3) > b.attributes.name.slice(0, 3) ? 1 : -1
    // );

    // setCompanies(companiesRes);
    // dispatch({
    //   type: "COMPANIES_LIST_CHANGED",
    //   payload: {
    //     companies: companiesRes,
    //   },
    // });
    // setFetchingCompanies(false);
  };

  return (
    <DashboardNavbarRoot position="sticky">
      <Dialog
        disableEscapeKeyDown
        open={isCompaniesSelectOpen}
        onClose={handleSelectCompaniesClose}
      >
        <DialogTitle
          sx={{
            textAlign: "center",
            fontWeight: "bold",
            textTransform: "uppercase",
          }}
        >
          Select the company
        </DialogTitle>
        <IconButton
          aria-label="close"
          onClick={() => {
            setCompaniesSelectOpen(false);
            setFetchingCompanies(false);
          }}
          sx={{
            position: "absolute",
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <CloseIcon />
        </IconButton>
        <DialogContent sx={{ minWidth: 350 }}>
          <Box
            component="form"
            sx={{
              display: "flex",
              flexWrap: "wrap",
              flexDirection: "column",
              alignItems: "center",
            }}
          >
            <StyledInputBase
              placeholder="Company name..."
              value={searchCompany}
              onChange={(event) => {
                setSearchCompany(event.target.value);
              }}
              startAdornment={
                <Search
                  sx={{
                    color: "grey.500",
                    mr: 1,
                  }}
                />
              }
            />
            <FormControl sx={{ m: 1 }}>
              <InputLabel id="select-company-label">Company</InputLabel>
              <Box sx={{ m: 1, position: "relative" }}>
                <Select
                  input={<StyledSelect />}
                  labelId="select-company-label"
                  id="select-company"
                  value={selectedCompany}
                  displayEmpty
                  onChange={handleCompanyChange}
                  disabled={isFetchingCompanies}
                >
                  {companies.map((value, index) => {
                    if (
                      value.name
                        .toLowerCase()
                        .includes(searchCompany.toLowerCase())
                    ) {
                      return (
                        <MenuItem value={value.id} key={value.id}>
                          {value.name}
                        </MenuItem>
                      );
                    }
                  })}
                </Select>
                {isFetchingCompanies && (
                  <CircularProgress
                    size={24}
                    sx={{
                      color: "primary",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: "-12px",
                      marginLeft: "-12px",
                    }}
                  />
                )}
              </Box>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={async () => {
              setFetchingCompanies(true);
              await getCompaniesList(true);
              setCompaniesSelectOpen(true);
            }}
          >
            Force Refresh
          </Button>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSelectCompaniesClose}
          >
            Ok
          </Button>
        </DialogActions>
      </Dialog>
      <Container maxWidth="xl">
        <StyledToolBar disableGutters>
          {downLg && (
            <ToggleWrapper onClick={handleDrawerToggle}>
              <Toggle />
            </ToggleWrapper>
          )}

          <Box flexGrow={1} />

          <FlexBox alignItems="center">
            <FormControl>
              <InputLabel id="select-company-label">Company</InputLabel>
              <Box sx={{ m: 1, position: "relative" }}>
                <Select
                  input={<StyledSelect />}
                  labelId="select-company-label"
                  id="select-company"
                  value={selectedCompany}
                  displayEmpty
                  disabled={isFetchingCompanies}
                  onOpen={async () => {
                    if (isFetchingCompanies) {
                      return;
                    }
                    setFetchingCompanies(true);
                    await getCompaniesList();
                    setCompaniesSelectorOpen(true);
                    setCompaniesSelectOpen(false);
                  }}
                  open={isCompaniesSelectorOpen}
                  onChange={handleCompanyChange}
                  onClose={handleSelectCompaniesClose}
                >
                  {companies.map((value, index) => {
                    return (
                      <MenuItem value={value.id} key={value.id}>
                        {value.name}
                      </MenuItem>
                    );
                  })}
                </Select>
                {isFetchingCompanies && (
                  <CircularProgress
                    size={24}
                    sx={{
                      color: "primary",
                      position: "absolute",
                      top: "50%",
                      left: "50%",
                      marginTop: "-12px",
                      marginLeft: "-12px",
                    }}
                  />
                )}
              </Box>
            </FormControl>
          </FlexBox>
        </StyledToolBar>
      </Container>
    </DashboardNavbarRoot>
  );
};

export default DashboardNavbar;
