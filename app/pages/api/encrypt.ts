import { NextApiRequest, NextApiResponse } from 'next';

import { encrypt } from 'lib/crypto';
import { encode } from 'utils/base64';

const encryptHandler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { method, headers, body } = req;

  if (method === 'POST') {
    const data: any = encode(encrypt(body));

    res.status(200).send({
      hash: data,
    });
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${method} Not Allowed`);
  }
};

export default encryptHandler;
