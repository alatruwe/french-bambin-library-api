const HomeService = {
  getItems(db) {
    return db
      .from("items")
      .select(
        "items.id",
        "items.title",
        "items.description",
        "items.available",
        "items.user_id"
      );
  },
};

module.exports = HomeService;
