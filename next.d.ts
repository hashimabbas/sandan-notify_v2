// next.d.ts
import { NextApiRequest } from 'next';
import { File } from 'formidable';

declare module 'next' {
  interface NextApiRequest {
    file: File; // Add file attribute to the request
  }
}
