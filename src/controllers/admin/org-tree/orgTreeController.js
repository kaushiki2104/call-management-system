

import { prisma } from "../../../config/db.js";
import asyncHandler from "../../../utility/asyncHandler.js";
import { buildUserTree } from "../../../services/org-tree.js";


// export const getOrganizationTree = asyncHandler(async (req, res) => {

//   const organizationId = req.user.organizationId;

//   const users = await prisma.user.findMany({
//     where: { organizationId },
//     select: {
//       id: true,
//       name: true,
//       orgRole: true,
//       supervisorId: true
//     }
//   });

//   const tree = buildUserTree(users);

//   res.json({
//     success: true,
//     data: tree
//   });

// });

export const getOrganizationTree = asyncHandler(async (req, res) => {

  const organizationId = req.user.organizationId;
  const userId = req.user.id;
  const role = req.user.orgRole;

  const users = await prisma.user.findMany({
    where: { organizationId },
    select: {
      id: true,
      name: true,
      orgRole: true,
      supervisorId: true
    }
  });

  const tree = buildUserTree(users);

  // Admin can see full tree
  if (role === "ADMIN") {
    return res.json({
      success: true,
      data: tree
    });
  }

  // Manager / Leader should only see their subtree
  const findSubTree = (nodes, id) => {
    for (const node of nodes) {
      if (node.id === id) return node;

      if (node.children?.length) {
        const found = findSubTree(node.children, id);
        if (found) return found;
      }
    }
    return null;
  };

  const subTree = findSubTree(tree, userId);

  res.json({
    success: true,
    data: subTree
  });

});

