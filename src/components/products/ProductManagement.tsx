"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert,
  CircularProgress,
  Pagination,
  Stack,
  Typography,
  Chip,
  Skeleton,
  Container,
  useTheme,
} from "@mui/material";
import { useState, useEffect } from "react";
import { Edit, Trash2, Plus } from "lucide-react";
import BottleSizeForm from "./BottleSizeForm";
import BottleForm from "./BottleForm";
import CapForm from "./CapForm";
import ProductForm from "./ProductForm";
import {
  bottleSizeService,
  bottleService,
  capService,
  productService,
} from "@/lib/api/productService";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`product-tabpanel-${index}`}
      aria-labelledby={`product-tab-${index}`}
      {...other}
      style={{
        animation: value === index ? 'fadeIn 0.3s ease-in' : 'none',
      }}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function ProductManagement() {
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Bottle Sizes
  const [bottleSizes, setBottleSizes] = useState<any[]>([]);
  const [bottleSizesPage, setBottleSizesPage] = useState(1);
  const [bottleSizesTotal, setBottleSizesTotal] = useState(0);
  const [bottleSizeFormOpen, setBottleSizeFormOpen] = useState(false);
  const [selectedBottleSize, setSelectedBottleSize] = useState<any>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: string;
    id: number;
  } | null>(null);

  // Bottles
  const [bottles, setBottles] = useState<any[]>([]);
  const [bottlesPage, setBottlesPage] = useState(1);
  const [bottlesTotal, setBottlesTotal] = useState(0);
  const [bottleFormOpen, setBottleFormOpen] = useState(false);
  const [selectedBottle, setSelectedBottle] = useState<any>(null);

  // Caps
  const [caps, setCaps] = useState<any[]>([]);
  const [capsPage, setCapsPage] = useState(1);
  const [capsTotal, setCapsTotal] = useState(0);
  const [capFormOpen, setCapFormOpen] = useState(false);
  const [selectedCap, setSelectedCap] = useState<any>(null);

  // Products
  const [products, setProducts] = useState<any[]>([]);
  const [productsPage, setProductsPage] = useState(1);
  const [productsTotal, setProductsTotal] = useState(0);
  const [productFormOpen, setProductFormOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);

  const PAGE_SIZE = 10;

  useEffect(() => {
    loadData();
  }, [tabValue, bottleSizesPage, bottlesPage, capsPage, productsPage]);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      if (tabValue === 0) {
        const res = await bottleSizeService.getBottleSizes(bottleSizesPage, PAGE_SIZE);
        setBottleSizes(res.data || []);
        setBottleSizesTotal(res.total_count || 0);
      } else if (tabValue === 1) {
        const res = await bottleService.getBottles(bottlesPage, PAGE_SIZE);
        setBottles(res.data || []);
        setBottlesTotal(res.total_count || 0);
      } else if (tabValue === 2) {
        const res = await capService.getCaps(capsPage, PAGE_SIZE);
        setCaps(res.data || []);
        setCapsTotal(res.total_count || 0);
      } else if (tabValue === 3) {
        const res = await productService.getProducts(productsPage, PAGE_SIZE);
        setProducts(res.data || []);
        setProductsTotal(res.total_count || 0);
      }
    } catch (err: any) {
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    setLoading(true);
    try {
      if (deleteConfirm.type === "bottleSize") {
        await bottleSizeService.deleteBottleSize(deleteConfirm.id);
      } else if (deleteConfirm.type === "bottle") {
        await bottleService.deleteBottle(deleteConfirm.id);
      } else if (deleteConfirm.type === "cap") {
        await capService.deleteCap(deleteConfirm.id);
      } else if (deleteConfirm.type === "product") {
        await productService.deleteProduct(deleteConfirm.id);
      }
      setDeleteConfirm(null);
      loadData();
    } catch (err: any) {
      setError(err.message || "Failed to delete");
    } finally {
      setLoading(false);
    }
  };

  const renderBottleSizesTable = () => (
    <>
      <Button
        variant="contained"
        startIcon={<Plus size={20} />}
        onClick={() => {
          setSelectedBottleSize(null);
          setBottleSizeFormOpen(true);
        }}
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontWeight: 600,
          padding: '10px 24px',
          borderRadius: 1.5,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(102, 126, 234, 0.4)',
          },
        }}
      >
        Add Bottle Size
      </Button>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 1.5,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>Size (ML)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>Label</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>Created At</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#333' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bottleSizes.map((size) => (
              <TableRow
                key={size.id}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  },
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <TableCell sx={{ fontWeight: 500 }}>{size.id}</TableCell>
                <TableCell>
                  <Chip
                    label={`${size.size_ml}ml`}
                    size="small"
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      color: 'white',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{size.size_label}</TableCell>
                <TableCell>{new Date(size.created_at).toLocaleDateString()}</TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedBottleSize(size);
                      setBottleSizeFormOpen(true);
                    }}
                    sx={{
                      color: '#667eea',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      },
                    }}
                  >
                    <Edit size={18} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setDeleteConfirm({ type: "bottleSize", id: size.id })
                    }
                    sx={{
                      color: '#e74c3c',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                      },
                    }}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack sx={{ mt: 3, alignItems: "center" }}>
        <Pagination
          count={Math.ceil(bottleSizesTotal / PAGE_SIZE)}
          page={bottleSizesPage}
          onChange={(_, p) => setBottleSizesPage(p)}
          variant="outlined"
          shape="rounded"
          sx={{
            '& .MuiPaginationItem-root': {
              fontWeight: 600,
              borderRadius: 1,
            },
          }}
        />
      </Stack>
    </>
  );

  const renderBottlesTable = () => (
    <>
      <Button
        variant="contained"
        startIcon={<Plus size={20} />}
        onClick={() => {
          setSelectedBottle(null);
          setBottleFormOpen(true);
        }}
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontWeight: 600,
          padding: '10px 24px',
          borderRadius: 1.5,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(102, 126, 234, 0.4)',
          },
        }}
      >
        Add Bottle
      </Button>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 1.5,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>Size</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>Neck (MM)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>Thread</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>Stock</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#333' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bottles.map((bottle) => (
              <TableRow
                key={bottle.id}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  },
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <TableCell sx={{ fontWeight: 500 }}>{bottle.id}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{bottle.bottle_type}</TableCell>
                <TableCell>
                  <Chip
                    label={bottle.size?.size_label}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>{bottle.neck_size_mm}</TableCell>
                <TableCell>
                  <Chip
                    label={bottle.thread_type}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={bottle.stock}
                    size="small"
                    sx={{
                      background: bottle.stock > 10 ? '#d4edda' : '#fff3cd',
                      color: bottle.stock > 10 ? '#155724' : '#856404',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedBottle(bottle);
                      setBottleFormOpen(true);
                    }}
                    sx={{
                      color: '#667eea',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      },
                    }}
                  >
                    <Edit size={18} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setDeleteConfirm({ type: "bottle", id: bottle.id })
                    }
                    sx={{
                      color: '#e74c3c',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                      },
                    }}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack sx={{ mt: 3, alignItems: "center" }}>
        <Pagination
          count={Math.ceil(bottlesTotal / PAGE_SIZE)}
          page={bottlesPage}
          onChange={(_, p) => setBottlesPage(p)}
          variant="outlined"
          shape="rounded"
          sx={{
            '& .MuiPaginationItem-root': {
              fontWeight: 600,
              borderRadius: 1,
            },
          }}
        />
      </Stack>
    </>
  );

  const renderCapsTable = () => (
    <>
      <Button
        variant="contained"
        startIcon={<Plus size={20} />}
        onClick={() => {
          setSelectedCap(null);
          setCapFormOpen(true);
        }}
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontWeight: 600,
          padding: '10px 24px',
          borderRadius: 1.5,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(102, 126, 234, 0.4)',
          },
        }}
      >
        Add Cap
      </Button>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 1.5,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>Type</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>Neck (MM)</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>Thread</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>Material</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>Stock</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#333' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {caps.map((cap) => (
              <TableRow
                key={cap.id}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  },
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <TableCell sx={{ fontWeight: 500 }}>{cap.id}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{cap.cap_type}</TableCell>
                <TableCell>{cap.neck_size_mm}</TableCell>
                <TableCell>
                  <Chip
                    label={cap.thread_type}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={cap.material}
                    size="small"
                    sx={{
                      background: '#e3f2fd',
                      color: '#1976d2',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={cap.stock}
                    size="small"
                    sx={{
                      background: cap.stock > 10 ? '#d4edda' : '#fff3cd',
                      color: cap.stock > 10 ? '#155724' : '#856404',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedCap(cap);
                      setCapFormOpen(true);
                    }}
                    sx={{
                      color: '#667eea',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      },
                    }}
                  >
                    <Edit size={18} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setDeleteConfirm({ type: "cap", id: cap.id })
                    }
                    sx={{
                      color: '#e74c3c',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                      },
                    }}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack sx={{ mt: 3, alignItems: "center" }}>
        <Pagination
          count={Math.ceil(capsTotal / PAGE_SIZE)}
          page={capsPage}
          onChange={(_, p) => setCapsPage(p)}
          variant="outlined"
          shape="rounded"
          sx={{
            '& .MuiPaginationItem-root': {
              fontWeight: 600,
              borderRadius: 1,
            },
          }}
        />
      </Stack>
    </>
  );

  const renderProductsTable = () => (
    <>
      <Button
        variant="contained"
        startIcon={<Plus size={20} />}
        onClick={() => {
          setSelectedProduct(null);
          setProductFormOpen(true);
        }}
        sx={{
          mb: 3,
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          fontWeight: 600,
          padding: '10px 24px',
          borderRadius: 1.5,
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0 8px 16px rgba(102, 126, 234, 0.4)',
          },
        }}
      >
        Add Product
      </Button>
      <TableContainer
        component={Paper}
        sx={{
          borderRadius: 1.5,
          boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
          overflow: 'hidden',
        }}
      >
        <Table>
          <TableHead>
            <TableRow sx={{ backgroundColor: '#f8f9fa', borderBottom: '2px solid #e0e0e0' }}>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>ID</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>Name</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>Bottle</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>Cap</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>Quantity</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>MRP</TableCell>
              <TableCell sx={{ fontWeight: 700, color: '#333' }}>Compatible</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700, color: '#333' }}>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {products.map((product) => (
              <TableRow
                key={product.id}
                sx={{
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    backgroundColor: 'rgba(102, 126, 234, 0.05)',
                  },
                  borderBottom: '1px solid #f0f0f0',
                }}
              >
                <TableCell sx={{ fontWeight: 500 }}>{product.id}</TableCell>
                <TableCell sx={{ fontWeight: 500 }}>{product.product_name}</TableCell>
                <TableCell>
                  <Chip
                    label={product.bottle?.bottle_type}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={product.cap?.cap_type}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>
                  <Chip
                    label={product.quantity}
                    size="small"
                    sx={{
                      background: product.quantity > 0 ? '#d4edda' : '#fff3cd',
                      color: product.quantity > 0 ? '#155724' : '#856404',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell sx={{ fontWeight: 600 }}>₹{product.mrp}</TableCell>
                <TableCell>
                  <Chip
                    label={product.is_compatible ? "Compatible" : "Incompatible"}
                    size="small"
                    sx={{
                      background: product.is_compatible ? '#d4edda' : '#f8d7da',
                      color: product.is_compatible ? '#155724' : '#721c24',
                      fontWeight: 600,
                    }}
                  />
                </TableCell>
                <TableCell align="center">
                  <IconButton
                    size="small"
                    onClick={() => {
                      setSelectedProduct(product);
                      setProductFormOpen(true);
                    }}
                    sx={{
                      color: '#667eea',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(102, 126, 234, 0.1)',
                      },
                    }}
                  >
                    <Edit size={18} />
                  </IconButton>
                  <IconButton
                    size="small"
                    onClick={() =>
                      setDeleteConfirm({ type: "product", id: product.id })
                    }
                    sx={{
                      color: '#e74c3c',
                      transition: 'all 0.2s ease',
                      '&:hover': {
                        backgroundColor: 'rgba(231, 76, 60, 0.1)',
                      },
                    }}
                  >
                    <Trash2 size={18} />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <Stack sx={{ mt: 3, alignItems: "center" }}>
        <Pagination
          count={Math.ceil(productsTotal / PAGE_SIZE)}
          page={productsPage}
          onChange={(_, p) => setProductsPage(p)}
          variant="outlined"
          shape="rounded"
          sx={{
            '& .MuiPaginationItem-root': {
              fontWeight: 600,
              borderRadius: 1,
            },
          }}
        />
      </Stack>
    </>
  );

  return (
    <Box sx={{ width: "100%" }}>
      <Card
        sx={{
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
          borderRadius: 2,
          overflow: 'hidden',
        }}
      >
        <CardContent>
          <Stack direction="column" spacing={2}>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Product Management
            </Typography>

            {error && (
              <Alert
                severity="error"
                sx={{
                  borderRadius: 1.5,
                  '& .MuiAlert-icon': { fontSize: 24 },
                }}
              >
                {error}
              </Alert>
            )}

            {loading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <CircularProgress size={40} />
              </Box>
            )}

            <Box sx={{ borderBottom: 2, borderColor: '#e0e0e0' }}>
              <Tabs
                value={tabValue}
                onChange={(_, newValue) => setTabValue(newValue)}
                aria-label="product-tabs"
                sx={{
                  '& .MuiTab-root': {
                    fontWeight: 600,
                    fontSize: '1rem',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      backgroundColor: 'rgba(102, 126, 234, 0.05)',
                    },
                  },
                  '& .MuiTabs-indicator': {
                    height: 3,
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  },
                }}
              >
                <Tab label="Bottle Sizes" id="product-tab-0" />
                <Tab label="Bottles" id="product-tab-1" />
                <Tab label="Caps" id="product-tab-2" />
                <Tab label="Products" id="product-tab-3" />
              </Tabs>
            </Box>

            <TabPanel value={tabValue} index={0}>
              {renderBottleSizesTable()}
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              {renderBottlesTable()}
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
              {renderCapsTable()}
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
              {renderProductsTable()}
            </TabPanel>
          </Stack>
        </CardContent>
      </Card>

      {/* Forms */}
      <BottleSizeForm
        open={bottleSizeFormOpen}
        onClose={() => {
          setBottleSizeFormOpen(false);
          setSelectedBottleSize(null);
        }}
        onSuccess={loadData}
        initialData={selectedBottleSize}
      />

      <BottleForm
        open={bottleFormOpen}
        onClose={() => {
          setBottleFormOpen(false);
          setSelectedBottle(null);
        }}
        onSuccess={loadData}
        initialData={selectedBottle}
      />

      <CapForm
        open={capFormOpen}
        onClose={() => {
          setCapFormOpen(false);
          setSelectedCap(null);
        }}
        onSuccess={loadData}
        initialData={selectedCap}
      />

      <ProductForm
        open={productFormOpen}
        onClose={() => {
          setProductFormOpen(false);
          setSelectedProduct(null);
        }}
        onSuccess={loadData}
        initialData={selectedProduct}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)}>
        <DialogTitle>Confirm Delete</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this item? This action cannot be
            undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteConfirm(null)}>Cancel</Button>
          <Button
            onClick={handleDelete}
            color="error"
            variant="contained"
            disabled={loading}
          >
            {loading ? <CircularProgress size={20} /> : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
