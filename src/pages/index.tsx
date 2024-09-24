import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet";
import {
  Autocomplete,
  Box,
  Button,
  Container,
  styled,
  TextField,
} from "@mui/material";
import { Fragment, ReactNode, useEffect, useState } from "react";
import DashboardNavbar from "../components/DashboardNavbar";
import DashboardSidebar from "../components/DashboardSidebar"; // styled components
import MuiAutosuggest from "../components/Mui-AutoSuggest";
import { H2 } from "../components/Typography";

import { useCookies } from "react-cookie";

import Onboarding from "@/components/Onboarding";
import { useAppContext } from "@/contexts/appContext";
import { useRouter } from "next/router";
import { Server } from "./ftp-servers";

export type ACCFolder = {
  type: string;
  id: string;
  attributes: {
    name: string;
    parentFolder: string;
    folderPath: string;
    folderType: string;
    folderId: string;
    folderPathId: string;
    folderPathName: string;
    folderPathType: string;
    folderPathParentFolder: string;
  };
  links: {
    self: {
      href: string;
    };
    webView: {
      href: string;
    };
  };
};

export type Connection = {
  procoreProject?: ProcoreProject | null;
  accProject?: ACCProject | null;
  accFolder?: ACCFolder | null;
  server?: Server | null;
};

export type ProcoreProject = {
  id: string;
  name: string;
};

export type ACCProject = {
  type: string;
  id: string;
  attributes: {
    name: string;
    scopes: Array<string>;
    extension: {
      type: string;
      version: string;
      schema: {
        href: string;
      };
      data: {
        projectType: string;
      };
    };
  };
  links: {
    self: {
      href: string;
    };
    webView: {
      href: string;
    };
  };
  relationships: {
    hub: {
      data: {
        type: string;
        id: string;
      };
      links: {
        related: {
          href: string;
        };
      };
    };
    rootFolder: {
      data: {
        type: string;
        id: string;
      };
      meta: {
        link: {
          href: string;
        };
      };
    };
    topFolders: {
      links: {
        related: {
          href: string;
        };
      };
    };
    issues: {
      data: {
        type: string;
        id: string;
      };
      meta: {
        link: {
          href: string;
        };
      };
    };
    submittals: {
      data: {
        type: string;
        id: string;
      };
      meta: {
        link: {
          href: string;
        };
      };
    };
    rfis: {
      data: {
        type: string;
        id: string;
      };
      meta: {
        link: {
          href: string;
        };
      };
    };
    markups: {
      data: {
        type: string;
        id: string;
      };
      meta: {
        link: {
          href: string;
        };
      };
    };
    checklists: {
      data: {
        type: string;
        id: string;
      };
      meta: {
        link: {
          href: string;
        };
      };
    };
    cost: {
      data: {
        type: string;
        id: string;
      };
      meta: {
        link: {
          href: string;
        };
      };
    };
    locations: {
      data: {
        type: string;
        id: string;
      };
      meta: {
        link: {
          href: string;
        };
      };
    };
  };
};

// @ts-ignore
export const BodyWrapper = styled(Box)(({ theme, compact }) => ({
  transition: "margin-left 0.3s",
  marginLeft: compact ? "86px" : "280px",
  [theme.breakpoints.down("lg")]: {
    marginLeft: 0,
  },
}));
export const InnerWrapper = styled(Box)(({ theme }) => ({
  transition: "all 0.3s",
  [theme.breakpoints.up("lg")]: {
    maxWidth: 1200,
    margin: "auto",
  },
  [theme.breakpoints.down(1550)]: {
    paddingLeft: "2rem",
    paddingRight: "2rem",
  },
})); // ======================================================

const VendorDashboardLayout = ({ children }: { children: ReactNode }) => {
  const [sidebarCompact, setSidebarCompact] = useState(0);
  const [showMobileSideBar, setShowMobileSideBar] = useState(0); // handle sidebar toggle for desktop device

  const handleCompactToggle = () =>
    setSidebarCompact((state) => (state ? 0 : 1)); // handle sidebar toggle in mobile device

  const handleMobileDrawerToggle = () =>
    setShowMobileSideBar((state) => (state ? 0 : 1));

  return (
    <Fragment>
      <DashboardSidebar
        sidebarCompact={sidebarCompact}
        showMobileSideBar={showMobileSideBar}
        setSidebarCompact={handleCompactToggle}
        setShowMobileSideBar={handleMobileDrawerToggle}
      />

      {/* @ts-ignore */}
      <BodyWrapper compact={sidebarCompact ? 1 : 0}>
        <DashboardNavbar handleDrawerToggle={handleMobileDrawerToggle} />
        <InnerWrapper>{children}</InnerWrapper>
      </BodyWrapper>
    </Fragment>
  );
};

