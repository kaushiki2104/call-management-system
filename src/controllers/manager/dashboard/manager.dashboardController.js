import asyncHandler from "../../../utility/asyncHandler.js";
import { prisma } from "../../../config/db.js";

// export const getManagerDashboard = asyncHandler(async (req, res) => {
//   const managerId = req.user.id;
//   const organizationId = req.user.organizationId;

//   // 1️⃣ find leaders under manager
//   const leaders = await prisma.user.findMany({
//     where: {
//       supervisorId: managerId,
//       orgRole: "LEADER",
//       organizationId
//     },
//     select: { id: true }
//   });

//   const leaderIds = leaders.map(l => l.id);

//   // 2️⃣ users directly under manager
//   const directUsers = await prisma.user.findMany({
//     where: {
//       supervisorId: managerId,
//       orgRole: "USER",
//       organizationId
//     },
//     select: { id: true }
//   });

//   const directUserIds = directUsers.map(u => u.id);

//   // 3️⃣ users under leaders
//   const leaderUsers = await prisma.user.findMany({
//     where: {
//       supervisorId: { in: leaderIds },
//       orgRole: "USER",
//       organizationId
//     },
//     select: { id: true }
//   });

//   const leaderUserIds = leaderUsers.map(u => u.id);

//   // 4️⃣ combine all ids
//   const allUserIds = [
//     managerId,
//     ...leaderIds,
//     ...directUserIds,
//     ...leaderUserIds
//   ];

//   // 5️⃣ analytics queries
//   const totalLeaders = leaderIds.length;
//   const totalUsers = directUserIds.length + leaderUserIds.length;

//   const totalCalls = await prisma.call.count({
//     where: {
//       organizationId,
//       callerId: { in: allUserIds }
//     }
//   });


//   console.log("all ids are ", allUserIds)
//   const startOfDay = new Date();
//   startOfDay.setHours(0,0,0,0);

//   const callsToday = await prisma.call.count({
//     where: {
//       organizationId,
//       // callerId: { in: allUserIds },
//       startedAt: {
//         gte: startOfDay
//       },
//       OR: [
//        { callerId: { in: allUserIds } },
//        { receiverId: { in: allUserIds } }
//       ]
//     }
//   });

//   const durationToday = await prisma.call.aggregate({
//     where: {
//       organizationId,
//       startedAt: {
//         gte: startOfDay
//       },
//        OR: [
//        { callerId: { in: allUserIds } },
//        { receiverId: { in: allUserIds } }
//       ]
//     },
//     _sum: {
//       duration: true
//     }
//   });

//  const outgoingCallsToday = await prisma.call.count({
//   where: {
//     organizationId,
//      callType: "OUTGOING",
//     callerId: { in: allUserIds },
//     startedAt: { gte: startOfDay }
//   }
// });

// const incomingCallsToday = await prisma.call.count({
//   where: {
//     organizationId,
//      callType: "INCOMING",
//     receiverId: { in: allUserIds },
//     startedAt: { gte: startOfDay }
//   }
// });

// const rejectedCallsToday = await prisma.call.count({
//   where: {
//     organizationId,
//     callType: "REJECTED",
//     startedAt: { gte: startOfDay }
//   }
// })

// const missedCallsToday = await prisma.call.count({
//   where: {
//     organizationId,
//     callType: "MISSED",
//     startedAt: { gte: startOfDay }
//   }
// })


//   res.json({
//     success: true,
//     data: {
//       totalLeaders,
//       totalUsers,
//       totalCalls,
//       callsToday,
//       rejectedCallsToday,
//       missedCallsToday,
//       outgoingCallsToday,
//       incomingCallsToday,
//       totalDurationToday: durationToday._sum.duration || 0
//     }
//   });
// });


export const getManagerDashboard = asyncHandler(async (req, res) => {
  const managerId = req.user.id;
  const organizationId = req.user.organizationId;

  // 1️⃣ find leaders under manager
  const leaders = await prisma.user.findMany({
    where: {
      supervisorId: managerId,
      orgRole: "LEADER",
      organizationId
    },
    select: { id: true }
  });

  const leaderIds = leaders.map(l => l.id);

  // 2️⃣ users directly under manager
  const directUsers = await prisma.user.findMany({
    where: {
      supervisorId: managerId,
      orgRole: "USER",
      organizationId
    },
    select: { id: true }
  });

  const directUserIds = directUsers.map(u => u.id);

  // 3️⃣ users under leaders
  const leaderUsers = await prisma.user.findMany({
    where: {
      supervisorId: { in: leaderIds },
      orgRole: "USER",
      organizationId
    },
    select: { id: true }
  });

  const leaderUserIds = leaderUsers.map(u => u.id);

  // 4️⃣ combine all ids
  const allUserIds = [
    managerId,
    ...leaderIds,
    ...directUserIds,
    ...leaderUserIds
  ];

  const totalLeaders = leaderIds.length;
  const totalUsers = directUserIds.length + leaderUserIds.length;

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  // 5️⃣ run analytics queries in parallel
  const [totalCalls, callTypeStats, durationToday] = await Promise.all([

    prisma.call.count({
      where: {
        organizationId,
        callerId: { in: allUserIds }
      }
    }),

    prisma.call.groupBy({
      by: ["callType"],
      where: {
        organizationId,
        startedAt: { gte: startOfDay },
        OR: [
          { callerId: { in: allUserIds } },
          { receiverId: { in: allUserIds } }
        ]
      },
      _count: {
        callType: true
      }
    }),

    prisma.call.aggregate({
      where: {
        organizationId,
        startedAt: { gte: startOfDay },
        OR: [
          { callerId: { in: allUserIds } },
          { receiverId: { in: allUserIds } }
        ]
      },
      _sum: {
        duration: true
      }
    })

  ]);

  // 6️⃣ normalize grouped result
  const stats = {
    OUTGOING: 0,
    INCOMING: 0,
    MISSED: 0,
    REJECTED: 0
  };

  callTypeStats.forEach(c => {
    stats[c.callType] = c._count.callType;
  });

  const outgoingCallsToday = stats.OUTGOING;
  const incomingCallsToday = stats.INCOMING;
  const missedCallsToday = stats.MISSED;
  const rejectedCallsToday = stats.REJECTED;

  const callsToday =
    outgoingCallsToday +
    incomingCallsToday +
    missedCallsToday +
    rejectedCallsToday;

  res.json({
    success: true,
    data: {
      totalLeaders,
      totalUsers,
      totalCalls,
      callsToday,
      outgoingCallsToday,
      incomingCallsToday,
      missedCallsToday,
      rejectedCallsToday,
      totalDurationToday: durationToday._sum.duration || 0
    }
  });
});



