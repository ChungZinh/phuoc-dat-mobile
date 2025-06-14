import React, { useEffect, useState } from "react";
import {
  Button,
  Container,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase/firebase";
import UserDialog from "../components/UserDialog";

export default function User() {
  const [users, setUsers] = useState([]);
  const [openDialog, setOpenDialog] = useState(false);

  const fetchUsers = async () => {
    const snapshot = await getDocs(collection(db, "users"));
    const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    setUsers(list);
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <Container>
      <Box display="flex" justifyContent="space-between" alignItems="center" my={2}>
        <Typography variant="h5">Quản lý người dùng</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Thêm người dùng
        </Button>
      </Box>

      <List>
        {users.map((user) => (
          <ListItem key={user.id} divider>
            <ListItemText
              primary={user.name || user.email}
              secondary={user.email}
            />
          </ListItem>
        ))}
      </List>

      <UserDialog
        open={openDialog}
        onClose={() => {
          setOpenDialog(false);
          fetchUsers();
        }}
      />
    </Container>
  );
}     