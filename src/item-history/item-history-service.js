const ItemHistoryService = {
  getItemHistory(db, user_id) {
    return db
      .from("items")
      .select("title", "description", "image", "id")
      .where("user_id", user_id);
  },

  getItemById(db, item_id) {
    return db.from("items").where("id", item_id).first();
  },

  deleteItem(db, item_id) {
    return db.from("items").where("id", item_id).delete();
  },
};

module.exports = ItemHistoryService;
