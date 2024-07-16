import React from "react";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import Modal from "@mui/material/Modal";
import {
  FormProvider,
  RHFSelect,
  RHFTextField,
} from "../../components/hook-form";
import { Grid, Stack } from "@mui/material";
import { LoadingButton } from "@mui/lab";
import { useMain } from "../../hooks/useMain";

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 600,
  bgcolor: "background.paper",
  boxShadow: 24,
  p: 4,
};

/**
 * AddNewModal component to display a modal form for adding new tasks.
 *
 */
const AddNewModal = ({
  className,
  accounts,
  isSubmit,
  open,
  setOpen,
  setIsSubmit,
  taskType,
  defaultValues,
  FormSchema,
  Input,
}) => {
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);
  const { addTask } = useMain();

  /**
   * Function to handle form submission.
   *
   * @param {Object} data - The form data.
   */
  const onSubmit = async (data) => {
    console.log("data", data);
    data.taskType = taskType;
    setIsSubmit(true);
    await addTask(data);
    setIsSubmit(false);
    setOpen(false);
    reset();
  };

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
    <>
      <Button className={className} variant="soft" onClick={handleOpen}>
        Add New +
      </Button>
      <Modal
        open={open}
        onClose={handleClose}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style} className="rounded-lg">
          <Typography variant="h6" component="h2">
            Paste your LinkedIn profile URLs here
          </Typography>
          <FormProvider
            methods={methods}
            onSubmit={handleSubmit(onSubmit)}
            className="grid gap-y-4 my-4"
          >
            {!!errors.afterSubmit && (
              <Alert severity="error">{errors.afterSubmit.message}</Alert>
            )}
            <Grid className="grid gap-y-4 m-4">
              <Grid item xs={12} md={12}>
                <Stack spacing={1}>
                  <RHFTextField type="text" name="taskName" label="Task Name" />
                </Stack>
              </Grid>
              <Grid item xs={12} md={12}>
                <Stack spacing={1}>
                  <Input/>
                </Stack>
              </Grid>
              <Grid item xs={12} md={12}>
                <Stack spacing={1}>
                  <RHFSelect name="account">
                    <option value="" />
                    {accounts.map((elem) => (
                      <option key={elem.id} value={elem.id}>
                        {elem.name}
                      </option>
                    ))}
                  </RHFSelect>
                </Stack>
              </Grid>
              <Grid item xs={12} md={12}>
                <Stack spacing={1}>
                  <LoadingButton
                    size="large"
                    type="submit"
                    variant="contained"
                    loading={isSubmit}
                  >
                    Submit
                  </LoadingButton>
                </Stack>
              </Grid>
            </Grid>
          </FormProvider>
        </Box>
      </Modal>
    </>
  );
};

export default AddNewModal;
