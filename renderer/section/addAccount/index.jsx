import { Card, CardContent, CardHeader, Grid } from "@mui/material";
import AddAccountForm from "./form";
import Table from "./table";
import { useState } from "react";
import { useMain } from "../../hooks/useMain";

/**
 * AddAccountSection component to manage adding new accounts and displaying connected accounts.
 * 
 * This component uses Material-UI for layout and styling.
 */
const AddAccountSection = () => {
  const [isSubmit, setIsSubmit] = useState(false);
  const { accounts, handleAccountDelete, updateAccounts, addAccount } = useMain();

  return (
    <>
      <Grid container spacing={3}>
        {/* Section for adding a new account */}
        <Grid item xs={12} md={6}>
          <Card className="mx-4">
            <CardHeader title={"Add New Account"} />
            <CardContent>
              <AddAccountForm
                isSubmit={isSubmit}
                setIsSubmit={setIsSubmit}
                updateAccounts={updateAccounts}
                addAccount={addAccount}
              />
            </CardContent>
          </Card>
        </Grid>

        {/* Section for displaying connected accounts */}
        <Grid item xs={12} md={6}>
          <Card className="mx-4">
            <CardHeader title={"Connected Accounts"} />
            <CardContent>
              <Table
                accounts={accounts}
                handleDelete={(id) => {
                  handleAccountDelete(id);
                }}
              />
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </>
  );
};

export default AddAccountSection;
