import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  ListItem,
  IconButton,
  Grid,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/firebase"; // đường dẫn đến firestore

export default function ProductListItem({ item, handleDelete, handleEdit }) {
  const [categoryName, setCategoryName] = useState("");

  useEffect(() => {
    async function fetchCategoryName() {
      if (!item.categoryId) return;
      const docRef = doc(db, "categories", item.categoryId);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCategoryName(docSnap.data().name);
      } else {
        setCategoryName("Không rõ danh mục");
      }
    }
    fetchCategoryName();
  }, [item.categoryId]);

  return (
    <ListItem
      alignItems="flex-start"
      sx={{ borderBottom: "1px solid #eee", py: 2 }}
      secondaryAction={
        <Box>
          <IconButton
            sx={{ mr: 1 }}
            edge="end"
            onClick={() => handleDelete(item.id)}
            color="error"
          >
            <DeleteIcon />
          </IconButton>
          <IconButton
            edge="end"
            color="primary"
            onClick={() => handleEdit(item)}
          >
            <EditIcon />
          </IconButton>
        </Box>
      }
    >
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <Box
            component="img"
            src={item.imagePath}
            alt={item.brand}
            sx={{
              width: 60,
              height: 60,
              objectFit: "cover",
              borderRadius: 1,
              border: "1px solid #ddd",
            }}
          />
        </Grid>
        <Grid item xs>
          <Typography variant="subtitle1" fontWeight="bold">
            {item.brand} {item.storage} - {item.color}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Pin: {item.battery}% | Giá bán: {item.sellingPrice}₫ | Tình trạng:{" "}
            {item.status}
          </Typography>
          {item.note && (
            <Typography variant="body2" color="text.secondary">
              Ghi chú: {item.note}
            </Typography>
          )}
          {categoryName && (
            <Typography variant="body2" color="primary">
              Danh mục: {categoryName}
            </Typography>
          )}
        </Grid>
      </Grid>
    </ListItem>
  );
}
