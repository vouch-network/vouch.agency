import React from 'react';

import { Link } from 'components/Router';

export default () => (
  <div>
    <p>Page not found</p>
    <p>
      Go <Link to="/">home</Link>
    </p>
  </div>
);
