import { prisma } from "../../../config/db.js";
import asyncHandler from "../../../utility/asyncHandler.js";


export const getManagerCalls = asyncHandler(async (req, res) => {

  const managerId = req.user.id;
  const organizationId = req.user.organizationId;

  const { from, to, state, endReason, page = 1, limit = 10 } = req.query;

  // 1️⃣ leaders under manager
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

  // 5️⃣ build filters
  const filters = {
    organizationId,
    callerId: { in: allUserIds }
  };

  if (state) {
    filters.state = state;
  }

  if (endReason) {
    filters.endReason = endReason;
  }

  if (from || to) {
    filters.startedAt = {};
    if (from) filters.startedAt.gte = new Date(from);
    if (to) filters.startedAt.lte = new Date(to);
  }

  const skip = (Number(page) - 1) * Number(limit);

  // 6️⃣ fetch calls
  const calls = await prisma.call.findMany({
    where: filters,
    skip,
    take: Number(limit),
    orderBy: {
      startedAt: "desc"
    },
    include: {
      caller: {
        select: {
          id: true,
          name: true,
          orgRole: true
        }
      },
      receiver: {
        select: {
          id: true,
          name: true,
          orgRole: true
        }
      },
      recording: true
    }
  });

  const totalCalls = await prisma.call.count({
    where: filters
  });

  res.json({
    success: true,
    pagination: {
      total: totalCalls,
      page: Number(page),
      limit: Number(limit),
      pages: Math.ceil(totalCalls / limit)
    },
    data: calls
  });

});