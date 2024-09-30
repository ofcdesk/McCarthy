import { components } from "./components";
import { typography } from "./typography";
import { primary, themeColors } from "./themeColors";

const breakpoints = {
  values: {
    xs: 0,
    sm: 600,
    md: 960,
    lg: 1280,
    xl: 1920,
  },
};
const themesOptions = {
  typography,
  breakpoints,
  components: { ...components },
  palette: {
    ...themeColors,
  },
};

const themeOptions = (publicRuntimeConfig, pathname) => {
  // YOU CAN SET ANOTHER THEME HERE E.G. [THEMES.GROCERY] OR [THEMES.FURNITURE] ETC.
  let themeOptions = themesOptions;
  return themeOptions;
};

export default themeOptions;
