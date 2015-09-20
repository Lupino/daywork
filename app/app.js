import './theme';
import { router, route } from 'reapp-kit';

router(require,
  route('daywork', '/',
    route('sub'),
    route('newJob'),
    route('jobInfo', '/info/:jobId'),
    route('jobs',
      route('jobDetail', '/jobs/:jobId'),
      route('editJob', '/jobs/:jobId/edit'),
      route('payment', '/jobs/:jobId/payment/:userId')
    ),
    route('works',
      route('workDetail', '/works/:userId/:jobId')
    ),
    route('workDetail1', '/works1/:userId/:jobId'),
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
