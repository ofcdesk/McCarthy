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
  const [searchProjectByText, setSearchProjectByText] = useState("");
  const [accProjects, setAccProjects] = useState([]);
  const [selectedAccProject, setSelectedAccProject] = useState(null);
  const [synchronizationStatus, setSynchronizationStatus] = useState(
    //"You need to select an ACC project and a FTP folder to schedule the synchronization interval and hit the CONFIRM SCHEDULE button"
    "Schedule unavailable"
  );
  const [scheduleInterval, setScheduleInterval] = useState("DAILY");
  const [intervalHour, setIntervalHour] = useState("12 AM");
  const [intervalWeekDay, setIntervalWeekDay] = useState("Monday");
  const [lastSync, setLastSync] = useState(undefined);
  const [synchronizationInProgress, setSynchronizationInProgress] =
    useState(false);
  const [
    otherInstanceSynchronizationInProgress,
    setOtherInstanceSynchronizationInProgress,
  ] = useState(false);
  const [currentSyncFile, setCurrentSyncFile] = useState("Loading File...");
  const [displaySyncErrorFeedback, setDisplaySyncErrorFeedback] = useState("");

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (event) => {
      if (synchronizationInProgress) {
        const message =
          "Synchronization is in progress. If you close the page, the synchronization will stop.";
        event.preventDefault();
        event.returnValue = message;
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [synchronizationInProgress]);

  useEffect(() => {
    const timerId = setInterval(() => {
      axios.get("/api/synchronization-in-progress-status").then((response) => {
        if (response !== undefined && response.data.status === true) {
          const currentTime = new Date().getTime();
          const differenceInMinutes =
            (currentTime - response.data.lastDate) / (1000 * 60);
          if (differenceInMinutes < 60) {
            //The user could have closed the page and the synchronization would be stuck
            setOtherInstanceSynchronizationInProgress(true);
          } else {
            setOtherInstanceSynchronizationInProgress(false);
          }
        } else {
          setOtherInstanceSynchronizationInProgress(false);
        }
      });
    }, 3000);
    return () => {
      clearInterval(timerId);
    };
  }, []);

  const fetchData = async () => {
    setFetching(true);
    let URL = "/api/current-user-profile";
    let response = (await axios.get(URL)).data;

    setCurrentUserPicture(response.userPicture || "");
    setCurrentUserName(response.userName || undefined);
    setCurrentUserEmail(response.userEmail || "");

    const currentUserEmail = response.userEmail || "null";

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

    setUserPicture(response.userPicture);
    setUserName(response.userName);
    setUserEmail(response.userEmail);

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
        setSelectedAccProject({
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
        setScheduleInterval(response.interval);
        setIntervalWeekDay(response.weekday);
        setIntervalHour(response.hour);
        setSynchronizationStatus("Synchronization Confirmed");
        setLastSync(response.lastSync);
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
    if (!ftpConnected || otherInstanceSynchronizationInProgress === true) {
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
    if (selectedAccProject === null) {
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
          hubId: selectedAccProject.relationships.hub.data.id,
          projectId: selectedAccProject.id,
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
      setSearchProjectByText("");
      setSelectedAccProject(null);
      setSynchronizationStatus(
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
            hubId: selectedAccProject.relationships.hub.data.id,
            projectId: selectedAccProject.id,
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

  const accProjectSelected = (event, project) => {
    setSelectedAccProject(project);
    console.log(project);
  };

  const handleScheduleIntervalChange = (event) => {
    const {
      target: { value },
    } = event;
    setScheduleInterval(value);
  };

  const handleIntervalHourChange = (event) => {
    const {
      target: { value },
    } = event;
    setIntervalHour(value);
  };

  const handleIntervalWeekdayChange = (event) => {
    const {
      target: { value },
    } = event;
    setIntervalWeekDay(value);
  };

  const handleConfirmSynchronization = async () => {
    setFetchingText("Confirming Synchronization");
    setFetching(true);
    try {
      await axios.post("/api/confirm-synchronization", {
        hubId: selectedAccProject.relationships.hub.data.id,
        projectId: selectedAccProject.id,
        projectName: selectedAccProject.label,
        accFolderPath: {
          id: selectedAccFolder.id,
          label: selectedAccFolder.label,
          accId: selectedAccFolder.accId,
        },
        ftpFolderPath: {
          id: selectedFtpFolder.id,
          label: selectedFtpFolder.label,
        },
        interval: scheduleInterval,
        weekDay: intervalWeekDay,
        hour: intervalHour,
      });
      setSynchronizationStatus("Synchronization Confirmed");
    } catch (err) {
      console.log("Error confirming synchronization");
      console.log(err);
      setSynchronizationStatus("Error confirming synchronization");
    }
    setFetching(false);
  };

  const handleCancelSynchronization = async () => {
    setFetchingText("Canceling Synchronization");
    setFetching(true);
    try {
      await axios.post("/api/cancel-synchronization");
      setSynchronizationStatus(
        "You need to select an ACC project and a FTP folder to schedule the synchronization interval and hit the CONFIRM SCHEDULE button"
      );
    } catch (err) {
      console.log("Error canceling synchronization");
      console.log(err);
      setSynchronizationStatus("Error canceling synchronization");
    }
    setFetching(false);
  };

  const synchronizeItem = async (ftpPath, accPath, accFolderId) => {
    const stack = [{ ftpPath, accPath, accFolderId }];

    while (stack.length > 0) {
      const { ftpPath, accPath, accFolderId } = stack.pop();

      try {
        const response = (
          await axios.post("/api/ftp-folders", {
            path: ftpPath,
            foldersOnly: false,
          })
        ).data;

        for (const item of response) {
          setCurrentSyncFile(`Syncing ${item.name} from FTP to ACC`);

          try {
            const accResponse = (
              await axios.post("/api/synchronize-item", {
                hubId: selectedAccProject.relationships.hub.data.id,
                projectId: selectedAccProject.id,
                ftpPath: ftpPath,
                accPath: accPath,
                accFolderId: accFolderId,
                fileName: item.name,
                isFolder: item.isDirectory,
                lastDate: item.rawModifiedAt,
              })
            ).data;

            if (item.isDirectory && accResponse !== "Error") {
              // Push the directory onto the stack for later processing
              stack.push({
                ftpPath: `${ftpPath}/${item.name}`,
                accPath: `${accPath}/${item.name}`,
                accFolderId: accResponse,
              });
            }

            if (accResponse === "Error") {
              continue;
            }

            let actualStatus = (await axios.get("/api/synchronization-status"))
              .data;
            if (
              actualStatus.status !== undefined &&
              actualStatus.file !== undefined &&
              actualStatus.error !== undefined &&
              actualStatus.uploadCompleted !== undefined
            ) {
              while (
                actualStatus.uploadCompleted === false &&
                actualStatus.error === false
              ) {
                setCurrentSyncFile(
                  actualStatus.file + "\n" + actualStatus.status
                );
                await new Promise((resolve) => setTimeout(resolve, 1000));
                actualStatus = (await axios.get("/api/synchronization-status"))
                  .data;
              }
            }
          } catch (err) {
            console.log("Error on item: " + item.name);
            console.log(err);
          }
        }
      } catch (err) {
        console.log("Error during synchronization:", err);
      }
    }
  };

  const handleSyncNowPress = async () => {
    setSynchronizationInProgress(true);
    setCurrentSyncFile("Reading FTP Folder");

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
      await synchronizeItem(
        selectedFtpFolder.id,
        `Project Files/${selectedAccFolder.id}`,
        selectedAccFolder.accId
      );
    } catch (err) {
      console.log("Error starting synchronization");
      console.log(err);
    }

    try {
      await axios.post("/api/finish-synchronization");
    } catch (err) {
      console.log("Error finishing synchronization");
      console.log(err);
    }

    setCurrentSyncFile("Synchronization Finished");
  };

  const handleCloseInProgressSynchronization = () => {
    setSynchronizationInProgress(false);
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
      <Dialog open={synchronizationInProgress}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            minWidth: 500,
            padding: 4,
          }}
        >
          <Image
            src={
              currentSyncFile === "Synchronization Finished"
                ? "/assets/images/syncDone.png"
                : "/assets/images/uploading.gif"
            }
            width={300}
            height={185}
            style={{ objectFit: "contain" }}
          />
          <Box m={3}>{currentSyncFile}</Box>
          <Button
            onClick={handleCloseInProgressSynchronization}
            disabled={currentSyncFile !== "Synchronization Finished"}
          >
            CONFIRM
          </Button>
        </Box>
      </Dialog>
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
        {currentUserName !== undefined && (
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
                      disabled={otherInstanceSynchronizationInProgress === true}
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
        {currentUserName !== undefined && ftpConnected && (
          <Grid item xs={12}>
            <Card>
              {otherInstanceSynchronizationInProgress === true && (
                <Grid item xs={12}>
                  <Alert severity={"info"}>
                    <AlertTitle>Synchronization In Progress</AlertTitle>
                    There is a synchronization in progress in another instance,
                    wait for it to finish to start a new one
                  </Alert>
                </Grid>
              )}
              <CardHeader
                title={"Configure Project Sync"}
                subheader={"Configure synchronization between ACC and FTP"}
                action={
                  <Button
                    disabled={
                      selectedAccFolder === undefined ||
                      selectedFtpFolder === undefined ||
                      otherInstanceSynchronizationInProgress === true
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
                        synchronizationStatus === "Synchronization Confirmed" ||
                        otherInstanceSynchronizationInProgress === true
                      }
                      value={
                        selectedAccProject !== null
                          ? selectedAccProject.label
                          : ""
                      }
                      options={
                        searchProjectByText.length === 0
                          ? accProjects
                          : accProjects.filter((project) =>
                              project.label
                                .toLowerCase()
                                .includes(searchProjectByText.toLowerCase())
                            )
                      }
                      onChange={accProjectSelected}
                      inputValue={searchProjectByText}
                      onInputChange={(event, newInputValue) => {
                        setSearchProjectByText(newInputValue);
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
                          selectedAccProject === null ||
                          synchronizationStatus ===
                            "Synchronization Confirmed" ||
                          otherInstanceSynchronizationInProgress === true
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
                          synchronizationStatus ===
                            "Synchronization Confirmed" ||
                          otherInstanceSynchronizationInProgress === true
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
                  <Grid item xs={scheduleInterval === "WEEKLY" ? 4 : 6}>
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
                        value={scheduleInterval}
                        onChange={handleScheduleIntervalChange}
                        disabled={
                          synchronizationStatus ===
                            "Synchronization Confirmed" ||
                          otherInstanceSynchronizationInProgress === true
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
                  {scheduleInterval === "WEEKLY" && (
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
                          value={intervalWeekDay}
                          onChange={handleIntervalWeekdayChange}
                          disabled={
                            synchronizationStatus ===
                              "Synchronization Confirmed" ||
                            otherInstanceSynchronizationInProgress === true
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
                  <Grid item xs={scheduleInterval === "WEEKLY" ? 4 : 6}>
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
                        value={intervalHour}
                        onChange={handleIntervalHourChange}
                        disabled={
                          synchronizationStatus ===
                            "Synchronization Confirmed" ||
                          otherInstanceSynchronizationInProgress === true
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
                      synchronizationStatus === "Synchronization Confirmed"
                        ? 6
                        : 12
                    }
                  >
                    <Alert
                      severity={
                        synchronizationStatus ===
                          "You need to select an ACC project and a FTP folder to schedule the synchronization interval and hit the CONFIRM SCHEDULE button" ||
                        synchronizationStatus === "Schedule unavailable"
                          ? "warning"
                          : "success"
                      }
                    >
                      <AlertTitle>Schedule Status</AlertTitle>
                      {synchronizationStatus}
                    </Alert>
                  </Grid>
                  {synchronizationStatus === "Synchronization Confirmed" && (
                    <Grid item xs={12} sm={6}>
                      <Alert severity={"info"}>
                        <AlertTitle>Last sync time</AlertTitle>
                        {lastSync === undefined ? "Never" : lastSync}
                      </Alert>
                    </Grid>
                  )}
                </Grid>
              </CardContent>
              <CardActions sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button
                  disabled={
                    true
                    //false
                    //selectedAccFolder === undefined ||
                    //selectedFtpFolder === undefined ||
                    //otherInstanceSynchronizationInProgress === true
                  }
                  onClick={
                    synchronizationStatus === "Synchronization Confirmed"
                      ? handleCancelSynchronization
                      : handleConfirmSynchronization
                  }
                >
                  {synchronizationStatus === "Synchronization Confirmed"
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
