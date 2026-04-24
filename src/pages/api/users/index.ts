import { NextApiRequest, NextApiResponse } from "next";
import dbConnect from "@/lib/dbConnect";
import User from "@/models/User";
import jwt from "jsonwebtoken";
import { userAuth } from "@/utils/userAuth";
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
const isAuth = await userAuth(req, res);
  if (!isAuth) return;
  await dbConnect();
console.log("Connected to database- for getting users");


  switch (req.method) {
    case "GET":
      try {
        const users = await User.find({}, "-password"); // Exclude password field
        console.log("Fetched users:", users);
        return res.status(200).json(users);
      } 
      
      catch (error) {
        console.error("Error fetching users:", error);
        console.log("Error fetching users:", error);
        return res.status(500).json({ message: "Internal server error" });
      }

    default:
      res.setHeader("Allow", ["GET"]);
      return res.status(405).json({ message: `Method ${req.method} Not Allowed` });
  }
}
