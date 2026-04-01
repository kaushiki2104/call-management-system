import { prisma } from "../../config/db.js"
import bcrypt from "bcryptjs"
import asyncHandler from "../../utility/asyncHandler.js"


export const createOrganizationWithAdmin =asyncHandler(async (req, res) => {
  const { orgName, adminName, email, password, phoneNumber } = req.body

  const superAdminId = req.user.id

  const result = await prisma.$transaction(async (tx) => {

    const organization = await tx.organization.create({
      data: {
        name: orgName
      }
    })
 const hasPassword = await bcrypt.hash(password, 10)
    const admin = await tx.user.create({
      data: {
        name: adminName,
        email,
        password : hasPassword,
        phoneNumber,
        orgRole: "ADMIN",
        organizationId: organization.id,
        createdById: superAdminId
      }
    })

    return { organization, admin }
  })

  res.status(201).json({
    message: "Organization and admin created successfully",
    data: result
  })
})