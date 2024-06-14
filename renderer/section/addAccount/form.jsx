import React, { useEffect, useState, Fragment } from "react";
import { useForm } from "react-hook-form";
import * as Yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { FormProvider, RHFTextField } from "../../components/hook-form";
import { LoadingButton } from "@mui/lab";
import { useSnackbar } from "notistack";
import { Alert, Grid, Stack } from "@mui/material";

/**
 * AddAccountForm component for adding a new account using a cookie.
 */
const AddAccountForm = ({ isSubmit, setIsSubmit, updateAccounts, addAccount }) => {
  const { enqueueSnackbar } = useSnackbar();

  // Effect hook to handle account addition response
  useEffect(() => {
    window.ipc.on(`add-account`, ({ message, status }) => {
      setIsSubmit(false);
      if (status) {
        enqueueSnackbar(
          `Account ${message?.miniProfile?.firstName} ${message?.miniProfile?.lastName} added successfully!`,
          { variant: "success" }
        );
        reset(); // Reset the form on successful addition
      } else {
        enqueueSnackbar("Account not added!", { variant: "error" });
      }
      updateAccounts(); // Update the list of accounts
    });
  }, []);

  /**
   * Handle form submission.
   * 
   * @param {Object} data - The form data.
   */
  const onSubmit = async (data) => {
    const cookie = data["cookie"];
    addAccount(cookie);
    setIsSubmit(true);
  };

  // Form validation schema using Yup
  const FormSchema = Yup.object().shape({
    cookie: Yup.string().required("Cookie is required"),
  });

  // Default form values
  const defaultValues = {
    cookie: "",
  };

  // Initialize form methods using react-hook-form
  const methods = useForm({
    resolver: yupResolver(FormSchema),
    defaultValues,
  });

  const {
    reset,
    handleSubmit,
    formState: { errors },
  } = methods;

  return (
    <FormProvider methods={methods} onSubmit={handleSubmit(onSubmit)}>
      {!!errors.afterSubmit && (
        <Alert severity="error">{errors.afterSubmit.message}</Alert>
      )}
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <RHFTextField type="text" name="cookie" label="Cookie" />
          </Stack>
        </Grid>
        <Grid item xs={12} md={6}>
          <Stack spacing={1}>
            <LoadingButton
              size="large"
              type="submit"
              variant="contained"
              loading={isSubmit}
            >
              Add Account
            </LoadingButton>
          </Stack>
        </Grid>
      </Grid>
    </FormProvider>
  );
};

export default AddAccountForm;
