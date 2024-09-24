import {
  Box,
  Container,
  Dialog,
  DialogContent,
  DialogTitle,
  styled,
} from "@mui/material";
import { Fragment, ReactNode, useEffect, useState } from "react";
import DashboardNavbar, {
  StyledInputBase,
} from "../components/DashboardNavbar";
import DashboardSidebar from "../components/DashboardSidebar";

import { useAppContext } from "@/contexts/appContext";
import SettingsEthernetIcon from "@mui/icons-material/SettingsEthernet";
import { Button } from "@mui/material";
import { useRouter } from "next/router";
import { useCookies } from "react-cookie";

type Props = {};

// @ts-ignore
const BodyWrapper = styled(Box)(({ theme, compact }) => ({
  transition: "margin-left 0.3s",
  marginLeft: compact ? "86px" : "280px",
  [theme.breakpoints.down("lg")]: {
    marginLeft: 0,
  },
}));
const InnerWrapper = styled(Box)(({ theme }) => ({
  transition: "all 0.3s",
  [theme.breakpoints.up("lg")]: {
    maxWidth: 1200,
    margin: "auto",
  },
  [theme.breakpoints.down(1550)]: {
    paddingLeft: "2rem",
    paddingRight: "2rem",
  },
}));

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

Page.getLayout = function getLayout(page: ReactNode) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};

export type Server = {
  ip: string;
  name: string;
  id: string;
  serverPort?: number;
  username?: string;
  password?: string;
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

export default function Page({}: Props) {
  const [servers, setServers] = useState<Server[]>([]);

  const [cookies] = useCookies(["procore_token", "acc_token"]);
  const router = useRouter();

  const [server, setServer] = useState<Server>({
    ip: "",
    name: "",
    id: "",
    serverPort: undefined,
    username: undefined,
    password: undefined,
  });

  const { state, dispatch } = useAppContext();

  const [settedUp, setSettedUp] = useState<
    "missing_procore" | "missing_acc" | true | "loading"
  >("loading");

  // const setStateAccProjects = (p: any) =>
  //   // @ts-ignore
  //   dispatch({
  //     type: "SET_ACC_PROJECTS",
  //     payload: p,
  //   });

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
          // setStateAccProjects(data);
        });
      });
      setSettedUp(true);
    }
  }, []);

  useEffect(() => {
    if (state.selectedCompanyId) {
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

  // useEffect(() => {
  //   setAccProjects(state.accProjects);
  // }, [state.accProjects]);

  const [dialogOpen, setDialogOpen] = useState(false);

  return state.selectedCompanyId ? (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "flex-end",
          padding: "1rem",
        }}
      >
        <Button
          color="success"
          variant="contained"
          onClick={() => {
            setDialogOpen(true);
          }}
        >
          Add Server
        </Button>
        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
          <Container>
            <DialogTitle>New Server</DialogTitle>
            <DialogContent>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "1rem",
                }}
              >
                <StyledInputBase
                  placeholder="Server Name"
                  value={server.name}
                  onChange={(e) => {
                    setServer({
                      ...server,
                      name: e.target.value,
                    });
                  }}
                />
                <StyledInputBase
                  placeholder="Server IP"
                  value={server.ip}
                  onChange={(e) => {
                    setServer({
                      ...server,
                      ip: e.target.value,
                    });
                  }}
                />
                <StyledInputBase
                  placeholder="Server Port"
                  value={server.serverPort}
                  onChange={(e) => {
                    setServer({
                      ...server,
                      serverPort: Number(e.target.value),
                    });
                  }}
                />
                <StyledInputBase
                  placeholder="Username"
                  value={server.username}
                  onChange={(e) => {
                    setServer({
                      ...server,
                      username: e.target.value,
                    });
                  }}
                />
                <StyledInputBase
                  placeholder="Password"
                  value={server.password}
                  type="password"
                  onChange={(e) => {
                    setServer({
                      ...server,
                      password: e.target.value,
                    });
                  }}
                />
              </div>

              <Button
                color="success"
                variant="contained"
                sx={{
                  my: "1rem",
                  width: "100%",
                }}
                onClick={() => {
                  fetch(
                    "/api/servers/addServer?companyId=" +
                      state.selectedCompanyId,
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        server,
                      }),
                    }
                  ).then((res) => {
                    res.json().then((data) => {
                      setServers(data);
                    });
                  });

                  // if (
                  //   servers.length < 1 ||
                  //   (!servers[0].ip && !servers[0].name)
                  // ) {
                  //   setServers([
                  //     {
                  //       ...server,
                  //       id: Math.random().toString(),
                  //     },
                  //   ]);
                  // } else {
                  //   setServers(servers.concat(server));
                  // }
                  setDialogOpen(false);
                }}
              >
                Add
              </Button>
            </DialogContent>
          </Container>
        </Dialog>
      </div>
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
          <h3 style={{ textAlign: "center" }}>Server Name</h3>
        </div>

        <div
          style={{
            flexGrow: 1,
          }}
        >
          <h3 style={{ textAlign: "center" }}>Server IP</h3>
        </div>
      </div>
      <div
        style={{
          paddingBottom: "5rem",
        }}
      >
        {servers.map((server, index) => (
          <div
            key={server?.id + "_" + index}
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
                <StyledInputBase
                  placeholder="Server Name"
                  value={server?.name ?? ""}
                  onChange={(e) => {
                    setServers(
                      servers.map((s, i) => {
                        if (i === index) {
                          return {
                            ...s,
                            name: e.target.value,
                          };
                        }
                        return s;
                      })
                    );
                  }}
                />
              </div>
            </div>

            <div>
              <SettingsEthernetIcon
                color={
                  server?.ip && server?.name
                    ? "success"
                    : server?.ip || server?.name
                    ? "warning"
                    : "error"
                }
                sx={{
                  display: "none",
                }}
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
                  <StyledInputBase
                    placeholder="Server IP"
                    value={server?.ip ?? ""}
                    onChange={(e) => {
                      setServers(
                        servers.map((s, i) => {
                          if (i === index) {
                            return {
                              ...s,
                              ip: e.target.value,
                            };
                          }
                          return s;
                        })
                      );
                    }}
                  />

                  <Button
                    color="error"
                    variant="contained"
                    onClick={() => {
                      fetch(
                        "/api/servers/deleteServer?companyId=" +
                          state.selectedCompanyId,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                          },
                          body: JSON.stringify({
                            server,
                          }),
                        }
                      ).then((res) => {
                        res.json().then((data) => {
                          setServers(data);
                        });
                      });
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
    </div>
  ) : (
    <div>
      <h1>No Company Selected</h1>
    </div>
  );
}
