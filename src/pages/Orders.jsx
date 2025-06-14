import React, { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
} from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  where,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import dayjs from "dayjs";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  const currentMonth = new Date().toLocaleString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  useEffect(() => {
    async function fetchOrders() {
      try {
        const startOfMonth = Timestamp.fromDate(
          new Date(dayjs().startOf("month").toDate())
        );
        const q = query(
          collection(db, "orders"),
          where("createdAt", ">=", startOfMonth),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(q);
        const result = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOrders(result);
      } catch (error) {
        console.error("Lỗi khi tải đơn hàng:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchOrders();
  }, []);

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" mt={4}>
        <CircularProgress />
      </Box>
    );
  }

  const filteredOrders = orders.filter((order) => {
    const keyword = searchKeyword.toLowerCase();
    return (
      order.buyerName?.toLowerCase().includes(keyword) ||
      order.phone?.toLowerCase().includes(keyword)
    );
  });

  return (
    <Box p={2}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        Đơn hàng {currentMonth}
      </Typography>
      <TextField
        label="Tìm theo tên hoặc số điện thoại"
        variant="outlined"
        fullWidth
        size="small"
        margin="normal"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
      />

      <Paper elevation={2}>
        <List>
          {filteredOrders.map((order, index) => (
            <React.Fragment key={order.id}>
              <ListItem
                alignItems="flex-start"
                secondaryAction={
                  <IconButton onClick={() => setSelectedOrder(order)}>
                    <VisibilityIcon />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={
                    <>
                      🧑 {order.buyerName} | 📞 {order.phone}
                    </>
                  }
                  secondary={
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {order.products?.length} sản phẩm | Tổng tiền:{" "}
                        {order.products
                          .reduce((sum, p) => sum + (p.price || 0), 0)
                          .toLocaleString("vi-VN")}
                        ₫
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Thanh toán: {order.paymentMethod} | NV:{" "}
                        {order.staffName}
                      </Typography>
                    </>
                  }
                />
              </ListItem>
              {index < orders.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      </Paper>

      {/* 👁️ Dialog chi tiết đơn hàng */}
      <Dialog
        open={!!selectedOrder}
        onClose={() => setSelectedOrder(null)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Chi tiết đơn hàng</DialogTitle>
        <DialogContent dividers>
          {selectedOrder && (
            <>
              <Typography fontWeight="bold" mb={2}>
                Khách hàng: {selectedOrder.buyerName} | {selectedOrder.phone}
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                👤 Nhân viên bán hàng:{" "}
                <strong>{selectedOrder.staffName}</strong>
              </Typography>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                🕒 Ngày tạo đơn:{" "}
                {selectedOrder.createdAt?.toDate().toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>
              <Typography>Địa chỉ: {selectedOrder.address}</Typography>
              <Typography>
                Số điện thoại: {selectedOrder.phone || "Không có"}
              </Typography>
              <Typography>
                Email: {selectedOrder.email || "Không có"}
              </Typography>
              <Typography>Thanh toán: {selectedOrder.paymentMethod}</Typography>
              {selectedOrder.note && (
                <Typography>Ghi chú: {selectedOrder.note}</Typography>
              )}
              <Typography mt={2} fontWeight="bold">
                Danh sách sản phẩm:
              </Typography>
              <Box mt={1}>
                <Grid container spacing={2}>
                  {selectedOrder.products?.map((p, idx) => (
                    <Grid item xs={12} key={idx}>
                      <Paper
                        sx={{
                          p: 2,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                        }}
                        variant="outlined"
                      >
                        <Box display="flex" alignItems="center" gap={2} mb={2}>
                          <Box
                            component="img"
                            src={p.imagePath}
                            alt={p.model}
                            sx={{
                              width: 60,
                              height: 60,
                              borderRadius: 1,
                              border: "1px solid #ddd",
                              objectFit: "cover",
                            }}
                          />
                          <Box>
                            <Typography fontWeight="bold">
                              📱 {p.model} - {p.storage} - {p.color}
                            </Typography>
                            <Typography>
                              Giá: {p.price.toLocaleString("vi-VN")}₫
                            </Typography>
                            <Typography>
                              IMEI: {p.imeiNumber ? p.imeiNumber : "không có"}
                            </Typography>
                          </Box>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedOrder(null)}>Đóng</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