Home.getLayout = function getLayout(page: ReactNode) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};

export default function Home() {
  const [servers, setServers] = useState<Server[]>([]);

  const { state, dispatch } = useAppContext();

  const [settedUp, setSettedUp] = useState<
    "missing_procore" | "missing_acc" | true | "loading"
  >("loading");

  const [cookies] = useCookies(["procore_token", "acc_token"]);

  const router = useRouter();

  const setStateAccProjects = (p: any) =>
    // @ts-ignore
    dispatch({
      type: "SET_ACC_PROJECTS",
      payload: p,
    });

  useEffect(() => {
    if (!cookies.procore_token) {
      setSettedUp("missing_procore");
      console.log("Missing Procore");
      router.push("/api/oauth/procore/login");
    } else if (!cookies.acc_token) {
      setSettedUp("missing_acc");
      console.log("MISSING ACC");
      // router.push("/api/acc/auth/login");
    } else {
      fetch("/api/acc/getProjects").then((res) => {
        res.json().then((data) => {
          setStateAccProjects(data);
        });
      });
      setSettedUp(true);
    }
  }, []);

  const [procoreProjects, setProcoreProjects] = useState<ProcoreProject[]>([]);
  const [accProjects, setAccProjects] = useState<ACCProject[]>([]);

  const [connections, setConnections] = useState<Connection[]>([]);

  const addNewConnection = () => {
    setConnections((state) => [
      ...state,
      {
        procoreProject: null,
        accProjects: [],
      },
    ]);
  };

  useEffect(() => {
    state.companyProjects.map(
      (procoreProject: { id: string; name: string }) => {
        setProcoreProjects((state) => [
          ...state,
          {
            id: procoreProject.id,
            name: procoreProject.name,
          },
        ]);
      }
    );
  }, [state.companyProjects]);

  useEffect(() => {
    if (state.selectedCompanyId) {
      fetch(
        "/api/connections/getConnections?companyId=" + state.selectedCompanyId
      )
        .then((res) => res.json())
        .then((data) => {
          if (data.length < 1) {
            setConnections(
              state.companyProjects.map(
                (project: { id: string; name: string }) => ({
                  procoreProject: {
                    id: project.id,
                    name: project.name,
                  },
                  accProjects: [],
                })
              )
            );
          } else {
            setConnections(data);
          }
        });

      fetch("/api/servers/getServers?companyId=" + state.selectedCompanyId)
        .then((res) => res.json())
        .then((data) => {
          if (data.length < 1) {
            setServers(
              servers.concat({
                ip: "",
                name: "",
                id: "",
                serverPort: undefined,
                username: undefined,
                password: undefined,
              } as Server)
            );
          } else {
            setServers(data);
          }
        });
    }
  }, [state.selectedCompanyId]);

  useEffect(() => {
    setAccProjects(state.accProjects);
  }, [state.accProjects]);

  if (settedUp != true && settedUp != "loading") {
    return (
      <div className="py-12">
        <Onboarding
          step={settedUp}
          selectedCompanyId={state.selectedCompanyId}
        />
      </div>
    );
  }

  return state.selectedCompanyId ? (
    <>
      <main
        style={{
          paddingTop: "2rem",
        }}
      >
        {/* @ts-ignore */}
        <H2>Project Linking</H2>
        <Container
          sx={{
            backgroundColor: "#EBEBEB",
            borderRadius: "0.563rem",
            padding: "1rem",
            marginTop: "1.5rem",
          }}
        >
          {/* @ts-ignore */}
          <H2>How to use?</H2>
          This tool automatically syncs projects between Procore ACC, and FTP in
          a case the system does not find the desired project, you can change it
          on this screen selecting an Procore and a ACC project in the same
          line. <br />
          <br />
          <strong>Procore Project:</strong> Select the Procore project you want
          to sync. <br />
          <strong>ACC Project:</strong> Select the ACC project you want to sync
          with the Procore project. <br />
          <br />
          <strong>FTP Server:</strong> Select the FTP server you want to sync
          with the ACC Files. <br />
          <strong>ACC Folder:</strong> Select the ACC folder you want to sync
          send the FTP Files. <br />
        </Container>
        <div
          style={{
            gap: "1rem",
            flexDirection: "row",
            display: "flex",
            alignItems: "center",
            margin: "auto",
          }}
        >
          <div
            style={{
              flexGrow: 1,
            }}
          >
            <h3 style={{ textAlign: "center" }}>Projects</h3>
          </div>

          <div
            style={{
              flexGrow: 1,
            }}
          >
            <h3 style={{ textAlign: "center" }}>Storage</h3>
          </div>
        </div>
        <div
          style={{
            paddingBottom: "5rem",
          }}
        >
          {connections.map((connection, index) => (
            <div
              key={connection.procoreProject?.id + "_" + index}
              style={{
                gap: "1rem",
                flexDirection: "row",
                display: "flex",
                alignItems: "center",
                margin: "auto",
              }}
            >
              <div
                style={{
                  flexGrow: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "1rem",
                    height: "100%",
                    gap: "1.2rem",
                  }}
                >
                  <MuiAutosuggest
                    cohortIndex={index}
                    label={"Procore Project"}
                    options={procoreProjects.map((p) => p.name)}
                    value={connection.procoreProject?.name ?? ""}
                    handler={(e: any, value: any) => {
                      const newConnections = [...connections];

                      newConnections[index].procoreProject =
                        procoreProjects.find((p) => p.name === value);

                      setConnections(newConnections);
                    }}
                    input={connection.procoreProject}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "1.2rem",
                    padding: "1rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "1rem",
                      height: "100%", // Ensure this is consistent on both sides
                      gap: "1.2rem",
                    }}
                  >
                    <MuiAutosuggest
                      cohortIndex={index}
                      label={"ACC Project"}
                      options={accProjects.map((p) => p.attributes.name)}
                      value={connection.accProject?.attributes.name ?? ""}
                      handler={(e: any, value: any) => {
                        const newConnections = [...connections];

                        newConnections[index].accProject = accProjects.find(
                          (p) => p.attributes.name === value
                        );

                        setConnections(newConnections);
                      }}
                      input={connection.procoreProject}
                    />
                  </div>
                </div>
              </div>

              <div>
                <SettingsEthernetIcon
                  color={
                    !connection.procoreProject ||
                    !connection.accProject ||
                    connections.filter(
                      (c) =>
                        c.procoreProject?.id === connection.procoreProject?.id
                    ).length > 1
                      ? "error"
                      : "success"
                  }
                  fontSize="large"
                />
              </div>

              <div
                style={{
                  flexGrow: 1,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "1rem",
                    gap: "1.2rem",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "1.2rem",
                      padding: "1rem",
                    }}
                  >
                    <MuiAutosuggest
                      cohortIndex={index}
                      label={"FTP Server"}
                      options={servers.map((p) => p.name)}
                      value={connection?.server?.name ?? ""}
                      handler={(e: any, value: any) => {
                        const newConnections = [...connections];

                        newConnections[index].server = servers.find(
                          (p) => p.name === value
                        );

                        setConnections(newConnections);
                      }}
                      input={connection.procoreProject}
                    />
                    <Button
                      color="error"
                      variant="contained"
                      sx={{
                        visibility: "hidden",
                      }}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
                <div
                  style={{
                    flexGrow: 1,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      padding: "1rem",
                      gap: "1.2rem",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: "1.2rem",
                        padding: "1rem",
                      }}
                    >
                      <Autocomplete
                        id="tags-standard"
                        options={accProjects.map((p) => p.attributes.name)}
                        getOptionLabel={(option) => option}
                        disabled={!connection.accProject}
                        sx={{ width: "400px" }}
                        defaultValue={connection.accProject?.attributes.name}
                        onChange={(e, value) => {
                          const newConnections = [...connections];

                          newConnections[index].accFolder = {
                            type: "folders",
                            id: "1",
                            attributes: {
                              name: value ?? "",
                              parentFolder: "1",
                              folderPath: "1",
                              folderType: "1",
                              folderId: "1",
                              folderPathId: "1",
                              folderPathName: "1",
                              folderPathType: "1",
                              folderPathParentFolder: "1",
                            },
                            links: {
                              self: {
                                href: "1",
                              },
                              webView: {
                                href: "1",
                              },
                            },
                          };

                          setConnections(newConnections);
                        }}
                        renderInput={(params) => (
                          <TextField
                            {...params}
                            label={"ACC Folder"}
                            variant="outlined"
                          />
                        )}
                      />
                      <Button color="success" variant="contained">
                        Sync
                      </Button>
                      <Button
                        color="error"
                        variant="contained"
                        onClick={() => {
                          const newConnections = [...connections];
                          newConnections.splice(index, 1);
                          setConnections(newConnections);
                        }}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
            position: "fixed",
            bottom: "2rem",
            left: "50%",
            gap: "1rem",
          }}
        >
          <Button variant="contained" color="info" onClick={addNewConnection}>
            Add Connection
          </Button>
          <Button
            variant="contained"
            color="info"
            onClick={() => {
              fetch("/api/connections/saveConnections", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({
                  connections,
                  companyId: state.selectedCompanyId,
                }),
              }).then((res) => {
                res.json().then((data) => {
                  console.log(data);
                });
              });
            }}
          >
            Save Connections
          </Button>
        </div>
      </main>
    </>
  ) : (
    <>
      <main>
        {/*@ts-ignore*/}
        <H2>Select a Company</H2>
      </main>
    </>
  );
}
