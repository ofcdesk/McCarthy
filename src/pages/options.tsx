import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { H1, H3 } from "@/components/Typography";
import { Button } from "@mui/material";
import { Fragment, ReactNode, useEffect, useState } from "react";
import { BodyWrapper, InnerWrapper } from ".";

import { Cron } from "react-js-cron";
import "react-js-cron/dist/styles.css";

type Props = {};

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

Logout.getLayout = function getLayout(page: ReactNode) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};

export default function Logout({}: Props) {
  const [cronjobTime, setCronjobTime] = useState("*/5 * * * *");
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/getCronjobTime").then((res) => {
      res.text().then((text) => {
        setCronjobTime(text);
      });
    });
  }, []);
  return (
    <div>
      {/* @ts-ignore */}
      <H1>Options</H1>
      {/* @ts-ignore */}
      <H3
        sx={{
          marginBottom: 2,
        }}
      >
        Set the cronjob time for the ACC Pool Sync Job
      </H3>

      <Cron
        value={cronjobTime}
        setValue={setCronjobTime}
        onError={(e: any) => {
          setError(e != undefined);
        }}
      />

      <Button
        variant="contained"
        color="success"
        disabled={error}
        sx={{
          marginTop: 2,
        }}
        onClick={() => {
          fetch("/api/setCronjobTime", {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              value: cronjobTime,
            }),
          })
            .then((res) => {
              if (res.status !== 200) {
                throw new Error("Failed to set cronjob time");
              }
            })
            .catch(() => {
              alert("Failed to set cronjob time: Wrong cronjob time format");
            });
        }}
      >
        Save Changes
      </Button>
    </div>
  );
}
