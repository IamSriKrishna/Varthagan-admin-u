"use client";

import RichTextEditorWrapper from "@/components/RichTextEditorWrapper/RichTextEditorWrapper";
import { useField } from "formik";

interface BBRichTextEditorProps {
  name: string;
  label: string;
  placeholder?: string;
}

const BBRichTextEditor: React.FC<BBRichTextEditorProps> = ({ name, label, placeholder }) => {
  const [field, meta, helpers] = useField(name);
  const isError = Boolean(meta.touched && meta.error);

  return (
    // <BBRichTextEditorBase
    <RichTextEditorWrapper
      label={label}
      value={field.value}
      placeholder={placeholder}
      onChange={(val) => helpers.setValue(val)}
      onBlur={() => helpers.setTouched(true)}
      isError={isError}
      errorMessage={isError ? meta.error : ""}
    />
  );
};

export default BBRichTextEditor;
