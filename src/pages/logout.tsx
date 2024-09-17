import DashboardNavbar from "@/components/DashboardNavbar";
import DashboardSidebar from "@/components/DashboardSidebar";
import { H1, H2 } from "@/components/Typography";
import { Button } from "@mui/material";
import { Fragment, ReactNode, useState } from "react";
import { useCookies } from "react-cookie";
import { BodyWrapper, InnerWrapper } from ".";

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
  const [cookies, setCookie, removeCookie] = useCookies([
    "procore_token",
    "acc_token",
  ]);

  return (
    <div>
      {/* @ts-ignore */}
      <H1>Logout</H1>
      {/* @ts-ignore */}
      <H2>Are you sure you want to logout?</H2>

      <Button
        variant="contained"
        color="error"
        onClick={() => {
          removeCookie("procore_token");
          removeCookie("acc_token");
          alert("You have been logged out");
        }}
      >
        Logout
      </Button>
    </div>
  );
}
