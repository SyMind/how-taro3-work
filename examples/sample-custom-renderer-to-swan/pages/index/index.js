import React, {useState} from 'react';
import { createSwanPage } from '../../../../lib/runtime';

function SwanPage() {
  const [value, setValue] = useState('333')
  console.log('value', value)

  return React.createElement(
    'view',
    null,
    React.createElement('input', {
      onInput: event => setValue(event.detail.value)
    }),
    React.createElement('view', null, value)
  )
}

Page(createSwanPage(SwanPage))
