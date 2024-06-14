import NotistackProvider from "../components/NotistackProvider";
import ThemeProvider from "../theme";
import "../styles/globals.css";
import React from "react";
import { MainProvider } from "../context/mainContext";
import Script from "next/script";

function MyApp(props) {
  const { Component, pageProps } = props;
  const getLayout = Component.getLayout ?? ((page) => page);
  return (
    <>
      <ThemeProvider>
        <MainProvider>
          <NotistackProvider>
            {getLayout(
              <>
                <Script
                  src="https://buttons.github.io/buttons.js"
                  strategy="lazyOnload"
                />
                <Component {...pageProps} />
              </>
            )}
            {/* <Component {...pageProps} /> */}
          </NotistackProvider>
        </MainProvider>
      </ThemeProvider>
    </>
  );
}

export default MyApp;
