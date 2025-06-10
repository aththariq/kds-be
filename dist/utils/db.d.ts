import mongoose from "mongoose";
declare function connectToDatabase(): Promise<typeof mongoose>;
export default connectToDatabase;
