const HomeService = {
  getItems(db) {
    return db
      .from("items")
      .select("items.id", "items.title", "items.description", "items.user_id");
  },
};

module.exports = HomeService;
