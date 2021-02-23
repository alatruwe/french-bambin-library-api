const xss = require("xss");

const AddItemService = {
  insertItem(db, newItem) {
    return db
      .insert(newItem)
      .into("items")
      .returning("*")
      .then(([item]) => item);
    //.then(comment => CommentsService.getById(db, comment.id))
  },

  /*serializeComment(comment) {
    const { user } = comment
    return {
      id: comment.id,
      text: xss(comment.text),
      article_id: comment.article_id,
      date_created: new Date(comment.date_created),
      user: {
        id: user.id,
        user_name: user.user_name,
        full_name: user.full_name,
        nickname: user.nickname,
        date_created: new Date(user.date_created),
        date_modified: new Date(user.date_modified) || null
      },
    }
  }*/
};

module.exports = AddItemService;
