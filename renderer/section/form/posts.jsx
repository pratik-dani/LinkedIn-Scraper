import { RHFTextField } from "../../components/hook-form";
import * as Yup from "yup";

const PostsInput = () => {
  return (
    <RHFTextField
      type="text"
      name="postUrl"
      label="Post URL"
      //   multiline={false}
      //   rows={6}
    />
  );
};

export const FormSchema = Yup.object().shape({
  taskName: Yup.string().required("account is required"),
  postUrl: Yup.string().required("post url is required"),
  account: Yup.string().required("account is required"),
});

export const defaultValues = {
  taskName: "",
  postUrl: "",
  account: "",
};

export default PostsInput;
