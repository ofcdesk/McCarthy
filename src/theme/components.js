import { dark, grey } from "./themeColors";
import { fontFamily, fontSize } from "./typography"; // ========================================================

// =========================================================
export const components = {
  MuiCssBaseline: {
    styleOverrides: (theme) => ({
      html: {
        scrollBehavior: "smooth",
      },
      p: {
        lineHeight: 1.75,
      },
      button: {
        fontFamily,
        fontSize,
      },
      ".MuiRating-sizeSmall": {
        fontSize: "20px",
      },
      a: {
        textDecoration: "none",
        color: "inherit",
      },
      ul: {
        margin: 0,
        padding: 0,
        listStyle: "none",
      },
      "#nprogress .bar": {
        overflow: "hidden",
        height: "3px !important",
        zIndex: "99999999 !important",
        background: `${theme.palette.primary.main} !important`,
      },
    }),
  },
  MuiInputLabel: {
    styleOverrides: {
      root: {
        zIndex: 0,
      },
    },
  },
  MuiDialog: {
    styleOverrides: {
      paper: {
        borderRadius: 8,
      },
    },
  },
  MuiCard: {
    styleOverrides: {
      root: {
        borderRadius: "8px",
      },
    },
  },
  MuiPagination: {
    defaultProps: {
      variant: "outlined",
      color: "primary",
    },
  },
  MuiMenuItem: {
    styleOverrides: {
      root: {
        paddingTop: 8,
        paddingBottom: 8,
      },
    },
  },
  MuiSvgIcon: {
    styleOverrides: {
      root: {
        "& .secondary": {
          opacity: 0.4,
        },
      },
    },
  },
  MuiButton: {
    styleOverrides: {
      root: ({ ownerState }) => ({
        minWidth: 0,
        minHeight: 0,
        fontWeight: 600,
        textTransform: "capitalize",
        ...(ownerState.color === "primary" && {
          borderRadius: "8px",
        }),
        ...(ownerState.color === "dark" && {
          color: "#fff",
          borderRadius: 0,
          transition: "all 0.3s",
          ":hover": {
            backgroundColor: "#343434",
          },
        }),
        ...(ownerState.color === "dark" &&
          ownerState.variant === "outlined" && {
            color: dark.main,
            borderRadius: "3px",
            transition: "all 0.3s",
            ":hover": {
              backgroundColor: dark.main,
              color: "white",
            },
          }),
      }),
      sizeLarge: {
        padding: ".6rem 2.5rem",
      },
    },
    defaultProps: {
      color: "inherit",
    },
  },
};
