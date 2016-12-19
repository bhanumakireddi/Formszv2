var jwt = require('jwt-simple');
var auth = {
        validateUser: function(username) {
            // spoofing the DB response for simplicity
            var dbUserObj = { // spoofing a userobject from the DB.
                name: 'arvind',
                role: 'admin',
                username: 'arvind@myapp.com'
            };
            return dbUserObj;
        },
    }
    // private method
function genToken(user) {
    var expires = expiresIn(1); // 7 days
    var token = jwt.encode({
        exp: expires
    }, require('../config/secret')());
    return {
        token: token,
        expires: expires,
        user: user,
        "message": "Login Success",
        "status": 200
    };
}

function expiresIn(numDays) {
    var dateObj = new Date();
    return dateObj.setDate(dateObj.getDate() + numDays);
}
module.exports = auth;
