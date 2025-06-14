import React from "react";
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  IconButton,
  Grid,
} from "@mui/material";
import ProductListItem from "./ProductListItem";

export default function ProductList({ products, handleDelete, handleEdit }) {
  const selling = products.filter((p) => p.isSelling); // đã bán
  const available = products.filter((p) => !p.isSelling); // chưa bán
  const totalBuying = available.reduce(
    (sum, item) => sum + Number(item.buyingPrice || 0),
    0
  );
  const totalSelling = selling.reduce(
    (sum, item) => sum + Number(item.sellingPrice || 0),
    0
  );
  return (
    <Box>
      {/* 📦 Danh sách sản phẩm chưa bán */}
      <Typography variant="h6" gutterBottom>
        Sản phẩm đang có
      </Typography>
      <Paper sx={{ p: 2, mb: 4 }}>
        <List>
          {available.map((item) => (
            <ProductListItem
              key={item.id}
              item={item}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
            />
          ))}
        </List>
        <Box textAlign="right" mt={2}>
          <Typography variant="subtitle1" fontWeight="bold">
            💰 Tổng tiền mua vào: {totalBuying.toLocaleString("vi-VN")}₫
          </Typography>
        </Box>
      </Paper>

      {/* 🧾 Danh sách sản phẩm đã bán */}
      {selling.length > 0 && (
        <>
          <Typography variant="h6" gutterBottom color="error">
            Sản phẩm đã bán
          </Typography>
          <Paper sx={{ p: 2, backgroundColor: "#ffebee" }}>
            <List>
              {selling.map((item) => (
                <ProductListItem
                  key={item.id}
                  item={item}
                  handleDelete={handleDelete}
                  handleEdit={handleEdit}
                />
              ))}
            </List>
            <Box textAlign="right" mt={2}>
              <Typography variant="subtitle1" fontWeight="bold">
                💸 Tổng tiền bán ra: {totalSelling.toLocaleString("vi-VN")}₫
              </Typography>
            </Box>
          </Paper>
        </>
      )}
    </Box>
  );
}
