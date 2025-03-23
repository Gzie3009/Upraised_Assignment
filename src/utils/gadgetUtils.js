import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const prefixes = ['The', 'Project', 'Operation'];
const adjectives = ['Silent', 'Dark', 'Shadow', 'Ghost', 'Phantom', 'Crystal', 'Iron', 'Steel'];
const nouns = ['Phoenix', 'Dragon', 'Eagle', 'Wolf', 'Serpent', 'Tiger', 'Lion', 'Hawk'];

export const generateCodename = async () => {
  let codename;
  let isUnique = false;
  
  while (!isUnique) {
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    const adjective = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    
    codename = `${prefix} ${adjective} ${noun}`;
    
    const existing = await prisma.gadget.findUnique({
      where: { codename }
    });
    
    if (!existing) {
      isUnique = true;
    }
  }
  
  return codename;
};