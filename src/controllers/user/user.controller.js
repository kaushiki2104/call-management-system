// const prisma = require('../prisma')

import {prisma} from '../../config/db.js'
import asyncHandler from '../../utility/asyncHandler.js'
// import bcrypt from 'bcryptjs'
 
// import { success } from 'zod'

// export const registerUser = asyncHandler(async (req, res) => {
//   const { name, email, password, phoneNumber } = req.body


//     if (req.user.role !== 'ADMIN') {
//       // throw new Error('Only admin can add users')
//     return  res.status(400).json({
//         success: false,
//         message:'Only admin can add users'
//       })
//     }

//   const existingUser = await prisma.user.findUnique({
//     where: { email }
//   })

//   if (existingUser) {
//   return  res.status(400).json({
//       success: false,
//       message: 'User already exists'
//     })
 
//   }

//   const hashedPassword = await bcrypt.hash(password, 10)
//  try {
//     const user = await prisma.user.create({
//       data: {
//         name,
//         email,
//         phoneNumber,
//         password: hashedPassword,
//         role: 'USER',
//         organizationId: req.user.organizationId
//       }
//     })

//     return res.status(201).json({
//       success: true,
//       message: 'User created successfully'
//     })

//   } catch (error) {

//     if (error.code === 'P2002') {
//       const field = error.meta?.target?.[0]

//       if (field === 'phoneNumber') {
//         return res.status(400).json({
//           success: false,
//           message: 'Mobile number cannot be duplicate'
//         })
//       }

//       if (field === 'email') {
//         return res.status(400).json({
//           success: false,
//           message: 'Email already exists'
//         })
//       }
//     }

//     return res.status(500).json({
//       success: false,
//       message: 'Something went wrong'
//     })
//   }
 
// })



export const getAllUsers = asyncHandler(async (req, res) => {
 
    const users = await prisma.user.findMany()
    res.json(users)
})

// export const getUserById = asyncHandler(async (req, res) => {
  
//     const { id } = req.params

//   const user = await prisma.user.findUnique({
//   where: { id },
//   select: {
//     id: true,
//     name: true,
//     email: true,
//     phoneNumber: true,
//     role: true,
//     createdAt: true,
//     callsMade: {
//       orderBy: { createdAt: 'desc' },
//       select: {
//         id: true,
//         receiverNumber: true,
//         duration: true,
//         status: true,
//         startedAt: true,
//         endedAt: true,
//         createdAt: true,
//         recording: {
//           select: {
//             fileUrl: true,
//             fileSize: true
//           }
//         }
//       }
//     },
//     callsReceived: {
//       orderBy: { createdAt: 'desc' },
//       select: {
//         id: true,
//         callerNumber: true,
//         duration: true,
//         status: true,
//         startedAt: true,
//         endedAt: true,
//         createdAt: true,
//         recording: {
//           select: {
//             fileUrl: true,
//             fileSize: true
//           }
//         }
//       }
//     }
//   }
// })

//     res.json(user)


// })

// export const getUserById = asyncHandler(async (req, res) => {
//   const { id } = req.params;

//   const user = await prisma.user.findUnique({
//     where: { id },
//     select: {
//       id: true,
//       name: true,
//       email: true,
//       phoneNumber: true,
//       role: true,
//       createdAt: true,
//     }
//   });

//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   const calls = await prisma.call.findMany({
//     where: {
//       OR: [
//         { callerId: id },
//         { receiverId: id }
//       ]
//     },
//     orderBy: {
//       createdAt: 'desc'
//     },
//     select: {
//       id: true,
//       callerId: true,
//       receiverId: true,
//       callerNumber: true,
//       receiverNumber: true,
//       duration: true,
//       status: true,
//       startedAt: true,
//       endedAt: true,
//       createdAt: true,
//       recording: {
//         select: {
//           fileUrl: true,
//           fileSize: true
//         }
//       }
//     }
//   });

//   const formattedCalls = calls.map(call => ({
//     ...call,
//     direction: call.callerId === id ? "OUTGOING" : "INCOMING"
//   }));

//   res.json({
//     ...user,
//     calls: formattedCalls
//   });
// });


export const getUserCalls = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const {
    pageIndex=1,
    perPage=10,
    fromDate,
    toDate,
    state,
    direction = "ALL"
  } = req.query;

  // ---- Mandatory Validation ----
  if (!pageIndex || !perPage) {
    return res.status(400).json({
      message: "pageIndex and perPage are required"
    });
  }

  const page = Number(pageIndex);
  const limit = Number(perPage);

  if (isNaN(page) || isNaN(limit) || page <= 0 || limit <= 0) {
    return res.status(400).json({
      message: "pageIndex and perPage must be positive numbers"
    });
  }

  const skip = (page - 1) * limit;

  // ---- Date Filter ----
  const dateFilter = {};
  if (fromDate) dateFilter.gte = new Date(fromDate);
  if (toDate) dateFilter.lte = new Date(toDate);

  // ---- Direction Filter ----
  let userFilter;

  if (direction === "OUTGOING") {
    userFilter = { callerId: id };
  } else if (direction === "INCOMING") {
    userFilter = { receiverId: id };
  } else {
    userFilter = {
      OR: [{ callerId: id }, { receiverId: id }]
    };
  }

  // ---- Final Where Clause ----
  const whereClause = {
    ...userFilter,
    ...(state && { state }),
    ...(Object.keys(dateFilter).length && { createdAt: dateFilter })
  };

  const [user, calls, total] = await Promise.all([
    prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phoneNumber: true,
        role: true,
        createdAt: true
      }
    }),
    prisma.call.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
      select: {
        id: true,
        callerId: true,
        receiverId: true,
        callerNumber: true,
        receiverNumber: true,
        duration: true,
        state: true,
        startedAt: true,
        endedAt: true,
        createdAt: true,
        recording: {
          select: {
            fileUrl: true,
            fileSize: true
          }
        }
      }
    }),
    prisma.call.count({
      where: whereClause
    })
  ]);


 if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const formattedCalls = calls.map(call => ({
    ...call,
    direction: call.callerId === id ? "OUTGOING" : "INCOMING"
  }));

 
  res.json({
    user,
    // pageIndex: page,
    // perPage: limit,
    totalRecords: total,
    totalPages: Math.ceil(total / limit),
    calls: formattedCalls
  });
});


