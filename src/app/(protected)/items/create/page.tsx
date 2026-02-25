"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Box, Button, Alert } from "@mui/material";
import {ArrowLeft } from "lucide-react";
import ItemForm from "@/components/items/ItemForm";
import { itemService } from "@/services/itemService";

export default function CreateItemPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async (data: any) => {
    try {
      setLoading(true);
      setError(null);
      console.log("Creating item with data:", JSON.stringify(data, null, 2));
      await itemService.createItem(data);
      router.push("/items");
    } catch (err) {
      console.error("Error creating item:", err);
      let errorMessage = "Failed to create item";
      
      if (err instanceof Error) {
        errorMessage = err.message;
      } else if (typeof err === 'object' && err !== null) {
        errorMessage = (err as any).message || (err as any).error || JSON.stringify(err);
      }
      
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <Box>
      <Box sx={{ p: 3, pb: 1 }}>
        <Button
          startIcon={<ArrowLeft size={18} />}
          onClick={() => router.back()}
        >
          Back
        </Button>
      </Box>
      {error && <Alert severity="error" sx={{ m: 3, mt: 1 }}>{error}</Alert>}
      <ItemForm onSave={handleSave} loading={loading} />
    </Box>
  );
}
