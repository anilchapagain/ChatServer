import express from "express";
import { multerUpload } from "../middlewares/multer.js";
import { isAuthenticated } from "../middlewares/auth.js";
import {
  addMembers,
  deleteChatDetails,
  getChatDetails,
  getMessages,
  getMyChat,
  getMyGroups,
  leaveGroup,
  newGroupChat,
  removeMember,
  renameGroup,
  sendAttachments,
} from "../controllers/chat.js";

const app = express.Router();

app.use(isAuthenticated);
// below this user must be login
app.post("/new", newGroupChat);
app.get("/my", getMyChat);
app.get("/my/groups", getMyGroups);
app.put("/addmembers", addMembers);
app.put("/removemember", removeMember);

app.delete("/leave/:id", leaveGroup);
app.post("/message",multerUpload.array('files',5), sendAttachments);
app.get('/message/:id',getMessages);
app.route('/:id').get(getChatDetails).put(renameGroup).delete(deleteChatDetails);

export default app;
