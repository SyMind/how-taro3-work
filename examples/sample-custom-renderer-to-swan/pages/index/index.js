import React from 'react';
import { createSwanPage } from '../../../../lib/runtime';

function SwanPage() {
  return React.createElement('view', null, 'hello, world')
}

Page(createSwanPage(SwanPage))
