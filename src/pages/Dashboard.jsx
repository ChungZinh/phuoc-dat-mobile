import React, { useEffect, useState } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Divider,
} from "@mui/material";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
} from "chart.js";
import {
  collection,
  getDocs,
  query,
  where,
  Timestamp,
} from "firebase/firestore";
import { db } from "../firebase/firebase";
import dayjs from "dayjs";

ChartJS.register(Tooltip, Legend, CategoryScale, LinearScale, BarElement);

export default function DashboardScreen() {
  const [stats, setStats] = useState({
    productsThisMonth: 0,
    ordersThisMonth: 0,
    salesByStaff: {},
    ordersPerMonth: Array(12).fill(0),
    salesPerMonth: Array(12).fill(0),
    totalRevenueThisYear: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      const now = dayjs();
      const startOfMonth = Timestamp.fromDate(new Date(now.startOf("month")));
      const startOfYear = Timestamp.fromDate(new Date(now.startOf("year")));

      const productSnap = await getDocs(
        query(
          collection(db, "products"),
          where("createdAt", ">=", startOfMonth)
        )
      );

      const orderSnap = await getDocs(
        query(collection(db, "orders"), where("createdAt", ">=", startOfMonth))
      );

      const salesCount = {};
      orderSnap.forEach((doc) => {
        const staff = doc.data().staffName || "Không rõ";
        salesCount[staff] =
          (salesCount[staff] || 0) + doc.data().products.length;
      });

      const allOrderSnap = await getDocs(
        query(collection(db, "orders"), where("createdAt", ">=", startOfYear))
      );

      const ordersPerMonth = Array(12).fill(0);
      const salesPerMonth = Array(12).fill(0);
      let totalRevenueThisYear = 0;

      allOrderSnap.forEach((doc) => {
        const data = doc.data();
        const createdAt = data.createdAt?.toDate();
        const month = dayjs(createdAt).month();

        const products = data.products || [];
        const orderTotal = products.reduce((sum, p) => sum + (p.price || 0), 0);
        totalRevenueThisYear += orderTotal;

        ordersPerMonth[month]++;
        salesPerMonth[month] += products.length;
      });

      setStats({
        productsThisMonth: productSnap.size,
        ordersThisMonth: orderSnap.size,
        salesByStaff: salesCount,
        ordersPerMonth,
        salesPerMonth,
        totalRevenueThisYear,
      });
    };

    fetchStats();
  }, []);

  const months = [
    "Thg 1",
    "Thg 2",
    "Thg 3",
    "Thg 4",
    "Thg 5",
    "Thg 6",
    "Thg 7",
    "Thg 8",
    "Thg 9",
    "Thg 10",
    "Thg 11",
    "Thg 12",
  ];

  const ordersChartData = {
    labels: months,
    datasets: [
      {
        label: "Đơn hàng",
        backgroundColor: "#42a5f5",
        data: stats.ordersPerMonth,
      },
    ],
  };

  const salesChartData = {
    labels: months,
    datasets: [
      {
        label: "Sản phẩm đã bán",
        backgroundColor: "#66bb6a",
        data: stats.salesPerMonth,
      },
    ],
  };

  return (
    <Box p={4} >
      <Grid container spacing={3} sx={{
        width: '100%'
      }}>
        {/* Cột trái: thống kê tháng + biểu đồ */}
        <Grid item xs={12} size={9}>
          <Box mb={3}>
            <Typography variant="h5" gutterBottom>
              📊 Thống kê tháng này
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} sm={6} lg={4}>
                <Card elevation={4}>
                  <CardContent>
                    <Typography variant="subtitle1">
                      📦 Sản phẩm đã thêm
                    </Typography>
                    <Typography variant="h4" color="primary">
                      {stats.productsThisMonth}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} lg={4}>
                <Card elevation={4}>
                  <CardContent>
                    <Typography variant="subtitle1">🧾 Số đơn hàng</Typography>
                    <Typography variant="h4" color="success.main">
                      {stats.ordersThisMonth}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} lg={4}>
                <Card elevation={4}>
                  <CardContent>
                    <Typography variant="subtitle1">
                      👨‍💼 Bán theo nhân viên
                    </Typography>
                    <Box mt={1}>
                      {Object.entries(stats.salesByStaff).map(
                        ([staff, count]) => (
                          <Typography key={staff}>
                            👤 {staff}: <strong>{count}</strong>
                          </Typography>
                        )
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>

          {/* Thống kê năm nay */}
          <Box mt={5} 
            sx={{
              width: '100%',
            }}
          >
            <Typography variant="h5" gutterBottom>
              📆 Thống kê năm nay
            </Typography>

            <Grid container spacing={3}>
              {/* === BIỂU ĐỒ 1: ĐƠN HÀNG === */}
              <Grid item xs={12} md={12} size={6}>
                <Paper elevation={4} sx={{ p: 3, height: 480 }}>
                  {" "}
                  {/* tăng height */}
                  <Typography variant="subtitle1" gutterBottom>
                    📈 Đơn hàng theo tháng
                  </Typography>
                  {/* bọc trong Box để chiếm hết chiều cao Paper */}
                  <Box sx={{ height: "100%" }}>
                    <Bar
                      data={ordersChartData}
                      height={420} /* cao hơn */
                      options={{
                        maintainAspectRatio: false,
                      }} /* dùng full height */
                    />
                  </Box>
                </Paper>
              </Grid>

              {/* === BIỂU ĐỒ 2: SẢN PHẨM BÁN === */}
              <Grid item xs={12} md={12} size={6}>
                <Paper elevation={4} sx={{ p: 3, height: 480 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    📦 Sản phẩm bán theo tháng
                  </Typography>

                  <Box sx={{ height: "100%" }}>
                    <Bar
                      data={salesChartData}
                      height={420}
                      options={{ maintainAspectRatio: false }}
                    />
                  </Box>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </Grid>

        {/* Cột phải: Tổng doanh thu */}
        <Grid item xs={12} size={3}>
          <Card
            elevation={6}
            sx={{
              p: 4,
              height: "100%",
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              textAlign: "center",
            }}
          >
            <Typography variant="h5" gutterBottom>
              💰 Tổng doanh thu năm
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h3" color="secondary">
              {stats.totalRevenueThisYear.toLocaleString("vi-VN")} ₫
            </Typography>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
