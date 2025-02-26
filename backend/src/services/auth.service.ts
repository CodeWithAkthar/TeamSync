import mongoose, { mongo } from "mongoose";
import UserModel from "../models/user.model";
import AccountModel from "../models/account.model";
import WorkspaceModel from "../models/workspace.model";
import RoleModel from "../models/roles.premission.model";
import { Roles } from "../enums/roles.enum";
import { NotFoundException } from "../utils/appError";
import MemberModel from "../models/member.model";

export const loginOrCreateAccountService = async (data: {
  provider: string;
  displayName: string;
  porviderId: string;
  picture?: string;
  email?: string;
}) => {
  const { porviderId, provider, displayName, email, picture } = data;
  const session = await mongoose.startSession();
  
  try {
    // Start transaction explicitly
    session.startTransaction();
    console.log("Start session...");

    let user = await UserModel.findOne({ email }).session(session);
    if (!user) {
      //create a new user if it doesnt exist
      user = new UserModel({
        email,
        name: displayName,
        profilePicture: picture || null,
      });
      await user.save({ session });

      const account = new AccountModel({
        userId: user._id,
        provider: provider,
        providerId: porviderId,
      });
      await account.save({ session });

      //create a new workspace for the user
      const workspace = new WorkspaceModel({
        name: `My workspace`,
        descripition: `Workspace created for ${user.name}`,
        owner: user._id,
      });
      await workspace.save({ session });

      const ownerRole = await RoleModel.findOne({
        name: Roles.OWNER,
      }).session(session);

      if (!ownerRole) {
        throw new NotFoundException("Owner role not found");
      }

      const member = new MemberModel({
        userId: user._id,
        workspaceId: workspace._id,
        role: ownerRole._id,
        joinedAt: new Date(),
      });
      await member.save({ session });

      user.currentWorkspace = workspace._id as mongoose.Types.ObjectId;
      await user.save({ session });
    }
    
    // Commit the transaction
    await session.commitTransaction();
    console.log("Transaction committed successfully");
    
    // Return the user
    return { user };
  } catch (error) {
    // Log the error to see what's happening
    console.error("Transaction error:", error);
    
    // Abort the transaction if it's active
    if (session.inTransaction()) {
      await session.abortTransaction();
      console.log("Transaction aborted due to error");
    }
    
    throw error;
  } finally {
    // Only end the session once, in the finally block
    session.endSession();
    console.log("Session ended");
  }
};
