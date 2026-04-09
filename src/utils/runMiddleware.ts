// utils/runMiddleware.ts
import type { NextApiRequest, NextApiResponse } from "next";

type MiddlewareFn = (
  req: NextApiRequest,
  res: NextApiResponse,
  next: (result?: any) => void
) => void | Promise<void>;

export function runMiddleware(
  req: NextApiRequest,
  res: NextApiResponse,
  fn: MiddlewareFn
): Promise<any> {
  return new Promise((resolve, reject) => {
    try {
      fn(req, res, (result: any) => {
        if (result instanceof Error) {
          return reject(result);
        }
        return resolve(result);
      });
    } catch (err) {
      return reject(err);
    }
  });
}