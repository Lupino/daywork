import './theme';
import { router, route } from 'reapp-kit';

router(require,
  route('daywork', '/',
    route('sub')
  )
);
