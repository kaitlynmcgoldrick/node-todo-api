var expect = require('expect');
var request = require('supertest');
const {ObjectID} = require('mongodb');

const {app} = require('./../server');
const {Todo} = require('./../models/todo');

const todos = [{
  _id: new ObjectID(),
  text: 'first todo'
}, {
  _id: new ObjectID(),
  text: 'second todo'
}, {
  _id: new ObjectID(),
  text: 'third todo'
}]

// // Used for testing when database should be empty
// beforeEach(() => {
//   Todo.remove({}).then(() => done());
// });

// // Used for testing when data needs to be populated
// // with above todos array
beforeEach((done) => {
  Todo.remove({}).then(() => {
    return Todo.insertMany(todos);
  }).then(() => done());
});

describe('POST /todos', () => {
  it('should not create a todo with invalid body data', (done) => {
    var text = '';
    request(app)
      .post('/todos')
      .send({text})
      .expect(400)
      .end((err, res) => {
        if (err) {
          return done(err);
        }
        Todo.find().then((todos) => {
          expect(todos.length).toBe(3);
          done();
        }).catch((e) => done(e));
      });
  });
});

describe('GET /todos', () => {
  it('should get all todos', (done) => {
    request(app)
      .get('/todos')
      .expect(200)
      .expect((res) => {
        expect(res.body.todos.length).toBe(3);
      })
      .end(done);
  });
});

describe('GET /todos/:id', () => {
  it('should return todo doc', (done) => {
    request(app)
      .get(`/todos/${todos[0]._id.toHexString()}`)
      .expect(200)
      .expect((res) => {
        expect(res.body.todo.text).toBe(todos[0].text);
      }).end(done);
  });

  it('should return a 404 if todo not found', (done) => {
    var hexID = new ObjectID().toHexString();
    request(app)
      .get(`/todos/${hexID}`)
      .expect(404)
      .end(done);
  })

  it('should return 404 for non-object ids', (done) => {
    request(app)
      .get('/todos/123')
      .expect(404)
      .end(done);
  })
});