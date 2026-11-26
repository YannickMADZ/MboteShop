/* Options communes à tous les schémas :
   - timestamps : ajoute createdAt et updatedAt automatiquement
   - toJSON : renvoie "id" au lieu de "_id" et supprime "__v" */
module.exports = {
  timestamps: true,
  toJSON: {
    virtuals: true,
    versionKey: false,
    transform(document, resultat) {
      delete resultat._id;
      return resultat;
    }
  }
};
