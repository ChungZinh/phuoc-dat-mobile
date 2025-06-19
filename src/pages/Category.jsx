import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
  IconButton,
  Paper,
  Divider,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { db } from "../firebase/firebase"; // Chỉ dùng db từ Firebase
import {
  collection,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
  onSnapshot,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import { supabase } from "../supabase/supabase"; // Kết nối Supabase
import { ReactSortable } from "react-sortablejs";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import ProductListItem from "../components/ProductListItem";
export default function Category() {
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryProducts, setCategoryProducts] = useState([]);
  const categoriesRef = collection(db, "categories");

  const handleUpload = async () => {
    if (!name || !imageFile) return alert("Điền tên và chọn ảnh!");

    try {
      // Upload ảnh lên Supabase
      const filePath = `${Date.now()}_${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("categories")
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) throw uploadError;
      // Lấy public URL ảnh
      const {
        data: { publicUrl },
      } = supabase.storage.from("categories").getPublicUrl(filePath);

      // Lưu vào Firestore
      await addDoc(categoriesRef, {
        name,
        imageUrl: publicUrl,
        sold: 0,
      });

      setName("");
      setImageFile(null);
    } catch (err) {
      alert("Lỗi khi upload ảnh hoặc lưu dữ liệu.");
      console.error(err);
    }
  };

  const handleOpenDialog = async (category) => {
    setSelectedCategory(category);
    setOpenDialog(true);

    // Truy vấn sản phẩm có categoryId = category.id
    const q = query(
      collection(db, "products"),
      where("categoryId", "==", category.id)
    );
    const snapshot = await getDocs(q);
    const products = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    setCategoryProducts(products);
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(categoriesRef, (snapshot) => {
      const catList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      // Sắp xếp theo field 'order' nếu có
      catList.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setCategories(catList);
    });
    return () => unsubscribe();
  }, []);

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "categories", id));
  };

  return (
    <Grid container spacing={2}>
      {/* Left Form */}
      <Grid item xs={12} md={3} size={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Thêm Dòng Điện Thoại
          </Typography>
          <TextField
            fullWidth
            label="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            margin="normal"
          />
          <Button variant="contained" component="label">
            Chọn ảnh
            <input
              hidden
              type="file"
              accept="image/*"
              onChange={(e) => setImageFile(e.target.files[0])}
            />
          </Button>
          {imageFile && <Typography mt={1}>{imageFile.name}</Typography>}
          <Button
            variant="contained"
            onClick={handleUpload}
            fullWidth
            sx={{ mt: 2 }}
          >
            Thêm
          </Button>
        </Paper>
      </Grid>

      {/* Right List */}
      <Grid item xs={12} md={9} size={9}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Danh sách Dòng Điện Thoại
          </Typography>
          <List>
            <ReactSortable
              list={categories}
              setList={(newList) => {
                setCategories(newList);
                newList.forEach((item, index) => {
                  const docRef = doc(db, "categories", item.id);
                  updateDoc(docRef, { order: index });
                });
              }}
              animation={200}
            >
              {categories.map((cat) => (
                <Box key={cat.id}>
                  <ListItem
                    key={cat.id}
                    onClick={() => handleOpenDialog(cat)}
                    secondaryAction={
                      <IconButton
                        edge="end"
                        onClick={() => handleDelete(cat.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        style={{ width: 50, height: 50, marginRight: 16 }}
                      />
                      <ListItemText primary={cat.name} />
                    </Box>
                  </ListItem>
                  <Divider />
                </Box>
              ))}
            </ReactSortable>
          </List>
        </Paper>
      </Grid>
      <Dialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>{selectedCategory?.name}</DialogTitle>
        <DialogContent>
          {categoryProducts.filter((p) => !p.isSelling).length === 0 ? (
            <Typography>Không có sản phẩm chưa bán trong dòng này.</Typography>
          ) : (
            categoryProducts
              .filter((p) => !p.isSelling)
              .map((product) => (
                <ProductListItem
                  key={product.id}
                  item={product}
                  category={true}
                />
              ))
          )}
        </DialogContent>
      </Dialog>
    </Grid>
  );
}
