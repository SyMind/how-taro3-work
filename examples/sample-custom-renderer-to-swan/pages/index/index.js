import React, {useState} from 'react';
import { createSwanPage } from '../../../../lib/runtime';

function SwanPage() {
  const [value, setValue] = useState('')

  /*
    <view>
      <view>
        输入：<input onInput={event => setValue(event.detail.value)} />
      </view>
      <view>
        输出：{value}
      </view>
    </view>
  */
  return React.createElement(
    'view',
    null,
    React.createElement(
      'view',
      { onInput: event => setValue(event.detail.value) },
      '输入：',
      React.createElement('input', {
        onInput: event => setValue(event.detail.value)
      }),
    ),
    React.createElement(
      'view',
      null,
      '展示：',
      React.createElement('view', null, value)
    )
  )
}

Page(createSwanPage(SwanPage))
