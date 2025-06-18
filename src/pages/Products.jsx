import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  TextField,
} from "@mui/material";
import ProductList from "../components/ProductList";
import ProductDialog from "../components/ProductDialog";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { supabase } from "../supabase/supabase";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, "categories"));
    const categoryData = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    setCategories(categoryData);
    return categoryData; // Trả về để dùng tiếp
  };

  const fetchProducts = async (categoryList) => {
    const snapshot = await getDocs(collection(db, "products"));
    const rawProducts = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    // Gắn categoryName vào mỗi sản phẩm
    const enrichedProducts = rawProducts.map((product) => {
      const category = categoryList.find((c) => c.id === product.categoryId);
      return {
        ...product,
        categoryName: category?.name || "Không rõ",
      };
    });

    setProducts(enrichedProducts);
  };

  const handleUploadImage = async (file) => {
    if (!file) return "";
    const filePath = `${Date.now()}_${file.name}`;
    const { error } = await supabase.storage
      .from("products")
      .upload(filePath, file);
    if (error) throw error;
    const { data } = supabase.storage.from("products").getPublicUrl(filePath);
    return data.publicUrl;
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "products", id));
    const updatedCategories = await fetchCategories();
    await fetchProducts(updatedCategories);
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setOpen(true);
    console.log("Chỉnh sửa sản phẩm:", product);
  };

  useEffect(() => {
    const fetchAll = async () => {
      const loadedCategories = await fetchCategories();
      await fetchProducts(loadedCategories);
    };
    fetchAll();
  }, [open]);

  // Lọc sản phẩm theo tên danh mục hoặc imei
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase();
    return (
      p.categoryName?.toLowerCase().includes(q) ||
      p.imeiNumber?.toLowerCase().includes(q)
    );
  });

  return (
    <Box sx={{ p: 2 }}>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", sm: "center" }}
        flexDirection={{ xs: "column", sm: "row" }}
        gap={2}
        mb={2}
      >
        <Typography variant="h5">Quản lý sản phẩm</Typography>

        <Box display="flex" gap={2} flexWrap="wrap">
          <TextField
            label="Tìm theo danh mục hoặc IMEI"
            variant="outlined"
            size="small"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Button
            variant="contained"
            onClick={() => setOpen(true)}
          >
            + Thêm sản phẩm
          </Button>
        </Box>
      </Box>

      <ProductList
        products={filteredProducts}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
      />

      <ProductDialog
        open={open}
        setOpen={setOpen}
        onClose={() => setOpen(false)}
        categories={categories}
        fetchProducts={() => fetchProducts(categories)}
        handleUploadImage={handleUploadImage}
        editingProduct={editProduct}
      />
    </Box>
  );
}
