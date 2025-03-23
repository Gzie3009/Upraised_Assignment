import { PrismaClient } from '@prisma/client';
import asyncHandler from 'express-async-handler';
import { generateCodename } from '../utils/gadgetUtils.js';

const prisma = new PrismaClient();

// Get all gadgets
export const getGadgets = asyncHandler(async (req, res) => {
  const { status } = req.query;
  const where = status ? { status } : {};
  
  const gadgets = await prisma.gadget.findMany({ where });
  
  const gadgetsWithProbability = gadgets.map(gadget => ({
    ...gadget,
    missionSuccessProbability: Math.floor(Math.random() * 41) + 60 // 60-100%
  }));
  
  res.json(gadgetsWithProbability);
});

// Create new gadget
export const createGadget = asyncHandler(async (req, res) => {
  const { name } = req.body;
  
  if (!name) {
    res.status(400);
    throw new Error('Please provide a gadget name');
  }
  
  const codename = await generateCodename();
  
  const gadget = await prisma.gadget.create({
    data: {
      name,
      codename,
      status: 'Available'
    }
  });
  
  res.status(201).json(gadget);
});

// Update gadget
export const updateGadget = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, status } = req.body;
  
  const gadget = await prisma.gadget.update({
    where: { id },
    data: { 
      name,
      status,
      ...(status === 'Decommissioned' && { 
        decommissionedAt: new Date() 
      })
    }
  });
  
  res.json(gadget);
});

// Delete (decommission) gadget
export const deleteGadget = asyncHandler(async (req, res) => {
  const { id } = req.params;
  
  const gadget = await prisma.gadget.update({
    where: { id },
    data: {
      status: 'Decommissioned',
      decommissionedAt: new Date()
    }
  });
  
  res.json(gadget);
});

// Self-destruct gadget
export const selfDestruct = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { confirmationCode } = req.body;
  
  const expectedCode = Math.random().toString(36).substring(2, 8).toUpperCase();
  
  if (confirmationCode !== expectedCode) {
    res.status(400);
    throw new Error('Invalid confirmation code');
  }
  
  const gadget = await prisma.gadget.update({
    where: { id },
    data: {
      status: 'Destroyed'
    }
  });
  
  res.json({
    message: 'Gadget self-destruct sequence completed',
    gadget
  });
});