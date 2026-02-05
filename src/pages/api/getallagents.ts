// pages/api/getallagents.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import dbConnect from '@/lib/dbConnect';
import Agent from '@/models/Agent';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await dbConnect();

  if (req.method === 'GET') {
    try {
      const agents = await Agent.find();
      // console.log("Fetched all agents:", agents);
      if (!agents || agents.length === 0) {
        console.log("No agents found");
        // Return a 404 status if no agents are found
        return res.status(404).json({ message: 'No agents found :(' });

      }
      return res.status(200).json(agents);
    } 
    
    catch (error) {
      console.error('Error fetching agents:', error);
      return res.status(500).json({ message: 'Failed to fetch admins' });
    }
  } 
  else {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
