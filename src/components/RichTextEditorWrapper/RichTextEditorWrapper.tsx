"use client";

import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const RichTextEditorWrapper = dynamic(() => import("@/lib/BBRichTextEditor/BBRichTextEditorBase"), {
  ssr: false,
});

export default RichTextEditorWrapper;
