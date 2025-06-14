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
  getDocs,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import { supabase } from "../supabase/supabase"; // Kết nối Supabase

export default function Category() {
  const [name, setName] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [categories, setCategories] = useState([]);

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
      });

      setName("");
      setImageFile(null);
    } catch (err) {
      alert("Lỗi khi upload ảnh hoặc lưu dữ liệu.");
      console.error(err);
    }
  };

  useEffect(() => {
    const unsubscribe = onSnapshot(categoriesRef, (snapshot) => {
      const catList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
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
            {categories.map((cat) => (
              <Box key={cat.id}>
                <ListItem
                  key={cat.id}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => handleDelete(cat.id)}>
                      <DeleteIcon />
                    </IconButton>
                  }
                >
                  {/* Flex  */}
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <img
                      src={cat.imageUrl}
                      alt={cat.name}
                      style={{ width: 50, height: 50, marginRight: 16 }}
                    />
                    <ListItemText primary={cat.name} />
                  </Box>
                </ListItem>
                <Divider/>
              </Box>
            ))}
          </List>
        </Paper>
      </Grid>
    </Grid>
  );
}
