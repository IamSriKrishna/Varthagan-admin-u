"use client";

import { config } from "@/config";
import BBFileUploadCloud from "@/lib/BBFileUploadCloud/BBFileUploadCloud";
import { Box } from "@mui/material";
import React from "react";

type PresignedUrlResponse = {
  upload_url: string;
  object_name: string;
  public_url: string;
  expires_at: number;
};

type CampaignImageUploadProps = {
  slider_id: string;
  accept?: string;
  type?: string;
  onUploadSuccess: (data: PresignedUrlResponse) => void;
  loading: boolean;
  setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const SlidersImageUpload: React.FC<CampaignImageUploadProps> = ({ accept, onUploadSuccess, loading, setLoading }) => {
  return (
    <Box>
      <BBFileUploadCloud
        handleFileUpload={onUploadSuccess}
        foldername="campaigns"
        loading={loading}
        setLoading={setLoading}
        multiple={false}
        accept={accept}
        presignedUrl={config?.campaginDomain}
      />
    </Box>
  );
};

export default SlidersImageUpload;
