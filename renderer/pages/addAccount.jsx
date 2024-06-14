import { useTheme, ThemeProvider, styled } from "@mui/material/styles";
// form
import React, { Fragment } from "react";
import Layout from "../layouts";
import Page from "../components/Page";
import { Menu, Transition } from "@headlessui/react";
import AddAccountSection from "../section/addAccount";

// import verifySession from "../../main/linkedin/verifyCookie";
// import runTask from "utils/next";

AddAccount.getLayout = function getLayout(page) {
  return <Layout variant="logoOnly">{page}</Layout>;
};

export default function AddAccount() {
  const theme = useTheme();

  return (
    <>
      <ThemeProvider theme={theme}>
        <Page title="Add new account" className="mt-16">
          <AddAccountSection />
        </Page>
      </ThemeProvider>
      {/* </RootStyle> */}
    </>
  );
}
