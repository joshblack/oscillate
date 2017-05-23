import React from 'react';
import distanceInWordsToNow from 'date-fns/distance_in_words_to_now';

const Item = ({ item }) => (
  <article className="Item">
    <header className="Item__header">
      <img
        className="Item__header-avatar"
        src={item.author.avatar}
        alt="Avatar"
      />
      <div className="Item__header-details">
        <span className="Item__detail--name">
          {`${item.author.firstName} ${item.author.lastName}`}
        </span>
        <span className="Item__detail--date">
          {distanceInWordsToNow(item.createdAt)} ago
        </span>
      </div>
    </header>
    <div className="Item__content">
      {item.text}
    </div>
    <footer className="Item__footer">
      <span className="Item__detail--likes">
        Likes: {item.likes}
      </span>
    </footer>
  </article>
);

export default Item;
