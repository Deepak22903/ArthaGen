const Session = require("../models/session");

exports.getAnalytics = async (req, res) => {
    try {
        // 1️⃣ Average response time (ms) per session (avg time between messages)
        const avgResponseTimeAgg = await Session.aggregate([
            { $match: { "messages.1": { $exists: true } } }, // sessions with at least 2 messages
            {
                $project: {
                    responseTimes: {
                        $map: {
                            input: { $range: [1, { $size: "$messages" }] },
                            as: "idx",
                            in: {
                                $subtract: [
                                    { $arrayElemAt: ["$messages.timestamp", "$$idx"] },
                                    { $arrayElemAt: ["$messages.timestamp", { $subtract: ["$$idx", 1] }] },
                                ],
                            },
                        },
                    },
                },
            },
            { $unwind: "$responseTimes" },
            {
                $group: {
                    _id: null,
                    avgResponseTimeMs: { $avg: "$responseTimes" },
                },
            },
        ]);

        const avgResponseTimeMs =
            avgResponseTimeAgg.length > 0 ? avgResponseTimeAgg[0].avgResponseTimeMs : 0;

        // 2️⃣ Success rate based on message feedback (percentage of positive feedbacks)
        const successRateAgg = await Session.aggregate([
            { $unwind: "$messages" },
            { $match: { "messages.feedback": { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: null,
                    totalMessages: { $sum: 1 },
                    positiveFeedbacks: { $sum: { $cond: [{ $eq: ["$messages.feedback", 1] }, 1, 0] } },
                },
            },
            {
                $project: {
                    successRatePercent: {
                        $cond: [
                            { $eq: ["$totalMessages", 0] },
                            0,
                            { $multiply: [{ $divide: ["$positiveFeedbacks", "$totalMessages"] }, 100] },
                        ],
                    },
                },
            },
        ]);

        // 3️⃣ Total sessions till now
        const totalSessions = await Session.countDocuments();

        // 4️⃣ Total messages count
        const totalMessagesAgg = await Session.aggregate([
            { $unwind: "$messages" },
            { $count: "totalMessages" },
        ]);
        const totalMessages = totalMessagesAgg.length > 0 ? totalMessagesAgg[0].totalMessages : 0;

        // 5️⃣ Average session time (ms) and average session length (message count)
        const avgSessionStats = await Session.aggregate([
            { $match: { endedAt: { $exists: true, $ne: null } } },
            {
                $project: {
                    sessionTimeMs: { $subtract: ["$endedAt", "$startedAt"] },
                    messageCount: { $size: "$messages" },
                },
            },
            {
                $group: {
                    _id: null,
                    avgSessionTimeMs: { $avg: "$sessionTimeMs" },
                    avgSessionLength: { $avg: "$messageCount" },
                },
            },
        ]);

        // 6️⃣ Overall session satisfaction (average sessionFeedbackRating)
        const avgSatisfactionAgg = await Session.aggregate([
            { $match: { sessionFeedbackRating: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: null,
                    avgSatisfaction: { $avg: "$sessionFeedbackRating" },
                },
            },
        ]);

        // 7️⃣ Peak hours for usage (sessions started per hour)
        const peakHoursAgg = await Session.aggregate([
            {
                $project: {
                    hour: { $hour: "$startedAt" },
                },
            },
            {
                $group: {
                    _id: "$hour",
                    sessionCount: { $sum: 1 },
                },
            },
            { $sort: { sessionCount: -1 } },
        ]);

        // 8️⃣ Devices usage count
        const deviceUsageAgg = await Session.aggregate([
            { $match: { device: { $exists: true, $ne: null, $ne: "" } } },
            {
                $group: {
                    _id: "$device",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);

        // 9️⃣ Most used languages
        const languageUsageAgg = await Session.aggregate([
            { $match: { language: { $exists: true, $ne: null, $ne: "" } } },
            {
                $group: {
                    _id: "$language",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);

        // 🔟 Most used cities (geographics)
        const cityUsageAgg = await Session.aggregate([
            { $match: { "location.city": { $exists: true, $ne: null, $ne: "", $ne: "Unknown" } } },
            {
                $group: {
                    _id: "$location.city",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);

        // 1️⃣1️⃣ Most used intents (from messages.intent)
        const intentAgg = await Session.aggregate([
            { $unwind: "$messages" },
            {
                $group: {
                    _id: "$messages.intent",
                    count: { $sum: 1 },
                },
            },
            { $sort: { count: -1 } },
        ]);

        // 1️⃣2️⃣ Total resolved/unresolved queries based on sessionFeedbackRating >=4 resolved else unresolved
        const resolvedAgg = await Session.aggregate([
            { $match: { sessionFeedbackRating: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: null,
                    resolved: { $sum: { $cond: [{ $gte: ["$sessionFeedbackRating", 4] }, 1, 0] } },
                    unresolved: { $sum: { $cond: [{ $lt: ["$sessionFeedbackRating", 4] }, 1, 0] } },
                },
            },
        ]);
        const resolved = resolvedAgg.length > 0 ? resolvedAgg[0].resolved : 0;
        const unresolved = resolvedAgg.length > 0 ? resolvedAgg[0].unresolved : 0;

        // 1️⃣3️⃣ Sessions count with feedback 1 to 5
        const feedbackCountAgg = await Session.aggregate([
            { $match: { sessionFeedbackRating: { $exists: true, $ne: null } } },
            {
                $group: {
                    _id: "$sessionFeedbackRating",
                    count: { $sum: 1 },
                },
            },
            { $sort: { _id: 1 } },
        ]);

        res.status(200).json({
            status: "success",
            data: {
                avgResponseTimeMs: Math.round(avgResponseTimeMs || 0),
                successRatePercent: Math.round((successRateAgg.length > 0 ? successRateAgg[0].successRatePercent : 0) * 100) / 100,
                totalSessions,
                totalMessages,
                avgSessionTimeMs: Math.round(avgSessionStats.length > 0 ? avgSessionStats[0].avgSessionTimeMs : 0),
                avgSessionLength: Math.round((avgSessionStats.length > 0 ? avgSessionStats[0].avgSessionLength : 0) * 100) / 100,
                avgSatisfaction: Math.round((avgSatisfactionAgg.length > 0 ? avgSatisfactionAgg[0].avgSatisfaction : 0) * 100) / 100,
                peakHours: peakHoursAgg || [],
                deviceUsage: deviceUsageAgg || [],
                languageUsage: languageUsageAgg || [],
                cityUsage: cityUsageAgg || [],
                categoryUsage: intentAgg || [],
                resolvedQueries: resolved,
                unresolvedQueries: unresolved,
                sessionsFeedbackCount: feedbackCountAgg || [],
            },
        });
    } catch (err) {
        console.error('Analytics Error:', err);
        res.status(500).json({
            status: "error",
            message: "Failed to fetch analytics data",
            error: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
        });
    }
};
