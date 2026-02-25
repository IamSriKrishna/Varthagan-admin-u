import { upload } from "@/constants/apiConstants";

import useApi from "@/hooks/useApi";
import useFileUpload from "@/hooks/useFileUpload";
import BBFileUploadBase from "@/lib/BBFileUploadBase/BBFileUploadBase";
import { showToastMessage } from "@/utils/toastUtil";
import { Box } from "@mui/material";
import React from "react";

type BBFileUploadCloudProps = {
  handleFileUpload: (data: PresignedUrlResponse) => void;
  foldername: string;
  loading: boolean;
  multiple?: boolean;
  name?: string;
  label?: string;
  accept?: string;
  setLoading: (loading: boolean) => void;
  presignedUrl?: string;
};

type AddImagePayload = {
  file_name: string;
  content_type: string;
  folder: string;
};
type PresignedUrlResponse = {
  upload_url: string;
  object_name: string;
  public_url: string;
  expires_at: number;
};

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};
const BBFileUploadCloud = ({
  handleFileUpload,
  foldername,
  loading,
  setLoading,
  name,
  label,
  accept,
  multiple = true,
  presignedUrl,
}: BBFileUploadCloudProps) => {
  const { mutateApi: getPresignedUrl } = useApi<ApiResponse<PresignedUrlResponse>>(
    upload.postUpload,
    "POST",
    undefined,
    presignedUrl,
  );
  const { uploadFile } = useFileUpload();
  const handleFileChange = async (input: React.ChangeEvent<HTMLInputElement> | FileList) => {
    const files = input instanceof FileList ? input : input.target.files;
    const inputEl = input instanceof FileList ? null : input.target;
    if (!files || files.length === 0) return;

    setLoading(true);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) {
          showToastMessage(`${file.name} is not a valid image. Skipped.`, "info");
          continue;
        }

        const payload: AddImagePayload = {
          file_name: file.name,
          content_type: file.type,
          folder: foldername,
        };

        // Step 1: Get presigned URL
        const response = await getPresignedUrl(payload);
        if (!response?.success) {
          showToastMessage("Failed to get upload URL.", "error");
          continue;
        }

        // Step 2: Upload the file using PUT to S3
        const result = await uploadFile(file, response.data.upload_url, file.type);

        if (result !== undefined) {
          handleFileUpload(response.data);

          // if(success)
          showToastMessage(`${file.name} uploaded successfully`, "success");
        } else {
          showToastMessage(`Upload failed for ${file.name}`, "error");
        }
      }
    } catch (e) {
      showToastMessage((e as { message?: string })?.message ?? "Something went wrong.", "error");
    } finally {
      if (inputEl) inputEl.value = "";
      setLoading(false);
    }
  };

  return (
    <Box sx={{ position: "relative" }}>
      <BBFileUploadBase
        onFileChange={handleFileChange}
        buttonLabel="Browse Image"
        multiple={multiple}
        loading={loading}
        name={name}
        label={label}
        accept={accept}
      />
    </Box>
  );
};

export default BBFileUploadCloud;
