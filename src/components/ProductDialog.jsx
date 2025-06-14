import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Typography,
  Box,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import { TextField } from "formik-mui";
import * as Yup from "yup";
import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";

const statusOptions = ["Mới", "Cũ"];

const validationSchema = Yup.object().shape({
  brand: Yup.string().required("Bắt buộc"),
  categoryId: Yup.string().required("Chọn dòng"),
  imeiNumber: Yup.string().required("Bắt buộc"),
  color: Yup.string().required("Bắt buộc"),
  storage: Yup.string().required("Bắt buộc"),
  battery: Yup.number().min(0).max(100).required("Bắt buộc"),
  buyingPrice: Yup.number().required("Bắt buộc"),
  sellingPrice: Yup.number().required("Bắt buộc"),
});

export default function ProductDialog({
  open,
  onClose,
  categories,
  handleUploadImage,
  editingProduct,
  viewOnly = false,
}) {
  const [showDetails, setShowDetails] = useState(viewOnly);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {viewOnly ? "Chi tiết sản phẩm" : editingProduct ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm"}
      </DialogTitle>
      {showDetails ? (
        <DialogContent dividers>
          <Box>
            <Typography><strong>Hãng:</strong> {editingProduct?.brand}</Typography>
            <Typography><strong>IMEI:</strong> {editingProduct?.imeiNumber}</Typography>
            <Typography><strong>Dòng:</strong> {categories.find(c => c.id === editingProduct?.categoryId)?.name}</Typography>
            <Typography><strong>Màu:</strong> {editingProduct?.color}</Typography>
            <Typography><strong>Bộ nhớ:</strong> {editingProduct?.storage}</Typography>
            <Typography><strong>Pin:</strong> {editingProduct?.battery}%</Typography>
            <Typography><strong>Giá mua:</strong> {editingProduct?.buyingPrice} ₫</Typography>
            <Typography><strong>Giá bán:</strong> {editingProduct?.sellingPrice} ₫</Typography>
            <Typography><strong>Tình trạng:</strong> {editingProduct?.status}</Typography>
            <Typography><strong>Ghi chú:</strong> {editingProduct?.note}</Typography>
            <Typography><strong>Ngày tạo:</strong> {editingProduct?.createdAt?.toDate?.().toLocaleString?.()}</Typography>
          </Box>
          <DialogActions>
            <Button onClick={onClose}>Đóng</Button>
          </DialogActions>
        </DialogContent>
      ) : (
        <Formik
          initialValues={{
            brand: editingProduct?.brand || "",
            categoryId: editingProduct?.categoryId || "",
            color: editingProduct?.color || "",
            imeiNumber: editingProduct?.imeiNumber || "",
            storage: editingProduct?.storage || "",
            battery: editingProduct?.battery || "",
            buyingPrice: editingProduct?.buyingPrice || "",
            sellingPrice: editingProduct?.sellingPrice || "",
            imageFile: null,
            status: editingProduct?.status || "Mới",
            note: editingProduct?.note || "",
            isSelling: false,
            createdAt: editingProduct?.createdAt || new Date(),
          }}
          validationSchema={validationSchema}
          onSubmit={async (values, { resetForm }) => {
            try {
              let imagePath = editingProduct?.imagePath || "";
              if (values.imageFile) {
                imagePath = await handleUploadImage(values.imageFile);
              }
              const { imageFile: _imageFile, ...productData } = values;
              if (editingProduct) {
                await updateDoc(doc(db, "products", editingProduct.id), {
                  ...productData,
                  imagePath,
                });
              } else {
                await addDoc(collection(db, "products"), {
                  ...productData,
                  imagePath,
                });
              }
              resetForm();
              onClose();
              alert("Thêm sản phẩm thành công!");
            } catch (err) {
              alert("Lỗi khi thêm sản phẩm");
              console.error(err);
            }
          }}
        >
          {({ setFieldValue, values }) => (
            <Form>
              <DialogContent dividers>
                <Field
                  component={TextField}
                  name="brand"
                  label="Hãng"
                  fullWidth
                  margin="dense"
                />
                <Field
                  component={TextField}
                  name="imeiNumber"
                  label="6 số cuối IMEI"
                  fullWidth
                  margin="dense"
                />
                <Field
                  component={TextField}
                  name="categoryId"
                  label="Chọn dòng"
                  fullWidth
                  select
                  margin="dense"
                >
                  {categories.map((cat) => (
                    <MenuItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </MenuItem>
                  ))}
                </Field>
                <Field
                  component={TextField}
                  name="color"
                  label="Màu sắc"
                  fullWidth
                  margin="dense"
                />
                <Field
                  component={TextField}
                  name="storage"
                  label="Bộ nhớ"
                  fullWidth
                  margin="dense"
                />
                <Field
                  component={TextField}
                  name="battery"
                  type="number"
                  label="Dung lượng pin (%)"
                  fullWidth
                  margin="dense"
                />
                <Field
                  component={TextField}
                  name="buyingPrice"
                  type="number"
                  label="Giá mua (₫)"
                  fullWidth
                  margin="dense"
                />
                <Field
                  component={TextField}
                  name="sellingPrice"
                  type="number"
                  label="Giá bán (₫)"
                  fullWidth
                  margin="dense"
                />
                <Button variant="outlined" component="label" sx={{ mt: 1 }}>
                  Chọn ảnh
                  <input
                    hidden
                    type="file"
                    accept="image/*"
                    onChange={(e) =>
                      setFieldValue("imageFile", e.target.files[0])
                    }
                  />
                </Button>
                {values.imageFile && (
                  <Typography mt={1}>{values.imageFile.name}</Typography>
                )}
                <Field
                  component={TextField}
                  name="status"
                  label="Tình trạng"
                  select
                  fullWidth
                  margin="dense"
                >
                  {statusOptions.map((status) => (
                    <MenuItem key={status} value={status}>
                      {status}
                    </MenuItem>
                  ))}
                </Field>
                <Field
                  component={TextField}
                  name="note"
                  label="Ghi chú"
                  fullWidth
                  margin="dense"
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={onClose}>Hủy</Button>
                <Button type="submit" variant="contained">
                  {editingProduct ? "Cập nhật" : "Thêm"}
                </Button>
                
              </DialogActions>
            </Form>
          )}
        </Formik>
      )}
    </Dialog>
  );
}
