const Session = require("../models/session");

exports.getAnalytics = async (req, res) => {
    try {
        // 1. Top locations by coordinates
        const topLocations = await Session.aggregate([
            {
                $group: {
                    _id: {
                        lat: "$location.coordinates.latitude",
                        lng: "$location.coordinates.longitude"
                    },
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 5 }
        ]);

        // 2. Most common language
        const mostCommonLanguage = await Session.aggregate([
            {
                $group: {
                    _id: "$language",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        // 3. Customer satisfaction rate (rating >= 4 = satisfied)
        const satisfactionStats = await Session.aggregate([
            {
                $group: {
                    _id: null,
                    total: { $sum: 1 },
                    satisfied: {
                        $sum: {
                            $cond: [{ $gte: ["$sessionFeedbackRating", 4] }, 1, 0]
                        }
                    }
                }
            },
            {
                $project: {
                    _id: 0,
                    satisfactionRate: {
                        $multiply: [{ $divide: ["$satisfied", "$total"] }, 100]
                    }
                }
            }
        ]);

        // 4. Most used service type (using sessionName)
        const mostUsedService = await Session.aggregate([
            {
                $group: {
                    _id: "$sessionName",
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } },
            { $limit: 1 }
        ]);

        res.status(200).json({
            topLocations,
            mostCommonLanguage: mostCommonLanguage[0] || null,
            satisfactionRate: satisfactionStats[0]?.satisfactionRate || 0,
            mostUsedService: mostUsedService[0] || null
        });

    } catch (error) {
        console.error("Error getting analytics:", error);
        res.status(500).json({ error: "Server error" });
    }
};
