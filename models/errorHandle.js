const boom = require('boom')

module.exports = {
  handleBadRequest: function (params, next) {
    for (let i in params) {
      if (!params[i]) {
        next(boom.badRequest(`400 - bad request - ${i} is required`))
        return false
      }
    }
    return true
  }
}