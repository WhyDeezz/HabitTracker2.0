import Group from '../models/Group';
import User from '../models/User';

/**
 * Check and reset group streaks for groups where members missed completing habits
 */
export async function checkAndResetGroupStreaks() {
    try {
        const groups = await Group.find({ isActive: true });
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);

        for (const group of groups) {
            if (group.lastGroupCompletedDate) {
                const lastDate = new Date(group.lastGroupCompletedDate);
                lastDate.setHours(0, 0, 0, 0);

                // If last completed date is before yesterday, check if streak should be reset
                if (lastDate < yesterday) {
                    // Check if any member broke their streak
                    const members = await User.find({ _id: { $in: group.members } });
                    
                    const anyMemberBrokeStreak = members.some(member => {
                        if (!member.lastCompletedDate) return true;
                        
                        const memberLastDate = new Date(member.lastCompletedDate);
                        memberLastDate.setHours(0, 0, 0, 0);
                        
                        // If member's last completed date is before yesterday, they broke the streak
                        return memberLastDate < yesterday;
                    });

                    if (anyMemberBrokeStreak && group.groupStreak > 0) {
                        group.groupStreak = 0;
                        await group.save();
                        console.log(`[GroupStreak] Reset streak for group ${group.name}`);
                    }
                }
            }
        }
    } catch (error) {
        console.error('Error checking group streaks:', error);
    }
}
