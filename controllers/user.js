// create new user and save it to db
import { User } from "./../models/user.js";
import { cookieOption, emitEvent, sendToken, uploadFilesToCloudinary } from "../utils/features.js";
import { compare } from "bcrypt";
import { ErrorHandler } from "../utils/utility.js";
import { TryCatch } from "../middlewares/error.js";
import { Chat } from "../models/chat.js";
import { Request } from "./../models/request.js";
import { NEW_REQUEST, REFETCH_CHATS } from "../constants/events.js";
import { getOtherMember } from "./../lib/helper.js";

const newUsers = TryCatch(async (req, res, next) => {
  const { name, username, password, bio } = req.body;

  const file = req.file;
  if (!file) return next(new ErrorHandler("PLease upload Avatar"));

const result = await uploadFilesToCloudinary([file]);
  const avatar = {
    public_id: result[0].public_id,
    url: result[0].url,
  };
  const user = await User.create({ name, username, password, bio, avatar });
  sendToken(res, user, 201, "User Created");
});

const login = TryCatch(async (req, res, next) => {
  const { username, password } = req.body;
  const user = await User.findOne({ username }).select(["+password"]);
  if (!user) return next(new ErrorHandler("Invalid UserName OR Password", 404));
  const isMatch = await compare(password, user.password);
  if (!isMatch)
    return next(new ErrorHandler("Invalid UserName OR Password", 404));
  sendToken(res, user, 200, "welcome Back");
});
// user must be login
const getMyProfile = TryCatch(async (req, res, next) => {
  const user = await User.findById(req.user);
  res.status(200).json({
    success: true,
    user,
  });
});
const logout = TryCatch(async (req, res, next) => {
  return res
    .status(200)
    .cookie("secret-token", "", { ...cookieOption, maxAge: 0 })
    .json({
      success: true,
      message: "Logged Out Successfully",
    });
});
const searchUser = TryCatch(async (req, res) => {
  const { name = "" } = req.query;

  
  const myChats = await Chat.find({ groupChat: false, members: req.user });

  
  const allUsersFromMyChats = myChats.flatMap((chat) => chat.members);

  
  const allUsersExceptMeAndFriends = await User.find({
    _id: { $nin: allUsersFromMyChats },
    name: { $regex: name, $options: "i" },
  });
  const users = allUsersExceptMeAndFriends.map(({ _id, name, avatar }) => ({
    _id,
    name,
    avatar: avatar.url,
  }));
  return res.status(200).json({
    success: true,
    users,
  });
});
const sendRequest = TryCatch(async (req, res, next) => {
  const { userId } = req.body;
  if (!userId) {
    return next(new ErrorHandler("need  receiver id", 400));
  }
  const request = await Request.findOne({
    $or: [
      { sender: req.user, receiver: userId },
      { sender: userId, receiver: req.user },
    ],
  });
  if (request) return next(new ErrorHandler("Request already sent", 400));
  await Request.create({
    sender: req.user,
    receiver: userId,
  });
  emitEvent(req, NEW_REQUEST, [userId]);
  return res.status(200).json({
    success: true,
    message: "Friend Request Sent",
  });
});
const acceptRequest = TryCatch(async (req, res, next) => {
  const { requestId, accept } = req.body;
  if (!requestId) return next(new ErrorHandler("need  requestId", 400));
  if (typeof accept !== "boolean" || accept === null)
    return next(new ErrorHandler("Accept must be boolean ", 400));
  const request = await Request.findById(requestId)
    .populate("sender", "name")
    .populate("receiver", "name");

  console.log(request);
  if (!request) return next(new ErrorHandler("Request not found", 400));
  if (request.receiver._id.toString() !== req.user.toString())
    return next(
      new ErrorHandler("You are not allowed to accept this request", 400)
    );
  if (!accept) {
    await request.deleteOne();
    return res.status(200).json({
      success: true,
      message: "Friend Request rejected",
    });
  }

  const members = [request.sender._id, request.receiver._id];
  await Promise.all([
    Chat.create({
      members,
      name: `${request.sender.name}-${request.receiver.name}`,
    }),
    request.deleteOne(),
  ]);
  emitEvent(req, REFETCH_CHATS, members);
  return res.status(200).json({
    success: true,
    message: "Friend Request accepted",
    senderId: request.sender._id,
  });
});
const getAllNotifications = TryCatch(async (req, res, next) => {
  const request = await Request.find({ receiver: req.user }).populate(
    "sender",
    "name avatar"
  );
  const allRequests = request.map(({ _id, sender }) => ({
    _id,
    sender: {
      _id: sender._id,
      name: sender.name,
      avatar: sender.avatar.url,
    },
  }));

  return res.status(200).json({
    success: true,
    allRequests,
  });
});
const getMyFriends = TryCatch(async (req, res, next) => {
  const chatId = req.query.chatId;
  const chats = await Chat.find({
    members: req.user,
    groupChat: false,
  }).populate("members", "name avatar");

  const friends = chats.map(({ members }) => {
    const otherUSer = getOtherMember(members, req.user);
    return {
      _id: otherUSer.id,
      name: otherUSer.name,
      avatar: otherUSer.avatar.url,
    };
  });
  if (chatId) {
    const chat = await Chat.findById(chatId);
    const availableFriends = friends.filter(
      (friend) => !chat.members.includes(friend._id)
    );
    return res.status(200).json({
      success: true,
      friends: availableFriends,
    });
  } else {
    return res.status(200).json({
      success: true,
      friends,
    });
  }
});
export {
  login,
  newUsers,
  getMyProfile,
  logout,
  searchUser,
  sendRequest,
  acceptRequest,
  getAllNotifications,
  getMyFriends,
};
