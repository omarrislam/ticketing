declare global {
  namespace Express {
    interface Request {
      session?: {
        jwt?: string;
        [key: string]: any;
      } | null;
    }
  }
}

export {};
