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
import { H2, H3, H4 } from "../components/Typography";

import { useCookies } from "react-cookie";

import Onboarding from "@/components/Onboarding";
import { useAppContext } from "@/contexts/appContext";
import { useRouter } from "next/router";

export type Connection = {
  procoreProject?: ProcoreProject | null;
  accProjects?: ACCProject[] | null;
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
    // if (!cookies.procore_token) {
    //   setSettedUp("missing_procore");
    //   console.log("Missing Procore");
    //   router.push("/api/oauth/procore/login");
    // } else

    if (!cookies.acc_token) {
      setSettedUp("missing_acc");
      console.log("MISSING ACC");
      // router.push("/api/acc/auth/login");
    } else {
      // fetch("/api/acc/getProjects").then((res) => {
      //   res.json().then((data) => {
      //     setStateAccProjects(data);
      //   });
      // });
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
          This tool automatically syncs projects between Procore and ACC, in a
          case the system does not find the desired project, you can change it
          on this screen selecting an Procore and a ACC project in the same
          line. <br />
          <br />
          The left side of the screen is <b>locked</b> to Procore projects, and
          the right side is up for editing of ACC projects.
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
            <h3 style={{ textAlign: "center" }}>Procore</h3>
          </div>

          <div
            style={{
              flexGrow: 1,
            }}
          >
            <h3 style={{ textAlign: "center" }}>ACC</h3>
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
              </div>

              <div>
                <SettingsEthernetIcon
                  color={
                    !connection.procoreProject ||
                    !connection.accProjects?.length ||
                    connection.accProjects?.length < 1 ||
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
                    <Autocomplete
                      multiple
                      id="tags-standard"
                      options={accProjects.map((p) => p.attributes.name)}
                      getOptionLabel={(option) => option}
                      defaultValue={connection.accProjects?.map(
                        (p) => p.attributes.name
                      )}
                      sx={{ width: "400px" }}
                      onChange={(e, value) => {
                        const newConnections = [...connections];

                        // make it based on connections index
                        newConnections[index].accProjects = accProjects.filter(
                          (p) => value.includes(p.attributes.name)
                        );

                        setConnections(newConnections);
                      }}
                      renderInput={(params) => (
                        <TextField
                          {...params}
                          label={"ACC Projects"}
                          variant="outlined"
                        />
                      )}
                    />
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
      {/* @ts-ignore */}
      <H3>Sync - Devbox</H3>
      {/* @ts-ignore */}
      <H4>Syncs OFCDesk Development ACC Files with FTP</H4>
      <Button
        variant="contained"
        color="info"
        // run sync button
        onClick={() => {
          fetch("/api/syncFTP", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          }).then((res) => {
            res.json().then((data) => {
              console.log(data);
            });
          });
        }}
      >
        Sync Dev
      </Button>
    </>
  );
}
