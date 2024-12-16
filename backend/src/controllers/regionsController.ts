import { Response, Request } from 'express';
import prisma from '../prismaClient';

export const getRegions = async (req: Request, res: Response) => {
  const regions = await prisma.region.findMany();
  res.status(200).send(regions);
};

export const CreateRegion = async (req: Request, res: Response) => {
  const region = await prisma.region.create({
    data: {
      name: req.body.name,
    },
  });
  res.status(201).send(region);
//   might be res.json(region) instead of res.send(region)
};
