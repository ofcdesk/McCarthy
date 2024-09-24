import EngineeringIcon from "@mui/icons-material/Engineering";
import duotone from "./icons/duotone";
export const navigations = [
  {
    type: "label",
    label: "Admin",
  },
  {
    name: "Management",
    icon: duotone.Dashboard,
    path: "/",
  },
  {
    name: "FTP Servers",
    icon: duotone.Session,
    path: "/ftp-servers",
  },
  {
    name: "Settings",
    icon: duotone.SiteSetting,
    children: [
      {
        name: "Options",
        icon: EngineeringIcon,
        path: "/options",
      },
      {
        name: "Logout",
        icon: duotone.Session,
        path: "/logout",
      },
    ],
  },
];
