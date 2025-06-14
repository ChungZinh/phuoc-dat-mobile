import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  MenuItem,
} from "@mui/material";
import { Formik, Form, Field } from "formik";
import { TextField } from "formik-mui";
import * as Yup from "yup";
import {
  addDoc,
  updateDoc,
  collection,
  doc,
} from "firebase/firestore";
import { db } from "../firebase/firebase";

const validationSchema = Yup.object().shape({
  name: Yup.string().required("Tên không được để trống"),
  email: Yup.string().email("Email không hợp lệ").required("Bắt buộc"),
  role: Yup.string().required("Chọn vai trò"),
});

export default function UserDialog({ open, onClose, editingUser }) {
  const isEdit = Boolean(editingUser);

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {isEdit ? "Cập nhật người dùng" : "Thêm người dùng"}
      </DialogTitle>
      <Formik
        initialValues={{
          name: editingUser?.name || "",
          email: editingUser?.email || "",
          role: editingUser?.role || "user",
        }}
        validationSchema={validationSchema}
        onSubmit={async (values, { resetForm }) => {
          try {
            if (isEdit) {
              await updateDoc(doc(db, "users", editingUser.id), values);
            } else {
              await addDoc(collection(db, "users"), values);
            }
            resetForm();
            onClose();
          } catch (err) {
            console.error("Lỗi:", err);
          }
        }}
      >
        {() => (
          <Form>
            <DialogContent>
              <Field
                component={TextField}
                name="name"
                label="Tên"
                fullWidth
                margin="dense"
              />
              <Field
                component={TextField}
                name="email"
                label="Email"
                fullWidth
                margin="dense"
              />
              <Field
                component={TextField}
                name="role"
                label="Vai trò"
                select
                fullWidth
                margin="dense"
              >
                <MenuItem value="admin">Admin</MenuItem>
                <MenuItem value="user">User</MenuItem>
              </Field>
            </DialogContent>
            <DialogActions>
              <Button onClick={onClose}>Hủy</Button>
              <Button type="submit" variant="contained">
                {isEdit ? "Cập nhật" : "Thêm"}
              </Button>
            </DialogActions>
          </Form>
        )}
      </Formik>
    </Dialog>
  );
}
