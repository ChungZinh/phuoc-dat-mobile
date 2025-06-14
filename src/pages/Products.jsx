// ProductsPage.jsx
import React, { useEffect, useState } from "react";
import { Box, Typography, Button } from "@mui/material";
import ProductList from "../components/ProductList";
import ProductDialog from "../components/ProductDialog";
import { collection, deleteDoc, doc, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { supabase } from "../supabase/supabase";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [open, setOpen] = useState(false);
  const [editProduct, setEditProduct] = useState(null); // chứa sản phẩm đang chỉnh sửa

  const fetchCategories = async () => {
    const snapshot = await getDocs(collection(db, "categories"));
    setCategories(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
  };

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    setProducts(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
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
    fetchProducts();
  };

  const handleEdit = (product) => {
    setEditProduct(product);
    setOpen(true); // dùng chung dialog với thêm
    console.log("Chỉnh sửa sản phẩm:", product);
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, [open]);

  return (
    <Box sx={{ p: 2 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Typography variant="h5">Quản lý sản phẩm</Typography>
        <Button
          variant="contained"
          onClick={() => setOpen(true)}
          sx={{ mb: 2 }}
        >
          + Thêm sản phẩm
        </Button>
      </Box>

      <ProductList
        products={products}
        handleDelete={handleDelete}
        handleEdit={handleEdit}
      />
      <ProductDialog
        open={open}
        setOpen={setOpen}
        onClose={() => setOpen(false)}
        categories={categories}
        fetchProducts={fetchProducts}
        handleUploadImage={handleUploadImage}
        editingProduct={editProduct} // truyền sản phẩm đang chỉnh sửa
      />
    </Box>
  );
}
