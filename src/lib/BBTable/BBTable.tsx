"use client";
import {
  Box,
  Collapse,
  IconButton,
  Paper,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Theme,
  Typography,
} from "@mui/material";
import { ChevronDown, ChevronRight } from "lucide-react";
import React, { useMemo, useState } from "react";
import { BBFotterBox } from "./BBTable.styles";
import HighlightedCell from "./HighlightedCell";

export type ITableColumn<T> = {
  key: keyof T | "action";
  label: string;
  render?: (row: T) => React.ReactNode;
  cellStyle?: SxProps<Theme>;
};

type ITableProps<T> = {
  data?: T[];
  columns: ITableColumn<T>[];
  primaryKey?: keyof T;
  higlightText?: string;
  pagination?: boolean;
  page?: number;
  rowsPerPage?: number;
  totalCount?: number;
  onPageChange?: (newPage: number) => void;
  onRowsPerPageChange?: (newRows: number) => void;
  renderAccordionContent?: (row: T) => React.ReactNode;
  sx?: SxProps<Theme>;
};

export default function BBTable<T extends object>({
  data = [],
  columns,
  primaryKey = "id" as keyof T,
  higlightText = "",
  pagination = true,
  page = 0,
  rowsPerPage = 10,
  totalCount = 0,
  onPageChange,
  onRowsPerPageChange,
  renderAccordionContent,
  sx,
}: ITableProps<T>) {
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const filteredData = useMemo(() => {
    if (!higlightText) return data;
    const search = higlightText.toLowerCase();
    return data.filter((row) => Object.values(row).some((val) => String(val).toLowerCase().includes(search)));
  }, [data, higlightText]);

  const toggleRow = (key: string) => {
    setExpandedRow((prev) => (prev === key ? null : key));
  };

  return (
    <Box>
      <TableContainer component={Paper} elevation={0} sx={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
        <Box sx={{ display: "block", overflowX: "auto" }}>
          <Table sx={sx}>
            <TableHead>
              <TableRow>
                {renderAccordionContent && <TableCell sx={{ width: 40 }} />}
                {columns.map((col) => (
                  <TableCell key={String(col.key)} sx={col.cellStyle}>
                    {col.label}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={columns.length + (renderAccordionContent ? 1 : 0)} align="center">
                    No data
                  </TableCell>
                </TableRow>
              ) : (
                filteredData.map((row, index) => {
                  const rowKey = String(row[primaryKey]) ?? index;
                  const isExpanded = expandedRow === rowKey;

                  return (
                    <React.Fragment key={rowKey}>
                      <TableRow>
                        {renderAccordionContent && (
                          <TableCell>
                            <IconButton size="small" onClick={() => toggleRow(rowKey)}>
                              {isExpanded ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                            </IconButton>
                          </TableCell>
                        )}

                        {columns.map((col) => (
                          <TableCell key={String(col.key)} sx={col.cellStyle}>
                            {col.render ? (
                              col.render(row)
                            ) : (
                              <HighlightedCell value={String(row[col.key as keyof T] ?? "")} search={higlightText} />
                            )}
                          </TableCell>
                        ))}
                      </TableRow>

                      {renderAccordionContent && (
                        <TableRow>
                          <TableCell colSpan={columns.length + 1} sx={{ p: 0, borderBottom: "1px solid #e0e0e0" }}>
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit sx={{ p: 2, bgcolor: "grey.50" }}>
                              {renderAccordionContent(row)}
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      )}
                    </React.Fragment>
                  );
                })
              )}
            </TableBody>
          </Table>
        </Box>
        {pagination && (
          <Box sx={BBFotterBox}>
            <Typography sx={{ fontSize: "15px", color: "text.secondary" }}>Total: {data.length}</Typography>
            <TablePagination
              component="div"
              count={totalCount}
              page={page}
              onPageChange={(_, newPage) => onPageChange?.(newPage)}
              rowsPerPage={rowsPerPage}
              onRowsPerPageChange={(e) => onRowsPerPageChange?.(parseInt(e.target.value, 10))}
            />
          </Box>
        )}
      </TableContainer>
    </Box>
  );
}
