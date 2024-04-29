import  express  from 'express';
import { acceptRequest, getAllNotifications, getMyFriends, getMyProfile, login, logout, newUsers, searchUser, sendRequest } from '../controllers/user.js';
import {multerUpload} from '../middlewares/multer.js'
import { isAuthenticated } from '../middlewares/auth.js';

const app = express.Router();

app.post('/new', multerUpload.single('avatar'), newUsers );
app.post("/login", login);


app.use(isAuthenticated);
// below this user must be login 
app.get( '/me', getMyProfile);
app.get("/logout", logout);
app.get("/search", searchUser);
app.put("/sendrequest", sendRequest);
app.put("/acceptrequest", acceptRequest);
app.get("/notifications", getAllNotifications);
app.get("/friends", getMyFriends);

export default app;