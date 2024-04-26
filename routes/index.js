import hello from './hello.js';

export default (app) => {
  app.use('/api/hello', hello);
};
