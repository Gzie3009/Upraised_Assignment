import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';

const prisma = new PrismaClient();

export const protect = asyncHandler(async (req, res, next) => {
  let token;
  
  if (req.headers.authorization?.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      req.user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, email: true, name: true }
      });
      
      next();
    } catch (error) {
      res.status(401);
      throw new Error('Not authorized');
    }
  }
  
  if (!token) {
    res.status(401);
    throw new Error('Not authorized, no token');
  }
});