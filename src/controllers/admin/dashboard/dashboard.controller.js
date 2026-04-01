
import { prisma } from "../../../config/db.js";
import asyncHandler from "../../../utility/asyncHandler.js";
 

export const getAllUsers = asyncHandler(async (req, res) => {
  const {
    pageIndex = 1,
    perPage = 10,
    fromDate,
    toDate,
    role
  } = req.query;

  const page = Number(pageIndex);
  const limit = Number(perPage);

  if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
    return res.status(400).json({
      message: "pageIndex and perPage must be positive numbers"
    });
  }

  const skip = (page - 1) * limit;

  // -----------------------------
  // DATE FILTER
  // -----------------------------
  const dateFilter = {};
  if (fromDate) dateFilter.gte = new Date(fromDate);
  if (toDate) dateFilter.lte = new Date(toDate);

  // -----------------------------
  // ROLE BASED ACCESS CONTROL
  // -----------------------------
 let whereClause = {
  id: {
    not: req.user.id
  }
};

  // SUPER_ADMIN → can see everything
  if (req.user.role == "SUPER_ADMIN") {
    whereClause = {
      ...whereClause,
      ...(role && { role }),
      ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
    };
  }

  // ADMIN → only users of their organization
  else if (req.user.role == "ADMIN") {
    whereClause = {
      ...whereClause,
      organizationId: req.user.organizationId,
      ...(role && { role }),
      ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
    };
  }

  // USER → not allowed to list users
  else {
    return res.status(403).json({
      message: "You are not authorized to access this resource"
    });
  }

  // -----------------------------
  // QUERY DATABASE
  // -----------------------------
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        organizationId: true,
        createdAt: true,
        _count: {
          select: {
            callsMade: true,
            callsReceived: true
          }
        }
      }
    }),
    prisma.user.count({
      where: whereClause
    })
  ]);

  // -----------------------------
  // FORMAT RESPONSE
  // -----------------------------
  const formattedUsers = users.map(user => ({
    id: user.id,
    name: user.name,
    email: user.email,
    phoneNumber: user.phoneNumber,
    role: user.role,
    organizationId: user.organizationId,
    createdAt: user.createdAt,
    totalCallsMade: user._count.callsMade,
    totalCallsReceived: user._count.callsReceived,
    totalCalls:
      user._count.callsMade + user._count.callsReceived,
    isCurrentUser: user.id === req.user.id
  }));

  res.json({
    pageIndex: page,
    perPage: limit,
    totalRecords: total,
    totalPages: Math.ceil(total / limit),
    users: formattedUsers
  });
});

// export const getAdminDashboard= asyncHandler(async (req, res)=> {

//   const organizationId =req.user.organizationId;


//     const totalUsers = await prisma.user.count({
//     where: { organizationId }
//   });

//     const totalManagers = await prisma.user.count({
//     where: {
//       organizationId,
//       orgRole: "MANAGER"
//     }
//   });

//   const totalLeaders = await prisma.user.count({
//     where: {
//       organizationId,
//       orgRole: "LEADER"
//     }
//   });

//   const totalNormalUsers = await prisma.user.count({
//     where: {
//       organizationId,
//       orgRole: "USER"
//     }
//   });


//    const totalCalls = await prisma.call.count({
//     where: {
//       organizationId
//     }
//   });

//   res.json({
//     success: true,
//     data: {
//       totalUsers,
//       totalManagers,
//       totalLeaders,
//       totalNormalUsers,
//       totalCalls
//     }
//   });



// })


export const getAdminDashboard = asyncHandler(async (req, res) => {

const organizationId = req.user.organizationId;

// today start time
const todayStart = new Date();
todayStart.setHours(0, 0, 0, 0);

const [
totalUsers,
roleCounts,
totalCalls,
callsToday,
durationToday
] = await Promise.all([

 
prisma.user.count({
  where: { organizationId }
}),

prisma.user.groupBy({
  by: ["orgRole"],
  where: { organizationId },
  _count: { orgRole: true }
}),

prisma.call.count({
  where: { organizationId }
}),

prisma.call.count({
  where: {
    organizationId,
    startedAt: {
      gte: todayStart
    }
  }
}),

prisma.call.aggregate({
  where: {
    organizationId,
    startedAt: {
      gte: todayStart
    }
  },
  _sum: {
    duration: true
  }
})
 

]);

const totalManagers =
roleCounts.find(r => r.orgRole === "MANAGER")?._count.orgRole || 0;

const totalLeaders =
roleCounts.find(r => r.orgRole === "LEADER")?._count.orgRole || 0;

const totalNormalUsers =
roleCounts.find(r => r.orgRole === "USER")?._count.orgRole || 0;

res.json({
success: true,
data: {
totalUsers,
totalManagers,
totalLeaders,
totalNormalUsers,
totalCalls,
callsToday,
totalDurationToday: durationToday._sum.duration || 0
}
});

});
