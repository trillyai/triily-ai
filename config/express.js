import { json } from "express";
import "dotenv/config";

export default (app) => {
  app.use(json());
  // app.use(
  //   cors({
  //     origin: process.env.ORIGIN,
  //     credentials: true,
  //   })
  // );
};
