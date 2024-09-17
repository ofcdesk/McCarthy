import { useAppContext } from "@/contexts/appContext";
import { Box, Button, styled } from "@mui/material";
import { useRouter } from "next/router";
import { Fragment, ReactNode, useEffect, useState } from "react";
import { useCookies } from "react-cookie";
import DashboardNavbar from "../components/DashboardNavbar";
import DashboardSidebar from "../components/DashboardSidebar"; // styled components

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

Devbox.getLayout = function getLayout(page: ReactNode) {
  return <VendorDashboardLayout>{page}</VendorDashboardLayout>;
};

export default function Devbox({}: Props) {
  const { state, dispatch } = useAppContext();

  const [cookies] = useCookies(["procore_token"]);

  const router = useRouter();

  useEffect(() => {
    if (!cookies.procore_token) {
      router.push("/api/oauth/procore/login");
    }
  }, []);

  function getSubmittals() {
    fetch("/api/procore/getSubmittals?project_id=118135", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  }

  function createTestRFI() {
    fetch("/api/procore/createRfi?project_id=118135&company_id=4264521", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        rfi: {
          subject: "Created via API",
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  }

  function createTestSubmittal() {
    fetch("/api/procore/createSubmittal?project_id=118135&company_id=4264521", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        number: 2,
        title: "Created via API",
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        console.log(data);
      });
  }

  // function createDevTestWebhook() {
  //   fetch("/api/procore/createWebhook?company_id=4264521", {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/json",
  //     },
  //     body: JSON.stringify({
  //       company_id: 4264521,
  //       hook: {
  //         api_version: "v1",
  //         destionation_url:
  //           "https://webhook.site/aa64483a-a553-471b-96b6-788f59547946/api/callbacks/procore",
  //       },
  //     }),
  //   })
  //     .then((res) => res.json())
  //     .then((data) => {
  //       console.log(data);
  //     });
  // }

  return (
    <div>
      <Button onClick={getSubmittals}>Get Submittals</Button>
      <Button onClick={createTestSubmittal}>Create Test Submittal</Button>
      <Button onClick={createTestRFI}>Create Test RFI</Button>
    </div>
  );
}
