const AddItemService = {
  insertItem(db, newItem) {
    return db
      .insert(newItem)
      .into("items")
      .returning("*")
      .then(([item]) => item);
  },
};

module.exports = AddItemService;
