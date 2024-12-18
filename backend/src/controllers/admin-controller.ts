import { Response, Request } from 'express';

const getBlah = async (req: Request, res: Response) => {
  res.status(200).send('Blah blah blah');
};

export default getBlah;
