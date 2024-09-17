import Head from "next/head";
import Router from "next/router";
import nProgress from "nprogress";
import "nprogress/nprogress.css";
import { Fragment } from "react";
import "simplebar/dist/simplebar.min.css";
import OpenGraphTags from "../components/OpenGraphTags";
import SnackbarProvider from "../components/SnackbarProvider";
import SettingsProvider from "../contexts/SettingContext";
import MuiTheme from "../theme/MuiTheme";

import { AppProvider } from "../contexts/appContext";

//Binding events.
Router.events.on("routeChangeStart", () => nProgress.start());
Router.events.on("routeChangeComplete", () => nProgress.done());
Router.events.on("routeChangeError", () => nProgress.done()); // small change

nProgress.configure({
  showSpinner: false,
});

const App = ({ Component, pageProps }) => {
  const AnyComponent = Component;

  const getLayout = AnyComponent.getLayout ?? ((page) => page);

  return (
    <Fragment>
      <Head>
        <meta charSet="utf-8" />
        <meta name="description" content="Pond Dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
        <OpenGraphTags />
        <title>Pond Dashboard</title>
      </Head>

      <SettingsProvider>
        <AppProvider>
          <MuiTheme>
            <SnackbarProvider>
              {getLayout(<AnyComponent {...pageProps} />)}
            </SnackbarProvider>
          </MuiTheme>
        </AppProvider>
      </SettingsProvider>
    </Fragment>
  );
};

export default App;
