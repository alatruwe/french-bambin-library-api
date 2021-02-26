const ItemHistoryService = {
  getItemHistory(db, user_id) {
    return db
      .from("items")
      .select("title", "description", "image")
      .where("user_id", user_id);
  },

  deleteItem(db, item_id) {
    return db.from("items").where("id", item_id).delete();
  },
};

module.exports = ItemHistoryService;
