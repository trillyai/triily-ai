import hello from './hello.js';
import generate from './generate.js';

export default (app) => {
  app.use('/api/hello', hello);
  app.use('/api/generate', generate);
};
