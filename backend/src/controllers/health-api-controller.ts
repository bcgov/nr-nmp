/**
 * @dsummary Simple health endpoint to check API status
 */
import { Response, Request } from 'express';

const checkHealth = (req: Request, res: Response) => {
  res.status(200).send('NMP API is healthy and ready!');
};

export default checkHealth;
