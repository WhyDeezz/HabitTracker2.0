import jwt from "jsonwebtoken";

const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "default_secret_123", {
    expiresIn: "30d",
  });
};

export default generateToken;
