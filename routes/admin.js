import express from 'express';
import { adminLogin, adminLogout, allChats, allMessages, allUsers, getAdminData, getDashboardStats } from '../controllers/admin.js';
import { adminOnly } from '../middlewares/auth.js';



const app = express.Router();



app.post('/verify',adminLogin);  // verify the login credentials of an admin
app.get("/logout",adminLogout);


app.use(adminOnly);
// only admin can access this route
app.get("/", getAdminData);
app.get("/users",allUsers);
app.get("/chats",allChats);
app.get("/messages",allMessages);
app.get("/stats",getDashboardStats);





export default app;