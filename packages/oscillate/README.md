# `oscillate`

> Oscillate is an opinionated data-layer for component-based applications that
> leverage traditional API calls for satisfying their data needs.

**Note:** by default, Oscillate will be in development mode. The development version includes extra warnings about common mistakes, whereas the production version includes extra performance optimizations and strips all error messages.

To use Oscillate in production mode, set the environment variable `NODE_ENV` to `production`. A minifier that performs dead-code elimination such as [UglifyJS](https://github.com/mishoo/UglifyJS2) is recommended to completely remove the extra code present in development mode.

## Usage

```bash
npm i oscillate --save
# or
yarn add oscillate
```

```js
const { Environment } = require('oscillate');
// or
import { Environment } from 'oscillate';
```
