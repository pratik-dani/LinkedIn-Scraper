import { useTheme, ThemeProvider } from "@mui/material/styles";
// form
import React, { useState } from "react";
import Layout from "../layouts";
import Page from "../components/Page";
import { Container, Typography } from "@mui/material";
import { useMain } from "../hooks/useMain";
import ModuleLayout from "../section/modules";
import AddNewModal from "../section/modules/modal";
import { defaultValues, FormSchema } from "../section/form/posts";
import PostsInput from "../section/form/posts";

LinkedinPosts.getLayout = function getLayout(page) {
  return <Layout variant="logoOnly">{page}</Layout>;
};

export default function LinkedinPosts() {
  const theme = useTheme();
  const [isSubmit, setIsSubmit] = useState(false);
  const [open, setOpen] = useState(false);
  const { accounts } = useMain();
  const taskType = "linkedin.posts";

  return (
    <>
      <ThemeProvider theme={theme}>
        <Page title="LinkedIn Posts" className="mt-16">
          <Container>
          <Typography variant="h3" className="flex justify-center">Scrape Posts</Typography>
            <AddNewModal
              className="mb-4"
              accounts={accounts}
              isSubmit={isSubmit}
              open={open}
              setOpen={setOpen}
              setIsSubmit={setIsSubmit}
              taskType={taskType}
              defaultValues={defaultValues}
              FormSchema={FormSchema}
              Input={PostsInput}
            />
            <ModuleLayout taskType={taskType} />
          </Container>
        </Page>
      </ThemeProvider>
      {/* </RootStyle> */}
    </>
  );
}
