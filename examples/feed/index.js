'use strict';

const url = require('url');
const faker = require('faker');
const isBefore =require('date-fns/is_before');

const genItem = () => ({
  id: faker.random.uuid(),
  text: faker.lorem.sentences(),
  likes: Math.floor(Math.random() * 10),
  createdAt: faker.date.recent(),
  author: {
    avatar: faker.internet.avatar(),
    firstName: faker.name.firstName(),
    lastName: faker.name.lastName(),
  },
});

const items = Array(...Array(50))
  .map(genItem)
  .sort((a, b) => {
    return isBefore(b.createdAt, a.createdAt);
  })
  .map((item, i) => Object.assign({}, item, { cursor: i }));

module.exports = (req) => {
  const { query } = url.parse(req.url, '=');
  const {
    first,
    after,
  } = query;

  if (first !== undefined) {
    if (after !== undefined) {
      return items.slice(
        parseInt(after, 10),
        parseInt(first, 10)
      );
    }

    return items.slice(0, parseInt(first, 10));
  }

  return items;
};
