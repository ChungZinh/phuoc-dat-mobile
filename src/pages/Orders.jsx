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
import DeleteIcon from "@mui/icons-material/Delete";
import {
  collection,
  getDocs,
  orderBy,
  query,
  Timestamp,
  updateDoc,
  where,
  deleteDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import dayjs from "dayjs";

// ... (import không đổi)
import EditIcon from "@mui/icons-material/Edit";

// ... (component Orders bắt đầu)

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");

  const [editValues, setEditValues] = useState({
    buyerName: "",
    phone: "",
    address: "",
    note: "",
  });

  const currentMonth = new Date().toLocaleString("vi-VN", {
    month: "long",
    year: "numeric",
  });

  const fetchOrders = async () => {
    setLoading(true);
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
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleDeleteOrder = async (orderId) => {
    const confirmDelete = window.confirm("Bạn có chắc muốn xóa đơn hàng này?");
    if (!confirmDelete) return;

    try {
      await deleteDoc(doc(db, "orders", orderId));
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error("Lỗi khi xóa đơn hàng:", error);
    }
  };

  const handleOpenDialog = (order) => {
    setSelectedOrder(order);
    setEditValues({
      buyerName: order.buyerName || "",
      phone: order.phone || "",
      address: order.address || "",
      note: order.note || "",
    });
  };

  const handleUpdateOrder = async () => {
    try {
      await updateDoc(doc(db, "orders", selectedOrder.id), {
        buyerName: editValues.buyerName,
        phone: editValues.phone,
        address: editValues.address,
        note: editValues.note,
      });
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error("Lỗi khi cập nhật đơn hàng:", error);
    }
  };

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
                  <IconButton onClick={() => handleOpenDialog(order)}>
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

      {/* Dialog chi tiết + cập nhật */}
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
              <TextField
                label="Tên người mua"
                fullWidth
                value={editValues.buyerName}
                onChange={(e) =>
                  setEditValues({ ...editValues, buyerName: e.target.value })
                }
                margin="normal"
              />
              <TextField
                label="Số điện thoại"
                fullWidth
                value={editValues.phone}
                onChange={(e) =>
                  setEditValues({ ...editValues, phone: e.target.value })
                }
                margin="normal"
              />
              <TextField
                label="Địa chỉ"
                fullWidth
                value={editValues.address}
                onChange={(e) =>
                  setEditValues({ ...editValues, address: e.target.value })
                }
                margin="normal"
              />
              <TextField
                label="Ghi chú"
                fullWidth
                value={editValues.note}
                onChange={(e) =>
                  setEditValues({ ...editValues, note: e.target.value })
                }
                margin="normal"
              />

              <Typography
                variant="body2"
                color="text.secondary"
                gutterBottom
                mt={2}
              >
                🕒 Ngày tạo đơn:{" "}
                {selectedOrder.createdAt?.toDate().toLocaleString("vi-VN", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Typography>

              <Typography>Thanh toán: {selectedOrder.paymentMethod}</Typography>

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
                              IMEI: {p.imeiNumber || "không có"}
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
          <Button
            color="error"
            startIcon={<DeleteIcon />}
            onClick={() => handleDeleteOrder(selectedOrder.id)}
          >
            Xóa đơn
          </Button>
          <Button
            startIcon={<EditIcon />}
            variant="contained"
            onClick={handleUpdateOrder}
          >
            Cập nhật
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
