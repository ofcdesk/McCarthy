import react, { useState, useEffect } from "react";
import {
  Box,
  styled,
  CircularProgress,
  Button,
  Avatar,
  Card,
  CardHeader,
  CardContent,
  Typography,
  Grid,
  TextField,
  Select,
  OutlinedInput,
  MenuItem,
  InputLabel,
  FormControl,
  CardActions,
  Dialog,
  DialogTitle,
  Alert,
  AlertTitle,
  Snackbar,
  Backdrop,
  Autocomplete,
} from "@mui/material";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import VendorDashboardLayout from "components/layouts/dashboard";
import { H3 } from "components/Typography";
import axios from "axios";
import Image from "next/image";
// =============================================================================

const StyledButton = styled(Button)(({ theme }) => ({
  backgroundColor: theme.palette.primary[500],
  borderRadius: "5px",
  color: "white",
}));

ConfigurePage.getLayout = function getLayout(page) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
}; // =============================================================================

const hours = [];
hours.push("12 AM");
for (let i = 1; i <= 11; i++) {
  hours.push(`${i} AM`);
}
hours.push("12 PM");
for (let i = 1; i <= 11; i++) {
  hours.push(`${i} PM`);
}

// =============================================================================
export default function ConfigurePage() {
  const [isFetching, setFetching] = useState(false);
  const [currentUserPicture, setCurrentUserPicture] = useState(null);
  const [currentUserName, setCurrentUserName] = useState(undefined);
  const [currentUserEmail, setCurrentUserEmail] = useState("");
  const [userPicture, setUserPicture] = useState(null);
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [folderPickerOpen, setFolderPickerOpen] = useState(false);
  const [folderPickerTitle, setFolderPickerTitle] =
    useState("Select FTP Folder");
  const [ftpFolders, setFtpFolders] = useState([]);
  const [accFolders, setAccFolders] = useState([]);
  const [ftpHost, setFtpHost] = useState("");
  const [ftpUsername, setFtpUsername] = useState("");
  const [ftpPassword, setFtpPassword] = useState("");
  const [ftpErrorText, setFTPErrorText] = useState("");
  const [displayFTPErrorFeedback, setDisplayFTPErrorFeedback] = useState(false);
  const [fetchingText, setFetchingText] = useState("Loading");
  const [ftpConnected, setFTPConnected] = useState(false);
  const [folderPickerData, setFolderPickerData] = useState([]);
  const [fetchingFolders, setFetchingFolders] = useState(false);
  const [folderPickerSelectedItem, setFolderPickerSelectedItem] =
    useState(undefined);
  const [selectedFtpFolder, setFtpSelectedFolder] = useState(undefined);
  const [selectedAccFolder, setSelectedAccFolder] = useState(undefined);
  const [accProjects, setAccProjects] = useState([]);
  const [lastSync, setLastSync] = useState(undefined);
  const [currentSyncFile, setCurrentSyncFile] = useState("Loading File...");
  const [searchProjectByAccFtpText, setSearchProjectByAccFtpText] =
    useState("");
  const [selectedAccFtpProject, setSelectedAccFtpProject] = useState(null);
  const [accFtpSynchronizationStatus, setAccFtpSynchronizationStatus] =
    useState(
      "You need to select an ACC project and a FTP folder to schedule the synchronization interval and hit the CONFIRM SCHEDULE button"
      //"Schedule unavailable"
    );
  const [scheduleAccFtpInterval, setScheduleAccFtpInterval] = useState("DAILY");
  const [intervalAccFtpHour, setIntervalAccFtpHour] = useState("12 AM");
  const [intervalAccFtpWeekDay, setIntervalAccFtpWeekDay] = useState("Monday");
  const [synchronizationAccFtpInProgress, setSynchronizationAccFtpInProgress] =
    useState(false);

  const [searchProjectByAccProcoreText, setSearchProjectByAccProcoreText] =
    useState("");
  const [searchProjectByProcoreText, setSearchProjectByProcoreText] =
    useState("");
  const [selectedAccProcoreProject, setSelectedAccProcoreProject] =
    useState(null);
  const [accProcoreSynchronizationStatus, setAccProcoreSynchronizationStatus] =
    useState(
      "You need to select an ACC project and a Procore project to schedule the synchronization interval and hit the CONFIRM SCHEDULE button"
    );
  const [scheduleAccProcoreInterval, setScheduleAccProcoreInterval] =
    useState("DAILY");
  const [intervalAccProcoreHour, setIntervalAccProcoreHour] = useState("12 AM");
  const [intervalAccProcoreWeekDay, setIntervalAccProcoreWeekDay] =
    useState("Monday");
  const [
    synchronizationAccProcoreInProgress,
    setSynchronizationAccProcoreInProgress,
  ] = useState(false);
  const [procoreProjects, setProcoreProjects] = useState([]);
  const [selectedProcoreProject, setSelectedProcoreProject] = useState(null);
  const [lastSyncProcore, setLastSyncProcore] = useState(undefined);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const timerId = setInterval(async () => {
      try {
        const inProgress = (
          await axios.get("/api/synchronization-in-progress-status")
        ).data;

        if (inProgress !== undefined && inProgress.status === true) {
          const currentTime = new Date().getTime();
          const differenceInMinutes =
            (currentTime - inProgress.lastDate) / (1000 * 60);
          if (differenceInMinutes < 60) {
            setSynchronizationAccFtpInProgress(true);
            const currentSyncItem = (
              await axios.get("api/synchronization-status")
            ).data;

            if (currentSyncItem !== undefined) {
              setCurrentSyncFile(
                currentSyncItem.file + "\n" + currentSyncItem.status
              );
            }
          } else {
            const currentSyncItem = (
              await axios.get("api/synchronization-status")
            ).data;

            if (currentSyncItem !== undefined) {
              setCurrentSyncFile(
                currentSyncItem.file + "\n" + currentSyncItem.status
              );
              if (currentSyncItem.error === true) {
                setSynchronizationAccFtpInProgress(false);
              }
            } else {
              setSynchronizationAccFtpInProgress(false);
            }
          }
        } else {
          setSynchronizationAccFtpInProgress(false);
        }
      } catch (err) {
        console.log("Error getting synchronization status");
        console.log(err);
      }
    }, 3000);
    return () => {
      clearInterval(timerId);
    };
  }, []);

  const fetchData = async () => {
    setFetching(true);
    let URL = "/api/current-user-profile";
    let response = (await axios.get(URL)).data;

    setCurrentUserPicture(response.picture || "");
    setCurrentUserName(response.name || undefined);
    setCurrentUserEmail(response.email || "");

    const currentUserEmail = response.email || "null";

    URL = "/api/user-profile?email=" + currentUserEmail;
    try {
      response = (await axios.get(URL)).data;
    } catch (err) {
      response = "Unauthorized";
    }
    if (response === "Unauthorized") {
      try {
        await axios.get("/api/refresh-token");
        response = (await axios.get(URL)).data;
      } catch (err) {
        await axios.get("/api/logout");
        window.location.reload();
      }
    }

    setUserPicture(response.picture);
    setUserName(response.name);
    setUserEmail(response.email);

    URL = "/api/ftp-config";
    response = (await axios.get(URL)).data;
    setFtpHost(response.host);
    setFtpUsername(response.user);
    setFtpPassword(response.password);
    setFTPConnected(response.error !== undefined ? !response.error : false);
    if (response.error) {
      setFTPErrorText(response.errorMessage);
      setDisplayFTPErrorFeedback(true);
    }

    if (currentUserEmail !== "null") {
      try {
        URL = "/api/user-projects?forceRefresh=true";
        response = (await axios.get(URL)).data;
        setAccProjects(
          response.map((project) => {
            return { ...project, label: project.attributes.name };
          })
        );
      } catch (err) {
        console.log("Error getting user projects");
      }

      URL = "/api/synchronization-config";
      response = (await axios.get(URL)).data;

      if (response.hubId !== undefined) {
        setSelectedAccFtpProject({
          id: response.projectId,
          label: response.projectName,
          relationships: {
            hub: {
              data: {
                id: response.hubId,
              },
            },
          },
        });
        setSelectedAccFolder({
          id: response.accFolderPath.id,
          label: response.accFolderPath.label,
          accId: response.accFolderPath.accId,
        });
        setFtpSelectedFolder({
          id: response.ftpFolderPath.id,
          label: response.ftpFolderPath.label,
        });
        setScheduleAccFtpInterval(response.interval);
        setIntervalAccFtpWeekDay(response.weekday);
        setIntervalAccFtpHour(response.hour);
        setAccFtpSynchronizationStatus("Synchronization Confirmed");
      }

      URL = "/api/last-sync-time";
      response = (await axios.get(URL)).data;

      if (response !== undefined) {
        setLastSync(response.lastTime);
      }
    }

    setFetching(false);
  };

  const handleSetUserPress = async () => {
    setFetching(true);
    const refreshedCredentials = (await axios.get("/api/refresh-token")).data;
    await axios.post(
      "/api/set-sync-user?expires_at=" +
        String(refreshedCredentials.expires_at) +
        "&access_token=" +
        refreshedCredentials.access_token +
        "&refresh_token=" +
        refreshedCredentials.refresh_token +
        "&userName=" +
        userName +
        "&userEmail=" +
        userEmail +
        "&userPicture=" +
        userPicture
    ).data;

    setCurrentUserEmail(userEmail);
    setCurrentUserName(userName);
    setCurrentUserPicture(userPicture);

    setFetching(false);
  };

  const handleFTPFolderClick = async () => {
    if (!ftpConnected) {
      return;
    }
    if (ftpFolders.length === 0) {
      setFetchingText("Loading FTP Folders");
      setFetching(true);
      const response = (
        await axios.post("/api/ftp-folders", {
          path: "",
          foldersOnly: true,
        })
      ).data;
      const tree = response.map((folder) => {
        return {
          id: folder.name,
          label: folder.name,
          isFTP: true,
          children: [{ label: "Loading...", id: folder.name + "_loading" }],
        };
      });
      setFtpFolders(tree);
      setFolderPickerData(tree);
      setFetching(false);
    } else {
      setFolderPickerData(ftpFolders);
    }
    setFolderPickerTitle("Select FTP Folder");
    setFolderPickerOpen(true);
  };

  const handleACCFolderClick = async () => {
    if (selectedAccFtpProject === null) {
      return;
    }
    if (accFolders.length === 0) {
      setFetchingText("Loading ACC Folders");
      setFetching(true);
      try {
        await axios.get("/api/refresh-sync-user-token");
      } catch (err) {}
      const response = (
        await axios.post("/api/acc-folders", {
          hubId: selectedAccFtpProject.relationships.hub.data.id,
          projectId: selectedAccFtpProject.id,
          path: "Project Files",
          foldersOnly: true,
        })
      ).data;
      setFetching(false);
      if (response.length === 0) {
        setFolderPickerData([
          {
            id: "No folders available",
            label: "No folders available",
            isFTP: false,
            children: [],
          },
        ]);
      } else {
        const tree = response.map((folder) => {
          return {
            accId: folder.id,
            id: folder.attributes.name,
            label: folder.attributes.name,
            isFTP: false,
            children: [
              { label: "Loading...", id: folder.attributes.name + "_loading" },
            ],
          };
        });
        setAccFolders(tree);
        setFolderPickerData(tree);
      }
      console.log(response);
    } else {
      setFolderPickerData(accFolders);
      if (accFolders.length === 0) {
        setFolderPickerData([
          {
            id: "No folders available",
            label: "No folders available",
            isFTP: false,
            children: [],
          },
        ]);
      }
    }
    setFolderPickerTitle("Select ACC Folder");
    setFolderPickerOpen(true);
  };

  const handleFolderPick = () => {
    if (
      folderPickerSelectedItem.isFTP &&
      folderPickerSelectedItem.label !== "No folders available"
    ) {
      setFtpSelectedFolder(folderPickerSelectedItem);
    } else if (
      !folderPickerSelectedItem.isFTP &&
      folderPickerSelectedItem.label !== "No folders available"
    ) {
      setSelectedAccFolder(folderPickerSelectedItem);
    }
    setFolderPickerOpen(false);
  };

  const handleFTPConnect = async () => {
    setFetching(true);
    setFetchingText("Connecting to FTP");
    try {
      await axios.post("/api/ftp-connect", {
        host: ftpHost,
        user: ftpUsername,
        password: ftpPassword,
      });

      try {
        const response = (
          await axios.get("/api/user-projects?forceRefresh=true")
        ).data;
        setAccProjects(
          response.map((project) => {
            return { ...project, label: project.attributes.name };
          })
        );
      } catch (err) {
        console.log("Error getting user projects");
      }

      setFTPConnected(true);
    } catch (err) {
      console.log("Error connecting to FPT");
      console.log(err);
      if (err.response.status === 404) {
        setFTPErrorText("FTP server not found");
        setDisplayFTPErrorFeedback(true);
      }
      if (err.response.status === 401) {
        setFTPErrorText("User not authorized, please check your credentials");
        setDisplayFTPErrorFeedback(true);
      }
    }
    setFetching(false);
  };

  const handleFTPDisconnect = async () => {
    setFetching(true);
    setFetchingText("Disconnecting FTP");
    try {
      await axios.get("/api/ftp-disconnect");

      setFtpSelectedFolder(undefined);
      setSelectedAccFolder(undefined);
      setSearchProjectByAccFtpText("");
      setSelectedAccFtpProject(null);
      setAccFtpSynchronizationStatus(
        "You need to select an ACC project and a FTP folder to schedule the synchronization interval and hit the CONFIRM SCHEDULE button"
      );
      setLastSync(undefined);
      setFtpFolders([]);
      setAccFolders([]);

      setFTPConnected(false);
    } catch (err) {
      console.log("Error disconnecting FPT");
      console.log(err);
    }
    setFetching(false);
  };

  const handleCloseErrorSnackBar = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setDisplayFTPErrorFeedback(false);
  };

  const findRecursive = (data, id) => {
    for (let i = 0; i < data.length; i++) {
      if (data[i].id === id) {
        return data[i];
      }
      if (data[i].children !== null && data[i].children !== undefined) {
        let result = findRecursive(data[i].children, id);
        if (result !== null) {
          return result;
        }
      }
    }
    return null;
  };

  const handleSelectedItemsChange = async (event, id) => {
    let selected = findRecursive(folderPickerData, id);
    if (selected === undefined) {
      return;
    }
    setFolderPickerSelectedItem(selected);
    if (
      selected.children.length === 1 &&
      selected.children[0].id === selected.id + "_loading"
    ) {
      setFetchingFolders(true);
      //We need to do that to avoid shallow copy and make the component re-render
      let newArray = structuredClone(folderPickerData);
      selected = findRecursive(newArray, id);

      selected.children = [];
      if (selected.isFTP) {
        const response = (
          await axios.post("/api/ftp-folders", { path: id, foldersOnly: true })
        ).data;
        const node = response.map((folder) => {
          return {
            id: selected.id + "/" + folder.name,
            label: folder.name,
            isFTP: true,
            children: [
              {
                label: "Loading...",
                id: selected.id + "/" + folder.name + "_loading",
              },
            ],
          };
        });
        selected.children = node;
      } else if (!selected.isFTP) {
        const response = (
          await axios.post("/api/acc-folders", {
            hubId: selectedAccFtpProject.relationships.hub.data.id,
            projectId: selectedAccFtpProject.id,
            path: "Project Files/" + id,
            foldersOnly: true,
          })
        ).data;
        const node = response.map((folder) => {
          return {
            accId: folder.id,
            id: selected.id + "/" + folder.attributes.name,
            label: folder.attributes.name,
            isFTP: false,
            children: [
              {
                label: "Loading...",
                id: selected.id + "/" + folder.attributes.name + "_loading",
              },
            ],
          };
        });
        selected.children = node;
      }

      setFolderPickerData(newArray);
      setFetchingFolders(false);
    }
  };

  const accFtpProjectSelected = (event, project) => {
    setSelectedAccFtpProject(project);
    console.log(project);
  };

  const handleScheduleIntervalChange = (event) => {
    const {
      target: { value },
    } = event;
    setScheduleAccFtpInterval(value);
  };

  const handleIntervalHourChange = (event) => {
    const {
      target: { value },
    } = event;
    setIntervalAccFtpHour(value);
  };

  const handleIntervalWeekdayChange = (event) => {
    const {
      target: { value },
    } = event;
    setIntervalAccFtpWeekDay(value);
  };

  const handleConfirmSynchronization = async () => {
    setFetchingText("Confirming Synchronization");
    setFetching(true);
    try {
      await axios.post("/api/confirm-synchronization", {
        hubId: selectedAccFtpProject.relationships.hub.data.id,
        projectId: selectedAccFtpProject.id,
        projectName: selectedAccFtpProject.label,
        accFolderPath: {
          id: selectedAccFolder.id,
          label: selectedAccFolder.label,
          accId: selectedAccFolder.accId,
        },
        ftpFolderPath: {
          id: selectedFtpFolder.id,
          label: selectedFtpFolder.label,
        },
        interval: scheduleAccFtpInterval,
        weekDay: intervalAccFtpWeekDay,
        hour: intervalAccFtpHour,
      });
      setAccFtpSynchronizationStatus("Synchronization Confirmed");
    } catch (err) {
      console.log("Error confirming synchronization");
      console.log(err);
      setAccFtpSynchronizationStatus("Error confirming synchronization");
    }
    setFetching(false);
  };

  const handleCancelSynchronization = async () => {
    setFetchingText("Canceling Synchronization");
    setFetching(true);
    try {
      await axios.post("/api/cancel-synchronization");
      setAccFtpSynchronizationStatus(
        "You need to select an ACC project and a FTP folder to schedule the synchronization interval and hit the CONFIRM SCHEDULE button"
      );
    } catch (err) {
      console.log("Error canceling synchronization");
      console.log(err);
      setAccFtpSynchronizationStatus("Error canceling synchronization");
    }
    setFetching(false);
  };

  const accProcoreProjectSelected = (event, project) => {
    setSelectedAccProcoreProject(project);
    console.log(project);
  };

  const procoreProjectSelected = (event, project) => {
    setSelectedProcoreProject(project);
    console.log(project);
  };

  const handleProcoreScheduleIntervalChange = (event) => {
    const {
      target: { value },
    } = event;
    setScheduleAccProcoreInterval(value);
  };

  const handleProcoreIntervalHourChange = (event) => {
    const {
      target: { value },
    } = event;
    setIntervalAccProcoreHour(value);
  };

  const handleProcoreConfirmSynchronization = async () => {
    setFetchingText("Confirming Synchronization");
    setFetching(true);
    try {
      await axios.post("/api/confirm-synchronization-procore", {
        hubId: selectedAccProcoreProject.relationships.hub.data.id,
        projectId: selectedAccProcoreProject.id,
        projectName: selectedAccProcoreProject.label,
        interval: scheduleAccProcoreInterval,
        hour: intervalAccProcoreHour,
        procoreProjectId: selectedProcoreProject.id,
        procoreProjectName: selectedProcoreProject.label,
      });
      setAccProcoreSynchronizationStatus("Synchronization Confirmed");
    } catch (err) {
      console.log("Error confirming synchronization");
      console.log(err);
      setAccFtpSynchronizationStatus("Error confirming synchronization");
    }
    setFetching(false);
  };

  const handleProcoreCancelSynchronization = async () => {
    setFetchingText("Canceling Synchronization");
    setFetching(true);
    try {
      await axios.post("/api/cancel-synchronization-procore");
      setAccProcoreSynchronizationStatus(
        "You need to select an ACC project and a Procore project to schedule the synchronization interval and hit the CONFIRM SCHEDULE button"
      );
    } catch (err) {
      console.log("Error canceling synchronization");
      console.log(err);
      setAccFtpSynchronizationStatus("Error canceling synchronization");
    }
    setFetching(false);
  };

  const handleSyncNowPress = async () => {
    try {
      await axios.post("/api/set-last-sync-time", {
        lastTime: new Date().toLocaleString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        }),
      });
    } catch (err) {}

    try {
      await axios.get("/api/refresh-sync-user-token");
    } catch (err) {}

    try {
      await axios.post("/api/sync-now", {
        hubId: selectedAccFtpProject.relationships.hub.data.id,
        projectId: selectedAccFtpProject.id,
        ftpPath: selectedFtpFolder.id,
        accPath: `Project Files/${selectedAccFolder.id}`,
        accFolderId: selectedAccFolder.accId,
      });
    } catch (err) {
      console.log("Error starting synchronization");
      console.log(err);
    }
  };

  const handleProjectSelectorClick = async () => {
    if (accProjects.length === 0) {
      setFetchingText("Loading ACC Projects");
      setFetching(true);
      try {
        await axios.get("/api/refresh-sync-user-token");
      } catch (err) {}
      const response = (await axios.get("/api/user-projects?forceRefresh=true"))
        .data;
      setAccProjects(
        response.map((project) => {
          return { ...project, label: project.attributes.name };
        })
      );
      setFetching(false);
    }
  };

  const handleProcoreProjectSelectorClick = async () => {
    if (procoreProjects.length === 0) {
      setFetchingText("Loading Procore Projects");
      setFetching(true);
      const response = (await axios.get("/api/procore-projects")).data;
      setProcoreProjects(
        response.map((project) => {
          return { ...project, label: project.name };
        })
      );
      setFetching(false);
    }
  };

  if (isFetching) {
    return (
      <Box
        py={4}
        sx={{
          display: "flex",
          height: "90vh",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
        }}
      >
        <CircularProgress
          size={150}
          sx={{
            color: "primary",
          }}
        />
        <H3 mt={5}>{fetchingText}</H3>
      </Box>
    );
  }

  return (
    <Box py={4}>
      <Snackbar
        open={displayFTPErrorFeedback}
        //autoHideDuration={6000}
        onClose={handleCloseErrorSnackBar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseErrorSnackBar}
          severity="error"
          sx={{ width: "100%" }}
        >
          <AlertTitle>Error</AlertTitle>
          {ftpErrorText}
        </Alert>
      </Snackbar>

      <Grid
        spacing={4}
        container
        sx={{ display: "flex", justifyContent: "center" }}
      >
        <Dialog open={folderPickerOpen}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              flexDirection: "column",
              minWidth: 500,
            }}
          >
            <Backdrop
              sx={(theme) => ({
                color: "#fff",
                zIndex: theme.zIndex.drawer + 1,
              })}
              open={fetchingFolders}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
            <DialogTitle textAlign={"center"}>{folderPickerTitle}</DialogTitle>
            <RichTreeView
              onSelectedItemsChange={handleSelectedItemsChange}
              items={folderPickerData}
            />
            <Button
              disabled={folderPickerSelectedItem === undefined}
              onClick={handleFolderPick}
            >
              CONFIRM
            </Button>
          </Box>
        </Dialog>
        {currentUserName !== undefined && (
          <Grid item sm={currentUserName !== userName ? 6 : 12} xs={12}>
            <Card
              sx={{
                minHeight: 400,
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <CardHeader
                title={currentUserName}
                subheader={currentUserEmail}
              />
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Avatar
                  src={currentUserPicture}
                  sx={{
                    height: 150,
                    width: 150,
                  }}
                />
                <Typography py={2} variant="body2">
                  This is the user that's currently being used for
                  synchronization with ACC
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        )}
        {currentUserEmail !== userEmail && currentUserName !== userName && (
          <Grid item sm={currentUserName !== undefined ? 6 : 12} xs={12}>
            <Card
              sx={{
                minHeight: 400,
                display: "flex",
                justifyContent: "center",
                flexDirection: "column",
              }}
            >
              <CardHeader title={userName} subheader={userEmail} />
              <CardContent
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                }}
              >
                <Avatar
                  src={userPicture}
                  sx={{
                    height: 150,
                    width: 150,
                  }}
                />
                <Typography py={2} variant="body2">
                  Clicking the "Select User" will set this user to use in
                  synchronization with ACC
                </Typography>
                <StyledButton variant="contained" onClick={handleSetUserPress}>
                  Select User
                </StyledButton>
              </CardContent>
            </Card>
          </Grid>
        )}
        {synchronizationAccFtpInProgress === true && (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              width: "100%",
              padding: 4,
            }}
          >
            <H3 m={3}>Synchronization in Progress</H3>
            <Image
              src={
                currentSyncFile === "Synchronization Finished"
                  ? "/assets/images/syncDone.png"
                  : "/assets/images/uploading.gif"
              }
              width={800}
              height={493}
              style={{ objectFit: "contain" }}
            />
            <Box m={3}>{currentSyncFile}</Box>
          </Box>
        )}
        {synchronizationAccFtpInProgress === false &&
          currentUserName !== undefined && (
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title={"Configure FTP Access"}
                  subheader={"Set up FTP access to synchronize with ACC"}
                />
                <CardContent>
                  <Grid
                    spacing={2}
                    container
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <Grid item sm={4} xs={12}>
                      <TextField
                        fullWidth
                        color="primary"
                        size="medium"
                        name="ftp_host"
                        onChange={(event) => {
                          setFtpHost(event.target.value);
                        }}
                        value={ftpHost}
                        label="FTP Host"
                        disabled={ftpConnected}
                      />
                    </Grid>
                    <Grid item sm={3} xs={12}>
                      <TextField
                        fullWidth
                        color="primary"
                        size="medium"
                        name="ftp_username"
                        label="Username"
                        onChange={(event) => {
                          setFtpUsername(event.target.value);
                        }}
                        value={ftpUsername}
                        disabled={ftpConnected}
                      />
                    </Grid>
                    <Grid item sm={3} xs={12}>
                      <TextField
                        fullWidth
                        color="primary"
                        size="medium"
                        name="ftp_password"
                        label="Password"
                        onChange={(event) => {
                          setFtpPassword(event.target.value);
                        }}
                        value={ftpPassword}
                        disabled={ftpConnected}
                        type={"password"}
                      />
                    </Grid>
                    <Grid
                      item
                      sm={2}
                      xs={12}
                      sx={{ display: "flex", alignItems: "center" }}
                    >
                      <Button
                        fullWidth
                        disabled={synchronizationAccFtpInProgress === true}
                        onClick={
                          ftpConnected ? handleFTPDisconnect : handleFTPConnect
                        }
                      >
                        {ftpConnected ? "DISCONNECT" : "CONNECT"}
                      </Button>
                    </Grid>
                    <Grid item xs={12}>
                      {displayFTPErrorFeedback ? (
                        <Alert
                          onClose={handleCloseErrorSnackBar}
                          severity="error"
                          sx={{ width: "100%" }}
                        >
                          <AlertTitle>Error</AlertTitle>
                          {ftpErrorText}
                        </Alert>
                      ) : null}
                      {ftpConnected ? (
                        <Alert
                          //severity="error"
                          sx={{ width: "100%" }}
                        >
                          <AlertTitle>FTP Status</AlertTitle>
                          FTP Connected
                        </Alert>
                      ) : null}
                    </Grid>
                  </Grid>
                </CardContent>
              </Card>
            </Grid>
          )}
        {synchronizationAccFtpInProgress === false &&
          currentUserName !== undefined &&
          ftpConnected && (
            <Grid item xs={12}>
              <Card>
                {synchronizationAccFtpInProgress === true && (
                  <Grid item xs={12}>
                    <Alert severity={"info"}>
                      <AlertTitle>Synchronization In Progress</AlertTitle>
                      There is a synchronization in progress in another
                      instance, wait for it to finish to start a new one
                    </Alert>
                  </Grid>
                )}
                <CardHeader
                  title={"Configure FTP Sync"}
                  subheader={"Configure synchronization between ACC and FTP"}
                  action={
                    <Button
                      disabled={
                        selectedAccFolder === undefined ||
                        selectedFtpFolder === undefined ||
                        synchronizationAccFtpInProgress === true
                      }
                      onClick={handleSyncNowPress}
                    >
                      SYNC NOW
                    </Button>
                  }
                />
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Grid
                    spacing={2}
                    container
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <Grid item sm={4} xs={12}>
                      <Autocomplete
                        fullWidth
                        color="primary"
                        size="medium"
                        variant="outlined"
                        disablePortal
                        disabled={
                          accFtpSynchronizationStatus ===
                            "Synchronization Confirmed" ||
                          synchronizationAccFtpInProgress === true
                        }
                        value={
                          selectedAccFtpProject !== null
                            ? selectedAccFtpProject.label
                            : ""
                        }
                        options={
                          searchProjectByAccFtpText.length === 0
                            ? accProjects
                            : accProjects.filter((project) =>
                                project.label
                                  .toLowerCase()
                                  .includes(
                                    searchProjectByAccFtpText.toLowerCase()
                                  )
                              )
                        }
                        onChange={accFtpProjectSelected}
                        inputValue={searchProjectByAccFtpText}
                        onInputChange={(event, newInputValue) => {
                          setSearchProjectByAccFtpText(newInputValue);
                        }}
                        onOpen={handleProjectSelectorClick}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            color="primary"
                            size="medium"
                            variant="outlined"
                            label="ACC Project"
                            placeholder="Type to search"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item sm={4} xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="scopes-multiple-checkbox-label">
                          ACC Folder
                        </InputLabel>
                        <Select
                          fullWidth
                          labelId="scopes-multiple-checkbox-label"
                          id="scopes-multiple-checkbox"
                          color="primary"
                          size="medium"
                          label="ACC Folder"
                          onClick={handleACCFolderClick}
                          open={false}
                          disabled={
                            selectedAccFtpProject === null ||
                            accFtpSynchronizationStatus ===
                              "Synchronization Confirmed" ||
                            synchronizationAccFtpInProgress === true
                          }
                          value={
                            selectedAccFolder !== undefined
                              ? selectedAccFolder.label
                              : ""
                          }
                          renderValue={(selected) => selected}
                          input={<OutlinedInput label="ACC Folder" />}
                        ></Select>
                      </FormControl>
                    </Grid>
                    <Grid item sm={4} xs={12}>
                      <FormControl fullWidth>
                        <InputLabel id="scopes-multiple-checkbox-label">
                          FTP Folder
                        </InputLabel>
                        <Select
                          fullWidth
                          labelId="scopes-multiple-checkbox-label"
                          id="scopes-multiple-checkbox"
                          color="primary"
                          size="medium"
                          label="FTP Folder"
                          onClick={handleFTPFolderClick}
                          open={false}
                          disabled={
                            !ftpConnected ||
                            accFtpSynchronizationStatus ===
                              "Synchronization Confirmed" ||
                            synchronizationAccFtpInProgress === true
                          }
                          value={
                            selectedFtpFolder !== undefined
                              ? selectedFtpFolder.label
                              : ""
                          }
                          renderValue={(selected) => selected}
                          input={<OutlinedInput label="FTP Folder" />}
                        ></Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </CardContent>
                <Box
                  sx={{ marginInline: 2, borderTop: 2, borderColor: "#CCC" }}
                />
                <CardHeader
                  title={"Schedule Interval"}
                  subheader={"Set up the interval for synchronization"}
                />
                <CardContent>
                  <Grid
                    spacing={2}
                    container
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <Grid item xs={scheduleAccFtpInterval === "WEEKLY" ? 4 : 6}>
                      <FormControl fullWidth>
                        <InputLabel id="select-schedule-interval-label">
                          Interval
                        </InputLabel>
                        <Select
                          labelId="select-schedule-interval-label"
                          id="select-schedule-interval"
                          color="primary"
                          size="medium"
                          fullWidth
                          input={<OutlinedInput label="Interval" />}
                          value={scheduleAccFtpInterval}
                          onChange={handleScheduleIntervalChange}
                          disabled={
                            accFtpSynchronizationStatus ===
                              "Synchronization Confirmed" ||
                            synchronizationAccFtpInProgress === true
                          }
                        >
                          <MenuItem value={"DAILY"} key={0}>
                            DAILY
                          </MenuItem>
                          <MenuItem value={"WEEKLY"} key={1}>
                            WEEKLY
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    {scheduleAccFtpInterval === "WEEKLY" && (
                      <Grid item xs={4}>
                        <FormControl fullWidth>
                          <InputLabel id="select-schedule-weekday-label">
                            Week Day
                          </InputLabel>
                          <Select
                            labelId="select-schedule-weekday-label"
                            id="select-schedule-weekday"
                            color="primary"
                            size="medium"
                            fullWidth
                            input={<OutlinedInput label="Week Day" />}
                            value={intervalAccFtpWeekDay}
                            onChange={handleIntervalWeekdayChange}
                            disabled={
                              accFtpSynchronizationStatus ===
                                "Synchronization Confirmed" ||
                              synchronizationAccFtpInProgress === true
                            }
                          >
                            <MenuItem value={"Sunday"} key={0}>
                              Sunday
                            </MenuItem>
                            <MenuItem value={"Monday"} key={1}>
                              Monday
                            </MenuItem>
                            <MenuItem value={"Tuesday"} key={2}>
                              Tuesday
                            </MenuItem>
                            <MenuItem value={"Wednesday"} key={3}>
                              Wednesday
                            </MenuItem>
                            <MenuItem value={"Thursday"} key={4}>
                              Thursday
                            </MenuItem>
                            <MenuItem value={"Friday"} key={5}>
                              Friday
                            </MenuItem>
                            <MenuItem value={"Saturday"} key={6}>
                              Saturday
                            </MenuItem>
                          </Select>
                        </FormControl>
                      </Grid>
                    )}
                    <Grid item xs={scheduleAccFtpInterval === "WEEKLY" ? 4 : 6}>
                      <FormControl fullWidth>
                        <InputLabel id="select-schedule-hour-label">
                          Hour
                        </InputLabel>
                        <Select
                          labelId="select-schedule-hour-label"
                          id="select-schedule-hour"
                          color="primary"
                          size="medium"
                          fullWidth
                          input={<OutlinedInput label="Hour" />}
                          value={intervalAccFtpHour}
                          onChange={handleIntervalHourChange}
                          disabled={
                            accFtpSynchronizationStatus ===
                              "Synchronization Confirmed" ||
                            synchronizationAccFtpInProgress === true
                          }
                        >
                          {hours.map((hour, index) => (
                            <MenuItem key={index} value={hour}>
                              {hour}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={
                        accFtpSynchronizationStatus ===
                        "Synchronization Confirmed"
                          ? 6
                          : 12
                      }
                    >
                      <Alert
                        severity={
                          accFtpSynchronizationStatus ===
                            "You need to select an ACC project and a FTP folder to schedule the synchronization interval and hit the CONFIRM SCHEDULE button" ||
                          accFtpSynchronizationStatus === "Schedule unavailable"
                            ? "warning"
                            : "success"
                        }
                      >
                        <AlertTitle>Schedule Status</AlertTitle>
                        {accFtpSynchronizationStatus}
                      </Alert>
                    </Grid>
                    {accFtpSynchronizationStatus ===
                      "Synchronization Confirmed" && (
                      <Grid item xs={12} sm={6}>
                        <Alert severity={"info"}>
                          <AlertTitle>Last sync time</AlertTitle>
                          {lastSync === undefined ? "Never" : lastSync}
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
                <CardActions
                  sx={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    disabled={
                      selectedAccFolder === undefined ||
                      selectedFtpFolder === undefined ||
                      synchronizationAccFtpInProgress === true
                    }
                    onClick={
                      accFtpSynchronizationStatus ===
                      "Synchronization Confirmed"
                        ? handleCancelSynchronization
                        : handleConfirmSynchronization
                    }
                  >
                    {accFtpSynchronizationStatus === "Synchronization Confirmed"
                      ? "CANCEL SCHEDULE"
                      : "CONFIRM SCHEDULE"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )}

        {synchronizationAccProcoreInProgress === false &&
          currentUserName !== undefined && (
            <Grid item xs={12}>
              <Card>
                <CardHeader
                  title={"Configure Procore Sync"}
                  subheader={
                    "Configure synchronization between ACC and Procore"
                  }
                />
                <CardContent
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                  }}
                >
                  <Grid
                    spacing={2}
                    container
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <Grid item sm={6} xs={12}>
                      <Autocomplete
                        fullWidth
                        color="primary"
                        size="medium"
                        variant="outlined"
                        disablePortal
                        disabled={
                          accProcoreSynchronizationStatus ===
                          "Synchronization Confirmed"
                        }
                        value={
                          selectedAccProcoreProject !== null
                            ? selectedAccProcoreProject.label
                            : ""
                        }
                        options={
                          searchProjectByAccProcoreText.length === 0
                            ? accProjects
                            : accProjects.filter((project) =>
                                project.label
                                  .toLowerCase()
                                  .includes(
                                    searchProjectByAccProcoreText.toLowerCase()
                                  )
                              )
                        }
                        onChange={accProcoreProjectSelected}
                        inputValue={searchProjectByAccProcoreText}
                        onInputChange={(event, newInputValue) => {
                          setSearchProjectByAccProcoreText(newInputValue);
                        }}
                        onOpen={handleProjectSelectorClick}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            color="primary"
                            size="medium"
                            variant="outlined"
                            label="ACC Project"
                            placeholder="Type to search"
                          />
                        )}
                      />
                    </Grid>
                    <Grid item sm={6} xs={12}>
                      <Autocomplete
                        fullWidth
                        color="primary"
                        size="medium"
                        variant="outlined"
                        disablePortal
                        disabled={
                          accProcoreSynchronizationStatus ===
                          "Synchronization Confirmed"
                        }
                        value={
                          selectedProcoreProject !== null
                            ? selectedProcoreProject.label
                            : ""
                        }
                        options={
                          searchProjectByProcoreText.length === 0
                            ? procoreProjects
                            : procoreProjects.filter((project) =>
                                project.label
                                  .toLowerCase()
                                  .includes(
                                    searchProjectByProcoreText.toLowerCase()
                                  )
                              )
                        }
                        onChange={procoreProjectSelected}
                        inputValue={searchProjectByProcoreText}
                        onInputChange={(event, newInputValue) => {
                          setSearchProjectByProcoreText(newInputValue);
                        }}
                        //onOpen={handleProcoreProjectSelectorClick}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            fullWidth
                            color="primary"
                            size="medium"
                            variant="outlined"
                            label="Procore Project"
                            placeholder="Type to search"
                          />
                        )}
                      />
                    </Grid>
                  </Grid>
                </CardContent>
                <Box
                  sx={{ marginInline: 2, borderTop: 2, borderColor: "#CCC" }}
                />
                <CardHeader
                  title={"Schedule Interval"}
                  subheader={"Set up the interval for synchronization"}
                />
                <CardContent>
                  <Grid
                    spacing={2}
                    container
                    sx={{ display: "flex", justifyContent: "center" }}
                  >
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel id="select-schedule-interval-label">
                          Interval
                        </InputLabel>
                        <Select
                          labelId="select-schedule-interval-label"
                          id="select-schedule-interval"
                          color="primary"
                          size="medium"
                          fullWidth
                          input={<OutlinedInput label="Interval" />}
                          value={scheduleAccProcoreInterval}
                          onChange={handleProcoreScheduleIntervalChange}
                          disabled={
                            accProcoreSynchronizationStatus ===
                            "Synchronization Confirmed"
                          }
                        >
                          <MenuItem value={"EVERY_X_HOUR"} key={0}>
                            EVERY X HOURS
                          </MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={6}>
                      <FormControl fullWidth>
                        <InputLabel id="select-schedule-hour-label">
                          Hour
                        </InputLabel>
                        <Select
                          labelId="select-schedule-hour-label"
                          id="select-schedule-hour"
                          color="primary"
                          size="medium"
                          fullWidth
                          input={<OutlinedInput label="Hour" />}
                          value={intervalAccProcoreHour}
                          onChange={handleProcoreIntervalHourChange}
                          disabled={
                            accProcoreSynchronizationStatus ===
                            "Synchronization Confirmed"
                          }
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map(
                            (hour, index) => (
                              <MenuItem key={index} value={hour}>
                                {hour}
                              </MenuItem>
                            )
                          )}
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid
                      item
                      xs={12}
                      sm={
                        accProcoreSynchronizationStatus ===
                        "Synchronization Confirmed"
                          ? 6
                          : 12
                      }
                    >
                      <Alert
                        severity={
                          accProcoreSynchronizationStatus ===
                            "You need to select an ACC project and a Procore project to schedule the synchronization interval and hit the CONFIRM SCHEDULE button" ||
                          accProcoreSynchronizationStatus ===
                            "Schedule unavailable"
                            ? "warning"
                            : "success"
                        }
                      >
                        <AlertTitle>Schedule Status</AlertTitle>
                        {accProcoreSynchronizationStatus}
                      </Alert>
                    </Grid>
                    {accProcoreSynchronizationStatus ===
                      "Synchronization Confirmed" && (
                      <Grid item xs={12} sm={6}>
                        <Alert severity={"info"}>
                          <AlertTitle>Last sync time</AlertTitle>
                          {lastSyncProcore === undefined ? "Never" : lastSync}
                        </Alert>
                      </Grid>
                    )}
                  </Grid>
                </CardContent>
                <CardActions
                  sx={{ display: "flex", justifyContent: "flex-end" }}
                >
                  <Button
                    disabled={
                      true ||
                      selectedAccProcoreProject === undefined ||
                      selectedProcoreProject === undefined ||
                      synchronizationAccProcoreInProgress === true
                    }
                    onClick={
                      accProcoreSynchronizationStatus ===
                      "Synchronization Confirmed"
                        ? handleProcoreCancelSynchronization
                        : handleProcoreConfirmSynchronization
                    }
                  >
                    {accProcoreSynchronizationStatus ===
                    "Synchronization Confirmed"
                      ? "CANCEL SCHEDULE"
                      : "CONFIRM SCHEDULE"}
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          )}
      </Grid>
    </Box>
  );
}
