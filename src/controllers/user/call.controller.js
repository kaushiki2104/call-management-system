// const prisma = require('../prisma')

import {prisma} from '../../config/db.js'
import asyncHandler from '../../utility/asyncHandler.js'
import { createCallSchema } from '../../validation/call.validation.js'
import fs from 'fs'

// export const createCall = asyncHandler(async (req, res) => {

//   const { receiverNumber, status, startedAt, endedAt } = req.body
//   const callerUser = req.user
//   const callerNumber = callerUser.phoneNumber

//   if (!req.file) {
//     return res.status(400).json({
//       success: false,
//       message: 'Audio file is required'
//     })
//   }
// const allowedStatuses = ["OUTGOING", "INCOMING", "REJECTED", "COMPLETED"]

// if (!allowedStatuses.includes(status?.toUpperCase())) {
//   return res.status(400).json({
//     success: false,
//     message: "Invalid call status"
//   })
// }


//   const receiverUser = await prisma.user.findUnique({
//     where: { phoneNumber: receiverNumber }
//   })

//   const start = new Date(startedAt)
//   const end = endedAt ? new Date(endedAt) : null

//   const duration = end
//     ? Math.floor((end - start) / 1000)
//     : 0

//     try{
//   const result = await prisma.$transaction(async (tx) => {

//     const call = await tx.call.create({
//       data: {
//         callerNumber,
//         receiverNumber,
//         callerId: callerUser?.id || null,
//         receiverId: receiverUser?.id || null,
//         status: status?.toUpperCase(),
//         startedAt: start,
//         endedAt: end,
//         duration
//       }
//     })

//     await tx.recording.create({
//       data: {
//         callId: call.id,
//         fileUrl: req.file.path,
//         fileSize: req.file.size
//       }
//     })

//     return call
//   })

//   return res.status(201).json({
//     success: true,
//     data: result
//   })
//     }
//     catch(error)
//     {
//     if (req.file?.path) {
//         await fs.unlink(req.file.path).catch(() => {})
//         }
//     }

// })

export const createCall = asyncHandler(async (req, res) => {

// const { receiverNumber, callerNumber, startedAt, endedAt, state, endReason } = req.body
const { receiverNumber, callerNumber, startedAt, endedAt, callType } = req.body 

const user = req.user
const organizationId = user?.organizationId
if (req.file && (callType === "MISSED" || callType === "REJECTED")) {
  return res.status(400).json({
    success: false,
    message: "Recording not allowed for missed or rejected calls"
  })
}


if (!startedAt || !endedAt || !callType) {
return res.status(400).json({
success: false,
message: "startedAt, endedAt and callType are required"
})
}

const start = new Date(startedAt)
const end = new Date(endedAt)

const duration = Math.floor((end - start) / 1000)

let callerId = null
let receiverId = null
let callerNum
let receiverNum

// =========================
// OUTGOING CALL
// =========================
if (receiverNumber) {

 
callerId = user.id
callerNum = user.phoneNumber
receiverNum = receiverNumber

const receiverUser = await prisma.user.findUnique({
  where: {
    phoneNumber_organizationId: {
      phoneNumber: receiverNumber,
      organizationId
    }
  }
})

if (receiverUser) {
  receiverId = receiverUser.id
}
 

}

// =========================
// INCOMING CALL
// =========================
else if (callerNumber) {

 
receiverId = user.id
receiverNum = user.phoneNumber
callerNum = callerNumber

const callerUser = await prisma.user.findUnique({
  where: {
    phoneNumber_organizationId: {
      phoneNumber: callerNumber,
      organizationId
    }
  }
})

if (callerUser) {
  callerId = callerUser.id
}
 

}

else {
return res.status(400).json({
success: false,
message: "Either receiverNumber or callerNumber must be provided"
})
}

try {

 
const result = await prisma.$transaction(async (tx) => {

  const call = await tx.call.create({
    data: {
      organizationId,
      callerId,
      receiverId,
      callerNumber: callerNum,
      receiverNumber: receiverNum,
      startedAt: start,
      endedAt: end,
      duration,
      callType
    }
  })

if (req.file) {
  await tx.recording.create({
    data: {
      callId: call.id,
      fileUrl: req.file.path,
      fileSize: req.file.size
    }
  })
}

  return call

})

res.status(201).json({
  success: true,
  data: result
})
 

} catch (error) {

 
if (req.file?.path) {
  await fs.unlink(req.file.path).catch(() => {})
}


throw error
 

}

})


export const getAllCalls = asyncHandler(async (req, res) => {
  
    const { page = 1, limit = 10, status } = req.query

    const skip = (Number(page) - 1) * Number(limit)

    const where = {}

    if (status) {
      where.status = status
    }

    const calls = await prisma.call.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: {
        startedAt: 'desc'
      },
      include: {
        caller: true,
        receiver: true
      }
    })

    const total = await prisma.call.count({ where })

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      data: calls
    })
 
})

export const getCallStats = asyncHandler(async (req, res) => {
  const userId = req.user.id

  const totalCalls = await prisma.call.count({
    where: {
      OR: [
        { callerId: userId },
        { receiverId: userId }
      ]
    }
  })

  const totalDuration = await prisma.call.aggregate({
    _sum: { duration: true },
    where: { callerId: userId }
  })

  const missedCalls = await prisma.call.count({
    where: {
      receiverId: userId,
      status: 'MISSED'
    }
  })

  res.json({
    success: true,
    totalCalls,
    totalDuration: totalDuration._sum.duration || 0,
    missedCalls
  })
})

// export const calls = await prisma.call.findMany({
//   where: {
//     OR: [
//       { callerId: req.user.id },
//       { receiverId: req.user.id }
//     ],
//     status: req.query.status || undefined
//   },
//   include: {
//     recording: true
//   },
//   orderBy: {
//     startedAt: 'desc'
//   },
//   skip: (page - 1) * limit,
//   take: limit
// })