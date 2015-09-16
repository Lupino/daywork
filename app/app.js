import './theme';
import { router, route } from 'reapp-kit';

router(require,
  route('daywork', '/',
    route('sub'),
    route('newJob'),
    route('jobs',
      route('jobDetail', '/jobs/:jobId'),
      route('payment', '/jobs/:jobId/payment/:userId')
    ),
    route('signup'),
    route('signin'),
    route('problem'),
    route('resetPassword'),
    route('salary',
      route('sub1')
    ),
    route('settings',
      route('about')
    ),
    route('profile',
      route('name'),
      route('sex'),
      route('phone')
    )
  )
);
