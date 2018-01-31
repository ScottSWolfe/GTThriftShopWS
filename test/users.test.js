process.env.NODE_ENV = 'test';

const chai = require('chai');
const chaiHttp = require('chai-http');
const expect = chai.expect;
const server = require('../server');
const User = require('../app/models/user.model');

chai.use(chaiHttp);

const ROUTE_CREATE_ACCOUNT = '/create-account';
const ROUTE_LOGIN = '/login';
const ROUTE_VERIFY = '/verify';

const TOKEN_REGEX = /^[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+\.[a-zA-Z0-9_\-]+$/;

describe('Users', function () {
    var token;

    before(function (done) {
        User.remove({}, function (err) {
            done();
        });
    });
    after(function (done) {
        User.remove({}, function (err) {
            done();
        });
    });

    describe('POST ' + ROUTE_CREATE_ACCOUNT, function () {
        var userInfo = [{
            email: 'jokogie3@gatech.edu',
            password: 'burdell1885',
            firstName: 'Josh',
            lastName: 'Okogie'
        }, {
            email: 'jokogie3@gatech.edu',
            password: 'imposter5',
            firstName: 'Faux',
            lastName: 'Player'
        }, {
            password: 'buyeveryonedoughnuts',
            firstName: 'Josh',
            lastName: 'Pastner'
        }, {
            email: 'tjackson1@gatech.edu',
            firstName: 'Tadric',
            lastName: 'Jackson'
        }, {
            email: 'blammers3@gatech.edu',
            password: 'thelamminator',
            lastname: 'Lammers'
        }, {
            email: 'jalvarado3@gatech.edu',
            password: 'brooklyn10',
            firstName: 'Jose'
        }, {
            email: 'jokogie@gmail.com',
            password: 'snellvillebball',
            firstName: 'Number',
            lastName: 'One'
        }, {
            email: 'minpassword@gatech.edu',
            password: 'minimum1',
            firstName: 'Min',
            lastName: 'Password'
        }, {
            email: 'shortpassword@gatech.edu',
            password: 'minimum',
            firstName: 'Short',
            lastName: 'Pass'
        }];

        it('should successfully create a new account', function (done) {
            chai.request(server)
                .post(ROUTE_CREATE_ACCOUNT)
                .send(userInfo[0])
                .end(function (err, res) {
                    checkMessageResponse(res, true, 200);
                    done();
                });
        });
        it('should not create an account with the same email address', function (done) {
            chai.request(server)
                .post(ROUTE_CREATE_ACCOUNT)
                .send(userInfo[1])
                .end(function (err, res) {
                    checkMessageResponse(res, false, 200);
                    done();
                });
        });
        it('should not create an account with no email address', function (done) {
            chai.request(server)
                .post(ROUTE_CREATE_ACCOUNT)
                .send(userInfo[2])
                .end(function (err, res) {
                    checkMessageResponse(res, false, 200);
                    done();
                });
        });
        it('should not create an account with no password', function (done) {
            chai.request(server)
                .post(ROUTE_CREATE_ACCOUNT)
                .send(userInfo[3])
                .end(function (err, res) {
                    checkMessageResponse(res, false, 200);
                    done();
                });
        });
        it('should not create an account with no first name', function (done) {
            chai.request(server)
                .post(ROUTE_CREATE_ACCOUNT)
                .send(userInfo[4])
                .end(function (err, res) {
                    checkMessageResponse(res, false, 200);
                    done();
                });
        });
        it('should not create an account with no last name', function (done) {
            chai.request(server)
                .post(ROUTE_CREATE_ACCOUNT)
                .send(userInfo[5])
                .end(function (err, res) {
                    checkMessageResponse(res, false, 200);
                    done();
                });
        });
        it('should not create an account with an non-Georgia Tech email address', function (done) {
            chai.request(server)
                .post(ROUTE_CREATE_ACCOUNT)
                .send(userInfo[6])
                .end(function (err, res) {
                    checkMessageResponse(res, false, 200);
                    done();
                });
        });
        it('should create an account with an just long enough password', function (done) {
            chai.request(server)
                .post(ROUTE_CREATE_ACCOUNT)
                .send(userInfo[7])
                .end(function (err, res) {
                    checkMessageResponse(res, true, 200);
                    done();
                });
        });
        it('should not create an account with a too short password', function (done) {
            chai.request(server)
                .post(ROUTE_CREATE_ACCOUNT)
                .send(userInfo[8])
                .end(function (err, res) {
                    checkMessageResponse(res, false, 200);
                    done();
                });
        });
    });

    describe('POST ' + ROUTE_LOGIN, function () {
        var credentials = [{
            email: 'jokogie3@gatech.edu',
            password: 'burdell1885'
        }, {
            email: 'jokogie5@gatech.edu',
            password: 'burdell1885'
        }, {
            email: 'jokogie3@gatech.edu',
            password: 'badpassword'
        }];

        it('should log in successfully',  function (done) {
            chai.request(server)
                .post(ROUTE_LOGIN)
                .send(credentials[0])
                .end(function (err, res) {
                    checkMessageResponse(res, true, 200);
                    expect(res.body).to.have.property('token');
                    expect(res.body.token).to.match(TOKEN_REGEX);
                    token = res.body.token;
                    done();
                });
        });
        it('should not log in for bad email',  function (done) {
            chai.request(server)
                .post(ROUTE_LOGIN)
                .send(credentials[1])
                .end(function (err, res) {
                    checkMessageResponse(res, false, 401);
                    done();
                });
        });
        it('should not log in for bad password',  function (done) {
            chai.request(server)
                .post(ROUTE_LOGIN)
                .send(credentials[2])
                .end(function (err, res) {
                    checkMessageResponse(res, false, 401);
                    done();
                });
        });
    });

    describe('GET ' + ROUTE_VERIFY, function () {
        it('should verify the token',  function (done) {
            chai.request(server)
                .get(ROUTE_VERIFY)
                .set('authorization', token)
                .end(function (err, res) {
                    expect(res).to.have.status(200);
                    expect(res.body).to.be.true;
                    done();
                });
        });
        it('should not verify if there is no token',  function (done) {
            chai.request(server)
                .get(ROUTE_VERIFY)
                .end(function (err, res) {
                    expect(res).to.have.status(401);
                    expect(res.body).to.be.false;
                    done();
                });
        });
        it('should not verify a bad token',  function (done) {
            chai.request(server)
                .get(ROUTE_VERIFY)
                .set('authorization', 'bad.token._123-456')
                .end(function (err, res) {
                    expect(res).to.have.status(401);
                    expect(res.body).to.be.false;
                    done();
                });
        });
    });
});

function checkMessageResponse(res, expectedSuccess, expectedStatus) {
    expect(res).to.have.status(expectedStatus);
    expect(res.body).to.be.a('object');
    expect(res.body).to.have.property('successful');
    expect(res.body).to.have.property('text');
    expect(res.body.successful).to.equal(expectedSuccess);
    expect(res.body.text).to.not.be.null;
    expect(res.body.text).to.not.be.undefined;
    expect(res.body.text).to.not.equal('');
}