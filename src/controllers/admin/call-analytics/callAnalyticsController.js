import { prisma } from "../../../config/db.js";
import asyncHandler from "../../../utility/asyncHandler.js";


// export const getCallAnalytics = asyncHandler(async (req, res) => {

//   const organizationId = req.user.organizationId;

//   const users = await prisma.user.findMany({
//     where: { organizationId },
//     select: {
//       id: true,
//       name: true,
//       orgRole: true,
//       callsMade: {
//         select: { id: true }
//       }
//     }
//   });

//   const result = users.map(user => ({
//     userId: user.id,
//     name: user.name,
//     role: user.orgRole,
//     totalCalls: user.callsMade.length
//   }));

//   res.json({
//     success: true,
//     data: result
//   });

// });



export const getCallsPerUser = asyncHandler(async (req, res) => {

  const organizationId = req.user.organizationId;

  const data = await prisma.call.groupBy({
    by: ['callerId'],
    where: { organizationId },
    _count: {
      id: true
    }
  });

  res.json({
    success: true,
    data
  });

});

export const getCallsPerLeader = asyncHandler(async (req, res) => {

  const organizationId = req.user.organizationId;

  const leaders = await prisma.user.findMany({
    where: {
      organizationId,
      orgRole: "LEADER"
    },
    include: {
      subordinates: {
        select: { id: true }
      }
    }
  });

  const result = [];

  for (const leader of leaders) {

    const userIds = leader.subordinates.map(u => u.id);

    const callCount = await prisma.call.count({
      where: {
        organizationId,
        callerId: { in: userIds }
      }
    });

    result.push({
      leaderId: leader.id,
      name: leader.name,
      totalCalls: callCount
    });
  }

  res.json({
    success: true,
    data: result
  });

});

export const getCallsPerManager = asyncHandler(async (req, res) => {

  const organizationId = req.user.organizationId;

  const managers = await prisma.user.findMany({
    where: {
      organizationId,
      orgRole: "MANAGER"
    },
    include: {
      subordinates: {
        include: {
          subordinates: {
            select: { id: true }
          }
        }
      }
    }
  });

  const result = [];

  for (const manager of managers) {

    const userIds = manager.subordinates
      .flatMap(leader => leader.subordinates)
      .map(user => user.id);

    const callCount = await prisma.call.count({
      where: {
        organizationId,
        callerId: { in: userIds }
      }
    });

    result.push({
      managerId: manager.id,
      name: manager.name,
      totalCalls: callCount
    });
  }

  res.json({
    success: true,
    data: result
  });

});


// all call in one way 

export const getCallAnalytics = asyncHandler(async (req, res) => {

const { level } = req.query;
const organizationId = req.user.organizationId;

if (!level) {
return res.status(400).json({
success: false,
message: "level query required (user | leader | manager)"
});
}

// ===============================
// CALLS PER USER
// ===============================
 
// if (level === "user") {

// const users = await prisma.user.findMany({
// where: {
// organizationId,
// orgRole: "USER"
// },
// select: {
// id: true,
// name: true
// }
// });

// const callCounts = await prisma.call.groupBy({
// by: ["callerId"],
// where: { organizationId },
// _count: { id: true }
// });

// const callMap = {};
// callCounts.forEach(c => {
// callMap[c.callerId] = c._count.id;
// });

// const result = users.map(user => ({
// userId: user.id,
// name: user.name,
// totalCalls: callMap[user.id] || 0
// }));

// return res.json({
// success: true,
// level: "user",
// data: result
// });
// }

if (level === "user") {

const currentUser = req.user;

let users = [];

// =========================
// ADMIN → all users
// =========================
if (currentUser.orgRole === "ADMIN") {

users = await prisma.user.findMany({
  where: {
    organizationId,
    orgRole: "USER"
  },
  select: {
    id: true,
    name: true
  }
});

}

// =========================
// MANAGER → direct users + users under leaders
// =========================
else if (currentUser.orgRole === "MANAGER") {

const manager = await prisma.user.findUnique({
  where: { id: currentUser.id },
  include: {
    subordinates: {
      include: {
        subordinates: {
          select: { id: true, name: true, orgRole: true }
        }
      }
    }
  }
});

const directUsers = manager.subordinates
  .filter(u => u.orgRole === "USER")
  .map(u => ({
    id: u.id,
    name: u.name
  }));

const leaderUsers = manager.subordinates
  .filter(u => u.orgRole === "LEADER")
  .flatMap(l =>
    l.subordinates.map(u => ({
      id: u.id,
      name: u.name
    }))
  );

users = [...directUsers, ...leaderUsers];

}

// =========================
// LEADER → only their users
// =========================
else if (currentUser.orgRole === "LEADER") {

users = await prisma.user.findMany({
  where: {
    organizationId,
    supervisorId: currentUser.id,
    orgRole: "USER"
  },
  select: {
    id: true,
    name: true
  }
});

}

else {
return res.status(403).json({
success: false,
message: "This role cannot access user analytics"
});
}

const userIds = users.map(u => u.id);

const callCounts = await prisma.call.groupBy({
by: ["callerId"],
where: {
organizationId,
callerId: { in: userIds }
},
_count: {
id: true
}
});

const callMap = {};
callCounts.forEach(c => {
callMap[c.callerId] = c._count.id;
});

const result = users.map(user => ({
userId: user.id,
name: user.name,
totalCalls: callMap[user.id] || 0
}));

return res.json({
success: true,
level: "user",
data: result
});

}
// ===============================
// CALLS PER LEADER
// ===============================
if (level === "leader") {

const leaders = await prisma.user.findMany({
where: {
organizationId,
orgRole: "LEADER"
},
include: {
subordinates: {
select: { id: true }
}
}
});

const result = [];

for (const leader of leaders) {

// users under this leader
const userIds = leader.subordinates.map(u => u.id);

// include leader himself
const allIds = [leader.id, ...userIds];

const callCount = await prisma.call.count({
  where: {
    organizationId,
    callerId: {
      in: allIds
    }
  }
});

result.push({
  leaderId: leader.id,
  name: leader.name,
  totalCalls: callCount
});

}

return res.json({
success: true,
level: "leader",
data: result
});
}
// ===============================
// CALLS PER MANAGER
// ===============================
 
if (level === "manager") {

const managers = await prisma.user.findMany({
where: {
organizationId,
orgRole: "MANAGER"
},
include: {
subordinates: {
include: {
subordinates: {
select: { id: true }
}
}
}
}
});

const result = [];

for (const manager of managers) {

// leaders under manager
const leaderIds = manager.subordinates.map(l => l.id);

// users under leaders
const userIds = manager.subordinates
  .flatMap(l => l.subordinates)
  .map(u => u.id);

// include manager himself
const allIds = [manager.id, ...leaderIds, ...userIds];

const callCount = await prisma.call.count({
  where: {
    organizationId,
    callerId: {
      in: allIds
    }
  }
});

result.push({
  managerId: manager.id,
  name: manager.name,
  totalCalls: callCount
});

}

return res.json({
success: true,
level: "manager",
data: result
});
}
return res.status(400).json({
success: false,
message: "Invalid level. Use user | leader | manager"
});

});


