import { APP_TOKEN } from "../constants/config.js";
import { User } from "../models/user.js";
import { ErrorHandler } from "../utils/utility.js";
import jwt from "jsonwebtoken";

const isAuthenticated = (req, res, next) => {
  const token = req.cookies[APP_TOKEN];
  if (!token)
    return next(new ErrorHandler("Need to login to access this route", 401));

  const decodedData = jwt.verify(token, process.env.JWT_SECRET);
  req.user = decodedData._id;
  next();
};
const adminOnly = (req, res, next) => {
  const token = req.cookies["admin-token"];
  if (!token)
    return next(new ErrorHandler("ONLY Admin can access this route", 401));

  const secretKey = jwt.verify(token, process.env.JWT_SECRET);
  const adminSecretKey = process.env.ADMIN_SECRET_KEY || "aniladmin";
  const isMatch = secretKey === adminSecretKey;

  if (!isMatch) return next(new ErrorHandler("Invalid Secret Key", 401));

  next();
};
const socketAuthenticator = async (err, socket, next) => {
  try {
    if (err) return next(err);
    const authToken = socket.request.cookies[APP_TOKEN];
    if (!authToken) return next(new ErrorHandler("Please login to access", 401));
    const decodedData = jwt.verify(authToken, process.env.JWT_SECRET);
    const user = await User.findById(decodedData._id);

    if (!user) return next(new ErrorHandler("Please login to access", 401));
    socket.user = user;
    return next();
  } catch (error) {
    return next(new ErrorHandler("Please login to access", 401));
  }
};

export { isAuthenticated, adminOnly, socketAuthenticator };
