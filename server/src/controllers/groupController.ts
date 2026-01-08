import { NextFunction, Request, Response } from "express";
import Group from "../models/Group";
import User from "../models/User";

// @desc    Create a new Squad
// @route   POST /api/groups/create
// @access  Private
export const createGroup = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { name, members, trackingType, duration, avatar, description } = req.body;

        if (!name || !duration) {
            res.status(400).json({ message: "Name and duration are required" });
            return;
        }

        if (members.length > 10) {
            res.status(400).json({ message: "Squads can have a maximum of 10 members" });
            return;
        }

        // Add creator to members list if not already there
        const allMembers = [...new Set([...members, req.user._id.toString()])];

        const group = await Group.create({
            name,
            members: allMembers,
            creator: req.user._id,
            trackingType,
            duration,
            avatar: avatar || "🚀",
            description
        });

        res.status(201).json(group);
    } catch (error) {
        next(error);
    }
};

// @desc    Get user's squads
// @route   GET /api/groups
// @access  Private
export const getUserGroups = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Find groups where the user is a member
        const groups = await Group.find({ 
            members: req.user._id 
        })
        .populate("members", "displayName username friendCode streak")
        .sort({ createdAt: -1 });

        res.json(groups);
    } catch (error) {
        next(error);
    }
};

// @desc    Leave a Squad
// @route   POST /api/groups/leave
// @access  Private
export const leaveGroup = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { groupId } = req.body;
        const group = await Group.findById(groupId);

        if (!group) {
            res.status(404).json({ message: "Group not found" });
            return;
        }

        if (group.creator.toString() === req.user._id.toString()) {
             res.status(400).json({ message: "Creator cannot leave the group. You must delete it." });
             return;
        }

        // Remove user from members
        group.members = group.members.filter(m => m.toString() !== req.user._id.toString());
        
        if (group.members.length === 0) {
            await Group.findByIdAndDelete(groupId);
            res.status(200).json({ message: "Left group successfully. Squad deleted as it is now empty." });
            return;
        }

        await group.save();

        res.status(200).json({ message: "Left group successfully" });
    } catch (error) {
        next(error);
    }
};

// @desc    Delete a Squad
// @route   DELETE /api/groups/:groupId
// @access  Private
export const deleteGroup = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { groupId } = req.params;
        const group = await Group.findById(groupId);

        if (!group) {
            res.status(404).json({ message: "Group not found" });
            return;
        }

        if (group.creator.toString() !== req.user._id.toString()) {
            res.status(403).json({ message: "Not authorized to delete this group" });
            return;
        }

        await Group.findByIdAndDelete(groupId);
        res.status(200).json({ message: "Group deleted successfully" });
    } catch (error) {
        next(error);
    }
};

// @desc    Add member to a Squad
// @route   POST /api/groups/add-member
// @access  Private
export const addMemberToGroup = async (req: any, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { groupId, memberId } = req.body;
        const group = await Group.findById(groupId);

        if (!group) {
            res.status(404).json({ message: "Group not found" });
            return;
        }

        if (group.members.length >= 10) {
            res.status(400).json({ message: "Squad is full (max 10 members)" });
            return;
        }

        if (group.members.includes(memberId)) {
            res.status(400).json({ message: "User is already a member" });
            return;
        }

        group.members.push(memberId);
        await group.save();

        res.status(200).json({ message: "Member added successfully", group });
    } catch (error) {
        next(error);
    }
};
