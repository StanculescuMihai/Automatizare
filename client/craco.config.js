module.exports = {
  devServer: {
    allowedHosts: ['localhost', '127.0.0.1'],
    host: 'localhost',
    port: 3000,
    historyApiFallback: true,
    hot: true,
    client: {
      overlay: false
    }
  }
};