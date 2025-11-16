// example using knex from req.app.get('db') or exported
async function createUser(db, { username, passwordHash }) {
  const [user] = await db('users').insert({ username, password: passwordHash }).returning(['id','username']);
  return user;
}
module.exports = { createUser };
