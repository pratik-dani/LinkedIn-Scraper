import { useTheme, ThemeProvider } from "@mui/material/styles";
import { Card, CardContent, Container, Grid, Typography } from "@mui/material";
import Layout from "../layouts";
import Page from "../components/Page";
import {
  SquaresPlusIcon,
  UserIcon,
  UserGroupIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";

const products = [
  {
    name: "Accounts",
    description: "View connected LinkedIn accounts and connect new accounts",
    href: "/addAccount",
    icon: UserGroupIcon,
  },
  {
    name: "People",
    description: "Extract data from LinkedIn people profiles",
    href: "/peopleProfiles",
    icon: UserIcon,
  },
  {
    name: "Company",
    description: "Extract data from LinkedIn company profiles",
    href: "/companyProfiles",
    icon: BuildingLibraryIcon,
  },
  //   {
  //     name: "Security",
  //     description: "Your customers’ data will be safe and secure",
  //     href: "#",
  //     icon: FingerPrintIcon,
  //   },
  //   {
  //     name: "Plugins",
  //     description: "Additional Plugins (Coming Soon)",
  //     href: "#",
  //     icon: SquaresPlusIcon,
  //   },
];

Home.getLayout = function getLayout(page) {
  return <Layout variant="logoOnly">{page}</Layout>;
};

export default function Home() {
  const theme = useTheme();
  return (
    <>
      <ThemeProvider theme={theme}>
        <Page title="Home" className="mt-16">
          <Container>
            <Typography variant="h4">Hey there,</Typography>
            <Typography variant="body">
              Start by connecting your LinkedIn account via session cookies....
            </Typography>
            <Grid container spacing={3} className="pt-4 items-stretch">
              {/* <div className="grid grid-flow-col grid-cols-3 gap-x-4"> */}
              {products.map((item) => (
                <Grid item xs={12} md={4} className="group" key={item.name}>
                  <Card className="group">
                    <CardContent className="hover:bg-gray-100">
                      <div
                        key={item.name}
                        className="group relative rounded-lg p-2 text-sm leading-6 hover:bg-gray-100"
                      >
                        <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-gray-100 group-hover:bg-white">
                          <item.icon
                            className="h-6 w-6 text-gray-600 group-hover:text-indigo-600"
                            aria-hidden="true"
                          />
                        </div>
                        <a
                          href={item.href}
                          className="mt-6 block font-semibold text-gray-900"
                        >
                          {item.name}
                          <span className="absolute inset-0" />
                        </a>
                        <p className="mt-1 text-gray-600">{item.description}</p>
                      </div>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
              {/* </div> */}
            </Grid>
          </Container>
        </Page>
      </ThemeProvider>
    </>
  );
}

// export default Home;
