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
  doc,
  getDoc,
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
    totalRevenueThisMonth: 0,
    topCategoriesMonth: {},
    topCategoriesYear: {},
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
      const categoryCountMonth = {};
      let totalRevenueThisMonth = 0;

      for (const docItem of orderSnap.docs) {
        const data = docItem.data();
        const staff = data.staffName || "Không rõ";
        salesCount[staff] = (salesCount[staff] || 0) + data.products.length;

        const products = data.products || [];
        totalRevenueThisMonth += products.reduce(
          (sum, p) => sum + (p.price || 0),
          0
        );

        for (const p of products) {
          const categoryId = p.categoryId || "Không rõ";
          if (!categoryCountMonth[categoryId]) {
            const categoryRef = doc(db, "categories", categoryId);
            const categorySnap = await getDoc(categoryRef);
            if (categorySnap.exists()) {
              const catData = categorySnap.data();
              categoryCountMonth[categoryId] = {
                name: catData.name || "Không rõ",
                imageUrl: catData.imageUrl || "",
                sold: 1,
              };
            }
          } else {
            categoryCountMonth[categoryId].sold++;
          }
        }
      }

      const allOrderSnap = await getDocs(
        query(collection(db, "orders"), where("createdAt", ">=", startOfYear))
      );

      const ordersPerMonth = Array(12).fill(0);
      const salesPerMonth = Array(12).fill(0);
      let totalRevenueThisYear = 0;
      const categoryCountYear = {};

      for (const docItem of allOrderSnap.docs) {
        const data = docItem.data();
        const createdAt = data.createdAt?.toDate();
        const month = dayjs(createdAt).month();

        const products = data.products || [];
        const orderTotal = products.reduce((sum, p) => sum + (p.price || 0), 0);
        totalRevenueThisYear += orderTotal;

        ordersPerMonth[month]++;
        salesPerMonth[month] += products.length;

        for (const p of products) {
          const categoryId = p.categoryId || "Không rõ";
          if (!categoryCountYear[categoryId]) {
            const categoryRef = doc(db, "categories", categoryId);
            const categorySnap = await getDoc(categoryRef);
            if (categorySnap.exists()) {
              const catData = categorySnap.data();
              categoryCountYear[categoryId] = {
                name: catData.name || "Không rõ",
                imageUrl: catData.imageUrl || "",
                sold: 1,
              };
            }
          } else {
            categoryCountYear[categoryId].sold++;
          }
        }
      }

      setStats({
        productsThisMonth: productSnap.size,
        ordersThisMonth: orderSnap.size,
        salesByStaff: salesCount,
        ordersPerMonth,
        salesPerMonth,
        totalRevenueThisYear,
        totalRevenueThisMonth,
        topCategoriesMonth: categoryCountMonth,
        topCategoriesYear: categoryCountYear,
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

  const renderTopCategories = (data, title) => (
    <Box mt={3}>
      <Typography variant="subtitle1" gutterBottom>
        {title}
      </Typography>
      {Object.entries(data)
        .sort((a, b) => b[1].sold - a[1].sold)
        .slice(0, 5)
        .map(([id, category]) => (
          <Box key={id} display="flex" alignItems="center" gap={2} mb={1}>
            <img
              src={category.imageUrl}
              alt={category.name}
              width={40}
              height={40}
              style={{ borderRadius: 8, objectFit: "cover" }}
            />
            <Typography>
              {category.name}: <strong>{category.sold}</strong>
            </Typography>
          </Box>
        ))}
    </Box>
  );

  return (
    <Box p={4}>
      <Grid container spacing={3} sx={{ width: "100%" }}>
        <Grid item xs={12} md={9}>
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

          <Box mt={5} sx={{ width: "100%" }}>
            <Typography variant="h5" gutterBottom>
              📆 Thống kê năm nay
            </Typography>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Paper elevation={4} sx={{ p: 3, height: 480 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    📈 Đơn hàng theo tháng
                  </Typography>
                  <Box sx={{ height: "100%" }}>
                    <Bar
                      data={ordersChartData}
                      height={420}
                      options={{ maintainAspectRatio: false }}
                    />
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
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

        <Grid
          item
          xs={12}
          md={3}
          spacing={5}
          sx={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Card
            elevation={6}
            sx={{ p: 4, mb: 4, textAlign: "center", height: "100%" }}
          >
            <Typography variant="h5" gutterBottom>
              💰 Tổng doanh thu tháng {dayjs().month() + 1}
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h3" color="primary">
              {stats.totalRevenueThisMonth.toLocaleString("vi-VN")} ₫
            </Typography>
            {renderTopCategories(
              stats.topCategoriesMonth,
              "🔥 Dòng sản phẩm bán chạy tháng này"
            )}
          </Card>

          <Card
            elevation={6}
            sx={{ p: 4, textAlign: "center", height: "100%", ml: 5 }}
          >
            <Typography variant="h5" gutterBottom>
              💰 Tổng doanh thu năm
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h3" color="secondary">
              {stats.totalRevenueThisYear.toLocaleString("vi-VN")} ₫
            </Typography>
            {renderTopCategories(
              stats.topCategoriesYear,
              "🏆 Dòng sản phẩm bán chạy trong năm"
            )}
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
