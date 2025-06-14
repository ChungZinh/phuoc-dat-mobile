import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
  Typography,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import { TextField } from "formik-mui";
import * as Yup from "yup";
import { addDoc, collection, updateDoc, doc } from "firebase/firestore";
import { db } from "../firebase/firebase"; // Import Firestore database

const statusOptions = ["Mới", "Cũ"];

const validationSchema = Yup.object().shape({
  brand: Yup.string().required("Bắt buộc"),
  categoryId: Yup.string().required("Chọn dòng"),
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
  editingProduct, // Sản phẩm đang chỉnh sửa, nếu có
}) {
  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>Thêm sản phẩm</DialogTitle>
      <Formik
        initialValues={{
          brand: editingProduct?.brand || "",
          categoryId: editingProduct?.categoryId || "",
          color: editingProduct?.color || "",
          storage: editingProduct?.storage || "",
          battery: editingProduct?.battery || "",
          buyingPrice: editingProduct?.buyingPrice || "",
          sellingPrice: editingProduct?.sellingPrice || "",
          imageFile: null,
          status: editingProduct?.status || "Mới",
          note: editingProduct?.note || "",
          isSelling: false,
          createdAt: editingProduct?.createdAt || new Date(), // 🆕 Thêm dòng này
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          try {
            let imagePath = editingProduct?.imagePath || "";

            // Nếu người dùng chọn ảnh mới thì mới upload
            if (values.imageFile) {
              imagePath = await handleUploadImage(values.imageFile);
            }

            // Loại bỏ imageFile vì Firestore không cho phép lưu File object
            const { imageFile: _imageFile, ...productData } = values;

            // Thêm sản phẩm vào Firestore
            if (editingProduct) {
              // update
              await updateDoc(doc(db, "products", editingProduct.id), {
                ...productData,
                imagePath,
              });
            } else {
              // thêm mới
              await addDoc(collection(db, "products"), {
                ...productData,
                imagePath,
              });
            }

            // Reset form và làm mới danh sách
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
                Thêm
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
